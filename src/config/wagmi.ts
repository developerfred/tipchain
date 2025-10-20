import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, baseSepolia, mainnet, polygon, optimism, arbitrum } from '@reown/appkit/networks'
import { QueryClient } from '@tanstack/react-query'

// 1. Get projectId from https://cloud.reown.com
export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID

if (!projectId) {
    throw new Error('VITE_REOWN_PROJECT_ID is not set')
}

// 2. Set up Wagmi adapter
export const networks = [base, baseSepolia, mainnet, polygon, optimism, arbitrum]

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
        analytics: true, // Enable analytics
        email: true, // Enable email login
        socials: ['google', 'github', 'discord', 'apple'], // Enable social logins
        emailShowWallets: true, // Show wallet options with email
        onramp: true, // Enable on-ramp (buy crypto with fiat)
        swaps: true, // Enable token swaps
    },
    themeMode: 'light',
    themeVariables: {
        '--w3m-accent': '#0052FF', // Base blue
        '--w3m-border-radius-master': '8px',
    },
    allWallets: 'SHOW', // Show all 600+ wallets
    featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    ],
})

// Export wagmi config
export const config = wagmiAdapter.wagmiConfig