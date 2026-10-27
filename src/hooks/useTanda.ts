import { useMemo } from "react";
import { erc20Abi } from "viem";
import { useAccount, useChainId, useReadContract, useReadContracts } from "wagmi";
import { TANDA_MANAGER_ABI } from "@/config/tandaManagerAbi";
import { getNetwork } from "@/config/networks";
import { toGroup, type TandaGroup, type TandaMember } from "@/lib/tanda";

const REFRESH_MS = 15_000;
/** Cuántas tandas recientes se listan. */
const MAX_LISTED = 30;

export function useTandaNetwork() {
  const chainId = useChainId();
  const network = getNetwork(chainId);
  return { chainId, network, manager: network?.tandaManager };
}

export function useGroups() {
  const { chainId, manager } = useTandaNetwork();

  const countQuery = useReadContract({
    address: manager,
    abi: TANDA_MANAGER_ABI,
    functionName: "groupCount",
    chainId,
    query: { enabled: !!manager, refetchInterval: REFRESH_MS },
  });

  const count = Number(countQuery.data ?? 0n);
  const ids = useMemo(() => {
    const list: bigint[] = [];
    for (let i = count; i >= 1 && list.length < MAX_LISTED; i--) list.push(BigInt(i));
    return list;
  }, [count]);

  const groupsQuery = useReadContracts({
    contracts: ids.map((id) => ({
      address: manager!,
      abi: TANDA_MANAGER_ABI,
      functionName: "getGroup" as const,
      args: [id] as const,
      chainId,
    })),
    query: { enabled: !!manager && ids.length > 0, refetchInterval: REFRESH_MS },
  });

  const groups: TandaGroup[] = useMemo(
    () =>
      (groupsQuery.data ?? []).flatMap((r, i) =>
        r.status === "success" ? [toGroup(ids[i], r.result as readonly unknown[])] : [],
      ),
    [groupsQuery.data, ids],
  );

  return {
    count,
    groups,
    isLoading: countQuery.isLoading || (ids.length > 0 && groupsQuery.isLoading),
    error: countQuery.error ?? groupsQuery.error,
  };
}

export function useOwner() {
  const { chainId, manager } = useTandaNetwork();
  const { address } = useAccount();
  const { data: owner } = useReadContract({
    address: manager,
    abi: TANDA_MANAGER_ABI,
    functionName: "owner",
    chainId,
    query: { enabled: !!manager },
  });
  const isAdmin = !!owner && !!address && owner.toLowerCase() === address.toLowerCase();
  return { owner, isAdmin };
}

export function useMember(groupId: bigint | undefined) {
  const { chainId, manager } = useTandaNetwork();
  const { address } = useAccount();
  const q = useReadContract({
    address: manager,
    abi: TANDA_MANAGER_ABI,
    functionName: "getMember",
    args: groupId !== undefined && address ? [groupId, address] : undefined,
    chainId,
    query: { enabled: !!manager && !!address && groupId !== undefined, refetchInterval: REFRESH_MS },
  });
  const raw = q.data as
    | {
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
    | undefined;
  const member: TandaMember | undefined = raw
    ? {
        invited: raw.invited,
        joined: raw.joined,
        defaulted: raw.defaulted,
        received: raw.received,
        turn: Number(raw.turn),
        periodsPaid: Number(raw.periodsPaid),
        collateralLeft: BigInt(raw.collateralLeft),
        debt: BigInt(raw.debt),
        owedToMe: BigInt(raw.owedToMe),
        claimable: BigInt(raw.claimable),
      }
    : undefined;
  return { member, isLoading: q.isLoading };
}

export function useUsdcBalance() {
  const { chainId, network } = useTandaNetwork();
  const { address } = useAccount();
  const { data } = useReadContract({
    address: network?.usdc,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: !!network && !!address, refetchInterval: REFRESH_MS },
  });
  return data;
}
