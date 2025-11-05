/**
 * GraphQL Types - Auto-generated types based on schema
 * These match the GraphQL schema from the indexer
 */

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
    tipsReceived: Tip[]
    tipsSent: Tip[]
}

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
    totalVolume: string
    totalTips: string
    uniqueSenders: number
    uniqueReceivers: number
}

export interface TipRelation {
    id: string
    from: Creator
    to: Creator
    totalTips: string
    totalAmount: string
    firstTipAt: string
    lastTipAt: string
}

export interface DailyStats {
    id: string
    date: string
    totalTips: string
    totalVolume: string
    uniqueSenders: number
    uniqueReceivers: number
    activeCreators: number
}

export interface PlatformConfig {
    id: string
    currentFee: string
    feeCollector: string
    isPaused: boolean
    owner: string
    lastUpdated: string
}

// Query input types
export interface CreatorQueryVariables {
    id?: string
    address?: string
    basename?: string
}

export interface TipsQueryVariables {
    creatorId: string
    first?: number
    skip?: number
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
}

export interface DailyStatsQueryVariables {
    first?: number
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
}