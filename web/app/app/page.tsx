import Link from "next/link";
import { PageFrame } from "@/components/navigation";
import { Metric, Pill, ProgressBar, Section } from "@/components/ui";
import { campaign, integrationStatus, organization, pickupWindows } from "@/lib/dashboard-data";
import { formatCents } from "@/lib/currency";

export default function ManagementOverviewPage() {
  const integrations = integrationStatus();

  return (
    <PageFrame active="overview" audience="management">
      <div className="hero-grid">
        <section className="hero-panel">
          <span className="eyebrow">{organization.name}</span>
          <h1>Operação da campanha em tempo real</h1>
          <p>
            A pré-venda, os pagamentos, a produção, a retirada e a prestação de contas aparecem
            no mesmo histórico da campanha.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href={`/app/campaigns/${campaign.id}`}>
              Ver campanha
            </Link>
            <Link className="ghost-button" href="/app/campaigns/new">
              Criar campanha real
            </Link>
            <Link className="ghost-button" href={`/reports/${campaign.publicReportId}`}>
              Relatório público
            </Link>
          </div>
        </section>

        <aside className="hero-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={campaign.productImage} alt={campaign.name} />
          <div className="media-caption">
            <strong>{campaign.name}</strong>
            <span>{campaign.stage}</span>
          </div>
        </aside>
      </div>

      <Section title="Indicadores" eyebrow="Hoje">
        <div className="metrics-grid">
          <Metric label="Pedidos vendidos" value={`${campaign.soldUnits}/${campaign.goalUnits}`} hint="meta da pré-venda" />
          <Metric label="Pagos" value={`${campaign.paidUnits}/${campaign.soldUnits}`} hint="Pix + Solana" />
          <Metric label="Receita bruta" value={campaign.report.totals.grossRevenueCents} money />
          <Metric label="Resultado previsto" value={campaign.report.totals.netResultCents} money />
        </div>
      </Section>

      <div className="two-column">
        <Section
          title="Progresso da campanha"
          eyebrow="Campanha"
          action={<Pill tone="good">{campaign.status}</Pill>}
        >
          <div className="list-stack">
            <div className="list-item">
              <strong>Meta mínima</strong>
              <ProgressBar value={campaign.paidUnits} max={campaign.minUnits} />
              <span>
                {campaign.paidUnits} unidades pagas de {campaign.minUnits} necessárias para produção.
              </span>
            </div>
            <div className="list-item">
              <strong>Produção</strong>
              <ProgressBar value={campaign.producedUnits} max={campaign.soldUnits} />
              <span>
                {campaign.producedUnits} produzidas de {campaign.soldUnits} vendidas.
              </span>
            </div>
            <div className="list-item">
              <strong>Retirada</strong>
              <ProgressBar value={campaign.pickedUpUnits} max={campaign.producedUnits} />
              <span>
                {campaign.pickedUpUnits} retiradas de {campaign.producedUnits} prontas.
              </span>
            </div>
          </div>
        </Section>

        <Section title="Próximas janelas" eyebrow="Retirada">
          <div className="list-stack">
            {pickupWindows.map((window) => (
              <div className="list-item" key={`${window.date}-${window.time}`}>
                <strong>
                  {window.date}, {window.time}
                </strong>
                <span>
                  {window.place} · {window.booked}/{window.capacity} agendados
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="Integrações" eyebrow="Ambiente">
        <div className="metrics-grid">
          <Metric label="Mocks" value={integrations.mocksEnabled ? "ligados" : "desligados"} hint="fallback para demo" />
          <Metric label="Supabase" value={integrations.supabaseReady ? "pronto" : "pendente"} hint="Auth + Postgres" />
          <Metric label="Storage" value={integrations.storageReady ? "pronto" : "pendente"} hint="fotos e documentos" />
          <Metric label="Solana" value={integrations.solanaCluster} hint={formatCents(campaign.unitPriceCents)} />
        </div>
      </Section>
    </PageFrame>
  );
}
