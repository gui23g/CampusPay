import { NextRequest, NextResponse } from "next/server";
import { organization } from "@/lib/mock-data";
import { isMockMode, logAuditEvent, readJson, requireUser } from "@/lib/api-server";

type OrganizationPayload = {
  name?: string;
  legalName?: string;
  institution?: string;
  campus?: string;
  type?: string;
  treasuryWallet?: string;
};

export async function GET(request: NextRequest) {
  if (isMockMode()) {
    return NextResponse.json({ mode: "mock", organizations: [organization] });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;
  const { data, error } = await admin
    .from("organization_memberships")
    .select("organizations(*)")
    .eq("user_id", user.id)
    .eq("active", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    organizations: data.flatMap((row) => row.organizations || [])
  });
}

export async function POST(request: NextRequest) {
  if (isMockMode()) {
    const body = await readJson<OrganizationPayload>(request);
    return NextResponse.json({
      mode: "mock",
      organization: {
        id: "mock-org-id",
        name: body.name || organization.name,
        institution: body.institution || organization.institution,
        campus: body.campus || organization.campus
      }
    });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;
  const body = await readJson<OrganizationPayload>(request);

  const name = String(body.name || "").trim();
  const institution = String(body.institution || "").trim();
  const campus = String(body.campus || "").trim();
  const type = String(body.type || "atlética").trim();

  if (!name || !institution || !campus) {
    return NextResponse.json(
      { error: "Nome, instituição e campus são obrigatórios." },
      { status: 400 }
    );
  }

  const { data: created, error } = await admin
    .from("organizations")
    .insert({
      name,
      legal_name: body.legalName || null,
      institution,
      campus,
      type,
      treasury_wallet: body.treasuryWallet || null,
      created_by: user.id
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error: membershipError } = await admin.from("organization_memberships").insert({
    organization_id: created.id,
    user_id: user.id,
    role: "owner",
    active: true
  });

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 500 });
  }

  await logAuditEvent(admin, {
    organizationId: created.id,
    actorId: user.id,
    area: "Organização",
    action: "criou organização",
    targetType: "organization",
    targetId: created.id
  });

  return NextResponse.json({ organization: created }, { status: 201 });
}
