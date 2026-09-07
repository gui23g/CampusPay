"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { campaign } from "@/lib/mock-data";

type CampaignResponse = {
  campaign: {
    id: string;
    slug: string;
    title: string;
  };
};

export function CampaignBuilder() {
  const [organizationId, setOrganizationId] = useState("");
  const [title, setTitle] = useState(campaign.name);
  const [slug, setSlug] = useState(campaign.slug);
  const [status, setStatus] = useState("selling");
  const [purpose, setPurpose] = useState(campaign.purpose);
  const [description, setDescription] = useState("Pré-venda da camisa oficial com retirada no campus.");
  const [minUnits, setMinUnits] = useState(campaign.minUnits);
  const [goalUnits, setGoalUnits] = useState(campaign.goalUnits);
  const [priceCents, setPriceCents] = useState(campaign.unitPriceCents);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function loadSavedOrganization() {
    setOrganizationId(localStorage.getItem("campuspay-org-id") || "");
  }

  async function submit() {
    setLoading(true);
    setMessage("");

    try {
      const campaignResponse = await apiRequest<CampaignResponse>("/api/campaigns", {
        method: "POST",
        body: {
          organizationId,
          title,
          slug,
          status,
          purpose,
          description,
          campusSlug: "inteli-sp",
          minUnits,
          goalUnits
        }
      });

      await apiRequest("/api/products", {
        method: "POST",
        body: {
          campaignId: campaignResponse.campaign.id,
          name: "Camisa oficial",
          description,
          imageUrl: campaign.productImage,
          variants: ["PP", "P", "M", "G", "GG"].map((size) => ({
            sku: `CAM-${size}`,
            label: size,
            priceCents,
            targetQuantity: Math.round(goalUnits / 5)
          }))
        }
      });

      setMessage(`Campanha criada: /c/${campaignResponse.campaign.slug}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível criar a campanha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-card">
      <span className="eyebrow">Campanha + produto</span>
      <h2>Criar vertical slice</h2>
      <div className="form-grid">
        <label>
          Organização ID
          <input
            className="text-input"
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
            placeholder="uuid da organização"
          />
        </label>
        <label>
          Título
          <input className="text-input" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          Slug
          <input className="text-input" value={slug} onChange={(event) => setSlug(event.target.value)} />
        </label>
        <label>
          Preço em centavos
          <input
            className="text-input"
            type="number"
            value={priceCents}
            onChange={(event) => setPriceCents(Number(event.target.value))}
          />
        </label>
        <label>
          Status inicial
          <select className="text-input" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="selling">Em venda</option>
            <option value="approved">Aprovada</option>
            <option value="in_review">Em revisão</option>
            <option value="draft">Rascunho</option>
          </select>
        </label>
        <label>
          Mínimo
          <input
            className="text-input"
            type="number"
            value={minUnits}
            onChange={(event) => setMinUnits(Number(event.target.value))}
          />
        </label>
        <label>
          Meta
          <input
            className="text-input"
            type="number"
            value={goalUnits}
            onChange={(event) => setGoalUnits(Number(event.target.value))}
          />
        </label>
      </div>
      <label>
        Propósito
        <textarea value={purpose} onChange={(event) => setPurpose(event.target.value)} />
      </label>
      <label>
        Descrição pública
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
      <div className="inline-actions">
        <button className="ghost-button" type="button" onClick={loadSavedOrganization}>
          Usar organização criada
        </button>
        <button className="primary-button" type="button" onClick={submit} disabled={loading}>
          {loading ? "Criando..." : "Criar campanha"}
        </button>
      </div>
      {message ? <div className="status-message">{message}</div> : null}
    </div>
  );
}
