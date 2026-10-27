# TandaManager (EVM)

Contrato de tandas en USDC para **Base, Arbitrum y Polygon**. Es el mismo código en las tres redes; cada despliegue usa el USDC nativo de Circle de su red (`script/Networks.sol`).

## Reglas

| Tema | Cómo funciona |
|---|---|
| Quién crea | Solo la wallet administradora (`owner`). Puede dejar la tanda abierta o pasar una lista de invitados. |
| Opciones por tanda | Número de personas (2 a 50), aportación por periodo, garantía, duración del periodo, periodos por cobro, días de gracia y fecha límite para llenarse. |
| Garantía | Igual para todos. Se deposita al entrar y se devuelve al terminar. |
| Turnos | Sorteo al llenarse la tanda (commit-reveal, ver abajo). |
| Cobro | Al cerrar cada ronda + gracia, cualquiera llama `settleRound`. El bote queda acreditado y quien le toca lo retira con `withdraw`. |
| Si alguien no paga | Se cubre con su garantía. Lo que no alcance queda como deuda, el bote de esa ronda sale con menos, y esa deuda se le retiene de su propio cobro para pagarle a quien recibió de menos. También puede pagarla con `repayDebt`. |
| Poderes del admin | Crear tandas, revelar el sorteo, cancelar tandas que no han empezado, pausar la creación y la entrada. **No puede mover fondos de nadie.** |
| Pausa | Solo bloquea crear y entrar. Aportar, liquidar y retirar siguen funcionando para no provocar impagos ni atrapar fondos. |

Ejemplo por defecto: 10 personas × 15 USDC por semana, cobro cada 4 semanas = 600 USDC al mes durante 10 meses, con 30 USDC de garantía.

## Sorteo

1. Al crear la tanda, el admin publica `keccak256(abi.encode(seed))` sin revelar el seed.
2. Cuando entra la última persona, el contrato guarda entropía del bloque, que el admin no podía conocer al hacer el commit.
3. El admin revela el seed con `revealAndStart` y el orden sale de `seed + entropía + id`.
4. Si el admin no revela en 3 días, cualquiera puede cancelar con `cancelUnrevealed` y todos recuperan su garantía.

Así, el admin no puede elegir un seed a su conveniencia y quien entra al final no puede predecir el orden. Límite conocido: en L2 el secuenciador influye en la entropía del bloque. Para montos grandes conviene migrar a Chainlink VRF.

## Uso

Requiere [Foundry](https://book.getfoundry.sh/getting-started/installation) y Node.

```bash
cd contracts/evm
npm install            # OpenZeppelin y forge-std
forge test -vv         # 15 pruebas, incluida una de conservación de fondos con 512 escenarios
cp .env.example .env   # y llénalo
source .env
```

### Desplegar (empieza por testnets)

```bash
# Base Sepolia
forge script script/Deploy.s.sol:Deploy --rpc-url base_sepolia --account <tu-keystore> --broadcast --verify

# Arbitrum Sepolia
forge script script/Deploy.s.sol:Deploy --rpc-url arbitrum_sepolia --account <tu-keystore> --broadcast --verify

# Polygon Amoy
forge script script/Deploy.s.sol:Deploy --rpc-url polygon_amoy --account <tu-keystore> --broadcast --verify
```

Para mainnet, cambia a `base`, `arbitrum` o `polygon`. Importa tu llave una sola vez con `cast wallet import <nombre> --interactive` para no dejarla en texto plano.

### Crear una tanda y arrancar el sorteo

```bash
# Crear (usa TANDA_MANAGER y TANDA_SEED del .env)
forge script script/Tanda.s.sol:CreateTanda --rpc-url base_sepolia --account <tu-keystore> --broadcast

# Cuando se llene: revelar y sortear
forge script script/Tanda.s.sol:RevealTanda --rpc-url base_sepolia --account <tu-keystore> --broadcast
```

## Antes de mainnet

- Hacer una ronda real completa en testnet con personas de verdad.
- Que el `owner` sea un multisig (Safe), no una wallet personal.
- Auditoría externa. Las pruebas cubren los flujos principales, pero no sustituyen una auditoría.
