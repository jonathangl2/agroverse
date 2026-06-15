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

// ── Player helpers ─────────────────────────────────────────────────────────────

export async function getPlayer(wallet: string): Promise<PlayerRow | null> {
  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("wallet_address", wallet)
    .single();
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

// ── Purchase helpers ───────────────────────────────────────────────────────────

export async function recordPurchase(
  wallet: string,
  seedId: string,
  txHash: string,
  amountUsdc: number
) {
  const { error } = await supabase.from("purchases").insert({
    wallet_address: wallet,
    seed_id: seedId,
    tx_hash: txHash,
    amount_usdc: amountUsdc,
  });
  if (error && !error.message.includes("duplicate")) throw error;
}
