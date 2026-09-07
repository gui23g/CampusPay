import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import { createSupabaseAdminClient, createSupabaseAuthClient } from "@/lib/supabase-admin";

export type ApiUserContext = {
  admin: SupabaseClient;
  user: User;
};

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function isMockMode() {
  return publicEnv().enableMocks;
}

export function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const [, token] = authorization.match(/^Bearer\s+(.+)$/i) || [];
  return token || "";
}

export async function requireUser(request: NextRequest): Promise<ApiUserContext | NextResponse> {
  const admin = createSupabaseAdminClient();
  const token = getBearerToken(request);

  if (!admin) {
    return jsonError("Supabase service role não está configurado no servidor.", 503);
  }

  if (!token) {
    return jsonError("Sessão obrigatória. Faça login para continuar.", 401);
  }

  const authClient = createSupabaseAuthClient(token);

  if (!authClient) {
    return jsonError("Supabase público não está configurado.", 503);
  }

  const { data, error } = await authClient.auth.getUser(token);

  if (error || !data.user) {
    return jsonError("Sessão inválida ou expirada.", 401);
  }

  return { admin, user: data.user };
}

export async function optionalUser(request: NextRequest) {
  const admin = createSupabaseAdminClient();
  const token = getBearerToken(request);

  if (!admin) {
    return { admin: null, user: null };
  }

  if (!token) {
    return { admin, user: null };
  }

  const authClient = createSupabaseAuthClient(token);

  if (!authClient) {
    return { admin, user: null };
  }

  const { data } = await authClient.auth.getUser(token);
  return { admin, user: data.user || null };
}

export async function readJson<T extends Record<string, unknown>>(request: NextRequest) {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

export async function isOrganizationAdmin(
  admin: SupabaseClient,
  userId: string,
  organizationId: string
) {
  const { data, error } = await admin
    .from("organization_memberships")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .eq("active", true)
    .in("role", ["owner", "president", "treasurer"])
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
}

export async function isOrganizationMember(
  admin: SupabaseClient,
  userId: string,
  organizationId: string
) {
  const { data, error } = await admin
    .from("organization_memberships")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
}

export async function logAuditEvent(
  admin: SupabaseClient,
  input: {
    organizationId?: string;
    actorId?: string;
    area: string;
    action: string;
    targetType?: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
  }
) {
  await admin.from("audit_events").insert({
    organization_id: input.organizationId || null,
    actor_id: input.actorId || null,
    area: input.area,
    action: input.action,
    target_type: input.targetType || null,
    target_id: input.targetId || null,
    metadata: input.metadata || {}
  });
}
