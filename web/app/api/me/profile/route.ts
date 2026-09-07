import { NextRequest, NextResponse } from "next/server";
import { buyerProfile } from "@/lib/mock-data";
import { isMockMode, readJson, requireUser } from "@/lib/api-server";

type ProfilePayload = {
  fullName?: string;
  campus?: string;
  institution?: string;
  phone?: string;
  walletAddress?: string;
  theme?: string;
  emailNotifications?: boolean;
  whatsappNotifications?: boolean;
};

export async function GET(request: NextRequest) {
  if (isMockMode()) {
    return NextResponse.json({ mode: "mock", profile: buyerProfile });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;
  const [{ data: profile }, { data: buyer }, { data: preferences }] = await Promise.all([
    admin.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    admin.from("buyer_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    admin.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle()
  ]);

  return NextResponse.json({
    profile,
    buyer,
    preferences,
    email: user.email
  });
}

export async function PUT(request: NextRequest) {
  if (isMockMode()) {
    const body = await readJson<ProfilePayload>(request);
    return NextResponse.json({ mode: "mock", saved: true, profile: body });
  }

  const context = await requireUser(request);
  if (context instanceof NextResponse) return context;

  const { admin, user } = context;
  const body = await readJson<ProfilePayload>(request);

  const fullName = String(body.fullName || "").trim();
  const campus = String(body.campus || "").trim();
  const institution = String(body.institution || "").trim();

  if (!fullName || !campus || !institution) {
    return NextResponse.json(
      { error: "Nome, instituição e campus são obrigatórios." },
      { status: 400 }
    );
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: user.id,
    full_name: fullName,
    updated_at: new Date().toISOString()
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const { error: buyerError } = await admin.from("buyer_profiles").upsert({
    user_id: user.id,
    campus,
    institution,
    phone: body.phone || null,
    wallet_address: body.walletAddress || null,
    updated_at: new Date().toISOString()
  });

  if (buyerError) {
    return NextResponse.json({ error: buyerError.message }, { status: 500 });
  }

  const { error: preferenceError } = await admin.from("user_preferences").upsert({
    user_id: user.id,
    theme: body.theme || "system",
    email_notifications: body.emailNotifications ?? true,
    whatsapp_notifications: body.whatsappNotifications ?? false,
    updated_at: new Date().toISOString()
  });

  if (preferenceError) {
    return NextResponse.json({ error: preferenceError.message }, { status: 500 });
  }

  return NextResponse.json({ saved: true });
}
