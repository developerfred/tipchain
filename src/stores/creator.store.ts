import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { creatorService, type Creator, type FullCreatorProfile } from '../services/creator.service'

interface CreatorState {
    // State
    currentCreator: Creator | null
    fullProfile: FullCreatorProfile | null
    isLoading: boolean
    error: string | null

    // Actions
    setCurrentCreator: (creator: Creator | null) => void
    clearCurrentCreator: () => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void

    // Async Actions
    fetchCreatorById: (id: string) => Promise<void>
    fetchCreatorByAddress: (address: string) => Promise<void>
    fetchCreatorByBasename: (basename: string) => Promise<void>
    fetchFullProfile: (id: string) => Promise<void>
    searchCreators: (searchTerm: string) => Promise<Creator[]>

    // Utility Actions
    reset: () => void
}

const initialState = {
    currentCreator: null,
    fullProfile: null,
    isLoading: false,
    error: null
}

export const useCreatorStore = create<CreatorState>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setCurrentCreator: (creator) => {
                set({ currentCreator: creator, error: null })
            },

            clearCurrentCreator: () => {
                set({ currentCreator: null, fullProfile: null })
            },

            setLoading: (isLoading) => {
                set({ isLoading })
            },

            setError: (error) => {
                set({ error })
            },

            fetchCreatorById: async (id: string) => {
                const { setLoading, setError, setCurrentCreator } = get()

                setLoading(true)
                setError(null)

                try {
                    const creator = await creatorService.getCreatorById(id)
                    setCurrentCreator(creator)
                } catch (error) {
                    setError(error instanceof Error ? error.message : 'Failed to fetch creator')
                } finally {
                    setLoading(false)
                }
            },

            fetchCreatorByAddress: async (address: string) => {
                const { setLoading, setError, setCurrentCreator } = get()

                setLoading(true)
                setError(null)

                try {
                    const creator = await creatorService.getCreatorByAddress(address)
                    setCurrentCreator(creator)
                } catch (error) {
                    setError(error instanceof Error ? error.message : 'Failed to fetch creator')
                } finally {
                    setLoading(false)
                }
            },

            fetchCreatorByBasename: async (basename: string) => {
                const { setLoading, setError, setCurrentCreator } = get()

                setLoading(true)
                setError(null)

                try {
                    const creator = await creatorService.getCreatorByBasename(basename)
                    setCurrentCreator(creator)
                } catch (error) {
                    setError(error instanceof Error ? error.message : 'Failed to fetch creator')
                } finally {
                    setLoading(false)
                }
            },

            fetchFullProfile: async (id: string) => {
                const { setLoading, setError } = get()

                setLoading(true)
                setError(null)

                try {
                    const fullProfile = await creatorService.getFullProfile(id)
                    set({ fullProfile, error: null })
                } catch (error) {
                    setError(error instanceof Error ? error.message : 'Failed to fetch full profile')
                } finally {
                    setLoading(false)
                }
            },

            searchCreators: async (searchTerm: string): Promise<Creator[]> => {
                const { setLoading, setError } = get()

                setLoading(true)
                setError(null)

                try {
                    const results = await creatorService.searchCreators(searchTerm)
                    return results
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to search creators'
                    setError(errorMessage)
                    throw new Error(errorMessage)
                } finally {
                    setLoading(false)
                }
            },

            reset: () => {
                set(initialState)
            }
        }),
        {
            name: 'creator-store'
        }
    )
)