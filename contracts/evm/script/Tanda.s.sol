// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {TandaManager} from "../src/TandaManager.sol";

/// Operaciones del administrador sobre un TandaManager ya desplegado.
/// Variables en .env:
///   TANDA_MANAGER  dirección del contrato en esa red
///   TANDA_SEED     secreto de 32 bytes (0x...). Guárdalo: lo necesitas para el sorteo.
contract CreateTanda is Script {
    /// Crea la tanda estándar: 10 personas, 15 USDC por semana, cobro cada 4 semanas,
    /// garantía de 30 USDC, 2 días de gracia, abierta (sin lista de invitados).
    function run() external returns (uint256 groupId) {
        TandaManager tanda = TandaManager(vm.envAddress("TANDA_MANAGER"));
        bytes32 seed = vm.envBytes32("TANDA_SEED");

        TandaManager.Config memory cfg = TandaManager.Config({
            members: uint8(vm.envOr("TANDA_MEMBERS", uint256(10))),
            contribution: uint96(vm.envOr("TANDA_CONTRIBUTION", uint256(15e6))),
            collateral: uint96(vm.envOr("TANDA_COLLATERAL", uint256(30e6))),
            periodDuration: uint32(vm.envOr("TANDA_PERIOD_SECONDS", uint256(7 days))),
            periodsPerRound: uint8(vm.envOr("TANDA_PERIODS_PER_ROUND", uint256(4))),
            gracePeriod: uint32(vm.envOr("TANDA_GRACE_SECONDS", uint256(2 days))),
            joinDeadline: uint64(vm.envOr("TANDA_JOIN_DEADLINE", uint256(0)))
        });
        address[] memory invited = vm.envOr("TANDA_INVITED", ",", new address[](0));

        vm.startBroadcast();
        groupId = tanda.createGroup(cfg, invited, keccak256(abi.encode(seed)));
        vm.stopBroadcast();

        console2.log("Tanda creada, id:", groupId);
        console2.log("Por invitacion:", invited.length > 0);
    }
}

/// Revela el seed y arranca el sorteo cuando la tanda ya está llena.
/// Variables: TANDA_MANAGER, TANDA_SEED, TANDA_ID
contract RevealTanda is Script {
    function run() external {
        TandaManager tanda = TandaManager(vm.envAddress("TANDA_MANAGER"));
        bytes32 seed = vm.envBytes32("TANDA_SEED");
        uint256 groupId = vm.envUint("TANDA_ID");

        vm.startBroadcast();
        tanda.revealAndStart(groupId, seed);
        vm.stopBroadcast();

        (,,,,,,, address[] memory order) = tanda.getGroup(groupId);
        for (uint256 i; i < order.length; ++i) {
            console2.log("Turno", i + 1, order[i]);
        }
    }
}
