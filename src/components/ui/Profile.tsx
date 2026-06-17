"use client";
import { useEffect, useState } from "react";
import type { SkinId } from "@/types";
import type { SkinRow } from "@/lib/supabase";
import { getSkins, getPlayerSkins } from "@/lib/supabase";

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
  onEquipSkin: (skinId: string) => void;
}

export default function Profile({ address, username, countryCode, points, level, skin, usdcBalance, onChangeSkin, onEquipSkin }: Props) {
  const [allSkins, setAllSkins]       = useState<SkinRow[]>([]);
  const [ownedIds, setOwnedIds]       = useState<string[]>(["default"]);
  const flagSrc = flagUrl(countryCode);
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

      <div className="rounded-2xl px-4 py-3.5 flex items-center gap-4" style={{ background: "linear-gradient(135deg, #15803d 0%, #b45309 100%)" }}>
        <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center text-4xl border-[3px] border-white/60 shrink-0">
          {activeSkin?.emoji ?? "👨‍🌾"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-white font-bold text-base leading-tight flex items-center gap-1">
              {username}
              <span className="text-white/50 text-[10px] font-mono">({address.slice(0, 6)}···{address.slice(-4)})</span>
            </p>
          </div>
          <p className="text-white/75 text-xs mt-0.5">{activeSkin?.name ?? "Classic Farmer"}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full">
              {flagSrc
                ? <img src={flagSrc} alt={countryCode} className="w-4 h-3 object-cover rounded-sm" />
                : <span className="text-xs">🌍</span>}
              <span className="text-white text-xs">{countryCode}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onChangeSkin}
          className="shrink-0 self-end mt-2 bg-white/20 hover:bg-white/35 text-white text-xs px-3.5 py-2 rounded-xl border border-white/30 transition active:scale-95 whitespace-nowrap"
        >
          🎨 Cambiar skin
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Nivel",   value: level,                   color: "text-green-700", bg: "bg-green-50 border-green-200" },
          { label: "Puntos",  value: points.toLocaleString(), color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
          { label: "Balance", value: `${usdcBalance}`,        color: "text-blue-700",  bg: "bg-blue-50 border-blue-200"   },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} border-2 rounded-2xl p-4 text-center`}>
            <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
            <p className={`${stat.color} font-bold text-xl`}>{stat.value}</p>
            {stat.label === "Balance" && <p className="text-blue-400 text-xs mt-0.5">USDC</p>}
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
            <button key={s.id}
              onClick={() => s.id !== skin && onEquipSkin(s.id)}
              className={`flex flex-col items-center p-2 rounded-xl border-2 min-w-[64px] transition active:scale-95 ${
                s.id === skin ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-gray-50 hover:border-green-300"
              }`}>
              <span className="text-3xl">{s.emoji}</span>
              <span className="text-gray-700 text-xs mt-1 text-center leading-tight">{s.name}</span>
              {s.id === skin
                ? <span className="text-amber-500 text-xs font-bold mt-0.5">✓ activa</span>
                : <span className="text-green-500 text-xs mt-0.5">Equipar</span>
              }
            </button>
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
