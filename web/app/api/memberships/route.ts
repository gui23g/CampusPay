import { NextRequest, NextResponse } from "next/server";
import { members as mockMembers, organization as mockOrganization } from "@/lib/mock-data";
import { isMockMode, requireUser } from "@/lib/api-server";

function profileName(profile: unknown) {
  const resolved = Array.isArray(profile) ? profile[0] : profile;

  if (resolved && typeof resolved === "object" && "full_name" in resolved) {
    return String(resolved.full_name || "Usuário");
  }

  return "Usuário";
}

function organizationName(organization: unknown) {
  const resolved = Array.isArray(organization) ? organization[0] : organization;

  if (resolved && typeof resolved === "object" && "name" in resolved) {
    return String(resolved.name || "Organização");
  }

  return "Organização";
}

export async function GET(request: NextRequest) {
  if (isMockMode()) {
    return NextResponse.json({
      mode: "mock",
      members: mockMembers.map((member, index) => ({
        id: `mock-member-${index}`,
        name: member.name,
        role: member.role,
        access: member.access,
        status: member.status,
        organization: mockOrganization.name
      })),
      invites: []
    });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;

  const { data: ownMemberships, error: ownMembershipsError } = await admin
    .from("organization_memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .eq("active", true);

  if (ownMembershipsError) {
    return NextResponse.json({ error: ownMembershipsError.message }, { status: 500 });
  }

  const organizationIds = ownMemberships.map((membership) => membership.organization_id);

  if (organizationIds.length === 0) {
    return NextResponse.json({ members: [], invites: [] });
  }

  const [membershipsResult, invitesResult] = await Promise.all([
    admin
      .from("organization_memberships")
      .select("id, role, active, starts_at, ends_at, profiles(full_name), organizations(name)")
      .in("organization_id", organizationIds)
      .order("created_at", { ascending: true }),
    admin
      .from("organization_invites")
      .select("id, email, role, expires_at, accepted_at, organizations(name)")
      .in("organization_id", organizationIds)
      .is("accepted_at", null)
      .order("created_at", { ascending: false })
  ]);

  if (membershipsResult.error) {
    return NextResponse.json({ error: membershipsResult.error.message }, { status: 500 });
  }

  if (invitesResult.error) {
    return NextResponse.json({ error: invitesResult.error.message }, { status: 500 });
  }

  return NextResponse.json({
    members: (membershipsResult.data || []).map((membership) => ({
      id: membership.id,
      name: profileName(membership.profiles),
      role: membership.role,
      access: membership.role,
      status: membership.active ? "Ativa" : "Inativa",
      organization: organizationName(membership.organizations)
    })),
    invites: (invitesResult.data || []).map((invite) => ({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      access: invite.role,
      status: "Convidada",
      expiresAt: invite.expires_at,
      organization: organizationName(invite.organizations)
    }))
  });
}
