import { NextRequest, NextResponse } from "next/server";
import {
  isMockMode,
  isOrganizationMember,
  jsonError,
  logAuditEvent,
  readJson,
  requireUser
} from "@/lib/api-server";
import { hashPickupPin, randomToken } from "@/lib/server-hash";

type ConfirmFulfillmentPayload = {
  orderCode?: string;
  pickupPin?: string;
  pickupWindowId?: string;
  idempotencyKey?: string;
};

export async function POST(request: NextRequest) {
  if (isMockMode()) {
    const body = await readJson<ConfirmFulfillmentPayload>(request);
    return NextResponse.json({
      mode: "mock",
      confirmed: true,
      orderCode: body.orderCode || "CP-2048"
    });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;
  const body = await readJson<ConfirmFulfillmentPayload>(request);
  const orderCode = String(body.orderCode || "").trim();
  const pickupPin = String(body.pickupPin || "").trim();

  if (!orderCode || !pickupPin) {
    return jsonError("orderCode e pickupPin são obrigatórios.", 400);
  }

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id, code, organization_id, pickup_pin_hash, status")
    .eq("code", orderCode)
    .single();

  if (orderError || !order) {
    return jsonError("Pedido não encontrado.", 404);
  }

  if (!(await isOrganizationMember(admin, user.id, order.organization_id))) {
    return jsonError("Você não pode confirmar retirada nesta organização.", 403);
  }

  if (order.pickup_pin_hash !== hashPickupPin(pickupPin)) {
    return jsonError("PIN inválido.", 403);
  }

  if (order.status === "fulfilled") {
    return NextResponse.json({ confirmed: true, alreadyProcessed: true });
  }

  const { data: fulfillment, error: fulfillmentError } = await admin
    .from("fulfillments")
    .insert({
      order_id: order.id,
      pickup_window_id: body.pickupWindowId || null,
      status: "confirmed",
      confirmed_by: user.id,
      confirmed_at: new Date().toISOString(),
      idempotency_key: body.idempotencyKey || `fulfillment:${orderCode}:${randomToken(8)}`
    })
    .select("*")
    .single();

  if (fulfillmentError) {
    return jsonError(fulfillmentError.message, 500);
  }

  await admin
    .from("orders")
    .update({ status: "fulfilled", updated_at: new Date().toISOString() })
    .eq("id", order.id);

  await logAuditEvent(admin, {
    organizationId: order.organization_id,
    actorId: user.id,
    area: "Retirada",
    action: "confirmou retirada",
    targetType: "fulfillment",
    targetId: fulfillment.id,
    metadata: { orderCode }
  });

  return NextResponse.json({ confirmed: true, fulfillment });
}
