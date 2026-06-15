"use client";
import { useState, useEffect } from "react";
import { parseUnits, formatUnits } from "viem";
import { publicClient, getWalletClient, CONTRACT_ADDRESS, USDC_ADDRESS, ERC20_ABI } from "@/lib/viem";
import ABI from "@/lib/AgroVerseABI.json";

export type TxStatus = "idle" | "approving" | "confirming" | "success" | "error";

// ── Leer prize pool en tiempo real ────────────────────────────────────────
export function usePrizePool() {
  const [pool, setPool] = useState<string>("0.00");

  useEffect(() => {
    const fetch = async () => {
      try {
        const raw = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: "prizePool",
        });
        setPool(parseFloat(formatUnits(raw as bigint, 6)).toFixed(2));
      } catch { /* silencioso */ }
    };
    fetch();
    const id = setInterval(fetch, 30000); // refresca cada 30s
    return () => clearInterval(id);
  }, []);

  return pool;
}

// ── Verificar si el jugador está registrado ───────────────────────────────
export async function isPlayerRegistered(address: string): Promise<boolean> {
  try {
    const player = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "getPlayer",
      args: [address as `0x${string}`],
    }) as { exists: boolean };
    return player.exists;
  } catch {
    return false;
  }
}

// ── Registrar jugador on-chain ────────────────────────────────────────────
export async function registerPlayer(username: string, countryCode: string): Promise<`0x${string}`> {
  const walletClient = getWalletClient();
  const [address] = await walletClient.getAddresses();

  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "register",
    args: [username, countryCode],
    account: address,
    chain: walletClient.chain,
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

// ── Comprar semilla premium ────────────────────────────────────────────────
export function useBuySeed() {
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError]   = useState<string | null>(null);

  const buySeed = async (seedId: string, priceUSDT: number) => {
    setStatus("idle");
    setError(null);
    setTxHash(null);

    try {
      const walletClient = getWalletClient();
      const [address] = await walletClient.getAddresses();

      // Precio en USDC (6 decimales)
      const amount = parseUnits(priceUSDT.toString(), 6);

      // Paso 1 — Approve
      setStatus("approving");
      const approveTx = await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESS, amount],
        account: address,
        chain: walletClient.chain,
      });
      await publicClient.waitForTransactionReceipt({ hash: approveTx });

      // Paso 2 — buySeed
      setStatus("confirming");
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "buySeed",
        args: [seedId],
        account: address,
        chain: walletClient.chain,
      });
      await publicClient.waitForTransactionReceipt({ hash });

      setTxHash(hash);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en la transacción");
      setStatus("error");
    }
  };

  return { buySeed, status, txHash, error, reset: () => setStatus("idle") };
}
