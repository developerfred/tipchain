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

    const loadCreator = useCallback(async (id: string) => {
        await fetchCreatorById(id)
    }, [fetchCreatorById])

    const loadCreatorByAddress = useCallback(async (address: string) => {
        await fetchCreatorByAddress(address)
    }, [fetchCreatorByAddress])

    const loadCreatorByBasename = useCallback(async (basename: string) => {
        await fetchCreatorByBasename(basename)
    }, [fetchCreatorByBasename])

    // Auto-load when identifier changes
    useEffect(() => {
        if (!identifier) {
            reset()
            return
        }

        const loadProfile = async () => {
            // Check if it's an address (starts with 0x and has proper length)
            if (identifier.startsWith('0x') && identifier.length === 42) {
                await loadCreatorByAddress(identifier)
            }
            // Check if it's a basename (no special characters, etc.)
            else if (/^[a-zA-Z0-9-_]+$/.test(identifier)) {
                await loadCreatorByBasename(identifier)
            }
            // Default to ID search
            else {
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