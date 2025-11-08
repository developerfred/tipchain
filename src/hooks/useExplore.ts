import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { gql } from "graphql-request";
import { graphQLClient } from "../services/graphql/client";
import { useUsersStore } from "../stores/useUsersStore";
import type { CombinedCreator, SupabaseUser } from "./useSupabaseUsers";

export type SortBy =
  | "totalAmountReceived"
  | "tipCount"
  | "registeredAt"
  | "displayName"
  | "builderScore";
export type SortOrder = "asc" | "desc";

const GET_CLAIMED_CREATORS = gql`
  query GetClaimedCreators(
    $limit: Int = 100
    $offset: Int = 0
    $orderBy: [Creator_order_by!] = [{ totalAmountReceived: desc }]
  ) {
    Creator(limit: $limit, offset: $offset, order_by: $orderBy) {
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

interface UseExploreOptions {
  initialLimit?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  enableVirtualScroll?: boolean;
}

export function useExplore(options: UseExploreOptions = {}) {
  const {
    initialLimit = 50,
    sortBy = "totalAmountReceived",
    sortOrder = "desc",
    enableVirtualScroll = true,
  } = options;

  // Stores
  const {
    users: supabaseUsers,
    filteredUsers,
    isLoading: supabaseLoading,
    error: supabaseError,
    searchQuery,
    loadUsers,
    searchUsers,
    applyFilters,
    clearFilters,
    currentPage,
    hasMore,
  } = useUsersStore();

  // Estados para GraphQL
  const [graphqlUsers, setGraphqlUsers] = useState<any[]>([]);
  const [isLoadingGraphQL, setIsLoadingGraphQL] = useState(false);
  const [errorGraphQL, setErrorGraphQL] = useState<string | null>(null);
  const [graphqlOffset, setGraphqlOffset] = useState(0);
  const [hasMoreGraphQL, setHasMoreGraphQL] = useState(true);

  // Estados combinados
  const [combinedCreators, setCombinedCreators] = useState<CombinedCreator[]>(
    [],
  );
  const [visibleUsers, setVisibleUsers] = useState<CombinedCreator[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [localSortBy, setLocalSortBy] = useState<SortBy>(sortBy);
  const [localSortOrder, setLocalSortOrder] = useState<SortOrder>(sortOrder);

  const containerRef = useRef<HTMLDivElement>(null);

  // Carregar usuários do GraphQL (contrato)
  const loadGraphQLUsers = useCallback(
    async (append = false) => {
      if (isLoadingGraphQL && !append) return;

      setIsLoadingGraphQL(true);
      setErrorGraphQL(null);

      try {
        const currentOffset = append ? graphqlOffset : 0;

        const data = await graphQLClient.request<{ Creator: any[] }>(
          GET_CLAIMED_CREATORS,
          {
            limit: initialLimit,
            offset: currentOffset,
            orderBy: [{ totalAmountReceived: "desc" }],
          },
        );

        const newUsers = data.Creator || [];

        if (append) {
          setGraphqlUsers((prev) => [...prev, ...newUsers]);
        } else {
          setGraphqlUsers(newUsers);
        }

        setGraphqlOffset(currentOffset + initialLimit);
        setHasMoreGraphQL(newUsers.length === initialLimit);
      } catch (err) {
        console.error("Error loading GraphQL users:", err);
        setErrorGraphQL(
          err instanceof Error
            ? err.message
            : "Failed to load claimed creators",
        );
      } finally {
        setIsLoadingGraphQL(false);
      }
    },
    [initialLimit, graphqlOffset, isLoadingGraphQL],
  );

  // Combinar e sincronizar dados do Supabase e GraphQL
  const combineAndSyncUsers = useCallback(
    (supabaseUsers: SupabaseUser[], graphqlUsers: any[]): CombinedCreator[] => {
      const walletMap = new Map<string, CombinedCreator>();

      // Primeiro, adicionar todos os usuários do Supabase
      supabaseUsers.forEach((user) => {
        const wallet = user.primary_wallet_address?.toLowerCase();
        if (!wallet) return;

        const combinedUser: CombinedCreator = {
          id: user.primary_wallet_address || user.id,
          address: user.primary_wallet_address!,
          basename: user.tipchain_basename,
          displayName: user.tipchain_display_name,
          bio: user.tipchain_bio,
          avatarUrl: user.tipchain_avatar_url || user.image_url || "",
          registeredAt: user.tipchain_created_at,
          updatedAt: user.updated_at,
          totalAmountReceived: (
            user.tipchain_total_tips_received * 1e18
          ).toString(),
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
        };

        walletMap.set(wallet, combinedUser);
      });

      // Agora, sobrescrever/atualizar com dados do GraphQL para usuários que fizeram claim
      graphqlUsers.forEach((graphqlUser) => {
        const wallet = graphqlUser.address?.toLowerCase();
        if (!wallet) return;

        const existingUser = walletMap.get(wallet);

        if (existingUser) {
          // Usuário existe no Supabase - mesclar dados
          walletMap.set(wallet, {
            ...existingUser,
            // Dados do GraphQL têm prioridade para informações on-chain
            id: graphqlUser.address,
            address: graphqlUser.address,
            basename: graphqlUser.basename || existingUser.basename,
            displayName: graphqlUser.displayName || existingUser.displayName,
            bio: graphqlUser.bio || existingUser.bio,
            avatarUrl: graphqlUser.avatarUrl || existingUser.avatarUrl,
            registeredAt: graphqlUser.registeredAt || existingUser.registeredAt,
            totalAmountReceived:
              graphqlUser.totalAmountReceived ||
              existingUser.totalAmountReceived,
            totalTipsReceived:
              graphqlUser.totalTipsReceived || existingUser.totalTipsReceived,
            tipCount: graphqlUser.tipCount || existingUser.tipCount,
            tippedByCount:
              graphqlUser.tippedByCount || existingUser.tippedByCount,
            isActive:
              graphqlUser.isActive !== undefined
                ? graphqlUser.isActive
                : existingUser.isActive,
            // Manter dados sociais e de builder score do Supabase
            source: "both" as const,
            tipchain_registered: true, // Se está no GraphQL, fez claim
          });
        } else {
          // Usuário só existe no GraphQL - criar novo registro
          walletMap.set(wallet, {
            id: graphqlUser.address,
            address: graphqlUser.address,
            basename: graphqlUser.basename,
            displayName: graphqlUser.displayName,
            bio: graphqlUser.bio,
            avatarUrl: graphqlUser.avatarUrl,
            registeredAt: graphqlUser.registeredAt,
            updatedAt: graphqlUser.updatedAt,
            totalAmountReceived: graphqlUser.totalAmountReceived,
            totalAmountSent: graphqlUser.totalAmountSent,
            totalTipsReceived: graphqlUser.totalTipsReceived,
            totalTipsSent: graphqlUser.totalTipsSent,
            tipCount: graphqlUser.tipCount,
            tippedByCount: graphqlUser.tippedByCount,
            isActive: graphqlUser.isActive,
            source: "graphql",
            tipchain_registered: true,
            primary_wallet_address: graphqlUser.address,
            builder_score_points: 0,
            base_builder_score_points: 0,
            twitter_handle: null,
            github_handle: null,
            farcaster_handle: null,
            human_checkmark: false,
            tags: [],
          });
        }
      });

      return Array.from(walletMap.values());
    },
    [],
  );

  // Ordenar usuários
  const sortUsers = useCallback(
    (users: CombinedCreator[], sortBy: SortBy, order: SortOrder) => {
      return [...users].sort((a, b) => {
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
          case "builderScore":
            aValue = a.builder_score_points || 0;
            bValue = b.builder_score_points || 0;
            break;
          case "registeredAt":
            aValue = new Date(a.registeredAt || 0).getTime();
            bValue = new Date(b.registeredAt || 0).getTime();
            break;
          case "displayName":
            aValue = a.displayName?.toLowerCase() || "";
            bValue = b.displayName?.toLowerCase() || "";
            break;
          default:
            aValue = BigInt(a.totalAmountReceived || "0");
            bValue = BigInt(b.totalAmountReceived || "0");
        }

        if (order === "desc") {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    },
    [],
  );

  // Combinar dados quando ambos carregarem
  useEffect(() => {
    if (
      (supabaseUsers.length > 0 || graphqlUsers.length > 0) &&
      !supabaseLoading &&
      !isLoadingGraphQL
    ) {
      const combined = combineAndSyncUsers(supabaseUsers, graphqlUsers);
      setCombinedCreators(combined);

      console.log("Synchronized users:", {
        supabase: supabaseUsers.length,
        graphql: graphqlUsers.length,
        combined: combined.length,
        claimed: combined.filter((u) => u.tipchain_registered).length,
        unclaimed: combined.filter((u) => !u.tipchain_registered).length,
      });
    }
  }, [
    supabaseUsers,
    graphqlUsers,
    supabaseLoading,
    isLoadingGraphQL,
    combineAndSyncUsers,
  ]);

  // Aplicar filtros e ordenação aos usuários combinados
  useEffect(() => {
    if (combinedCreators.length === 0) return;

    let filtered = [...combinedCreators];

    // Aplicar ordenação
    filtered = sortUsers(filtered, localSortBy, localSortOrder);

    // Para virtual scrolling, limitar a exibição
    if (enableVirtualScroll) {
      setVisibleUsers(filtered.slice(0, 100));
    } else {
      setVisibleUsers(filtered);
    }
  }, [
    combinedCreators,
    localSortBy,
    localSortOrder,
    sortUsers,
    enableVirtualScroll,
  ]);

  // Carregar mais dados
  const handleLoadMore = useCallback(async () => {
    if (
      (isLoadingMore || supabaseLoading || isLoadingGraphQL) &&
      !hasMore &&
      !hasMoreGraphQL
    )
      return;

    setIsLoadingMore(true);
    try {
      // Tentar carregar de ambas as fontes
      await Promise.all([
        hasMore && loadUsers(currentPage + 1),
        hasMoreGraphQL && loadGraphQLUsers(true),
      ]);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    supabaseLoading,
    isLoadingGraphQL,
    hasMore,
    hasMoreGraphQL,
    loadUsers,
    currentPage,
    loadGraphQLUsers,
  ]);

  // Carregar dados iniciais
  useEffect(() => {
    if (supabaseUsers.length === 0) {
      loadUsers(0, true);
    }
    if (graphqlUsers.length === 0) {
      loadGraphQLUsers(false);
    }
  }, [loadUsers, loadGraphQLUsers, supabaseUsers.length, graphqlUsers.length]);

  // Setup intersection observer
  useEffect(() => {
    if (!enableVirtualScroll) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          (hasMore || hasMoreGraphQL) &&
          !isLoadingMore
        ) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [
    enableVirtualScroll,
    hasMore,
    hasMoreGraphQL,
    isLoadingMore,
    handleLoadMore,
  ]);

  // Estatísticas
  const stats = useMemo(() => {
    const totalTips = combinedCreators.reduce(
      (sum, c) => sum + (c.tipCount || 0),
      0,
    );
    const totalVolume = combinedCreators.reduce((sum, c) => {
      const amount = c.totalAmountReceived
        ? BigInt(c.totalAmountReceived)
        : BigInt(0);
      return sum + amount;
    }, BigInt(0));

    const claimedCreators = combinedCreators.filter(
      (c) => c.tipchain_registered,
    ).length;
    const buildersWithScore = combinedCreators.filter(
      (c) => (c.builder_score_points || 0) > 0,
    ).length;
    const creatorsWithSocials = combinedCreators.filter(
      (c) => c.twitter_handle || c.github_handle || c.farcaster_handle,
    ).length;

    return {
      totalCreators: combinedCreators.length,
      totalTips,
      totalVolume,
      claimedCreators,
      buildersWithScore,
      creatorsWithSocials,
    };
  }, [combinedCreators]);

  return {
    // Dados
    creators: visibleUsers,
    allCreators: combinedCreators,
    platformStats: stats,
    isLoading:
      (supabaseLoading && supabaseUsers.length === 0) ||
      (isLoadingGraphQL && graphqlUsers.length === 0),
    isLoadingMore,
    error: supabaseError || errorGraphQL,
    searchQuery,
    totalCount: combinedCreators.length,
    hasMore: hasMore || hasMoreGraphQL,

    // Ações
    searchUsers,
    applyFilters,
    clearFilters,
    loadMore: handleLoadMore,
    refresh: () => {
      loadUsers(0, true);
      loadGraphQLUsers(false);
    },
    setSort: (newSortBy: SortBy, newSortOrder?: SortOrder) => {
      setLocalSortBy(newSortBy);
      if (newSortOrder) setLocalSortOrder(newSortOrder);
    },

    // Estado atual
    sortBy: localSortBy,
    sortOrder: localSortOrder,

    // Refs
    containerRef,

    // Estatísticas
    stats,
  };
}
