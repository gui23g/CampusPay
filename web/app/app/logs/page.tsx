import { PageFrame } from "@/components/navigation";
import { Section } from "@/components/ui";
import { auditEvents } from "@/lib/dashboard-data";

export default function LogsPage() {
  return (
    <PageFrame active="logs" audience="management">
      <Section title="Logs de atividade" eyebrow="Auditoria">
        <div className="timeline">
          {auditEvents.map((event) => (
            <div className="timeline-item" key={`${event.at}-${event.action}`}>
              <strong>{event.action}</strong>
              <span>
                {event.at} · {event.actor} · {event.area}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </PageFrame>
  );
}
