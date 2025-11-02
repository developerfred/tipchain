import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, TrendingUp, Users, Heart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useReadContract, useChainId } from 'wagmi'
import { TIPCHAIN_ABI, getTipChainContractAddress, isNetworkSupported } from '../config/contracts'
import { formatEth } from '../lib/utils'

const MOCK_CREATORS = [
  {
    address: '0x1234...',
    basename: 'alice',
    displayName: 'Alice the Artist',
    bio: 'Digital artist creating NFTs and onchain art',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    totalTipsReceived: '2500000000000000000',
    tipCount: 156,
    category: 'Art',
  },
  {
    address: '0x5678...',
    basename: 'bob',
    displayName: 'Bob the Builder',
    bio: 'Web3 developer building the future',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    totalTipsReceived: '1800000000000000000',
    tipCount: 89,
    category: 'Tech',
  },
  {
    address: '0x9abc...',
    basename: 'carol',
    displayName: 'Carol the Creator',
    bio: 'Content creator and streamer',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
    totalTipsReceived: '3200000000000000000',
    tipCount: 234,
    category: 'Entertainment',
  },
  {
    address: '0xdef0...',
    basename: 'david',
    displayName: 'David the DJ',
    bio: 'Electronic music producer and DJ',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    totalTipsReceived: '1500000000000000000',
    tipCount: 67,
    category: 'Music',
  },
  {
    address: '0x1111...',
    basename: 'eve',
    displayName: 'Eve the Educator',
    bio: 'Teaching Web3 and blockchain technology',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=eve',
    totalTipsReceived: '2100000000000000000',
    tipCount: 145,
    category: 'Education',
  },
  {
    address: '0x2222...',
    basename: 'frank',
    displayName: 'Frank the Photographer',
    bio: 'Capturing moments, sharing stories',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=frank',
    totalTipsReceived: '900000000000000000',
    tipCount: 42,
    category: 'Photography',
  },
]

const CATEGORIES = ['All', 'Art', 'Tech', 'Entertainment', 'Music', 'Education', 'Photography']

export function Explore() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const chainId = useChainId()
  const isSupportedNetwork = chainId ? isNetworkSupported(chainId) : false
  const contractAddress = chainId ? getTipChainContractAddress(chainId) : ''

  const { data: creatorCount } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TIPCHAIN_ABI,
    functionName: 'getCreatorCount',
    query: {
      enabled: !!contractAddress && isSupportedNetwork,
    },
  })

  const filteredCreators = MOCK_CREATORS.filter((creator) => {
    const matchesSearch =
      creator.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.basename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.bio.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === 'All' || creator.category === selectedCategory

    return matchesSearch && matchesCategory
  })

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
          Discover and support amazing creators building onchain
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Creators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_CREATORS.length}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tips Sent</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {MOCK_CREATORS.reduce((sum, c) => sum + c.tipCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all creators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatEth(
                MOCK_CREATORS.reduce((sum, c) => sum + BigInt(c.totalTipsReceived), BigInt(0))
              )} ETH
            </div>
            <p className="text-xs text-muted-foreground">Total tipped</p>
          </CardContent>
        </Card>
      </div>

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
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {filteredCreators.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No creators found matching your search.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCreators.map((creator) => (
            <Card key={creator.address} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={creator.avatarUrl}
                      alt={creator.displayName}
                      className="h-12 w-12 rounded-full"
                    />
                    <div>
                      <CardTitle className="text-lg">{creator.displayName}</CardTitle>
                      <CardDescription>@{creator.basename}</CardDescription>
                    </div>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {creator.category}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {creator.bio}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-semibold">
                      {formatEth(BigInt(creator.totalTipsReceived), 2)} ETH
                    </div>
                    <div className="text-xs text-muted-foreground">Total received</div>
                  </div>
                  <div>
                    <div className="font-semibold">{creator.tipCount}</div>
                    <div className="text-xs text-muted-foreground">Tips</div>
                  </div>
                </div>

                <Link to={`/tip/${creator.basename}`} className="block">
                  <Button className="w-full" size="sm">
                    <Heart className="mr-2 h-4 w-4" />
                    Tip Creator
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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