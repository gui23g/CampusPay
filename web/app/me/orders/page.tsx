import { LiveOrdersTable } from "@/components/live-orders-table";
import { PageFrame } from "@/components/navigation";
import { Section } from "@/components/ui";
import { buyerProfile } from "@/lib/mock-data";

export default function BuyerOrdersPage() {
  return (
    <PageFrame active="my-orders" audience="buyer">
      <Section title="Meus pedidos" eyebrow="Comprador">
        <LiveOrdersTable compact scope="buyer" buyerEmail={buyerProfile.email} />
      </Section>
    </PageFrame>
  );
}
