import { GraphQLService } from './graphql/client'
import {
    // Fragments
    CREATOR_FRAGMENT,
    CREATOR_SEARCH_FRAGMENT,
    CREATOR_STATS_FRAGMENT,

    // Basic Queries
    GET_CREATOR_BY_ID,
    GET_CREATOR_BY_ADDRESS,
    GET_CREATOR_BY_BASENAME,

    // List Queries
    GET_ALL_CREATORS,
    GET_ACTIVE_CREATORS,
    GET_TOP_CREATORS,

    // Search Queries
    SEARCH_CREATORS_BASIC,
    SEARCH_CREATORS_ADVANCED,

    // Detailed Queries
    GET_CREATOR_FULL_PROFILE,
    GET_CREATOR_WITH_TIPS,
    GET_CREATOR_WITH_RELATIONSHIPS,

    // Stats Queries
    GET_CREATOR_STATS,
    GET_CREATOR_COUNT,
    GET_PLATFORM_CREATOR_STATS,

    // Batch Queries
    GET_CREATORS_BY_ADDRESSES,
    GET_CREATORS_BY_IDS,

    // Utility Queries
    CHECK_CREATOR_EXISTS,
    GET_CREATOR_REGISTRATION
} from './graphql/queries/creator.queries'

export interface Creator {
    id: string
    address: string
    basename: string
    displayName: string
    bio: string
    avatarUrl: string
    registeredAt: string
    updatedAt: string
    totalTipsReceived: string
    totalTipsSent: string
    totalAmountReceived: string
    totalAmountSent: string
    tipCount: number
    tippedByCount: number
    isActive: boolean
}

export interface CreatorSearchResult {
    id: string
    address: string
    basename: string
    displayName: string
    avatarUrl: string
    bio: string
    totalAmountReceived: string
    tipCount: number
    isActive: boolean
}

export interface CreatorStats {
    totalTipsReceived: string
    totalTipsSent: string
    totalAmountReceived: string
    totalAmountSent: string
    tipCount: number
    tippedByCount: number
}

export interface PlatformCreatorStats {
    activeCount: number
    totalCount: number
    topTipped: {
        id: string
        displayName: string
        totalAmountReceived: string
    } | null
}

export interface SearchOptions {
    limit?: number
    offset?: number
    order_by?: any[]
    onlyActive?: boolean
}

export class CreatorService extends GraphQLService {
    // ============ BASIC CRUD OPERATIONS ============
    async getCreatorById(id: string): Promise<Creator | null> {
        const response = await this.request<{ Creator: Creator[] }>(GET_CREATOR_BY_ID, { id })
        return response.Creator[0] || null
    }

    async getCreatorByAddress(address: string): Promise<Creator | null> {
        const response = await this.request<{ Creator: Creator[] }>(GET_CREATOR_BY_ADDRESS, { address })
        return response.Creator[0] || null
    }

    async getCreatorByBasename(basename: string): Promise<Creator | null> {
        console.log('🔍 Searching creator by basename:', basename)
        const response = await this.request<{ Creator: Creator[] }>(GET_CREATOR_BY_BASENAME, { basename })
        return response.Creator[0] || null
    }

    // ============ LIST OPERATIONS ============
    async getAllCreators(options: SearchOptions = {}): Promise<Creator[]> {
        const { limit = 100, offset = 0, order_by = [{ totalAmountReceived: 'desc' }] } = options

        const response = await this.request<{ Creator: Creator[] }>(GET_ALL_CREATORS, {
            limit,
            offset,
            order_by
        })
        return response.Creator
    }

    async getActiveCreators(options: SearchOptions = {}): Promise<Creator[]> {
        const { limit = 100, offset = 0, order_by = [{ totalAmountReceived: 'desc' }] } = options

        const response = await this.request<{ Creator: Creator[] }>(GET_ACTIVE_CREATORS, {
            limit,
            offset,
            order_by
        })
        return response.Creator
    }

    async getTopCreators(limit: number = 50): Promise<CreatorSearchResult[]> {
        const response = await this.request<{ Creator: CreatorSearchResult[] }>(GET_TOP_CREATORS, { limit })
        return response.Creator
    }

    // ============ SEARCH OPERATIONS ============
    async searchCreators(searchTerm: string): Promise<CreatorSearchResult[]> {
        const response = await this.request<{ Creator: CreatorSearchResult[] }>(SEARCH_CREATORS_BASIC, { searchTerm })
        return response.Creator
    }

    async searchCreatorsAdvanced(searchTerm: string, options: SearchOptions = {}): Promise<CreatorSearchResult[]> {
        const { limit = 50, offset = 0, order_by = [{ totalAmountReceived: 'desc' }] } = options

        const formattedSearchTerm = `%${searchTerm}%`

        const response = await this.request<{ Creator: CreatorSearchResult[] }>(SEARCH_CREATORS_ADVANCED, {
            searchTerm: formattedSearchTerm,
            limit,
            offset,
            order_by
        })
        return response.Creator
    }

    // ============ DETAILED PROFILE OPERATIONS ============
    async getFullProfile(id: string): Promise<any> {
        const response = await this.request<any>(GET_CREATOR_FULL_PROFILE, { id })
        return response.Creator[0] || null
    }

    async getCreatorWithTips(id: string, tipsLimit: number = 10): Promise<any> {
        const response = await this.request<any>(GET_CREATOR_WITH_TIPS, {
            id,
            tipsLimit
        })
        return response.Creator[0] || null
    }

    // ============ STATS OPERATIONS ============
    async getCreatorStats(id: string): Promise<CreatorStats | null> {
        const response = await this.request<{ Creator: CreatorStats[] }>(GET_CREATOR_STATS, { id })
        return response.Creator[0] || null
    }

    async getCreatorCount(where: any = {}): Promise<number> {
        const response = await this.request<{ Creator: any[] }>(GET_CREATOR_COUNT, { where })
        return response.Creator.length
    }

    async getPlatformCreatorStats(): Promise<PlatformCreatorStats> {
        const response = await this.request<{
            active: any[]
            total: any[]
            topTipped: any[]
        }>(GET_PLATFORM_CREATOR_STATS)

        return {
            activeCount: response.active.length,
            totalCount: response.total.length,
            topTipped: response.topTipped[0] || null
        }
    }

    // ============ BATCH OPERATIONS ============
    async getCreatorsByAddresses(addresses: string[]): Promise<CreatorSearchResult[]> {
        const response = await this.request<{ Creator: CreatorSearchResult[] }>(GET_CREATORS_BY_ADDRESSES, { addresses })
        return response.Creator
    }

    async getCreatorsByIds(ids: string[]): Promise<CreatorSearchResult[]> {
        const response = await this.request<{ Creator: CreatorSearchResult[] }>(GET_CREATORS_BY_IDS, { ids })
        return response.Creator
    }

    // ============ UTILITY OPERATIONS ============
    async checkCreatorExists(address: string): Promise<boolean> {
        const response = await this.request<{ Creator: any[] }>(CHECK_CREATOR_EXISTS, { address })
        return response.Creator.length > 0
    }

    async findCreator(identifier: string): Promise<Creator | null> {
        // Try different lookup methods
        const methods = [
            () => this.getCreatorById(identifier),
            () => this.getCreatorByAddress(identifier),
            () => this.getCreatorByBasename(identifier)
        ]

        for (const method of methods) {
            const creator = await method()
            if (creator) return creator
        }

        return null
    }

    // ============ PAGINATION HELPERS ============
    async getCreatorsPaginated(
        page: number = 1,
        pageSize: number = 20,
        orderBy: any = { totalAmountReceived: 'desc' }
    ): Promise<{ creators: Creator[], totalCount: number }> {
        const offset = (page - 1) * pageSize
        const creators = await this.getAllCreators({
            limit: pageSize,
            offset,
            order_by: [orderBy]
        })

        const totalCount = await this.getCreatorCount()

        return { creators, totalCount }
    }
}

export const creatorService = new CreatorService()


export interface Tip {
    id: string
    from: Creator
    to: Creator
    token: Token
    amount: string
    message: string
    timestamp: string
    blockNumber: string
    transactionHash: string
}

export interface Token {
    id: string
    address: string
    symbol?: string
    name?: string
    decimals?: number
    totalVolume: string
    totalTips: number
    uniqueSenders: number
    uniqueReceivers: number
}
