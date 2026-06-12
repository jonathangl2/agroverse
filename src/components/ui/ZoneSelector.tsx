"use client";
import { ZONES } from "@/lib/constants";
import type { ZoneId } from "@/types";

interface Props { onSelect: (zoneId: ZoneId) => void; }

export default function ZoneSelector({ onSelect }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
         style={{ background: "linear-gradient(180deg, #87ceeb 0%, #e8f5e9 50%, #fff8e1 100%)" }}>
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🗺️</div>
        <h1 className="text-2xl font-bold text-green-800">Elige tu región</h1>
        <p className="text-green-600 text-sm mt-1">Colombia · Season 1</p>
        <p className="text-green-700/70 text-sm mt-1">Cada zona tiene cultivos y clima únicos</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {ZONES.map((zone) => (
          <button
            key={zone.id}
            onClick={() => onSelect(zone.id)}
            className="w-full bg-white hover:bg-amber-50 border-2 border-amber-200 hover:border-amber-400 rounded-2xl p-4 text-left shadow transition-all active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 bg-amber-50 border border-amber-200">
                {zone.emoji}
              </div>
              <div className="flex-1">
                <p className="text-green-900 font-bold">{zone.name}</p>
                <p className="text-green-600 text-xs">{zone.region}</p>
                <p className="text-green-700/70 text-xs mt-0.5 leading-tight">{zone.description}</p>
              </div>
              <span className="text-amber-400 text-xl">›</span>
            </div>
            <div className="flex gap-2 mt-2 ml-[68px]">
              {[zone.primaryCrop, zone.secondaryCrop].map((cropId) => (
                <span key={cropId} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-200">
                  {cropId === "cafe" ? "☕ Café" : cropId === "platano" ? "🍌 Plátano" :
                   cropId === "flores" ? "🌸 Flores" : cropId === "papa" ? "🥔 Papa" :
                   cropId === "cana" ? "🎋 Caña" : "🍫 Cacao"}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
      <p className="text-green-500 text-xs mt-5">Más regiones próximamente 🌎</p>
    </div>
  );
}
