"use client";
import { useRef, useCallback } from "react";

type SoundName = "coins" | "harvest" | "levelup" | "seed" | "ambient";

const VOLUMES: Record<SoundName, number> = {
  coins:   0.6,
  harvest: 0.7,
  levelup: 0.8,
  seed:    0.5,
  ambient: 0.12,
};

const cache: Partial<Record<SoundName, HTMLAudioElement>> = {};

function getAudio(name: SoundName): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!cache[name]) {
    const audio = new Audio(`/sounds/${name}.wav`);
    audio.preload = "auto";
    audio.volume = VOLUMES[name];
    if (name === "ambient") audio.loop = true;
    // Warm-up: decodifica el audio sin reproducirlo para eliminar el delay inicial
    audio.load();
    cache[name] = audio;
  }
  return cache[name]!;
}

// Precarga todos los sonidos en cuanto el módulo se importa (client-side)
if (typeof window !== "undefined") {
  (["coins", "harvest", "levelup", "seed", "ambient"] as SoundName[]).forEach(getAudio);
}

export function useSound() {
  const ambientRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((name: SoundName) => {
    try {
      const audio = getAudio(name);
      if (!audio) return;
      // Reinicia si ya estaba sonando (excepto ambient)
      if (name !== "ambient") {
        audio.currentTime = 0;
      }
      audio.play().catch(() => { /* bloqueado por browser o dispositivo en silencio */ });
    } catch { /* silencioso */ }
  }, []);

  const startAmbient = useCallback(() => {
    try {
      const audio = getAudio("ambient");
      if (!audio) return;
      ambientRef.current = audio;
      audio.play().catch(() => {});
    } catch {}
  }, []);

  const stopAmbient = useCallback(() => {
    try {
      const audio = ambientRef.current ?? getAudio("ambient");
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
    } catch {}
  }, []);

  return { play, startAmbient, stopAmbient };
}
