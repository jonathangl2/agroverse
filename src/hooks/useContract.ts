"use client";
import { useState, useEffect } from "react";
import { parseUnits, formatUnits } from "viem";
import { publicClient, getWalletClient, CONTRACT_ADDRESS, USDC_ADDRESS, ERC20_ABI } from "@/lib/viem";
import { getChosenProvider } from "@/lib/eip6963";
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
      const walletClient = getWalletClient(getChosenProvider() ?? undefined);
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
      const msg = err instanceof Error ? err.message : String(err);
      let friendly = "Algo salió mal. Intenta de nuevo.";
      if (/user rejected|user denied|rejected the request|cancelled/i.test(msg)) {
        friendly = "Cancelaste la transacción.";
      } else if (/insufficient funds|not enough.*balance|balance.*insufficient/i.test(msg)) {
        friendly = "No tienes saldo suficiente de USDC para esta compra.";
      } else if (/insufficient allowance|allowance/i.test(msg)) {
        friendly = "Error de aprobación. Intenta de nuevo.";
      } else if (/network|could not fetch|timeout|disconnected/i.test(msg)) {
        friendly = "Error de red. Revisa tu conexión e intenta de nuevo.";
      } else if (/nonce/i.test(msg)) {
        friendly = "Error de nonce. Recarga la página e intenta de nuevo.";
      }
      setError(friendly);
      setStatus("error");
      throw new Error(friendly);
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
