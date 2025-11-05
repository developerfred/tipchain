import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Creator, Tip } from '../services/creator.service'
import { type DashboardService, type DashboardData, type CreatorStats, dashboardService } from '../services/dashboard.service'

interface DashboardState {
    // State
    creator: Creator | null
    tipsReceived: Tip[]
    stats: CreatorStats | null
    isLoading: boolean
    error: string | null

    // Actions
    setCreator: (creator: Creator | null) => void
    setTipsReceived: (tips: Tip[]) => void
    setStats: (stats: CreatorStats | null) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void

    // Async Actions
    loadDashboardData: (address: string) => Promise<void>
    loadCreatorByAddress: (address: string) => Promise<void>
    loadTipsReceived: (address: string) => Promise<void>
    loadCreatorStats: (address: string) => Promise<void>

    // Utility
    reset: () => void
}

const initialState = {
    creator: null,
    tipsReceived: [],
    stats: null,
    isLoading: false,
    error: null
}

export const useDashboardStore = create<DashboardState>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setCreator: (creator) => {
                set({ creator, error: null })
            },

            setTipsReceived: (tipsReceived) => {
                set({ tipsReceived })
            },

            setStats: (stats) => {
                set({ stats })
            },

            setLoading: (isLoading) => {
                set({ isLoading })
            },

            setError: (error) => {
                set({ error })
            },

            loadDashboardData: async (address: string) => {
                const { setLoading, setError } = get()

                setLoading(true)
                setError(null)

                try {
                    const data = await dashboardService.getDashboardData(address)
                    set({
                        creator: data.creator,
                        tipsReceived: data.tipsReceived,
                        stats: data.stats,
                        error: null
                    })
                } catch (error) {
                    console.error('Error in loadDashboardData:', error)
                    setError(error instanceof Error ? error.message : 'Failed to load dashboard data')
                } finally {
                    setLoading(false)
                }
            },

            loadCreatorByAddress: async (address: string) => {
                const { setLoading, setError, setCreator } = get()

                setLoading(true)
                setError(null)

                try {
                    const creator = await dashboardService.getCreatorByAddress(address)
                    setCreator(creator)
                } catch (error) {
                    setError(error instanceof Error ? error.message : 'Failed to load creator')
                } finally {
                    setLoading(false)
                }
            },

            loadTipsReceived: async (address: string) => {
                const { setLoading, setError, setTipsReceived } = get()

                setLoading(true)
                setError(null)

                try {
                    const tips = await dashboardService.getTipsReceived(address)
                    setTipsReceived(tips)
                } catch (error) {
                    setError(error instanceof Error ? error.message : 'Failed to load tips')
                } finally {
                    setLoading(false)
                }
            },

            loadCreatorStats: async (address: string) => {
                const { setLoading, setError, setStats } = get()

                setLoading(true)
                setError(null)

                try {
                    const stats = await dashboardService.getCreatorStats(address)
                    setStats(stats)
                } catch (error) {
                    setError(error instanceof Error ? error.message : 'Failed to load stats')
                } finally {
                    setLoading(false)
                }
            },

            reset: () => {
                set(initialState)
            }
        }),
        {
            name: 'dashboard-store'
        }
    )
)