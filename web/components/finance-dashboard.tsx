"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { formatCents } from "@/lib/currency";
import { Metric, Section } from "@/components/ui";

type LedgerEntry = {
  id: string;
  created_at: string;
  account_code?: string;
  account_name: string;
  memo: string;
  debit_cents: number;
  credit_cents: number;
};

type FinanceResponse = {
  mode?: string;
  entries: LedgerEntry[];
  totals: {
    debitCents: number;
    creditCents: number;
    balanceCents: number;
    count: number;
  };
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export function FinanceDashboard() {
  const [data, setData] = useState<FinanceResponse | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    void apiRequest<FinanceResponse>("/api/finance")
      .then((response) => {
        if (!mounted) return;
        setData(response);
        setMessage(response.mode === "mock" ? "Modo mock ativo: exibindo ledger de demonstração." : "");
      })
      .catch((error) => {
        if (!mounted) return;
        setMessage(error instanceof Error ? error.message : "Não foi possível carregar financeiro.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const totals = data?.totals || { debitCents: 0, creditCents: 0, balanceCents: 0, count: 0 };

  return (
    <>
      {message ? <div className="status-message">{message}</div> : null}
      <Section title="Tesouraria da campanha" eyebrow="Ledger">
        <div className="metrics-grid">
          <Metric label="Débitos" value={totals.debitCents} money />
          <Metric label="Créditos" value={totals.creditCents} money />
          <Metric label="Saldo contábil" value={totals.balanceCents} money />
          <Metric label="Lançamentos" value={totals.count} />
        </div>
      </Section>

      <Section title="Lançamentos" eyebrow="Dupla entrada">
        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Conta</th>
              <th>Histórico</th>
              <th>Débito</th>
              <th>Crédito</th>
            </tr>
          </thead>
          <tbody>
            {data && data.entries.length > 0 ? (
              data.entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatDate(entry.created_at)}</td>
                  <td>{entry.account_name}</td>
                  <td>{entry.memo}</td>
                  <td>{entry.debit_cents ? formatCents(entry.debit_cents) : "-"}</td>
                  <td>{entry.credit_cents ? formatCents(entry.credit_cents) : "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>Nenhum lançamento real confirmado ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Section>
    </>
  );
}
