import { publicEnv } from "@/lib/env";

type SolanaPayTransferInput = {
  amount: number;
  label: string;
  message: string;
  memo?: string;
  recipient?: string;
  reference: string;
  splToken?: string;
};

export function buildSolanaPayUrl(input: SolanaPayTransferInput) {
  const env = publicEnv();
  const recipient = input.recipient || env.solanaTreasuryAddress;
  const url = new URL(`solana:${recipient}`);

  url.searchParams.set("amount", input.amount.toFixed(2));
  url.searchParams.set("reference", input.reference);
  url.searchParams.set("label", input.label);
  url.searchParams.set("message", input.message);

  if (input.splToken || env.solanaUsdcMint) {
    url.searchParams.set("spl-token", input.splToken || env.solanaUsdcMint);
  }

  if (input.memo) {
    url.searchParams.set("memo", input.memo);
  }

  return url.toString();
}

export function solanaExplorerUrl(signatureOrAddress: string, kind: "tx" | "address" = "tx") {
  const env = publicEnv();
  const cluster = env.solanaCluster === "mainnet-beta" ? "" : `?cluster=${env.solanaCluster}`;
  return `https://explorer.solana.com/${kind}/${signatureOrAddress}${cluster}`;
}
