import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Creator, Tip } from '../types/graphql'

/**
 * Application State Interface
 */
interface AppState {
    // User state
    currentUser: Creator | null
    setCurrentUser: (user: Creator | null) => void

    // Tips state
    recentTips: Tip[]
    setRecentTips: (tips: Tip[]) => void
    addRecentTip: (tip: Tip) => void

    // UI state
    isLoading: boolean
    setIsLoading: (loading: boolean) => void

    error: string | null
    setError: (error: string | null) => void

    // Modal state
    showTipModal: boolean
    setShowTipModal: (show: boolean) => void

    selectedCreator: Creator | null
    setSelectedCreator: (creator: Creator | null) => void

    // Search state
    searchQuery: string
    setSearchQuery: (query: string) => void

    searchResults: Creator[]
    setSearchResults: (results: Creator[]) => void

    // Theme state
    theme: 'light' | 'dark'
    toggleTheme: () => void

    // Referral state (for Divvi SDK)
    referralCode: string | null
    setReferralCode: (code: string | null) => void

    // Transaction state
    pendingTx: string | null
    setPendingTx: (txHash: string | null) => void

    // Reset functions
    reset: () => void
}

const initialState = {
    currentUser: null,
    recentTips: [],
    isLoading: false,
    error: null,
    showTipModal: false,
    selectedCreator: null,
    searchQuery: '',
    searchResults: [],
    theme: 'light' as const,
    referralCode: null,
    pendingTx: null,
}

/**
 * Global application store using Zustand
 * Persists theme and referral code to localStorage
 */
export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            ...initialState,

            // User actions
            setCurrentUser: (user) => set({ currentUser: user }),

            // Tips actions
            setRecentTips: (tips) => set({ recentTips: tips }),
            addRecentTip: (tip) => set((state) => ({
                recentTips: [tip, ...state.recentTips].slice(0, 50) // Keep last 50 tips
            })),

            // UI actions
            setIsLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ error }),

            // Modal actions
            setShowTipModal: (show) => set({ showTipModal: show }),
            setSelectedCreator: (creator) => set({ selectedCreator: creator }),

            // Search actions
            setSearchQuery: (query) => set({ searchQuery: query }),
            setSearchResults: (results) => set({ searchResults: results }),

            // Theme actions
            toggleTheme: () => set((state) => ({
                theme: state.theme === 'light' ? 'dark' : 'light'
            })),

            // Referral actions
            setReferralCode: (code) => set({ referralCode: code }),

            // Transaction actions
            setPendingTx: (txHash) => set({ pendingTx: txHash }),

            // Reset
            reset: () => set(initialState),
        }),
        {
            name: 'tipchain-storage',
            partialize: (state) => ({
                theme: state.theme,
                referralCode: state.referralCode,
            }),
        }
    )
)

/**
 * Selectors for optimized re-renders
 */
export const useCurrentUser = () => useAppStore((state) => state.currentUser)
export const useRecentTips = () => useAppStore((state) => state.recentTips)
export const useIsLoading = () => useAppStore((state) => state.isLoading)
export const useError = () => useAppStore((state) => state.error)
export const useTheme = () => useAppStore((state) => state.theme)
export const useTipModal = () => useAppStore((state) => ({
    show: state.showTipModal,
    creator: state.selectedCreator,
    setShow: state.setShowTipModal,
    setCreator: state.setSelectedCreator,
}))
export const useSearch = () => useAppStore((state) => ({
    query: state.searchQuery,
    results: state.searchResults,
    setQuery: state.setSearchQuery,
    setResults: state.setSearchResults,
}))