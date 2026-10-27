// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice USDC nativo (emitido por Circle) en cada red soportada.
/// Fuente: https://developers.circle.com/stablecoins/usdc-contract-addresses
library Networks {
    error UnsupportedChain(uint256 chainId);

    function usdc(uint256 chainId) internal pure returns (address) {
        if (chainId == 8453) return 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913; // Base
        if (chainId == 84532) return 0x036CbD53842c5426634e7929541eC2318f3dCF7e; // Base Sepolia
        if (chainId == 42161) return 0xaf88d065e77c8cC2239327C5EDb3A432268e5831; // Arbitrum One
        if (chainId == 421614) return 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d; // Arbitrum Sepolia
        if (chainId == 137) return 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359; // Polygon PoS
        if (chainId == 80002) return 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582; // Polygon Amoy
        revert UnsupportedChain(chainId);
    }
}
