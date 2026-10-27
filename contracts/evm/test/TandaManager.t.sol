// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {TandaManager} from "../src/TandaManager.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

contract TandaManagerTest is Test {
    MockUSDC usdc;
    TandaManager tanda;

    address admin = makeAddr("admin");
    address stranger = makeAddr("stranger");
    address[] people;

    uint96 constant CONTRIBUTION = 15e6; // 15 USDC
    uint96 constant COLLATERAL = 30e6; // 2 aportaciones
    uint32 constant WEEK = 7 days;
    uint8 constant PPR = 4; // 4 semanas por cobro
    uint32 constant GRACE = 2 days;
    uint8 constant N = 10;
    uint256 constant POT = uint256(N) * PPR * CONTRIBUTION; // 600 USDC

    bytes32 constant SEED = keccak256("semilla-secreta");

    function setUp() public {
        usdc = new MockUSDC();
        tanda = new TandaManager(usdc, admin);
        for (uint256 i; i < N; ++i) {
            address p = makeAddr(string.concat("persona", vm.toString(i)));
            people.push(p);
            usdc.mint(p, 10_000e6);
            vm.prank(p);
            usdc.approve(address(tanda), type(uint256).max);
        }
        usdc.mint(stranger, 10_000e6);
        vm.prank(stranger);
        usdc.approve(address(tanda), type(uint256).max);
    }

    // ------------------------------------------------------------------ helpers

    function _cfg() internal pure returns (TandaManager.Config memory) {
        return TandaManager.Config({
            members: N,
            contribution: CONTRIBUTION,
            collateral: COLLATERAL,
            periodDuration: WEEK,
            periodsPerRound: PPR,
            gracePeriod: GRACE,
            joinDeadline: 0
        });
    }

    function _commit(bytes32 seed) internal pure returns (bytes32) {
        return keccak256(abi.encode(seed));
    }

    function _create(address[] memory invited) internal returns (uint256 id) {
        vm.prank(admin);
        id = tanda.createGroup(_cfg(), invited, _commit(SEED));
    }

    function _createFilledAndStarted() internal returns (uint256 id) {
        id = _create(new address[](0));
        for (uint256 i; i < N; ++i) {
            vm.prank(people[i]);
            tanda.join(id);
        }
        vm.prank(admin);
        tanda.revealAndStart(id, SEED);
    }

    function _order(uint256 id) internal view returns (address[] memory order) {
        (,,,,,,, order) = tanda.getGroup(id);
    }

    function _payRound(uint256 id, address who) internal {
        vm.prank(who);
        tanda.contribute(id, PPR);
    }

    function _settle(uint256 id) internal {
        vm.warp(tanda.settleTime(id));
        tanda.settleRound(id);
    }

    function _withdrawAll(uint256 id) internal {
        for (uint256 i; i < N; ++i) {
            TandaManager.Member memory m = tanda.getMember(id, people[i]);
            if (m.claimable > 0 || m.collateralLeft > 0) {
                vm.prank(people[i]);
                tanda.withdraw(id);
            }
        }
    }

    // ------------------------------------------------------------------ creación y acceso

    function test_soloAdminCreaTandas() public {
        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        tanda.createGroup(_cfg(), new address[](0), _commit(SEED));
    }

    function test_rechazaConfigInvalida() public {
        TandaManager.Config memory c = _cfg();
        c.members = 1;
        vm.prank(admin);
        vm.expectRevert(TandaManager.InvalidConfig.selector);
        tanda.createGroup(c, new address[](0), _commit(SEED));

        c = _cfg();
        c.periodDuration = 10 minutes;
        vm.prank(admin);
        vm.expectRevert(TandaManager.InvalidConfig.selector);
        tanda.createGroup(c, new address[](0), _commit(SEED));
    }

    function test_porInvitacionRechazaExtranos() public {
        address[] memory invited = people;
        uint256 id = _create(invited);
        vm.prank(stranger);
        vm.expectRevert(TandaManager.NotInvited.selector);
        tanda.join(id);

        vm.prank(people[0]);
        tanda.join(id);
        assertTrue(tanda.getMember(id, people[0]).joined);
    }

    function test_unirseCobraGarantiaYSalirLaDevuelve() public {
        uint256 id = _create(new address[](0));
        uint256 before = usdc.balanceOf(people[0]);

        vm.prank(people[0]);
        tanda.join(id);
        assertEq(usdc.balanceOf(people[0]), before - COLLATERAL);

        vm.prank(people[0]);
        tanda.leave(id);
        assertEq(usdc.balanceOf(people[0]), before);
        (,,,,,, address[] memory members,) = tanda.getGroup(id);
        assertEq(members.length, 0);
    }

    function test_pausaBloqueaEntradaPeroNoAportes() public {
        uint256 id = _createFilledAndStarted();
        uint256 other = _create(new address[](0));

        vm.prank(admin);
        tanda.pause();

        vm.prank(people[0]);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        tanda.join(other);

        // aportar sigue funcionando para no provocar impagos injustos
        _payRound(id, people[0]);
    }

    // ------------------------------------------------------------------ sorteo

    function test_sorteoEsPermutacionDeLosMiembros() public {
        uint256 id = _createFilledAndStarted();
        address[] memory order = _order(id);
        assertEq(order.length, N);

        bool[] memory seen = new bool[](N + 1);
        for (uint256 i; i < N; ++i) {
            uint8 turn = tanda.getMember(id, order[i]).turn;
            assertEq(turn, i + 1);
            assertFalse(seen[turn]);
            seen[turn] = true;
        }
    }

    function test_revelarConSeedIncorrectoFalla() public {
        uint256 id = _create(new address[](0));
        for (uint256 i; i < N; ++i) {
            vm.prank(people[i]);
            tanda.join(id);
        }
        vm.prank(admin);
        vm.expectRevert(TandaManager.BadReveal.selector);
        tanda.revealAndStart(id, keccak256("otra"));
    }

    function test_siAdminNoRevelaCualquieraCancelaYTodosRecuperan() public {
        uint256 id = _create(new address[](0));
        for (uint256 i; i < N; ++i) {
            vm.prank(people[i]);
            tanda.join(id);
        }

        vm.expectRevert(TandaManager.RevealWindowOpen.selector);
        tanda.cancelUnrevealed(id);

        vm.warp(block.timestamp + 3 days + 1);
        vm.prank(stranger);
        tanda.cancelUnrevealed(id);

        _withdrawAll(id);
        assertEq(usdc.balanceOf(address(tanda)), 0);
        assertEq(usdc.balanceOf(people[3]), 10_000e6);
    }

    // ------------------------------------------------------------------ ciclo completo

    function test_cicloCompletoTodosPagan() public {
        uint256 id = _createFilledAndStarted();
        address[] memory order = _order(id);

        for (uint256 r; r < N; ++r) {
            for (uint256 i; i < N; ++i) {
                _payRound(id, people[i]);
            }
            _settle(id);
            assertEq(tanda.getMember(id, order[r]).claimable, POT);
        }

        (, TandaManager.Status status,,,,,,) = tanda.getGroup(id);
        assertEq(uint8(status), uint8(TandaManager.Status.Completed));

        _withdrawAll(id);
        assertEq(usdc.balanceOf(address(tanda)), 0);
        for (uint256 i; i < N; ++i) {
            // cada quien pagó 600 y recibió 600: termina igual
            assertEq(usdc.balanceOf(people[i]), 10_000e6);
        }
    }

    function test_noSePuedeLiquidarAntesDeTiempo() public {
        uint256 id = _createFilledAndStarted();
        vm.expectRevert(TandaManager.TooEarly.selector);
        tanda.settleRound(id);
    }

    function test_noSePuedeAdelantarMasAllaDeLaRondaActual() public {
        uint256 id = _createFilledAndStarted();
        vm.prank(people[0]);
        vm.expectRevert(TandaManager.InvalidAmount.selector);
        tanda.contribute(id, PPR + 1);
    }

    // ------------------------------------------------------------------ impagos

    function test_impagoCubiertoPorGarantiaYDeudaSeRecupera() public {
        uint256 id = _createFilledAndStarted();
        address[] memory order = _order(id);
        address first = order[0];
        address deadbeat = order[N - 1]; // cobra al final

        // Ronda 0: el moroso no paga. Su garantía (30) cubre la mitad de 60.
        for (uint256 i; i < N; ++i) {
            if (people[i] != deadbeat) _payRound(id, people[i]);
        }
        _settle(id);

        TandaManager.Member memory d = tanda.getMember(id, deadbeat);
        assertTrue(d.defaulted);
        assertEq(d.collateralLeft, 0);
        assertEq(d.debt, 30e6);
        assertEq(tanda.getMember(id, first).claimable, POT - 30e6);
        assertEq(tanda.getMember(id, first).owedToMe, 30e6);

        // El resto del ciclo todos pagan.
        for (uint256 r = 1; r < N; ++r) {
            for (uint256 i; i < N; ++i) {
                _payRound(id, people[i]);
            }
            _settle(id);
        }

        // Al cobrar, al moroso se le retuvieron 30 y se le acreditaron al primero.
        assertEq(tanda.getMember(id, deadbeat).claimable, POT - 30e6);
        assertEq(tanda.getMember(id, deadbeat).debt, 0);
        assertEq(tanda.getMember(id, first).claimable, POT);
        assertEq(tanda.getMember(id, first).owedToMe, 0);

        _withdrawAll(id);
        assertEq(usdc.balanceOf(address(tanda)), 0);
    }

    function test_morosoPuedePagarSuDeuda() public {
        uint256 id = _createFilledAndStarted();
        address[] memory order = _order(id);
        address deadbeat = order[N - 1];

        for (uint256 i; i < N; ++i) {
            if (people[i] != deadbeat) _payRound(id, people[i]);
        }
        _settle(id);

        vm.prank(deadbeat);
        tanda.repayDebt(id, 30e6);
        assertEq(tanda.getMember(id, deadbeat).debt, 0);
        assertEq(tanda.getMember(id, order[0]).claimable, POT);
    }

    function test_receptorQueNoPagaRecibeMenos() public {
        uint256 id = _createFilledAndStarted();
        address first = _order(id)[0];

        // Gasta su garantía primero: no paga la ronda 0 (cubre 30 de 60).
        for (uint256 i; i < N; ++i) {
            if (people[i] != first) _payRound(id, people[i]);
        }
        _settle(id);

        TandaManager.Member memory f = tanda.getMember(id, first);
        assertEq(f.claimable, POT - 30e6);
        assertEq(f.debt, 0); // su hueco se descontó de su propio cobro
        assertEq(f.owedToMe, 0);
    }

    // ------------------------------------------------------------------ fuzz: conservación de fondos

    /// Cualquier patrón de pagos e impagos: al final, tras retirar todos, el contrato
    /// queda en cero y la deuda total es igual a lo que se le debe al grupo.
    function testFuzz_conservacionDeFondos(uint256 payMask) public {
        uint256 id = _createFilledAndStarted();

        for (uint256 r; r < N; ++r) {
            for (uint256 i; i < N; ++i) {
                bool pays = (uint256(keccak256(abi.encode(payMask, r, i))) % 5) != 0; // ~80% paga
                if (pays) _payRound(id, people[i]);
            }
            _settle(id);
        }

        uint256 totalDebt;
        uint256 totalOwed;
        for (uint256 i; i < N; ++i) {
            TandaManager.Member memory m = tanda.getMember(id, people[i]);
            totalDebt += m.debt;
            totalOwed += m.owedToMe;
        }
        assertEq(totalDebt, totalOwed, "deuda != adeudado");

        _withdrawAll(id);
        assertEq(usdc.balanceOf(address(tanda)), 0, "quedaron fondos atrapados");

        uint256 sum;
        for (uint256 i; i < N; ++i) {
            sum += usdc.balanceOf(people[i]);
        }
        assertEq(sum, uint256(N) * 10_000e6, "se crearon o perdieron fondos");
    }
}
