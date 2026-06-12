"use client";
import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import OnboardingSlider from "@/components/ui/OnboardingSlider";
import UserSetup from "@/components/ui/UserSetup";
import Ranking from "@/components/ui/Ranking";
import Marketplace from "@/components/ui/Marketplace";
import Profile from "@/components/ui/Profile";
import FarmView from "@/components/game/FarmView";
import { COUNTRIES } from "@/lib/constants";
import type { SkinId } from "@/types";

type Tab = "farm" | "profile" | "ranking" | "shop";

const DEMO_WALLET = {
  address: "0xDemo1234...5678",
  usdtBalance: "5.00",
  usdmBalance: "2.50",
  isConnected: true,
  isMiniPayEnv: false,
  isLoading: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
  fetchBalances: async () => {},
};

export default function GameApp() {
  const walletReal = useWallet();
  const [demoMode, setDemoMode] = useState(false);
  const wallet = demoMode ? DEMO_WALLET : walletReal;

  const [onboarded, setOnboarded]   = useState(false);
  const [username, setUsername]     = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<string>("CO");
  const [points, setPoints]         = useState(0);
  const [level, setLevel]           = useState(1);
  const [skin, setSkin]             = useState<SkinId>("default");
  const [tab, setTab]               = useState<Tab>("farm");
  const [toast, setToast]           = useState<string | null>(null);

  // 1. Onboarding
  if (!onboarded) {
    return <OnboardingSlider onFinish={() => setOnboarded(true)} />;
  }

  // 2. Sin wallet — pantalla de conexión
  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
           style={{ background: "linear-gradient(180deg, #87ceeb 0%, #e8f5e9 40%, #fff8e1 100%)" }}>
        <div className="text-5xl mb-1 animate-float">☁️</div>
        <img src="/assets/logo.png" alt="AgroVerse" className="w-24 h-24 rounded-2xl shadow-xl mb-4 animate-float" />
        <h1 className="text-3xl font-bold text-green-800 mb-1">AgroVerse</h1>
        <p className="text-green-600 text-sm mb-1">Season 1 · Global</p>
        <p className="text-green-700/80 text-sm mb-8 max-w-xs">
          Cultiva desde tu país y compite con agricultores de todo el mundo. Gana USDT real.
        </p>
        <div className="w-full max-w-xs flex flex-col gap-3">
          {!wallet.isMiniPayEnv && (
            <button onClick={wallet.connect} disabled={wallet.isLoading}
              className="w-full bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-2xl font-bold text-base shadow transition disabled:opacity-50">
              {wallet.isLoading ? "Conectando..." : "🔗 Conectar Wallet"}
            </button>
          )}
          {wallet.isMiniPayEnv && (
            <p className="text-green-600 text-sm animate-pulse">Conectando con MiniPay...</p>
          )}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-green-200" />
            <span className="text-green-400 text-xs">o</span>
            <div className="flex-1 h-px bg-green-200" />
          </div>
          <button onClick={() => setDemoMode(true)}
            className="w-full bg-white hover:bg-amber-50 border-2 border-amber-300 text-amber-700 px-8 py-3 rounded-2xl font-semibold text-base shadow transition">
            🎮 Explorar en modo demo
          </button>
          <p className="text-green-400 text-xs">Sin wallet · Sin transacciones</p>
        </div>
        {wallet.error && <p className="text-red-500 text-sm mt-3">{wallet.error}</p>}
      </div>
    );
  }

  // 3. Setup de usuario (nombre + país)
  if (!username) {
    return (
      <UserSetup
        onDone={(u, cc) => {
          setUsername(u);
          setCountryCode(cc);
        }}
      />
    );
  }

  // 4. Juego principal
  const countryFlag = COUNTRIES.find((c) => c.code === countryCode)?.flag ?? "🌍";

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handlePointsEarned = (earned: number) => {
    setPoints((prev) => {
      const next = prev + earned;
      const newLevel = Math.floor(next / 500) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        showToast(`🎉 ¡Subiste al nivel ${newLevel}!`);
      } else {
        showToast(`+${earned} pts cosechados ✅`);
      }
      return next;
    });
  };

  const handleBuySkin = (skinId: SkinId) => {
    setSkin(skinId);
    showToast("🎨 ¡Skin equipada!");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#fef9f0" }}>

      {/* Barra superior fija */}
      <div className="fixed top-0 left-0 right-0 z-40 shadow-md">
        <div className="flex items-center bg-green-700 px-4 py-2.5 gap-2">
          {/* Logo + nombre — lado izquierdo */}
          <img src="/assets/logo.png" alt="AgroVerse" className="w-7 h-7 rounded-lg shrink-0" />
          <span className="font-bold text-white text-sm shrink-0">AgroVerse</span>

          <div className="flex-1" />

          {/* Puntos */}
          <div className="flex items-center gap-1 bg-green-800/60 px-2.5 py-1 rounded-full shrink-0">
            <span className="text-yellow-300 font-bold text-xs font-mono">⭐ {points.toLocaleString()}</span>
            <span className="text-green-300 text-xs">pts</span>
          </div>

          {/* Usuario — truncado si es largo */}
          <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full max-w-[110px] truncate shrink-0">
            {countryFlag} {username}
          </span>
        </div>
        {demoMode && (
          <div className="bg-amber-100 border-b border-amber-300 text-amber-700 text-xs text-center py-1.5 px-4">
            🎮 Modo demo — sin transacciones reales.{" "}
            <button onClick={() => { setDemoMode(false); setUsername(null); }} className="underline font-semibold">
              Salir
            </button>
          </div>
        )}
      </div>

      <div style={{ height: demoMode ? 76 : 54 }} />

      {toast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg animate-grow-pop">
          {toast}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {tab === "farm"    && <FarmView onPointsEarned={handlePointsEarned} />}
        {tab === "profile" && (
          <Profile
            address={wallet.address ?? "0x0000"}
            username={username}
            countryCode={countryCode}
            points={points}
            level={level}
            skin={skin}
            usdtBalance={wallet.usdtBalance}
            onChangeSkin={() => setTab("shop")}
          />
        )}
        {tab === "ranking" && (
          <Ranking
            currentAddress={wallet.address}
            currentPoints={points}
            username={username}
            countryFlag={countryFlag}
          />
        )}
        {tab === "shop" && <Marketplace currentSkin={skin} onBuy={handleBuySkin} usdtBalance={wallet.usdtBalance} />}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-amber-200 flex shadow-lg">
        {(
          [
            { id: "farm",    emoji: "🌾", label: "Mi Finca" },
            { id: "profile", emoji: "🧑‍🌾", label: "Perfil" },
            { id: "ranking", emoji: "🏆", label: "Ranking" },
            { id: "shop",    emoji: "🛍️",  label: "Tienda" },
          ] as { id: Tab; emoji: string; label: string }[]
        ).map((item) => (
          <button key={item.id} onClick={() => setTab(item.id)}
            className={`flex-1 flex flex-col items-center py-2.5 text-xs font-semibold transition ${
              tab === item.id
                ? "text-green-700 border-t-2 border-green-500 -mt-0.5 bg-green-50"
                : "text-amber-400 hover:text-amber-600"
            }`}>
            <span className="text-xl mb-0.5">{item.emoji}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
