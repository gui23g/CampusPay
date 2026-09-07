import { NextRequest, NextResponse } from "next/server";
import { canonicalReportPayload, reportHash } from "@/lib/report";
import {
  isMockMode,
  isOrganizationAdmin,
  jsonError,
  logAuditEvent,
  readJson,
  requireUser
} from "@/lib/api-server";
import { sha256Hex } from "@/lib/server-hash";

type ReportPayload = {
  campaignId?: string;
  publicId?: string;
};

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeys((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

export async function POST(request: NextRequest) {
  if (isMockMode()) {
    return NextResponse.json({
      mode: "mock",
      snapshot: {
        publicId: "rel-camiseta-2026",
        payloadHash: reportHash(),
        canonicalPayload: canonicalReportPayload()
      }
    });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;
  const body = await readJson<ReportPayload>(request);
  const campaignId = String(body.campaignId || "");

  if (!campaignId) {
    return jsonError("campaignId é obrigatório.", 400);
  }

  const { data: campaign, error: campaignError } = await admin
    .from("campaigns")
    .select("id, organization_id, title, purpose, public_report_id")
    .eq("id", campaignId)
    .single();

  if (campaignError || !campaign) {
    return jsonError("Campanha não encontrada.", 404);
  }

  if (!(await isOrganizationAdmin(admin, user.id, campaign.organization_id))) {
    return jsonError("Você não pode fechar esta campanha.", 403);
  }

  const [{ data: orders }, { data: payments }] = await Promise.all([
    admin.from("orders").select("id, amount_cents, status").eq("campaign_id", campaignId),
    admin
      .from("payments")
      .select("amount_cents, rail, status, payment_intents!inner(orders!inner(campaign_id))")
      .eq("payment_intents.orders.campaign_id", campaignId)
      .eq("status", "confirmed")
  ]);

  const payload = sortKeys({
    campaignId,
    organizationId: campaign.organization_id,
    title: campaign.title,
    purpose: campaign.purpose,
    closedAt: new Date().toISOString(),
    totals: {
      orders: orders?.length || 0,
      confirmedPayments: payments?.length || 0,
      grossRevenueCents:
        payments?.reduce((acc, payment) => acc + Number(payment.amount_cents || 0), 0) || 0
    }
  });
  const canonicalPayload = JSON.stringify(payload, null, 2);
  const payloadHash = sha256Hex(canonicalPayload);
  const publicId = body.publicId || campaign.public_report_id || `rel-${campaignId}`;

  const { data: snapshot, error: snapshotError } = await admin
    .from("report_snapshots")
    .insert({
      campaign_id: campaignId,
      canonical_payload: payload,
      payload_hash: payloadHash,
      public_id: publicId,
      created_by: user.id
    })
    .select("*")
    .single();

  if (snapshotError) {
    return jsonError(snapshotError.message, 500);
  }

  const { error: anchorError } = await admin.from("blockchain_anchors").insert({
    report_snapshot_id: snapshot.id,
    chain: "solana",
    cluster: process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "devnet",
    program_id: process.env.SOLANA_REPORT_ANCHOR_PROGRAM_ID || null,
    payload_hash: payloadHash,
    status: "pending"
  });

  if (anchorError) {
    return jsonError(anchorError.message, 500);
  }

  await admin
    .from("campaigns")
    .update({ status: "closed", closed_at: new Date().toISOString(), public_report_id: publicId })
    .eq("id", campaignId);

  await logAuditEvent(admin, {
    organizationId: campaign.organization_id,
    actorId: user.id,
    area: "Relatório",
    action: "fechou campanha",
    targetType: "report_snapshot",
    targetId: snapshot.id,
    metadata: { publicId, payloadHash }
  });

  return NextResponse.json({ snapshot, payloadHash, canonicalPayload });
}
