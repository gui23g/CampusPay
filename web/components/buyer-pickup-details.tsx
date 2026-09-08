"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { EmptyState, Pill, Section } from "@/components/ui";

type OrderResponse = {
  mode?: string;
  order?: {
    code: string;
    status: string;
    fulfillments?: Array<{
      status: string;
      confirmed_at?: string | null;
    }>;
  };
  code?: string;
};

function statusTone(status?: string) {
  return ["paid", "fulfilled", "Pronto para retirada", "Retirado"].includes(status || "") ? "good" : "info";
}

export function BuyerPickupDetails({
  orderCode,
  pickupPin
}: {
  orderCode: string;
  pickupPin?: string | null;
}) {
  const [data, setData] = useState<OrderResponse | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    void apiRequest<OrderResponse>(`/api/orders/${encodeURIComponent(orderCode)}`)
      .then((response) => {
        if (!mounted) return;
        setData(response);
        setMessage(response.mode === "mock" ? "Modo mock ativo: retirada de demonstração." : "");
      })
      .catch((error) => {
        if (!mounted) return;
        setMessage(error instanceof Error ? error.message : "Não foi possível carregar o pedido.");
      });

    return () => {
      mounted = false;
    };
  }, [orderCode]);

  const status = data?.order?.status || (data?.mode === "mock" ? "Pronto para retirada" : "Carregando");

  return (
    <div className="checkout-grid">
      <Section title={`Retirada ${orderCode}`} eyebrow="QR single-use">
        {message ? <div className="status-message">{message}</div> : null}
        {pickupPin ? (
          <>
            <div className="qr-placeholder">{pickupPin}</div>
            <Pill tone={statusTone(status)}>{status}</Pill>
            <p>Guarde este PIN para apresentar ao operador no campus.</p>
          </>
        ) : (
          <EmptyState
            title="PIN não disponível nesta sessão"
            body="Por segurança, o banco guarda apenas o hash. Use o PIN exibido logo após a compra ou peça suporte da organização."
          />
        )}
      </Section>

      <Section title="Status do pedido" eyebrow="Campus">
        <div className="list-stack">
          <div className="list-item">
            <strong>{status}</strong>
            <span>O operador confirma retirada com o código do pedido e o PIN do comprador.</span>
          </div>
          <div className="list-item">
            <strong>Documento</strong>
            <span>Leve um documento estudantil ou e-mail institucional no momento da retirada.</span>
          </div>
        </div>
      </Section>
    </div>
  );
}
