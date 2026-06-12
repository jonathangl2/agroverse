// ─── Zonas de Colombia ───────────────────────────────────────────────────────
export type ZoneId = "eje_cafetero" | "cundinamarca" | "valle_cauca";

export interface Zone {
  id: ZoneId;
  name: string;
  region: string;
  primaryCrop: CropId;
  secondaryCrop: CropId;
  color: string;
  emoji: string;
  description: string;
}

// ─── Cultivos ─────────────────────────────────────────────────────────────────
export type CropId = "cafe" | "platano" | "flores" | "papa" | "cana" | "cacao";

export interface Crop {
  id: CropId;
  name: string;
  emoji: string;
  growTimeHours: number;   // horas para cosechar
  pointsReward: number;    // puntos al cosechar
  seedCostUSDT: number;    // costo de semilla premium
}

// ─── Plot (parcela del mapa) ──────────────────────────────────────────────────
export type PlotState = "empty" | "planted" | "growing" | "ready";

export interface Plot {
  id: number;
  state: PlotState;
  cropId?: CropId;
  plantedAt?: number;      // timestamp ms
  readyAt?: number;        // timestamp ms
}

// ─── Jugador ──────────────────────────────────────────────────────────────────
export interface Player {
  address: string;
  name: string;
  zone: ZoneId;
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
  name: string;
  points: number;
  level: number;
  zone: ZoneId;
  skin: SkinId;
}
