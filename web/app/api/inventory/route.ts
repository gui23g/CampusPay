import { NextRequest, NextResponse } from "next/server";
import { campaign as mockCampaign, productionBatches as mockBatches, variants as mockVariants } from "@/lib/mock-data";
import { isMockMode, listUserOrganizationIds, requireUser } from "@/lib/api-server";

export async function GET(request: NextRequest) {
  if (isMockMode()) {
    return NextResponse.json({
      mode: "mock",
      campaigns: [
        {
          id: mockCampaign.id,
          title: mockCampaign.name,
          slug: mockCampaign.slug,
          status: mockCampaign.status
        }
      ],
      products: [
        {
          id: "mock-product-camiseta",
          campaign_id: mockCampaign.id,
          name: "Camisa oficial",
          image_url: mockCampaign.productImage,
          product_variants: mockVariants.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            label: variant.label,
            price_cents: mockCampaign.unitPriceCents,
            target_quantity: variant.ordered,
            stock_quantity: variant.stock,
            produced_quantity: variant.produced,
            picked_up_quantity: variant.pickedUp
          }))
        }
      ],
      batches: mockBatches.map((batch) => ({
        id: batch.name,
        campaign_id: mockCampaign.id,
        supplier_name: batch.name,
        planned_units: batch.units,
        produced_units: batch.status === "Recebido" ? batch.units : 0,
        status: batch.status,
        expected_at: batch.eta
      }))
    });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;

  try {
    const organizationIds = await listUserOrganizationIds(admin, user.id);

    if (organizationIds.length === 0) {
      return NextResponse.json({ campaigns: [], products: [], batches: [] });
    }

    const { data: campaigns, error: campaignError } = await admin
      .from("campaigns")
      .select("id, title, slug, status")
      .in("organization_id", organizationIds)
      .order("updated_at", { ascending: false });

    if (campaignError) {
      return NextResponse.json({ error: campaignError.message }, { status: 500 });
    }

    const campaignIds = (campaigns || []).map((campaign) => campaign.id);

    if (campaignIds.length === 0) {
      return NextResponse.json({ campaigns: [], products: [], batches: [] });
    }

    const [{ data: products, error: productsError }, { data: batches, error: batchesError }] =
      await Promise.all([
        admin
          .from("products")
          .select("id, campaign_id, name, image_url, product_variants(*)")
          .in("campaign_id", campaignIds),
        admin.from("production_batches").select("*").in("campaign_id", campaignIds)
      ]);

    if (productsError) {
      return NextResponse.json({ error: productsError.message }, { status: 500 });
    }

    if (batchesError) {
      return NextResponse.json({ error: batchesError.message }, { status: 500 });
    }

    return NextResponse.json({
      campaigns,
      products: products || [],
      batches: batches || []
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível carregar o inventário." },
      { status: 500 }
    );
  }
}
