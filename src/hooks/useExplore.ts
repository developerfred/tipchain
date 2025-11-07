import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { graphQLClient } from "../services/graphql/client";
import {
  useSupabaseUsers,
  type CombinedCreator,
  type SupabaseUser,
} from "./useSupabaseUsers";

const GET_ALL_CREATORS = gql`
  query GetAllCreators(
    $limit: Int = 50
    $offset: Int = 0
    $orderBy: [Creator_order_by!] = [{ totalAmountReceived: desc }]
    $where: Creator_bool_exp = {}
  ) {
    Creator(limit: $limit, offset: $offset, order_by: $orderBy, where: $where) {
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
`;

const SEARCH_CREATORS = gql`
  query SearchCreators(
    $searchTerm: String!
    $limit: Int = 50
    $offset: Int = 0
    $orderBy: [Creator_order_by!] = [{ totalAmountReceived: desc }]
  ) {
    Creator(
      limit: $limit
      offset: $offset
      order_by: $orderBy
      where: {
        _and: [
          { isActive: { _eq: true } }
          {
            _or: [
              { displayName: { _ilike: $searchTerm } }
              { basename: { _ilike: $searchTerm } }
              { bio: { _ilike: $searchTerm } }
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
`;

const COUNT_ALL_CREATORS = gql`
  query CountAllCreators($where: Creator_bool_exp = {}) {
    Creator(where: $where) {
      id
    }
  }
`;

export interface Creator {
  id: string;
  address: string;
  basename: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  registeredAt: string;
  updatedAt: string;
  totalAmountReceived: string;
  totalAmountSent: string;
  totalTipsReceived: string;
  totalTipsSent: string;
  tipCount: number;
  tippedByCount: number;
  isActive: boolean;
}

export interface PlatformStats {
  totalCreators: number;
  totalTips: number;
  totalVolume: bigint;
}

export type SortBy =
  | "totalAmountReceived"
  | "tipCount"
  | "registeredAt"
  | "displayName";
export type SortOrder = "asc" | "desc";

interface GraphQLResponse {
  Creator: Creator[];
}

interface CountResponse {
  Creator: { id: string }[];
}

interface UseExploreOptions {
  limit?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  onlyActive?: boolean;
}

export function useExplore(options: UseExploreOptions = {}) {
  const {
    limit = 50,
    sortBy = "totalAmountReceived",
    sortOrder = "desc",
    onlyActive = true,
  } = options;

  const [creators, setCreators] = useState<Creator[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);

  const { users: supabaseUsers, isLoading: supabaseLoading } =
    useSupabaseUsers();

  const convertSupabaseUserToCreator = (
    user: SupabaseUser,
  ): CombinedCreator => ({
    id: user.primary_wallet_address || user.id,
    address: user.primary_wallet_address!,
    basename: user.tipchain_basename,
    displayName: user.tipchain_display_name,
    bio: user.tipchain_bio,
    avatarUrl: user.tipchain_avatar_url || user.image_url || "",
    registeredAt: user.tipchain_created_at,
    updatedAt: user.updated_at,
    totalAmountReceived: (user.tipchain_total_tips_received * 1e18).toString(),
    totalAmountSent: "0",
    totalTipsReceived: user.tipchain_total_tips_received.toString(),
    totalTipsSent: "0",
    tipCount: user.tipchain_tip_count,
    tippedByCount: user.tipchain_tip_count,
    isActive: user.tipchain_is_active,
    source: "supabase",
    tipchain_registered: user.tipchain_registered,
    primary_wallet_address: user.primary_wallet_address,
    builder_score_points: user.builder_score_points,
    base_builder_score_points: user.base_builder_score_points,
    twitter_handle: user.twitter_handle,
    github_handle: user.github_handle,
    farcaster_handle: user.farcaster_handle,
    human_checkmark: user.human_checkmark,
    tags: user.tags,
  });

  const loadCreators = async (append = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const orderBy = { [sortBy]: sortOrder };
      const where = onlyActive ? { isActive: { _eq: true } } : {};
      const currentOffset = append ? offset : 0;

      const graphqlData = await graphQLClient.request<GraphQLResponse>(
        GET_ALL_CREATORS,
        {
          limit,
          offset: currentOffset,
          orderBy: [orderBy],
          where,
        },
      );

      const graphqlCreators: CombinedCreator[] = (
        graphqlData.Creator || []
      ).map((creator) => ({
        ...creator,
        source: "graphql" as const,
        tipchain_registered: true,
        primary_wallet_address: creator.address,
        id: creator.address,
      }));

      console.log("GraphQL creators:", graphqlCreators.length);

      // Converter TODOS os usuários do Supabase que têm basename
      const supabaseCreators: CombinedCreator[] = supabaseUsers
        .filter(
          (user) =>
            user.tipchain_basename &&
            user.tipchain_basename.trim() !== "" &&
            user.tipchain_display_name &&
            user.tipchain_display_name.trim() !== "",
        )
        .map(convertSupabaseUserToCreator);

      console.log("Supabase users:", supabaseUsers.length);
      console.log("Supabase creators:", supabaseCreators.length);

      const allCreators = [...graphqlCreators, ...supabaseCreators];

      const walletMap = new Map();
      allCreators.forEach((creator) => {
        const wallet = creator.primary_wallet_address?.toLowerCase();
        if (wallet) {
          if (!walletMap.has(wallet) || creator.source === "graphql") {
            walletMap.set(wallet, creator);
          }
        }
      });

      const uniqueCreators = Array.from(walletMap.values());
      console.log(
        "Unique creators after deduplication:",
        uniqueCreators.length,
      );

      const sortedCreators = uniqueCreators.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
          case "totalAmountReceived":
            aValue = BigInt(a.totalAmountReceived || "0");
            bValue = BigInt(b.totalAmountReceived || "0");
            break;
          case "tipCount":
            aValue = a.tipCount || 0;
            bValue = b.tipCount || 0;
            break;
          case "registeredAt":
            aValue = new Date(a.registeredAt).getTime();
            bValue = new Date(b.registeredAt).getTime();
            break;
          case "displayName":
            aValue = a.displayName?.toLowerCase() || "";
            bValue = b.displayName?.toLowerCase() || "";
            break;
          default:
            aValue = BigInt(a.totalAmountReceived || "0");
            bValue = BigInt(b.totalAmountReceived || "0");
        }

        if (sortOrder === "desc") {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });

      const newCreators = sortedCreators.slice(0, limit);

      if (append) {
        setCreators((prev) => [...prev, ...newCreators]);
      } else {
        setCreators(newCreators);
      }

      if (!append) {
        const totalTips = uniqueCreators.reduce(
          (sum, c) => sum + (c.tipCount || 0),
          0,
        );
        const totalVolume = uniqueCreators.reduce((sum, c) => {
          return sum + BigInt(c.totalAmountReceived || "0");
        }, BigInt(0));

        setPlatformStats({
          totalCreators: uniqueCreators.length,
          totalTips,
          totalVolume,
        });
        setTotalCount(uniqueCreators.length);
      }

      if (append) {
        setOffset(currentOffset + limit);
      } else {
        setOffset(limit);
      }
    } catch (err) {
      console.error("Error loading creators:", err);
      setError(err instanceof Error ? err.message : "Failed to load creators");
    } finally {
      setIsLoading(false);
    }
  };

  const searchCreators = async (term: string, append = false) => {
    if (!term.trim()) {
      setSearchQuery("");
      loadCreators();
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchQuery(term);

    try {
      const graphqlData = await graphQLClient.request<GraphQLResponse>(
        SEARCH_CREATORS,
        {
          searchTerm: `%${term}%`,
          limit,
          offset: append ? offset : 0,
          orderBy: [{ [sortBy]: sortOrder }],
        },
      );

      const graphqlCreators: CombinedCreator[] = (
        graphqlData.Creator || []
      ).map((creator) => ({
        ...creator,
        source: "graphql",
        tipchain_registered: true,
      }));

      const searchTerm = term.toLowerCase();
      const supabaseMatches = supabaseUsers.filter(
        (user) =>
          user.tipchain_basename &&
          user.tipchain_display_name &&
          (user.tipchain_display_name.toLowerCase().includes(searchTerm) ||
            user.tipchain_basename.toLowerCase().includes(searchTerm) ||
            user.tipchain_bio?.toLowerCase().includes(searchTerm) ||
            user.twitter_handle?.toLowerCase().includes(searchTerm) ||
            user.github_handle?.toLowerCase().includes(searchTerm) ||
            user.farcaster_handle?.toLowerCase().includes(searchTerm)),
      );

      const supabaseCreators: CombinedCreator[] = supabaseMatches.map(
        convertSupabaseUserToCreator,
      );

      const combinedResults = [...graphqlCreators, ...supabaseCreators];

      const walletMap = new Map();
      combinedResults.forEach((creator) => {
        const wallet = creator.primary_wallet_address?.toLowerCase();
        if (wallet) {
          if (!walletMap.has(wallet) || creator.source === "graphql") {
            walletMap.set(wallet, creator);
          }
        }
      });

      const uniqueResults = Array.from(walletMap.values());

      if (append) {
        setCreators((prev) => [...prev, ...uniqueResults]);
      } else {
        setCreators(uniqueResults);
        setTotalCount(uniqueResults.length);
      }

      if (append) {
        setOffset(offset + limit);
      } else {
        setOffset(limit);
      }
    } catch (err) {
      console.error("Error searching creators:", err);
      setError(
        err instanceof Error ? err.message : "Failed to search creators",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load more (pagination)
  const loadMore = async () => {
    if (searchQuery) {
      await searchCreators(searchQuery, true);
    } else {
      await loadCreators(true);
    }
  };

  const reset = () => {
    setCreators([]);
    setPlatformStats(null);
    setSearchQuery("");
    setTotalCount(0);
    setOffset(0);
    setError(null);
  };

  useEffect(() => {
    if (!supabaseLoading && supabaseUsers.length > 0) {
      console.log("Supabase data loaded, loading creators...");
      loadCreators();
    }
  }, [sortBy, sortOrder, onlyActive, supabaseLoading]);

  const hasMore = creators.length < totalCount;

  return {
    creators,
    platformStats,
    isLoading: isLoading || supabaseLoading,
    error,
    searchQuery,
    totalCount,
    hasMore,
    searchCreators,
    loadCreators,
    loadMore,
    reset,
    setSearchQuery,
  };
}
