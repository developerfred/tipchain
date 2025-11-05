// utils/currency.ts
import { useChainId } from 'wagmi'

export interface NetworkConfig {
    symbol: string
    name: string
    decimals: number
}

export const NETWORK_CURRENCIES: { [key: number]: NetworkConfig } = {
    // Base Mainnet
    8453: {
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18
    },
    // Base Sepolia Testnet
    84532: {
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18
    },
    // Celo Mainnet
    42220: {
        symbol: 'CELO',
        name: 'Celo',
        decimals: 18
    },
    // Celo Alfajores Testnet
    44787: {
        symbol: 'CELO',
        name: 'Celo',
        decimals: 18
    }
}

// Hook para usar o símbolo da moeda atual
export function useCurrency() {
    const chainId = useChainId()

    const getCurrencySymbol = (): string => {
        return NETWORK_CURRENCIES[chainId]?.symbol || 'ETH'
    }

    const getCurrencyConfig = (): NetworkConfig => {
        return NETWORK_CURRENCIES[chainId] || {
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18
        }
    }

    const formatAmount = (amount: string | bigint, decimals: number = 4): string => {
        const config = getCurrencyConfig()
        const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount

        // Formata o valor
        const formatted = formatEth(amountBigInt, decimals)
        return `${formatted} ${config.symbol}`
    }

    return {
        symbol: getCurrencySymbol(),
        config: getCurrencyConfig(),
        formatAmount,
        getCurrencySymbol,
        getCurrencyConfig
    }
}

// Função standalone para obter símbolo por chainId
export function getCurrencySymbolByChainId(chainId: number): string {
    return NETWORK_CURRENCIES[chainId]?.symbol || 'ETH'
}

// Função standalone para obter configuração por chainId
export function getCurrencyConfigByChainId(chainId: number): NetworkConfig {
    return NETWORK_CURRENCIES[chainId] || {
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18
    }
}

// Função para formatar ETH (ou CELO) value
export function formatEth(amount: bigint, decimals: number = 4): string {
    const etherValue = Number(amount) / 1e18
    return etherValue.toFixed(decimals)
}

// Função para formatar valor com o símbolo correto
export function formatCurrency(amount: string | bigint, chainId: number, decimals: number = 4): string {
    const symbol = getCurrencySymbolByChainId(chainId)
    const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount
    const formatted = formatEth(amountBigInt, decimals)
    return `${formatted} ${symbol}`
}

// Função simplificada para usar em componentes
export function useNetworkCurrency() {
    const chainId = useChainId()
    return getCurrencySymbolByChainId(chainId)
}