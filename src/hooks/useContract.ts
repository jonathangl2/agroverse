"use client";
import { useState, useEffect } from "react";
import { parseUnits, formatUnits } from "viem";
import { publicClient, getWalletClient, CONTRACT_ADDRESS, USDC_ADDRESS, ERC20_ABI } from "@/lib/viem";
import ABI from "@/lib/AgroVerseABI.json";

export type TxStatus = "idle" | "approving" | "confirming" | "success" | "error";

// ── Prize pool en tiempo real ─────────────────────────────────────────────
export function usePrizePool() {
  const [pool, setPool] = useState<string | null>(null);

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
    const id = setInterval(fetch, 30000);
    return () => clearInterval(id);
  }, []);

  return pool;
}

// ── Hook genérico de pago (approve + llamada al contrato) ─────────────────
function useContractPay(functionName: "paySeed" | "paySkin") {
  const [status, setStatus]   = useState<TxStatus>("idle");
  const [txHash, setTxHash]   = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const pay = async (ref: string, priceUsdc: number): Promise<string> => {
    setStatus("idle");
    setError(null);
    setTxHash(null);

    try {
      const walletClient = getWalletClient();
      const [address] = await walletClient.getAddresses();
      const amount = parseUnits(priceUsdc.toString(), 6);

      // Paso 1 — Approve USDC
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

      // Paso 2 — paySeed o paySkin
      setStatus("confirming");
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName,
        args: [ref, amount],
        account: address,
        chain: walletClient.chain,
      });
      await publicClient.waitForTransactionReceipt({ hash });

      setTxHash(hash);
      setStatus("success");
      return hash;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en la transacción");
      setStatus("error");
      throw err;
    }
  };

  return { pay, status, txHash, error, reset: () => { setStatus("idle"); setError(null); } };
}

// ── Hooks públicos ────────────────────────────────────────────────────────
export function usePaySeed() {
  const { pay, ...rest } = useContractPay("paySeed");
  return { paySeed: pay, ...rest };
}

export function usePaySkin() {
  const { pay, ...rest } = useContractPay("paySkin");
  return { paySkin: pay, ...rest };
}
