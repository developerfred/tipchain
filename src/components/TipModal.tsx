import { useState, useEffect } from 'react'
import { X, Heart, DollarSign, Loader2, ChevronDown } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseEther, parseUnits, encodeFunctionData, erc20Abi } from 'viem'
import toast from 'react-hot-toast'
import {
    TIPCHAIN_ABI,
    getTipChainContractAddress,
    isNetworkSupported,
    getNetworkConfig,
    getSupportedTokens,
    type Token,
} from '../config/contracts'
import {
    appendReferralTag,
    submitDivviReferral,
    storeReferralData,
    isReferralEnabled
} from '../lib/divvi'

interface TipModalProps {
    creator: {
        address: string
        basename: string
        displayName: string
        avatarUrl?: string
    }
    isOpen: boolean
    onClose: () => void
}

const PRESET_AMOUNTS = [1, 5, 10, 25, 50, 100]

export function TipModal({ creator, isOpen, onClose }: TipModalProps) {
    const [amount, setAmount] = useState<string>('5')
    const [message, setMessage] = useState('')
    const [customAmount, setCustomAmount] = useState(false)
    const [selectedToken, setSelectedToken] = useState<Token | null>(null)
    const [showTokenSelector, setShowTokenSelector] = useState(false)
    const [currentContractAddress, setCurrentContractAddress] = useState<string>('')
    const [isWrongNetwork, setIsWrongNetwork] = useState(false)
    const [supportedTokens, setSupportedTokens] = useState<Token[]>([])
    const [isApproving, setIsApproving] = useState(false)

    const { address, isConnected, chain } = useAccount()
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

                const networkConfig = getNetworkConfig(chainId)
                const tokens = getSupportedTokens(chainId)
                setSupportedTokens(tokens)

                // Set default token (USDC if available, otherwise native token)
                const defaultToken = tokens.find(t => t.symbol === 'USDC') || tokens.find(t => t.isNative) || tokens[0]
                setSelectedToken(defaultToken)

                console.log(`Connected to: ${networkConfig?.name}`)

                if (isReferralEnabled()) {
                    console.log('✅ Divvi Referral tracking enabled')
                } else {
                    console.log('⚠️ Divvi Referral tracking disabled')
                }
            } else {
                console.warn(`Network not supported: ${chainId}`)
                toast.error('Network not supported, change to Base or Celo')
            }
        }
    }, [chainId, chain])

    const handleTip = async () => {
        if (!isConnected) {
            toast.error('Please connect your wallet first')
            return
        }

        if (isWrongNetwork) {
            toast.error('Please switch to a supported network (Celo or Base)')
            return
        }

        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount')
            return
        }

        if (!currentContractAddress) {
            toast.error('Contract address not loaded')
            return
        }

        if (!address) {
            toast.error('Wallet address not found')
            return
        }

        if (!selectedToken) {
            toast.error('Please select a token')
            return
        }

        try {
            if (selectedToken.isNative) {
                // Native token (ETH/CELO) tipping - use tipETH function
                const amountInWei = parseEther(amount)

                let data = encodeFunctionData({
                    abi: TIPCHAIN_ABI,
                    functionName: 'tipETH',
                    args: [creator.address as `0x${string}`, message],
                })

                // Append Divvi referral tag if enabled
                if (isReferralEnabled()) {
                    console.log('📊 Appending Divvi referral tag...')
                    data = appendReferralTag(data, address)
                }

                writeContract({
                    address: currentContractAddress as `0x${string}`,
                    abi: TIPCHAIN_ABI,
                    functionName: 'tipETH',
                    args: [creator.address as `0x${string}`, message],
                    value: amountInWei,
                    data,
                })

            } else {
                // ERC20 token tipping - use tipToken function
                const amountInUnits = parseUnits(amount, selectedToken.decimals)

                // First, approve token spending
                setIsApproving(true)
                console.log('Approving token spending...')

                writeContract({
                    address: selectedToken.address as `0x${string}`,
                    abi: erc20Abi,
                    functionName: 'approve',
                    args: [currentContractAddress as `0x${string}`, amountInUnits],
                })

                // Then tip with ERC20 using tipToken function
                let tipData = encodeFunctionData({
                    abi: TIPCHAIN_ABI,
                    functionName: 'tipToken',
                    args: [
                        creator.address as `0x${string}`,
                        selectedToken.address as `0x${string}`,
                        amountInUnits,
                        message
                    ],
                })

                // Append Divvi referral tag if enabled
                if (isReferralEnabled()) {
                    console.log('📊 Appending Divvi referral tag...')
                    tipData = appendReferralTag(tipData, address)
                }

                writeContract({
                    address: currentContractAddress as `0x${string}`,
                    abi: TIPCHAIN_ABI,
                    functionName: 'tipToken',
                    args: [
                        creator.address as `0x${string}`,
                        selectedToken.address as `0x${string}`,
                        amountInUnits,
                        message
                    ],
                    data: tipData,
                })

                setIsApproving(false)
            }

            toast.success('Transaction submitted!')
        } catch (error: any) {
            console.error('Tip error:', error)
            setIsApproving(false)
            toast.error(error.message || 'Failed to send tip')
        }
    }

    const getCurrentNetworkName = () => {
        if (!chainId) return ''
        const networkConfig = getNetworkConfig(chainId)
        return networkConfig?.name || 'Unknown Network'
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
                    console.log('📤 Submitting referral to Divvi...')
                    await submitDivviReferral(hash, chainId)

                    // Store referral data locally
                    storeReferralData({
                        txHash: hash,
                        chainId,
                        userAddress: address,
                        timestamp: Date.now(),
                        submitted: true,
                    })
                }

                // Show success message
                toast.success(
                    `Successfully tipped ${amount} ${selectedToken?.symbol} to ${creator.displayName}!`
                )

                // Close modal and reset
                onClose()
                setAmount('5')
                setMessage('')
                setCustomAmount(false)
                setIsApproving(false)
            }
        }

        handleSuccess()
    }, [isSuccess, hash, chainId, address])

    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    const isProcessing = isPending || isConfirming || isApproving

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto relative animate-slide-up bg-background shadow-xl">
                {/* Header */}
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                            {creator.avatarUrl ? (
                                <img
                                    src={creator.avatarUrl}
                                    alt={creator.displayName}
                                    className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg sm:text-2xl font-bold flex-shrink-0">
                                    {creator.displayName[0].toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <CardTitle className="truncate text-lg sm:text-xl">Tip {creator.displayName}</CardTitle>
                                <CardDescription className="truncate">@{creator.basename}</CardDescription>
                                {isConnected && (
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <div
                                            className={`text-xs px-2 py-1 rounded-full ${isWrongNetwork
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                }`}
                                        >
                                            {isWrongNetwork ? 'Unsupported Network' : getShortNetworkName()}
                                        </div>
                                        {isReferralEnabled() && !isWrongNetwork && (
                                            <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                Divvi ✓
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none ml-2"
                            disabled={isProcessing}
                        >
                            <X className="h-5 w-5 sm:h-6 sm:w-6" />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 sm:space-y-6 pb-6">
                    {/* Network Warning */}
                    {isWrongNetwork && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-800 text-sm font-medium">Unsupported Network</p>
                            <p className="text-red-600 text-xs mt-1">
                                Connected to {getCurrentNetworkName()}. Please switch to Celo or Base to send tips.
                            </p>
                        </div>
                    )}

                    {/* Token Selection */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            Select Token
                        </label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowTokenSelector(!showTokenSelector)}
                                disabled={isWrongNetwork || !isConnected || isProcessing}
                                className="flex items-center justify-between w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <div className="flex items-center space-x-2">
                                    {selectedToken && (
                                        <>
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                                {selectedToken.symbol[0]}
                                            </div>
                                            <span className="font-medium">{selectedToken.symbol}</span>
                                            <span className="text-muted-foreground text-xs">
                                                {selectedToken.name}
                                            </span>
                                            {selectedToken.isNative && (
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                    Native
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                                <ChevronDown className={`h-4 w-4 transition-transform ${showTokenSelector ? 'rotate-180' : ''}`} />
                            </button>

                            {showTokenSelector && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                                    {supportedTokens.map((token) => (
                                        <button
                                            key={token.address}
                                            type="button"
                                            onClick={() => {
                                                setSelectedToken(token)
                                                setShowTokenSelector(false)
                                            }}
                                            className="flex items-center space-x-3 w-full p-3 hover:bg-muted transition-colors text-left"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                                {token.symbol[0]}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium">{token.symbol}</div>
                                                <div className="text-xs text-muted-foreground">{token.name}</div>
                                            </div>
                                            {token.isNative && (
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                    Native
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Amount Selection */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            Amount ({selectedToken?.symbol})
                        </label>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {PRESET_AMOUNTS.map((preset) => (
                                <Button
                                    key={preset}
                                    type="button"
                                    variant={amount === preset.toString() && !customAmount ? 'default' : 'outline'}
                                    onClick={() => {
                                        setAmount(preset.toString())
                                        setCustomAmount(false)
                                    }}
                                    className="w-full h-10 text-sm"
                                    disabled={isWrongNetwork || !isConnected || isProcessing}
                                >
                                    {preset}
                                </Button>
                            ))}
                        </div>

                        {/* Custom Amount */}
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="number"
                                step="0.001"
                                min="0"
                                placeholder={`Custom amount in ${selectedToken?.symbol}`}
                                value={customAmount ? amount : ''}
                                onChange={(e) => {
                                    setAmount(e.target.value)
                                    setCustomAmount(true)
                                }}
                                onFocus={() => setCustomAmount(true)}
                                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={isWrongNetwork || !isConnected || isProcessing}
                            />
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Add a Message (Optional)</label>
                        <textarea
                            placeholder="Say something nice..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={200}
                            rows={2}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            disabled={isWrongNetwork || !isConnected || isProcessing}
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-right">{message.length}/200 characters</p>
                    </div>

                    {/* Summary */}
                    <div className="rounded-lg border bg-muted/50 p-3 sm:p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount</span>
                            <span className="font-medium">
                                {amount} {selectedToken?.symbol}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Platform Fee (2.5%)</span>
                            <span className="font-medium">
                                {(parseFloat(amount || '0') * 0.025).toFixed(4)} {selectedToken?.symbol}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Gas Fee</span>
                            <span className="font-medium text-green-600">FREE (Sponsored)</span>
                        </div>
                        {isReferralEnabled() && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Referral Tracking</span>
                                <span className="font-medium text-blue-600">Divvi Enabled ✓</span>
                            </div>
                        )}
                        <div className="border-t pt-2 flex justify-between font-semibold">
                            <span>Total</span>
                            <span>
                                {amount} {selectedToken?.symbol}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-12"
                            onClick={onClose}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className="flex-1 h-12"
                            onClick={handleTip}
                            disabled={
                                !isConnected ||
                                isWrongNetwork ||
                                isProcessing ||
                                !amount ||
                                !currentContractAddress ||
                                !selectedToken
                            }
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isApproving ? 'Approving...' : isPending ? 'Confirming...' : 'Processing...'}
                                </>
                            ) : (
                                <>
                                    <Heart className="mr-2 h-4 w-4" />
                                    Send Tip
                                </>
                            )}
                        </Button>
                    </div>

                    {!isConnected && (
                        <p className="text-sm text-center text-muted-foreground">
                            Connect your wallet to send a tip
                        </p>
                    )}

                    {isConnected && isWrongNetwork && (
                        <p className="text-sm text-center text-red-600 font-medium">
                            Switch to Celo or Base network to send tips
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}