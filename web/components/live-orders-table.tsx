"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { formatCents } from "@/lib/currency";
import { publicEnv } from "@/lib/env";
import { buyerProfile, orders as mockOrders } from "@/lib/mock-data";
import { OrderCancelButton } from "@/components/order-actions";
import { Pill } from "@/components/ui";

type LiveOrder = {
  id?: string;
  code: string;
  buyer?: string;
  buyerEmail?: string;
  buyer_email?: string;
  variant?: string;
  quantity?: number;
  amountCents?: number;
  amount_cents?: number;
  paymentRail?: string;
  paymentStatus?: string;
  status: string;
  reference?: string;
  payment_intents?: Array<{
    rail: string;
    status: string;
    reference: string;
  }>;
  order_items?: Array<{
    quantity: number;
    product_variants?: {
      label?: string;
      sku?: string;
    };
  }>;
};

type OrdersScope = "all" | "buyer" | "organization";

type OrdersResponse = {
  mode?: string;
  orders: LiveOrder[];
};

function normalizeMockOrders(scope: OrdersScope, buyerEmail?: string): LiveOrder[] {
  const orders =
    scope === "buyer"
      ? mockOrders.filter(
          (order) => order.buyerEmail.toLowerCase() === (buyerEmail || buyerProfile.email).toLowerCase()
        )
      : mockOrders;

  return orders.map((order) => ({ ...order }));
}

function orderBuyer(order: LiveOrder) {
  return order.buyer || order.buyer_email || order.buyerEmail || "Comprador";
}

function orderAmount(order: LiveOrder) {
  return order.amount_cents ?? order.amountCents ?? 0;
}

function orderItemLabel(order: LiveOrder) {
  if (order.variant) {
    return `${order.quantity || 1}x tamanho ${order.variant}`;
  }

  const firstItem = order.order_items?.[0];
  if (!firstItem) {
    return "Item da campanha";
  }

  return `${firstItem.quantity}x ${firstItem.product_variants?.label || firstItem.product_variants?.sku || "variante"}`;
}

function paymentLabel(order: LiveOrder) {
  const intent = order.payment_intents?.[0];
  if (intent) {
    return `${intent.rail.toUpperCase()} · ${intent.status}`;
  }

  return `${order.paymentRail?.toUpperCase() || "PIX"} · ${order.paymentStatus || "pendente"}`;
}

function paymentReference(order: LiveOrder) {
  return order.payment_intents?.[0]?.reference || order.reference || "-";
}

export function LiveOrdersTable({
  compact = false,
  scope = "all",
  buyerEmail,
  showActions = true
}: {
  compact?: boolean;
  scope?: OrdersScope;
  buyerEmail?: string;
  showActions?: boolean;
}) {
  const mocksEnabled = publicEnv().enableMocks;
  const [orders, setOrders] = useState<LiveOrder[]>(() =>
    mocksEnabled ? normalizeMockOrders(scope, buyerEmail) : []
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    const params = new URLSearchParams({ scope });

    if (buyerEmail) {
      params.set("buyerEmail", buyerEmail);
    }

    void apiRequest<OrdersResponse>(`/api/orders?${params.toString()}`)
      .then((response) => {
        if (mounted) {
          setOrders(response.orders);
          setMessage(response.mode === "mock" ? "Modo mock ativo: exibindo pedidos de demonstração." : "");
        }
      })
      .catch((error) => {
        if (mounted) {
          setOrders(mocksEnabled ? normalizeMockOrders(scope, buyerEmail) : []);
          setMessage(
            error instanceof Error
              ? error.message
              : mocksEnabled
                ? "Usando pedidos de demonstração."
                : "Não foi possível carregar pedidos reais."
          );
        }
      });

    return () => {
      mounted = false;
    };
  }, [buyerEmail, mocksEnabled, scope]);

  function markCancelled(code: string) {
    setOrders((current) =>
      current.map((order) => (order.code === code ? { ...order, status: "cancelled" } : order))
    );
  }

  return (
    <>
      {message ? <div className="status-message">{message}</div> : null}
      <table className="data-table">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Comprador</th>
            <th>Item</th>
            <th>Total</th>
            <th>Pagamento</th>
            {!compact ? <th>Reference</th> : null}
            <th>Status</th>
            {showActions ? <th>Ação</th> : null}
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id || order.code}>
                <td>{order.code}</td>
                <td>{orderBuyer(order)}</td>
                <td>{orderItemLabel(order)}</td>
                <td>{formatCents(orderAmount(order))}</td>
                <td>
                  <Pill tone={paymentLabel(order).includes("pending") || paymentLabel(order).includes("Aguardando") ? "warn" : "good"}>
                    {paymentLabel(order)}
                  </Pill>
                </td>
                {!compact ? <td>{paymentReference(order)}</td> : null}
                <td>{order.status}</td>
                {showActions ? (
                  <td>
                    <OrderCancelButton code={order.code} onCancelled={markCancelled} />
                  </td>
                ) : null}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6 + (compact ? 0 : 1) + (showActions ? 1 : 0)}>
                Nenhum pedido encontrado para esta visão.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
