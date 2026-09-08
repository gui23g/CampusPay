"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { EmptyState, Pill } from "@/components/ui";

type MemberRow = {
  id: string;
  name?: string;
  email?: string;
  role: string;
  access: string;
  status: string;
  organization?: string;
  expiresAt?: string;
};

type MembershipsResponse = {
  members: MemberRow[];
  invites: MemberRow[];
  mode?: string;
};

function roleLabel(role: string) {
  const labels: Record<string, string> = {
    owner: "Dono",
    president: "Presidência",
    treasurer: "Tesouraria",
    operator: "Operação",
    auditor: "Auditoria"
  };

  return labels[role] || role;
}

export function OrganizationMembersTable() {
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [message, setMessage] = useState("Carregando equipe real...");
  const [showingMock, setShowingMock] = useState(false);

  useEffect(() => {
    let mounted = true;

    void apiRequest<MembershipsResponse>("/api/memberships")
      .then((response) => {
        if (!mounted) return;

        const nextRows = [...response.members, ...response.invites];
        setRows(nextRows);
        setShowingMock(response.mode === "mock");
        setMessage(response.mode === "mock" ? "Modo mock ativo: exibindo equipe de demonstração." : "");
      })
      .catch((error) => {
        if (!mounted) return;
        setRows([]);
        setShowingMock(false);
        setMessage(error instanceof Error ? error.message : "Não foi possível carregar a equipe real.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (rows.length === 0 && !showingMock && !message) {
    return (
      <EmptyState
        title="Nenhum membro encontrado"
        body="Crie uma organização abaixo. A sua conta entra automaticamente como dona da organização."
      />
    );
  }

  return (
    <>
      {message ? <div className="status-message">{message}</div> : null}
      {rows.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Função</th>
              <th>Acesso</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((member) => (
              <tr key={member.id}>
                <td>{member.name || member.email || "Usuário"}</td>
                <td>{roleLabel(member.role)}</td>
                <td>{roleLabel(member.access)}</td>
                <td>
                  <Pill tone={member.status === "Convidada" ? "warn" : "good"}>{member.status}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </>
  );
}
