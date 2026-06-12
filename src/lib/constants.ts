import type { Country, Crop, Skin } from "@/types";

// ─── Países ───────────────────────────────────────────────────────────────────
export const COUNTRIES: Country[] = [
  { code: "CO", name: "Colombia",       flag: "🇨🇴" },
  { code: "KE", name: "Kenia",          flag: "🇰🇪" },
  { code: "NG", name: "Nigeria",        flag: "🇳🇬" },
  { code: "GH", name: "Ghana",          flag: "🇬🇭" },
  { code: "BR", name: "Brasil",         flag: "🇧🇷" },
  { code: "MX", name: "México",         flag: "🇲🇽" },
  { code: "PE", name: "Perú",           flag: "🇵🇪" },
  { code: "PH", name: "Filipinas",      flag: "🇵🇭" },
  { code: "IN", name: "India",          flag: "🇮🇳" },
  { code: "VN", name: "Vietnam",        flag: "🇻🇳" },
  { code: "ET", name: "Etiopía",        flag: "🇪🇹" },
  { code: "AR", name: "Argentina",      flag: "🇦🇷" },
  { code: "EC", name: "Ecuador",        flag: "🇪🇨" },
  { code: "ZA", name: "Sudáfrica",      flag: "🇿🇦" },
  { code: "OTHER", name: "Otro país",   flag: "🌍" },
];

// ─── Top 10 cultivos mundiales (FAO) ─────────────────────────────────────────
export const CROPS: Record<string, Crop> = {
  cana: {
    id: "cana",
    name: "Caña de azúcar",
    emoji: "🎋",
    growTimeHours: 16,
    pointsReward: 100,
    seedCostUSDT: 0.10,
  },
  maiz: {
    id: "maiz",
    name: "Maíz",
    emoji: "🌽",
    growTimeHours: 6,
    pointsReward: 35,
    seedCostUSDT: 0.03,
  },
  trigo: {
    id: "trigo",
    name: "Trigo",
    emoji: "🌾",
    growTimeHours: 8,
    pointsReward: 45,
    seedCostUSDT: 0.04,
  },
  arroz: {
    id: "arroz",
    name: "Arroz",
    emoji: "🍚",
    growTimeHours: 10,
    pointsReward: 60,
    seedCostUSDT: 0.06,
  },
  papa: {
    id: "papa",
    name: "Papa",
    emoji: "🥔",
    growTimeHours: 4,
    pointsReward: 20,
    seedCostUSDT: 0.02,
  },
  soya: {
    id: "soya",
    name: "Soya",
    emoji: "🫘",
    growTimeHours: 12,
    pointsReward: 75,
    seedCostUSDT: 0.07,
  },
  yuca: {
    id: "yuca",
    name: "Yuca",
    emoji: "🍠",
    growTimeHours: 14,
    pointsReward: 85,
    seedCostUSDT: 0.08,
  },
  tomate: {
    id: "tomate",
    name: "Tomate",
    emoji: "🍅",
    growTimeHours: 5,
    pointsReward: 28,
    seedCostUSDT: 0.02,
  },
  banano: {
    id: "banano",
    name: "Banano",
    emoji: "🍌",
    growTimeHours: 7,
    pointsReward: 40,
    seedCostUSDT: 0.04,
  },
  cafe: {
    id: "cafe",
    name: "Café",
    emoji: "☕",
    growTimeHours: 9,
    pointsReward: 55,
    seedCostUSDT: 0.05,
  },
};

// ─── Skins ────────────────────────────────────────────────────────────────────
export const SKINS: Skin[] = [
  {
    id: "default",
    name: "Farmer Base",
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
