import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Loader2 } from 'lucide-react'

/**
 * Profile page - redirects to appropriate view
 * /profile (no params) → Dashboard if connected, else Landing
 * /profile/:address → CreatorProfile view
 */
export function Profile() {
    const navigate = useNavigate()
    const { address: paramAddress } = useParams()
    const { address: connectedAddress, isConnected } = useAccount()

    useEffect(() => {
        // If no address parameter, redirect based on connection status
        if (!paramAddress) {
            if (isConnected && connectedAddress) {
                navigate('/dashboard')
            } else {
                navigate('/')
            }
            return
        }

        // If address parameter matches connected address, go to dashboard
        if (isConnected && connectedAddress?.toLowerCase() === paramAddress.toLowerCase()) {
            navigate('/dashboard')
            return
        }
        
        navigate(`/profile/${paramAddress}`)
    }, [paramAddress, isConnected, connectedAddress, navigate])

    return (
        <div className="container py-24">
            <div className="max-w-md mx-auto text-center space-y-6">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Loading profile...</p>
            </div>
        </div>
    )
}