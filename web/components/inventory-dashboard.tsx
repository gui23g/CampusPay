"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { formatCents } from "@/lib/currency";
import { EmptyState, Metric, Pill, Section } from "@/components/ui";

type InventoryCampaign = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

type InventoryVariant = {
  id: string;
  sku: string;
  label: string;
  price_cents: number;
  target_quantity: number;
  stock_quantity: number;
  produced_quantity?: number;
  picked_up_quantity?: number;
};

type InventoryProduct = {
  id: string;
  campaign_id: string;
  name: string;
  image_url?: string | null;
  product_variants?: InventoryVariant[];
};

type ProductionBatch = {
  id: string;
  campaign_id: string;
  supplier_name: string;
  planned_units: number;
  produced_units: number;
  status: string;
  expected_at?: string | null;
  received_at?: string | null;
};

type InventoryResponse = {
  mode?: string;
  campaigns: InventoryCampaign[];
  products: InventoryProduct[];
  batches: ProductionBatch[];
};

function batchStatusTone(status: string) {
  return ["received", "Recebido"].includes(status) ? "good" : "warn";
}

export function InventoryDashboard() {
  const [data, setData] = useState<InventoryResponse | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    void apiRequest<InventoryResponse>("/api/inventory")
      .then((response) => {
        if (!mounted) return;
        setData(response);
        setMessage(response.mode === "mock" ? "Modo mock ativo: exibindo estoque de demonstração." : "");
      })
      .catch((error) => {
        if (!mounted) return;
        setMessage(error instanceof Error ? error.message : "Não foi possível carregar o inventário.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const campaignNames = useMemo(
    () => new Map((data?.campaigns || []).map((campaign) => [campaign.id, campaign.title])),
    [data?.campaigns]
  );
  const variants = (data?.products || []).flatMap((product) =>
    (product.product_variants || []).map((variant) => ({
      ...variant,
      productName: product.name,
      campaignName: campaignNames.get(product.campaign_id) || product.campaign_id
    }))
  );
  const producedUnits = (data?.batches || []).reduce((acc, batch) => acc + Number(batch.produced_units || 0), 0);
  const stockUnits = variants.reduce((acc, variant) => acc + Number(variant.stock_quantity || 0), 0);
  const targetUnits = variants.reduce((acc, variant) => acc + Number(variant.target_quantity || 0), 0);

  return (
    <>
      {message ? <div className="status-message">{message}</div> : null}
      <Section title="Produção e estoque" eyebrow="Fulfillment">
        <div className="metrics-grid">
          <Metric label="Produzidas" value={producedUnits} hint="lotes recebidos" />
          <Metric label="Estoque atual" value={stockUnits} hint="soma das variantes" />
          <Metric label="Meta cadastrada" value={targetUnits} hint="variações ativas" />
          <Metric label="Campanhas" value={data?.campaigns.length || 0} hint="da organização" />
        </div>
      </Section>

      <div className="two-column">
        <Section title="Lotes" eyebrow="Fornecedor">
          {data && data.batches.length > 0 ? (
            <div className="list-stack">
              {data.batches.map((batch) => (
                <div className="list-item" key={batch.id}>
                  <strong>{batch.supplier_name}</strong>
                  <span>
                    {batch.produced_units}/{batch.planned_units} unidades · {batch.expected_at || "sem previsão"}
                  </span>
                  <Pill tone={batchStatusTone(batch.status)}>{batch.status}</Pill>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhum lote cadastrado"
              body="Ao registrar produção no banco, os lotes passam a aparecer aqui."
            />
          )}
        </Section>

        <Section title="Estoque por tamanho" eyebrow="Variantes">
          <table className="data-table">
            <thead>
              <tr>
                <th>Campanha</th>
                <th>Produto</th>
                <th>Tamanho</th>
                <th>Preço</th>
                <th>Meta</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {variants.length > 0 ? (
                variants.map((variant) => (
                  <tr key={variant.id}>
                    <td>{variant.campaignName}</td>
                    <td>{variant.productName}</td>
                    <td>{variant.label}</td>
                    <td>{formatCents(variant.price_cents)}</td>
                    <td>{variant.target_quantity}</td>
                    <td>{variant.stock_quantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>Nenhuma variante real cadastrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Section>
      </div>
    </>
  );
}
