// services/graphql/queries/creator.queries.ts
import { gql } from 'graphql-request'

// ============ FRAGMENTS ============
export const CREATOR_FRAGMENT = gql`
  fragment CreatorFragment on Creator {
    id
    address
    basename
    displayName
    bio
    avatarUrl
    registeredAt
    updatedAt
    totalTipsReceived
    totalTipsSent
    totalAmountReceived
    totalAmountSent
    tipCount
    tippedByCount
    isActive
  }
`

export const CREATOR_SEARCH_FRAGMENT = gql`
  fragment CreatorSearchFragment on Creator {
    id
    address
    basename
    displayName
    avatarUrl
    bio
    totalAmountReceived
    tipCount
    isActive
  }
`

export const CREATOR_STATS_FRAGMENT = gql`
  fragment CreatorStatsFragment on Creator {
    totalTipsReceived
    totalTipsSent
    totalAmountReceived
    totalAmountSent
    tipCount
    tippedByCount
  }
`

// ============ BASIC QUERIES ============
export const GET_CREATOR_BY_ID = gql`
  query GetCreatorById($id: String!) {
    Creator(where: {id: {_eq: $id}}) {
      ...CreatorFragment
    }
  }
  ${CREATOR_FRAGMENT}
`

export const GET_CREATOR_BY_ADDRESS = gql`
  query GetCreatorByAddress($address: String!) {
    Creator(where: {address: {_eq: $address}}) {
      ...CreatorFragment
    }
  }
  ${CREATOR_FRAGMENT}
`

export const GET_CREATOR_BY_BASENAME = gql`
  query GetCreatorByBasename($basename: String!) {
    Creator(where: {basename: {_eq: $basename}}) {
      ...CreatorFragment
    }
  }
  ${CREATOR_FRAGMENT}

`


export const GET_CREATOR_BY_IDENTIFIER = gql`
  query GetCreatorByIdentifier($address: String!, $basename: String!, $id: String!) {
    Creator(where: {
      _or: [
        {address: {_eq: $address}},
        {basename: {_eq: $basename}},
        {id: {_eq: $id}}
      ]
    }) {
      ...CreatorFragment
    }
  }
  ${CREATOR_FRAGMENT}
`

// ============ LIST QUERIES ============
export const GET_ALL_CREATORS = gql`
  query GetAllCreators($limit: Int, $offset: Int, $order_by: [Creator_order_by!]) {
    Creator(limit: $limit, offset: $offset, order_by: $order_by) {
      ...CreatorFragment
    }
  }
  ${CREATOR_FRAGMENT}
`

export const GET_ACTIVE_CREATORS = gql`
  query GetActiveCreators($limit: Int, $offset: Int, $order_by: [Creator_order_by!]) {
    Creator(where: {isActive: {_eq: true}}, limit: $limit, offset: $offset, order_by: $order_by) {
      ...CreatorFragment
    }
  }
  ${CREATOR_FRAGMENT}
`

export const GET_TOP_CREATORS = gql`
  query GetTopCreators($limit: Int) {
    Creator(where: {isActive: {_eq: true}}, limit: $limit, order_by: {totalAmountReceived: desc}) {
      ...CreatorSearchFragment
    }
  }
  ${CREATOR_SEARCH_FRAGMENT}
`

// ============ SEARCH QUERIES ============
export const SEARCH_CREATORS_BASIC = gql`
  query SearchCreatorsBasic($searchTerm: String!) {
    Creator(
      where: {
        _or: [
          {displayName: {_ilike: $searchTerm}},
          {basename: {_ilike: $searchTerm}},
          {bio: {_ilike: $searchTerm}}
        ],
        isActive: {_eq: true}
      },
      order_by: {totalAmountReceived: desc}
    ) {
      ...CreatorSearchFragment
    }
  }
  ${CREATOR_SEARCH_FRAGMENT}
`

export const SEARCH_CREATORS_ADVANCED = gql`
  query SearchCreatorsAdvanced(
    $searchTerm: String!,
    $limit: Int,
    $offset: Int,
    $order_by: [Creator_order_by!]
  ) {
    Creator(
      where: {
        _or: [
          {displayName: {_ilike: $searchTerm}},
          {basename: {_ilike: $searchTerm}},
          {bio: {_ilike: $searchTerm}}
        ],
        isActive: {_eq: true}
      },
      limit: $limit,
      offset: $offset,
      order_by: $order_by
    ) {
      ...CreatorSearchFragment
    }
  }
  ${CREATOR_SEARCH_FRAGMENT}
`

// ============ DETAILED QUERIES ============
export const GET_CREATOR_FULL_PROFILE = gql`
  query GetCreatorFullProfile($id: String!) {
    Creator(where: {id: {_eq: $id}}) {
      ...CreatorFragment
      tipsReceived(limit: 10, order_by: {timestamp: desc}) {
        id
        amount
        message
        timestamp
        blockNumber
        transactionHash
        from {
          id
          address
          displayName
          basename
          avatarUrl
        }
        token {
          id
          address
        }
      }
      tipsSent(limit: 10, order_by: {timestamp: desc}) {
        id
        amount
        message
        timestamp
        blockNumber
        transactionHash
        to {
          id
          address
          displayName
          basename
          avatarUrl
        }
        token {
          id
          address
        }
      }
      updateHistory(limit: 5, order_by: {timestamp: desc}) {
        id
        displayName
        bio
        avatarUrl
        timestamp
      }
    }
  }
  ${CREATOR_FRAGMENT}
`

export const GET_CREATOR_WITH_TIPS = gql`
  query GetCreatorWithTips($id: String!, $tipsLimit: Int!) {
    Creator(where: {id: {_eq: $id}}) {
      ...CreatorFragment
      tipsReceived(limit: $tipsLimit, order_by: {timestamp: desc}) {
        id
        amount
        message
        timestamp
        from {
          id
          displayName
          avatarUrl
        }
        token {
          id
          address
        }
      }
    }
  }
  ${CREATOR_FRAGMENT}
`

export const GET_CREATOR_WITH_RELATIONSHIPS = gql`
  query GetCreatorWithRelationships($id: String!) {
    Creator(where: {id: {_eq: $id}}) {
      ...CreatorFragment
      relationshipsAsFrom {
        id
        to {
          id
          displayName
          avatarUrl
        }
        totalTips
        totalAmount
        lastTipAt
      }
      relationshipsAsTo {
        id
        from {
          id
          displayName
          avatarUrl
        }
        totalTips
        totalAmount
        lastTipAt
      }
    }
  }
  ${CREATOR_FRAGMENT}
`

// ============ STATS QUERIES ============
export const GET_CREATOR_STATS = gql`
  query GetCreatorStats($id: String!) {
    Creator(where: {id: {_eq: $id}}) {
      ...CreatorStatsFragment
    }
  }
  ${CREATOR_STATS_FRAGMENT}
`

export const GET_CREATOR_COUNT = gql`
  query GetCreatorCount($where: Creator_bool_exp) {
    Creator(where: $where) {
      id
    }
  }
`

export const GET_PLATFORM_CREATOR_STATS = gql`
  query GetPlatformCreatorStats {
    active: Creator(where: {isActive: {_eq: true}}) {
      id
    }
    total: Creator {
      id
    }
    topTipped: Creator(
      where: {isActive: {_eq: true}},
      limit: 1,
      order_by: {totalAmountReceived: desc}
    ) {
      id
      displayName
      totalAmountReceived
    }
  }
`

// ============ BATCH QUERIES ============
export const GET_CREATORS_BY_ADDRESSES = gql`
  query GetCreatorsByAddresses($addresses: [String!]) {
    Creator(where: {address: {_in: $addresses}}) {
      ...CreatorSearchFragment
    }
  }
  ${CREATOR_SEARCH_FRAGMENT}
`

export const GET_CREATORS_BY_IDS = gql`
  query GetCreatorsByIds($ids: [String!]) {
    Creator(where: {id: {_in: $ids}}) {
      ...CreatorSearchFragment
    }
  }
  ${CREATOR_SEARCH_FRAGMENT}
`

// ============ UTILITY QUERIES ============
export const CHECK_CREATOR_EXISTS = gql`
  query CheckCreatorExists($address: String!) {
    Creator(where: {address: {_eq: $address}}) {
      id
    }
  }
`

export const GET_CREATOR_REGISTRATION = gql`
  query GetCreatorRegistration($id: String!) {
    Creator(where: {id: {_eq: $id}}) {
      id
      address
      basename
      displayName
      registeredAt
      registrationEvents(order_by: {timestamp: desc}, limit: 1) {
        id
        timestamp
        blockNumber
        transactionHash
      }
    }
  }
`