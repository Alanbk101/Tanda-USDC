import { formatUnits, parseUnits } from "viem";

export const USDC_DECIMALS = 6;

export enum TandaStatus {
  Open = 0,
  Filled = 1,
  Active = 2,
  Completed = 3,
  Cancelled = 4,
}

export const STATUS_LABEL: Record<TandaStatus, string> = {
  [TandaStatus.Open]: "Abierta",
  [TandaStatus.Filled]: "Llena · esperando sorteo",
  [TandaStatus.Active]: "En curso",
  [TandaStatus.Completed]: "Terminada",
  [TandaStatus.Cancelled]: "Cancelada",
};

export const REVEAL_WINDOW_SECONDS = 3 * 24 * 60 * 60;

export interface TandaConfig {
  members: number;
  contribution: bigint;
  collateral: bigint;
  periodDuration: number;
  periodsPerRound: number;
  gracePeriod: number;
  joinDeadline: bigint;
}

export interface TandaGroup {
  id: bigint;
  config: TandaConfig;
  status: TandaStatus;
  inviteOnly: boolean;
  roundsSettled: number;
  filledAt: bigint;
  startTime: bigint;
  members: readonly `0x${string}`[];
  order: readonly `0x${string}`[];
}

export interface TandaMember {
  invited: boolean;
  joined: boolean;
  defaulted: boolean;
  received: boolean;
  turn: number;
  periodsPaid: number;
  collateralLeft: bigint;
  debt: bigint;
  owedToMe: bigint;
  claimable: bigint;
}

/** Convierte la tupla de `getGroup` en un objeto. */
export function toGroup(id: bigint, r: readonly unknown[]): TandaGroup {
  const [config, status, inviteOnly, roundsSettled, filledAt, startTime, members, order] = r as [
    TandaConfig,
    number,
    boolean,
    number,
    bigint,
    bigint,
    readonly `0x${string}`[],
    readonly `0x${string}`[],
  ];
  return {
    id,
    config: {
      members: Number(config.members),
      contribution: BigInt(config.contribution),
      collateral: BigInt(config.collateral),
      periodDuration: Number(config.periodDuration),
      periodsPerRound: Number(config.periodsPerRound),
      gracePeriod: Number(config.gracePeriod),
      joinDeadline: BigInt(config.joinDeadline),
    },
    status: Number(status) as TandaStatus,
    inviteOnly,
    roundsSettled: Number(roundsSettled),
    filledAt: BigInt(filledAt),
    startTime: BigInt(startTime),
    members,
    order,
  };
}

export function usdc(amount: bigint | undefined): string {
  if (amount === undefined) return "—";
  const n = Number(formatUnits(amount, USDC_DECIMALS));
  return n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function parseUsdc(value: string): bigint {
  return parseUnits(value.trim() === "" ? "0" : value.trim(), USDC_DECIMALS);
}

/** Bote que recibe quien cobra en una ronda completa. */
export function potPerRound(c: TandaConfig): bigint {
  return c.contribution * BigInt(c.members) * BigInt(c.periodsPerRound);
}

export function roundSeconds(c: TandaConfig): number {
  return c.periodDuration * c.periodsPerRound;
}

const UNITS: [number, string, string][] = [
  [30 * 86400, "mes", "meses"],
  [7 * 86400, "semana", "semanas"],
  [86400, "día", "días"],
  [3600, "hora", "horas"],
  [60, "minuto", "minutos"],
];

/** "1 semana", "2 semanas", "1 hora"... */
export function formatDuration(seconds: number): string {
  for (const [size, one, many] of UNITS) {
    if (seconds >= size && seconds % size === 0) {
      const n = seconds / size;
      return `${n} ${n === 1 ? one : many}`;
    }
  }
  const days = seconds / 86400;
  if (days >= 1) return `${days.toFixed(1)} días`;
  return `${Math.round(seconds / 3600)} horas`;
}

/** "cada semana", "cada 4 semanas", "cada hora"... */
export function every(seconds: number): string {
  for (const [size, one, many] of UNITS) {
    if (seconds >= size && seconds % size === 0) {
      const n = seconds / size;
      return n === 1 ? `cada ${one}` : `cada ${n} ${many}`;
    }
  }
  return `cada ${formatDuration(seconds)}`;
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function formatDate(unixSeconds: bigint | number): string {
  const ms = Number(unixSeconds) * 1000;
  return new Date(ms).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}

export function shortAddress(a: string | undefined): string {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";
}

export function sameAddress(a?: string, b?: string): boolean {
  return !!a && !!b && a.toLowerCase() === b.toLowerCase();
}

/** Ronda en curso según el reloj (0-indexada), acotada al número de rondas. */
export function currentRoundAt(g: TandaGroup, now: number): number {
  if (g.status !== TandaStatus.Active) return g.roundsSettled;
  const r = Math.floor((now - Number(g.startTime)) / roundSeconds(g.config));
  return Math.max(g.roundsSettled, Math.min(r, g.config.members - 1));
}

/** Momento en que se puede liquidar la siguiente ronda pendiente. */
export function settleTimeOf(g: TandaGroup): number {
  return Number(g.startTime) + (g.roundsSettled + 1) * roundSeconds(g.config) + g.config.gracePeriod;
}

/** Periodos que aún puede pagar hoy (hasta el final de la ronda en curso). */
export function payableNow(g: TandaGroup, m: TandaMember, now: number): number {
  const maxPaid = (currentRoundAt(g, now) + 1) * g.config.periodsPerRound;
  return Math.max(0, maxPaid - m.periodsPaid);
}
