import { useEffect, useState } from 'react'
import { useReadContract, useChainId } from 'wagmi'
import { TIPCHAIN_ABI, getTipChainContractAddress, NETWORK_CONFIGS, SupportedNetworks } from '../config/contracts'

export interface Creator {
  address: string
  basename: string
  displayName: string
  bio: string
  avatarUrl: string
  totalTipsReceived: bigint
  tipCount: bigint
  isActive: boolean
  createdAt: bigint
  network: string
  chainId: number
}

interface CreatorData {
  basename: string
  displayName: string
  bio: string
  avatarUrl: string
  totalTipsReceived: bigint
  tipCount: bigint
  isActive: boolean
  createdAt: bigint
}

const SUPPORTED_NETWORKS = Object.values(SupportedNetworks)

/**
 * Hook to fetch a single creator from current network
 */
export function useCreator(address?: string) {
  const chainId = useChainId()
  const contractAddress = chainId ? getTipChainContractAddress(chainId) : ''

  const { data, isLoading, error } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TIPCHAIN_ABI,
    functionName: 'getCreator',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  })

  const creator: Creator | null = data && (data as CreatorData)[6] ? {
    address: address!,
    basename: (data as CreatorData)[0],
    displayName: (data as CreatorData)[1],
    bio: (data as CreatorData)[2],
    avatarUrl: (data as CreatorData)[3],
    totalTipsReceived: (data as CreatorData)[4],
    tipCount: (data as CreatorData)[5],
    isActive: (data as CreatorData)[6],
    createdAt: (data as CreatorData)[7],
    network: Object.keys(NETWORK_CONFIGS).find(
      key => NETWORK_CONFIGS[key as SupportedNetworks].chainId === chainId
    ) || '',
    chainId: chainId || 0,
  } : null

  return { creator, isLoading, error }
}

/**
 * Hook to fetch creator by basename from current network
 */
export function useCreatorByBasename(basename?: string) {
  const chainId = useChainId()
  const contractAddress = chainId ? getTipChainContractAddress(chainId) : ''

  const { data: address } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TIPCHAIN_ABI,
    functionName: 'getCreatorByBasename',
    args: basename ? [basename] : undefined,
    query: {
      enabled: !!basename && !!contractAddress,
    },
  })

  return useCreator(address as string)
}

/**
 * Hook to fetch tips received by a creator
 */
export function useTipsReceived(address?: string) {
  const chainId = useChainId()
  const contractAddress = chainId ? getTipChainContractAddress(chainId) : ''

  const { data, isLoading, error } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TIPCHAIN_ABI,
    functionName: 'getTipsReceived',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  })

  return { tips: data || [], isLoading, error }
}

/**
 * Hook to fetch all creators from current network
 */
export function useCreatorsFromNetwork() {
  const chainId = useChainId()
  const contractAddress = chainId ? getTipChainContractAddress(chainId) : ''

  const { data: count } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TIPCHAIN_ABI,
    functionName: 'getCreatorCount',
    query: {
      enabled: !!contractAddress,
    },
  })

  const { data: creatorAddresses } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TIPCHAIN_ABI,
    functionName: 'getTopCreators',
    args: count ? [count] : undefined,
    query: {
      enabled: !!contractAddress && !!count && Number(count) > 0,
    },
  })

  return {
    addresses: creatorAddresses as string[] || [],
    count: Number(count || 0),
  }
}

/**
 * Hook to fetch creators from all supported networks
 */
export function useAllCreators() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchAllCreators = async () => {
      try {
        setIsLoading(true)
        const allCreators: Creator[] = []

        // This is a simplified version - in production, you'd want to use a multicall
        // or a backend service to aggregate data from all networks
        
        // For now, we'll return mock data to demonstrate the UI
        // In production, implement proper multi-chain querying
        
        setCreators(allCreators)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllCreators()
  }, [])

  return { creators, isLoading, error }
}

/**
 * Hook to get network badge info
 */
export function useNetworkInfo(chainId: number) {
  const networkKey = Object.keys(NETWORK_CONFIGS).find(
    key => NETWORK_CONFIGS[key as SupportedNetworks].chainId === chainId
  ) as SupportedNetworks | undefined

  if (!networkKey) return null

  const config = NETWORK_CONFIGS[networkKey]
  
  return {
    name: config.name,
    chainId: config.chainId,
    shortName: getShortNetworkName(config.name),
    color: getNetworkColor(networkKey),
  }
}

function getShortNetworkName(fullName: string): string {
  if (fullName.includes('Celo Alfajores')) return 'Celo Testnet'
  if (fullName.includes('Celo')) return 'Celo'
  if (fullName.includes('Base Sepolia')) return 'Base Testnet'
  if (fullName.includes('Base')) return 'Base'
  return fullName
}

function getNetworkColor(network: SupportedNetworks): string {
  const colors: Record<SupportedNetworks, string> = {
    [SupportedNetworks.CELO]: 'bg-yellow-500',
    [SupportedNetworks.CELO_ALFAJORES]: 'bg-yellow-400',
    [SupportedNetworks.BASE]: 'bg-blue-500',
    [SupportedNetworks.BASE_SEPOLIA]: 'bg-blue-400',
  }
  return colors[network] || 'bg-gray-500'
}