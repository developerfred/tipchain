import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, TrendingUp, Users,Heart, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { CreatorCard } from '../components/CreatorCard'
import { useChainId } from 'wagmi'
import { isNetworkSupported, SupportedNetworks, NETWORK_CONFIGS } from '../config/contracts'
import { formatEth } from '../lib/utils'
import type { Creator } from '../hooks/useCreators'
import { createPublicClient, http } from 'viem'
import { base, baseSepolia, celo, celoAlfajores } from 'viem/chains'
import { TIPCHAIN_ABI, getTipChainContractAddress } from '../config/contracts'
import toast from 'react-hot-toast'

const CHAIN_CONFIGS = {
  [SupportedNetworks.BASE]: {
    chain: base,
    rpc: process.env.VITE_BASE_MAINNET_RPC || 'https://mainnet.base.org'
  },
  [SupportedNetworks.BASE_SEPOLIA]: {
    chain: baseSepolia,
    rpc: process.env.VITE_BASE_SEPOLIA_RPC || 'https://sepolia.base.org'
  },
  [SupportedNetworks.CELO]: {
    chain: celo,
    rpc: process.env.VITE_CELO_RPC_URL || 'https://forno.celo.org'
  },
  [SupportedNetworks.CELO_ALFAJORES]: {
    chain: celoAlfajores,
    rpc: process.env.VITE_CELO_ALFAJORES_RPC_URL || 'https://alfajores-forno.celo-testnet.org'
  },
}


const ACTIVE_NETWORKS = [
  SupportedNetworks.CELO,
  SupportedNetworks.BASE_SEPOLIA,
]

const NETWORK_FILTERS = ['All', ...ACTIVE_NETWORKS]

export function Explore() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNetwork, setSelectedNetwork] = useState<'All' | SupportedNetworks>('All')
  const [creators, setCreators] = useState<Creator[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const chainId = useChainId()
  const isSupportedNetwork = chainId ? isNetworkSupported(chainId) : false

  useEffect(() => {
    const fetchCreators = async () => {
      setIsLoading(true)
      try {
        const allCreators: Creator[] = []

        const networksToFetch = selectedNetwork === 'All'
          ? ACTIVE_NETWORKS
          : [selectedNetwork as SupportedNetworks]

        // Fetch from each network with timeout and error handling
        const results = await Promise.allSettled(
          networksToFetch.map(async (network) => {
            try {
              const config = CHAIN_CONFIGS[network]
              const contractAddress = getTipChainContractAddress(
                NETWORK_CONFIGS[network].chainId
              )

              const client = createPublicClient({
                chain: config.chain,
                transport: http(config.rpc, {
                  timeout: 10000, // 10 second timeout
                }),
              })

              // Try to get creator count with error handling
              let count: bigint
              try {
                count = await client.readContract({
                  address: contractAddress as `0x${string}`,
                  abi: TIPCHAIN_ABI,
                  functionName: 'getCreatorCount',
                }) as bigint
              } catch (error: any) {
                // If contract returns 0x or doesn't exist, skip this network
                if (error.message?.includes('0x') || error.message?.includes('returned no data')) {
                  console.log(`No contract deployed on ${network}, skipping...`)
                  return []
                }
                throw error
              }

              if (Number(count) === 0) {
                console.log(`No creators on ${network} yet`)
                return []
              }

              const addresses = await client.readContract({
                address: contractAddress as `0x${string}`,
                abi: TIPCHAIN_ABI,
                functionName: 'getTopCreators',
                args: [count],
              }) as string[]

              const creatorsData = await Promise.all(
                addresses.map(async (address) => {
                  try {
                    const data = await client.readContract({
                      address: contractAddress as `0x${string}`,
                      abi: TIPCHAIN_ABI,
                      functionName: 'getCreator',
                      args: [address],
                    }) as any

                    if (data && data[6]) { // isActive
                      return {
                        address,
                        basename: data[0],
                        displayName: data[1],
                        bio: data[2],
                        avatarUrl: data[3],
                        totalTipsReceived: data[4],
                        tipCount: data[5],
                        isActive: data[6],
                        createdAt: data[7],
                        network,
                        chainId: NETWORK_CONFIGS[network].chainId,
                      } as Creator
                    }
                    return null
                  } catch (error) {
                    console.error(`Error fetching creator ${address}:`, error)
                    return null
                  }
                })
              )

              return creatorsData.filter((c): c is Creator => c !== null)
            } catch (error: any) {
              console.error(`Error fetching from ${network}:`, error.message)
              return []
            }
          })
        )

        // Process results, ignoring failed networks
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            allCreators.push(...result.value)
          }
        })

        setCreators(allCreators)
      } catch (error) {
        console.error('Error fetching creators:', error)
        toast.error('Failed to load creators. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCreators()
  }, [selectedNetwork])

  const filteredCreators = useMemo(() => {
    return creators.filter((creator) => {
      const matchesSearch =
        creator.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.basename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.bio.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesSearch
    })
  }, [creators, searchQuery])

  const stats = useMemo(() => {
    const totalTips = filteredCreators.reduce((sum, c) => sum + Number(c.tipCount), 0)
    const totalVolume = filteredCreators.reduce((sum, c) => sum + c.totalTipsReceived, BigInt(0))

    return {
      totalCreators: filteredCreators.length,
      totalTips,
      totalVolume,
    }
  }, [filteredCreators])

  const getNetworkLabel = (network: 'All' | SupportedNetworks): string => {
    if (network === 'All') return 'All Networks'
    return NETWORK_CONFIGS[network].name
  }

  if (!isSupportedNetwork) {
    return (
      <div className="container py-24">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="text-6xl">🌐</div>
          <h1 className="text-3xl font-bold">Unsupported Network</h1>
          <p className="text-muted-foreground">
            Please switch to Celo or Base network to explore creators
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="mb-12 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Explore Creators</h1>
        <p className="text-lg text-muted-foreground">
          Discover and support amazing creators building onchain across all networks
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Creators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCreators}</div>
            <p className="text-xs text-muted-foreground">Across all networks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tips Sent</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTips}</div>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatEth(stats.totalVolume, 2)} ETH
            </div>
            <p className="text-xs text-muted-foreground">Total tipped</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search creators by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {NETWORK_FILTERS.map((network) => (
            <Button
              key={network}
              variant={selectedNetwork === network ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedNetwork(network as typeof selectedNetwork)}
            >
              {getNetworkLabel(network as typeof selectedNetwork)}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading creators from all networks...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredCreators.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery
              ? 'No creators found matching your search.'
              : 'No creators registered yet. Be the first!'}
          </p>
          {!searchQuery && (
            <Link to="/creators" className="mt-4 inline-block">
              <Button>Become a Creator</Button>
            </Link>
          )}
        </div>
      )}

      {/* Creators Grid */}
      {!isLoading && filteredCreators.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCreators.map((creator) => (
            <CreatorCard key={`${creator.chainId}-${creator.address}`} creator={creator} />
          ))}
        </div>
      )}

      {/* CTA Section */}
      <div className="mt-16 text-center space-y-4">
        <h2 className="text-2xl font-bold">Are you a creator?</h2>
        <p className="text-muted-foreground">
          Join TipChain and start receiving tips from your supporters
        </p>
        <Link to="/creators">
          <Button size="lg">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  )
}