export const CONTRACTS = {
  baseSepolia: {
    chainId: 84532,
    name: "Base Sepolia",
    tandaVault: "0xB35aB84408E28D0B81205293Dd2ed1d6E8566f1e" as `0x${string}`,
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`,
  },
  base: {
    chainId: 8453,
    name: "Base",
    tandaVault: "" as `0x${string}`,
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
  }
} as const;

export const PROTOCOL_CONSTANTS = {
  PARTICIPANTS_COUNT: 10,
  WEEKLY_PAYMENT: 15_000_000,
  WEEKLY_PAYMENT_FORMATTED: "15",
  WEEKS_PER_MONTH: 4,
  TOTAL_MONTHS: 10,
  GROUP_MONTHLY_PAYOUT: 600_000_000,
  GROUP_MONTHLY_PAYOUT_FORMATTED: "600",
  WEEK_DURATION_SECONDS: 604800,
} as const;

export function getContractAddress(chainId: number): `0x${string}` {
  if (chainId === 84532) return CONTRACTS.baseSepolia.tandaVault;
  if (chainId === 8453) return CONTRACTS.base.tandaVault;
  throw new Error(`Unsupported chain: ${chainId}`);
}

export function getUSDCAddress(chainId: number): `0x${string}` {
  if (chainId === 84532) return CONTRACTS.baseSepolia.usdc;
  if (chainId === 8453) return CONTRACTS.base.usdc;
  throw new Error(`Unsupported chain: ${chainId}`);
}
