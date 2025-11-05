import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import {
  Loader2,
  ArrowLeft,
  Heart,
  Users,
  TrendingUp,
  Share2,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { TipModal } from '../components/TipModal'
import { useCreatorProfile } from '../hooks/useCreatorProfile'
import { formatEth, formatTimeAgo, shortenAddress, copyToClipboard, generateTipLink } from '../lib/utils'
import toast from 'react-hot-toast'

export function CreatorProfile() {
  const { identifier, address: paramAddress } = useParams<{ identifier?: string; address?: string }>()
  const navigate = useNavigate()
  const { address: connectedAddress, isConnected } = useAccount()

  // Usar identifier se existir, senão usar address
  const searchIdentifier = identifier || paramAddress

  const { creator, isLoading, error } = useCreatorProfile(searchIdentifier)
  const [isTipModalOpen, setIsTipModalOpen] = useState(false)

  // Update document title and meta tags
  useEffect(() => {
    if (creator) {
      // Update title
      document.title = `${creator.displayName} (@${creator.basename}) - TipChain`

      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content',
          creator.bio || `Support ${creator.displayName} with tips on TipChain. Decentralized tipping platform on Base and Celo.`
        )
      }

      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]')
      if (ogTitle) {
        ogTitle.setAttribute('content', `Tip ${creator.displayName} on TipChain`)
      }

      const ogDescription = document.querySelector('meta[property="og:description"]')
      if (ogDescription) {
        ogDescription.setAttribute('content',
          creator.bio || `Support ${creator.displayName} with crypto tips`
        )
      }

      const ogImage = document.querySelector('meta[property="og:image"]')
      if (ogImage) {
        ogImage.setAttribute('content',
          creator.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.basename}`
        )
      }

      const ogUrl = document.querySelector('meta[property="og:url"]')
      if (ogUrl) {
        ogUrl.setAttribute('content', generateTipLink(creator.basename))
      }
    } else {
      document.title = 'TipChain - Decentralized Tipping'
    }

    // Cleanup
    return () => {
      document.title = 'TipChain - Decentralized Tipping'
    }
  }, [creator])

  // Redirect se for o próprio perfil
  useEffect(() => {
    if (isConnected && connectedAddress && creator) {
      if (connectedAddress.toLowerCase() === creator.address.toLowerCase()) {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [isConnected, connectedAddress, creator, navigate])

  // Redirect se não tem identifier
  useEffect(() => {
    if (!searchIdentifier) {
      navigate('/', { replace: true })
    }
  }, [searchIdentifier, navigate])

  const handleBack = () => {
    navigate(-1)
  }

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
        toast.success('Shared successfully!')
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      const copied = await copyToClipboard(tipLink)
      if (copied) {
        toast.success('Link copied to clipboard!')
      }
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
          <div className="text-6xl">😕</div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Creator Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              {error || `The creator "${searchIdentifier}" was not found or is inactive.`}
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={() => navigate('/explore')}>
              Explore Creators
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const totalReceived = BigInt(creator.totalAmountReceived || '0')
  const averageTip = creator.tipCount > 0
    ? Number(totalReceived) / creator.tipCount
    : 0

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>

        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {creator.displayName}
          </h1>
          <p className="text-lg text-muted-foreground">
            @{creator.basename}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex justify-center md:justify-start">
                {creator.avatarUrl ? (
                  <img
                    src={creator.avatarUrl}
                    alt={creator.displayName}
                    className="h-24 w-24 rounded-full object-cover border-4 border-background shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.basename}`
                    }}
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl font-bold border-4 border-background shadow-lg">
                    {creator.displayName[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4 text-center md:text-left">
                {creator.bio && (
                  <p className="text-muted-foreground leading-relaxed">
                    {creator.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 justify-center md:justify-start text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded-full bg-muted">
                    {shortenAddress(creator.address)}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-muted">
                    Joined {formatTimeAgo(Number(creator.registeredAt))}
                  </span>
                </div>

                {/* Tip Button */}
                <Button
                  size="lg"
                  className="w-full md:w-auto"
                  onClick={() => setIsTipModalOpen(true)}
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Send Tip
                </Button>
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
                {formatEth(totalReceived, 4)} ETH
              </div>
              <p className="text-xs text-muted-foreground">
                From {creator.tipCount} tips
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Supporters</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{creator.tippedByCount}</div>
              <p className="text-xs text-muted-foreground">
                Unique supporters
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Tip</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {creator.tipCount > 0
                  ? formatEth(BigInt(Math.floor(averageTip)), 4)
                  : '0.00'} ETH
              </div>
              <p className="text-xs text-muted-foreground">
                Per tip
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Card */}
        <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
          <CardHeader>
            <CardTitle>Support {creator.displayName}</CardTitle>
            <CardDescription>
              Send a tip to show your appreciation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>100% goes to the creator</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Gas fees sponsored</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Instant payment on Base & Celo</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={() => setIsTipModalOpen(true)}
            >
              <Heart className="mr-2 h-5 w-5" />
              Send Tip Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tip Modal */}
      <TipModal
        creator={{
          address: creator.address,
          basename: creator.basename,
          displayName: creator.displayName,
          avatarUrl: creator.avatarUrl
        }}
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
      />
    </div>
  )
}