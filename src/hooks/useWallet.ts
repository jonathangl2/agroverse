"use client";
import { useState, useEffect, useCallback } from "react";
import { getWalletClient, isMiniPay, publicClient } from "@/lib/viem";
import { CELO_CONFIG } from "@/lib/constants";
import { formatUnits } from "viem";

interface WalletState {
  address: string | null;
  usdtBalance: string;
  usdmBalance: string;
  isConnected: boolean;
  isMiniPayEnv: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    usdtBalance: "0.00",
    usdmBalance: "0.00",
    isConnected: false,
    isMiniPayEnv: false,
    isLoading: false,
    error: null,
  });

  // Detectar MiniPay y auto-conectar
  useEffect(() => {
    const miniPay = isMiniPay();
    setState((s) => ({ ...s, isMiniPayEnv: miniPay }));
    if (miniPay) connect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const client = getWalletClient();
      const [address] = await client.getAddresses();
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
  }, []);

  const fetchBalances = async (address: string) => {
    try {
      const ERC20_ABI = [
        {
          name: "balanceOf",
          type: "function" as const,
          stateMutability: "view" as const,
          inputs: [{ name: "account", type: "address" as const }],
          outputs: [{ name: "", type: "uint256" as const }],
        },
      ];

      const [usdt, usdm] = await Promise.all([
        publicClient.readContract({
          address: CELO_CONFIG.USDT_ADDRESS,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        }),
        publicClient.readContract({
          address: CELO_CONFIG.USDM_ADDRESS,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        }),
      ]);

      setState((s) => ({
        ...s,
        usdtBalance: parseFloat(formatUnits(usdt as bigint, 6)).toFixed(2),
        usdmBalance: parseFloat(formatUnits(usdm as bigint, 18)).toFixed(2),
      }));
    } catch {
      // Silencioso — balances quedan en 0.00
    }
  };

  const disconnect = useCallback(() => {
    setState({
      address: null,
      usdtBalance: "0.00",
      usdmBalance: "0.00",
      isConnected: false,
      isMiniPayEnv: isMiniPay(),
      isLoading: false,
      error: null,
    });
  }, []);

  return { ...state, connect, disconnect, fetchBalances };
}
