"use client";
import type { RankingEntry } from "@/types";
import { ZONES } from "@/lib/constants";

const MOCK_RANKING: RankingEntry[] = [
  { position: 1, address: "0xABc1", name: "Don Carlos",  points: 4820, level: 12, zone: "eje_cafetero",  skin: "sombrero_aguadeno" },
  { position: 2, address: "0xDEf2", name: "La Paisita",  points: 3950, level: 10, zone: "eje_cafetero",  skin: "ruana_roja" },
  { position: 3, address: "0xGHi3", name: "ElCachaco",   points: 3210, level: 9,  zone: "cundinamarca",  skin: "default" },
  { position: 4, address: "0xJKl4", name: "Valluno",     points: 2890, level: 8,  zone: "valle_cauca",   skin: "overol_verde" },
  { position: 5, address: "0xMNo5", name: "CafeCero",    points: 2540, level: 7,  zone: "eje_cafetero",  skin: "default" },
  { position: 6, address: "0xPQr6", name: "Boyacense",   points: 2100, level: 6,  zone: "cundinamarca",  skin: "ruana_roja" },
  { position: 7, address: "0xSTu7", name: "SaborCali",   points: 1780, level: 5,  zone: "valle_cauca",   skin: "default" },
  { position: 8, address: "0xVWx8", name: "Semillero",   points: 1450, level: 4,  zone: "eje_cafetero",  skin: "default" },
];

const MEDAL = ["🥇", "🥈", "🥉"];

interface Props { currentAddress?: string | null; currentPoints?: number; }

export default function Ranking({ currentAddress, currentPoints }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-green-800">🏆 Ranking Colombia</h2>
        <p className="text-green-600 text-xs mt-1">Top agricultores · Season 1</p>
      </div>

      {/* Premio */}
      <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl p-3 text-center">
        <p className="text-amber-800 text-sm font-bold">🎁 Premio del mes</p>
        <p className="text-amber-700 text-xs mt-1">
          Top 3 recibe <strong>USDT + 1 lb de Café Colombiano</strong>
        </p>
        <p className="text-amber-500 text-xs mt-0.5">Patrocinado por cafeteros locales</p>
      </div>

      {/* Tu posición */}
      {currentAddress && (
        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-3">
          <p className="text-green-600 text-xs mb-1 font-medium">Tu posición</p>
          <div className="flex items-center justify-between">
            <span className="text-green-800 font-bold">#{MOCK_RANKING.length + 1} · Tú</span>
            <span className="text-amber-600 font-mono font-bold">{currentPoints ?? 0} pts</span>
          </div>
          <div className="mt-2 bg-green-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, ((currentPoints ?? 0) / (MOCK_RANKING[0]?.points ?? 1)) * 100)}%` }} />
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-2">
        {MOCK_RANKING.map((entry) => (
          <div key={entry.position}
            className={`flex items-center gap-3 rounded-xl p-3 border ${
              entry.position <= 3 ? "bg-amber-50 border-amber-300" : "bg-white border-gray-200"
            }`}>
            <span className="text-xl w-8 text-center">
              {MEDAL[entry.position - 1] ?? `#${entry.position}`}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-green-900 font-semibold text-sm truncate">{entry.name}</p>
              <p className="text-green-500 text-xs">
                {ZONES.find((z) => z.id === entry.zone)?.emoji} {ZONES.find((z) => z.id === entry.zone)?.name} · Nv.{entry.level}
              </p>
            </div>
            <div className="text-right">
              <p className="text-amber-600 font-bold font-mono">{entry.points.toLocaleString()}</p>
              <p className="text-gray-400 text-xs">pts</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-gray-400 text-xs text-center">Ranking actualiza cada 24h · Reset: 30 Jun 2026</p>
    </div>
  );
}
