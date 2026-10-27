import { http, createConfig, type Transport } from "wagmi";
import { injected, coinbaseWallet, walletConnect } from "wagmi/connectors";
import { CHAINS, rpcUrlFor } from "@/config/networks";

const wcProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;

export const config = createConfig({
  chains: CHAINS,
  connectors: [
    injected(),
    // Smart Wallet de Coinbase: se crea con passkey, sin frase semilla.
    coinbaseWallet({ appName: "Tanda USDC", preference: "all" }),
    // WalletConnect (MetaMask móvil, Trust, etc.) solo si hay projectId.
    ...(wcProjectId ? [walletConnect({ projectId: wcProjectId, showQrModal: false })] : []),
  ],
  transports: Object.fromEntries(CHAINS.map((c) => [c.id, http(rpcUrlFor(c.id))])) as Record<
    (typeof CHAINS)[number]["id"],
    Transport
  >,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
