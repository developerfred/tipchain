import { useState, useEffect } from 'react'
import { X, Loader2, User, FileText, Image } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { encodeFunctionData } from 'viem'
import toast from 'react-hot-toast'
import {
    TIPCHAIN_ABI,
    getTipChainContractAddress,
    isNetworkSupported,
    getNetworkConfig,
} from '../config/contracts'
import {
    appendReferralTag,
    submitDivviReferral,
    storeReferralData,
    isReferralEnabled
} from '../lib/divvi'

interface Creator {
    address: string
    basename: string
    displayName: string
    bio: string
    avatarUrl: string
}

interface EditProfileModalProps {
    creator: Creator
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function EditProfileModal({ creator, isOpen, onClose, onSuccess }: EditProfileModalProps) {
    const [displayName, setDisplayName] = useState(creator.displayName)
    const [bio, setBio] = useState(creator.bio)
    const [avatarUrl, setAvatarUrl] = useState(creator.avatarUrl)
    const [currentContractAddress, setCurrentContractAddress] = useState<string>('')
    const [isWrongNetwork, setIsWrongNetwork] = useState(false)

    const { address, isConnected } = useAccount()
    const chainId = useChainId()
    const { writeContract, data: hash, isPending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    })

    useEffect(() => {
        if (chainId) {
            const isSupported = isNetworkSupported(chainId)
            setIsWrongNetwork(!isSupported)

            if (isSupported) {
                const contractAddress = getTipChainContractAddress(chainId)
                setCurrentContractAddress(contractAddress)

                if (isReferralEnabled()) {
                    console.log('✅ Divvi Referral tracking enabled for profile update')
                }
            }
        }
    }, [chainId])

    const handleUpdate = async () => {
        if (!isConnected) {
            toast.error('Please connect your wallet first')
            return
        }

        if (isWrongNetwork) {
            toast.error('Please switch to a supported network')
            return
        }

        if (!displayName.trim()) {
            toast.error('Display name is required')
            return
        }

        if (displayName.length > 100) {
            toast.error('Display name must be less than 100 characters')
            return
        }

        if (bio.length > 500) {
            toast.error('Bio must be less than 500 characters')
            return
        }

        if (!currentContractAddress || !address) {
            toast.error('Contract not loaded')
            return
        }

        try {
            // Encode function call
            let data = encodeFunctionData({
                abi: TIPCHAIN_ABI,
                functionName: 'updateCreator',
                args: [displayName, bio, avatarUrl],
            })

            // Append Divvi referral tag if enabled
            if (isReferralEnabled()) {
                console.log('📊 Appending Divvi referral tag to profile update...')
                data = appendReferralTag(data, address)
            }

            // Send transaction
            writeContract({
                address: currentContractAddress as `0x${string}`,
                abi: TIPCHAIN_ABI,
                functionName: 'updateCreator',
                args: [displayName, bio, avatarUrl],
                data,
            })

            toast.success('Transaction submitted!')
        } catch (error: any) {
            console.error('Update error:', error)
            toast.error(error.message || 'Failed to update profile')
        }
    }

    const getShortNetworkName = () => {
        if (!chainId) return ''
        const networkConfig = getNetworkConfig(chainId)
        if (networkConfig?.name.includes('Celo')) return 'Celo'
        if (networkConfig?.name.includes('Base')) return 'Base'
        return networkConfig?.name || 'Unknown'
    }

    // Handle successful transaction
    useEffect(() => {
        const handleSuccess = async () => {
            if (isSuccess && hash && chainId && address) {
                // Submit referral to Divvi
                if (isReferralEnabled()) {
                    console.log('📤 Submitting profile update referral to Divvi...')
                    await submitDivviReferral(hash, chainId)

                    storeReferralData({
                        txHash: hash,
                        chainId,
                        userAddress: address,
                        timestamp: Date.now(),
                        submitted: true,
                    })
                }

                toast.success('Profile updated successfully!')
                onSuccess()
                onClose()
            }
        }

        handleSuccess()
    }, [isSuccess, hash, chainId, address])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md relative animate-slide-up">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    disabled={isPending || isConfirming}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>

                <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>
                        Update your creator information
                        {isConnected && !isWrongNetwork && (
                            <div className="flex items-center gap-2 mt-2">
                                <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    {getShortNetworkName()}
                                </div>
                                {isReferralEnabled() && (
                                    <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        Divvi ✓
                                    </div>
                                )}
                            </div>
                        )}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Network Warning */}
                    {isWrongNetwork && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-800 text-sm font-medium">Unsupported Network</p>
                            <p className="text-red-600 text-xs mt-1">
                                Please switch to a supported network to update your profile.
                            </p>
                        </div>
                    )}

                    {/* Display Name */}
                    <div>
                        <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Display Name *
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            maxLength={100}
                            placeholder="Your display name"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            disabled={isWrongNetwork || !isConnected || isPending || isConfirming}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {displayName.length}/100 characters
                        </p>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Bio
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={500}
                            rows={4}
                            placeholder="Tell people about yourself..."
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                            disabled={isWrongNetwork || !isConnected || isPending || isConfirming}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {bio.length}/500 characters
                        </p>
                    </div>

                    {/* Avatar URL */}
                    <div>
                        <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            Avatar URL
                        </label>
                        <input
                            type="url"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="https://example.com/avatar.jpg"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            disabled={isWrongNetwork || !isConnected || isPending || isConfirming}
                        />
                        {avatarUrl && (
                            <div className="mt-2 flex items-center gap-2">
                                <img
                                    src={avatarUrl}
                                    alt="Avatar preview"
                                    className="h-12 w-12 rounded-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.basename}`
                                    }}
                                />
                                <span className="text-xs text-muted-foreground">Preview</span>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    {isReferralEnabled() && !isWrongNetwork && (
                        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Gas Fee</span>
                                <span className="font-medium text-green-600">FREE (Sponsored)</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Referral Tracking</span>
                                <span className="font-medium text-blue-600">Divvi Enabled ✓</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                            disabled={isPending || isConfirming}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={handleUpdate}
                            disabled={
                                !isConnected ||
                                isWrongNetwork ||
                                isPending ||
                                isConfirming ||
                                !displayName.trim() ||
                                !currentContractAddress
                            }
                        >
                            {isPending || isConfirming ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isPending ? 'Confirming...' : 'Processing...'}
                                </>
                            ) : (
                                'Update Profile'
                            )}
                        </Button>
                    </div>

                    {!isConnected && (
                        <p className="text-sm text-center text-muted-foreground">
                            Connect your wallet to update your profile
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}