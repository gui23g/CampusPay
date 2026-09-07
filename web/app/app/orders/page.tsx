import { LiveOrdersTable } from "@/components/live-orders-table";
import { PaymentConfirmation } from "@/components/payment-confirmation";
import { PageFrame } from "@/components/navigation";
import { Section } from "@/components/ui";

export default function OrdersPage() {
  return (
    <PageFrame active="orders" audience="management">
      <Section title="Pedidos e conciliação" eyebrow="Operação">
        <LiveOrdersTable scope="organization" />
      </Section>

      <Section title="Confirmar pagamento" eyebrow="Webhook ou operador">
        <PaymentConfirmation />
      </Section>
    </PageFrame>
  );
}
