"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api-client";

type ReportResponse = {
  payloadHash?: string;
  snapshot?: {
    payloadHash?: string;
    public_id?: string;
    publicId?: string;
  };
};

export function ReportActions() {
  const [campaignId, setCampaignId] = useState("");
  const [publicId, setPublicId] = useState("rel-campanha-final");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function closeReport() {
    setLoading(true);
    setMessage("");

    try {
      const response = await apiRequest<ReportResponse>("/api/reports", {
        method: "POST",
        body: {
          campaignId,
          publicId
        }
      });
      setMessage(`Relatório fechado. Hash: ${response.payloadHash || response.snapshot?.payloadHash}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível fechar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-card">
      <span className="eyebrow">Fechamento real</span>
      <h2>Gerar snapshot</h2>
      <div className="form-grid">
        <label>
          Campaign ID
          <input
            className="text-input"
            value={campaignId}
            onChange={(event) => setCampaignId(event.target.value)}
            placeholder="uuid da campanha"
          />
        </label>
        <label>
          Public ID
          <input className="text-input" value={publicId} onChange={(event) => setPublicId(event.target.value)} />
        </label>
      </div>
      <button className="primary-button" type="button" onClick={closeReport} disabled={loading}>
        {loading ? "Fechando..." : "Fechar relatório"}
      </button>
      {message ? <div className="status-message">{message}</div> : null}
    </div>
  );
}
