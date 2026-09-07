import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isMockMode,
  isOrganizationMember,
  logAuditEvent,
  readJson,
  requireUser
} from "@/lib/api-server";

type OrderPatchPayload = {
  status?: string;
};

async function loadOrder(admin: SupabaseClient, code: string) {
  const { data, error } = await admin
    .from("orders")
    .select("id, code, organization_id, buyer_id, status")
    .eq("code", code)
    .single();

  if (error) return null;
  return data;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (isMockMode()) {
    return NextResponse.json({ mode: "mock", code });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;
  const { data, error } = await admin
    .from("orders")
    .select("*, order_items(*, product_variants(*)), payment_intents(*), fulfillments(*)")
    .eq("code", code)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const member = await isOrganizationMember(admin, user.id, data.organization_id);
  const buyer = data.buyer_id === user.id;

  if (!member && !buyer) {
    return NextResponse.json({ error: "Você não pode ver este pedido." }, { status: 403 });
  }

  return NextResponse.json({ order: data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (isMockMode()) {
    return NextResponse.json({ mode: "mock", updated: true, code });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;
  const body = await readJson<OrderPatchPayload>(request);
  const order = await loadOrder(admin, code);

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const member = await isOrganizationMember(admin, user.id, order.organization_id);
  const buyer = order.buyer_id === user.id;

  if (!member && !buyer) {
    return NextResponse.json({ error: "Você não pode alterar este pedido." }, { status: 403 });
  }

  const nextStatus = body.status || "cancelled";
  const { data, error } = await admin
    .from("orders")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", order.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAuditEvent(admin, {
    organizationId: order.organization_id,
    actorId: user.id,
    area: "Pedido",
    action: "atualizou pedido",
    targetType: "order",
    targetId: order.id,
    metadata: { status: nextStatus }
  });

  return NextResponse.json({ order: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (isMockMode()) {
    return NextResponse.json({ mode: "mock", cancelled: true, code });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;
  const order = await loadOrder(admin, code);

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const member = await isOrganizationMember(admin, user.id, order.organization_id);
  const buyer = order.buyer_id === user.id;

  if (!member && !buyer) {
    return NextResponse.json({ error: "Você não pode cancelar este pedido." }, { status: 403 });
  }

  const { error } = await admin
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", order.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAuditEvent(admin, {
    organizationId: order.organization_id,
    actorId: user.id,
    area: "Pedido",
    action: "cancelou pedido",
    targetType: "order",
    targetId: order.id
  });

  return NextResponse.json({ cancelled: true });
}
