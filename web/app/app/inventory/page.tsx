import { PageFrame } from "@/components/navigation";
import { Metric, Pill, Section } from "@/components/ui";
import { campaign, productionBatches, variants } from "@/lib/dashboard-data";

export default function InventoryPage() {
  const totalStock = variants.reduce((acc, variant) => acc + variant.stock, 0);

  return (
    <PageFrame active="inventory" audience="management">
      <Section title="Produção e estoque" eyebrow="Fulfillment">
        <div className="metrics-grid">
          <Metric label="Produzidas" value={campaign.producedUnits} hint="camisetas recebidas" />
          <Metric label="Estoque atual" value={totalStock} hint="unidades disponíveis" />
          <Metric label="Retiradas" value={campaign.pickedUpUnits} hint="QR confirmado" />
          <Metric label="A produzir" value={campaign.soldUnits - campaign.producedUnits} hint="lote pendente" />
        </div>
      </Section>

      <div className="two-column">
        <Section title="Lotes" eyebrow="Fornecedor">
          <div className="list-stack">
            {productionBatches.map((batch) => (
              <div className="list-item" key={batch.name}>
                <strong>{batch.name}</strong>
                <span>
                  {batch.units} unidades · entrega {batch.eta}
                </span>
                <Pill tone={batch.status === "Recebido" ? "good" : "warn"}>{batch.status}</Pill>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Estoque por tamanho" eyebrow="Variantes">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tamanho</th>
                <th>Produzido</th>
                <th>Retirado</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id}>
                  <td>{variant.label}</td>
                  <td>{variant.produced}</td>
                  <td>{variant.pickedUp}</td>
                  <td>{variant.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>
    </PageFrame>
  );
}
