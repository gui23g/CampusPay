import { PickupConfirmation } from "@/components/pickup-confirmation";
import { LiveOrdersTable } from "@/components/live-orders-table";
import { PageFrame } from "@/components/navigation";
import { EmptyState, Section } from "@/components/ui";

export default function PickupPage() {
  return (
    <PageFrame active="pickup" audience="management">
      <div className="two-column">
        <Section title="Scanner de retirada" eyebrow="Campus">
          <div className="list-stack">
            <PickupConfirmation />
            <EmptyState
              title="Leitor de câmera entra no próximo passo"
              body="Nesta versão, o operador consegue validar o fluxo com PIN. A câmera usa a mesma API de confirmação."
            />
          </div>
        </Section>

        <Section title="Janelas ativas" eyebrow="Agenda">
          <EmptyState
            title="Agenda real ainda vazia"
            body="Quando a organização cadastrar horários de retirada, eles aparecem aqui. A validação por PIN já funciona no fluxo real."
          />
        </Section>
      </div>

      <Section title="Pedidos da organização" eyebrow="Fila">
        <LiveOrdersTable compact scope="organization" showActions={false} />
      </Section>
    </PageFrame>
  );
}
