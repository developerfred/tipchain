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
    isInitialized: boolean
}

const FarcasterContext = createContext<FarcasterContextType>({
    isMiniApp: false,
    user: null,
    isLoading: true,
    error: null,
    isInitialized: false,
})

export function FarcasterProvider({ children }: { children: React.ReactNode }) {
    const [isMiniApp, setIsMiniApp] = useState(false)
    const [user, setUser] = useState<FarcasterUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        const initializeFarcaster = async () => {
            try {
                // Verificar se estamos no Farcaster
                const inMiniApp = await sdk.isInMiniApp()
                console.log('📱 Farcaster Mini App detected:', inMiniApp)
                setIsMiniApp(inMiniApp)

                if (inMiniApp) {
                    // Inicializar SDK
                    await sdk.actions.ready()

                    try {
                        // Tentar obter dados do usuário
                        const userData = await sdk.user.get()
                        setUser(userData)
                        console.log('👤 Farcaster user data:', userData)
                    } catch (userError) {
                        console.log('⚠️ Could not fetch Farcaster user data:', userError)
                        // Não é um erro crítico, podemos continuar
                    }
                }
            } catch (error) {
                console.log('❌ Farcaster initialization failed:', error)
                setError('Failed to initialize Farcaster SDK')
                setIsMiniApp(false)
            } finally {
                setIsLoading(false)
                setIsInitialized(true)
            }
        }

        initializeFarcaster()
    }, [])

    return (
        <FarcasterContext.Provider value={{
            isMiniApp,
            user,
            isLoading,
            error,
            isInitialized
        }}>
            {children}
        </FarcasterContext.Provider>
    )
}

export function useFarcaster() {
    const context = useContext(FarcasterContext)
    if (context === undefined) {
        throw new Error('useFarcaster must be used within a FarcasterProvider')
    }
    return context
}