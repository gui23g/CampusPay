export function publicEnv() {
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    enableMocks: process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "false",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    supabaseKey,
    productImagesBucket:
      process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images",
    solanaCluster: process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "devnet",
    solanaRpcUrl:
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
    solanaTreasuryAddress:
      process.env.NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS ||
      "11111111111111111111111111111111",
    solanaUsdcMint: process.env.NEXT_PUBLIC_SOLANA_USDC_MINT || ""
  };
}

export function integrationStatus() {
  const env = publicEnv();
  const hasConfiguredTreasury =
    Boolean(process.env.NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS) &&
    env.solanaTreasuryAddress !== "11111111111111111111111111111111";

  return {
    mocksEnabled: env.enableMocks,
    supabaseReady: Boolean(env.supabaseUrl && env.supabaseKey),
    storageReady: Boolean(env.supabaseUrl && env.supabaseKey && env.productImagesBucket),
    solanaReady: Boolean(env.solanaRpcUrl && hasConfiguredTreasury),
    solanaCluster: env.solanaCluster
  };
}
