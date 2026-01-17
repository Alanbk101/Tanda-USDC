import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContractAddress, getUSDCAddress } from '@/config/contracts';
import { TANDA_ABI, USDC_ABI } from '@/config/abis';
import { useAccount, useChainId } from 'wagmi';

export function useTanda() {
  const { address } = useAccount();
  const chainId = useChainId();
  
  const contractAddress = getContractAddress(chainId);
  const usdcAddress = getUSDCAddress(chainId);

  // Leer estado del participante
  const { data: participantStatus, refetch: refetchStatus } = useReadContract({
    address: contractAddress,
    abi: TANDA_ABI,
    functionName: 'getParticipantPaymentStatus',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Leer semana actual
  const { data: currentWeek } = useReadContract({
    address: contractAddress,
    abi: TANDA_ABI,
    functionName: 'getCurrentWeekIndex',
  });

  // Leer mes actual
  const { data: currentMonth } = useReadContract({
    address: contractAddress,
    abi: TANDA_ABI,
    functionName: 'getCurrentMonthIndex',
  });

  // Leer allowance de USDC
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddress,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, contractAddress] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Leer balance de USDC
  const { data: usdcBalance } = useReadContract({
    address: usdcAddress,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Escribir: Aprobar USDC
  const { 
    writeContract: approveWrite, 
    data: approveHash,
    isPending: isApprovePending 
  } = useWriteContract();

  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const approveUSDC = async (amount: bigint) => {
    return approveWrite({
      address: usdcAddress,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [contractAddress, amount],
    });
  };

  // Escribir: Depositar semana actual
  const { 
    writeContract: depositWrite, 
    data: depositHash,
    isPending: isDepositPending 
  } = useWriteContract();

  const { isLoading: isDepositConfirming } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  const depositCurrentWeek = async () => {
    return depositWrite({
      address: contractAddress,
      abi: TANDA_ABI,
      functionName: 'depositCurrentWeek',
    });
  };

  // Escribir: Depositar semana específica
  const depositForWeek = async (weekIndex: number) => {
    return depositWrite({
      address: contractAddress,
      abi: TANDA_ABI,
      functionName: 'depositForWeek',
      args: [BigInt(weekIndex)],
    });
  };

  return {
    // Datos
    participantStatus: participantStatus as [boolean, bigint, bigint, bigint, boolean] | undefined,
    currentWeek: currentWeek ? Number(currentWeek) : 0,
    currentMonth: currentMonth ? Number(currentMonth) : 0,
    allowance: allowance as bigint | undefined,
    usdcBalance: usdcBalance as bigint | undefined,
    
    // Acciones
    approveUSDC,
    depositCurrentWeek,
    depositForWeek,
    
    // Estados de carga
    isApprovePending: isApprovePending || isApproveConfirming,
    isDepositPending: isDepositPending || isDepositConfirming,
    
    // Refetch
    refetchStatus,
    refetchAllowance,
    
    // Addresses
    contractAddress,
    usdcAddress,
  };
}
