// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {TandaManager} from "../src/TandaManager.sol";
import {MockUSDC} from "../test/mocks/MockUSDC.sol";

/// Entorno local para probar la app sin testnet:
///   anvil
///   forge script script/LocalDev.s.sol:LocalDev --rpc-url http://127.0.0.1:8545 --broadcast \
///     --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
/// Despliega un USDC de prueba y TandaManager (admin = cuenta 0 de anvil) y da 1,000 USDC
/// a las primeras 10 cuentas de anvil.
contract LocalDev is Script {
    function run() external {
        require(block.chainid == 31337, "Solo para anvil");
        string memory mnemonic = "test test test test test test test test test test test junk";

        vm.startBroadcast();
        MockUSDC usdc = new MockUSDC();
        TandaManager tanda = new TandaManager(usdc, msg.sender);
        for (uint32 i; i < 10; ++i) {
            usdc.mint(vm.addr(vm.deriveKey(mnemonic, i)), 1_000e6);
        }
        vm.stopBroadcast();

        console2.log("VITE_ENABLE_LOCAL=true");
        console2.log("VITE_LOCAL_USDC=%s", address(usdc));
        console2.log("VITE_TANDA_MANAGER_31337=%s", address(tanda));
        console2.log("VITE_RPC_31337=http://127.0.0.1:8545");
    }
}
