// services/explore.service.ts
import { GraphQLService } from './graphql/client'
import {
    GET_ALL_CREATORS,
    SEARCH_CREATORS_ADVANCED,
    GET_PLATFORM_STATS,
    GET_TOP_CREATORS
} from './graphql/queries/explore.queries'
import type { Creator } from './creator.service'

export interface PlatformStats {
    totalCreators: number
    totalTips: number
    totalVolume: bigint
    averageTipsPerCreator: number
    dailyStats?: {
        totalTips: number
        totalVolume: bigint
        uniqueSenders: number
        uniqueReceivers: number
        activeCreators: number
    }
}

export interface CreatorsResponse {
    creators: Creator[]
    totalCount: number
    totalTips: number
    totalVolume: bigint
}

export interface SearchOptions {
    limit?: number
    offset?: number
    orderBy?: any
    onlyActive?: boolean
}

export class ExploreService extends GraphQLService {
    async getAllCreators(options: SearchOptions = {}): Promise<CreatorsResponse> {
        const {
            limit = 50,
            offset = 0,
            orderBy = { totalAmountReceived: 'desc' },
            onlyActive = true
        } = options

        try {
            const where = onlyActive ? { isActive: { _eq: true } } : {}

            const response = await this.request<{
                Creator: Creator[]
                Creator_aggregate: {
                    aggregate: {
                        count: number
                    }
                }
            }>(GET_ALL_CREATORS, {
                limit,
                offset,
                orderBy,
                where
            })

            // Calcular stats manualmente
            const totalTips = response.Creator.reduce((sum, creator) => sum + (creator.tipCount || 0), 0)
            const totalVolume = response.Creator.reduce((sum, creator) => {
                const amount = creator.totalAmountReceived ? BigInt(creator.totalAmountReceived) : BigInt(0)
                return sum + amount
            }, BigInt(0))

            return {
                creators: response.Creator,
                totalCount: response.Creator_aggregate.aggregate.count,
                totalTips,
                totalVolume
            }
        } catch (error) {
            console.error('Error in getAllCreators:', error)
            return {
                creators: [],
                totalCount: 0,
                totalTips: 0,
                totalVolume: BigInt(0)
            }
        }
    }

    async searchCreators(searchTerm: string, options: SearchOptions = {}): Promise<CreatorsResponse> {
        const {
            limit = 50,
            offset = 0,
            orderBy = { totalAmountReceived: 'desc' }
        } = options

        try {
            const formattedSearchTerm = `%${searchTerm}%`

            const response = await this.request<{
                Creator: Creator[]
                Creator_aggregate: {
                    aggregate: {
                        count: number
                    }
                }
            }>(SEARCH_CREATORS_ADVANCED, {
                searchTerm: formattedSearchTerm,
                limit,
                offset,
                orderBy
            })

            // Calcular stats manualmente
            const totalTips = response.Creator.reduce((sum, creator) => sum + (creator.tipCount || 0), 0)
            const totalVolume = response.Creator.reduce((sum, creator) => {
                const amount = creator.totalAmountReceived ? BigInt(creator.totalAmountReceived) : BigInt(0)
                return sum + amount
            }, BigInt(0))

            return {
                creators: response.Creator,
                totalCount: response.Creator_aggregate.aggregate.count,
                totalTips,
                totalVolume
            }
        } catch (error) {
            console.error('Error in searchCreators:', error)
            return {
                creators: [],
                totalCount: 0,
                totalTips: 0,
                totalVolume: BigInt(0)
            }
        }
    }

    async getPlatformStats(): Promise<PlatformStats> {
        try {
            const response = await this.request<{
                Creator_aggregate: {
                    aggregate: {
                        count: number
                    }
                }
                Tip_aggregate: {
                    aggregate: {
                        count: number
                        sum: {
                            amount: string
                        }
                    }
                }
                DailyStats: Array<{
                    totalTips: number
                    totalVolume: string
                    uniqueSenders: number
                    uniqueReceivers: number
                    activeCreators: number
                }>
            }>(GET_PLATFORM_STATS)

            const dailyStats = response.DailyStats[0]
            const totalCreators = response.Creator_aggregate.aggregate.count
            const totalTips = response.Tip_aggregate.aggregate.count
            const totalVolume = BigInt(response.Tip_aggregate.aggregate.sum?.amount || '0')
            const averageTipsPerCreator = totalCreators > 0 ? totalTips / totalCreators : 0

            return {
                totalCreators,
                totalTips,
                totalVolume,
                averageTipsPerCreator,
                dailyStats: dailyStats ? {
                    totalTips: dailyStats.totalTips,
                    totalVolume: BigInt(dailyStats.totalVolume || '0'),
                    uniqueSenders: dailyStats.uniqueSenders,
                    uniqueReceivers: dailyStats.uniqueReceivers,
                    activeCreators: dailyStats.activeCreators
                } : undefined
            }
        } catch (error) {
            console.error('Error in getPlatformStats:', error)
            return {
                totalCreators: 0,
                totalTips: 0,
                totalVolume: BigInt(0),
                averageTipsPerCreator: 0
            }
        }
    }

    async getTopCreators(limit: number = 50): Promise<Creator[]> {
        try {
            const response = await this.request<{
                Creator: Creator[]
            }>(GET_TOP_CREATORS, { limit })

            return response.Creator
        } catch (error) {
            console.error('Error in getTopCreators:', error)
            return []
        }
    }
}

export const exploreService = new ExploreService()