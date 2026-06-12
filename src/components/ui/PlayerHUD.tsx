"use client";
import type { SkinId, ZoneId } from "@/types";
import { ZONES, GAME_CONFIG } from "@/lib/constants";

const SKIN_AVATAR: Record<SkinId, string> = {
  default: "👨‍🌾",
  ruana_roja: "🧣",
  sombrero_aguadeno: "👒",
  overol_verde: "🥋",
};

interface Props {
  points: number;
  level: number;
  skin: SkinId;
  zone: ZoneId;
  address: string;
}

function getLevelProgress(points: number, level: number) {
  const basePoints = (level - 1) * 500;
  const nextLevel = level * 500;
  const progress = ((points - basePoints) / (nextLevel - basePoints)) * 100;
  return Math.min(100, Math.max(0, progress));
}

export default function PlayerHUD({ points, level, skin, zone, address }: Props) {
  const zoneData = ZONES.find((z) => z.id === zone);
  const usdt = (points / GAME_CONFIG.POINTS_TO_USDT_RATE).toFixed(3);
  const progress = getLevelProgress(points, level);

  return (
    <div className="bg-green-900/60 border border-green-700 rounded-xl p-4">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-14 h-14 bg-green-800 rounded-xl flex items-center justify-center text-3xl border-2 border-green-600">
          {SKIN_AVATAR[skin]}
        </div>

        {/* Info principal */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <span className="bg-green-700 text-green-200 text-xs px-2 py-0.5 rounded-full">
              Nv. {level}
            </span>
          </div>
          <div className="text-green-400 text-xs mt-0.5">
            {zoneData?.emoji} {zoneData?.name}
          </div>

          {/* Barra de experiencia */}
          <div className="mt-2 bg-green-950 rounded-full h-1.5">
            <div
              className="bg-green-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Puntos */}
        <div className="text-right">
          <div className="text-yellow-300 font-bold font-mono text-lg">
            {points.toLocaleString()}
          </div>
          <div className="text-yellow-600 text-xs">puntos</div>
          <div className="text-green-400 text-xs font-mono mt-0.5">
            ≈ {usdt} USDT
          </div>
        </div>
      </div>
    </div>
  );
}
