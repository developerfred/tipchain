import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, baseSepolia, mainnet, polygon, optimism, arbitrum, celo } from '@reown/appkit/networks'
import { QueryClient } from '@tanstack/react-query'

// 1. Get projectId from https://cloud.reown.com
export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID

if (!projectId) {
    throw new Error('VITE_REOWN_PROJECT_ID is not set')
}

// 2. Set up Wagmi adapter
export const networks = [base, baseSepolia, mainnet, polygon, optimism, arbitrum, celo]

export const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId,
    ssr: false,
})

// 3. Create QueryClient
export const queryClient = new QueryClient()

// 4. Create AppKit instance
export const modal = createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata: {
        name: 'TipChain',
        description: 'Support Creators. Zero Friction. Multi-chain tips made easy.',
        url: import.meta.env.VITE_APP_URL || 'https://tipchain.app',
        icons: ['https://tipchain.app/logo.png']
    },
    features: {
        analytics: true, 
        email: true, 
        socials: ['google', 'github', 'discord', 'apple'], 
        emailShowWallets: true, 
        onramp: true, 
        swaps: true, 
    },
    themeMode: 'light',
    themeVariables: {
        '--w3m-accent': '#0052FF', 
        '--w3m-border-radius-master': '8px',
    },
    allWallets: 'SHOW', 
    featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', 
        'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', 
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', 
    ],
})


export const config = wagmiAdapter.wagmiConfig