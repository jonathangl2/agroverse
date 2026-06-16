"use client";
import { useState } from "react";

interface Props {
  onFinish: () => void;
}

const SLIDES = [
  {
    emoji:    "🌾",
    title:    "Cultiva desde tu país",
    subtitle: "Siembra los cultivos más importantes del mundo. Cuida tus parcelas y cosecha cada día desde cualquier lugar.",
    accent:   "#4caf50",
    gradient: "from-green-900/80 via-green-800/60 to-transparent",
  },
  {
    emoji:    "🏆",
    title:    "Compite con el mundo",
    subtitle: "Sube posiciones en el ranking global. Agricultores de África, América y Asia compiten por premios reales cada mes.",
    accent:   "#f59e0b",
    gradient: "from-amber-900/80 via-amber-800/60 to-transparent",
  },
  {
    emoji:    "💵",
    title:    "Gana USDC real",
    subtitle: "Cada cosecha suma puntos convertibles en USDC. Retira tus ganancias directo a tu wallet, sin intermediarios.",
    accent:   "#10b981",
    gradient: "from-emerald-900/80 via-emerald-800/60 to-transparent",
  },
];

export default function OnboardingSlider({ onFinish }: Props) {
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState(false);

  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) { onFinish(); return; }
    setExiting(true);
    setTimeout(() => { setCurrent((c) => c + 1); setExiting(false); }, 220);
  };

  const goTo = (i: number) => {
    if (i === current) return;
    setExiting(true);
    setTimeout(() => { setCurrent(i); setExiting(false); }, 220);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden select-none"
         style={{ colorScheme: "light" }}>

      <img
        src="/assets/sprites/farm-background.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-top"
        style={{ filter: "brightness(0.55) saturate(1.2)" }}
      />

      <div className={`absolute inset-0 bg-gradient-to-t ${slide.gradient} transition-all duration-500`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

      <div className={`relative z-10 flex flex-col min-h-screen px-6 transition-all duration-220
        ${exiting ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}`}>

        <div className="flex items-center justify-between pt-12 pb-4">
          <div className="flex items-center gap-2">
            <img src="/assets/logo.png" alt="AgroVerse" className="w-9 h-9" />
            <span className="text-white font-bold text-lg tracking-tight drop-shadow">AgroVerse</span>
          </div>
          {!isLast && (
            <button onClick={onFinish} className="text-white/60 text-sm font-medium hover:text-white/90 transition">
              Saltar →
            </button>
          )}
        </div>

        <div className="flex-1" />

        <div className="flex flex-col items-center text-center mb-8">
          <span className="text-xs font-bold px-3 py-1 rounded-full mb-6 tracking-wider uppercase"
            style={{ background: `${slide.accent}33`, color: slide.accent, border: `1px solid ${slide.accent}55` }}>
            {current + 1} de {SLIDES.length}
          </span>

          <div className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl mb-6 shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${slide.accent}22, ${slide.accent}44)`,
              border: `2px solid ${slide.accent}66`,
              boxShadow: `0 0 40px ${slide.accent}44`,
            }}>
            {slide.emoji}
          </div>

          <h2 className="text-white font-bold text-3xl mb-3 leading-tight drop-shadow-lg">
            {slide.title}
          </h2>
          <p className="text-white/80 text-base leading-relaxed max-w-xs drop-shadow">
            {slide.subtitle}
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width:  i === current ? 28 : 8,
                height: 8,
                background: i === current ? slide.accent : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>

        <button onClick={goNext}
          className="w-full py-4 rounded-2xl font-bold text-lg shadow-xl mb-4 transition-all active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}cc)`,
            color: "white",
            boxShadow: `0 8px 32px ${slide.accent}55`,
          }}>
          {isLast ? "🚀 Empezar a cultivar" : "Siguiente →"}
        </button>

        <div className="h-6" />
      </div>
    </div>
  );
}
