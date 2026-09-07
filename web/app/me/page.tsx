import Link from "next/link";
import { BuyerProfileForm } from "@/components/buyer-profile-form";
import { PageFrame } from "@/components/navigation";
import { Metric, Pill, Section } from "@/components/ui";
import { buyerProfile } from "@/lib/dashboard-data";

export default function BuyerAccountPage() {
  return (
    <PageFrame active="me" audience="buyer">
      <Section title="Minha conta" eyebrow={buyerProfile.campus}>
        <div className="metrics-grid">
          <Metric label="Pedidos" value={buyerProfile.orders.length} hint="nesta conta" />
          <Metric label="Wallet" value={buyerProfile.wallet.slice(0, 8)} hint="conectada para Solana" />
          <Metric label="Tema" value={buyerProfile.preferredTheme} hint="sincroniza após login" />
          <Metric label="E-mail" value="verificado" hint={buyerProfile.email} />
        </div>
      </Section>

      <Section
        title="Pedidos recentes"
        eyebrow={buyerProfile.name}
        action={<Link className="ghost-button" href="/me/orders">Ver todos</Link>}
      >
        <div className="list-stack">
          {buyerProfile.orders.map((order) => (
            <div className="list-item" key={order.code}>
              <strong>{order.code}</strong>
              <span>
                Tamanho {order.variant} · {order.paymentStatus}
              </span>
              <Pill tone={order.status === "Pagamento pendente" ? "warn" : "good"}>{order.status}</Pill>
              {order.status !== "Pagamento pendente" ? (
                <Link className="ghost-button" href={`/me/pickups/${order.code}`}>
                  Abrir retirada
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Editar meus dados" eyebrow="Supabase Auth">
        <BuyerProfileForm />
      </Section>
    </PageFrame>
  );
}
