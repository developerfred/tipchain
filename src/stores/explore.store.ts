// stores/explore.store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Creator } from '../services/creator.service'
import type { ExploreService, CreatorsResponse, PlatformStats, SearchOptions } from '../services/explore.service'

interface ExploreState {
    // State
    creators: Creator[]
    platformStats: PlatformStats | null
    isLoading: boolean
    isSearching: boolean
    error: string | null
    searchQuery: string
    totalCount: number
    hasMore: boolean

    // Filters
    filters: {
        sortBy: 'totalAmountReceived' | 'tipCount' | 'registeredAt' | 'displayName'
        sortOrder: 'asc' | 'desc'
        onlyActive: boolean
    }

    // Pagination
    pagination: {
        limit: number
        offset: number
    }

    // Actions
    setSearchQuery: (query: string) => void
    setFilters: (filters: Partial<ExploreState['filters']>) => void
    setPagination: (pagination: Partial<ExploreState['pagination']>) => void
    resetFilters: () => void

    // Async Actions
    loadCreators: (options?: SearchOptions) => Promise<void>
    searchCreators: (searchTerm: string, options?: SearchOptions) => Promise<void>
    loadPlatformStats: () => Promise<void>
    loadMore: () => Promise<void>

    // Utility
    reset: () => void
}

const initialState = {
    creators: [],
    platformStats: null,
    isLoading: false,
    isSearching: false,
    error: null,
    searchQuery: '',
    totalCount: 0,
    hasMore: false,
    filters: {
        sortBy: 'totalAmountReceived' as const,
        sortOrder: 'desc' as const,
        onlyActive: true
    },
    pagination: {
        limit: 50,
        offset: 0
    }
}

export const useExploreStore = create<ExploreState>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setSearchQuery: (query) => {
                set({ searchQuery: query })
            },

            setFilters: (newFilters) => {
                set((state) => ({
                    filters: { ...state.filters, ...newFilters },
                    pagination: { ...state.pagination, offset: 0 } // Reset offset when filters change
                }))
            },

            setPagination: (newPagination) => {
                set((state) => ({
                    pagination: { ...state.pagination, ...newPagination }
                }))
            },

            resetFilters: () => {
                set({
                    filters: initialState.filters,
                    pagination: { ...initialState.pagination, offset: 0 }
                })
            },

            loadCreators: async (options: SearchOptions = {}) => {
                const { setLoading, setError, pagination, filters } = get()

                setLoading(true)
                setError(null)

                try {
                    const orderBy = { [filters.sortBy]: filters.sortOrder }
                    const where = filters.onlyActive ? { isActive: { _eq: true } } : {}

                    const response = await exploreService.getAllCreators({
                        limit: pagination.limit,
                        offset: pagination.offset,
                        orderBy,
                        onlyActive: filters.onlyActive,
                        ...options
                    })

                    set({
                        creators: response.creators,
                        totalCount: response.totalCount,
                        hasMore: response.creators.length === pagination.limit,
                        error: null
                    })
                } catch (error) {
                    console.error('Error in loadCreators:', error)
                    setError(error instanceof Error ? error.message : 'Failed to load creators')
                } finally {
                    setLoading(false)
                }
            },

            searchCreators: async (searchTerm: string, options: SearchOptions = {}) => {
                const { setLoading, setSearching, setError, pagination, filters } = get()

                setLoading(true)
                setSearching(true)
                setError(null)

                try {
                    const orderBy = { [filters.sortBy]: filters.sortOrder }

                    const response = await exploreService.searchCreators(searchTerm, {
                        limit: pagination.limit,
                        offset: pagination.offset,
                        orderBy,
                        ...options
                    })

                    set({
                        creators: response.creators,
                        totalCount: response.totalCount,
                        hasMore: response.creators.length === pagination.limit,
                        searchQuery: searchTerm,
                        error: null
                    })
                } catch (error) {
                    console.error('Error in searchCreators:', error)
                    setError(error instanceof Error ? error.message : 'Failed to search creators')
                } finally {
                    setLoading(false)
                    setSearching(false)
                }
            },

            loadPlatformStats: async () => {
                const { setError } = get()

                set({ isLoading: true, error: null })

                try {
                    const stats = await exploreService.getPlatformStats()
                    set({ platformStats: stats, error: null })
                } catch (error) {
                    console.error('Error in loadPlatformStats:', error)
                    setError(error instanceof Error ? error.message : 'Failed to load platform stats')
                } finally {
                    set({ isLoading: false })
                }
            },

            loadMore: async () => {
                const {
                    creators,
                    pagination,
                    filters,
                    searchQuery,
                    loadCreators,
                    searchCreators,
                    setPagination,
                    setError
                } = get()

                setError(null)

                try {
                    const newOffset = pagination.offset + pagination.limit
                    setPagination({ offset: newOffset })

                    const orderBy = { [filters.sortBy]: filters.sortOrder }
                    const loadOptions = {
                        limit: pagination.limit,
                        offset: newOffset,
                        orderBy,
                        onlyActive: filters.onlyActive
                    }

                    let newCreators: Creator[] = []

                    if (searchQuery) {
                        const response = await exploreService.searchCreators(searchQuery, loadOptions)
                        newCreators = response.creators
                    } else {
                        const response = await exploreService.getAllCreators(loadOptions)
                        newCreators = response.creators
                    }

                    set({
                        creators: [...creators, ...newCreators],
                        hasMore: newCreators.length === pagination.limit
                    })
                } catch (error) {
                    console.error('Error in loadMore:', error)
                    setError(error instanceof Error ? error.message : 'Failed to load more creators')
                    // Revert offset on error
                    setPagination({ offset: pagination.offset })
                }
            },

            reset: () => {
                set(initialState)
            }
        }),
        {
            name: 'explore-store'
        }
    )
)