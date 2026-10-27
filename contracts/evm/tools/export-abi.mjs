// Copia el ABI compilado de TandaManager al frontend (src/config/tandaManagerAbi.ts).
// Uso: forge build && node tools/export-abi.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const artifact = JSON.parse(readFileSync(resolve(here, "../out/TandaManager.sol/TandaManager.json"), "utf8"));
const target = resolve(here, "../../../src/config/tandaManagerAbi.ts");

const body =
  "// Generado por contracts/evm/tools/export-abi.mjs. No editar a mano.\n" +
  `export const TANDA_MANAGER_ABI = ${JSON.stringify(artifact.abi, null, 2)} as const;\n`;
writeFileSync(target, body);
console.log(`ABI exportado a ${target} (${artifact.abi.length} entradas)`);
