import { createPublicClient, createWalletClient, custom, http } from "viem";
import { CELO_CONFIG } from "./constants";

// Chain definition para Celo Mainnet
export const celoChain = {
  id: CELO_CONFIG.CHAIN_ID,
  name: "Celo",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: [CELO_CONFIG.RPC_URL] },
    public: { http: [CELO_CONFIG.RPC_URL] },
  },
  blockExplorers: {
    default: { name: "Celoscan", url: "https://celoscan.io" },
  },
} as const;

// Cliente de lectura (no necesita wallet)
export const publicClient = createPublicClient({
  chain: celoChain,
  transport: http(CELO_CONFIG.RPC_URL),
});

// Cliente de escritura (requiere MiniPay/wallet conectada)
export function getWalletClient() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No hay wallet disponible");
  }
  return createWalletClient({
    chain: celoChain,
    transport: custom(window.ethereum),
  });
}

// Detectar si estamos dentro de MiniPay
export function isMiniPay(): boolean {
  return (
    typeof window !== "undefined" &&
    window.ethereum !== undefined &&
    (window.ethereum as { isMiniPay?: boolean }).isMiniPay === true
  );
}

// ABI mínimo ERC-20 para transferencias
export const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;
