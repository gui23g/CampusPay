"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { EmptyState, Section } from "@/components/ui";

type AuditEvent = {
  id: string;
  created_at: string;
  actor_name: string;
  action: string;
  area: string;
};

type AuditEventsResponse = {
  mode?: string;
  events: AuditEvent[];
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export function AuditEventsTimeline() {
  const [data, setData] = useState<AuditEventsResponse | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    void apiRequest<AuditEventsResponse>("/api/audit-events")
      .then((response) => {
        if (!mounted) return;
        setData(response);
        setMessage(response.mode === "mock" ? "Modo mock ativo: exibindo auditoria de demonstração." : "");
      })
      .catch((error) => {
        if (!mounted) return;
        setMessage(error instanceof Error ? error.message : "Não foi possível carregar logs.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      {message ? <div className="status-message">{message}</div> : null}
      <Section title="Logs de atividade" eyebrow="Auditoria">
        {data && data.events.length > 0 ? (
          <div className="timeline">
            {data.events.map((event) => (
              <div className="timeline-item" key={event.id}>
                <strong>{event.action}</strong>
                <span>
                  {formatDate(event.created_at)} · {event.actor_name} · {event.area}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum evento real registrado"
            body="Criação de organização, campanha, pedido, pagamento, retirada e relatório aparecem aqui."
          />
        )}
      </Section>
    </>
  );
}
