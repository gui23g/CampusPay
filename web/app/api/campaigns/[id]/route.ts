import { NextRequest, NextResponse } from "next/server";
import {
  campaign as mockCampaign,
  variants as mockVariants
} from "@/lib/mock-data";
import {
  isMockMode,
  isOrganizationMember,
  isOrganizationAdmin,
  logAuditEvent,
  readJson,
  requireUser
} from "@/lib/api-server";

type CampaignPatchPayload = {
  title?: string;
  description?: string;
  purpose?: string;
  status?: string;
  minUnits?: number;
  goalUnits?: number;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (isMockMode()) {
    return NextResponse.json({
      mode: "mock",
      campaign: {
        ...mockCampaign,
        id,
        title: mockCampaign.name,
        min_units: mockCampaign.minUnits,
        goal_units: mockCampaign.goalUnits,
        products: [
          {
            id: "mock-product-camiseta",
            image_url: mockCampaign.productImage,
            product_variants: mockVariants.map((variant) => ({
              id: `mock-${variant.id}`,
              sku: variant.sku,
              label: variant.label,
              price_cents: mockCampaign.unitPriceCents,
              target_quantity: Math.round(mockCampaign.goalUnits / mockVariants.length),
              stock_quantity: variant.stock
            }))
          }
        ]
      }
    });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;
  const { data, error } = await admin
    .from("campaigns")
    .select("*, products(*, product_variants(*))")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
  }

  if (!(await isOrganizationMember(admin, user.id, data.organization_id))) {
    return NextResponse.json({ error: "Você não pode ver esta campanha." }, { status: 403 });
  }

  return NextResponse.json({ campaign: data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (isMockMode()) {
    return NextResponse.json({ mode: "mock", updated: true, campaignId: id });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;
  const body = await readJson<CampaignPatchPayload>(request);

  const { data: existing, error: existingError } = await admin
    .from("campaigns")
    .select("id, organization_id")
    .eq("id", id)
    .single();

  if (existingError || !existing) {
    return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
  }

  if (!(await isOrganizationAdmin(admin, user.id, existing.organization_id))) {
    return NextResponse.json({ error: "Você não pode editar esta campanha." }, { status: 403 });
  }

  const patch = {
    ...(body.title ? { title: body.title } : {}),
    ...(body.description ? { description: body.description } : {}),
    ...(body.purpose ? { purpose: body.purpose } : {}),
    ...(body.status ? { status: body.status } : {}),
    ...(typeof body.minUnits === "number" ? { min_units: body.minUnits } : {}),
    ...(typeof body.goalUnits === "number" ? { goal_units: body.goalUnits } : {}),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await admin
    .from("campaigns")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAuditEvent(admin, {
    organizationId: existing.organization_id,
    actorId: user.id,
    area: "Campanha",
    action: "atualizou campanha",
    targetType: "campaign",
    targetId: id
  });

  return NextResponse.json({ campaign: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (isMockMode()) {
    return NextResponse.json({ mode: "mock", cancelled: true, campaignId: id });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;
  const { data: existing, error: existingError } = await admin
    .from("campaigns")
    .select("id, organization_id")
    .eq("id", id)
    .single();

  if (existingError || !existing) {
    return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
  }

  if (!(await isOrganizationAdmin(admin, user.id, existing.organization_id))) {
    return NextResponse.json({ error: "Você não pode cancelar esta campanha." }, { status: 403 });
  }

  const { error } = await admin
    .from("campaigns")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAuditEvent(admin, {
    organizationId: existing.organization_id,
    actorId: user.id,
    area: "Campanha",
    action: "cancelou campanha",
    targetType: "campaign",
    targetId: id
  });

  return NextResponse.json({ cancelled: true });
}
