"use client";

import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

export function createSupabaseBrowserClient() {
  const env = publicEnv();

  if (!env.supabaseUrl || !env.supabaseKey) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseKey);
}
