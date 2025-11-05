'use client'
import { useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { Link } from 'react-router-dom'
import {
  Heart,
  TrendingUp,
  Users,
  Copy,
  ExternalLink,
  Share2,
  QrCode,
  Loader2,
  MessageCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { NetworkBadge } from '../components/NetworkBadge'
import { isNetworkSupported } from '../config/contracts'
import { formatEth, formatTimeAgo, shortenAddress, generateTipLink, copyToClipboard } from '../lib/utils'
import { useDashboard } from '../hooks/useDashboard'
import toast from 'react-hot-toast'
import QRCodeReact from 'qrcode.react'

export function Dashboard() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [showQRModal, setShowQRModal] = useState(false)

  const isSupportedNetwork = chainId ? isNetworkSupported(chainId) : false

  const { creator, tipsReceived, stats, isLoading, error, isCreator } = useDashboard(address)

  if (!isConnected) {
    return (
      <div className="container py-24">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="text-6xl">🔐</div>
          <h1 className="text-3xl font-bold">Connect Your Wallet</h1>
          <p className="text-muted-foreground">
            Please connect your wallet to access your dashboard
          </p>
          <appkit-button />
        </div>
      </div>
    )
  }

  if (!isSupportedNetwork) {
    return (
      <div className="container py-24">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="text-6xl">🌐</div>
          <h1 className="text-3xl font-bold">Unsupported Network</h1>
          <p className="text-muted-foreground">
            Please switch to a supported network
          </p>
          {chainId && (
            <div className="pt-4">
              <NetworkBadge chainId={chainId} size="lg" showFullName />
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isLoading && !creator) {
    return (
      <div className="container py-24">
        <div className="max-w-md mx-auto text-center space-y-6">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!isCreator) {
    return (
      <div className="container py-24">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="text-6xl">👋</div>
          <h1 className="text-3xl font-bold">Welcome to TipChain!</h1>
          <p className="text-lg text-muted-foreground">
            Create your profile to start receiving tips
          </p>
          <div className="pt-4">
            <Link to="/creators">
              <Button size="lg">
                Become a Creator
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!creator) {
    return (
      <div className="container py-24">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="text-6xl">❌</div>
          <h1 className="text-3xl font-bold">Profile Not Found</h1>
          <p className="text-muted-foreground">
            We couldn't find your creator profile
          </p>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <div className="pt-4">
            <Link to="/creators">
              <Button size="lg">
                Register as Creator
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const tipLink = generateTipLink(creator.basename)

  const handleCopyLink = async () => {
    const copied = await copyToClipboard(tipLink)
    if (copied) {
      toast.success('Profile link copied!')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tip ${creator.displayName}`,
          text: `Support ${creator.displayName} on TipChain!`,
          url: tipLink,
        })
        toast.success('Profile shared!')
      } catch (err) {
        // User cancelled share
        console.log('Share cancelled:', err)
      }
    } else {
      handleCopyLink()
    }
  }

  const totalAmountReceived = stats?.totalAmountReceived ? BigInt(stats.totalAmountReceived) : BigInt(0)
  const tipCount = stats?.tipCount || 0
  const averageTip = tipCount > 0 ? Number(totalAmountReceived) / tipCount : 0

  return (
    <div className="container py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your creator profile and tips
            </p>
          </div>
          <div className="flex gap-2">
            <Link to={`/profile/${creator.address}`}>
              <Button variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Public Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatEth(totalAmountReceived, 4)} ETH
              </div>
              <p className="text-xs text-muted-foreground">
                All-time earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Tips</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tipCount}</div>
              <p className="text-xs text-muted-foreground">
                From {stats?.tippedByCount || 0} supporters
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Tip</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tipCount > 0 ? formatEth(BigInt(Math.floor(averageTip)), 4) : '0.00'} ETH
              </div>
              <p className="text-xs text-muted-foreground">
                Per tip
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Your creator information on {chainId && <NetworkBadge chainId={chainId} size="sm" />}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={creator.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.basename}`}
                alt={creator.displayName}
                className="h-16 w-16 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.basename}`
                }}
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold">{creator.displayName}</h3>
                <p className="text-sm text-muted-foreground">@{creator.basename}</p>
                <p className="text-xs text-muted-foreground">{shortenAddress(creator.address)}</p>
              </div>
            </div>
            {creator.bio && (
              <p className="text-sm text-muted-foreground">{creator.bio}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Registered {formatTimeAgo(Number(creator.registeredAt))}</span>
              {creator.updatedAt !== creator.registeredAt && (
                <>
                  <span>•</span>
                  <span>Updated {formatTimeAgo(Number(creator.updatedAt))}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Share Profile */}
        <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
          <CardHeader>
            <CardTitle>Share Your Profile</CardTitle>
            <CardDescription>
              Share your profile link to start receiving tips
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={tipLink}
                readOnly
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <Button variant="outline" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setShowQRModal(true)}>
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tips</CardTitle>
            <CardDescription>
              Your latest tips from supporters
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : tipsReceived.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tips received yet</p>
                <p className="text-sm mt-2">Share your profile to start receiving tips!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tipsReceived.map((tip) => (
                  <div
                    key={tip.id}
                    className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {tip.from.displayName || shortenAddress(tip.from.address)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          tipped {formatEth(BigInt(tip.amount), 4)} ETH
                        </span>
                      </div>
                      {tip.message && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MessageCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <p className="italic">"{tip.message}"</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(Number(tip.timestamp))}
                      </p>
                    </div>
                    <Heart className="h-5 w-5 text-red-500 fill-red-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm relative">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <span className="sr-only">Close</span>
              <div className="h-4 w-4 bg-muted-foreground rounded-full flex items-center justify-center">
                <span className="text-background text-xs">×</span>
              </div>
            </button>
            <CardHeader>
              <CardTitle className="text-center">Your QR Code</CardTitle>
              <CardDescription className="text-center">
                Scan to tip @{creator.basename}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg">
                <QRCodeReact
                  value={tipLink}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Scan this code to quickly access your tip page
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