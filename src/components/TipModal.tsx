import { useState, useEffect } from 'react'
import { X, Heart, DollarSign, Loader2 } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseEther } from 'viem'
import toast from 'react-hot-toast'
import {
    TIPCHAIN_ABI,
    getTipChainContractAddress,
    isNetworkSupported,
    getNetworkConfig,    
} from '../config/contracts'

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
    const [currentContractAddress, setCurrentContractAddress] = useState<string>('')
    const [isWrongNetwork, setIsWrongNetwork] = useState(false)

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
                console.log(`connect: ${networkConfig?.name}`)
            } else {
                console.warn(`netowrk not supported : ${chainId}`)
                toast.error(`netowrk not supported, change to base or celo`)
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

        try {
            const amountInWei = parseEther(amount)

            writeContract({
                address: currentContractAddress as `0x${string}`,
                abi: TIPCHAIN_ABI,
                functionName: 'tipETH',
                args: [creator.address, message],
                value: amountInWei,
            })

            toast.success('Transaction submitted!')
        } catch (error: any) {
            console.error('Tip error:', error)
            toast.error(error.message || 'Failed to send tip')
        }
    }
    
    const getCurrencySymbol = () => {
        if (!chainId) return 'ETH'

        const networkConfig = getNetworkConfig(chainId)
        if (networkConfig?.name.includes('Celo')) {
            return 'CELO'
        } else if (networkConfig?.name.includes('Base')) {
            return 'ETH'
        }
        return 'ETH'
    }

    // Função para obter o nome da rede atual
    const getCurrentNetworkName = () => {
        if (!chainId) return ''
        const networkConfig = getNetworkConfig(chainId)
        return networkConfig?.name || 'Unknown Network'
    }

    // Função para obter o nome curto da rede
    const getShortNetworkName = () => {
        if (!chainId) return ''
        const networkConfig = getNetworkConfig(chainId)
        if (networkConfig?.name.includes('Celo')) return 'Celo'
        if (networkConfig?.name.includes('Base')) return 'Base'
        return networkConfig?.name || 'Unknown'
    }

    
    useEffect(() => {
        if (isSuccess) {
            toast.success(`Successfully tipped ${amount} ${getCurrencySymbol()} to ${creator.displayName}!`)
            onClose()
            setAmount('5')
            setMessage('')
        }
    }, [isSuccess])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md relative animate-slide-up">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>

                <CardHeader>
                    <div className="flex items-center space-x-4">
                        {creator.avatarUrl ? (
                            <img
                                src={creator.avatarUrl}
                                alt={creator.displayName}
                                className="h-16 w-16 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                                {creator.displayName[0].toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <CardTitle className="truncate">Tip {creator.displayName}</CardTitle>
                            <CardDescription className="truncate">@{creator.basename}</CardDescription>
                            {isConnected && (
                                <div className="flex items-center mt-1">
                                    <div className={`text-xs px-2 py-1 rounded-full ${isWrongNetwork
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        }`}>
                                        {isWrongNetwork ? 'Rede não suportada' : getShortNetworkName()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Network Warning */}
                    {isWrongNetwork && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-800 text-sm font-medium">
                                Rede não suportada
                            </p>
                            <p className="text-red-600 text-xs mt-1">
                                Conectado à {getCurrentNetworkName()}. Por favor, mude para Celo ou Base para enviar tips.
                            </p>
                        </div>
                    )}

                    {/* Amount Selection */}
                    <div>
                        <label className="text-sm font-medium mb-3 block">
                            Select Amount ({getCurrencySymbol()})
                        </label>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {PRESET_AMOUNTS.map((preset) => (
                                <Button
                                    key={preset}
                                    variant={amount === preset.toString() && !customAmount ? "default" : "outline"}
                                    onClick={() => {
                                        setAmount(preset.toString())
                                        setCustomAmount(false)
                                    }}
                                    className="w-full"
                                    disabled={isWrongNetwork || !isConnected}
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
                                placeholder={`Custom amount in ${getCurrencySymbol()}`}
                                value={customAmount ? amount : ''}
                                onChange={(e) => {
                                    setAmount(e.target.value)
                                    setCustomAmount(true)
                                }}
                                onFocus={() => setCustomAmount(true)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={isWrongNetwork || !isConnected}
                            />
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            Add a Message (Optional)
                        </label>
                        <textarea
                            placeholder="Say something nice..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={200}
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            disabled={isWrongNetwork || !isConnected}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {message.length}/200 characters
                        </p>
                    </div>

                    {/* Summary */}
                    <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Amount</span>
                            <span className="font-medium">{amount} {getCurrencySymbol()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Platform Fee (2.5%)</span>
                            <span className="font-medium">{(parseFloat(amount || '0') * 0.025).toFixed(4)} {getCurrencySymbol()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Gas Fee</span>
                            <span className="font-medium text-green-600">FREE (Sponsored)</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold">
                            <span>Total</span>
                            <span>{amount} {getCurrencySymbol()}</span>
                        </div>
                    </div>

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
                            onClick={handleTip}
                            disabled={!isConnected || isWrongNetwork || isPending || isConfirming || !amount || !currentContractAddress}
                        >
                            {isPending || isConfirming ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isPending ? 'Confirming...' : 'Processing...'}
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