import Link from "next/link";
import { AuthPanel } from "@/components/auth-panel";
import { PageFrame } from "@/components/navigation";

export default function LoginPage() {
  return (
    <PageFrame active="login" audience="public">
      <div className="checkout-grid">
        <AuthPanel />
        <section className="account-panel">
          <span className="eyebrow">Depois do login</span>
          <h2>Dois caminhos, uma conta</h2>
          <p>
            Compradores completam dados em Minha conta. Donos criam uma organização e recebem o
            papel `owner` automaticamente.
          </p>
          <div className="inline-actions">
            <Link className="primary-button" href="/me">
              Ir para Minha conta
            </Link>
            <Link className="ghost-button" href="/app/users">
              Criar organização
            </Link>
          </div>
        </section>
      </div>
    </PageFrame>
  );
}
