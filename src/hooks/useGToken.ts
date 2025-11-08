import { useAccount, useReadContract } from "wagmi";
import { erc20Abi } from "viem";

const G_TOKEN_ADDRESS =
  "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A" as `0x${string}`;

export function useGToken() {
  const { address } = useAccount();

  const { data: balance, isLoading: isLoadingBalance } = useReadContract({
    address: G_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: decimals } = useReadContract({
    address: G_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "decimals",
  });

  return {
    balance,
    decimals: decimals || 2,
    isLoadingBalance,
    address: G_TOKEN_ADDRESS,
  };
}
