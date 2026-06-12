// ─── País del jugador ─────────────────────────────────────────────────────────
export interface Country {
  code: string;   // ISO 3166-1 alpha-2
  name: string;
  flag: string;   // emoji
}

// ─── Cultivos globales ────────────────────────────────────────────────────────
export type CropId =
  | "cana" | "maiz" | "trigo" | "arroz" | "papa"
  | "soya" | "yuca" | "tomate" | "banano" | "cafe";

export interface Crop {
  id: CropId;
  name: string;
  emoji: string;
  growTimeHours: number;
  pointsReward: number;
  seedCostUSDT: number;
}

// ─── Plot (parcela) ───────────────────────────────────────────────────────────
export type PlotState = "empty" | "planted" | "growing" | "ready";

export interface Plot {
  id: number;
  state: PlotState;
  cropId?: CropId;
  plantedAt?: number;
  readyAt?: number;
}

// ─── Jugador ──────────────────────────────────────────────────────────────────
export interface Player {
  address: string;
  username: string;
  countryCode: string;
  points: number;
  level: number;
  plots: Plot[];
  skin: SkinId;
  createdAt: number;
}

// ─── Skins ────────────────────────────────────────────────────────────────────
export type SkinId = "default" | "ruana_roja" | "sombrero_aguadeno" | "overol_verde";

export interface Skin {
  id: SkinId;
  name: string;
  priceUSDT: number;
  rarity: "common" | "rare" | "epic";
  description: string;
}

// ─── Ranking ──────────────────────────────────────────────────────────────────
export interface RankingEntry {
  position: number;
  address: string;
  username: string;
  countryCode: string;
  countryFlag: string;
  points: number;
  level: number;
  skin: SkinId;
}
