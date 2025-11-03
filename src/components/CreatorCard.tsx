import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { NetworkBadge } from './NetworkBadge'
import type { Creator } from '../hooks/useCreators'
import { formatEth } from '../lib/utils'

interface CreatorCardProps {
    creator: Creator
    onTipClick?: () => void
}

export function CreatorCard({ creator, onTipClick }: CreatorCardProps) {
    const tipLink = `/tip/${creator.basename}`

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <img
                            src={creator.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.basename}`}
                            alt={creator.displayName}
                            className="h-12 w-12 rounded-full flex-shrink-0"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.basename}`
                            }}
                        />
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg truncate">{creator.displayName}</CardTitle>
                            <CardDescription className="truncate">@{creator.basename}</CardDescription>
                        </div>
                    </div>
                    <NetworkBadge chainId={creator.chainId} />
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {creator.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {creator.bio}
                    </p>
                )}

                <div className="flex items-center justify-between text-sm">
                    <div>
                        <div className="font-semibold">
                            {formatEth(creator.totalTipsReceived, 2)} ETH
                        </div>
                        <div className="text-xs text-muted-foreground">Total received</div>
                    </div>
                    <div>
                        <div className="font-semibold">{Number(creator.tipCount)}</div>
                        <div className="text-xs text-muted-foreground">Tips</div>
                    </div>
                </div>

                <Link to={tipLink} className="block">
                    <Button className="w-full" size="sm" onClick={onTipClick}>
                        <Heart className="mr-2 h-4 w-4" />
                        Tip Creator
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}