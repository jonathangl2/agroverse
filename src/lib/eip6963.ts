// EIP-6963: Multi Injected Provider Discovery
// https://eips.ethereum.org/EIPS/eip-6963

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string; // data URI
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

export interface EIP1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

// Global singleton — the provider chosen by the user persists for the session
let _chosenProvider: EIP1193Provider | null = null;

export function setChosenProvider(p: EIP1193Provider) {
  _chosenProvider = p;
}

export function getChosenProvider(): EIP1193Provider | null {
  return _chosenProvider;
}

export function discoverProviders(): Promise<EIP6963ProviderDetail[]> {
  return new Promise((resolve) => {
    const found: EIP6963ProviderDetail[] = [];

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
      if (detail?.info && detail?.provider) {
        // Avoid duplicates by uuid
        if (!found.find((p) => p.info.uuid === detail.info.uuid)) {
          found.push(detail);
        }
      }
    };

    window.addEventListener("eip6963:announceProvider", handler);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    // Give wallets 300ms to respond, then resolve
    setTimeout(() => {
      window.removeEventListener("eip6963:announceProvider", handler);

      // Fallback: if no EIP-6963 provider announced but window.ethereum exists
      if (found.length === 0 && window.ethereum) {
        found.push({
          info: {
            uuid: "legacy",
            name: (window.ethereum as { isMetaMask?: boolean; isRabby?: boolean; isCoinbaseWallet?: boolean }).isMetaMask
              ? "MetaMask"
              : (window.ethereum as { isRabby?: boolean }).isRabby
              ? "Rabby"
              : (window.ethereum as { isCoinbaseWallet?: boolean }).isCoinbaseWallet
              ? "Coinbase Wallet"
              : "Wallet",
            icon: "",
            rdns: "legacy",
          },
          provider: window.ethereum as EIP1193Provider,
        });
      }

      resolve(found);
    }, 300);
  });
}
