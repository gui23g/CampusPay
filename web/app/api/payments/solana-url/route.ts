import { NextRequest, NextResponse } from "next/server";
import { buildSolanaPayUrl } from "@/lib/solana";

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const amount = Number(params.get("amount") || "0");
  const reference = params.get("reference") || "CPAY-DEMO";

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "amount precisa ser maior que zero" }, { status: 400 });
  }

  return NextResponse.json({
    url: buildSolanaPayUrl({
      amount,
      reference,
      label: "CampusPay",
      message: `Pagamento do pedido ${reference}`,
      memo: reference
    })
  });
}
