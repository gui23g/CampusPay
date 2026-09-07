"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api-client";

type InviteResponse = {
  invite: {
    id: string;
    email: string;
    role: string;
    token: string;
  };
};

export function InviteMemberForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("operator");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function invite() {
    const organizationId = localStorage.getItem("campuspay-org-id") || "";
    setLoading(true);
    setMessage("");

    try {
      const response = await apiRequest<InviteResponse>("/api/invites", {
        method: "POST",
        body: {
          organizationId,
          email,
          role
        }
      });

      setMessage(`Convite criado para ${response.invite.email}. Token: ${response.invite.token}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível criar o convite.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="list-item">
      <strong>Novo membro</strong>
      <span>Use a organização salva ao criar a entidade. O token expira em 7 dias.</span>
      <div className="inline-actions">
        <input
          className="text-input"
          placeholder="email@universidade.edu.br"
          aria-label="E-mail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <select className="text-input" value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="operator">Operação</option>
          <option value="treasurer">Tesouraria</option>
          <option value="auditor">Auditoria</option>
          <option value="president">Presidência</option>
        </select>
        <button className="primary-button" type="button" onClick={invite} disabled={loading}>
          {loading ? "Criando..." : "Criar convite"}
        </button>
      </div>
      {message ? <div className="status-message">{message}</div> : null}
    </div>
  );
}
