import { NextRequest, NextResponse } from "next/server";
import { campaign as mockCampaign, organization as mockOrganization } from "@/lib/mock-data";
import { canonicalReportPayload, reportHash } from "@/lib/report";
import { isMockMode } from "@/lib/api-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeys((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  const { publicId } = await params;

  if (isMockMode()) {
    return NextResponse.json({
      mode: "mock",
      report: {
        publicId,
        campaignTitle: mockCampaign.name,
        organizationName: mockOrganization.name,
        createdAt: mockCampaign.report.closedAt,
        payloadHash: reportHash(),
        canonicalJson: canonicalReportPayload(),
        anchor: {
          chain: "solana",
          cluster: "devnet",
          signature: mockCampaign.report.solanaSignature,
          status: "confirmed"
        }
      }
    });
  }

  const admin = createSupabaseAdminClient();

  if (!admin) {
    return NextResponse.json({ error: "Supabase service role não está configurado." }, { status: 503 });
  }

  const { data: snapshot, error } = await admin
    .from("report_snapshots")
    .select("*")
    .eq("public_id", publicId)
    .single();

  if (error || !snapshot) {
    return NextResponse.json({ error: "Relatório não encontrado." }, { status: 404 });
  }

  const [{ data: campaign }, { data: anchors }] = await Promise.all([
    admin
      .from("campaigns")
      .select("id, title, purpose, organization_id, organizations(name, campus)")
      .eq("id", snapshot.campaign_id)
      .single(),
    admin
      .from("blockchain_anchors")
      .select("*")
      .eq("report_snapshot_id", snapshot.id)
      .order("created_at", { ascending: false })
      .limit(1)
  ]);

  const organization = Array.isArray(campaign?.organizations)
    ? campaign?.organizations[0]
    : campaign?.organizations;
  const anchor = (anchors || [])[0];
  const canonicalJson = JSON.stringify(sortKeys(snapshot.canonical_payload), null, 2);

  return NextResponse.json({
    report: {
      publicId: snapshot.public_id,
      campaignTitle: campaign?.title || "Campanha",
      organizationName: organization?.name || "Organização",
      createdAt: snapshot.created_at,
      payloadHash: snapshot.payload_hash,
      canonicalJson,
      anchor: anchor
        ? {
            chain: anchor.chain,
            cluster: anchor.cluster,
            signature: anchor.signature,
            payloadHash: anchor.payload_hash,
            status: anchor.status
          }
        : null
    }
  });
}
