// Guarda en este navegador el seed secreto de cada tanda creada, para poder revelarlo
// después sin copiarlo a mano. Es solo una comodidad: el admin debe guardar su copia.
const key = (chainId: number, manager: string, groupId: bigint | string) =>
  `tanda-seed:${chainId}:${manager.toLowerCase()}:${groupId.toString()}`;

export function saveSeed(chainId: number, manager: string, groupId: bigint, seed: string) {
  try {
    localStorage.setItem(key(chainId, manager, groupId), seed);
  } catch {
    // almacenamiento no disponible: el admin usa su copia
  }
}

export function loadSeed(chainId: number, manager: string, groupId: bigint): string {
  try {
    return localStorage.getItem(key(chainId, manager, groupId)) ?? "";
  } catch {
    return "";
  }
}
