import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Heart, Share2, QrCode, Copy, TrendingUp } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { TipModal } from '../components/TipModal'
import { useChainId } from 'wagmi'
import { TIPCHAIN_ABI, getTipChainContractAddress, isNetworkSupported } from '../config/contracts'
import { formatEth, formatTimeAgo, shortenAddress, generateTipLink, copyToClipboard } from '../lib/utils'
import toast from 'react-hot-toast'
import QRCodeReact from 'qrcode.react'

export function CreatorProfile() {
  const { basename, address } = useParams()
  const [showTipModal, setShowTipModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)

  const chainId = useChainId()
  const isSupportedNetwork = chainId ? isNetworkSupported(chainId) : false
  const contractAddress = chainId ? getTipChainContractAddress(chainId) : ''

  const mockCreator = {
    address: address || '0x1234567890123456789012345678901234567890',
    basename: basename || 'alice',
    displayName: 'Alice the Artist',
    bio: 'Digital artist creating NFTs and onchain art. Supporting decentralization one piece at a time.',
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${basename || 'alice'}`,
    totalTipsReceived: '2500000000000000000',
    tipCount: 156,
    createdAt: 1704067200,
    isActive: true,
  }

  const recentTips = [
    {
      from: '0xabcd...1234',
      amount: '100000000000000000',
      message: 'Love your work! Keep creating!',
      timestamp: Date.now() / 1000 - 3600,
    },
    {
      from: '0xef12...5678',
      amount: '50000000000000000',
      message: 'Amazing art piece!',
      timestamp: Date.now() / 1000 - 7200,
    },
    {
      from: '0x9876...abcd',
      amount: '250000000000000000',
      message: '',
      timestamp: Date.now() / 1000 - 86400,
    },
  ]

  const tipLink = generateTipLink(mockCreator.basename)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tip ${mockCreator.displayName}`,
          text: `Support ${mockCreator.displayName} on TipChain!`,
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
    const copied = await copyToClipboard(mockCreator.address)
    if (copied) {
      toast.success('Address copied!')
    }
  }

  if (!isSupportedNetwork) {
    return (
      <div className="container py-24">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="text-6xl">🌐</div>
          <h1 className="text-3xl font-bold">Unsupported Network</h1>
          <p className="text-muted-foreground">
            Please switch to Celo or Base network to view creator profiles
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={mockCreator.avatarUrl}
                alt={mockCreator.displayName}
                className="h-32 w-32 rounded-full border-4 border-primary"
              />

              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-3xl font-bold">{mockCreator.displayName}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>@{mockCreator.basename}</span>
                    <span>•</span>
                    <button
                      onClick={handleCopyAddress}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {shortenAddress(mockCreator.address)}
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <p className="text-muted-foreground">{mockCreator.bio}</p>

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

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatEth(BigInt(mockCreator.totalTipsReceived), 2)} ETH
              </div>
              <p className="text-xs text-muted-foreground">≈ $4,250 USD</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Tips</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockCreator.tipCount}</div>
              <p className="text-xs text-muted-foreground">From supporters</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(mockCreator.createdAt * 1000).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
              <p className="text-xs text-muted-foreground">Early adopter</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tips</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tips yet. Be the first to support this creator!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {tip.from}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          tipped {formatEth(BigInt(tip.amount), 3)} ETH
                        </span>
                      </div>
                      {tip.message && (
                        <p className="text-sm text-muted-foreground italic">
                          "{tip.message}"
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(tip.timestamp)}
                      </p>
                    </div>
                    <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold">Share this profile</h3>
              <p className="text-muted-foreground">
                Help {mockCreator.displayName} get more support
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

      {showTipModal && (
        <TipModal
          creator={mockCreator}
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
                Scan this QR code to tip {mockCreator.displayName}
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