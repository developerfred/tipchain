import { createClient, cacheExchange, fetchExchange } from "urql";

const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_GRAPHQL_ENDPOINT ||
  "https://indexer.dev.hyperindex.xyz/024c9b7/v1/graphql";

/**
 * GraphQL client configuration
 * Uses urql for efficient caching and request batching
 */
export const graphqlClient = createClient({
  url: GRAPHQL_ENDPOINT,
  exchanges: [cacheExchange, fetchExchange],
  requestPolicy: "cache-and-network",
  fetchOptions: {
    headers: {
      "Content-Type": "application/json",
    },
  },
});

/**
 * GraphQL queries
 */
export const GET_CREATOR_BY_ADDRESS = `
  query GetCreatorByAddress($address: String!) {
    creators(where: { address: $address }) {
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
  }
`;

export const GET_CREATOR_BY_BASENAME = `
  query GetCreatorByBasename($basename: String!) {
    creators(where: { basename: $basename }) {
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
  }
`;

export const GET_TIPS_RECEIVED = `
  query GetTipsReceived($creatorAddress: String!, $first: Int = 10, $skip: Int = 0) {
    tips(
      where: { to_: { address: $creatorAddress } }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      from {
        address
        basename
        displayName
        avatarUrl
      }
      to {
        address
        basename
        displayName
      }
      token {
        id
        address
      }
      amount
      message
      timestamp
      blockNumber
      transactionHash
    }
  }
`;

export const GET_TIPS_SENT = `
  query GetTipsSent($creatorAddress: String!, $first: Int = 10, $skip: Int = 0) {
    tips(
      where: { from_: { address: $creatorAddress } }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      from {
        address
        basename
        displayName
      }
      to {
        address
        basename
        displayName
        avatarUrl
      }
      token {
        id
        address
      }
      amount
      message
      timestamp
      blockNumber
      transactionHash
    }
  }
`;

export const GET_TOP_CREATORS = `
  query GetTopCreators($first: Int = 20) {
    creators(
      where: { isActive: true }
      first: $first
      orderBy: totalAmountReceived
      orderDirection: desc
    ) {
      id
      address
      basename
      displayName
      bio
      avatarUrl
      totalAmountReceived
      tipCount
      tippedByCount
      isActive
    }
  }
`;

export const GET_RECENT_TIPS = `
  query GetRecentTips($first: Int = 20) {
    tips(
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      from {
        address
        basename
        displayName
        avatarUrl
      }
      to {
        address
        basename
        displayName
        avatarUrl
      }
      token {
        id
        address
      }
      amount
      message
      timestamp
      transactionHash
    }
  }
`;

export const GET_PLATFORM_STATS = `
  query GetPlatformStats {
    platformConfigs(first: 1) {
      id
      currentFee
      feeCollector
      isPaused
      owner
      lastUpdated
    }
    dailyStats(
      first: 30
      orderBy: date
      orderDirection: desc
    ) {
      id
      date
      totalTips
      totalVolume
      uniqueSenders
      uniqueReceivers
      activeCreators
    }
  }
`;

export const SEARCH_CREATORS = `
  query SearchCreators($searchTerm: String!, $first: Int = 10) {
    creators(
      where: {
        or: [
          { basename_contains_nocase: $searchTerm }
          { displayName_contains_nocase: $searchTerm }
        ]
        isActive: true
      }
      first: $first
      orderBy: totalAmountReceived
      orderDirection: desc
    ) {
      id
      address
      basename
      displayName
      bio
      avatarUrl
      totalAmountReceived
      tipCount
      isActive
    }
  }
`;
