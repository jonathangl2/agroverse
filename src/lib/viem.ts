import { createPublicClient, createWalletClient, custom, http } from "viem";

const isMainnet = process.env.NEXT_PUBLIC_NETWORK === "mainnet";

// ── Cadenas ────────────────────────────────────────────────────────────────
export const celoSepoliaChain = {
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_SEPOLIA ?? "https://celo-sepolia.drpc.org"] },
    public:  { http: [process.env.NEXT_PUBLIC_RPC_SEPOLIA ?? "https://celo-sepolia.drpc.org"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://celo-sepolia.blockscout.com" },
  },
} as const;

export const celoMainnetChain = {
  id: 42220,
  name: "Celo",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_MAINNET ?? "https://forno.celo.org"] },
    public:  { http: [process.env.NEXT_PUBLIC_RPC_MAINNET ?? "https://forno.celo.org"] },
  },
  blockExplorers: {
    default: { name: "Celoscan", url: "https://celoscan.io" },
  },
} as const;

export const activeChain = isMainnet ? celoMainnetChain : celoSepoliaChain;

// ── Direcciones activas según red ──────────────────────────────────────────
export const CONTRACT_ADDRESS = (
  isMainnet
    ? process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET
    : process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA
) as `0x${string}`;

export const USDC_ADDRESS = (
  isMainnet
    ? process.env.NEXT_PUBLIC_USDC_ADDRESS_MAINNET
    : process.env.NEXT_PUBLIC_USDC_ADDRESS_SEPOLIA
) as `0x${string}`;

// ── Clientes ───────────────────────────────────────────────────────────────
export const publicClient = createPublicClient({
  chain: activeChain,
  transport: http(),
});

export function getWalletClient() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No hay wallet disponible");
  }
  return createWalletClient({
    chain: activeChain,
    transport: custom(window.ethereum),
  });
}

export function isMiniPay(): boolean {
  return (
    typeof window !== "undefined" &&
    window.ethereum !== undefined &&
    (window.ethereum as { isMiniPay?: boolean }).isMiniPay === true
  );
}

// ── ABIs mínimos ───────────────────────────────────────────────────────────
export const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value",   type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner",   type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
