// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable, Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";

/// @title TandaManager
/// @notice Tandas (ahorro rotativo) en USDC. El mismo contrato se despliega en
///         Base, Arbitrum y Polygon; cada despliegue usa el USDC nativo de su red.
///
/// Reglas:
///  - Solo el administrador (owner) crea tandas. Puede dejarlas abiertas o por invitación.
///  - Al unirse, cada miembro deposita la misma garantía.
///  - Cuando la tanda se llena, el orden de cobro se sortea (commit-reveal).
///  - Cada periodo cada miembro aporta `contribution`. Cada ronda (`periodsPerRound`
///    periodos) un miembro cobra el bote completo.
///  - Si alguien no pagó al cerrar una ronda, se cubre con su garantía. Lo que la
///    garantía no alcance queda como deuda y se descuenta del bote de esa ronda;
///    esa deuda se le retiene de su propio cobro y se reparte a quienes recibieron menos.
///  - El administrador NUNCA puede mover fondos de los miembros. Solo crea tandas,
///    revela el sorteo, cancela tandas que no han empezado y pausa la creación.
contract TandaManager is Ownable2Step, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using SafeCast for uint256;

    // ---------------------------------------------------------------------
    // Constantes
    // ---------------------------------------------------------------------

    uint8 public constant MIN_MEMBERS = 2;
    uint8 public constant MAX_MEMBERS = 50;
    uint8 public constant MAX_PERIODS_PER_ROUND = 12;
    uint16 public constant MAX_INVITES = 100;
    uint32 public constant MIN_PERIOD = 1 hours;
    uint32 public constant MAX_PERIOD = 60 days;
    uint32 public constant MAX_GRACE = 30 days;
    /// @notice Tiempo que tiene el admin para revelar el sorteo una vez llena la tanda.
    ///         Si no lo hace, cualquiera puede cancelarla y todos recuperan su garantía.
    uint64 public constant REVEAL_WINDOW = 3 days;

    // ---------------------------------------------------------------------
    // Tipos
    // ---------------------------------------------------------------------

    enum Status {
        Open, // aceptando miembros
        Filled, // llena, esperando el sorteo
        Active, // en curso
        Completed, // todas las rondas liquidadas
        Cancelled // cancelada antes de empezar; garantías devueltas
    }

    struct Config {
        uint8 members; // número de personas (= número de rondas)
        uint96 contribution; // aportación por periodo, en unidades del token (USDC = 6 decimales)
        uint96 collateral; // garantía por persona, igual para todos (puede ser 0)
        uint32 periodDuration; // segundos por periodo de pago (ej. 7 días)
        uint8 periodsPerRound; // pagos por cada cobro (ej. 4 semanas = 1 mes)
        uint32 gracePeriod; // segundos extra tras cerrar la ronda antes de liquidar
        uint64 joinDeadline; // fecha límite para llenarse (0 = sin límite)
    }

    struct Group {
        Config config;
        Status status;
        bool inviteOnly;
        uint8 roundsSettled;
        uint64 filledAt;
        uint64 startTime;
        bytes32 seedCommit;
        bytes32 fillEntropy;
        address[] members; // en orden de llegada
        address[] order; // orden de cobro tras el sorteo
    }

    struct Member {
        bool invited;
        bool joined;
        bool defaulted; // tuvo un impago que la garantía no cubrió
        bool received; // ya cobró su turno
        uint8 turn; // 1..N tras el sorteo, 0 si aún no hay sorteo
        uint16 periodsPaid; // periodos cubiertos (aportados o cubiertos por garantía)
        uint96 collateralLeft; // garantía restante
        uint128 debt; // monto no cubierto que debe al grupo
        uint128 owedToMe; // monto que me faltó en mi cobro y aún no se recupera
        uint128 claimable; // monto listo para retirar (cobro + recuperaciones)
    }

    // ---------------------------------------------------------------------
    // Estado
    // ---------------------------------------------------------------------

    IERC20 public immutable token;
    uint256 public groupCount;

    mapping(uint256 => Group) internal _groups;
    mapping(uint256 => mapping(address => Member)) internal _members;

    // ---------------------------------------------------------------------
    // Eventos
    // ---------------------------------------------------------------------

    event GroupCreated(uint256 indexed groupId, Config config, bool inviteOnly, bytes32 seedCommit);
    event Invited(uint256 indexed groupId, address indexed account);
    event Joined(uint256 indexed groupId, address indexed account, uint256 collateral);
    event Left(uint256 indexed groupId, address indexed account);
    event GroupFilled(uint256 indexed groupId, bytes32 fillEntropy);
    event OrderDrawn(uint256 indexed groupId, address[] order, uint64 startTime);
    event Contributed(uint256 indexed groupId, address indexed account, uint16 periods, uint256 amount);
    event CollateralUsed(uint256 indexed groupId, address indexed account, uint256 amount);
    event Defaulted(uint256 indexed groupId, address indexed account, uint256 uncovered);
    event RoundSettled(
        uint256 indexed groupId, uint8 indexed round, address indexed recipient, uint256 payout, uint256 shortfall
    );
    event DebtRepaid(uint256 indexed groupId, address indexed account, uint256 amount);
    event Recovered(uint256 indexed groupId, address indexed creditor, uint256 amount);
    event Withdrawn(uint256 indexed groupId, address indexed account, uint256 amount);
    event GroupCancelled(uint256 indexed groupId);
    event GroupCompleted(uint256 indexed groupId);

    // ---------------------------------------------------------------------
    // Errores
    // ---------------------------------------------------------------------

    error InvalidConfig();
    error InvalidCommit();
    error TooManyInvites();
    error UnknownGroup();
    error WrongStatus();
    error NotInvited();
    error AlreadyJoined();
    error NotMember();
    error JoinClosed();
    error RevealWindowOpen();
    error BadReveal();
    error TooEarly();
    error InvalidAmount();
    error NothingToWithdraw();

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------

    constructor(IERC20 token_, address admin) Ownable(admin) {
        if (address(token_) == address(0)) revert InvalidConfig();
        token = token_;
    }

    // ---------------------------------------------------------------------
    // Administrador
    // ---------------------------------------------------------------------

    /// @notice Crea una tanda. `invited` vacío = abierta a cualquiera hasta llenarse.
    /// @param seedCommit keccak256(abi.encode(seed)). El seed se revela al llenarse.
    function createGroup(Config calldata cfg, address[] calldata invited, bytes32 seedCommit)
        external
        onlyOwner
        whenNotPaused
        returns (uint256 groupId)
    {
        _validate(cfg);
        if (seedCommit == bytes32(0)) revert InvalidCommit();
        if (invited.length > MAX_INVITES) revert TooManyInvites();
        if (invited.length != 0 && invited.length < cfg.members) revert InvalidConfig();

        groupId = ++groupCount;
        Group storage g = _groups[groupId];
        g.config = cfg;
        g.seedCommit = seedCommit;
        g.inviteOnly = invited.length != 0;

        emit GroupCreated(groupId, cfg, g.inviteOnly, seedCommit);

        for (uint256 i; i < invited.length; ++i) {
            address a = invited[i];
            if (a == address(0)) revert InvalidConfig();
            Member storage m = _members[groupId][a];
            if (!m.invited) {
                m.invited = true;
                emit Invited(groupId, a);
            }
        }
    }

    /// @notice Revela el seed, sortea el orden de cobro y arranca la tanda.
    function revealAndStart(uint256 groupId, bytes32 seed) external onlyOwner {
        Group storage g = _group(groupId);
        if (g.status != Status.Filled) revert WrongStatus();
        if (keccak256(abi.encode(seed)) != g.seedCommit) revert BadReveal();

        uint256 n = g.members.length;
        address[] memory shuffled = g.members;
        bytes32 rand = keccak256(abi.encode(seed, g.fillEntropy, groupId));
        // Fisher-Yates
        for (uint256 i = n - 1; i > 0; --i) {
            uint256 j = uint256(keccak256(abi.encode(rand, i))) % (i + 1);
            (shuffled[i], shuffled[j]) = (shuffled[j], shuffled[i]);
        }
        for (uint256 k; k < n; ++k) {
            g.order.push(shuffled[k]);
            _members[groupId][shuffled[k]].turn = (k + 1).toUint8();
        }

        g.status = Status.Active;
        g.startTime = block.timestamp.toUint64();
        emit OrderDrawn(groupId, shuffled, g.startTime);
    }

    /// @notice Cancela una tanda que todavía no empieza. Todos recuperan su garantía.
    function cancelGroup(uint256 groupId) external onlyOwner {
        Group storage g = _group(groupId);
        if (g.status != Status.Open && g.status != Status.Filled) revert WrongStatus();
        g.status = Status.Cancelled;
        emit GroupCancelled(groupId);
    }

    /// @notice Pausa solo la creación de tandas y la entrada de miembros.
    ///         Aportar, liquidar y retirar siguen funcionando para no atrapar fondos.
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ---------------------------------------------------------------------
    // Miembros: entrar / salir antes de empezar
    // ---------------------------------------------------------------------

    function join(uint256 groupId) external nonReentrant whenNotPaused {
        Group storage g = _group(groupId);
        if (g.status != Status.Open) revert WrongStatus();
        if (g.config.joinDeadline != 0 && block.timestamp > g.config.joinDeadline) revert JoinClosed();

        Member storage m = _members[groupId][msg.sender];
        if (m.joined) revert AlreadyJoined();
        if (g.inviteOnly && !m.invited) revert NotInvited();

        m.joined = true;
        m.collateralLeft = g.config.collateral;
        g.members.push(msg.sender);

        if (g.config.collateral > 0) {
            token.safeTransferFrom(msg.sender, address(this), g.config.collateral);
        }
        emit Joined(groupId, msg.sender, g.config.collateral);

        if (g.members.length == g.config.members) {
            g.status = Status.Filled;
            g.filledAt = block.timestamp.toUint64();
            // Entropía que el admin no conoce al hacer el commit: impide que elija el seed
            // a conveniencia. En L2 el secuenciador influye en ella; ver README.
            g.fillEntropy = keccak256(abi.encode(blockhash(block.number - 1), block.prevrandao, block.timestamp));
            emit GroupFilled(groupId, g.fillEntropy);
        }
    }

    /// @notice Salir de una tanda que aún no se llena. Devuelve la garantía.
    function leave(uint256 groupId) external nonReentrant {
        Group storage g = _group(groupId);
        if (g.status != Status.Open) revert WrongStatus();
        Member storage m = _members[groupId][msg.sender];
        if (!m.joined) revert NotMember();

        uint256 refund = m.collateralLeft;
        m.joined = false;
        m.collateralLeft = 0;

        address[] storage list = g.members;
        uint256 len = list.length;
        for (uint256 i; i < len; ++i) {
            if (list[i] == msg.sender) {
                list[i] = list[len - 1];
                list.pop();
                break;
            }
        }

        if (refund > 0) token.safeTransfer(msg.sender, refund);
        emit Left(groupId, msg.sender);
    }

    /// @notice Si el admin no revela el sorteo a tiempo, cualquiera puede cancelar.
    function cancelUnrevealed(uint256 groupId) external {
        Group storage g = _group(groupId);
        if (g.status != Status.Filled) revert WrongStatus();
        if (block.timestamp <= g.filledAt + REVEAL_WINDOW) revert RevealWindowOpen();
        g.status = Status.Cancelled;
        emit GroupCancelled(groupId);
    }

    /// @notice Si la tanda no se llenó antes de su fecha límite, cualquiera puede cancelar.
    function cancelExpired(uint256 groupId) external {
        Group storage g = _group(groupId);
        if (g.status != Status.Open) revert WrongStatus();
        if (g.config.joinDeadline == 0 || block.timestamp <= g.config.joinDeadline) revert TooEarly();
        g.status = Status.Cancelled;
        emit GroupCancelled(groupId);
    }

    // ---------------------------------------------------------------------
    // Miembros: aportar y liquidar
    // ---------------------------------------------------------------------

    /// @notice Paga `periods` periodos. Se puede adelantar hasta el final de la ronda actual.
    function contribute(uint256 groupId, uint16 periods) external nonReentrant {
        Group storage g = _group(groupId);
        if (g.status != Status.Active) revert WrongStatus();
        Member storage m = _members[groupId][msg.sender];
        if (!m.joined) revert NotMember();
        if (periods == 0) revert InvalidAmount();

        uint256 newPaid = uint256(m.periodsPaid) + periods;
        if (newPaid > _payableUpTo(g)) revert InvalidAmount();

        m.periodsPaid = newPaid.toUint16();
        uint256 amount = uint256(g.config.contribution) * periods;
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit Contributed(groupId, msg.sender, periods, amount);
    }

    /// @notice Cierra la siguiente ronda pendiente y acredita el bote a quien le toca.
    ///         Cualquiera puede llamarla una vez pasado el cierre + periodo de gracia.
    function settleRound(uint256 groupId) external nonReentrant {
        Group storage g = _group(groupId);
        if (g.status != Status.Active) revert WrongStatus();

        uint8 r = g.roundsSettled;
        if (block.timestamp < settleTime(groupId)) revert TooEarly();

        Config memory c = g.config;
        address recipient = g.order[r];
        uint16 required = ((uint256(r) + 1) * c.periodsPerRound).toUint16();

        uint256 shortfall; // lo que falta en el bote por impagos de otros
        uint256 ownGap; // lo que el propio receptor no pagó ni cubrió con garantía

        uint256 n = g.order.length;
        for (uint256 i; i < n; ++i) {
            address a = g.order[i];
            Member storage m = _members[groupId][a];
            if (m.periodsPaid >= required) continue;

            uint256 due = uint256(required - m.periodsPaid) * c.contribution;
            uint256 used = due < m.collateralLeft ? due : m.collateralLeft;
            if (used > 0) {
                m.collateralLeft -= used.toUint96();
                emit CollateralUsed(groupId, a, used);
            }
            m.periodsPaid = required;

            uint256 uncovered = due - used;
            if (uncovered == 0) continue;

            m.defaulted = true;
            emit Defaulted(groupId, a, uncovered);
            if (a == recipient) {
                ownGap += uncovered;
            } else {
                m.debt += uncovered.toUint128();
                shortfall += uncovered;
            }
        }

        uint256 gross = uint256(c.members) * c.periodsPerRound * c.contribution;
        uint256 payout = gross - shortfall - ownGap;

        Member storage rec = _members[groupId][recipient];
        rec.received = true;
        rec.owedToMe += shortfall.toUint128();

        // Si el receptor debe de rondas anteriores, se le retiene y se reparte a sus acreedores.
        uint256 withheld = payout < rec.debt ? payout : rec.debt;
        if (withheld > 0) {
            rec.debt -= withheld.toUint128();
            payout -= withheld;
        }

        rec.claimable += payout.toUint128();
        g.roundsSettled = r + 1;
        emit RoundSettled(groupId, r, recipient, payout, shortfall + ownGap);

        if (withheld > 0) _distributeRecovery(groupId, g, withheld, recipient);

        if (r + 1 == c.members) {
            g.status = Status.Completed;
            emit GroupCompleted(groupId);
        }
    }

    /// @notice Pagar deuda pendiente. Lo pagado se reparte a quienes cobraron de menos.
    function repayDebt(uint256 groupId, uint256 amount) external nonReentrant {
        Group storage g = _group(groupId);
        Member storage m = _members[groupId][msg.sender];
        if (amount == 0 || amount > m.debt) revert InvalidAmount();

        m.debt -= amount.toUint128();
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit DebtRepaid(groupId, msg.sender, amount);
        _distributeRecovery(groupId, g, amount, msg.sender);
    }

    /// @notice Retira todo lo disponible: cobros y recuperaciones en cualquier momento;
    ///         la garantía restante cuando la tanda terminó o se canceló.
    function withdraw(uint256 groupId) external nonReentrant {
        Group storage g = _group(groupId);
        Member storage m = _members[groupId][msg.sender];

        uint256 amount = m.claimable;
        m.claimable = 0;

        if (g.status == Status.Completed || g.status == Status.Cancelled) {
            amount += m.collateralLeft;
            m.collateralLeft = 0;
        }

        if (amount == 0) revert NothingToWithdraw();
        token.safeTransfer(msg.sender, amount);
        emit Withdrawn(groupId, msg.sender, amount);
    }

    // ---------------------------------------------------------------------
    // Lectura
    // ---------------------------------------------------------------------

    function getGroup(uint256 groupId)
        external
        view
        returns (
            Config memory config,
            Status status,
            bool inviteOnly,
            uint8 roundsSettled,
            uint64 filledAt,
            uint64 startTime,
            address[] memory members,
            address[] memory order
        )
    {
        Group storage g = _group(groupId);
        return (g.config, g.status, g.inviteOnly, g.roundsSettled, g.filledAt, g.startTime, g.members, g.order);
    }

    function getMember(uint256 groupId, address account) external view returns (Member memory) {
        return _members[groupId][account];
    }

    /// @notice Ronda en curso (0-indexada). Solo tiene sentido con la tanda activa.
    function currentRound(uint256 groupId) public view returns (uint256) {
        Group storage g = _group(groupId);
        if (g.status != Status.Active) return g.roundsSettled;
        uint256 roundLen = uint256(g.config.periodDuration) * g.config.periodsPerRound;
        uint256 r = (block.timestamp - g.startTime) / roundLen;
        return r >= g.config.members ? g.config.members - 1 : r;
    }

    /// @notice Periodos que `account` debe tener pagados al cerrar la ronda en curso.
    function periodsDue(uint256 groupId, address account) external view returns (uint256) {
        Group storage g = _group(groupId);
        if (g.status != Status.Active) return 0;
        uint256 required = (currentRound(groupId) + 1) * g.config.periodsPerRound;
        uint256 paid = _members[groupId][account].periodsPaid;
        return paid >= required ? 0 : required - paid;
    }

    /// @notice Momento a partir del cual se puede liquidar la siguiente ronda.
    function settleTime(uint256 groupId) public view returns (uint256) {
        Group storage g = _group(groupId);
        uint256 roundLen = uint256(g.config.periodDuration) * g.config.periodsPerRound;
        return uint256(g.startTime) + (uint256(g.roundsSettled) + 1) * roundLen + g.config.gracePeriod;
    }

    // ---------------------------------------------------------------------
    // Internas
    // ---------------------------------------------------------------------

    function _group(uint256 groupId) internal view returns (Group storage g) {
        if (groupId == 0 || groupId > groupCount) revert UnknownGroup();
        g = _groups[groupId];
    }

    function _validate(Config calldata c) internal view {
        if (c.members < MIN_MEMBERS || c.members > MAX_MEMBERS) revert InvalidConfig();
        if (c.contribution == 0) revert InvalidConfig();
        if (c.periodDuration < MIN_PERIOD || c.periodDuration > MAX_PERIOD) revert InvalidConfig();
        if (c.periodsPerRound == 0 || c.periodsPerRound > MAX_PERIODS_PER_ROUND) revert InvalidConfig();
        if (c.gracePeriod > MAX_GRACE) revert InvalidConfig();
        if (c.joinDeadline != 0 && c.joinDeadline <= block.timestamp) revert InvalidConfig();
    }

    function _payableUpTo(Group storage g) internal view returns (uint256) {
        uint256 roundLen = uint256(g.config.periodDuration) * g.config.periodsPerRound;
        uint256 r = (block.timestamp - g.startTime) / roundLen;
        if (r < g.roundsSettled) r = g.roundsSettled; // nunca menos que lo ya liquidado
        if (r >= g.config.members) r = g.config.members - 1;
        return (r + 1) * g.config.periodsPerRound;
    }

    /// @dev Reparte `amount` entre quienes cobraron de menos, en orden de turno.
    function _distributeRecovery(uint256 groupId, Group storage g, uint256 amount, address payer) internal {
        uint256 n = g.order.length;
        for (uint256 i; i < n && amount > 0; ++i) {
            address a = g.order[i];
            Member storage m = _members[groupId][a];
            if (m.owedToMe == 0) continue;
            uint256 part = amount < m.owedToMe ? amount : m.owedToMe;
            m.owedToMe -= part.toUint128();
            m.claimable += part.toUint128();
            amount -= part;
            emit Recovered(groupId, a, part);
        }
        // No debería sobrar (toda deuda tiene un acreedor), pero si sobra, regresa a quien pagó.
        if (amount > 0) _members[groupId][payer].claimable += amount.toUint128();
    }
}
