import { useEffect, useState } from 'react'
import { gql } from 'graphql-request'
import { graphQLClient } from '../services/graphql/client'

// Query para buscar todos os creators
const GET_ALL_CREATORS = gql`
  query GetAllCreators(
    $limit: Int = 50
    $offset: Int = 0
    $orderBy: [Creator_order_by!] = [{totalAmountReceived: desc}]
    $where: Creator_bool_exp = {}
  ) {
    Creator(
      limit: $limit
      offset: $offset
      order_by: $orderBy
      where: $where
    ) {
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
    }
  }
`

// Query para buscar creators por termo de busca
const SEARCH_CREATORS = gql`
  query SearchCreators(
    $searchTerm: String!
    $limit: Int = 50
    $offset: Int = 0
    $orderBy: [Creator_order_by!] = [{totalAmountReceived: desc}]
  ) {
    Creator(
      limit: $limit
      offset: $offset
      order_by: $orderBy
      where: {
        _and: [
          {isActive: {_eq: true}}
          {
            _or: [
              {displayName: {_ilike: $searchTerm}}
              {basename: {_ilike: $searchTerm}}
              {bio: {_ilike: $searchTerm}}
            ]
          }
        ]
      }
    ) {
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
    }
  }
`

// Query separada para contar todos os creators (sem agregação)
const COUNT_ALL_CREATORS = gql`
  query CountAllCreators($where: Creator_bool_exp = {}) {
    Creator(where: $where) {
      id
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
  totalAmountReceived: string
  totalAmountSent: string
  totalTipsReceived: string
  totalTipsSent: string
  tipCount: number
  tippedByCount: number
  isActive: boolean
}

export interface PlatformStats {
  totalCreators: number
  totalTips: number
  totalVolume: bigint
}

export type SortBy = 'totalAmountReceived' | 'tipCount' | 'registeredAt' | 'displayName'
export type SortOrder = 'asc' | 'desc'

interface GraphQLResponse {
  Creator: Creator[]
}

interface CountResponse {
  Creator: { id: string }[]
}

interface UseExploreOptions {
  limit?: number
  sortBy?: SortBy
  sortOrder?: SortOrder
  onlyActive?: boolean
}

export function useExplore(options: UseExploreOptions = {}) {
  const {
    limit = 50,
    sortBy = 'totalAmountReceived',
    sortOrder = 'desc',
    onlyActive = true
  } = options

  const [creators, setCreators] = useState<Creator[]>([])
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [offset, setOffset] = useState(0)

  // Buscar todos os creators
  const loadCreators = async (append = false) => {
    setIsLoading(true)
    setError(null)

    try {
      const orderBy = { [sortBy]: sortOrder }
      const where = onlyActive ? { isActive: { _eq: true } } : {}
      const currentOffset = append ? offset : 0

      const data = await graphQLClient.request<GraphQLResponse>(
        GET_ALL_CREATORS,
        {
          limit,
          offset: currentOffset,
          orderBy: [orderBy],
          where
        }
      )

      const newCreators = data.Creator || []

      if (append) {
        setCreators(prev => [...prev, ...newCreators])
      } else {
        setCreators(newCreators)
      }

      // Buscar contagem total separadamente se for a primeira carga
      if (!append) {
        const countData = await graphQLClient.request<CountResponse>(
          COUNT_ALL_CREATORS,
          { where }
        )
        const totalCreators = countData.Creator?.length || 0
        setTotalCount(totalCreators)

        // Calcular stats da plataforma a partir dos creators carregados
        const totalTips = newCreators.reduce((sum, c) => sum + (c.tipCount || 0), 0)
        const totalVolume = newCreators.reduce((sum, c) => {
          return sum + BigInt(c.totalAmountReceived || '0')
        }, BigInt(0))

        setPlatformStats({
          totalCreators,
          totalTips,
          totalVolume
        })
      }

      if (append) {
        setOffset(currentOffset + limit)
      } else {
        setOffset(limit)
      }

    } catch (err) {
      console.error('Error loading creators:', err)
      setError(err instanceof Error ? err.message : 'Failed to load creators')
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar creators por termo
  const searchCreators = async (term: string, append = false) => {
    if (!term.trim()) {
      setSearchQuery('')
      loadCreators()
      return
    }

    setIsLoading(true)
    setError(null)
    setSearchQuery(term)

    try {
      const orderBy = { [sortBy]: sortOrder }
      const searchTerm = `%${term}%`
      const currentOffset = append ? offset : 0

      const data = await graphQLClient.request<GraphQLResponse>(
        SEARCH_CREATORS,
        {
          searchTerm,
          limit,
          offset: currentOffset,
          orderBy: [orderBy]
        }
      )

      const newCreators = data.Creator || []

      if (append) {
        setCreators(prev => [...prev, ...newCreators])
      } else {
        setCreators(newCreators)
      }

      // Buscar contagem total para a busca
      if (!append) {
        const where = {
          _and: [
            { isActive: { _eq: true } },
            {
              _or: [
                { displayName: { _ilike: searchTerm } },
                { basename: { _ilike: searchTerm } },
                { bio: { _ilike: searchTerm } }
              ]
            }
          ]
        }
        const countData = await graphQLClient.request<CountResponse>(
          COUNT_ALL_CREATORS,
          { where }
        )
        setTotalCount(countData.Creator?.length || 0)
      }

      if (append) {
        setOffset(currentOffset + limit)
      } else {
        setOffset(limit)
      }

    } catch (err) {
      console.error('Error searching creators:', err)
      setError(err instanceof Error ? err.message : 'Failed to search creators')
    } finally {
      setIsLoading(false)
    }
  }

  // Load more (pagination)
  const loadMore = async () => {
    if (searchQuery) {
      await searchCreators(searchQuery, true)
    } else {
      await loadCreators(true)
    }
  }

  // Reset
  const reset = () => {
    setCreators([])
    setPlatformStats(null)
    setSearchQuery('')
    setTotalCount(0)
    setOffset(0)
    setError(null)
  }

  // Carregar creators na inicialização
  useEffect(() => {
    loadCreators()
  }, [sortBy, sortOrder, onlyActive])

  const hasMore = creators.length < totalCount

  return {
    creators,
    platformStats,
    isLoading,
    error,
    searchQuery,
    totalCount,
    hasMore,
    searchCreators,
    loadCreators,
    loadMore,
    reset,
    setSearchQuery
  }
}