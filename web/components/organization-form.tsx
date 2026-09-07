"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { publicEnv } from "@/lib/env";
import { organization } from "@/lib/mock-data";

type OrganizationResponse = {
  organization: {
    id: string;
    name: string;
  };
  mode?: string;
};

export function OrganizationForm() {
  const mocksEnabled = publicEnv().enableMocks;
  const [name, setName] = useState(mocksEnabled ? organization.name : "");
  const [legalName, setLegalName] = useState(mocksEnabled ? organization.legalName : "");
  const [institution, setInstitution] = useState(mocksEnabled ? organization.institution : "");
  const [campus, setCampus] = useState(mocksEnabled ? organization.campus : "");
  const [type, setType] = useState("atlética");
  const [treasuryWallet, setTreasuryWallet] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function createOrganization() {
    setLoading(true);
    setMessage("");

    try {
      const response = await apiRequest<OrganizationResponse>("/api/organizations", {
        method: "POST",
        body: {
          name,
          legalName,
          institution,
          campus,
          type,
          treasuryWallet
        }
      });

      localStorage.setItem("campuspay-org-id", response.organization.id);
      setMessage(`Organização criada: ${response.organization.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível criar a organização.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-card">
      <span className="eyebrow">CRUD dono</span>
      <h2>Criar organização</h2>
      <div className="form-grid">
        <label>
          Nome
          <input className="text-input" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Razão social
          <input className="text-input" value={legalName} onChange={(event) => setLegalName(event.target.value)} />
        </label>
        <label>
          Instituição
          <input className="text-input" value={institution} onChange={(event) => setInstitution(event.target.value)} />
        </label>
        <label>
          Campus
          <input className="text-input" value={campus} onChange={(event) => setCampus(event.target.value)} />
        </label>
        <label>
          Tipo
          <select className="text-input" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="atlética">Atlética</option>
            <option value="centro-academico">Centro acadêmico</option>
            <option value="diretorio">Diretório</option>
            <option value="coletivo">Coletivo</option>
          </select>
        </label>
        <label>
          Wallet tesouraria
          <input
            className="text-input"
            value={treasuryWallet}
            onChange={(event) => setTreasuryWallet(event.target.value)}
            placeholder="public key devnet"
          />
        </label>
      </div>
      <div className="inline-actions">
        <button className="primary-button" type="button" onClick={createOrganization} disabled={loading}>
          {loading ? "Criando..." : "Criar organização"}
        </button>
      </div>
      {message ? <div className="status-message">{message}</div> : null}
    </div>
  );
}
