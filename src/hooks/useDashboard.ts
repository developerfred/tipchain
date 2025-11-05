import { useEffect, useState } from 'react'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services/graphql/client'

// GraphQL query corrigida baseada no seu exemplo
const GET_CREATOR_DASHBOARD = gql`
  query GetCreatorDashboard($id: String!) {
    Creator(where: {id: {_eq: $id}}) {
      id
      address
      basename
      displayName
      bio
      avatarUrl
      registeredAt
      updatedAt
      totalAmountReceived
      totalAmountSent
      totalTipsReceived
      totalTipsSent
      tipCount
      tippedByCount
      isActive
      tipsReceived(limit: 10, order_by: {timestamp: desc}) {
        id
        from {
          id
          address
          displayName
          basename
          avatarUrl
        }
        amount
        message
        timestamp
        blockNumber
        transactionHash
        token {
          id
          address
        }
      }
    }
  }
`

export interface Creator {
    id: string
    address: string
    basename: string
    displayName: string
    bio: string
    avatarUrl: string
    registeredAt: string
    updatedAt: string
}

export interface TipFrom {
    id: string
    address: string
    displayName: string
    basename: string
    avatarUrl: string
}

export interface Token {
    id: string
    address: string
}

export interface Tip {
    id: string
    from: TipFrom
    amount: string
    message: string
    timestamp: string
    blockNumber: string
    transactionHash: string
    token: Token
}

export interface DashboardStats {
    totalAmountReceived: string
    totalAmountSent: string
    totalTipsReceived: string
    totalTipsSent: string
    tipCount: number
    tippedByCount: number
}

interface GraphQLResponse {
    Creator: Array<{
        id: string
        address: string
        basename: string
        displayName: string
        bio: string
        avatarUrl: string
        registeredAt: string
        updatedAt: string
        totalAmountReceived: string
        totalAmountSent: string
        totalTipsReceived: string
        totalTipsSent: string
        tipCount: number
        tippedByCount: number
        isActive: boolean
        tipsReceived: Tip[]
    }>
}

export function useDashboard(address?: string) {
    const [creator, setCreator] = useState<Creator | null>(null)
    const [tipsReceived, setTipsReceived] = useState<Tip[]>([])
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isCreator, setIsCreator] = useState(false)

    // Normalizar o endereço para lowercase (GraphQL usa lowercase)
    const normalizedAddress = address?.toLowerCase()

    const fetchData = async () => {
        if (!normalizedAddress) {
            setIsCreator(false)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const data = await graphQLClient.request<GraphQLResponse>(
                GET_CREATOR_DASHBOARD,
                { id: normalizedAddress }
            )

            // Agora usamos data.Creator (array)
            const creatorData = data.Creator && data.Creator.length > 0 ? data.Creator[0] : null

            if (creatorData) {
                setCreator({
                    id: creatorData.id,
                    address: creatorData.address,
                    basename: creatorData.basename,
                    displayName: creatorData.displayName,
                    bio: creatorData.bio,
                    avatarUrl: creatorData.avatarUrl,
                    registeredAt: creatorData.registeredAt,
                    updatedAt: creatorData.updatedAt,
                })

                setTipsReceived(creatorData.tipsReceived || [])

                setStats({
                    totalAmountReceived: creatorData.totalAmountReceived,
                    totalAmountSent: creatorData.totalAmountSent,
                    totalTipsReceived: creatorData.totalTipsReceived,
                    totalTipsSent: creatorData.totalTipsSent,
                    tipCount: creatorData.tipCount,
                    tippedByCount: creatorData.tippedByCount,
                })

                setIsCreator(true)
            } else {
                setCreator(null)
                setTipsReceived([])
                setStats(null)
                setIsCreator(false)
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch data')
            setIsCreator(false)
        } finally {
            setIsLoading(false)
        }
    }

    // Buscar dados quando o endereço mudar
    useEffect(() => {
        fetchData()
    }, [normalizedAddress])

    // Polling - atualizar a cada 10 segundos
    useEffect(() => {
        if (!normalizedAddress) return

        const interval = setInterval(() => {
            fetchData()
        }, 10000) // 10 segundos

        return () => clearInterval(interval)
    }, [normalizedAddress])

    return {
        creator,
        tipsReceived,
        stats,
        isLoading,
        error,
        isCreator,
        refetch: fetchData, 
    }
}