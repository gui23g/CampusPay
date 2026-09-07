import { PickupConfirmation } from "@/components/pickup-confirmation";
import { PageFrame } from "@/components/navigation";
import { EmptyState, Pill, Section } from "@/components/ui";
import { orders, pickupWindows } from "@/lib/dashboard-data";

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
          <div className="list-stack">
            {pickupWindows.map((window) => (
              <div className="list-item" key={`${window.date}-${window.time}`}>
                <strong>
                  {window.date}, {window.time}
                </strong>
                <span>
                  {window.place} · {window.booked}/{window.capacity} agendados
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="Pedidos prontos" eyebrow="Fila">
        <table className="data-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Comprador</th>
              <th>PIN</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders
              .filter((order) => order.status !== "Pagamento pendente")
              .map((order) => (
                <tr key={order.code}>
                  <td>{order.code}</td>
                  <td>{order.buyer}</td>
                  <td>{order.pickupPin}</td>
                  <td>
                    <Pill tone={order.status === "Retirado" ? "good" : "info"}>{order.status}</Pill>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Section>
    </PageFrame>
  );
}
