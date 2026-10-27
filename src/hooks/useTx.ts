import { useState } from "react";
import { type Abi, type PublicClient, BaseError, ContractFunctionRevertedError, UserRejectedRequestError, erc20Abi } from "viem";
import { useAccount, useConfig, usePublicClient, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { explorerTxUrl } from "@/config/networks";
import { useTandaNetwork } from "@/hooks/useTanda";

const ERRORS: Record<string, string> = {
  NotInvited: "Esta wallet no está invitada a la tanda.",
  AlreadyJoined: "Ya estás en esta tanda.",
  NotMember: "No eres parte de esta tanda.",
  JoinClosed: "La fecha límite para unirse ya pasó.",
  WrongStatus: "La tanda no está en el estado correcto para esto. Recarga la página.",
  TooEarly: "Todavía no es momento. Espera a que cierre la ronda.",
  InvalidAmount: "Monto o número de periodos no válido.",
  NothingToWithdraw: "No tienes nada que retirar.",
  BadReveal: "El seed no coincide con el que se usó al crear la tanda.",
  RevealWindowOpen: "El admin todavía tiene tiempo para revelar el sorteo.",
  InvalidConfig: "Configuración no válida. Revisa los campos.",
  InvalidCommit: "Falta el compromiso del sorteo.",
  TooManyInvites: "Demasiados invitados (máximo 100).",
  EnforcedPause: "La creación y entrada a tandas está pausada.",
  OwnableUnauthorizedAccount: "Solo el administrador puede hacer esto.",
  ERC20InsufficientBalance: "No tienes suficiente USDC.",
  ERC20InsufficientAllowance: "Falta aprobar el USDC.",
};

export function txErrorMessage(err: unknown): string {
  if (err instanceof BaseError) {
    if (err.walk((e) => e instanceof UserRejectedRequestError)) return "Cancelaste la transacción.";
    const reverted = err.walk((e) => e instanceof ContractFunctionRevertedError);
    if (reverted instanceof ContractFunctionRevertedError) {
      const name = reverted.data?.errorName;
      if (name && ERRORS[name]) return ERRORS[name];
      if (name) return `El contrato rechazó la operación (${name}).`;
    }
    if (/insufficient funds/i.test(err.message)) return "No tienes suficiente saldo para pagar la comisión de red.";
    return err.shortMessage;
  }
  return err instanceof Error ? err.message : "Algo salió mal.";
}

type WriteArgs = Parameters<ReturnType<typeof useWriteContract>["writeContractAsync"]>[0];

/** Llamada a escribir en un contrato. Tipado laxo a propósito: wagmi exige un tipo por red. */
export interface WriteRequest {
  address: `0x${string}`;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
}

/** Envía transacciones, espera confirmación, avisa con toasts y refresca las lecturas. */
export function useTx() {
  const config = useConfig();
  const { address } = useAccount();
  const { chainId, network } = useTandaNetwork();
  const publicClient = usePublicClient({ chainId });
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);

  async function send(label: string, request: WriteRequest) {
    const id = toast.loading(`${label}: confirma en tu wallet…`);
    try {
      const hash = await writeContractAsync({ ...request, chainId } as unknown as WriteArgs);
      toast.loading(`${label}: esperando confirmación de la red…`, { id });
      const receipt = await waitForTransactionReceipt(config, { hash, chainId });
      if (receipt.status !== "success") throw new Error("La transacción falló en la red.");
      const url = explorerTxUrl(chainId, hash);
      toast.success(`${label}: listo`, {
        id,
        action: url ? { label: "Ver", onClick: () => window.open(url, "_blank", "noopener") } : undefined,
      });
      return receipt;
    } catch (err) {
      toast.error(`${label}: ${txErrorMessage(err)}`, { id });
      throw err;
    }
  }

  /** Aprueba USDC solo si la aprobación actual no alcanza. Aprueba el monto exacto. */
  async function ensureAllowance(spender: `0x${string}`, amount: bigint) {
    if (!network || !address || !publicClient || amount === 0n) return;
    // Cast: los tipos de viem con varias redes a la vez no resuelven bien esta llamada.
    const current = (await (publicClient as PublicClient).readContract({
      address: network.usdc,
      abi: erc20Abi,
      functionName: "allowance",
      args: [address, spender],
    } as unknown as Parameters<PublicClient["readContract"]>[0])) as bigint;
    if (current >= amount) return;
    await send("Aprobar USDC", {
      address: network.usdc,
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, amount],
    });
  }

  /** Ejecuta un flujo (puede incluir aprobar + acción) bloqueando la UI mientras corre. */
  async function run(key: string, flow: () => Promise<unknown>) {
    setBusy(key);
    try {
      await flow();
    } catch {
      // el toast ya mostró el error
    } finally {
      setBusy(null);
      await queryClient.invalidateQueries();
    }
  }

  return { send, ensureAllowance, run, busy };
}
