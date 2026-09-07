import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getBearerToken,
  isMockMode,
  isOrganizationAdmin,
  jsonError,
  logAuditEvent,
  readJson
} from "@/lib/api-server";
import { createSupabaseAdminClient, createSupabaseAuthClient } from "@/lib/supabase-admin";
import { randomToken } from "@/lib/server-hash";
import { publicEnv } from "@/lib/env";
import { validateSolanaTransactionIfEnabled } from "@/lib/solana-server";

type ConfirmPaymentPayload = {
  reference?: string;
  externalId?: string;
  solanaSignature?: string;
  idempotencyKey?: string;
};

async function ensureLedgerAccount(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    campaignId: string;
    code: string;
    name: string;
  }
) {
  const { data: existing } = await admin
    .from("ledger_accounts")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("campaign_id", input.campaignId)
    .eq("code", input.code)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data, error } = await admin
    .from("ledger_accounts")
    .insert({
      organization_id: input.organizationId,
      campaign_id: input.campaignId,
      code: input.code,
      name: input.name,
      currency: "BRL"
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

async function canConfirmPayment(
  request: NextRequest,
  admin: SupabaseClient,
  organizationId: string
) {
  const webhookSecret = process.env.PIX_WEBHOOK_SECRET || "";
  const providedSecret = request.headers.get("x-campuspay-webhook-secret") || "";

  if (webhookSecret && providedSecret && webhookSecret === providedSecret) {
    return { ok: true, actorId: undefined };
  }

  const token = getBearerToken(request);
  if (!token) {
    return { ok: false, actorId: undefined };
  }

  const authClient = createSupabaseAuthClient(token);
  if (!authClient) {
    return { ok: false, actorId: undefined };
  }

  const { data } = await authClient.auth.getUser(token);
  const user = data.user;

  if (!user) {
    return { ok: false, actorId: undefined };
  }

  return {
    ok: await isOrganizationAdmin(admin, user.id, organizationId),
    actorId: user.id
  };
}

export async function POST(request: NextRequest) {
  if (isMockMode()) {
    const body = await readJson<ConfirmPaymentPayload>(request);
    return NextResponse.json({
      mode: "mock",
      confirmed: true,
      reference: body.reference || "CPAY-DEMO"
    });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return jsonError("Supabase service role não está configurado.", 503);

  const body = await readJson<ConfirmPaymentPayload>(request);
  const reference = String(body.reference || "");

  if (!reference) {
    return jsonError("reference é obrigatória.", 400);
  }

  const { data: intent, error: intentError } = await admin
    .from("payment_intents")
    .select("*, orders!inner(id, organization_id, campaign_id, amount_cents, status)")
    .eq("reference", reference)
    .single();

  if (intentError || !intent) {
    return jsonError("Payment intent não encontrado.", 404);
  }

  const order = intent.orders;
  const permission = await canConfirmPayment(request, admin, order.organization_id);

  if (!permission.ok) {
    return jsonError("Você não pode confirmar este pagamento.", 403);
  }

  if (intent.status === "confirmed") {
    return NextResponse.json({ confirmed: true, alreadyProcessed: true });
  }

  if (intent.rail === "solana") {
    const validation = await validateSolanaTransactionIfEnabled({
      signature: body.solanaSignature,
      reference: intent.reference,
      recipient: publicEnv().solanaTreasuryAddress
    });

    if (!validation.ok) {
      return jsonError(validation.message || "Transação Solana inválida.", 422);
    }
  }

  const idempotencyKey = body.idempotencyKey || `payment:${reference}:${randomToken(8)}`;

  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .insert({
      payment_intent_id: intent.id,
      rail: intent.rail,
      status: "confirmed",
      amount_cents: intent.amount_cents,
      currency: intent.currency,
      external_id: body.externalId || null,
      solana_signature: body.solanaSignature || null,
      confirmed_at: new Date().toISOString(),
      idempotency_key: idempotencyKey,
      raw_payload: body
    })
    .select("*")
    .single();

  if (paymentError) {
    return jsonError(paymentError.message, 500);
  }

  await admin
    .from("payment_intents")
    .update({ status: "confirmed" })
    .eq("id", intent.id);

  await admin
    .from("orders")
    .update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("id", order.id);

  const cashAccountId = await ensureLedgerAccount(admin, {
    organizationId: order.organization_id,
    campaignId: order.campaign_id,
    code: intent.rail === "solana" ? "cash_solana" : "cash_pix",
    name: intent.rail === "solana" ? "Caixa Solana" : "Caixa Pix"
  });
  const revenueAccountId = await ensureLedgerAccount(admin, {
    organizationId: order.organization_id,
    campaignId: order.campaign_id,
    code: "campaign_revenue",
    name: "Receita da campanha"
  });

  const { data: ledgerTransaction, error: ledgerError } = await admin
    .from("ledger_transactions")
    .insert({
      organization_id: order.organization_id,
      campaign_id: order.campaign_id,
      source_type: "payment",
      source_id: payment.id,
      memo: `Pagamento confirmado ${reference}`,
      idempotency_key: `ledger:${idempotencyKey}`,
      created_by: permission.actorId || null
    })
    .select("id")
    .single();

  if (ledgerError) {
    return jsonError(ledgerError.message, 500);
  }

  const { error: entriesError } = await admin.from("ledger_entries").insert([
    {
      transaction_id: ledgerTransaction.id,
      account_id: cashAccountId,
      debit_cents: intent.amount_cents,
      credit_cents: 0
    },
    {
      transaction_id: ledgerTransaction.id,
      account_id: revenueAccountId,
      debit_cents: 0,
      credit_cents: intent.amount_cents
    }
  ]);

  if (entriesError) {
    return jsonError(entriesError.message, 500);
  }

  await logAuditEvent(admin, {
    organizationId: order.organization_id,
    actorId: permission.actorId,
    area: "Pagamento",
    action: "confirmou pagamento",
    targetType: "payment",
    targetId: payment.id,
    metadata: { reference, rail: intent.rail }
  });

  return NextResponse.json({ confirmed: true, payment });
}
