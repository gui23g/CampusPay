import { NextRequest, NextResponse } from "next/server";
import { auditEvents as mockAuditEvents } from "@/lib/mock-data";
import { isMockMode, listUserOrganizationIds, requireUser } from "@/lib/api-server";

export async function GET(request: NextRequest) {
  if (isMockMode()) {
    return NextResponse.json({
      mode: "mock",
      events: mockAuditEvents.map((event) => ({
        id: `${event.at}-${event.action}`,
        created_at: event.at,
        actor_name: event.actor,
        action: event.action,
        area: event.area
      }))
    });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;

  try {
    const organizationIds = await listUserOrganizationIds(admin, user.id);

    if (organizationIds.length === 0) {
      return NextResponse.json({ events: [] });
    }

    const { data, error } = await admin
      .from("audit_events")
      .select("id, created_at, area, action, target_type, target_id, metadata, profiles(full_name)")
      .in("organization_id", organizationIds)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const events = (data || []).map((event) => {
      const profile = Array.isArray(event.profiles) ? event.profiles[0] : event.profiles;

      return {
        id: event.id,
        created_at: event.created_at,
        actor_name: profile?.full_name || "Sistema",
        action: event.action,
        area: event.area,
        target_type: event.target_type,
        target_id: event.target_id,
        metadata: event.metadata
      };
    });

    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível carregar auditoria." },
      { status: 500 }
    );
  }
}
