"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductImageUploader } from "@/components/product-image-uploader";
import { EmptyState, Metric, Pill, Section } from "@/components/ui";
import { apiRequest } from "@/lib/api-client";
import { formatCents } from "@/lib/currency";
import { publicEnv } from "@/lib/env";
import { campaign as mockCampaign, variants as mockVariants } from "@/lib/mock-data";

type ApiVariant = {
  id?: string;
  sku?: string;
  label?: string;
  price_cents?: number;
  target_quantity?: number;
  stock_quantity?: number;
};

type ApiProduct = {
  id?: string;
  image_url?: string | null;
  product_variants?: ApiVariant[];
};

type ApiCampaign = {
  id: string;
  slug: string;
  title?: string;
  name?: string;
  purpose?: string;
  description?: string;
  status?: string;
  min_units?: number;
  minUnits?: number;
  goal_units?: number;
  goalUnits?: number;
  estimatedPickup?: string;
  unitPriceCents?: number;
  supplierQuoteCents?: number;
  platformFeeCents?: number;
  version?: number;
  approval?: {
    status: string;
    completed: number;
    required: number;
  };
  products?: ApiProduct[];
};

type CampaignResponse = {
  mode?: string;
  campaign: ApiCampaign;
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

function normalizeCampaign(campaign: ApiCampaign, useMockData: boolean) {
  const firstProduct = campaign.products?.[0];
  const variants =
    firstProduct?.product_variants?.map((variant) => ({
      id: variant.id || variant.sku || "variant",
      sku: variant.sku || "-",
      label: variant.label || "Variante",
      priceCents: variant.price_cents ?? (useMockData ? mockCampaign.unitPriceCents : 0),
      ordered: variant.target_quantity ?? 0,
      stock: variant.stock_quantity ?? 0
    })) ||
    (useMockData
      ? mockVariants.map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          label: variant.label,
          priceCents: mockCampaign.unitPriceCents,
          ordered: variant.ordered,
          stock: variant.stock
        }))
      : []);

  return {
    id: campaign.id,
    slug: campaign.slug || (useMockData ? mockCampaign.slug : campaign.id),
    title: campaign.title || campaign.name || (useMockData ? mockCampaign.name : "Campanha sem título"),
    purpose: campaign.purpose || (useMockData ? mockCampaign.purpose : "Propósito não informado."),
    description: campaign.description || "Pré-venda com pagamento rastreado e retirada no campus.",
    status: campaign.status,
    minUnits: campaign.min_units ?? campaign.minUnits ?? (useMockData ? mockCampaign.minUnits : 0),
    goalUnits: campaign.goal_units ?? campaign.goalUnits ?? (useMockData ? mockCampaign.goalUnits : 0),
    imageUrl: firstProduct?.image_url || (useMockData ? mockCampaign.productImage : ""),
    productId: firstProduct?.id,
    variants
  };
}

export function ManagementCampaignDetail({ campaignId }: { campaignId: string }) {
  const mocksEnabled = publicEnv().enableMocks;
  const [campaign, setCampaign] = useState<ReturnType<typeof normalizeCampaign> | null>(() =>
    mocksEnabled ? normalizeCampaign({ ...mockCampaign, id: campaignId, title: mockCampaign.name }, true) : null
  );
  const [message, setMessage] = useState("");
  const [loadingStatus, setLoadingStatus] = useState(false);

  useEffect(() => {
    let mounted = true;

    void apiRequest<CampaignResponse>(`/api/campaigns/${campaignId}`)
      .then((response) => {
        if (!mounted) return;
        setCampaign(normalizeCampaign(response.campaign, response.mode === "mock" || mocksEnabled));
        setMessage(response.mode === "mock" ? "Modo mock ativo: exibindo campanha de demonstração." : "");
      })
      .catch((error) => {
        if (!mounted) return;
        setCampaign(
          mocksEnabled ? normalizeCampaign({ ...mockCampaign, id: campaignId, title: mockCampaign.name }, true) : null
        );
        setMessage(
          error instanceof Error
            ? error.message
            : mocksEnabled
              ? "Usando campanha de demonstração."
              : "Não foi possível carregar a campanha real."
        );
      });

    return () => {
      mounted = false;
    };
  }, [campaignId, mocksEnabled]);

  async function updateStatus(status: string) {
    if (!campaign) return;
    setLoadingStatus(true);
    setMessage("");

    try {
      await apiRequest(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        body: { status }
      });
      setCampaign((current) => ({ ...current, status }));
      setMessage("Status atualizado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível atualizar o status.");
    } finally {
      setLoadingStatus(false);
    }
  }

  async function cancelCampaign() {
    if (!campaign) return;
    setLoadingStatus(true);
    setMessage("");

    try {
      await apiRequest(`/api/campaigns/${campaign.id}`, {
        method: "DELETE"
      });
      setCampaign((current) => ({ ...current, status: "cancelled" }));
      setMessage("Campanha cancelada.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível cancelar a campanha.");
    } finally {
      setLoadingStatus(false);
    }
  }

  if (!campaign) {
    return (
      <>
        {message ? <div className="status-message">{message}</div> : null}
        <Section title="Campanha" eyebrow={campaignId}>
          <EmptyState
            title="Campanha real não carregada"
            body="Entre com uma conta membro da organização e abra uma campanha criada no Supabase."
          />
        </Section>
      </>
    );
  }

  const firstPrice = campaign.variants[0]?.priceCents ?? 0;

  return (
    <>
      {message ? <div className="status-message">{message}</div> : null}
      <Section
        title={campaign.title}
        eyebrow={`Campanha ${campaign.id}`}
        action={<Pill tone={campaign.status === "cancelled" ? "warn" : "good"}>{statusLabel(campaign.status)}</Pill>}
      >
        <div className="two-column">
          <div className="list-stack">
            <div className="list-item">
              <strong>Propósito</strong>
              <span>{campaign.purpose}</span>
            </div>
            <div className="list-item">
              <strong>Regra de produção</strong>
              <span>
                Produzir ao atingir {campaign.minUnits} pedidos pagos. Meta pública de {campaign.goalUnits} unidades.
              </span>
            </div>
            <div className="list-item">
              <strong>Operação</strong>
              <span>{campaign.description}</span>
              <div className="inline-actions">
                <button className="ghost-button" type="button" onClick={() => updateStatus("selling")} disabled={loadingStatus}>
                  Abrir venda
                </button>
                <button className="ghost-button" type="button" onClick={() => updateStatus("production")} disabled={loadingStatus}>
                  Produção
                </button>
                <button className="ghost-button" type="button" onClick={() => updateStatus("pickup")} disabled={loadingStatus}>
                  Retirada
                </button>
                <button className="ghost-button" type="button" onClick={cancelCampaign} disabled={loadingStatus}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
          <ProductImageUploader
            campaignId={campaign.id}
            initialUrl={campaign.imageUrl}
            productId={campaign.productId}
          />
        </div>
      </Section>

      <Section
        title="Produto e variantes"
        eyebrow="Catálogo"
        action={<Link className="ghost-button" href={`/c/${campaign.slug}`}>Abrir checkout</Link>}
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Tamanho</th>
              <th>Preço</th>
              <th>Meta</th>
              <th>Estoque</th>
            </tr>
          </thead>
          <tbody>
            {campaign.variants.map((variant) => (
              <tr key={variant.id}>
                <td>{variant.sku}</td>
                <td>{variant.label}</td>
                <td>{formatCents(variant.priceCents)}</td>
                <td>{variant.ordered}</td>
                <td>{variant.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Unit economics" eyebrow="Financeiro">
        <div className="metrics-grid">
          <Metric label="Preço unitário" value={firstPrice} money />
          {mocksEnabled ? (
            <>
              <Metric label="Fornecedor por unidade" value={mockCampaign.supplierQuoteCents} money />
              <Metric label="Taxa estimada" value={mockCampaign.platformFeeCents} money />
              <Metric
                label="Margem unitária"
                value={firstPrice - mockCampaign.supplierQuoteCents - mockCampaign.platformFeeCents}
                money
              />
            </>
          ) : (
            <EmptyState
              title="Custos ainda não cadastrados"
              body="O schema real já separa ledger e produção; custos entram como lançamentos financeiros confirmados."
            />
          )}
        </div>
      </Section>
    </>
  );
}
