// ─── País ─────────────────────────────────────────────────────────────────────
export interface Country {
  code: string;
  name: string;
  flag_url: string;
}

// ─── Cultivos (dinámico desde Supabase) ──────────────────────────────────────
export type CropId = string; // ya no es un union type fijo

export interface Crop {
  id: CropId;
  name: string;
  emoji: string;
  grow_time_hours: number;
  points_reward: number;
  seed_cost: number;
  seed_cost_token: string;
  is_premium: boolean;
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

// ─── Skins (dinámico desde Supabase) ─────────────────────────────────────────
export type SkinId = string; // ya no es un union type fijo

export interface Skin {
  id: SkinId;
  name: string;
  price: number;
  price_token: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  description: string;
  emoji: string;
  image_url?: string | null;
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
