"use client";
import { useState, useEffect, useCallback } from "react";
import { getWalletClient, isMiniPay, publicClient, USDC_ADDRESS, activeChain } from "@/lib/viem";
import { formatUnits } from "viem";
import { ERC20_ABI } from "@/lib/viem";

interface WalletState {
  address: string | null;
  usdcBalance: string;
  isConnected: boolean;
  isMiniPayEnv: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    usdcBalance: "0.00",
    isConnected: false,
    isMiniPayEnv: false,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const miniPay = isMiniPay();
    setState((s) => ({ ...s, isMiniPayEnv: miniPay }));
    if (miniPay) connect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBalances = useCallback(async (address: string) => {
    try {
      const raw = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      });
      setState((s) => ({
        ...s,
        usdcBalance: parseFloat(formatUnits(raw as bigint, 6)).toFixed(2),
      }));
    } catch { /* silencioso */ }
  }, []);

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      // Solicitar acceso explícito — abre el popup de la wallet
      if (typeof window !== "undefined" && window.ethereum) {
        await (window.ethereum as { request: (a: { method: string }) => Promise<unknown> })
          .request({ method: "eth_requestAccounts" });
      }

      const walletClient = getWalletClient();

      try {
        await walletClient.switchChain({ id: activeChain.id });
      } catch { /* si no soporta switchChain lo ignoramos */ }

      const [address] = await walletClient.getAddresses();
      if (!address) throw new Error("No se pudo obtener la dirección");

      await fetchBalances(address);
      setState((s) => ({ ...s, address, isConnected: true, isLoading: false }));
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : "Error al conectar",
      }));
    }
  }, [fetchBalances]);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      usdcBalance: "0.00",
      isConnected: false,
      isMiniPayEnv: isMiniPay(),
      isLoading: false,
      error: null,
    });
  }, []);

  return { ...state, connect, disconnect, fetchBalances };
}
