import { CampusCampaignList } from "@/components/campus-campaign-list";
import { PageFrame } from "@/components/navigation";
import { Section } from "@/components/ui";
import { organization } from "@/lib/dashboard-data";

export default async function CampusMarketplacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <PageFrame active="campus" audience="buyer">
      <section className="hero-panel">
        <span className="eyebrow">{organization.campus}</span>
        <h1>Campanhas abertas no campus</h1>
        <p>
          Compre de entidades estudantis com status claro, pagamento rastreado e retirada combinada
          antes da produção.
        </p>
      </section>

      <Section title="Campanhas em destaque" eyebrow={slug}>
        <CampusCampaignList campusSlug={slug} />
      </Section>

      <Section title="Como a compra continua" eyebrow="Jornada">
        <div className="cards-grid">
          <div className="account-panel">
            <span className="eyebrow">Minha compra</span>
            <h2>Retirada no campus</h2>
            <p>
              Após pagamento confirmado, o pedido aparece em Minha conta com QR e janela de retirada.
            </p>
          </div>
          <div className="account-panel">
            <span className="eyebrow">Confiança</span>
            <h2>Fechamento verificável</h2>
            <p>
              O relatório final mostra totais agregados e hash ancorado em Solana, sem expor dados
              pessoais.
            </p>
          </div>
        </div>
      </Section>
    </PageFrame>
  );
}
