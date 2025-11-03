import { useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { Link, useNavigate } from 'react-router-dom'
import {
  Heart,
  TrendingUp,
  Users,
  Copy,
  ExternalLink,
  Settings,
  Share2,
  QrCode,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { NetworkBadge } from '../components/NetworkBadge'
import { isNetworkSupported } from '../config/contracts'
import { useCreator, useTipsReceived } from '../hooks/useCreators'
import { formatEth, formatTimeAgo, shortenAddress, generateTipLink, copyToClipboard } from '../lib/utils'
import toast from 'react-hot-toast'
import QRCodeReact from 'qrcode.react'

export function Dashboard() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const navigate = useNavigate()
  const [showQRModal, setShowQRModal] = useState(false)

  const isSupportedNetwork = chainId ? isNetworkSupported(chainId) : false

  const { creator, isLoading: isLoadingCreator } = useCreator(address)
  const { tips: tipsReceived, isLoading: isLoadingTips } = useTipsReceived(address)

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
            Please switch to Celo or Base network
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

  if (isLoadingCreator) {
    return (
      <div className="container py-24">
        <div className="max-w-md mx-auto text-center space-y-6">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  const isCreator = creator?.isActive

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
          text: `Support me on TipChain!`,
          url: tipLink,
        })
      } catch (err) {
        console.log('Share failed:', err)
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <div className="container py-12">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your creator profile and tips
            </p>
          </div>
          <div className="flex gap-2">
            <Link to={`/tip/${creator.basename}`}>
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
                {formatEth(creator.totalTipsReceived, 3)} ETH
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
              <p className="text-xs text-muted-foreground">
                From supporters
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
                {creator.tipCount && Number(creator.tipCount) > 0
                  ? formatEth(creator.totalTipsReceived / creator.tipCount, 3)
                  : '0.00'} ETH
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
                <p className="text-xs text-muted-foreground">{shortenAddress(address!)}</p>
              </div>
            </div>
            {creator.bio && (
              <p className="text-sm text-muted-foreground">{creator.bio}</p>
            )}
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

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
                Twitter
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                </svg>
                Telegram
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
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
            {isLoadingTips ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !tipsReceived || tipsReceived.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tips received yet</p>
                <p className="text-sm mt-2">Share your profile to start receiving tips!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tipsReceived.slice(0, 10).map((tip: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {shortenAddress(tip.from || tip[0])}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          tipped {formatEth(tip.amount || tip[2], 3)} ETH
                        </span>
                      </div>
                      {(tip.message || tip[4]) && (
                        <p className="text-sm text-muted-foreground italic">
                          "{tip.message || tip[4]}"
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(Number(tip.timestamp || tip[5]))}
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
              <Copy className="h-4 w-4" />
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
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
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