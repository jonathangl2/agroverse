"use client";
import { useState, useEffect, useCallback } from "react";
import { publicClient, USDC_ADDRESS, activeChain, ERC20_ABI } from "@/lib/viem";
import { createWalletClient, custom, formatUnits } from "viem";
import { isMiniPay } from "@/lib/viem";
import { discoverProviders, setChosenProvider, type EIP6963ProviderDetail } from "@/lib/eip6963";

interface WalletState {
  address: string | null;
  usdcBalance: string;
  isConnected: boolean;
  isMiniPayEnv: boolean;
  isLoading: boolean;
  error: string | null;
  // provider picker
  pendingProviders: EIP6963ProviderDetail[];
  showPicker: boolean;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    usdcBalance: "0.00",
    isConnected: false,
    isMiniPayEnv: false,
    isLoading: false,
    error: null,
    pendingProviders: [],
    showPicker: false,
  });

  useEffect(() => {
    const miniPay = isMiniPay();
    setState((s) => ({ ...s, isMiniPayEnv: miniPay }));
    if (miniPay) connectWithProvider(window.ethereum as EIP6963ProviderDetail["provider"]);
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

  const connectWithProvider = useCallback(async (provider: EIP6963ProviderDetail["provider"]) => {
    setState((s) => ({ ...s, isLoading: true, error: null, showPicker: false }));
    try {
      setChosenProvider(provider);

      const walletClient = createWalletClient({
        chain: activeChain,
        transport: custom(provider),
      });

      // requestAddresses dispara el popup de la wallet (equivale a eth_requestAccounts)
      const addresses = await walletClient.requestAddresses();
      const address = addresses[0];
      if (!address) throw new Error("No se pudo obtener la dirección");

      try {
        await walletClient.switchChain({ id: activeChain.id });
      } catch { /* si no soporta switchChain lo ignoramos */ }

      await fetchBalances(address);
      setState((s) => ({ ...s, address, isConnected: true, isLoading: false }));
    } catch (err) {
      // Si falla, re-mostrar el picker para que elija otra wallet
      const providers = await discoverProviders().catch(() => []);
      if (providers.length > 1) {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: `No se pudo conectar con esa wallet. Selecciona otra.`,
          pendingProviders: providers,
          showPicker: true,
        }));
      } else {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: err instanceof Error ? err.message : "Error al conectar",
        }));
      }
    }
  }, [fetchBalances]);

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const providers = await discoverProviders();

      if (providers.length === 0) {
        throw new Error("No se detectó ninguna wallet. Instala MetaMask u otra wallet compatible.");
      }

      if (providers.length === 1) {
        // Only one — connect directly, no picker needed
        await connectWithProvider(providers[0].provider);
      } else {
        // Multiple wallets — show picker
        setState((s) => ({
          ...s,
          isLoading: false,
          pendingProviders: providers,
          showPicker: true,
        }));
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : "Error al conectar",
      }));
    }
  }, [connectWithProvider]);

  const selectProvider = useCallback((detail: EIP6963ProviderDetail) => {
    connectWithProvider(detail.provider);
  }, [connectWithProvider]);

  const closePicker = useCallback(() => {
    setState((s) => ({ ...s, showPicker: false, pendingProviders: [], isLoading: false }));
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      usdcBalance: "0.00",
      isConnected: false,
      isMiniPayEnv: isMiniPay(),
      isLoading: false,
      error: null,
      pendingProviders: [],
      showPicker: false,
    });
  }, []);

  return { ...state, connect, disconnect, fetchBalances, selectProvider, closePicker };
}
