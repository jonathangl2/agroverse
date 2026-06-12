import type { Zone, Crop, Skin } from "@/types";

// ─── Zonas de Colombia ────────────────────────────────────────────────────────
export const ZONES: Zone[] = [
  {
    id: "eje_cafetero",
    name: "Eje Cafetero",
    region: "Caldas · Quindío · Risaralda",
    primaryCrop: "cafe",
    secondaryCrop: "platano",
    color: "#6B4226",
    emoji: "☕",
    description: "Tierra del mejor café del mundo. Clima perfecto, suelo volcánico.",
  },
  {
    id: "cundinamarca",
    name: "Cundinamarca",
    region: "Cundinamarca · Boyacá",
    primaryCrop: "flores",
    secondaryCrop: "papa",
    color: "#E91E8C",
    emoji: "🌸",
    description: "Capital de las flores. Exporta al mundo entero desde la Sabana.",
  },
  {
    id: "valle_cauca",
    name: "Valle del Cauca",
    region: "Valle del Cauca · Cauca",
    primaryCrop: "cana",
    secondaryCrop: "cacao",
    color: "#2E7D32",
    emoji: "🎋",
    description: "Corazón agroindustrial de Colombia. Caña y cacao de exportación.",
  },
];

// ─── Cultivos ─────────────────────────────────────────────────────────────────
export const CROPS: Record<string, Crop> = {
  cafe: {
    id: "cafe",
    name: "Café",
    emoji: "☕",
    growTimeHours: 8,
    pointsReward: 50,
    seedCostUSDT: 0.05,
  },
  platano: {
    id: "platano",
    name: "Plátano",
    emoji: "🍌",
    growTimeHours: 6,
    pointsReward: 30,
    seedCostUSDT: 0.03,
  },
  flores: {
    id: "flores",
    name: "Flores",
    emoji: "🌸",
    growTimeHours: 12,
    pointsReward: 80,
    seedCostUSDT: 0.08,
  },
  papa: {
    id: "papa",
    name: "Papa",
    emoji: "🥔",
    growTimeHours: 4,
    pointsReward: 20,
    seedCostUSDT: 0.02,
  },
  cana: {
    id: "cana",
    name: "Caña",
    emoji: "🎋",
    growTimeHours: 16,
    pointsReward: 100,
    seedCostUSDT: 0.10,
  },
  cacao: {
    id: "cacao",
    name: "Cacao",
    emoji: "🍫",
    growTimeHours: 10,
    pointsReward: 65,
    seedCostUSDT: 0.06,
  },
};

// ─── Skins ────────────────────────────────────────────────────────────────────
export const SKINS: Skin[] = [
  {
    id: "default",
    name: "Campesino Base",
    priceUSDT: 0,
    rarity: "common",
    description: "El agricultor de siempre. Fiel a sus raíces.",
  },
  {
    id: "ruana_roja",
    name: "Ruana Roja",
    priceUSDT: 0.5,
    rarity: "rare",
    description: "Ruana tejida a mano en los Andes. Clásica y elegante.",
  },
  {
    id: "sombrero_aguadeno",
    name: "Sombrero Aguadeño",
    priceUSDT: 1.0,
    rarity: "rare",
    description: "El sombrero más famoso de Colombia. Símbolo de orgullo.",
  },
  {
    id: "overol_verde",
    name: "Overol Verde",
    priceUSDT: 2.0,
    rarity: "epic",
    description: "Edición limitada. Solo los mejores agricultores lo portan.",
  },
];

// ─── Configuración del juego ──────────────────────────────────────────────────
export const GAME_CONFIG = {
  PLOTS_PER_PLAYER: 3,
  POINTS_TO_USDT_RATE: 1000, // 1000 puntos = 1 USDT
  MIN_WITHDRAW_POINTS: 500,
  PLATFORM_FEE_PCT: 5,       // 5% fee en marketplace
};

// ─── Celo / MiniPay ───────────────────────────────────────────────────────────
export const CELO_CONFIG = {
  CHAIN_ID: 42220,
  RPC_URL: "https://forno.celo.org",
  USDT_ADDRESS: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e" as `0x${string}`,
  USDT_ADAPTER: "0x0e2a3e05bc9a16f5292a6170456a710cb89c6f72" as `0x${string}`,
  USDM_ADDRESS: "0x765DE816845861e75A25fCA122bb6898B8B1282a" as `0x${string}`,
};
