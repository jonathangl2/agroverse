"use client";
import { useEffect, useState } from "react";
import { usePrizePool } from "@/hooks/useContract";
import { getTopPlayers } from "@/lib/supabase";
import { COUNTRIES } from "@/lib/constants";
import type { PlayerRow } from "@/lib/supabase";

const MEDAL = ["🥇", "🥈", "🥉"];

interface Props {
  currentAddress?: string | null;
  currentPoints?: number;
  username?: string;
  countryFlag?: string;
}

export default function Ranking({ currentAddress, currentPoints, username, countryFlag }: Props) {
  const prizePool = usePrizePool();
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopPlayers(20).then((data) => {
      setPlayers(data);
      setLoading(false);
    });
  }, []);

  const myPosition = players.findIndex((p) => p.wallet_address === currentAddress) + 1;
  const topPoints = players[0]?.points ?? 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-green-800">🏆 Ranking Global</h2>
        <p className="text-green-600 text-xs mt-1">Top agricultores del mundo · Season 1</p>
      </div>

      <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl p-3 text-center">
        <p className="text-amber-800 text-sm font-bold">🎁 Premio del mes</p>
        <p className="text-amber-600 font-mono font-black text-xl mt-1">
          {prizePool !== null ? `${prizePool} USDC` : "Cargando..."}
        </p>
        <p className="text-amber-700 text-xs mt-1">
          Top 3 recibe <strong>USDC real</strong> directo a su wallet
        </p>
        <p className="text-amber-500 text-xs mt-0.5">Reset: 30 Jun 2026</p>
      </div>

      {/* Tu posición */}
      {currentAddress && myPosition > 0 && (
        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-3">
          <p className="text-green-600 text-xs mb-1 font-medium">Tu posición</p>
          <div className="flex items-center justify-between">
            <span className="text-green-800 font-bold">
              #{myPosition} · {countryFlag} {username ?? "Tú"}
            </span>
            <span className="text-amber-600 font-mono font-bold">{currentPoints ?? 0} pts</span>
          </div>
          <div className="mt-2 bg-green-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, ((currentPoints ?? 0) / topPoints) * 100)}%` }} />
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-2">
        {loading && (
          <div className="flex items-center justify-center py-8 gap-2">
            <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-green-600 text-sm">Cargando ranking...</p>
          </div>
        )}
        {!loading && players.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">Aún no hay jugadores. ¡Sé el primero!</p>
        )}
        {!loading && players.map((p, i) => {
          const flag = COUNTRIES.find((c) => c.code === p.country_code)?.flag ?? "🌍";
          const isMe = p.wallet_address === currentAddress;
          return (
            <div key={p.wallet_address}
              className={`flex items-center gap-3 rounded-xl p-3 border transition ${
                isMe ? "bg-green-50 border-green-400" :
                i < 3 ? "bg-amber-50 border-amber-300" : "bg-white border-gray-200"
              }`}>
              <span className="text-xl w-8 text-center">
                {MEDAL[i] ?? `#${i + 1}`}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-green-900 font-semibold text-sm truncate">
                  {flag} {p.username} {isMe && <span className="text-green-500 text-xs">· tú</span>}
                </p>
                <p className="text-green-500 text-xs">Nivel {p.level}</p>
              </div>
              <div className="text-right">
                <p className="text-amber-600 font-bold font-mono">{p.points.toLocaleString()}</p>
                <p className="text-gray-400 text-xs">pts</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
