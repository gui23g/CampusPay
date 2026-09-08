"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BuyerProfileForm } from "@/components/buyer-profile-form";
import { apiRequest } from "@/lib/api-client";
import { Metric, Pill, Section } from "@/components/ui";

type ProfileResponse = {
  mode?: string;
  email?: string;
  profile?: {
    full_name?: string;
    name?: string;
    wallet?: string;
    preferredTheme?: string;
  } | null;
  buyer?: {
    campus?: string | null;
    institution?: string | null;
    wallet_address?: string | null;
  } | null;
  preferences?: {
    theme?: string | null;
  } | null;
};

type BuyerOrder = {
  id?: string;
  code: string;
  status: string;
  variant?: string;
  paymentStatus?: string;
  payment_intents?: Array<{ status: string }>;
  order_items?: Array<{
    quantity: number;
    product_variants?: { label?: string; sku?: string };
  }>;
};

type OrdersResponse = {
  mode?: string;
  orders: BuyerOrder[];
};

function orderSummary(order: BuyerOrder) {
  if (order.variant) return `Tamanho ${order.variant} · ${order.paymentStatus || order.status}`;

  const item = order.order_items?.[0];
  const payment = order.payment_intents?.[0];
  const label = item?.product_variants?.label || item?.product_variants?.sku || "item";
  return `${item?.quantity || 1}x ${label} · ${payment?.status || order.status}`;
}

export function BuyerAccountOverview() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    void Promise.all([
      apiRequest<ProfileResponse>("/api/me/profile"),
      apiRequest<OrdersResponse>("/api/orders?scope=buyer")
    ])
      .then(([profileResponse, ordersResponse]) => {
        if (!mounted) return;
        setProfile(profileResponse);
        setOrders(ordersResponse.orders);
        setMessage(
          profileResponse.mode === "mock" || ordersResponse.mode === "mock"
            ? "Modo mock ativo: exibindo conta de demonstração."
            : ""
        );
      })
      .catch((error) => {
        if (!mounted) return;
        setMessage(error instanceof Error ? error.message : "Não foi possível carregar sua conta.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const name = profile?.profile?.full_name || profile?.profile?.name || "Minha conta";
  const campus = profile?.buyer?.campus || "Campus";
  const wallet = profile?.buyer?.wallet_address || profile?.profile?.wallet || "";
  const theme = profile?.preferences?.theme || profile?.profile?.preferredTheme || "system";

  return (
    <>
      {message ? <div className="status-message">{message}</div> : null}
      <Section title="Minha conta" eyebrow={campus}>
        <div className="metrics-grid">
          <Metric label="Pedidos" value={orders.length} hint="nesta conta" />
          <Metric label="Wallet" value={wallet ? wallet.slice(0, 8) : "pendente"} hint="Solana" />
          <Metric label="Tema" value={theme} hint="preferência salva" />
          <Metric label="E-mail" value={profile?.email ? "verificado" : "pendente"} hint={profile?.email || "sessão"} />
        </div>
      </Section>

      <Section
        title="Pedidos recentes"
        eyebrow={name}
        action={<Link className="ghost-button" href="/me/orders">Ver todos</Link>}
      >
        <div className="list-stack">
          {orders.length > 0 ? (
            orders.slice(0, 4).map((order) => (
              <div className="list-item" key={order.id || order.code}>
                <strong>{order.code}</strong>
                <span>{orderSummary(order)}</span>
                <Pill tone={order.status === "created" ? "warn" : "good"}>{order.status}</Pill>
                {order.status !== "created" ? (
                  <Link className="ghost-button" href={`/me/pickups/${order.code}`}>
                    Abrir retirada
                  </Link>
                ) : null}
              </div>
            ))
          ) : (
            <div className="list-item">
              <strong>Nenhum pedido real ainda</strong>
              <span>Quando você comprar uma campanha, o pedido aparece aqui.</span>
            </div>
          )}
        </div>
      </Section>

      <Section title="Editar meus dados" eyebrow="Supabase Auth">
        <BuyerProfileForm />
      </Section>
    </>
  );
}
