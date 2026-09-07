import { NextRequest, NextResponse } from "next/server";
import { campaign as mockCampaign, variants as mockVariants } from "@/lib/mock-data";
import {
  isMockMode,
  isOrganizationAdmin,
  logAuditEvent,
  optionalUser,
  readJson,
  requireUser
} from "@/lib/api-server";

type ProductPayload = {
  campaignId?: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  variants?: Array<{
    sku: string;
    label: string;
    priceCents: number;
    targetQuantity: number;
  }>;
};

export async function GET(request: NextRequest) {
  const campaignId = request.nextUrl.searchParams.get("campaignId");
  const campaignSlug = request.nextUrl.searchParams.get("campaignSlug");

  if (isMockMode()) {
    const matchesCampaign =
      (!campaignId || campaignId === mockCampaign.id) &&
      (!campaignSlug || campaignSlug === mockCampaign.slug);

    return NextResponse.json({
      mode: "mock",
      products: matchesCampaign
        ? [
            {
              id: "mock-product-camiseta",
              campaign_id: mockCampaign.id,
              name: "Camisa oficial",
              description: mockCampaign.purpose,
              image_url: mockCampaign.productImage,
              product_variants: mockVariants.map((variant) => ({
                id: `mock-${variant.id}`,
                sku: variant.sku,
                label: variant.label,
                price_cents: mockCampaign.unitPriceCents,
                target_quantity: Math.round(mockCampaign.goalUnits / mockVariants.length),
                stock_quantity: variant.stock,
                active: true
              }))
            }
          ]
        : []
    });
  }

  const { admin } = await optionalUser(request);
  if (!admin) {
    return NextResponse.json({ error: "Supabase service role não está configurado." }, { status: 503 });
  }

  let query = campaignSlug
    ? admin
        .from("products")
        .select("*, product_variants(*), campaigns!inner(slug)")
        .eq("campaigns.slug", campaignSlug)
    : admin.from("products").select("*, product_variants(*)");

  if (campaignId) {
    query = query.eq("campaign_id", campaignId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}

export async function POST(request: NextRequest) {
  if (isMockMode()) {
    const body = await readJson<ProductPayload>(request);
    return NextResponse.json({
      mode: "mock",
      product: { id: "mock-product-id", name: body.name || "Produto demo" }
    });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;
  const body = await readJson<ProductPayload>(request);
  const campaignId = String(body.campaignId || "");

  const { data: campaign, error: campaignError } = await admin
    .from("campaigns")
    .select("id, organization_id")
    .eq("id", campaignId)
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
  }

  if (!(await isOrganizationAdmin(admin, user.id, campaign.organization_id))) {
    return NextResponse.json({ error: "Você não pode editar produtos desta campanha." }, { status: 403 });
  }

  const name = String(body.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Nome do produto é obrigatório." }, { status: 400 });
  }

  const { data: product, error } = await admin
    .from("products")
    .insert({
      campaign_id: campaignId,
      name,
      description: body.description || null,
      image_url: body.imageUrl || null
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const variants = (body.variants || []).filter((variant) => variant.sku && variant.label);

  if (variants.length > 0) {
    const { error: variantsError } = await admin.from("product_variants").insert(
      variants.map((variant) => ({
        product_id: product.id,
        sku: variant.sku,
        label: variant.label,
        price_cents: variant.priceCents,
        target_quantity: variant.targetQuantity,
        currency: "BRL"
      }))
    );

    if (variantsError) {
      return NextResponse.json({ error: variantsError.message }, { status: 500 });
    }
  }

  await logAuditEvent(admin, {
    organizationId: campaign.organization_id,
    actorId: user.id,
    area: "Produto",
    action: "criou produto",
    targetType: "product",
    targetId: product.id
  });

  return NextResponse.json({ product }, { status: 201 });
}
