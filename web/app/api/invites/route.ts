import { NextRequest, NextResponse } from "next/server";
import {
  isMockMode,
  isOrganizationAdmin,
  logAuditEvent,
  readJson,
  requireUser
} from "@/lib/api-server";
import { randomToken, sha256Hex } from "@/lib/server-hash";

type InvitePayload = {
  organizationId?: string;
  email?: string;
  role?: string;
};

export async function POST(request: NextRequest) {
  const body = await readJson<InvitePayload>(request);
  const email = String(body.email || "").trim().toLowerCase();
  const role = String(body.role || "operator");
  const organizationId = String(body.organizationId || "");
  const token = randomToken(18);

  if (!email || !organizationId) {
    return NextResponse.json({ error: "organizationId e email são obrigatórios." }, { status: 400 });
  }

  if (isMockMode()) {
    return NextResponse.json({
      mode: "mock",
      invite: {
        id: "mock-invite-id",
        email,
        role,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;
  const allowedRoles = ["president", "treasurer", "operator", "auditor"] as const;
  const requestedRole = body.role as (typeof allowedRoles)[number] | undefined;
  const memberRole = requestedRole && allowedRoles.includes(requestedRole) ? requestedRole : "operator";

  if (!(await isOrganizationAdmin(admin, user.id, organizationId))) {
    return NextResponse.json({ error: "Você não pode convidar pessoas para esta organização." }, { status: 403 });
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await admin
    .from("organization_invites")
    .insert({
      organization_id: organizationId,
      email,
      role: memberRole,
      token_hash: sha256Hex(token),
      expires_at: expiresAt,
      created_by: user.id
    })
    .select("id, email, role, expires_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAuditEvent(admin, {
    organizationId,
    actorId: user.id,
    area: "Equipe",
    action: "criou convite",
    targetType: "organization_invite",
    targetId: data.id,
    metadata: { email, role: memberRole }
  });

  return NextResponse.json({ invite: { ...data, token } }, { status: 201 });
}
