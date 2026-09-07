import { publicEnv } from "@/lib/env";

type ValidationInput = {
  signature?: string;
  reference: string;
  recipient: string;
};

type SolanaAccountKey = string | { pubkey?: string };

type SolanaTransactionResponse = {
  result?: {
    meta?: {
      err?: unknown;
    };
    transaction?: {
      message?: {
        accountKeys?: SolanaAccountKey[];
      };
    };
  } | null;
  error?: {
    message?: string;
  };
};

function accountKeyToString(key: SolanaAccountKey) {
  return typeof key === "string" ? key : key.pubkey || "";
}

export async function validateSolanaTransactionIfEnabled(input: ValidationInput) {
  if (process.env.SOLANA_VALIDATE_TRANSACTIONS !== "true") {
    return { ok: true, skipped: true };
  }

  if (!input.signature) {
    return { ok: false, message: "Assinatura Solana obrigatória." };
  }

  const env = publicEnv();
  const response = await fetch(env.solanaRpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "campuspay-payment-validation",
      method: "getTransaction",
      params: [
        input.signature,
        {
          encoding: "jsonParsed",
          maxSupportedTransactionVersion: 0
        }
      ]
    })
  });

  if (!response.ok) {
    return { ok: false, message: "RPC Solana indisponível." };
  }

  const json = (await response.json()) as SolanaTransactionResponse;

  if (json.error) {
    return { ok: false, message: json.error.message || "RPC Solana retornou erro." };
  }

  if (!json.result) {
    return { ok: false, message: "Transação não encontrada na Solana." };
  }

  if (json.result.meta?.err) {
    return { ok: false, message: "Transação Solana falhou." };
  }

  const accountKeys = json.result.transaction?.message?.accountKeys?.map(accountKeyToString) || [];

  if (!accountKeys.includes(input.reference)) {
    return { ok: false, message: "Reference Solana não encontrada na transação." };
  }

  if (!accountKeys.includes(input.recipient)) {
    return { ok: false, message: "Tesouraria destinatária não encontrada na transação." };
  }

  return { ok: true, skipped: false };
}
