// Direcciones de TandaManager por red.
// Después de desplegar (contracts/evm/README.md), pega aquí la dirección que imprime
// `forge script script/Deploy.s.sol:Deploy`. También puedes definirla con la variable
// de entorno VITE_TANDA_MANAGER_<chainId>, que tiene prioridad sobre este archivo.
export const DEPLOYMENTS: Record<number, `0x${string}` | undefined> = {
  // Testnets
  84532: undefined, // Base Sepolia
  421614: undefined, // Arbitrum Sepolia
  80002: undefined, // Polygon Amoy
  // Mainnets
  8453: undefined, // Base
  42161: undefined, // Arbitrum One
  137: undefined, // Polygon PoS
};
