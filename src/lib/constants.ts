// ─── Configuración del juego ──────────────────────────────────────────────────
// Catálogos (países, cultivos, skins) viven en Supabase — ver src/lib/supabase.ts
export const GAME_CONFIG = {
  PLOTS_PER_PLAYER: 3,
  POINTS_TO_USDT_RATE: 1000,
  MIN_WITHDRAW_POINTS: 500,
  PLATFORM_FEE_PCT: 5,
};

// ─── Celo / MiniPay ───────────────────────────────────────────────────────────
export const CELO_CONFIG = {
  CHAIN_ID: 42220,
  RPC_URL: "https://forno.celo.org",
  USDT_ADDRESS: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e" as `0x${string}`,
  USDT_ADAPTER: "0x0e2a3e05bc9a16f5292a6170456a710cb89c6f72" as `0x${string}`,
  USDM_ADDRESS: "0x765DE816845861e75A25fCA122bb6898B8B1282a" as `0x${string}`,
};
