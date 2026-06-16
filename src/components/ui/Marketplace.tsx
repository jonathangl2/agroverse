"use client";
import { useState } from "react";
import { SKINS } from "@/lib/constants";
import type { SkinId } from "@/types";
import { useBuySkin } from "@/hooks/useContract";
import { recordSkinPurchase } from "@/lib/supabase";

interface Props {
  currentSkin: SkinId;
  onBuy: (skinId: SkinId) => void;
  usdcBalance: string;
  walletAddress?: string | null;
  onPurchaseComplete?: () => void;
}

const RARITY_STYLE = {
  common: { badge: "bg-gray-100 text-gray-500 border-gray-300",   card: "border-gray-200" },
  rare:   { badge: "bg-blue-100 text-blue-600 border-blue-300",   card: "border-blue-200" },
  epic:   { badge: "bg-purple-100 text-purple-600 border-purple-300", card: "border-purple-200" },
};
const RARITY_LABEL = { common: "Común", rare: "Rara", epic: "Épica" };
const SKIN_AVATAR: Record<SkinId, string> = {
  default: "👨‍🌾", ruana_roja: "🧣", sombrero_aguadeno: "👒", overol_verde: "🥋",
};

export default function Marketplace({ currentSkin, onBuy, usdcBalance, walletAddress, onPurchaseComplete }: Props) {
  const balance = parseFloat(usdcBalance);
  const { buySkin, status: txStatus, error: txError, txHash, reset: resetTx } = useBuySkin();
  const [buyingId, setBuyingId] = useState<SkinId | null>(null);

  const handleBuy = async (skinId: SkinId, price: number) => {
    if (price === 0) { onBuy(skinId); return; }
    setBuyingId(skinId);
    try {
      await buySkin(skinId, price);
      onBuy(skinId);
      onPurchaseComplete?.();
      // Registrar en Supabase (best-effort, no bloquea UX)
      if (walletAddress) {
        recordSkinPurchase(walletAddress, skinId, txHash ?? "", price).catch(console.warn);
      }
    } catch {
      // error ya manejado en el hook
    } finally {
      setBuyingId(null);
      resetTx();
    }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Overlay tx en curso */}
      {(txStatus === "approving" || txStatus === "confirming") && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 mx-6 flex flex-col items-center gap-3 shadow-2xl">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-purple-800 font-bold text-base text-center">
              {txStatus === "approving" ? "Aprobando USDC..." : "Comprando skin..."}
            </p>
            <p className="text-gray-400 text-xs text-center">No cierres la app</p>
          </div>
        </div>
      )}

      {txStatus === "error" && txError && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl px-4 py-3 text-center">
          <p className="text-red-600 text-sm font-bold">❌ {txError}</p>
          <button onClick={resetTx} className="text-blue-500 text-xs mt-1 underline">Cerrar</button>
        </div>
      )}

      <div className="text-center">
        <h2 className="text-xl font-bold text-green-800">🛍️ Tienda de Skins</h2>
        <p className="text-green-600 text-xs mt-1">Personaliza tu agricultor · Ediciones globales</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
        <span className="text-amber-700 text-sm">Tu balance</span>
        <span className="text-green-700 font-bold font-mono">{usdcBalance} USDC</span>
      </div>

      <div className="space-y-3">
        {SKINS.map((skin) => {
          const isActive = skin.id === currentSkin;
          const canAfford = balance >= skin.priceUSDT;
          const isBuying = buyingId === skin.id;
          const style = RARITY_STYLE[skin.rarity];
          return (
            <div key={skin.id} className={`bg-white border-2 ${style.card} rounded-2xl p-4 shadow-sm`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center text-4xl">
                  {SKIN_AVATAR[skin.id]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-green-900 font-bold text-sm">{skin.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${style.badge}`}>
                      {RARITY_LABEL[skin.rarity]}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">{skin.description}</p>
                  <p className="text-green-700 font-bold mt-1">
                    {skin.priceUSDT === 0 ? "Gratis" : `${skin.priceUSDT} USDC`}
                  </p>
                </div>
                <div>
                  {isActive ? (
                    <span className="bg-green-100 text-green-700 text-xs px-3 py-2 rounded-xl font-semibold border border-green-300">
                      ✓ Activa
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuy(skin.id as SkinId, skin.priceUSDT)}
                      disabled={(!canAfford && skin.priceUSDT > 0) || isBuying}
                      className={`text-xs px-3 py-2 rounded-xl font-semibold transition active:scale-95 ${
                        canAfford || skin.priceUSDT === 0
                          ? "bg-amber-500 hover:bg-amber-400 text-white"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {isBuying ? "..." : skin.priceUSDT === 0 ? "Equipar" : canAfford ? "Comprar" : "Sin saldo"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
