"use client";
import type { EIP6963ProviderDetail } from "@/lib/eip6963";

interface Props {
  providers: EIP6963ProviderDetail[];
  onSelect: (p: EIP6963ProviderDetail) => void;
  onClose: () => void;
}

const WALLET_ICONS: Record<string, string> = {
  "io.metamask": "🦊",
  "io.rabby": "🐰",
  "com.coinbase.wallet": "🔵",
  "app.phantom": "👻",
  "com.trustwallet.app": "🛡️",
  "legacy": "💼",
};

function walletEmoji(rdns: string) {
  return WALLET_ICONS[rdns] ?? "💳";
}

export default function WalletPicker({ providers, onSelect, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] bg-white rounded-t-3xl p-6 pb-10 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <p className="text-green-800 font-bold text-lg text-center mb-1">
          Selecciona tu wallet
        </p>
        <p className="text-gray-500 text-sm text-center mb-5">
          Detectamos {providers.length} wallets instaladas en tu navegador
        </p>

        <div className="flex flex-col gap-3">
          {providers.map((p) => (
            <button
              key={p.info.uuid}
              onClick={() => onSelect(p)}
              className="flex items-center gap-4 bg-gray-50 hover:bg-green-50 border-2 border-gray-100 hover:border-green-300 rounded-2xl px-4 py-3.5 transition active:scale-95 text-left"
            >
              {p.info.icon ? (
                <img
                  src={p.info.icon}
                  alt={p.info.name}
                  className="w-10 h-10 rounded-xl object-contain"
                />
              ) : (
                <span className="text-3xl w-10 text-center">
                  {walletEmoji(p.info.rdns)}
                </span>
              )}
              <div className="flex-1">
                <p className="text-gray-800 font-bold text-base">{p.info.name}</p>
                <p className="text-gray-400 text-xs">{p.info.rdns !== "legacy" ? p.info.rdns : "Proveedor detectado"}</p>
              </div>
              <span className="text-green-500 text-xl">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
