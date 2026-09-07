import { PageFrame } from "@/components/navigation";
import { HashVerifier } from "@/components/hash-verifier";
import { Metric, Section } from "@/components/ui";
import { campaign, organization } from "@/lib/dashboard-data";
import { canonicalReportPayload, reportHash } from "@/lib/report";
import { solanaExplorerUrl } from "@/lib/solana";

export default async function PublicReportPage({
  params
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const canonicalJson = canonicalReportPayload();
  const hash = reportHash();

  return (
    <PageFrame active="reports" audience="public">
      <section className="hero-panel">
        <span className="eyebrow">{organization.name}</span>
        <h1>Relatório público da campanha</h1>
        <p>
          Totais agregados, versão fechada e prova de integridade. Dados pessoais e documentos
          privados ficam fora deste relatório.
        </p>
      </section>

      <Section title={campaign.name} eyebrow={publicId}>
        <div className="metrics-grid">
          <Metric label="Receita bruta" value={campaign.report.totals.grossRevenueCents} money />
          <Metric label="Fornecedor" value={campaign.report.totals.supplierCostCents} money />
          <Metric label="Reembolsos" value={campaign.report.totals.refundsCents} money />
          <Metric label="Resultado" value={campaign.report.totals.netResultCents} money />
        </div>
      </Section>

      <div className="report-grid">
        <HashVerifier canonicalJson={canonicalJson} expectedHash={hash} />
        <Section title="Prova onchain" eyebrow="Solana Devnet">
          <div className="list-stack">
            <div className="list-item">
              <strong>Hash publicado</strong>
              <code className="code-block">{hash}</code>
            </div>
            <div className="list-item">
              <strong>Transação</strong>
              <a className="copy-link" href={solanaExplorerUrl(campaign.report.solanaSignature)}>
                Abrir no explorer
              </a>
              <code className="code-block">{campaign.report.solanaSignature}</code>
            </div>
          </div>
        </Section>
      </div>
    </PageFrame>
  );
}
