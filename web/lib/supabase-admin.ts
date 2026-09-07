import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

export function createSupabaseAdminClient() {
  const env = publicEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!env.supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(env.supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function createSupabaseAuthClient(accessToken?: string) {
  const env = publicEnv();

  if (!env.supabaseUrl || !env.supabaseKey) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      : undefined
  });
}
