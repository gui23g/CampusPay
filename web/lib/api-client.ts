"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type JsonBody = Record<string, unknown> | Array<unknown>;

export async function apiRequest<T>(
  path: string,
  options: Omit<RequestInit, "body"> & { body?: JsonBody } = {}
) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const supabase = createSupabaseBrowserClient();
  const sessionResult = supabase ? await supabase.auth.getSession() : null;
  const token = sessionResult?.data.session?.access_token;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const json = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(json.error || "Ação não concluída.");
  }

  return json as T;
}
