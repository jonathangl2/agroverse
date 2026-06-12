"use client";
import { useState, useEffect, useRef } from "react";
import { CROPS, ZONES, GAME_CONFIG } from "@/lib/constants";
import type { Plot, ZoneId, CropId } from "@/types";

interface Props {
  zoneId: ZoneId;
  onPointsEarned: (points: number) => void;
}

function getInitialPlots(): Plot[] {
  return Array.from({ length: GAME_CONFIG.PLOTS_PER_PLAYER }, (_, i) => ({
    id: i,
    state: "empty" as const,
  }));
}

function getTimeLeft(readyAt: number): string {
  const diff = readyAt - Date.now();
  if (diff <= 0) return "¡Listo!";
  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getProgressPct(plot: Plot): number {
  if (!plot.plantedAt || !plot.readyAt) return 0;
  return Math.min(100, ((Date.now() - plot.plantedAt) / (plot.readyAt - plot.plantedAt)) * 100);
}

// Frases del campesino según estado
const FARMER_MESSAGES: Record<string, string[]> = {
  planted: ["¡Sembrando con amor! 🌱", "¡A trabajar la tierra! ⛏️", "¡Esta cosecha será increíble! 🤩"],
  growing: ["¡Mirá cómo crece! 🌿", "¡El campo habla solo! 🌤️", "¡Va tomando forma! 💪"],
  ready:   ["¡Listo pa' cosechar! 🎉", "¡Está en su punto! ✨", "¡Qué cosecha tan bella! 🌟"],
};

function randomMsg(state: string) {
  const msgs = FARMER_MESSAGES[state] ?? [];
  return msgs[Math.floor(Math.random() * msgs.length)] ?? "";
}

export default function FarmGrid({ zoneId, onPointsEarned }: Props) {
  const [plots, setPlots] = useState<Plot[]>(getInitialPlots());
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null);
  const [activePlot, setActivePlot] = useState<number | null>(null); // parcela animándose
  const [activeMsg, setActiveMsg] = useState<string>("");
  const [tick, setTick] = useState(0);
  const animTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const zone = ZONES.find((z) => z.id === zoneId)!;

  // Tick cada segundo
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Actualizar estados por tiempo
  useEffect(() => {
    setPlots((prev) =>
      prev.map((plot) => {
        if (plot.state === "planted" || plot.state === "growing") {
          const pct = getProgressPct(plot);
          const newState = pct >= 100 ? "ready" : pct >= 30 ? "growing" : "planted";
          if (newState !== plot.state) return { ...plot, state: newState };
        }
        return plot;
      })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  // Mostrar animación del avatar en una parcela por unos segundos
  const showPlotAnim = (plotId: number, state: string) => {
    if (animTimeout.current) clearTimeout(animTimeout.current);
    setActivePlot(plotId);
    setActiveMsg(randomMsg(state));
    animTimeout.current = setTimeout(() => setActivePlot(null), 3000);
  };

  const handlePlotClick = (plotId: number) => {
    const plot = plots[plotId];
    if (plot.state === "ready" && plot.cropId) {
      const crop = CROPS[plot.cropId];
      onPointsEarned(crop.pointsReward);
      showPlotAnim(plotId, "ready");
      setPlots((prev) =>
        prev.map((p) => (p.id === plotId ? { id: plotId, state: "empty" } : p))
      );
      setSelectedPlot(null);
      return;
    }
    if (plot.state === "empty") {
      setSelectedPlot(plotId === selectedPlot ? null : plotId);
    }
  };

  const plantCrop = (cropId: CropId) => {
    if (selectedPlot === null) return;
    const crop = CROPS[cropId];
    const growMs = crop.growTimeHours * 36 * 1000;
    const now = Date.now();
    setPlots((prev) =>
      prev.map((p) =>
        p.id === selectedPlot
          ? { ...p, state: "planted", cropId, plantedAt: now, readyAt: now + growMs }
          : p
      )
    );
    showPlotAnim(selectedPlot, "planted");
    setSelectedPlot(null);
  };

  const availableCrops = [zone.primaryCrop, zone.secondaryCrop];

  // Configuración visual por estado
  const PLOT_STYLES: Record<string, { bg: string; border: string; soil: string }> = {
    empty:   { bg: "bg-amber-50",   border: "border-amber-200",  soil: "bg-amber-100" },
    planted: { bg: "bg-lime-50",    border: "border-lime-300",   soil: "bg-lime-100" },
    growing: { bg: "bg-green-50",   border: "border-green-400",  soil: "bg-green-100" },
    ready:   { bg: "bg-yellow-50",  border: "border-yellow-400", soil: "bg-yellow-100" },
  };

  return (
    <div className="flex flex-col gap-3">

      {/* Header zona — claro y cálido */}
      <div className="bg-amber-100 border border-amber-200 rounded-2xl p-3 flex items-center gap-3">
        <span className="text-3xl animate-float">{zone.emoji}</span>
        <div>
          <p className="text-amber-900 font-bold text-sm">{zone.name}</p>
          <p className="text-amber-600 text-xs">{zone.region}</p>
        </div>
        {/* Solcito decorativo */}
        <span className="ml-auto text-2xl animate-sun">☀️</span>
      </div>

      {/* Parcelas — columna vertical */}
      <div className="flex flex-col gap-3">
        {plots.map((plot) => {
          const style = PLOT_STYLES[plot.state];
          const isSelected = selectedPlot === plot.id;
          const isAnimating = activePlot === plot.id;
          const crop = plot.cropId ? CROPS[plot.cropId] : null;
          const pct = getProgressPct(plot);

          return (
            <div key={plot.id} className="flex flex-col gap-2">
              <button
                onClick={() => handlePlotClick(plot.id)}
                className={`
                  w-full rounded-2xl border-2 p-4 transition-all active:scale-98
                  ${style.bg} ${style.border}
                  ${isSelected ? "ring-2 ring-amber-400 ring-offset-2" : ""}
                  ${plot.state === "ready" ? "animate-harvest" : ""}
                `}
              >
                <div className="flex items-center gap-4">

                  {/* Zona de tierra + cultivo */}
                  <div className={`w-16 h-16 ${style.soil} rounded-xl flex flex-col items-center justify-center flex-shrink-0 relative overflow-hidden border border-amber-200`}>
                    {/* Patrón de tierra */}
                    {plot.state === "empty" && (
                      <span className="text-3xl">🟫</span>
                    )}
                    {plot.state === "planted" && (
                      <span className="text-3xl animate-grow-pop">🌱</span>
                    )}
                    {plot.state === "growing" && crop && (
                      <span className="text-3xl animate-float">{crop.emoji}</span>
                    )}
                    {plot.state === "ready" && crop && (
                      <div className="flex flex-col items-center">
                        <span className="text-3xl">{crop.emoji}</span>
                        <span className="text-xs text-yellow-600 font-bold">✨</span>
                      </div>
                    )}
                  </div>

                  {/* Info de la parcela */}
                  <div className="flex-1 text-left">
                    <p className="text-amber-900 font-semibold text-sm">
                      Parcela {plot.id + 1}
                      {plot.state === "empty" && (
                        <span className="text-amber-400 font-normal"> · Vacía</span>
                      )}
                    </p>

                    {crop && (
                      <p className="text-amber-700 text-xs mt-0.5">{crop.name}</p>
                    )}

                    {/* Barra de progreso */}
                    {(plot.state === "planted" || plot.state === "growing") && (
                      <div className="mt-2">
                        <div className="bg-amber-200 rounded-full h-2 w-full">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-amber-600 text-xs mt-1">
                          {plot.state === "planted" ? "Germinando..." : "Creciendo..."} · {plot.readyAt ? getTimeLeft(plot.readyAt) : ""}
                        </p>
                      </div>
                    )}

                    {plot.state === "ready" && crop && (
                      <p className="text-yellow-600 font-bold text-sm mt-1">
                        ¡Toca para cosechar! +{crop.pointsReward} pts
                      </p>
                    )}

                    {plot.state === "empty" && (
                      <p className="text-amber-400 text-xs mt-1">
                        Toca para plantar
                      </p>
                    )}
                  </div>
                </div>
              </button>

              {/* Burbuja del avatar — aparece al plantar/cosechar */}
              {isAnimating && (
                <div className="flex items-start gap-2 px-2 animate-grow-pop">
                  <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center text-xl flex-shrink-0 border-2 border-amber-300">
                    👨‍🌾
                  </div>
                  <div className="bg-white border border-amber-200 rounded-2xl rounded-tl-none px-3 py-2 shadow-sm">
                    <p className="text-amber-800 text-xs font-medium">{activeMsg}</p>
                  </div>
                </div>
              )}

              {/* Panel selector de cultivo — se abre debajo de la parcela seleccionada */}
              {isSelected && plot.state === "empty" && (
                <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-amber-900 font-semibold text-sm">¿Qué sembramos?</p>
                    <button
                      onClick={() => setSelectedPlot(null)}
                      className="text-amber-400 hover:text-amber-600 text-lg leading-none w-6 h-6 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {availableCrops.map((cropId) => {
                      const c = CROPS[cropId];
                      return (
                        <button
                          key={cropId}
                          onClick={() => plantCrop(cropId)}
                          className="bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl p-3 text-center transition active:scale-95"
                        >
                          <div className="text-3xl mb-1">{c.emoji}</div>
                          <div className="text-amber-900 text-sm font-semibold">{c.name}</div>
                          <div className="text-green-600 text-xs font-bold mt-0.5">+{c.pointsReward} pts</div>
                          <div className="text-amber-400 text-xs">{c.growTimeHours}h</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
