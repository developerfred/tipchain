import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Format wallet address to short version
 * @param address - Full wallet address
 * @param chars - Number of chars to show on each side
 */
export function shortenAddress(address: string, chars = 4): string {
    if (!address) return ""
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Format ETH value to readable format
 */
export function formatEth(value: bigint, decimals = 4): string {
    const eth = Number(value) / 1e18
    return eth.toFixed(decimals)
}

/**
 * Format USD value
 */
export function formatUSD(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value)
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(num: number): string {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
    return num.toString()
}

/**
 * Format timestamp to relative time
 */
export function formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`
    return `${Math.floor(seconds / 2592000)}mo ago`
}

/**
 * Validate basename format
 */
export function isValidBasename(basename: string): boolean {
    // Only lowercase letters, numbers, and hyphens
    // Must start with letter or number
    // Length between 3-30 characters
    const regex = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/
    return regex.test(basename)
}

/**
 * Generate shareable tip link
 */
export function generateTipLink(basename: string): string {
    const baseUrl = import.meta.env.VITE_APP_URL || 'https://tipchain.app'
    return `${baseUrl}/tip/${basename}`
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch (err) {
        console.error('Failed to copy:', err)
        return false
    }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

/**
 * Sleep/delay function
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))