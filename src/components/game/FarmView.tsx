"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { CROPS, ZONES, GAME_CONFIG } from "@/lib/constants";
import type { Plot, ZoneId, CropId } from "@/types";

interface Props {
  zoneId: ZoneId;
  onPointsEarned: (pts: number) => void;
}

function initPlots(): Plot[] {
  return Array.from({ length: GAME_CONFIG.PLOTS_PER_PLAYER }, (_, i) => ({
    id: i,
    state: "empty" as const,
  }));
}

function pct(plot: Plot) {
  if (!plot.plantedAt || !plot.readyAt) return 0;
  return Math.min(100, ((Date.now() - plot.plantedAt) / (plot.readyAt - plot.plantedAt)) * 100);
}

function timeLeft(readyAt: number) {
  const d = readyAt - Date.now();
  if (d <= 0) return "¡Listo!";
  const m = Math.floor(d / 60000);
  const s = Math.floor((d % 60000) / 1000);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function FarmView({ zoneId, onPointsEarned }: Props) {
  const [plots, setPlots]       = useState<Plot[]>(initPlots());
  const [selected, setSelected] = useState<number | null>(null);
  const plotsRef                = useRef(plots);
  const zone = ZONES.find((z) => z.id === zoneId)!;

  // Tick 1s — actualizar estados por tiempo
  useEffect(() => {
    const id = setInterval(() => {
      const updated = plotsRef.current.map((p) => {
        if (p.state === "planted" || p.state === "growing") {
          const progress = pct(p);
          const ns = progress >= 100 ? "ready" : progress >= 30 ? "growing" : "planted";
          if (ns !== p.state) return { ...p, state: ns as Plot["state"] };
        }
        return p;
      });
      plotsRef.current = updated;
      setPlots([...updated]);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const [premiumToast, setPremiumToast] = useState(false);

  const plant = (plotId: number, cropId: CropId, premium = false) => {
    const crop   = CROPS[cropId];
    // Premium: 4x más rápido, básica: tiempo normal (en demo ambos acelerados x100)
    const growMs = premium
      ? crop.growTimeHours * 9 * 1000    // 4x más rápido
      : crop.growTimeHours * 36 * 1000;
    const now = Date.now();
    const updated = plotsRef.current.map((p) =>
      p.id === plotId
        ? { ...p, state: "planted" as const, cropId, plantedAt: now, readyAt: now + growMs }
        : p
    );
    plotsRef.current = updated;
    setPlots([...updated]);
    setSelected(null);
    // Toast de confirmación solo en premium
    if (premium) {
      setPremiumToast(true);
      setTimeout(() => setPremiumToast(false), 2500);
    }
  };

  const harvest = (plotId: number) => {
    const plot = plotsRef.current[plotId];
    if (!plot?.cropId) return;
    onPointsEarned(CROPS[plot.cropId].pointsReward);
    const updated = plotsRef.current.map((p) =>
      p.id === plotId ? { id: plotId, state: "empty" as const } : p
    );
    plotsRef.current = updated;
    setPlots([...updated]);
  };

  const availableCrops = [zone.primaryCrop, zone.secondaryCrop];

  return (
    <div className="flex flex-col gap-3">

      {/* Toast premium */}
      {premiumToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 animate-grow-pop">
          ⭐ Semilla premium activada — crecimiento 4x más rápido!
        </div>
      )}

      {/* ── Fondo de la finca a full width ── */}
      <div className="rounded-2xl overflow-hidden border-2 border-amber-200 shadow w-full">
        <Image
          src={`/assets/sprites/farm-background-${zoneId.replace("_", "-")}.png`}
          alt="Finca AgroVerse"
          width={960}
          height={1120}
          className="w-full h-auto"
          priority
        />
      </div>

      {/* ── Parcelas ── */}
      {plots.map((plot) => {
        const crop     = plot.cropId ? CROPS[plot.cropId] : null;
        const progress = pct(plot);
        const isReady  = plot.state === "ready";

        return (
          <div key={plot.id}
            className={`bg-white border-2 rounded-2xl p-4 shadow-sm transition-all ${
              isReady ? "border-yellow-400 bg-yellow-50" :
              plot.state !== "empty" ? "border-green-300" : "border-amber-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Ícono */}
              <span className="text-3xl">
                {plot.state === "empty"   ? "📍" :
                 plot.state === "planted" ? "🌱" :
                 plot.state === "ready"   ? "✨" :
                 crop?.emoji ?? "🌿"}
              </span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-green-900 font-bold text-sm">
                  Parcela {plot.id + 1}
                  {crop && <span className="text-gray-500 font-normal"> · {crop.name}</span>}
                </p>

                {(plot.state === "planted" || plot.state === "growing") && (
                  <>
                    <div className="mt-1.5 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-lime-400 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      {plot.state === "planted" ? "Germinando" : "Creciendo"} · {plot.readyAt ? timeLeft(plot.readyAt) : ""}
                    </p>
                  </>
                )}

                {isReady && (
                  <p className="text-yellow-600 font-bold text-xs mt-0.5">
                    ¡Lista para cosechar! +{crop?.pointsReward} pts
                  </p>
                )}

                {plot.state === "empty" && (
                  <p className="text-gray-400 text-xs mt-0.5">Vacía · toca para sembrar</p>
                )}
              </div>

              {/* Botón */}
              {plot.state === "empty" && (
                <button
                  onClick={() => setSelected(plot.id === selected ? null : plot.id)}
                  className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition active:scale-95"
                >
                  🌱 Sembrar
                </button>
              )}
              {isReady && (
                <button
                  onClick={() => harvest(plot.id)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-white text-xs font-bold px-3 py-2 rounded-xl transition active:scale-95"
                >
                  ✂️ Cosechar
                </button>
              )}
            </div>

            {/* Menú de siembra */}
            {selected === plot.id && plot.state === "empty" && (
              <div className="mt-3 pt-3 border-t border-amber-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-green-800 font-semibold text-sm">¿Qué sembramos?</p>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
                </div>
                {availableCrops.map((cid) => {
                  const c = CROPS[cid];
                  return (
                    <div key={cid} className="mb-3">
                      {/* Etiqueta del cultivo */}
                      <p className="text-xs text-gray-500 font-semibold mb-1.5 ml-1">
                        {c.emoji} {c.name}
                      </p>
                      <div className="grid grid-cols-2 gap-2">

                        {/* Semilla básica — gratis */}
                        <button
                          onClick={() => plant(plot.id, cid, false)}
                          className="bg-white border-2 border-green-200 hover:border-green-400 rounded-xl p-3 text-center transition active:scale-95"
                        >
                          <div className="text-xl mb-1">🌱</div>
                          <div className="text-green-800 font-bold text-xs">Básica</div>
                          <div className="text-green-600 font-bold text-xs mt-0.5">Gratis</div>
                          <div className="text-gray-400 text-xs">{c.growTimeHours}h · +{c.pointsReward} pts</div>
                        </button>

                        {/* Semilla premium — USDT */}
                        <button
                          onClick={() => plant(plot.id, cid, true)}
                          className="bg-amber-50 border-2 border-amber-400 hover:border-amber-500 rounded-xl p-3 text-center transition active:scale-95 relative overflow-hidden"
                        >
                          {/* Badge */}
                          <span className="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            ⭐ PRO
                          </span>
                          <div className="text-xl mb-1">✨</div>
                          <div className="text-amber-800 font-bold text-xs">Premium</div>
                          <div className="text-amber-600 font-bold text-xs mt-0.5">{c.seedCostUSDT} USDT</div>
                          <div className="text-amber-500 text-xs">
                            ⚡ {Math.floor(c.growTimeHours / 4)}h · +{Math.floor(c.pointsReward * 1.6)} pts
                          </div>
                        </button>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
