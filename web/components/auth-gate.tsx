"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { publicEnv } from "@/lib/env";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const mocksEnabled = publicEnv().enableMocks;
  const [allowed, setAllowed] = useState(mocksEnabled);

  useEffect(() => {
    if (mocksEnabled) {
      return;
    }

    const supabase = createSupabaseBrowserClient();

    function redirectToLogin() {
      const next = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }

    if (!supabase) {
      redirectToLogin();
      return;
    }

    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      if (data.session) {
        setAllowed(true);
      } else {
        redirectToLogin();
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAllowed(true);
      } else {
        redirectToLogin();
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [mocksEnabled, router]);

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <div className="app-frame">
      <main className="page-shell">
        <section className="auth-card">
          <span className="eyebrow">Sessão obrigatória</span>
          <h1>Redirecionando para login</h1>
          <p>As áreas de gestão e conta do comprador exigem autenticação quando mocks estão desligados.</p>
        </section>
      </main>
    </div>
  );
}
