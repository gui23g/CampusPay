"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { formatCents } from "@/lib/currency";

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
  product_variants?: ApiVariant[];
  variants?: ApiVariant[];
};

type ApiCampaign = {
  id?: string;
  slug: string;
  title?: string;
  name?: string;
  purpose?: string;
  productImage?: string;
  unitPriceCents?: number;
  products?: ApiProduct[];
};

type CampaignsResponse = {
  mode?: string;
  campaigns: ApiCampaign[];
};

type ProductsResponse = {
  products: ApiProduct[];
};

type CheckoutCampaign = {
  slug: string;
  name: string;
  purpose: string;
  productImage: string;
  unitPriceCents: number;
  paymentReferencePrefix: string;
};

type CheckoutVariant = {
  id: string;
  label: string;
  sku: string;
  priceCents: number;
  productVariantId?: string;
};

type CreatedOrderResponse = {
  order: {
    code: string;
    amountCents?: number;
    amount_cents?: number;
    pickupPin?: string;
  };
  paymentIntent: {
    reference: string;
    pixCode?: string | null;
    solanaUrl?: string | null;
  };
  mode?: string;
};

function referencePrefix(slug: string) {
  return `CPAY-${slug
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase()}`;
}

function initialCampaign(campaignSlug: string): CheckoutCampaign {
  return {
    slug: campaignSlug,
    name: "Carregando campanha",
    purpose: "Buscando informações públicas da campanha.",
    productImage: "",
    unitPriceCents: 0,
    paymentReferencePrefix: referencePrefix(campaignSlug)
  };
}

function normalizeCampaign(item: ApiCampaign, fallbackSlug: string): CheckoutCampaign {
  const firstProduct = item.products?.[0];
  const firstVariant = firstProduct?.product_variants?.find((variant) => variant.active !== false);
  const slug = item.slug || fallbackSlug;

  return {
    slug,
    name: item.title || item.name || "Campanha sem título",
    purpose: item.purpose || "Descrição pública não informada.",
    productImage: firstProduct?.image_url || item.productImage || "",
    unitPriceCents:
      firstVariant?.price_cents ??
      firstVariant?.priceCents ??
      item.unitPriceCents ??
      0,
    paymentReferencePrefix: referencePrefix(slug)
  };
}

function normalizeVariants(products: ApiProduct[], fallbackPriceCents: number): CheckoutVariant[] {
  return products.flatMap((product) =>
    (product.product_variants || product.variants || [])
      .filter((variant) => variant.active !== false && variant.sku && variant.label)
      .map((variant) => ({
        id: variant.id || variant.sku || variant.label || "variant",
        label: variant.label || variant.sku || "Variante",
        sku: variant.sku || variant.label || "VAR",
        priceCents: variant.price_cents ?? variant.priceCents ?? fallbackPriceCents,
        productVariantId: variant.id?.startsWith("mock-") ? undefined : variant.id
      }))
  );
}

export function CheckoutCard({ campaignSlug }: { campaignSlug: string }) {
  const [activeCampaign, setActiveCampaign] = useState<CheckoutCampaign>(() =>
    initialCampaign(campaignSlug)
  );
  const [availableVariants, setAvailableVariants] = useState<CheckoutVariant[]>([]);
  const [campaignAvailable, setCampaignAvailable] = useState(false);
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState<"pix" | "solana">("pix");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [createdOrder, setCreatedOrder] = useState<CreatedOrderResponse | null>(null);
  const [message, setMessage] = useState("");
  const [dataMessage, setDataMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadCampaign() {
      try {
        const [campaignResponse, productResponse] = await Promise.all([
          apiRequest<CampaignsResponse>(`/api/campaigns?slug=${encodeURIComponent(campaignSlug)}`),
          apiRequest<ProductsResponse>(`/api/products?campaignSlug=${encodeURIComponent(campaignSlug)}`)
        ]);

        if (!mounted) return;

        const loadedCampaign = campaignResponse.campaigns[0];
        if (!loadedCampaign) {
          setCampaignAvailable(false);
          setDataMessage("Campanha não encontrada ou ainda não publicada.");
          return;
        }

        const normalizedCampaign = normalizeCampaign(loadedCampaign, campaignSlug);
        const normalizedVariants = normalizeVariants(productResponse.products, normalizedCampaign.unitPriceCents);

        setActiveCampaign(normalizedCampaign);
        setCampaignAvailable(true);
        setDataMessage(normalizedVariants.length > 0 ? "" : "Campanha publicada, mas sem variantes ativas.");

        setAvailableVariants(normalizedVariants);
        setVariantId((current) =>
          normalizedVariants.some((variant) => variant.id === current) ? current : normalizedVariants[0]?.id || ""
        );
      } catch (error) {
        if (!mounted) return;
        setAvailableVariants([]);
        setCampaignAvailable(false);
        setDataMessage(error instanceof Error ? error.message : "Não foi possível carregar a campanha real.");
      }
    }

    void loadCampaign();

    return () => {
      mounted = false;
    };
  }, [campaignSlug]);

  const variant = availableVariants.find((item) => item.id === variantId) || availableVariants[0];
  const amountCents = (variant?.priceCents || activeCampaign.unitPriceCents) * quantity;
  const reference = `${activeCampaign.paymentReferencePrefix}-${variant?.sku || "ITEM"}-${quantity}`;

  async function submitOrder() {
    if (!campaignAvailable || !variant || !buyerEmail) {
      setMessage("Escolha uma campanha publicada com variante ativa e informe seu e-mail.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await apiRequest<CreatedOrderResponse>("/api/orders", {
        method: "POST",
        body: {
          campaignSlug: activeCampaign.slug,
          productVariantId: variant.productVariantId,
          variantSku: variant.sku,
          quantity,
          buyerEmail,
          paymentRail: method,
          idempotencyKey: `checkout:${activeCampaign.slug}:${variant.sku}:${quantity}:${buyerEmail}`
        }
      });
      setCreatedOrder(response);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível criar o pedido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="checkout-grid">
      <div className="checkout-panel">
        <span className="eyebrow">Checkout público</span>
        <h1>{activeCampaign.name}</h1>
        <p>{activeCampaign.purpose}</p>

        {dataMessage ? <div className="status-message">{dataMessage}</div> : null}

        <div className="option-row">
          <span>Tamanho</span>
          <div className="segmented">
            {availableVariants.map((item) => (
              <button
                className={variantId === item.id ? "is-active" : ""}
                key={item.id}
                type="button"
                onClick={() => setVariantId(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="option-row">
          <span>Quantidade</span>
          <div className="stepper">
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              -
            </button>
            <strong>{quantity}</strong>
            <button type="button" onClick={() => setQuantity(Math.min(4, quantity + 1))}>
              +
            </button>
          </div>
        </div>

        <div className="option-row">
          <span>E-mail</span>
          <input
            className="text-input"
            type="email"
            value={buyerEmail}
            onChange={(event) => setBuyerEmail(event.target.value)}
          />
        </div>

        <div className="option-row">
          <span>Pagamento</span>
          <div className="segmented">
            <button
              className={method === "pix" ? "is-active" : ""}
              type="button"
              onClick={() => setMethod("pix")}
            >
              Pix
            </button>
            <button
              className={method === "solana" ? "is-active" : ""}
              type="button"
              onClick={() => setMethod("solana")}
            >
              Solana
            </button>
          </div>
        </div>

        <div className="total-row">
          <span>Total</span>
          <strong>{formatCents(amountCents)}</strong>
        </div>

        <button className="primary-button" type="button" onClick={submitOrder} disabled={loading || !variant}>
          {loading ? "Criando..." : "Criar pedido"}
        </button>

        {createdOrder ? (
          <div className="success-note">
            <strong>{createdOrder.order.code} criado</strong>
            <span>
              Payment intent criado com reference {createdOrder.paymentIntent.reference}. PIN de
              retirada: {createdOrder.order.pickupPin || "gerado no servidor"}.
            </span>
            <div className="inline-actions">
              <Link className="ghost-button" href="/me/orders">
                Ver meus pedidos
              </Link>
              <Link
                className="ghost-button"
                href={`/me/pickups/${createdOrder.order.code}${
                  createdOrder.order.pickupPin ? `?pin=${encodeURIComponent(createdOrder.order.pickupPin)}` : ""
                }`}
              >
                Abrir retirada
              </Link>
            </div>
          </div>
        ) : null}

        {message ? <div className="status-message">{message}</div> : null}
      </div>

      <div className="payment-panel">
        <span className="eyebrow">{method === "pix" ? "Pix copia e cola" : "Solana Pay"}</span>
        {method === "pix" ? (
          <>
            <div className="qr-placeholder">PIX</div>
            {createdOrder?.paymentIntent.pixCode ? (
              <code>{createdOrder.paymentIntent.pixCode}</code>
            ) : (
              <p>Crie o pedido para gerar a intent de pagamento e a reference real.</p>
            )}
            <p>Reference do pedido: {createdOrder?.paymentIntent.reference || reference}</p>
          </>
        ) : (
          <>
            <div className="qr-placeholder">SOL</div>
            {createdOrder?.paymentIntent.solanaUrl ? (
              <>
                <a className="copy-link" href={createdOrder.paymentIntent.solanaUrl}>
                  Abrir pagamento na wallet
                </a>
                <code>{createdOrder.paymentIntent.solanaUrl}</code>
              </>
            ) : (
              <p>Crie o pedido para gerar a URL Solana Pay com reference única.</p>
            )}
            <p>
              A confirmação real deve ser feita pelo servidor validando recipient, valor, mint e
              reference.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
