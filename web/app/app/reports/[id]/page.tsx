import Link from "next/link";
import { PageFrame } from "@/components/navigation";
import { HashVerifier } from "@/components/hash-verifier";
import { ReportActions } from "@/components/report-actions";
import { Metric, Pill, Section } from "@/components/ui";
import { campaign } from "@/lib/dashboard-data";
import { canonicalReportPayload, reportHash } from "@/lib/report";
import { solanaExplorerUrl } from "@/lib/solana";

export default async function ManagementReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const canonicalJson = canonicalReportPayload();
  const hash = reportHash();

  return (
    <PageFrame active="reports" audience="management">
      <Section
        title="Fechamento da campanha"
        eyebrow={`Relatório ${id}`}
        action={<Pill tone="good">reproduzível</Pill>}
      >
        <div className="metrics-grid">
          <Metric label="Receita bruta" value={campaign.report.totals.grossRevenueCents} money />
          <Metric label="Custos" value={campaign.report.totals.supplierCostCents} money />
          <Metric label="Reembolsos" value={campaign.report.totals.refundsCents} money />
          <Metric label="Resultado" value={campaign.report.totals.netResultCents} money />
        </div>
      </Section>

      <div className="report-grid">
        <HashVerifier canonicalJson={canonicalJson} expectedHash={hash} />
        <Section title="Âncora Solana" eyebrow="Devnet">
          <div className="list-stack">
            <div className="list-item">
              <strong>Hash</strong>
              <code className="code-block">{hash}</code>
            </div>
            <div className="list-item">
              <strong>Assinatura</strong>
              <a className="copy-link" href={solanaExplorerUrl(campaign.report.solanaSignature)}>
                Abrir no explorer
              </a>
              <code className="code-block">{campaign.report.solanaSignature}</code>
            </div>
            <Link className="primary-button" href="/reports/rel-camiseta-2026">
              Ver página pública
            </Link>
          </div>
        </Section>
      </div>

      <Section title="Fechamento persistido" eyebrow="Supabase">
        <ReportActions />
      </Section>
    </PageFrame>
  );
}
