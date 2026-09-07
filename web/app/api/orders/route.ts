import { NextRequest, NextResponse } from "next/server";
import { buildSolanaPayUrl } from "@/lib/solana";
import { campaign as mockCampaign, orders as mockOrders } from "@/lib/mock-data";
import { isMockMode, logAuditEvent, optionalUser, readJson, requireUser } from "@/lib/api-server";
import {
  createOrderCode,
  createPickupPin,
  createSolanaReference,
  hashPickupPin,
  randomToken
} from "@/lib/server-hash";

type OrderPayload = {
  campaignSlug?: string;
  productVariantId?: string;
  variantSku?: string;
  quantity?: number;
  buyerEmail?: string;
  paymentRail?: "pix" | "solana";
  idempotencyKey?: string;
};

export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope") || "all";
  const buyerEmail = request.nextUrl.searchParams.get("buyerEmail");

  if (isMockMode()) {
    const orders =
      scope === "buyer" && buyerEmail
        ? mockOrders.filter((order) => order.buyerEmail.toLowerCase() === buyerEmail.toLowerCase())
        : mockOrders;

    return NextResponse.json({ mode: "mock", orders });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;
  const orderSelect = "*, order_items(*, product_variants(*)), payment_intents(*)";

  const { data: memberships, error: membershipError } = await admin
    .from("organization_memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .eq("active", true);

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 500 });
  }

  const organizationIds = memberships.map((membership) => membership.organization_id);

  const buyerQueries =
    scope === "organization"
      ? []
      : [
          admin.from("orders").select(orderSelect).eq("buyer_id", user.id),
          ...(user.email
            ? [admin.from("orders").select(orderSelect).is("buyer_id", null).eq("buyer_email", user.email)]
            : [])
        ];

  const organizationQuery =
    scope !== "buyer" && organizationIds.length > 0
      ? admin
          .from("orders")
          .select(orderSelect)
          .in("organization_id", organizationIds)
      : null;

  const [buyerResults, organizationResult] = await Promise.all([
    Promise.all(buyerQueries),
    organizationQuery || Promise.resolve({ data: [], error: null })
  ]);

  const buyerError = buyerResults.find((result) => result.error)?.error;

  if (buyerError) {
    return NextResponse.json({ error: buyerError.message }, { status: 500 });
  }

  if (organizationResult.error) {
    return NextResponse.json({ error: organizationResult.error.message }, { status: 500 });
  }

  const map = new Map<string, unknown>();
  [
    ...buyerResults.flatMap((result) => result.data || []),
    ...(organizationResult.data || [])
  ].forEach((order) => {
    if (order && typeof order === "object" && "id" in order) {
      map.set(String(order.id), order);
    }
  });

  return NextResponse.json({ orders: Array.from(map.values()) });
}

export async function POST(request: NextRequest) {
  const body = await readJson<OrderPayload>(request);
  const quantity = Math.max(1, Number(body.quantity || 1));
  const paymentRail = body.paymentRail === "solana" ? "solana" : "pix";
  const idempotencyKey = body.idempotencyKey || randomToken(12);
  const orderCode = createOrderCode();
  const pickupPin = createPickupPin();
  const orderReference = `${mockCampaign.paymentReferencePrefix}-${orderCode}`;
  const reference = paymentRail === "solana" ? createSolanaReference() : orderReference;

  if (isMockMode()) {
    const amountCents = mockCampaign.unitPriceCents * quantity;
    return NextResponse.json(
      {
        mode: "mock",
        order: {
          code: orderCode,
          amountCents,
          pickupPin,
          status: "created"
        },
        paymentIntent: {
          rail: paymentRail,
          reference,
          pixCode:
            paymentRail === "pix"
              ? `00020126580014br.gov.bcb.pix0136${reference}520400005303986540${amountCents}5802BR`
              : null,
          solanaUrl:
            paymentRail === "solana"
              ? buildSolanaPayUrl({
                  amount: amountCents / 100,
                  reference,
                  label: "CampusPay",
                  message: `Pedido ${orderCode}`,
                  memo: orderReference
                })
              : null
        }
      },
      { status: 201 }
    );
  }

  const { admin, user } = await optionalUser(request);

  if (!admin) {
    return NextResponse.json({ error: "Supabase service role não está configurado." }, { status: 503 });
  }

  const { data: existingIntent } = await admin
    .from("payment_intents")
    .select("*, orders!inner(*)")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existingIntent) {
    return NextResponse.json({
      order: existingIntent.orders,
      paymentIntent: existingIntent,
      alreadyProcessed: true
    });
  }

  const campaignSlug = String(body.campaignSlug || "");
  const buyerEmail = String(body.buyerEmail || user?.email || "").trim();

  if (!campaignSlug || !buyerEmail) {
    return NextResponse.json({ error: "campaignSlug e buyerEmail são obrigatórios." }, { status: 400 });
  }

  const { data: campaign, error: campaignError } = await admin
    .from("campaigns")
    .select("id, organization_id, status")
    .eq("slug", campaignSlug)
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
  }

  if (!["approved", "selling"].includes(campaign.status)) {
    return NextResponse.json({ error: "Campanha não está aberta para venda." }, { status: 409 });
  }

  const variantQuery = admin
    .from("product_variants")
    .select("id, price_cents, product_id, products!inner(campaign_id)")
    .eq("products.campaign_id", campaign.id);

  const { data: variant, error: variantError } = body.productVariantId
    ? await variantQuery.eq("id", body.productVariantId).single()
    : await variantQuery.eq("sku", body.variantSku || "").single();

  if (variantError || !variant) {
    return NextResponse.json({ error: "Variante não encontrada." }, { status: 404 });
  }

  const amountCents = variant.price_cents * quantity;

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      organization_id: campaign.organization_id,
      campaign_id: campaign.id,
      buyer_id: user?.id || null,
      buyer_email: buyerEmail,
      code: orderCode,
      status: "created",
      amount_cents: amountCents,
      currency: "BRL",
      pickup_pin_hash: hashPickupPin(pickupPin)
    })
    .select("*")
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  const { error: itemError } = await admin.from("order_items").insert({
    order_id: order.id,
    product_variant_id: variant.id,
    quantity,
    unit_price_cents: variant.price_cents
  });

  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 500 });
  }

  const { data: paymentIntent, error: paymentError } = await admin
    .from("payment_intents")
    .insert({
      order_id: order.id,
      rail: paymentRail,
      status: "pending",
      amount_cents: amountCents,
      currency: "BRL",
      reference,
      idempotency_key: idempotencyKey,
      provider_payload: {
        pixProvider: paymentRail === "pix" ? process.env.PIX_PROVIDER || "mock" : null,
        orderReference
      }
    })
    .select("*")
    .single();

  if (paymentError) {
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  await logAuditEvent(admin, {
    organizationId: campaign.organization_id,
    actorId: user?.id,
    area: "Pedido",
    action: "criou pedido",
    targetType: "order",
    targetId: order.id,
    metadata: { rail: paymentRail, reference }
  });

  return NextResponse.json(
    {
      order: {
        ...order,
        pickupPin
      },
      paymentIntent: {
        ...paymentIntent,
        pixCode:
          paymentRail === "pix"
            ? `00020126580014br.gov.bcb.pix0136${reference}520400005303986540${amountCents}5802BR`
            : null,
        solanaUrl:
          paymentRail === "solana"
            ? buildSolanaPayUrl({
                amount: amountCents / 100,
                reference,
                label: "CampusPay",
                message: `Pedido ${orderCode}`,
                memo: orderReference
              })
            : null
      }
    },
    { status: 201 }
  );
}
