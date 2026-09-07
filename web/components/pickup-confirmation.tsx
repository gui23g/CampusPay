"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { publicEnv } from "@/lib/env";

export function PickupConfirmation() {
  const mocksEnabled = publicEnv().enableMocks;
  const [orderCode, setOrderCode] = useState(mocksEnabled ? "CP-2048" : "");
  const [pickupPin, setPickupPin] = useState(mocksEnabled ? "417-882" : "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    setMessage("");

    try {
      await apiRequest("/api/fulfillments/confirm", {
        method: "POST",
        body: {
          orderCode,
          pickupPin
        }
      });
      setMessage("Retirada confirmada. O pedido não pode ser retirado novamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível confirmar a retirada.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="list-item">
      <strong>PIN manual</strong>
      <span>O servidor valida o PIN hashado e registra fulfillment single-use.</span>
      <div className="inline-actions">
        <input
          className="text-input"
          value={orderCode}
          onChange={(event) => setOrderCode(event.target.value)}
          aria-label="Código do pedido"
        />
        <input
          className="text-input"
          value={pickupPin}
          onChange={(event) => setPickupPin(event.target.value)}
          aria-label="PIN de retirada"
        />
        <button className="primary-button" type="button" onClick={confirm} disabled={loading}>
          {loading ? "Validando..." : "Validar"}
        </button>
      </div>
      {message ? <div className="status-message">{message}</div> : null}
    </div>
  );
}
