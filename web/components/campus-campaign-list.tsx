"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { formatCents } from "@/lib/currency";
import { EmptyState, Pill, ProgressBar } from "@/components/ui";

type ApiVariant = {
  id?: string;
  sku?: string;
  label?: string;
  price_cents?: number;
  priceCents?: number;
  active?: boolean;
};

type ApiProduct = {
  image_url?: string | null;
  imageUrl?: string | null;
  product_variants?: ApiVariant[];
  variants?: ApiVariant[];
};

type ApiCampaign = {
  id?: string;
  slug: string;
  title?: string;
  name?: string;
  purpose?: string;
  status?: string;
  campus_slug?: string;
  campusSlug?: string;
  public_report_id?: string | null;
  publicReportId?: string | null;
  productImage?: string;
  unitPriceCents?: number;
  min_units?: number;
  minUnits?: number;
  paidUnits?: number;
  products?: ApiProduct[];
};

type CampaignsResponse = {
  mode?: string;
  campaigns: ApiCampaign[];
};

type MarketplaceCampaign = {
  slug: string;
  title: string;
  purpose: string;
  status: string;
  imageUrl: string;
  priceCents: number;
  paidUnits: number;
  minUnits: number;
  publicReportId?: string | null;
};

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    approved: "Aprovada",
    selling: "Em venda",
    production: "Em produção",
    pickup: "Em retirada",
    closed: "Fechada",
    draft: "Rascunho"
  };

  return labels[status] || status;
}

function normalizeCampaign(item: ApiCampaign): MarketplaceCampaign {
  const firstProduct = item.products?.[0];
  const firstVariant = firstProduct?.product_variants?.find((variant) => variant.active !== false);

  return {
    slug: item.slug,
    title: item.title || item.name || "Campanha sem título",
    purpose: item.purpose || "Campanha estudantil em pré-venda.",
    status: item.status || "selling",
    imageUrl: firstProduct?.image_url || firstProduct?.imageUrl || item.productImage || "",
    priceCents: firstVariant?.price_cents ?? firstVariant?.priceCents ?? item.unitPriceCents ?? 0,
    paidUnits: item.paidUnits ?? 0,
    minUnits: item.min_units ?? item.minUnits ?? 1,
    publicReportId: item.public_report_id || item.publicReportId
  };
}

export function CampusCampaignList({ campusSlug }: { campusSlug: string }) {
  const [campaigns, setCampaigns] = useState<MarketplaceCampaign[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    void apiRequest<CampaignsResponse>(`/api/campaigns?campusSlug=${encodeURIComponent(campusSlug)}`)
      .then((response) => {
        if (!mounted) return;
        setCampaigns(response.campaigns.map(normalizeCampaign));
        setMessage(response.mode === "mock" ? "Modo mock ativo: exibindo campanhas de demonstração." : "");
      })
      .catch((error) => {
        if (!mounted) return;
        setCampaigns([]);
        setMessage(error instanceof Error ? error.message : "Não foi possível carregar campanhas reais.");
      });

    return () => {
      mounted = false;
    };
  }, [campusSlug]);

  if (campaigns.length === 0) {
    return (
      <EmptyState
        title="Nenhuma campanha aberta neste campus"
        body="Quando uma organização publicar uma campanha em venda, ela aparece aqui automaticamente."
      />
    );
  }

  return (
    <>
      {message ? <div className="status-message">{message}</div> : null}
      <div className="cards-grid">
        {campaigns.map((item) => (
          <article className="market-card" key={item.slug}>
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt={item.title} />
            ) : (
              <div className="market-card-empty-media">Sem imagem</div>
            )}
            <div className="market-card-content">
              <Pill tone={["approved", "selling"].includes(item.status) ? "good" : "info"}>
                {statusLabel(item.status)}
              </Pill>
              <h3>{item.title}</h3>
              <p>{item.purpose}</p>
              <ProgressBar value={item.paidUnits} max={item.minUnits} />
              <strong className="market-price">{formatCents(item.priceCents)}</strong>
              <div className="inline-actions">
                <Link className="primary-button" href={`/c/${item.slug}`}>
                  Comprar
                </Link>
                {item.publicReportId ? (
                  <Link className="ghost-button" href={`/reports/${item.publicReportId}`}>
                    Transparência
                  </Link>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
