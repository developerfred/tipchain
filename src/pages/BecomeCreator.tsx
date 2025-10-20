import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import { Loader2, Check, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { TIPCHAIN_CONTRACT_ADDRESS, TIPCHAIN_ABI } from '../config/contracts'
import { isValidBasename } from '../lib/utils'
import toast from 'react-hot-toast'

export function BecomeCreator() {
    const { address, isConnected } = useAccount()
    const navigate = useNavigate()
    const [step, setStep] = useState(1)

    // Form state
    const [basename, setBasename] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [bio, setBio] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')

    // Validation state
    const [basenameError, setBasenameError] = useState('')

    const { writeContract, data: hash, isPending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    })

    const validateBasename = (value: string) => {
        if (!value) {
            setBasenameError('Basename is required')
            return false
        }
        if (value.length < 3) {
            setBasenameError('Basename must be at least 3 characters')
            return false
        }
        if (value.length > 30) {
            setBasenameError('Basename must be less than 30 characters')
            return false
        }
        if (!isValidBasename(value)) {
            setBasenameError('Only lowercase letters, numbers, and hyphens allowed')
            return false
        }
        setBasenameError('')
        return true
    }

    const handleBasenameChange = (value: string) => {
        const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
        setBasename(cleaned)
        validateBasename(cleaned)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isConnected) {
            toast.error('Please connect your wallet first')
            return
        }

        if (!validateBasename(basename)) {
            return
        }

        if (!displayName.trim()) {
            toast.error('Display name is required')
            return
        }

        try {
            writeContract({
                address: TIPCHAIN_CONTRACT_ADDRESS,
                abi: TIPCHAIN_ABI,
                functionName: 'registerCreator',
                args: [basename, displayName, bio, avatarUrl],
            })
        } catch (error: any) {
            console.error('Registration error:', error)
            toast.error(error.message || 'Failed to register creator')
        }
    }

    // Handle successful registration
    if (isSuccess) {
        setTimeout(() => {
            toast.success('Successfully registered as a creator!')
            navigate('/dashboard')
        }, 2000)
    }

    if (!isConnected) {
        return (
            <div className="container py-24">
                <div className="max-w-md mx-auto text-center space-y-6">
                    <div className="text-6xl">🎨</div>
                    <h1 className="text-3xl font-bold">Become a Creator</h1>
                    <p className="text-muted-foreground">
                        Connect your wallet to start receiving tips
                    </p>
                    <appkit-button />
                </div>
            </div>
        )
    }

    return (
        <div className="container py-12">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold">Become a Creator</h1>
                    <p className="text-lg text-muted-foreground">
                        Set up your profile and start receiving tips from your supporters
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center space-x-4">
                    <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${step >= 1 ? 'border-primary bg-primary text-white' : 'border-muted'}`}>
                            {step > 1 ? <Check className="h-5 w-5" /> : '1'}
                        </div>
                        <span className="ml-2 hidden sm:inline">Profile Info</span>
                    </div>
                    <div className="h-0.5 w-12 bg-border"></div>
                    <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${step >= 2 ? 'border-primary bg-primary text-white' : 'border-muted'}`}>
                            {step > 2 ? <Check className="h-5 w-5" /> : '2'}
                        </div>
                        <span className="ml-2 hidden sm:inline">Confirm</span>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {step === 1 ? 'Profile Information' : 'Review & Confirm'}
                        </CardTitle>
                        <CardDescription>
                            {step === 1
                                ? 'Fill in your creator profile details'
                                : 'Review your information before submitting'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {step === 1 ? (
                                <>
                                    {/* Basename */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Basename <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={basename}
                                                onChange={(e) => handleBasenameChange(e.target.value)}
                                                placeholder="yourname"
                                                className={`flex h-10 w-full rounded-md border ${basenameError ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                                .base.eth
                                            </span>
                                        </div>
                                        {basenameError && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {basenameError}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Your unique identifier. 3-30 characters, lowercase only.
                                        </p>
                                    </div>

                                    {/* Display Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Display Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Your Name"
                                            maxLength={100}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            The name displayed on your profile.
                                        </p>
                                    </div>

                                    {/* Bio */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Bio
                                        </label>
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="Tell your supporters about yourself..."
                                            rows={4}
                                            maxLength={500}
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                        />
                                        <p className="text-xs text-muted-foreground text-right">
                                            {bio.length}/500 characters
                                        </p>
                                    </div>

                                    {/* Avatar URL */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Avatar URL (Optional)
                                        </label>
                                        <input
                                            type="url"
                                            value={avatarUrl}
                                            onChange={(e) => setAvatarUrl(e.target.value)}
                                            placeholder="https://example.com/avatar.jpg"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Link to your profile picture. Leave empty to use a default avatar.
                                        </p>
                                    </div>

                                    {/* Preview */}
                                    {(basename || displayName) && (
                                        <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                                            <p className="text-sm font-medium">Preview:</p>
                                            <div className="flex items-center gap-3">
                                                {avatarUrl ? (
                                                    <img
                                                        src={avatarUrl}
                                                        alt="Avatar"
                                                        className="h-12 w-12 rounded-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${basename}`
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                                                        {displayName[0]?.toUpperCase() || '?'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold">{displayName || 'Your Name'}</div>
                                                    <div className="text-sm text-muted-foreground">@{basename || 'yourname'}</div>
                                                </div>
                                            </div>
                                            {bio && (
                                                <p className="text-sm text-muted-foreground">{bio}</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => navigate('/')}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            className="flex-1"
                                            onClick={() => {
                                                if (validateBasename(basename) && displayName.trim()) {
                                                    setStep(2)
                                                } else {
                                                    toast.error('Please fill in all required fields')
                                                }
                                            }}
                                            disabled={!basename || !displayName || !!basenameError}
                                        >
                                            Continue
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Review Step */}
                                    <div className="space-y-4">
                                        <div className="p-4 border rounded-lg space-y-4">
                                            <div className="flex items-center gap-4">
                                                {avatarUrl ? (
                                                    <img
                                                        src={avatarUrl}
                                                        alt="Avatar"
                                                        className="h-20 w-20 rounded-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${basename}`
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
                                                        {displayName[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold">{displayName}</h3>
                                                    <p className="text-muted-foreground">@{basename}.base.eth</p>
                                                </div>
                                            </div>

                                            {bio && (
                                                <div>
                                                    <p className="text-sm font-medium mb-1">Bio:</p>
                                                    <p className="text-sm text-muted-foreground">{bio}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 border rounded-lg bg-blue-500/10 space-y-2">
                                            <h4 className="font-semibold flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                Important Information
                                            </h4>
                                            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                                                <li>Your basename cannot be changed after registration</li>
                                                <li>You can update your display name, bio, and avatar later</li>
                                                <li>A small gas fee will be required for registration</li>
                                                <li>Your profile will be public and searchable</li>
                                            </ul>
                                        </div>

                                        {isSuccess && (
                                            <div className="p-4 border border-green-500 rounded-lg bg-green-500/10 space-y-2">
                                                <h4 className="font-semibold flex items-center gap-2 text-green-600">
                                                    <Check className="h-4 w-4" />
                                                    Registration Successful!
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Redirecting to your dashboard...
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => setStep(1)}
                                            disabled={isPending || isConfirming || isSuccess}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1"
                                            disabled={isPending || isConfirming || isSuccess}
                                        >
                                            {isPending || isConfirming ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    {isPending ? 'Confirming...' : 'Processing...'}
                                                </>
                                            ) : isSuccess ? (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Registered!
                                                </>
                                            ) : (
                                                'Complete Registration'
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Benefits Section */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <div className="text-3xl mb-2">💰</div>
                            <CardTitle className="text-lg">Start Earning</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Receive tips from supporters in ETH or any token across multiple chains
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="text-3xl mb-2">🌐</div>
                            <CardTitle className="text-lg">Multi-Chain</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Accept payments on Base, Ethereum, Solana, Bitcoin, and more
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="text-3xl mb-2">⚡</div>
                            <CardTitle className="text-lg">No Fees</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Your supporters never pay gas fees thanks to our sponsorship program
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}