"use client";

import { useEffect, useState } from "react";
import { HashVerifier } from "@/components/hash-verifier";
import { EmptyState, Section } from "@/components/ui";
import { apiRequest } from "@/lib/api-client";
import { solanaExplorerUrl } from "@/lib/solana";

type ReportResponse = {
  mode?: string;
  report: {
    publicId: string;
    campaignTitle: string;
    organizationName: string;
    createdAt: string;
    payloadHash: string;
    canonicalJson: string;
    anchor?: {
      chain: string;
      cluster: string;
      signature?: string | null;
      status: string;
    } | null;
  };
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export function PublicReportViewer({ publicId }: { publicId: string }) {
  const [data, setData] = useState<ReportResponse | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    void apiRequest<ReportResponse>(`/api/reports/${encodeURIComponent(publicId)}`)
      .then((response) => {
        if (!mounted) return;
        setData(response);
        setMessage(response.mode === "mock" ? "Modo mock ativo: exibindo relatório de demonstração." : "");
      })
      .catch((error) => {
        if (!mounted) return;
        setMessage(error instanceof Error ? error.message : "Não foi possível carregar o relatório.");
      });

    return () => {
      mounted = false;
    };
  }, [publicId]);

  if (!data) {
    return (
      <>
        {message ? <div className="status-message">{message}</div> : null}
        <Section title="Relatório público" eyebrow={publicId}>
          <EmptyState
            title="Relatório não carregado"
            body="Gere um snapshot em Fechamento e abra a URL pública retornada."
          />
        </Section>
      </>
    );
  }

  const report = data.report;

  return (
    <>
      {message ? <div className="status-message">{message}</div> : null}
      <section className="hero-panel">
        <span className="eyebrow">{report.organizationName}</span>
        <h1>Relatório público da campanha</h1>
        <p>
          Totais agregados, versão fechada e prova de integridade. Dados pessoais e documentos
          privados ficam fora deste relatório.
        </p>
      </section>

      <Section title={report.campaignTitle} eyebrow={report.publicId}>
        <div className="metrics-grid">
          <div className="metric">
            <span>Criado em</span>
            <strong>{formatDate(report.createdAt)}</strong>
            <small>snapshot imutável</small>
          </div>
          <div className="metric">
            <span>Hash</span>
            <strong>{report.payloadHash.slice(0, 10)}</strong>
            <small>SHA-256</small>
          </div>
          <div className="metric">
            <span>Anchor</span>
            <strong>{report.anchor?.status || "pendente"}</strong>
            <small>{report.anchor?.chain || "solana"}</small>
          </div>
          <div className="metric">
            <span>Cluster</span>
            <strong>{report.anchor?.cluster || "devnet"}</strong>
            <small>Solana</small>
          </div>
        </div>
      </Section>

      <div className="report-grid">
        <HashVerifier canonicalJson={report.canonicalJson} expectedHash={report.payloadHash} />
        <Section title="Prova onchain" eyebrow="Solana">
          {report.anchor ? (
            <div className="list-stack">
              <div className="list-item">
                <strong>Hash publicado</strong>
                <code className="code-block">{report.payloadHash}</code>
              </div>
              <div className="list-item">
                <strong>Transação</strong>
                {report.anchor.signature ? (
                  <a className="copy-link" href={solanaExplorerUrl(report.anchor.signature)}>
                    Abrir no explorer
                  </a>
                ) : null}
                <code className="code-block">{report.anchor.signature || "Aguardando anchor"}</code>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Anchor ainda pendente"
              body="O snapshot já existe; a assinatura Solana entra quando o anchor for confirmado."
            />
          )}
        </Section>
      </div>
    </>
  );
}
