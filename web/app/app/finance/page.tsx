import { PageFrame } from "@/components/navigation";
import { Metric, Section } from "@/components/ui";
import { campaign, ledgerEntries } from "@/lib/dashboard-data";
import { formatCents } from "@/lib/currency";

export default function FinancePage() {
  const totals = campaign.report.totals;

  return (
    <PageFrame active="finance" audience="management">
      <Section title="Tesouraria da campanha" eyebrow="Ledger">
        <div className="metrics-grid">
          <Metric label="Receita bruta" value={totals.grossRevenueCents} money />
          <Metric label="Fornecedor" value={totals.supplierCostCents} money />
          <Metric label="Taxas" value={totals.feesCents} money />
          <Metric label="Resultado líquido" value={totals.netResultCents} money />
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
            {ledgerEntries.map((entry) => (
              <tr key={`${entry.date}-${entry.account}`}>
                <td>{entry.date}</td>
                <td>{entry.account}</td>
                <td>{entry.memo}</td>
                <td>{entry.debitCents ? formatCents(entry.debitCents) : "-"}</td>
                <td>{entry.creditCents ? formatCents(entry.creditCents) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </PageFrame>
  );
}
