import Link from "next/link";
import { SessionBadge } from "@/components/session-badge";
import { ThemeToggle } from "@/components/theme-toggle";

const defaultCampusSlug = "inteli-sp";

const managementLinks = [
  { href: "/app", label: "Visão geral", key: "overview" },
  { href: "/app/campaigns/new", label: "Campanha", key: "campaign" },
  { href: "/app/orders", label: "Pedidos", key: "orders" },
  { href: "/app/inventory", label: "Produção", key: "inventory" },
  { href: "/app/pickup", label: "Retirada", key: "pickup" },
  { href: "/app/finance", label: "Financeiro", key: "finance" },
  { href: "/app/users", label: "Usuários", key: "users" },
  { href: "/app/logs", label: "Logs", key: "logs" },
  { href: "/app/reports/latest", label: "Fechamento", key: "reports" }
];

const buyerLinks = [
  { href: `/campus/${defaultCampusSlug}`, label: "Campus", key: "campus" },
  { href: `/campus/${defaultCampusSlug}`, label: "Comprar", key: "checkout" },
  { href: "/me", label: "Minha conta", key: "me" },
  { href: "/me/orders", label: "Pedidos", key: "my-orders" }
];

export function TopBar({
  active,
  audience
}: {
  active: string;
  audience: "management" | "buyer" | "public";
}) {
  const links = audience === "management" ? managementLinks : buyerLinks;

  return (
    <header className="topbar">
      <Link className="brand" href={audience === "management" ? "/app" : `/campus/${defaultCampusSlug}`}>
        <span className="brand-mark">CP</span>
        <span>
          <strong>CampusPay</strong>
          <small>campanhas verificáveis</small>
        </span>
      </Link>

      {audience !== "public" ? (
        <nav className="topnav" aria-label="Navegação principal">
          {links.map((link) => (
            <Link className={active === link.key ? "is-active" : ""} href={link.href} key={link.key}>
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}

      <div className="top-actions">
        {audience === "management" ? (
          <Link className="ghost-button" href={`/campus/${defaultCampusSlug}`}>
            Ver marketplace
          </Link>
        ) : audience === "buyer" ? (
          <Link className="ghost-button" href="/app">
            Área da organização
          </Link>
        ) : (
          <Link className="ghost-button" href={`/campus/${defaultCampusSlug}`}>
            Voltar ao campus
          </Link>
        )}
        <SessionBadge />
        <ThemeToggle />
      </div>
    </header>
  );
}

export function PageFrame({
  active,
  audience,
  children
}: {
  active: string;
  audience: "management" | "buyer" | "public";
  children: React.ReactNode;
}) {
  return (
    <div className="app-frame">
      <TopBar active={active} audience={audience} />
      <main className="page-shell">{children}</main>
    </div>
  );
}
