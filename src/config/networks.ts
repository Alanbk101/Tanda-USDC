import type { Chain } from "viem";
import { arbitrum, arbitrumSepolia, base, baseSepolia, foundry, polygon, polygonAmoy } from "wagmi/chains";
import { DEPLOYMENTS } from "./deployments";

export interface TandaNetwork {
  chain: Chain;
  label: string;
  short: string;
  testnet: boolean;
  /** USDC nativo de Circle en esa red */
  usdc: `0x${string}`;
  /** TandaManager desplegado, si existe */
  tandaManager?: `0x${string}`;
}

const env = import.meta.env as Record<string, string | undefined>;

function managerFor(chainId: number): `0x${string}` | undefined {
  const fromEnv = env[`VITE_TANDA_MANAGER_${chainId}`];
  if (fromEnv && /^0x[0-9a-fA-F]{40}$/.test(fromEnv)) return fromEnv as `0x${string}`;
  return DEPLOYMENTS[chainId];
}

const BASE_NETWORKS: Omit<TandaNetwork, "tandaManager">[] = [
  { chain: baseSepolia, label: "Base Sepolia", short: "Base", testnet: true, usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" },
  { chain: arbitrumSepolia, label: "Arbitrum Sepolia", short: "Arbitrum", testnet: true, usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d" },
  { chain: polygonAmoy, label: "Polygon Amoy", short: "Polygon", testnet: true, usdc: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582" },
  { chain: base, label: "Base", short: "Base", testnet: false, usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
  { chain: arbitrum, label: "Arbitrum One", short: "Arbitrum", testnet: false, usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" },
  { chain: polygon, label: "Polygon", short: "Polygon", testnet: false, usdc: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" },
];

// Red local (anvil) solo para desarrollo: VITE_ENABLE_LOCAL=true + VITE_LOCAL_USDC.
const LOCAL_USDC = env.VITE_LOCAL_USDC;
const localNetwork: Omit<TandaNetwork, "tandaManager">[] =
  env.VITE_ENABLE_LOCAL === "true" && LOCAL_USDC
    ? [{ chain: foundry, label: "Local (anvil)", short: "Local", testnet: true, usdc: LOCAL_USDC as `0x${string}` }]
    : [];

export const NETWORKS: TandaNetwork[] = [...localNetwork, ...BASE_NETWORKS].map((n) => ({
  ...n,
  tandaManager: managerFor(n.chain.id),
}));

export const CHAINS = NETWORKS.map((n) => n.chain) as [Chain, ...Chain[]];

export function getNetwork(chainId: number | undefined): TandaNetwork | undefined {
  return NETWORKS.find((n) => n.chain.id === chainId);
}

/** Si no hay ningún contrato en mainnet, la app arranca en modo testnet. */
export const HAS_MAINNET_DEPLOYMENT = NETWORKS.some((n) => !n.testnet && n.tandaManager);

export function rpcUrlFor(chainId: number): string | undefined {
  return env[`VITE_RPC_${chainId}`];
}

export function explorerTxUrl(chainId: number, hash: string): string | undefined {
  const url = getNetwork(chainId)?.chain.blockExplorers?.default.url;
  return url ? `${url}/tx/${hash}` : undefined;
}

export function explorerAddressUrl(chainId: number, address: string): string | undefined {
  const url = getNetwork(chainId)?.chain.blockExplorers?.default.url;
  return url ? `${url}/address/${address}` : undefined;
}
