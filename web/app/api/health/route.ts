import { NextResponse } from "next/server";
import { integrationStatus } from "@/lib/env";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "campuspay-web",
    integrations: integrationStatus()
  });
}
