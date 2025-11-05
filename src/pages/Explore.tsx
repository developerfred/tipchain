import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  TrendingUp,
  Users,
  Heart,
  Loader2,
  Filter,
  ArrowUpDown,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { CreatorCard } from '../components/CreatorCard'
import { useExplore, type SortBy } from '../hooks/useExplore'
import { formatEth } from '../lib/utils'
import { useChainId } from 'wagmi'
import { isNetworkSupported } from '../config/contracts'
import toast from 'react-hot-toast'

const SORT_OPTIONS = [
  { value: 'totalAmountReceived' as SortBy, label: 'Total Received', icon: TrendingUp },
  { value: 'tipCount' as SortBy, label: 'Tips Count', icon: Heart },
  { value: 'registeredAt' as SortBy, label: 'Newest', icon: Calendar },
  { value: 'displayName' as SortBy, label: 'Name', icon: Users },
]

export function Explore() {
  const chainId = useChainId()
  const isSupportedNetwork = chainId ? isNetworkSupported(chainId) : false

  const [sortBy, setSortBy] = useState<SortBy>('totalAmountReceived')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [localSearch, setLocalSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const {
    creators,
    platformStats,
    isLoading,
    error,
    searchQuery,
    totalCount,
    hasMore,
    searchCreators,
    loadCreators,
    loadMore,
  } = useExplore({
    limit: 50,
    sortBy,
    sortOrder,
    onlyActive: true
  })

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearch !== searchQuery) {
        if (localSearch.trim()) {
          searchCreators(localSearch)
        } else {
          loadCreators()
        }
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [localSearch])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleSearch = (query: string) => {
    setLocalSearch(query)
  }

  const handleSortChange = (newSortBy: SortBy) => {
    setSortBy(newSortBy)
  }

  const handleSortOrderToggle = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
  }

  const stats = useMemo(() => {
    if (platformStats) {
      return {
        totalCreators: platformStats.totalCreators,
        totalTips: platformStats.totalTips,
        totalVolume: platformStats.totalVolume,
      }
    }

    // Fallback to calculated stats from current creators
    const totalTips = creators.reduce((sum, c) => sum + (c.tipCount || 0), 0)
    const totalVolume = creators.reduce((sum, c) => {
      const amount = c.totalAmountReceived ? BigInt(c.totalAmountReceived) : BigInt(0)
      return sum + amount
    }, BigInt(0))

    return {
      totalCreators: totalCount,
      totalTips,
      totalVolume,
    }
  }, [platformStats, creators, totalCount])

  if (!isSupportedNetwork) {
    return (
      <div className="container py-24">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="text-6xl">🌐</div>
          <h1 className="text-3xl font-bold">Unsupported Network</h1>
          <p className="text-muted-foreground">
            Please switch to a supported network to explore creators
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Explore Creators</h1>
        <p className="text-lg text-muted-foreground">
          Discover and support amazing creators across the decentralized web
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
            <p className="text-xs text-muted-foreground">Registered creators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tips</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTips}</div>
            <p className="text-xs text-muted-foreground">Tips sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatEth(stats.totalVolume, 2)} ETH
            </div>
            <p className="text-xs text-muted-foreground">Total value tipped</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search creators by name, username, or bio..."
              value={localSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sort by:</span>
                <div className="flex gap-1">
                  {SORT_OPTIONS.map((option) => {
                    const Icon = option.icon
                    return (
                      <Button
                        key={option.value}
                        variant={sortBy === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSortChange(option.value)}
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {option.label}
                      </Button>
                    )
                  })}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSortOrderToggle}
              >
                <ArrowUpDown className="h-3 w-3 mr-1" />
                {sortOrder === 'desc' ? 'Descending' : 'Ascending'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSortBy('totalAmountReceived')
                  setSortOrder('desc')
                  setLocalSearch('')
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}

        {/* Results Info */}
        {!isLoading && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {creators.length} of {totalCount} creators
              {searchQuery && (
                <span> for "<strong>{searchQuery}</strong>"</span>
              )}
            </div>

            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocalSearch('')
                }}
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && creators.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading creators...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-12 space-y-4">
          <div className="text-6xl">⚠️</div>
          <h3 className="text-xl font-semibold">Something went wrong</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && creators.length === 0 && !error && (
        <div className="text-center py-12 space-y-4">
          <div className="text-6xl">🔍</div>
          <h3 className="text-xl font-semibold">
            {searchQuery ? 'No creators found' : 'No creators yet'}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {searchQuery
              ? `No creators found matching "${searchQuery}". Try a different search term.`
              : 'Be the first creator to join the platform and start receiving tips from your supporters!'}
          </p>
          {!searchQuery && (
            <Link to="/creators" className="inline-block mt-4">
              <Button size="lg">Become a Creator</Button>
            </Link>
          )}
        </div>
      )}

      {/* Creators Grid */}
      {!isLoading && creators.length > 0 && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {creators.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-8">
              <Button
                onClick={loadMore}
                disabled={isLoading}
                variant="outline"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  'Load More Creators'
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* CTA Section */}
      <div className="mt-16 text-center space-y-4">
        <h2 className="text-2xl font-bold">Are you a creator?</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Join our platform and start receiving tips directly from your supporters in a decentralized way.
        </p>
        <Link to="/creators">
          <Button size="lg" variant="outline">
            Get Started as Creator
          </Button>
        </Link>
      </div>
    </div>
  )
}