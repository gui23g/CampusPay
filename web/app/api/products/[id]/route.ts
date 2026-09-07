import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isMockMode,
  isOrganizationAdmin,
  isOrganizationMember,
  logAuditEvent,
  readJson,
  requireUser
} from "@/lib/api-server";

type ProductPatchPayload = {
  name?: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
};

function productOrganizationId(product: { campaigns: { organization_id: string } | { organization_id: string }[] }) {
  const campaign = Array.isArray(product.campaigns) ? product.campaigns[0] : product.campaigns;
  return campaign.organization_id;
}

async function loadProduct(admin: SupabaseClient, id: string) {
  const { data, error } = await admin
    .from("products")
    .select("id, campaign_id, campaigns!inner(organization_id)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (isMockMode()) {
    return NextResponse.json({ mode: "mock", productId: id });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;
  const { data, error } = await admin
    .from("products")
    .select("*, product_variants(*), campaigns!inner(organization_id)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  }

  const organizationId = productOrganizationId(data);

  if (!(await isOrganizationMember(admin, user.id, organizationId))) {
    return NextResponse.json({ error: "Você não pode ver este produto." }, { status: 403 });
  }

  return NextResponse.json({ product: data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (isMockMode()) {
    return NextResponse.json({ mode: "mock", updated: true, productId: id });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;
  const body = await readJson<ProductPatchPayload>(request);
  const product = await loadProduct(admin, id);

  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  }

  const organizationId = productOrganizationId(product);

  if (!(await isOrganizationAdmin(admin, user.id, organizationId))) {
    return NextResponse.json({ error: "Você não pode editar este produto." }, { status: 403 });
  }

  const { data, error } = await admin
    .from("products")
    .update({
      ...(body.name ? { name: body.name } : {}),
      ...(body.description ? { description: body.description } : {}),
      ...(body.imageUrl ? { image_url: body.imageUrl } : {}),
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAuditEvent(admin, {
    organizationId,
    actorId: user.id,
    area: "Produto",
    action: "atualizou produto",
    targetType: "product",
    targetId: id
  });

  return NextResponse.json({ product: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (isMockMode()) {
    return NextResponse.json({ mode: "mock", archived: true, productId: id });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;
  const product = await loadProduct(admin, id);

  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  }

  const organizationId = productOrganizationId(product);

  if (!(await isOrganizationAdmin(admin, user.id, organizationId))) {
    return NextResponse.json({ error: "Você não pode arquivar este produto." }, { status: 403 });
  }

  const { error } = await admin
    .from("product_variants")
    .update({ active: false })
    .eq("product_id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAuditEvent(admin, {
    organizationId,
    actorId: user.id,
    area: "Produto",
    action: "arquivou produto",
    targetType: "product",
    targetId: id
  });

  return NextResponse.json({ archived: true });
}
