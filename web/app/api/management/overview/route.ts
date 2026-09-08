import { NextRequest, NextResponse } from "next/server";
import { campaign as mockCampaign, organization as mockOrganization, pickupWindows as mockPickupWindows } from "@/lib/mock-data";
import { integrationStatus } from "@/lib/env";
import { isMockMode, listUserOrganizationIds, requireUser } from "@/lib/api-server";

type OrganizationRow = {
  id: string;
  name: string;
  campus?: string;
};

type MembershipRow = {
  organization_id: string;
  organizations?: OrganizationRow | OrganizationRow[] | null;
};

type ProductVariantRow = {
  price_cents?: number;
  target_quantity?: number;
  stock_quantity?: number;
};

type ProductRow = {
  image_url?: string | null;
  product_variants?: ProductVariantRow[];
};

type CampaignRow = {
  id: string;
  slug: string;
  title: string;
  purpose?: string;
  status?: string;
  public_report_id?: string | null;
  min_units?: number;
  goal_units?: number;
  products?: ProductRow[];
};

type OrderRow = {
  status?: string;
  amount_cents?: number;
  order_items?: Array<{ quantity?: number }>;
};

type BatchRow = {
  planned_units?: number;
  produced_units?: number;
};

type PickupWindowRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  place: string;
  capacity: number;
};

type PaymentRow = {
  amount_cents?: number;
};

function firstOrganization(row?: MembershipRow) {
  const value = row?.organizations;
  if (Array.isArray(value)) return value[0];
  return value || null;
}

function orderQuantity(order: OrderRow) {
  const total = (order.order_items || []).reduce((acc, item) => acc + Number(item.quantity || 0), 0);
  return total || 1;
}

export async function GET(request: NextRequest) {
  if (isMockMode()) {
    return NextResponse.json({
      mode: "mock",
      integrations: integrationStatus(),
      organization: mockOrganization,
      campaign: {
        id: mockCampaign.id,
        slug: mockCampaign.slug,
        title: mockCampaign.name,
        purpose: mockCampaign.purpose,
        status: mockCampaign.status,
        stage: mockCampaign.stage,
        imageUrl: mockCampaign.productImage,
        publicReportId: mockCampaign.publicReportId,
        unitPriceCents: mockCampaign.unitPriceCents,
        minUnits: mockCampaign.minUnits,
        goalUnits: mockCampaign.goalUnits,
        soldUnits: mockCampaign.soldUnits,
        paidUnits: mockCampaign.paidUnits,
        producedUnits: mockCampaign.producedUnits,
        pickedUpUnits: mockCampaign.pickedUpUnits,
        grossRevenueCents: mockCampaign.report.totals.grossRevenueCents,
        netResultCents: mockCampaign.report.totals.netResultCents
      },
      pickupWindows: mockPickupWindows
    });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;

  try {
    const organizationIds = await listUserOrganizationIds(admin, user.id);

    if (organizationIds.length === 0) {
      return NextResponse.json({
        integrations: integrationStatus(),
        organization: null,
        campaign: null,
        pickupWindows: []
      });
    }

    const { data: memberships } = await admin
      .from("organization_memberships")
      .select("organization_id, organizations(id, name, campus)")
      .eq("user_id", user.id)
      .eq("active", true)
      .limit(1);

    const organization = firstOrganization((memberships || [])[0] as MembershipRow | undefined);
    const { data: campaigns, error: campaignError } = await admin
      .from("campaigns")
      .select("id, slug, title, purpose, status, public_report_id, min_units, goal_units, products(image_url, product_variants(price_cents, target_quantity, stock_quantity))")
      .in("organization_id", organizationIds)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (campaignError) {
      return NextResponse.json({ error: campaignError.message }, { status: 500 });
    }

    const campaign = (campaigns || [])[0] as CampaignRow | undefined;

    if (!campaign) {
      return NextResponse.json({
        integrations: integrationStatus(),
        organization,
        campaign: null,
        pickupWindows: []
      });
    }

    const [{ data: orders }, { data: batches }, { data: pickupWindows }, { data: payments }] =
      await Promise.all([
        admin
          .from("orders")
          .select("status, amount_cents, order_items(quantity)")
          .eq("campaign_id", campaign.id),
        admin.from("production_batches").select("planned_units, produced_units").eq("campaign_id", campaign.id),
        admin
          .from("pickup_windows")
          .select("id, starts_at, ends_at, place, capacity")
          .eq("campaign_id", campaign.id)
          .order("starts_at", { ascending: true })
          .limit(3),
        admin
          .from("payments")
          .select("amount_cents, payment_intents!inner(orders!inner(campaign_id))")
          .eq("payment_intents.orders.campaign_id", campaign.id)
          .eq("status", "confirmed")
      ]);

    const product = campaign.products?.[0];
    const variants = campaign.products?.flatMap((item) => item.product_variants || []) || [];
    const soldUnits = ((orders || []) as OrderRow[]).reduce((acc, order) => acc + orderQuantity(order), 0);
    const paidUnits = ((orders || []) as OrderRow[])
      .filter((order) => ["paid", "fulfilled"].includes(order.status || ""))
      .reduce((acc, order) => acc + orderQuantity(order), 0);
    const pickedUpUnits = ((orders || []) as OrderRow[])
      .filter((order) => order.status === "fulfilled")
      .reduce((acc, order) => acc + orderQuantity(order), 0);
    const producedFromBatches = ((batches || []) as BatchRow[]).reduce(
      (acc, batch) => acc + Number(batch.produced_units || 0),
      0
    );
    const producedFromStock = variants.reduce((acc, variant) => acc + Number(variant.stock_quantity || 0), 0);
    const unitPriceCents = variants.find((variant) => typeof variant.price_cents === "number")?.price_cents || 0;
    const grossRevenueCents = ((payments || []) as PaymentRow[]).reduce(
      (acc, payment) => acc + Number(payment.amount_cents || 0),
      0
    );

    return NextResponse.json({
      integrations: integrationStatus(),
      organization,
      campaign: {
        id: campaign.id,
        slug: campaign.slug,
        title: campaign.title,
        purpose: campaign.purpose,
        status: campaign.status,
        stage: campaign.status,
        imageUrl: product?.image_url || "",
        publicReportId: campaign.public_report_id,
        unitPriceCents,
        minUnits: campaign.min_units || 0,
        goalUnits: campaign.goal_units || 0,
        soldUnits,
        paidUnits,
        producedUnits: producedFromBatches || producedFromStock,
        pickedUpUnits,
        grossRevenueCents,
        netResultCents: grossRevenueCents
      },
      pickupWindows: (pickupWindows || []) as PickupWindowRow[]
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível carregar a visão geral." },
      { status: 500 }
    );
  }
}
