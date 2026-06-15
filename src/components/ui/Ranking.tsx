"use client";
import type { RankingEntry } from "@/types";
import { usePrizePool } from "@/hooks/useContract";

const MOCK_RANKING: RankingEntry[] = [
  { position: 1, address: "0xABc1", username: "KenyanFarmer",   countryCode: "KE", countryFlag: "🇰🇪", points: 4820, level: 12, skin: "sombrero_aguadeno" },
  { position: 2, address: "0xDEf2", username: "CafeteroGlobal", countryCode: "CO", countryFlag: "🇨🇴", points: 3950, level: 10, skin: "ruana_roja" },
  { position: 3, address: "0xGHi3", username: "RiceFarmerVN",   countryCode: "VN", countryFlag: "🇻🇳", points: 3210, level: 9,  skin: "default" },
  { position: 4, address: "0xJKl4", username: "NaijaGrower",    countryCode: "NG", countryFlag: "🇳🇬", points: 2890, level: 8,  skin: "overol_verde" },
  { position: 5, address: "0xMNo5", username: "BrazilSoja",     countryCode: "BR", countryFlag: "🇧🇷", points: 2540, level: 7,  skin: "default" },
  { position: 6, address: "0xPQr6", username: "IndiaWheat",     countryCode: "IN", countryFlag: "🇮🇳", points: 2100, level: 6,  skin: "ruana_roja" },
  { position: 7, address: "0xSTu7", username: "MexMaizero",     countryCode: "MX", countryFlag: "🇲🇽", points: 1780, level: 5,  skin: "default" },
  { position: 8, address: "0xVWx8", username: "GhanaYuca",      countryCode: "GH", countryFlag: "🇬🇭", points: 1450, level: 4,  skin: "default" },
];

const MEDAL = ["🥇", "🥈", "🥉"];

interface Props {
  currentAddress?: string | null;
  currentPoints?: number;
  username?: string;
  countryFlag?: string;
}

export default function Ranking({ currentAddress, currentPoints, username, countryFlag }: Props) {
  const prizePool = usePrizePool();

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

      {currentAddress && (
        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-3">
          <p className="text-green-600 text-xs mb-1 font-medium">Tu posición</p>
          <div className="flex items-center justify-between">
            <span className="text-green-800 font-bold">
              #{MOCK_RANKING.length + 1} · {countryFlag} {username ?? "Tú"}
            </span>
            <span className="text-amber-600 font-mono font-bold">{currentPoints ?? 0} pts</span>
          </div>
          <div className="mt-2 bg-green-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, ((currentPoints ?? 0) / (MOCK_RANKING[0]?.points ?? 1)) * 100)}%` }} />
          </div>
        </div>
      )}

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
              <p className="text-green-900 font-semibold text-sm truncate">
                {entry.countryFlag} {entry.username}
              </p>
              <p className="text-green-500 text-xs">Nivel {entry.level}</p>
            </div>
            <div className="text-right">
              <p className="text-amber-600 font-bold font-mono">{entry.points.toLocaleString()}</p>
              <p className="text-gray-400 text-xs">pts</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
