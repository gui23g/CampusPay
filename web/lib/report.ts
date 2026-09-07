import { createHash } from "crypto";
import { campaign, ledgerEntries, orders, variants } from "@/lib/mock-data";

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }

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

export function canonicalReportPayload() {
  const payload = {
    campaignId: campaign.id,
    campaignName: campaign.name,
    organizationId: campaign.organizationId,
    closedAt: campaign.report.closedAt,
    totals: campaign.report.totals,
    variants: variants.map((variant) => ({
      sku: variant.sku,
      ordered: variant.ordered,
      paid: variant.paid,
      produced: variant.produced,
      pickedUp: variant.pickedUp
    })),
    payments: {
      pix: orders.filter((order) => order.paymentRail === "pix").length,
      solana: orders.filter((order) => order.paymentRail === "solana").length
    },
    ledgerBalanceCents: ledgerEntries.reduce(
      (acc, entry) => acc + entry.debitCents - entry.creditCents,
      0
    )
  };

  return JSON.stringify(sortKeys(payload), null, 2);
}

export function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function reportHash() {
  return sha256Hex(canonicalReportPayload());
}
