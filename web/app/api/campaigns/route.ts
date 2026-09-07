import { NextRequest, NextResponse } from "next/server";
import { campaign } from "@/lib/mock-data";
import {
  isMockMode,
  isOrganizationAdmin,
  logAuditEvent,
  optionalUser,
  readJson,
  requireUser
} from "@/lib/api-server";
import { sha256Hex } from "@/lib/server-hash";

type CampaignPayload = {
  organizationId?: string;
  slug?: string;
  title?: string;
  description?: string;
  purpose?: string;
  campusSlug?: string;
  startsAt?: string;
  endsAt?: string;
  minUnits?: number;
  goalUnits?: number;
  status?: string;
};

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const campusSlug = request.nextUrl.searchParams.get("campusSlug");

  if (isMockMode()) {
    const campaigns = [campaign].filter((item) => {
      const matchesSlug = !slug || item.slug === slug;
      const matchesCampus = !campusSlug || item.campusSlug === campusSlug;
      return matchesSlug && matchesCampus;
    });

    return NextResponse.json({ mode: "mock", campaigns });
  }

  const { admin, user } = await optionalUser(request);
  if (!admin) {
    return NextResponse.json({ error: "Supabase service role não está configurado." }, { status: 503 });
  }

  const publicStatuses = ["approved", "selling", "production", "pickup", "closed"];
  const campaignSelect = "*, products(*, product_variants(*))";

  if (!user) {
    let query = admin
      .from("campaigns")
      .select(campaignSelect)
      .in("status", publicStatuses);

    if (slug) query = query.eq("slug", slug);
    if (campusSlug) query = query.eq("campus_slug", campusSlug);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaigns: data });
  }

  const { data: memberships, error: membershipError } = await admin
    .from("organization_memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .eq("active", true);

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 500 });
  }

  const organizationIds = memberships.map((membership) => membership.organization_id);

  let publicQuery = admin
    .from("campaigns")
    .select(campaignSelect)
    .in("status", publicStatuses);

  if (slug) publicQuery = publicQuery.eq("slug", slug);
  if (campusSlug) publicQuery = publicQuery.eq("campus_slug", campusSlug);

  let memberQuery =
    organizationIds.length > 0
      ? admin.from("campaigns").select(campaignSelect).in("organization_id", organizationIds)
      : null;

  if (memberQuery && slug) memberQuery = memberQuery.eq("slug", slug);
  if (memberQuery && campusSlug) memberQuery = memberQuery.eq("campus_slug", campusSlug);

  const [publicResult, memberResult] = await Promise.all([
    publicQuery,
    memberQuery || Promise.resolve({ data: [], error: null })
  ]);

  if (publicResult.error) {
    return NextResponse.json({ error: publicResult.error.message }, { status: 500 });
  }

  if (memberResult.error) {
    return NextResponse.json({ error: memberResult.error.message }, { status: 500 });
  }

  const map = new Map<string, unknown>();
  [...(publicResult.data || []), ...(memberResult.data || [])].forEach((item) => {
    if (item && typeof item === "object" && "id" in item) {
      map.set(String(item.id), item);
    }
  });

  return NextResponse.json({ campaigns: Array.from(map.values()) });
}

export async function POST(request: NextRequest) {
  if (isMockMode()) {
    const body = await readJson<CampaignPayload>(request);
    return NextResponse.json({
      mode: "mock",
      campaign: {
        id: "mock-campaign-id",
        slug: body.slug || campaign.slug,
        title: body.title || campaign.name,
        status: body.status || "selling"
      }
    });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;
  const body = await readJson<CampaignPayload>(request);
  const organizationId = String(body.organizationId || "");

  if (!organizationId) {
    return NextResponse.json({ error: "organizationId é obrigatório." }, { status: 400 });
  }

  if (!(await isOrganizationAdmin(admin, user.id, organizationId))) {
    return NextResponse.json({ error: "Você não pode criar campanha nesta organização." }, { status: 403 });
  }

  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const purpose = String(body.purpose || "").trim();
  const slug = String(body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/^-|-$/g, "");
  const allowedStatuses = ["draft", "in_review", "approved", "selling"] as const;
  const requestedStatus = body.status as (typeof allowedStatuses)[number] | undefined;
  const status = requestedStatus && allowedStatuses.includes(requestedStatus) ? requestedStatus : "draft";

  if (!title || !description || !purpose || !slug) {
    return NextResponse.json(
      { error: "Título, descrição, propósito e slug são obrigatórios." },
      { status: 400 }
    );
  }

  const { data: created, error } = await admin
    .from("campaigns")
    .insert({
      organization_id: organizationId,
      slug,
      title,
      description,
      purpose,
      status,
      campus_slug: body.campusSlug || "campus-principal",
      starts_at: body.startsAt || null,
      ends_at: body.endsAt || null,
      min_units: body.minUnits || 0,
      goal_units: body.goalUnits || 0,
      created_by: user.id,
      approved_at: ["approved", "selling"].includes(status || "") ? new Date().toISOString() : null
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const payload = {
    title,
    description,
    purpose,
    minUnits: body.minUnits || 0,
    goalUnits: body.goalUnits || 0
  };

  await admin.from("campaign_versions").insert({
    campaign_id: created.id,
    version: 1,
    payload,
    payload_hash: sha256Hex(JSON.stringify(payload)),
    created_by: user.id
  });

  await logAuditEvent(admin, {
    organizationId,
    actorId: user.id,
    area: "Campanha",
    action: "criou campanha",
    targetType: "campaign",
    targetId: created.id
  });

  return NextResponse.json({ campaign: created }, { status: 201 });
}
