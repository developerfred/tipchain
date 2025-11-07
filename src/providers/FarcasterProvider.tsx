// providers/FarcasterProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

interface FarcasterUser {
    fid: number
    username: string
    displayName: string
    pfpUrl: string
    bio: string
}

interface FarcasterContextType {
    isMiniApp: boolean
    user: FarcasterUser | null
    isLoading: boolean
    error: string | null
}

const FarcasterContext = createContext<FarcasterContextType>({
    isMiniApp: false,
    user: null,
    isLoading: true,
    error: null,
})

export function FarcasterProvider({ children }: { children: React.ReactNode }) {
    const [isMiniApp, setIsMiniApp] = useState(false)
    const [user, setUser] = useState<FarcasterUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const initializeFarcaster = async () => {
            try {
                // Verifica se estamos em um Mini App do Farcaster
                const inMiniApp = await sdk.isInMiniApp()
                console.log('📱 Farcaster Mini App detected:', inMiniApp)
                setIsMiniApp(inMiniApp)

                if (inMiniApp) {
                    // Inicializa o SDK
                    await sdk.actions.ready()
                    
                    try {
                        // Obtém informações do usuário
                        const userData = await sdk.user.get()
                        setUser(userData)
                        console.log('👤 Farcaster user data:', userData)
                    } catch (userError) {
                        console.log('⚠️ Could not fetch Farcaster user data:', userError)
                        setError('Failed to load user data')
                    }
                }
            } catch (error) {
                console.log('❌ Farcaster initialization failed:', error)
                setError('Failed to initialize Farcaster SDK')
                setIsMiniApp(false)
            } finally {
                setIsLoading(false)
            }
        }

        initializeFarcaster()
    }, [])

    return (
        <FarcasterContext.Provider value={{ isMiniApp, user, isLoading, error }}>
            {children}
        </FarcasterContext.Provider>
    )
}

// Hook para usar o contexto do Farcaster
export function useFarcaster() {
    const context = useContext(FarcasterContext)
    if (context === undefined) {
        throw new Error('useFarcaster must be used within a FarcasterProvider')
    }
    return context
}