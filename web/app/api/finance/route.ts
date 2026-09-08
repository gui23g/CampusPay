import { NextRequest, NextResponse } from "next/server";
import { ledgerEntries as mockLedgerEntries } from "@/lib/mock-data";
import { isMockMode, listUserOrganizationIds, requireUser } from "@/lib/api-server";

export async function GET(request: NextRequest) {
  if (isMockMode()) {
    const entries = mockLedgerEntries.map((entry) => ({
      id: `${entry.date}-${entry.account}`,
      created_at: entry.date,
      account_name: entry.account,
      memo: entry.memo,
      debit_cents: entry.debitCents,
      credit_cents: entry.creditCents
    }));

    return NextResponse.json({
      mode: "mock",
      entries,
      totals: {
        debitCents: entries.reduce((acc, entry) => acc + entry.debit_cents, 0),
        creditCents: entries.reduce((acc, entry) => acc + entry.credit_cents, 0),
        balanceCents: entries.reduce((acc, entry) => acc + entry.debit_cents - entry.credit_cents, 0),
        count: entries.length
      }
    });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;

  try {
    const organizationIds = await listUserOrganizationIds(admin, user.id);

    if (organizationIds.length === 0) {
      return NextResponse.json({
        entries: [],
        totals: { debitCents: 0, creditCents: 0, balanceCents: 0, count: 0 }
      });
    }

    const { data: transactions, error } = await admin
      .from("ledger_transactions")
      .select("id, memo, created_at, ledger_entries(id, debit_cents, credit_cents, ledger_accounts(code, name))")
      .in("organization_id", organizationIds)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const entries = (transactions || []).flatMap((transaction) =>
      (transaction.ledger_entries || []).map((entry) => {
        const account = Array.isArray(entry.ledger_accounts)
          ? entry.ledger_accounts[0]
          : entry.ledger_accounts;

        return {
          id: entry.id,
          created_at: transaction.created_at,
          account_code: account?.code || "-",
          account_name: account?.name || "Conta",
          memo: transaction.memo,
          debit_cents: Number(entry.debit_cents || 0),
          credit_cents: Number(entry.credit_cents || 0)
        };
      })
    );

    return NextResponse.json({
      entries,
      totals: {
        debitCents: entries.reduce((acc, entry) => acc + entry.debit_cents, 0),
        creditCents: entries.reduce((acc, entry) => acc + entry.credit_cents, 0),
        balanceCents: entries.reduce((acc, entry) => acc + entry.debit_cents - entry.credit_cents, 0),
        count: entries.length
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível carregar financeiro." },
      { status: 500 }
    );
  }
}
