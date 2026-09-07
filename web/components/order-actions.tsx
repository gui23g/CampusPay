"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api-client";

export function OrderCancelButton({
  code,
  onCancelled
}: {
  code: string;
  onCancelled?: (code: string) => void;
}) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function cancel() {
    setLoading(true);
    setMessage("");

    try {
      await apiRequest(`/api/orders/${code}`, {
        method: "DELETE"
      });
      setMessage("Pedido cancelado.");
      onCancelled?.(code);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível cancelar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mini-action">
      <button className="ghost-button" type="button" onClick={cancel} disabled={loading}>
        {loading ? "..." : "Cancelar"}
      </button>
      {message ? <span>{message}</span> : null}
    </div>
  );
}
