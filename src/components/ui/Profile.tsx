"use client";
import { useEffect, useState } from "react";
import type { SkinId } from "@/types";
import type { SkinRow } from "@/lib/supabase";
import { getSkins, getPlayerSkins } from "@/lib/supabase";
import { GAME_CONFIG } from "@/lib/constants";

const flagUrl = (code: string) =>
  code === "OTHER" ? null : `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

interface Props {
  address: string;
  username: string;
  countryCode: string;
  points: number;
  level: number;
  skin: SkinId;
  usdcBalance: string;
  onChangeSkin: () => void;
}

export default function Profile({ address, username, countryCode, points, level, skin, usdcBalance, onChangeSkin }: Props) {
  const [allSkins, setAllSkins]       = useState<SkinRow[]>([]);
  const [ownedIds, setOwnedIds]       = useState<string[]>(["default"]);
  const flagSrc = flagUrl(countryCode);
  const usdt    = (points / GAME_CONFIG.POINTS_TO_USDT_RATE).toFixed(3);
  const base    = (level - 1) * 500;
  const next    = level * 500;
  const progress = Math.min(100, Math.max(0, ((points - base) / (next - base)) * 100));
  const activeSkin = allSkins.find((s) => s.id === skin);

  useEffect(() => {
    getSkins().then(setAllSkins);
    if (address) getPlayerSkins(address).then((ids) => setOwnedIds(["default", ...ids]));
  }, [address]);

  const ownedSkins = allSkins.filter((s) => ownedIds.includes(s.id));

  return (
    <div className="flex flex-col gap-4">

      <div className="bg-gradient-to-b from-amber-300 to-amber-500 rounded-3xl p-6 flex flex-col items-center shadow">
        <div className="text-2xl animate-sun mb-1">☀️</div>
        <div className="w-28 h-28 bg-white/30 rounded-full flex items-center justify-center text-7xl border-4 border-white/50 shadow-lg mb-3">
          {activeSkin?.emoji ?? "👨‍🌾"}
        </div>
        <p className="text-white font-bold text-lg drop-shadow">{username}</p>
        <p className="text-white/80 text-sm">{activeSkin?.name ?? "Classic Farmer"}</p>

        <div className="mt-2 flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full">
          {flagSrc
            ? <img src={flagSrc} alt={countryCode} className="w-5 h-3.5 object-cover rounded-sm" />
            : <span>🌍</span>}
          <span className="text-white text-sm">{countryCode}</span>
        </div>

        <p className="text-white/60 text-xs mt-1 font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </p>

        <button
          onClick={onChangeSkin}
          className="mt-4 bg-white/25 hover:bg-white/40 text-white text-sm px-5 py-2 rounded-full font-semibold border border-white/40 transition active:scale-95"
        >
          🎨 Cambiar skin
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Nivel",   value: level,                   color: "text-green-700", bg: "bg-green-50 border-green-200" },
          { label: "Puntos",  value: points.toLocaleString(), color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
          { label: "≈ USDC",  value: usdt,                    color: "text-lime-700",  bg: "bg-lime-50 border-lime-200"   },
          { label: "Balance", value: `${usdcBalance} USDC`,   color: "text-blue-700",  bg: "bg-blue-50 border-blue-200"   },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} border-2 rounded-2xl p-4 text-center`}>
            <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
            <p className={`${stat.color} font-bold text-2xl`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border-2 border-amber-200 rounded-2xl p-4">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Nivel {level}</span>
          <span>Nivel {level + 1}</span>
        </div>
        <div className="bg-gray-100 rounded-full h-3">
          <div className="bg-gradient-to-r from-green-400 to-lime-400 h-3 rounded-full transition-all duration-700"
               style={{ width: `${progress}%` }} />
        </div>
        <p className="text-gray-400 text-xs mt-2 text-center">
          {next - points > 0 ? `Faltan ${next - points} pts para nivel ${level + 1}` : "¡Nivel máximo!"}
        </p>
      </div>

      <div className="bg-white border-2 border-amber-200 rounded-2xl p-4">
        <p className="text-green-800 text-sm font-bold mb-3">🎨 Mis skins</p>
        <div className="flex gap-2 flex-wrap">
          {ownedSkins.map((s) => (
            <div key={s.id}
              className={`flex flex-col items-center p-2 rounded-xl border-2 min-w-[64px] ${
                s.id === skin ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-gray-50"
              }`}>
              <span className="text-3xl">{s.emoji}</span>
              <span className="text-gray-700 text-xs mt-1 text-center leading-tight">{s.name}</span>
              {s.id === skin && <span className="text-amber-500 text-xs font-bold mt-0.5">✓ activa</span>}
            </div>
          ))}
          <div className="flex flex-col items-center p-2 rounded-xl border-2 border-dashed border-gray-200 opacity-50 min-w-[64px]">
            <span className="text-3xl">🔒</span>
            <span className="text-gray-400 text-xs mt-1 text-center">Tienda</span>
          </div>
        </div>
      </div>
    </div>
  );
}
