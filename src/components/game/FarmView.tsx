"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { GAME_CONFIG } from "@/lib/constants";
import type { Plot, CropId } from "@/types";
import type { CropRow } from "@/lib/supabase";
import { usePaySeed } from "@/hooks/useContract";
import { getCrops, recordPurchase } from "@/lib/supabase";
import { useSound } from "@/hooks/useSound";

const sheetStyle: React.CSSProperties = {
  animation: "sheet-up 0.28s cubic-bezier(0.32, 0.72, 0, 1) both",
};
const overlayStyle: React.CSSProperties = {
  animation: "fade-in 0.2s ease both",
};

interface Props {
  onPointsEarned: (pts: number) => void;
  demoMode: boolean;
  walletAddress?: string | null;
  onPurchaseComplete?: () => void;
}

const PLOTS_KEY = "ag_plots";

function initPlots(): Plot[] {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(PLOTS_KEY);
      if (saved) return JSON.parse(saved) as Plot[];
    } catch { /* ignore */ }
  }
  return Array.from({ length: GAME_CONFIG.PLOTS_PER_PLAYER }, (_, i) => ({
    id: i,
    state: "empty" as const,
  }));
}

function savePlots(plots: Plot[]) {
  try { localStorage.setItem(PLOTS_KEY, JSON.stringify(plots)); } catch { /* ignore */ }
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

export default function FarmView({ onPointsEarned, demoMode, walletAddress, onPurchaseComplete }: Props) {
  const [plots, setPlots]       = useState<Plot[]>(initPlots());
  const [selected, setSelected] = useState<number | null>(null);
  const [premiumToast, setPremiumToast] = useState(false);
  const [crops, setCrops]       = useState<CropRow[]>([]);
  const plotsRef  = useRef(plots);
  const cropsRef  = useRef<Record<string, CropRow>>({});
  const { paySeed, status: txStatus, txHash, error: txError, reset: resetTx } = usePaySeed();
  const pendingPlant = useRef<{ plotId: number; cropId: CropId; hash?: string } | null>(null);
  const { play } = useSound();

  // Cargar catálogo de cultivos desde Supabase
  useEffect(() => {
    getCrops().then((data) => {
      setCrops(data);
      cropsRef.current = Object.fromEntries(data.map((c) => [c.id, c]));
    });
  }, []);

  // Timer de crecimiento
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

  // Cuando tx confirma → plantar localmente y registrar en Supabase
  useEffect(() => {
    if (txStatus === "success" && pendingPlant.current) {
      const { plotId, cropId, hash } = pendingPlant.current;
      const crop = cropsRef.current[cropId];
      play("coins");
      _plantLocal(plotId, cropId, true);
      if (walletAddress && crop && hash) {
        recordPurchase(walletAddress, cropId, hash, crop.seed_cost, crop.seed_cost_token).catch(console.warn);
      }
      pendingPlant.current = null;
      onPurchaseComplete?.();
      setPremiumToast(true);
      setTimeout(() => { setPremiumToast(false); resetTx(); }, 5000);
    }
  }, [txStatus, txHash, resetTx, walletAddress]);

  const _plantLocal = (plotId: number, cropId: CropId, premium: boolean) => {
    const crop = cropsRef.current[cropId];
    if (!crop) return;
    const growMs = premium
      ? crop.grow_time_hours_premium * 9 * 1000
      : crop.grow_time_hours * 36 * 1000;
    const now = Date.now();
    const updated = plotsRef.current.map((p) =>
      p.id === plotId
        ? { ...p, state: "planted" as const, cropId, plantedAt: now, readyAt: now + growMs, isPremium: premium }
        : p
    );
    plotsRef.current = updated;
    setPlots([...updated]);
    savePlots(updated);
    setSelected(null);
  };

  const plant = async (plotId: number, cropId: CropId, premium = false) => {
    const crop = cropsRef.current[cropId];
    if (!crop) return;
    if (!premium) {
      play("seed");
      _plantLocal(plotId, cropId, false);
      return;
    }
    if (demoMode) {
      _plantLocal(plotId, cropId, true);
      setPremiumToast(true);
      setTimeout(() => setPremiumToast(false), 2500);
      return;
    }
    pendingPlant.current = { plotId, cropId };
    setSelected(null);
    const hash = await paySeed(cropId, crop.seed_cost);
    if (pendingPlant.current) pendingPlant.current.hash = hash;
  };

  const harvest = (plotId: number) => {
    const plot = plotsRef.current[plotId];
    if (!plot?.cropId) return;
    const crop = cropsRef.current[plot.cropId];
    play("harvest");
    if (crop) onPointsEarned(plot.isPremium ? crop.points_reward_premium : crop.points_reward);
    const updated = plotsRef.current.map((p) =>
      p.id === plotId ? { id: plotId, state: "empty" as const } : p
    );
    plotsRef.current = updated;
    setPlots([...updated]);
    savePlots(updated);
  };

  return (
    <div className="flex flex-col gap-3">

      {(txStatus === "approving" || txStatus === "confirming") && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 mx-6 flex flex-col items-center gap-3 shadow-2xl">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-green-800 font-bold text-base text-center">
              {txStatus === "approving" ? "Aprobando USDC..." : "Confirmando siembra..."}
            </p>
            <p className="text-gray-400 text-xs text-center">No cierres la app</p>
          </div>
        </div>
      )}

      {txStatus === "success" && txHash && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-grow-pop w-72">
          <div className="bg-white border-2 border-green-400 rounded-2xl px-4 py-3 shadow-xl">
            <p className="text-green-700 font-bold text-sm">✅ Semilla premium activada</p>
          </div>
        </div>
      )}

      {txStatus === "error" && txError && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-grow-pop w-72">
          <div className="bg-white border-2 border-red-400 rounded-2xl px-4 py-3 shadow-xl">
            <p className="text-red-600 font-bold text-sm">❌ Error en la transacción</p>
            <p className="text-gray-500 text-xs mt-1 truncate">{txError}</p>
            <button onClick={resetTx} className="text-blue-500 text-xs mt-1 underline">Reintentar</button>
          </div>
        </div>
      )}

      {premiumToast && txStatus !== "success" && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 animate-grow-pop">
          ⭐ Semilla premium — crecimiento 4x más rápido!
        </div>
      )}

      <div className="rounded-2xl overflow-hidden border-2 border-amber-200 shadow w-full">
        <Image
          src="/assets/sprites/farm-background-eje-cafetero.png"
          alt="Mi finca"
          width={960}
          height={1120}
          className="w-full h-auto"
          priority
        />
      </div>

      {plots.map((plot) => {
        const crop     = plot.cropId ? cropsRef.current[plot.cropId] : null;
        const progress = pct(plot);
        const isReady  = plot.state === "ready";

        return (
          <div key={plot.id}
            className={`bg-white border-2 rounded-2xl p-4 shadow-sm transition-all ${
              isReady ? "border-yellow-400 bg-yellow-50" :
              plot.state !== "empty" ? "border-green-300" : "border-amber-200"
            }`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {plot.state === "empty"   ? "📍" :
                 plot.state === "planted" ? "🌱" :
                 plot.state === "ready"   ? "✨" :
                 crop?.emoji ?? "🌿"}
              </span>

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
                    ¡Lista para cosechar! +{plot.isPremium ? (crop?.points_reward_premium ?? crop?.points_reward) : crop?.points_reward} pts
                  </p>
                )}

                {plot.state === "empty" && (
                  <p className="text-gray-400 text-xs mt-0.5">Vacía · toca para sembrar</p>
                )}
              </div>

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
          </div>
        );
      })}

      {/* Modal catálogo de cultivos */}
      {selected !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center"
             onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/50" style={overlayStyle} />
          <div
            className="relative w-full max-w-[430px] bg-white rounded-t-3xl shadow-2xl flex flex-col"
            style={{ maxHeight: "80vh", ...sheetStyle }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-amber-100">
              <p className="text-green-800 font-bold text-base">🌱 ¿Qué cultivamos?</p>
              <button onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center">
                ✕
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-3 flex flex-col gap-4 pb-8">
              {crops.length === 0 && (
                <div className="flex items-center justify-center py-8 gap-2">
                  <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-green-600 text-sm">Cargando cultivos...</p>
                </div>
              )}
              {crops.map((c) => (
                <div key={c.id}>
                  <p className="text-xs text-gray-500 font-semibold mb-2 ml-1">
                    {c.emoji} {c.name}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => plant(selected, c.id, false)}
                      className="bg-white border-2 border-green-200 hover:border-green-400 rounded-xl p-3 text-center transition active:scale-95"
                    >
                      <div className="text-xl mb-1">🌱</div>
                      <div className="text-green-800 font-bold text-xs">Básica</div>
                      <div className="text-green-600 font-bold text-xs mt-0.5">Gratis</div>
                      <div className="text-gray-400 text-xs">{c.grow_time_hours}h · +{c.points_reward} pts</div>
                    </button>
                    {c.is_premium && (
                      <button
                        onClick={() => plant(selected, c.id, true)}
                        className="bg-amber-50 border-2 border-amber-400 hover:border-amber-500 rounded-xl p-3 text-center transition active:scale-95 relative overflow-hidden"
                      >
                        <span className="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          ⭐ PRO
                        </span>
                        <div className="text-xl mb-1">✨</div>
                        <div className="text-amber-800 font-bold text-xs">Premium</div>
                        <div className="text-amber-600 font-bold text-xs mt-0.5">
                          {c.seed_cost} {c.seed_cost_token}
                        </div>
                        <div className="text-amber-500 text-xs">
                          ⚡ {c.grow_time_hours_premium}h · +{c.points_reward_premium} pts
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
