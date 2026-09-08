"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";

type ProfileResponse = {
  mode?: string;
  email?: string;
  profile?: {
    name?: string;
    full_name?: string;
    campus?: string;
    institution?: string;
    wallet?: string;
    wallet_address?: string;
    preferredTheme?: string;
  } | null;
  buyer?: {
    campus?: string | null;
    institution?: string | null;
    phone?: string | null;
    wallet_address?: string | null;
  } | null;
  preferences?: {
    theme?: string | null;
  } | null;
};

export function BuyerProfileForm() {
  const [fullName, setFullName] = useState("");
  const [campus, setCampus] = useState("");
  const [institution, setInstitution] = useState("");
  const [phone, setPhone] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [theme, setTheme] = useState("system");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    void apiRequest<ProfileResponse>("/api/me/profile")
      .then((response) => {
        if (!mounted) return;

        const profile = response.profile;
        const buyer = response.buyer;
        setFullName(profile?.full_name || profile?.name || "");
        setCampus(buyer?.campus || profile?.campus || "");
        setInstitution(buyer?.institution || profile?.institution || "");
        setPhone(buyer?.phone || "");
        setWalletAddress(buyer?.wallet_address || profile?.wallet_address || profile?.wallet || "");
        setTheme(response.preferences?.theme || profile?.preferredTheme || "system");
        setMessage(response.mode === "mock" ? "Modo mock ativo: perfil de demonstração carregado." : "");
      })
      .catch((error) => {
        if (!mounted) return;
        setMessage(error instanceof Error ? error.message : "Entre para carregar e salvar seu perfil.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function save() {
    setLoading(true);
    setMessage("");

    try {
      await apiRequest("/api/me/profile", {
        method: "PUT",
        body: {
          fullName,
          campus,
          institution,
          phone,
          walletAddress,
          theme,
          emailNotifications: true,
          whatsappNotifications: false
        }
      });
      setMessage("Perfil salvo.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-card">
      <span className="eyebrow">CRUD comprador</span>
      <h2>Dados do comprador</h2>
      <div className="form-grid">
        <label>
          Nome
          <input className="text-input" value={fullName} onChange={(event) => setFullName(event.target.value)} />
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
          Telefone
          <input className="text-input" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </label>
        <label>
          Wallet
          <input className="text-input" value={walletAddress} onChange={(event) => setWalletAddress(event.target.value)} />
        </label>
        <label>
          Tema
          <select className="text-input" value={theme} onChange={(event) => setTheme(event.target.value)}>
            <option value="system">Sistema</option>
            <option value="light">Claro</option>
            <option value="dark">Noturno</option>
          </select>
        </label>
      </div>
      <div className="inline-actions">
        <button className="primary-button" type="button" onClick={save} disabled={loading}>
          {loading ? "Salvando..." : "Salvar perfil"}
        </button>
      </div>
      {message ? <div className="status-message">{message}</div> : null}
    </div>
  );
}
