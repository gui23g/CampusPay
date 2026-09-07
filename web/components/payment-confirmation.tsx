"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api-client";

export function PaymentConfirmation() {
  const [reference, setReference] = useState("");
  const [signature, setSignature] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    setMessage("");

    try {
      await apiRequest("/api/payments/confirm", {
        method: "POST",
        body: {
          reference,
          solanaSignature: signature || undefined
        }
      });
      setMessage("Pagamento confirmado e lançado no ledger.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível confirmar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-card">
      <span className="eyebrow">Conciliação</span>
      <h2>Confirmar pagamento</h2>
      <div className="form-grid">
        <label>
          Reference Pix ou public key Solana
          <input
            className="text-input"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="CPAY-CAMISETA-2026-CP-..."
          />
        </label>
        <label>
          Assinatura Solana
          <input
            className="text-input"
            value={signature}
            onChange={(event) => setSignature(event.target.value)}
            placeholder="opcional para Pix"
          />
        </label>
      </div>
      <button className="primary-button" type="button" onClick={confirm} disabled={loading}>
        {loading ? "Confirmando..." : "Confirmar"}
      </button>
      {message ? <div className="status-message">{message}</div> : null}
    </div>
  );
}
