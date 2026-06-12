"use client";
import { useEffect, useRef, useState } from "react";
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

export default function PhaserFarm({ zoneId, onPointsEarned }: Props) {
  const mountRef  = useRef<HTMLDivElement>(null);
  const gameRef   = useRef<any>(null);
  const plotsRef  = useRef<Plot[]>(initPlots());
  const [plots,   setPlots]   = useState<Plot[]>(initPlots());
  const [selected, setSelected] = useState<number | null>(null); // parcela seleccionada → mostrar menú
  const [plantAnim, setPlantAnim] = useState<number | null>(null); // parcela animando

  const zone = ZONES.find((z) => z.id === zoneId)!;

  // ── Inicializar Phaser ────────────────────────────────────────────────────
  useEffect(() => {
    let game: any;

    (async () => {
      if (gameRef.current || !mountRef.current) return;

      const Phaser = (await import("phaser")).default;
      const { FarmScene } = await import("@/game/scenes/FarmScene");

      game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 360,
        height: 420,
        parent: mountRef.current,
        backgroundColor: "#87ceeb",
        transparent: false,
        scene: [FarmScene],
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: 360,
          height: 420,
        },
        render: { antialias: true, pixelArt: false },
      });

      gameRef.current = game;

      // Arrancar la escena — pasamos los plots iniciales directamente
      game.events.once("ready", () => {
        const initialPlots = plotsRef.current;   // referencia estable al momento de arranque
        game.scene.start("FarmScene", {
          plots: initialPlots,
          onPlotClick: (id: number, state: string) => {
            if (state === "empty") setSelected(id);
          },
          onHarvest: (id: number, points: number) => {
            plotsRef.current = plotsRef.current.map((p) =>
              p.id === id ? { id, state: "empty" } : p
            );
            setPlots([...plotsRef.current]);
            onPointsEarned(points);
          },
        });

        // Sincronización inicial explícita una vez que la escena esté activa
        setTimeout(() => {
          const scene = game.scene.getScene("FarmScene") as any;
          scene?.updatePlots?.(plotsRef.current);
        }, 300);
      });
    })();

    return () => {
      if (game) { game.destroy(true); gameRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sincronizar plots con la escena Phaser (solo si la escena ya existe) ──
  useEffect(() => {
    const trySync = () => {
      const scene = gameRef.current?.scene?.getScene("FarmScene") as any;
      if (scene?.sys?.isActive()) {
        scene.updatePlots?.(plots);
      }
    };
    trySync();
  }, [plots]);

  // ── Tick de 1s para actualizar estados por tiempo ──────────────────────
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

  // ── Plantar cultivo ──────────────────────────────────────────────────────
  const plantCrop = (cropId: CropId) => {
    if (selected === null) return;
    const crop = CROPS[cropId];
    const growMs = crop.growTimeHours * 36 * 1000; // demo rápido
    const now = Date.now();

    const updated = plotsRef.current.map((p) =>
      p.id === selected
        ? { ...p, state: "planted" as const, cropId, plantedAt: now, readyAt: now + growMs }
        : p
    );
    plotsRef.current = updated;
    setPlots([...updated]);
    setPlantAnim(selected);
    setTimeout(() => setPlantAnim(null), 1800);

    // Notificar a Phaser
    const scene = gameRef.current?.scene?.getScene("FarmScene") as any;
    scene?.plantInPlot?.(selected);

    setSelected(null);
  };

  const availableCrops = [zone.primaryCrop, zone.secondaryCrop];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">

      {/* Canvas de Phaser — un solo contenedor, Phaser llena el canvas internamente */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-amber-200"
           style={{ height: 420 }}>
        <div ref={mountRef} className="absolute inset-0" />

        {/* Overlay: menú de selección de cultivo */}
        {selected !== null && (
          <div className="absolute inset-0 bg-black/40 flex items-end justify-center p-4 animate-grow-pop">
            <div className="w-full bg-white rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-green-800 font-bold">
                  🌱 Parcela {selected + 1} — ¿Qué sembramos?
                </p>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl w-7 h-7 flex items-center justify-center"
                >✕</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {availableCrops.map((cid) => {
                  const c = CROPS[cid];
                  return (
                    <button
                      key={cid}
                      onClick={() => plantCrop(cid)}
                      className="bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 hover:border-amber-400 rounded-xl p-3 text-center transition active:scale-95"
                    >
                      <div className="text-4xl mb-1">{c.emoji}</div>
                      <div className="text-green-900 font-bold text-sm">{c.name}</div>
                      <div className="text-lime-600 font-bold text-xs mt-0.5">+{c.pointsReward} pts</div>
                      <div className="text-amber-500 text-xs">{c.growTimeHours}h crecimiento</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Overlay: animación de siembra */}
        {plantAnim !== null && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 rounded-2xl px-6 py-4 text-center shadow-xl animate-grow-pop">
              <div className="text-5xl mb-1">🌱</div>
              <p className="text-green-700 font-bold text-base">¡Sembrando!</p>
              <p className="text-green-500 text-sm">El campesino está trabajando...</p>
            </div>
          </div>
        )}
      </div>

      {/* Panel de estado de las parcelas (debajo del mapa) */}
      <div className="flex flex-col gap-2">
        {plots.map((plot) => {
          const crop = plot.cropId ? CROPS[plot.cropId] : null;
          const progress = pct(plot);

          return (
            <div key={plot.id}
              className={`bg-white border-2 rounded-xl p-3 flex items-center gap-3 ${
                plot.state === "ready"   ? "border-yellow-400 bg-yellow-50" :
                plot.state === "growing" ? "border-green-300" :
                plot.state === "planted" ? "border-lime-300" :
                "border-gray-200"
              }`}
            >
              <span className="text-2xl">
                {plot.state === "empty"   ? "🟫" :
                 plot.state === "planted" ? "🌱" :
                 plot.state === "ready"   ? "✨" :
                 crop?.emoji ?? "🌿"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-green-900 font-semibold text-xs">
                  Parcela {plot.id + 1}
                  {crop && <span className="text-gray-500 font-normal"> · {crop.name}</span>}
                </p>
                {(plot.state === "planted" || plot.state === "growing") && (
                  <>
                    <div className="mt-1 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {plot.state === "planted" ? "Germinando" : "Creciendo"} · {plot.readyAt ? timeLeft(plot.readyAt) : ""}
                    </p>
                  </>
                )}
                {plot.state === "ready" && (
                  <p className="text-yellow-600 font-bold text-xs mt-0.5">
                    ¡Toca la parcela en el mapa para cosechar! +{crop?.pointsReward} pts
                  </p>
                )}
                {plot.state === "empty" && (
                  <p className="text-gray-400 text-xs mt-0.5">Toca en el mapa para sembrar</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
