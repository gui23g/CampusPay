import { formatCents } from "@/lib/currency";

export function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export function Section({
  title,
  eyebrow,
  action,
  children
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="section">
      <div className="section-heading">
        <div>
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h2>{title}</h2>
        </div>
        {action ? <div className="section-action">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function Metric({
  label,
  value,
  hint,
  money
}: {
  label: string;
  value: number | string;
  hint?: string;
  money?: boolean;
}) {
  const renderedValue = typeof value === "number" && money ? formatCents(value) : value;

  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{renderedValue}</strong>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const percent = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;

  return (
    <div className="progress-wrap" aria-label={`${percent}%`}>
      <div className="progress-track">
        <span style={{ width: `${percent}%` }} />
      </div>
      <strong>{percent}%</strong>
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}
