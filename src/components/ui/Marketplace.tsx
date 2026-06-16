"use client";
import { SKINS } from "@/lib/constants";
import type { SkinId } from "@/types";

interface Props { currentSkin: SkinId; onBuy: (skinId: SkinId) => void; usdcBalance: string; }

const RARITY_STYLE = {
  common: { badge: "bg-gray-100 text-gray-500 border-gray-300",   card: "border-gray-200" },
  rare:   { badge: "bg-blue-100 text-blue-600 border-blue-300",   card: "border-blue-200" },
  epic:   { badge: "bg-purple-100 text-purple-600 border-purple-300", card: "border-purple-200" },
};
const RARITY_LABEL = { common: "Común", rare: "Rara", epic: "Épica" };
const SKIN_AVATAR: Record<SkinId, string> = {
  default: "👨‍🌾", ruana_roja: "🧣", sombrero_aguadeno: "👒", overol_verde: "🥋",
};

export default function Marketplace({ currentSkin, onBuy, usdcBalance }: Props) {
  const balance = parseFloat(usdcBalance);
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-green-800">🛍️ Tienda de Skins</h2>
        <p className="text-green-600 text-xs mt-1">Arte de ilustradores colombianos</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
        <span className="text-amber-700 text-sm">Tu balance</span>
        <span className="text-green-700 font-bold font-mono">{usdcBalance} USDC</span>
      </div>

      <div className="space-y-3">
        {SKINS.map((skin) => {
          const isActive = skin.id === currentSkin;
          const canAfford = balance >= skin.priceUSDT;
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
                      onClick={() => onBuy(skin.id)}
                      disabled={!canAfford && skin.priceUSDT > 0}
                      className={`text-xs px-3 py-2 rounded-xl font-semibold transition active:scale-95 ${
                        canAfford || skin.priceUSDT === 0
                          ? "bg-amber-500 hover:bg-amber-400 text-white"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {skin.priceUSDT === 0 ? "Equipar" : canAfford ? "Comprar" : "Sin saldo"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 text-center">
        <p className="text-purple-700 text-sm font-semibold">🎨 ¿Eres ilustrador?</p>
        <p className="text-purple-500 text-xs mt-1">
          Próximamente podrás vender tus skins y ganar USDC por cada venta
        </p>
      </div>
    </div>
  );
}
