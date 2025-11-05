// hooks/useCreatorProfile.ts
import { useEffect, useCallback } from 'react'
import { useCreatorStore } from '../stores/creator.store'

export const useCreatorProfile = (identifier?: string) => {
    const {
        currentCreator,
        fullProfile,
        isLoading,
        error,
        fetchCreatorById,
        fetchCreatorByAddress,
        fetchCreatorByBasename,
        reset
    } = useCreatorStore()

    console.log('useCreatorProfile called with identifier:', identifier) // Debug

    const loadCreator = useCallback(async (id: string) => {
        console.log('Loading creator by ID:', id) // Debug
        await fetchCreatorById(id)
    }, [fetchCreatorById])

    const loadCreatorByAddress = useCallback(async (address: string) => {
        console.log('Loading creator by address:', address) // Debug
        await fetchCreatorByAddress(address)
    }, [fetchCreatorByAddress])

    const loadCreatorByBasename = useCallback(async (basename: string) => {
        console.log('Loading creator by basename:', basename) // Debug
        await fetchCreatorByBasename(basename)
    }, [fetchCreatorByBasename])

    // Auto-load when identifier changes
    useEffect(() => {
        if (!identifier) {
            console.log('No identifier provided') // Debug
            reset()
            return
        }

        const loadProfile = async () => {
            console.log('Starting profile load for:', identifier) // Debug

            // Check if it's an address (starts with 0x and has proper length)
            if (identifier.startsWith('0x') && identifier.length === 42) {
                console.log('Identifier detected as address') // Debug
                await loadCreatorByAddress(identifier)
            }
            // Check if it's a basename (no special characters, etc.)
            else if (/^[a-zA-Z0-9-_]+$/.test(identifier)) {
                console.log('Identifier detected as basename') // Debug
                await loadCreatorByBasename(identifier)
            }
            // Default to ID search
            else {
                console.log('Identifier detected as ID') // Debug
                await loadCreator(identifier)
            }
        }

        loadProfile()
    }, [identifier, loadCreator, loadCreatorByAddress, loadCreatorByBasename, reset])

    return {
        creator: currentCreator,
        fullProfile,
        isLoading,
        error,
        loadCreator,
        loadCreatorByAddress,
        loadCreatorByBasename,
        reset
    }
}