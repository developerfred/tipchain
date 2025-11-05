// graphql/queries/explore.queries.ts
import { gql } from 'graphql-request'

export const CREATOR_EXPLORE_FRAGMENT = gql`
  fragment CreatorExploreFragment on Creator {
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
    tipCount
    tippedByCount
    isActive
  }
`

export const GET_ALL_CREATORS = gql`
  ${CREATOR_EXPLORE_FRAGMENT}
  query GetAllCreators(
    $limit: Int
    $offset: Int
    $orderBy: [Creator_order_by!]
    $where: Creator_bool_exp
  ) {
    Creator(
      limit: $limit
      offset: $offset
      order_by: $orderBy
      where: $where
    ) {
      ...CreatorExploreFragment
    }
    
    Creator_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`

export const SEARCH_CREATORS_ADVANCED = gql`
  ${CREATOR_EXPLORE_FRAGMENT}
  query SearchCreatorsAdvanced(
    $searchTerm: String!
    $limit: Int
    $offset: Int
    $orderBy: [Creator_order_by!]
  ) {
    Creator(
      where: {
        _or: [
          { address: { _ilike: $searchTerm } }
          { basename: { _ilike: $searchTerm } }
          { displayName: { _ilike: $searchTerm } }
          { bio: { _ilike: $searchTerm } }
        ]
        isActive: { _eq: true }
      }
      limit: $limit
      offset: $offset
      order_by: $orderBy
    ) {
      ...CreatorExploreFragment
    }
    
    Creator_aggregate(
      where: {
        _or: [
          { address: { _ilike: $searchTerm } }
          { basename: { _ilike: $searchTerm } }
          { displayName: { _ilike: $searchTerm } }
          { bio: { _ilike: $searchTerm } }
        ]
        isActive: { _eq: true }
      }
    ) {
      aggregate {
        count
      }
    }
  }
`

export const GET_PLATFORM_STATS = gql`
  query GetPlatformStats {
    Creator_aggregate(where: {isActive: {_eq: true}}) {
      aggregate {
        count
      }
    }
    
    Tip_aggregate {
      aggregate {
        count
        sum {
          amount
        }
      }
    }
    
    DailyStats(
      limit: 1
      order_by: {date: desc}
    ) {
      totalTips
      totalVolume
      uniqueSenders
      uniqueReceivers
      activeCreators
    }
  }
`

export const GET_TOP_CREATORS = gql`
  ${CREATOR_EXPLORE_FRAGMENT}
  query GetTopCreators($limit: Int = 50) {
    Creator(
      where: {isActive: {_eq: true}}
      limit: $limit
      order_by: {totalAmountReceived: desc}
    ) {
      ...CreatorExploreFragment
    }
  }
`