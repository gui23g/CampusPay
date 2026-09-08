"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function AuthPanel() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setMessage("Configure Supabase em .env.local para autenticar usuários reais.");
      return;
    }

    setLoading(true);
    setMessage("");

    const result =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMessage(result.error.message);
      setLoading(false);
      return;
    }

    const next = new URLSearchParams(window.location.search).get("next") || "/app";

    if (result.data.session) {
      router.replace(next);
      router.refresh();
      return;
    }

    setMessage(mode === "signup" ? "Conta criada. Confirme o e-mail se o Supabase exigir." : "Login feito.");
    setLoading(false);
  }

  return (
    <div className="auth-card">
      <div>
        <span className="eyebrow">Acesso</span>
        <h1>{mode === "signin" ? "Entrar na CampusPay" : "Criar conta"}</h1>
        <p>
          A mesma conta pode comprar campanhas e, quando tiver membership, operar uma organização.
        </p>
      </div>

      <label>
        E-mail
        <input
          className="text-input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@universidade.edu.br"
        />
      </label>
      <label>
        Senha
        <input
          className="text-input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="mínimo recomendado: 8 caracteres"
        />
      </label>

      <div className="inline-actions">
        <button className="primary-button" type="button" onClick={submit} disabled={loading}>
          {loading ? "Processando..." : mode === "signin" ? "Entrar" : "Criar conta"}
        </button>
        <button
          className="ghost-button"
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Criar conta" : "Já tenho conta"}
        </button>
      </div>

      {message ? <div className="status-message">{message}</div> : null}
    </div>
  );
}
