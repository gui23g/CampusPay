"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { publicEnv } from "@/lib/env";

export function SessionBadge() {
  const env = publicEnv();
  const configured = Boolean(env.supabaseUrl && env.supabaseKey);
  const [email, setEmail] = useState<string | null | undefined>(configured ? undefined : null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setEmail(data.session?.user.email || null);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email || null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase?.auth.signOut();
    setEmail(null);
  }

  if (email === undefined) return null;

  if (!email) {
    return (
      <Link className="ghost-button" href="/login">
        Entrar
      </Link>
    );
  }

  return (
    <button className="ghost-button" type="button" onClick={signOut} title={email}>
      Sair
    </button>
  );
}
