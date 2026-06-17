"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import OnboardingSlider from "@/components/ui/OnboardingSlider";
import UserSetup from "@/components/ui/UserSetup";
import Ranking from "@/components/ui/Ranking";
import Marketplace from "@/components/ui/Marketplace";
import Profile from "@/components/ui/Profile";
import FarmView from "@/components/game/FarmView";
import type { SkinId } from "@/types";

const flagUrl = (code: string) =>
  code === "OTHER" ? null : `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
import { getPlayer, upsertPlayer, updatePoints } from "@/lib/supabase";

type Tab = "farm" | "profile" | "ranking" | "shop";

export default function GameApp() {
  const walletReal = useWallet();

  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    setOnboarded(localStorage.getItem("ag_onboarded") === "1");
  }, []);

  const [username, setUsername]       = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<string>("CO");
  const [points, setPoints]           = useState(0);
  const [level, setLevel]             = useState(1);
  const [skin, setSkin]               = useState<SkinId>("default");
  const [tab, setTab]                 = useState<Tab>("farm");
  const [toast, setToast]             = useState<{ msg: string; type: "points" | "level" | "skin" } | null>(null);

  // Fix 2: loading mientras validamos perfil en Supabase
  const [loadingProfile, setLoadingProfile] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Fix 1: guardar onboarded en localStorage
  const handleOnboarded = () => {
    localStorage.setItem("ag_onboarded", "1");
    setOnboarded(true);
  };

  // Fix 2 + cargar perfil existente de Supabase al conectar wallet
  useEffect(() => {
    if (!walletReal.address || username) return;
    setLoadingProfile(true);
    getPlayer(walletReal.address).then((p) => {
      if (p) {
        setUsername(p.username);
        setCountryCode(p.country_code);
        setPoints(p.points);
        setLevel(p.level);
        setSkin(p.skin as SkinId);
      }
    }).finally(() => setLoadingProfile(false));
  }, [walletReal.address, username]);

  const switchTab = useCallback((t: Tab) => {
    setTab(t);
    scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // 1. Aún leyendo localStorage — no renderizar nada para evitar flash
  if (onboarded === null) return null;

  // 2. Primera vez — mostrar tutorial
  if (!onboarded) {
    return <OnboardingSlider onFinish={handleOnboarded} />;
  }

  // 3. Sin wallet — pantalla de conexión
  if (!walletReal.isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
           style={{ background: "linear-gradient(180deg, #87ceeb 0%, #e8f5e9 40%, #fff8e1 100%)" }}>
        <div className="text-5xl mb-1 animate-float">☁️</div>
        <img src="/assets/logo.png" alt="AgroVerse" className="w-24 h-24 mb-4 animate-float" />
        <h1 className="text-3xl font-bold text-green-800 mb-1">AgroVerse</h1>
        <p className="text-green-600 text-sm mb-1">Season 1 · Global</p>
        <p className="text-green-700/80 text-sm mb-8 max-w-xs">
          Cultiva desde tu país y compite con agricultores de todo el mundo. Gana USDC real.
        </p>
        <div className="w-full max-w-xs flex flex-col gap-3">
          {!walletReal.isMiniPayEnv && (
            <button onClick={walletReal.connect} disabled={walletReal.isLoading}
              className="w-full bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-2xl font-bold text-base shadow transition disabled:opacity-50">
              {walletReal.isLoading ? "Conectando..." : "🔗 Conectar Wallet"}
            </button>
          )}
          {walletReal.error && (
            <p className="text-red-500 text-xs text-center">{walletReal.error}</p>
          )}
          {walletReal.isMiniPayEnv && (
            <p className="text-green-600 text-sm animate-pulse">Conectando con MiniPay...</p>
          )}
          <button
            onClick={() => setOnboarded(false)}
            className="text-green-600/70 text-sm underline underline-offset-2 mt-1"
          >
            ¿Primera vez? Ver tutorial
          </button>
        </div>
      </div>
    );
  }

  // Fix 2: loading mientras carga perfil de Supabase
  if (loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
           style={{ background: "linear-gradient(180deg, #87ceeb 0%, #e8f5e9 40%, #fff8e1 100%)" }}>
        <img src="/assets/logo.png" alt="AgroVerse" className="w-16 h-16 animate-float" />
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-green-700 font-semibold text-sm">Validando tu perfil...</p>
      </div>
    );
  }

  // 3. Setup de usuario (nombre + país) → guarda en Supabase
  if (!username) {
    return (
      <UserSetup
        onDone={async (u, cc) => {
          setUsername(u);
          setCountryCode(cc);
          if (walletReal.address) {
            try {
              await upsertPlayer({
                wallet_address: walletReal.address,
                username: u,
                country_code: cc,
                points: 0,
                level: 1,
                skin: "default",
              });
            } catch (e) {
              console.warn("Supabase upsert failed:", e);
            }
          }
        }}
      />
    );
  }

  // 4. Juego principal
  const countryFlagUrl = flagUrl(countryCode);

  const showToast = (msg: string, type: "points" | "level" | "skin" = "points") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const handlePointsEarned = (earned: number) => {
    setPoints((prev) => {
      const next = prev + earned;
      const newLevel = Math.floor(next / 500) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        showToast(`¡Subiste al nivel ${newLevel}!`, "level");
        if (walletReal.address) updatePoints(walletReal.address, next, newLevel);
      } else {
        showToast(`+${earned} pts`, "points");
        if (walletReal.address) updatePoints(walletReal.address, next, level);
      }
      return next;
    });
  };

  const handleBuySkin = (skinId: SkinId) => {
    setSkin(skinId);
    showToast("🎨 ¡Skin equipada!", "skin");
  };

  // Fix 3: refrescar balance después de una compra
  const handlePurchaseComplete = () => {
    if (walletReal.address) walletReal.fetchBalances(walletReal.address);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#fef9f0" }}>

      {/* Barra superior fija */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 shadow-md">
        <div className="flex items-center bg-green-700 px-4 py-2.5 gap-2">
          <img src="/assets/logo.png" alt="AgroVerse" className="w-7 h-7 shrink-0" />
          <span className="font-bold text-white text-sm shrink-0">AgroVerse</span>
          <div className="flex-1" />
          <div className="flex items-center gap-1 bg-green-800/60 px-2.5 py-1 rounded-full shrink-0">
            <span className="text-yellow-300 font-bold text-xs font-mono">⭐ {points.toLocaleString()}</span>
            <span className="text-green-300 text-xs">pts</span>
          </div>
          <button
            onClick={() => switchTab("profile")}
            className="bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-1 rounded-full max-w-[110px] truncate shrink-0 flex items-center gap-1 transition"
          >
            {countryFlagUrl
              ? <img src={countryFlagUrl} alt={countryCode} className="w-4 h-3 object-cover rounded-sm inline" />
              : "🌍"}
            {username}
          </button>
        </div>
      </div>

      <div style={{ height: 54 }} />

      {toast && toast.type === "points" && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-grow-pop">
          <div className="flex items-center gap-2 bg-white border-2 border-yellow-300 rounded-2xl px-4 py-3 shadow-xl">
            <span className="text-2xl">🌾</span>
            <div>
              <p className="text-yellow-600 font-black text-lg leading-none">{toast.msg}</p>
              <p className="text-gray-400 text-xs mt-0.5">¡Cosecha exitosa!</p>
            </div>
          </div>
        </div>
      )}

      {toast && toast.type === "skin" && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-grow-pop">
          <div className="flex items-center gap-2 bg-white border-2 border-purple-300 rounded-2xl px-4 py-3 shadow-xl">
            <span className="text-2xl">🎨</span>
            <div>
              <p className="text-purple-600 font-black text-lg leading-none">¡Skin equipada!</p>
              <p className="text-gray-400 text-xs mt-0.5">Tu look ha cambiado</p>
            </div>
          </div>
        </div>
      )}

      {toast && toast.type === "level" && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-grow-pop">
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-2xl px-5 py-3 shadow-xl border-2 border-yellow-400">
            <span className="text-3xl">🎉</span>
            <div>
              <p className="text-white font-black text-base leading-none drop-shadow">{toast.msg}</p>
              <p className="text-yellow-900/70 text-xs mt-0.5 font-medium">¡Sigue cosechando!</p>
            </div>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {tab === "farm" && (
          <FarmView
            onPointsEarned={handlePointsEarned}
            demoMode={false}
            walletAddress={walletReal.address}
            onPurchaseComplete={handlePurchaseComplete}
          />
        )}
        {tab === "profile" && (
          <Profile
            address={walletReal.address ?? "0x0000"}
            username={username}
            countryCode={countryCode}
            points={points}
            level={level}
            skin={skin}
            usdcBalance={walletReal.usdcBalance}
            onChangeSkin={() => switchTab("shop")}
            onEquipSkin={(skinId) => { setSkin(skinId); showToast("🎨 ¡Skin equipada!", "skin"); }}
          />
        )}
        {tab === "ranking" && (
          <Ranking
            currentAddress={walletReal.address}
            currentPoints={points}
            username={username}
            countryFlagUrl={countryFlagUrl}
          />
        )}
        {tab === "shop" && <Marketplace currentSkin={skin} onBuy={handleBuySkin} usdcBalance={walletReal.usdcBalance} walletAddress={walletReal.address} onPurchaseComplete={handlePurchaseComplete} />}
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t-2 border-amber-200 flex shadow-lg">
        {(
          [
            { id: "farm",    emoji: "🌾", label: "Mi Finca" },
            { id: "profile", emoji: "🧑‍🌾", label: "Perfil" },
            { id: "ranking", emoji: "🏆", label: "Ranking" },
            { id: "shop",    emoji: "🛍️",  label: "Tienda" },
          ] as { id: Tab; emoji: string; label: string }[]
        ).map((item) => (
          <button key={item.id} onClick={() => switchTab(item.id)}
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
