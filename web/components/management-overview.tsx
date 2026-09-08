"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { formatCents } from "@/lib/currency";
import { EmptyState, Metric, Pill, ProgressBar, Section } from "@/components/ui";

type OverviewCampaign = {
  id: string;
  slug: string;
  title: string;
  purpose?: string;
  status?: string;
  stage?: string;
  imageUrl?: string;
  publicReportId?: string | null;
  unitPriceCents: number;
  minUnits: number;
  goalUnits: number;
  soldUnits: number;
  paidUnits: number;
  producedUnits: number;
  pickedUpUnits: number;
  grossRevenueCents: number;
  netResultCents: number;
};

type OverviewResponse = {
  mode?: string;
  integrations: {
    mocksEnabled: boolean;
    supabaseReady: boolean;
    storageReady: boolean;
    solanaReady: boolean;
    solanaCluster: string;
  };
  organization?: {
    name?: string;
    campus?: string;
  } | null;
  campaign?: OverviewCampaign | null;
  pickupWindows: Array<{
    id?: string;
    date?: string;
    time?: string;
    starts_at?: string;
    ends_at?: string;
    place: string;
    booked?: number;
    capacity: number;
  }>;
};

function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    draft: "Rascunho",
    in_review: "Em revisão",
    approved: "Aprovada",
    selling: "Em venda",
    production: "Em produção",
    pickup: "Em retirada",
    closed: "Fechada",
    cancelled: "Cancelada"
  };

  return labels[status || ""] || status || "Sem status";
}

function pickupLabel(window: OverviewResponse["pickupWindows"][number]) {
  if (window.date || window.time) {
    return `${window.date || ""}${window.time ? `, ${window.time}` : ""}`;
  }

  if (!window.starts_at) return "Janela sem data";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(window.starts_at));
}

export function ManagementOverview() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    void apiRequest<OverviewResponse>("/api/management/overview")
      .then((response) => {
        if (!mounted) return;
        setData(response);
        setMessage(response.mode === "mock" ? "Modo mock ativo: exibindo operação de demonstração." : "");
      })
      .catch((error) => {
        if (!mounted) return;
        setMessage(error instanceof Error ? error.message : "Não foi possível carregar a visão geral.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!data && !message) {
    return (
      <section className="hero-panel">
        <span className="eyebrow">Carregando</span>
        <h1>Buscando operação real</h1>
        <p>Carregando organizações, campanhas e indicadores da sua sessão.</p>
      </section>
    );
  }

  const campaign = data?.campaign;
  const organizationName = data?.organization?.name || "CampusPay";

  if (!campaign) {
    return (
      <>
        {message ? <div className="status-message">{message}</div> : null}
        <section className="hero-panel">
          <span className="eyebrow">{organizationName}</span>
          <h1>Comece com uma campanha real</h1>
          <p>
            Crie uma organização, cadastre a primeira campanha e publique o status para aparecer no marketplace.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/app/users">
              Criar organização
            </Link>
            <Link className="ghost-button" href="/app/campaigns/new">
              Criar campanha
            </Link>
          </div>
        </section>

        {data?.integrations ? (
          <Section title="Integrações" eyebrow="Ambiente">
            <div className="metrics-grid">
              <Metric label="Mocks" value={data.integrations.mocksEnabled ? "ligados" : "desligados"} />
              <Metric label="Supabase" value={data.integrations.supabaseReady ? "pronto" : "pendente"} />
              <Metric label="Storage" value={data.integrations.storageReady ? "pronto" : "pendente"} />
              <Metric label="Solana" value={data.integrations.solanaCluster} />
            </div>
          </Section>
        ) : null}
      </>
    );
  }

  return (
    <>
      {message ? <div className="status-message">{message}</div> : null}
      <div className="hero-grid">
        <section className="hero-panel">
          <span className="eyebrow">{organizationName}</span>
          <h1>Operação da campanha em tempo real</h1>
          <p>{campaign.purpose || "Acompanhe venda, pagamento, produção, retirada e prestação de contas."}</p>
          <div className="hero-actions">
            <Link className="primary-button" href={`/app/campaigns/${campaign.id}`}>
              Ver campanha
            </Link>
            <Link className="ghost-button" href="/app/campaigns/new">
              Criar campanha real
            </Link>
            {campaign.publicReportId ? (
              <Link className="ghost-button" href={`/reports/${campaign.publicReportId}`}>
                Relatório público
              </Link>
            ) : null}
          </div>
        </section>

        <aside className="hero-media">
          {campaign.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={campaign.imageUrl} alt={campaign.title} />
          ) : (
            <div className="hero-media-placeholder">Sem imagem</div>
          )}
          <div className="media-caption">
            <strong>{campaign.title}</strong>
            <span>{statusLabel(campaign.status || campaign.stage)}</span>
          </div>
        </aside>
      </div>

      <Section title="Indicadores" eyebrow="Hoje">
        <div className="metrics-grid">
          <Metric label="Pedidos vendidos" value={`${campaign.soldUnits}/${campaign.goalUnits}`} hint="meta da pré-venda" />
          <Metric label="Pagos" value={`${campaign.paidUnits}/${campaign.soldUnits}`} hint="Pix + Solana" />
          <Metric label="Receita bruta" value={campaign.grossRevenueCents} money />
          <Metric label="Resultado previsto" value={campaign.netResultCents} money />
        </div>
      </Section>

      <div className="two-column">
        <Section
          title="Progresso da campanha"
          eyebrow="Campanha"
          action={<Pill tone="good">{statusLabel(campaign.status)}</Pill>}
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
          {data.pickupWindows.length > 0 ? (
            <div className="list-stack">
              {data.pickupWindows.map((window) => (
                <div className="list-item" key={window.id || `${window.date}-${window.time}`}>
                  <strong>{pickupLabel(window)}</strong>
                  <span>
                    {window.place} · {window.booked || 0}/{window.capacity} agendados
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhuma janela cadastrada"
              body="As retiradas confirmadas já funcionam por PIN; as janelas entram quando forem cadastradas no banco."
            />
          )}
        </Section>
      </div>

      <Section title="Integrações" eyebrow="Ambiente">
        <div className="metrics-grid">
          <Metric label="Mocks" value={data.integrations.mocksEnabled ? "ligados" : "desligados"} />
          <Metric label="Supabase" value={data.integrations.supabaseReady ? "pronto" : "pendente"} />
          <Metric label="Storage" value={data.integrations.storageReady ? "pronto" : "pendente"} />
          <Metric label="Solana" value={data.integrations.solanaCluster} hint={formatCents(campaign.unitPriceCents)} />
        </div>
      </Section>
    </>
  );
}
