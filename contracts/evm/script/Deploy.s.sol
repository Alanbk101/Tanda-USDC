// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {TandaManager} from "../src/TandaManager.sol";
import {Networks} from "./Networks.sol";

/// Despliega TandaManager con el USDC de la red a la que apunte --rpc-url.
/// Requiere en .env: ADMIN_ADDRESS (wallet que creará tandas; ideal un multisig).
contract Deploy is Script {
    function run() external returns (TandaManager tanda) {
        address admin = vm.envAddress("ADMIN_ADDRESS");
        address usdc = Networks.usdc(block.chainid);

        vm.startBroadcast();
        tanda = new TandaManager(IERC20(usdc), admin);
        vm.stopBroadcast();

        console2.log("Red (chainId):", block.chainid);
        console2.log("USDC:", usdc);
        console2.log("Admin:", admin);
        console2.log("TandaManager:", address(tanda));
    }
}
