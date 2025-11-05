import { GraphQLService } from './graphql/client'
import {
    GET_CREATOR_BY_ID,
 
    GET_CREATOR_STATS
} from './graphql/queries/creator.queries'
import type { Creator, Tip } from './creator.service'

export interface CreatorStats {
    totalAmountReceived: string
    tipCount: number
    tippedByCount: number
    averageTip: string
}

export interface DashboardData {
    creator: Creator | null
    tipsReceived: Tip[]
    stats: CreatorStats | null
}

export class DashboardService extends GraphQLService {
    async getCreatorByAddress(address: string): Promise<Creator | null> {
        try {
            const response = await this.request<{ Creator: Creator[] }>(GET_CREATOR_BY_ID, { address })
            return response.Creator[0] || null
        } catch (error) {
            console.error('Error fetching creator by address:', error)
            return null
        }
    }

    /*

    async getTipsReceived(creatorAddress: string, limit: number = 10): Promise<Tip[]> {
        try {
            const response = await this.request<{ Tip: Tip[] }>(GET_TIPS_RECEIVED, {
                creatorAddress,
                limit
            })
            return response.Tip || []
        } catch (error) {
            console.error('Error fetching tips received:', error)
            return []
        }
    } */

    async getCreatorStats(address: string): Promise<CreatorStats> {
        try {
            const response = await await this.request<{
                Creator: Array<{
                    totalAmountReceived: string
                    tipCount: number
                    tippedByCount: number
                }>
            }>(GET_CREATOR_STATS, { address })

            const creator = response.Creator[0]

            if (!creator) {
                return {
                    totalAmountReceived: '0',
                    tipCount: 0,
                    tippedByCount: 0,
                    averageTip: '0'
                }
            }

            // Calcular average tip manualmente
            const totalAmount = BigInt(creator.totalAmountReceived || '0')
            const tipCount = creator.tipCount || 1 // evitar divisão por zero
            const averageTip = totalAmount / BigInt(tipCount)

            return {
                totalAmountReceived: creator.totalAmountReceived || '0',
                tipCount: creator.tipCount || 0,
                tippedByCount: creator.tippedByCount || 0,
                averageTip: averageTip.toString()
            }
        } catch (error) {
            console.error('Error fetching creator stats:', error)
            return {
                totalAmountReceived: '0',
                tipCount: 0,
                tippedByCount: 0,
                averageTip: '0'
            }
        }
    }

    async getDashboardData(address: string): Promise<DashboardData> {
        try {
            const [creator, tipsReceived, stats] = await Promise.all([
                this.getCreatorByAddress(address),
                this.getTipsReceived(address),
                this.getCreatorStats(address)
            ])

            return {
                creator,
                tipsReceived,
                stats
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error)
            return {
                creator: null,
                tipsReceived: [],
                stats: null
            }
        }
    }
}

export const dashboardService = new DashboardService()