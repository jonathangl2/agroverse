import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PlayerRow {
  wallet_address: string;
  username: string;
  country_code: string;
  points: number;
  level: number;
  skin: string;
  created_at: string;
  updated_at: string;
}

export interface SkinRow {
  id: string;
  name: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  price: number;
  price_token: string;
  emoji: string;
  image_url: string | null;
  active: boolean;
  sort_order: number;
}

export interface CropRow {
  id: string;
  name: string;
  emoji: string;
  grow_time_hours: number;
  points_reward: number;
  seed_cost: number;
  seed_cost_token: string;
  is_premium: boolean;
  active: boolean;
  sort_order: number;
}

export interface CountryRow {
  code: string;
  name: string;
  flag_url: string;
  active: boolean;
  sort_order: number;
}

// ── Catalog helpers ───────────────────────────────────────────────────────────

export async function getSkins(): Promise<SkinRow[]> {
  const { data } = await supabase
    .from("skins")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  return data ?? [];
}

export async function getCrops(): Promise<CropRow[]> {
  const { data } = await supabase
    .from("crops")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  return data ?? [];
}

export async function getCountries(): Promise<CountryRow[]> {
  const { data } = await supabase
    .from("countries")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  return data ?? [];
}

// ── Player helpers ────────────────────────────────────────────────────────────

export async function getPlayer(wallet: string): Promise<PlayerRow | null> {
  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("wallet_address", wallet)
    .maybeSingle();
  return data;
}

export async function upsertPlayer(player: Omit<PlayerRow, "created_at" | "updated_at">) {
  const { error } = await supabase
    .from("players")
    .upsert(player, { onConflict: "wallet_address" });
  if (error) throw error;
}

export async function updatePoints(wallet: string, points: number, level: number) {
  const { error } = await supabase
    .from("players")
    .update({ points, level })
    .eq("wallet_address", wallet);
  if (error) throw error;
}

export async function getTopPlayers(limit = 20): Promise<PlayerRow[]> {
  const { data } = await supabase
    .from("players")
    .select("*")
    .order("points", { ascending: false })
    .limit(limit);
  return data ?? [];
}

// ── Seed purchase helpers ─────────────────────────────────────────────────────

export async function recordPurchase(
  wallet: string,
  seedId: string,
  txHash: string,
  amount: number,
  amountToken: string = "USDC"
) {
  const { error } = await supabase.from("seed_purchases").insert({
    wallet_address: wallet,
    seed_id: seedId,
    tx_hash: txHash,
    amount,
    amount_token: amountToken,
  });
  if (error && !error.message.includes("duplicate")) throw error;
}

// ── Skin purchase helpers ─────────────────────────────────────────────────────

export async function recordSkinPurchase(
  wallet: string,
  skinId: string,
  txHash: string,
  amount: number,
  amountToken: string = "USDC"
) {
  // Historial de pagos
  const { error: e1 } = await supabase.from("skin_purchases").insert({
    wallet_address: wallet,
    skin_id: skinId,
    tx_hash: txHash,
    amount,
    amount_token: amountToken,
  });
  if (e1 && !e1.message.includes("duplicate")) throw e1;

  // Desbloquear skin para el jugador
  const { error: e2 } = await supabase.from("player_skins").insert({
    wallet_address: wallet,
    skin_id: skinId,
  });
  if (e2 && !e2.message.includes("duplicate")) throw e2;
}

export async function getPlayerSkins(wallet: string): Promise<string[]> {
  const { data } = await supabase
    .from("player_skins")
    .select("skin_id")
    .eq("wallet_address", wallet);
  return (data ?? []).map((r: { skin_id: string }) => r.skin_id);
}
