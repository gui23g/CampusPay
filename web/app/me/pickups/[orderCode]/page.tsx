import { PageFrame } from "@/components/navigation";
import { Pill, Section } from "@/components/ui";
import { orders, pickupWindows } from "@/lib/dashboard-data";

export default async function BuyerPickupPage({
  params
}: {
  params: Promise<{ orderCode: string }>;
}) {
  const { orderCode } = await params;
  const order = orders.find((item) => item.code === orderCode);
  const firstWindow = pickupWindows[0];
  const pickupPin = order?.pickupPin || "PIN";
  const status = order?.status || "Aguardando pagamento";

  return (
    <PageFrame active="my-orders" audience="buyer">
      <div className="checkout-grid">
        <Section title={`Retirada ${orderCode}`} eyebrow="QR single-use">
          <div className="qr-placeholder">{pickupPin}</div>
          <Pill tone={status === "Pronto para retirada" ? "good" : "info"}>{status}</Pill>
          {!order ? <p>O PIN aparece aqui depois que o pagamento for confirmado.</p> : null}
        </Section>

        <Section title="Onde retirar" eyebrow="Campus">
          <div className="list-stack">
            <div className="list-item">
              <strong>
                {firstWindow.date}, {firstWindow.time}
              </strong>
              <span>{firstWindow.place}</span>
            </div>
            <div className="list-item">
              <strong>Documento</strong>
              <span>Leve um documento estudantil ou e-mail institucional no momento da retirada.</span>
            </div>
          </div>
        </Section>
      </div>
    </PageFrame>
  );
}
