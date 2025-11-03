import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, Share2, QrCode, Copy, TrendingUp, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { NetworkBadge } from '../components/NetworkBadge'
import { TipModal } from '../components/TipModal'
import { useChainId } from 'wagmi'
import { TIPCHAIN_ABI, getTipChainContractAddress, isNetworkSupported, NETWORK_CONFIGS, SupportedNetworks } from '../config/contracts'
import { formatEth, formatTimeAgo, shortenAddress, generateTipLink, copyToClipboard } from '../lib/utils'
import type { Creator } from '../hooks/useCreators'
import toast from 'react-hot-toast'
import QRCodeReact from 'qrcode.react'
import { createPublicClient, http } from 'viem'
import { base, baseSepolia, celo, celoAlfajores } from 'viem/chains'

const CHAIN_CONFIGS = {
  [SupportedNetworks.BASE]: { chain: base, rpc: 'https://mainnet.base.org' },
  [SupportedNetworks.BASE_SEPOLIA]: { chain: baseSepolia, rpc: 'https://sepolia.base.org' },
  [SupportedNetworks.CELO]: { chain: celo, rpc: 'https://forno.celo.org' },
  [SupportedNetworks.CELO_ALFAJORES]: { chain: celoAlfajores, rpc: 'https://alfajores-forno.celo-testnet.org' },
}

interface Tip {
  from: string
  to: string
  amount: bigint
  token: string
  message: string
  timestamp: bigint
}

export function CreatorProfile() {
  const { basename, address } = useParams()
  const navigate = useNavigate()
  const [creator, setCreator] = useState<Creator | null>(null)
  const [tips, setTips] = useState<Tip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTipModal, setShowTipModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)

  const chainId = useChainId()
  const isSupportedNetwork = chainId ? isNetworkSupported(chainId) : false

  useEffect(() => {
    const fetchCreatorData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        let foundCreator: Creator | null = null
        let foundTips: Tip[] = []

        // Search across all networks
        for (const network of Object.values(SupportedNetworks)) {
          try {
            const config = CHAIN_CONFIGS[network]
            const contractAddress = getTipChainContractAddress(
              NETWORK_CONFIGS[network].chainId
            )

            const client = createPublicClient({
              chain: config.chain,
              transport: http(config.rpc),
            })

            let creatorAddress: string | null = null

            // If basename provided, get address from basename
            if (basename) {
              creatorAddress = await client.readContract({
                address: contractAddress as `0x${string}`,
                abi: TIPCHAIN_ABI,
                functionName: 'getCreatorByBasename',
                args: [basename],
              }) as string

              if (creatorAddress === '0x0000000000000000000000000000000000000000') {
                creatorAddress = null
              }
            } else if (address) {
              creatorAddress = address
            }

            if (creatorAddress) {
              const data = await client.readContract({
                address: contractAddress as `0x${string}`,
                abi: TIPCHAIN_ABI,
                functionName: 'getCreator',
                args: [creatorAddress],
              }) as any

              if (data && data[6]) { // isActive
                foundCreator = {
                  address: creatorAddress,
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
                }

                // Fetch tips
                const tipsData = await client.readContract({
                  address: contractAddress as `0x${string}`,
                  abi: TIPCHAIN_ABI,
                  functionName: 'getTipsReceived',
                  args: [creatorAddress],
                }) as any[]

                foundTips = tipsData.map((tip: any) => ({
                  from: tip[0],
                  to: tip[1],
                  amount: tip[2],
                  token: tip[3],
                  message: tip[4],
                  timestamp: tip[5],
                }))

                break // Found the creator, stop searching
              }
            }
          } catch (error) {
            console.error(`Error fetching from ${network}:`, error)
          }
        }

        if (foundCreator) {
          setCreator(foundCreator)
          setTips(foundTips)
        } else {
          setError('Creator not found on any network')
        }
      } catch (error) {
        console.error('Error fetching creator data:', error)
        setError('Failed to load creator data')
      } finally {
        setIsLoading(false)
      }
    }

    if (basename || address) {
      fetchCreatorData()
    } else {
      setError('No creator identifier provided')
      setIsLoading(false)
    }
  }, [basename, address])

  const handleShare = async () => {
    if (!creator) return

    const tipLink = generateTipLink(creator.basename)

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tip ${creator.displayName}`,
          text: `Support ${creator.displayName} on TipChain!`,
          url: tipLink,
        })
      } catch (err) {
        console.log('Share failed:', err)
      }
    } else {
      const copied = await copyToClipboard(tipLink)
      if (copied) {
        toast.success('Link copied to clipboard!')
      }
    }
  }

  const handleCopyAddress = async () => {
    if (!creator) return

    const copied = await copyToClipboard(creator.address)
    if (copied) {
      toast.success('Address copied!')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-24">
        <div className="max-w-md mx-auto text-center space-y-6">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading creator profile...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !creator) {
    return (
      <div className="container py-24">
        <div className="max-w-md mx-auto text-center space-y-6">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
          <h1 className="text-3xl font-bold">Creator Not Found</h1>
          <p className="text-muted-foreground">
            {error || 'This creator profile could not be found on any network.'}
          </p>
          <Button onClick={() => navigate('/explore')}>
            Explore Creators
          </Button>
        </div>
      </div>
    )
  }

  const tipLink = generateTipLink(creator.basename)

  if (!isSupportedNetwork) {
    return (
      <div className="container py-24">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="text-6xl">🌐</div>
          <h1 className="text-3xl font-bold">Unsupported Network</h1>
          <p className="text-muted-foreground">
            Please switch to a supported network to view this creator
          </p>
          <div className="pt-4">
            <NetworkBadge chainId={creator.chainId} size="lg" showFullName />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Creator Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={creator.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.basename}`}
                alt={creator.displayName}
                className="h-32 w-32 rounded-full border-4 border-primary"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.basename}`
                }}
              />

              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-bold">{creator.displayName}</h1>
                    <NetworkBadge chainId={creator.chainId} size="md" />
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <span>@{creator.basename}</span>
                    <span>•</span>
                    <button
                      onClick={handleCopyAddress}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {shortenAddress(creator.address)}
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {creator.bio && (
                  <p className="text-muted-foreground">{creator.bio}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setShowTipModal(true)} size="lg">
                    <Heart className="mr-2 h-5 w-5" />
                    Send Tip
                  </Button>
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" onClick={() => setShowQRModal(true)}>
                    <QrCode className="mr-2 h-4 w-4" />
                    QR Code
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatEth(creator.totalTipsReceived, 2)} ETH
              </div>
              <p className="text-xs text-muted-foreground">
                ≈ ${(Number(formatEth(creator.totalTipsReceived)) * 1700).toFixed(2)} USD
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Tips</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Number(creator.tipCount)}</div>
              <p className="text-xs text-muted-foreground">From supporters</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(Number(creator.createdAt) * 1000).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
              <p className="text-xs text-muted-foreground">Early adopter</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tips</CardTitle>
          </CardHeader>
          <CardContent>
            {tips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tips yet. Be the first to support this creator!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tips.slice(0, 10).map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {shortenAddress(tip.from)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          tipped {formatEth(tip.amount, 3)} ETH
                        </span>
                      </div>
                      {tip.message && (
                        <p className="text-sm text-muted-foreground italic">
                          "{tip.message}"
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(Number(tip.timestamp))}
                      </p>
                    </div>
                    <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Share Section */}
        <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold">Share this profile</h3>
              <p className="text-muted-foreground">
                Help {creator.displayName} get more support
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <div className="flex-1 max-w-md">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tipLink}
                      readOnly
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const copied = await copyToClipboard(tipLink)
                        if (copied) toast.success('Link copied!')
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {showTipModal && (
        <TipModal
          creator={creator}
          isOpen={showTipModal}
          onClose={() => setShowTipModal(false)}
        />
      )}

      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm relative">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <Copy className="h-4 w-4" />
            </button>
            <CardHeader>
              <CardTitle className="text-center">Scan to Tip</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg">
                <QRCodeReact
                  value={tipLink}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Scan this QR code to tip {creator.displayName}
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowQRModal(false)}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}