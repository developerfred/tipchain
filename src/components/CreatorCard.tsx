import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Users } from 'lucide-react'
import { Card, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { TipModal } from './TipModal'
import { formatAmount, formatCompactNumber, generateAvatarUrl } from '../lib/utils'
import type { Creator } from '../types/graphql'

interface CreatorCardProps {
    creator: Creator
}

export function CreatorCard({ creator }: CreatorCardProps) {
    const [showTipModal, setShowTipModal] = useState(false)

    const avatarUrl = creator.avatarUrl || generateAvatarUrl(creator.address)

    const handleTipClick = (e: React.MouseEvent) => {
        e.preventDefault() // Prevenir navegação quando clicar no botão de tip
        e.stopPropagation() // Evitar que o evento propague para o Link
        setShowTipModal(true)
    }

    const handleCloseTipModal = () => {
        setShowTipModal(false)
    }

    return (
        <>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                <Link to={`/${creator.basename}`} className="block">
                    <CardContent className="p-0">
                        {/* Avatar Section */}
                        <div className="relative h-32 bg-gradient-to-br from-celo-yellow to-celo-green">
                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                                <img
                                    src={avatarUrl}
                                    alt={creator.displayName}
                                    className="w-16 h-16 rounded-full border-4 border-white bg-white group-hover:scale-105 transition-transform"
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="pt-10 px-6 pb-6 text-center">
                            <h3 className="text-lg font-semibold group-hover:text-celo-yellow transition-colors">
                                {creator.displayName}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">@{creator.basename}</p>

                            {creator.bio && (
                                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                                    {creator.bio}
                                </p>
                            )}

                            {/* Stats */}
                            <div className="flex items-center justify-center space-x-6 mb-4 text-sm">
                                <div className="flex items-center space-x-1 text-gray-600">
                                    <Heart className="w-4 h-4" />
                                    <span>{formatCompactNumber(parseInt(creator.totalAmountReceived) / 1e18)} CELO</span>
                                </div>
                                <div className="flex items-center space-x-1 text-gray-600">
                                    <Users className="w-4 h-4" />
                                    <span>{creator.tippedByCount} supporters</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-2" onClick={(e) => e.preventDefault()}>
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    size="sm"
                                    asChild
                                >
                                    <Link to={`/${creator.basename}`}>
                                        View Profile
                                    </Link>
                                </Button>
                                <Button
                                    onClick={handleTipClick}
                                    className="flex-1"
                                    size="sm"
                                >
                                    Send Tip
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Link>
            </Card>

            {/* Tip Modal */}
            <TipModal
                creator={{
                    address: creator.address,
                    basename: creator.basename,
                    displayName: creator.displayName,
                    avatarUrl: creator.avatarUrl
                }}
                isOpen={showTipModal}
                onClose={handleCloseTipModal}
            />
        </>
    )
}