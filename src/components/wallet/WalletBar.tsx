"use client";
import { useWallet } from "@/hooks/useWallet";

export default function WalletBar() {
  const { address, usdtBalance, isConnected, isMiniPayEnv, isLoading, connect } = useWallet();
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null;

  return (
    <div className="flex items-center justify-between bg-green-700 px-4 py-2 text-sm shadow">
      <div className="flex items-center gap-2">
        <img src="/assets/logo.png" alt="AgroVerse" className="w-7 h-7 rounded-lg" />
        <span className="font-bold text-white text-base">AgroVerse</span>
      </div>
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <span className="text-green-100 font-mono text-xs bg-green-800/50 px-2 py-1 rounded-full">
              💵 {usdtBalance} USDT
            </span>
            <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-mono">
              {shortAddress}
            </span>
            {isMiniPayEnv && (
              <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs">MiniPay</span>
            )}
          </>
        ) : (
          <button
            onClick={connect}
            disabled={isLoading}
            className="bg-white text-green-700 px-4 py-1.5 rounded-full text-sm font-bold transition disabled:opacity-50"
          >
            {isLoading ? "Conectando..." : "Conectar"}
          </button>
        )}
      </div>
    </div>
  );
}
