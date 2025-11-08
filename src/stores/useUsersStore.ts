import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../services/supabase/client";
import type { SupabaseUser } from "../hooks/useSupabaseUsers";

interface UsersState {
  users: SupabaseUser[];
  filteredUsers: SupabaseUser[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    tipchainRegistered: boolean;
    hasBuilderScore: boolean;
    hasSocials: boolean;
  };


  currentPage: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;

  // Actions
  loadUsers: (page?: number, refresh?: boolean) => Promise<void>;
  searchUsers: (query: string) => void;
  applyFilters: (filters: Partial<UsersState["filters"]>) => void;
  clearFilters: () => void;
  getCreatorStats: () => Promise<{
    total: number;
    registered: number;
    withBuilderScore: number;
    withSocials: number;
  }>;
}

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [],
      filteredUsers: [],
      isLoading: false,
      error: null,
      searchQuery: "",
      filters: {
        tipchainRegistered: false,
        hasBuilderScore: false,
        hasSocials: false,
      },
      currentPage: 0,
      pageSize: 50, 
      totalCount: 0,
      hasMore: true,

      loadUsers: async (page = 0, refresh = false) => {
        const state = get();

        if (state.isLoading) return;

        set({ isLoading: true, error: null });

        try {
          if (refresh) {
            set({ users: [], currentPage: 0, totalCount: 0, hasMore: true });
          }

          const { data, error, count } = await supabase
            .from("tipchain_users")
            .select("*", { count: "exact" })
            .order("tipchain_total_tips_received", { ascending: false })
            .range(page * state.pageSize, (page + 1) * state.pageSize - 1);

          if (error) throw error;

          const newUsers = data || [];
          const currentUsers = refresh
            ? newUsers
            : [...state.users, ...newUsers];

          const hasMoreData = newUsers.length === state.pageSize;

          set({
            users: currentUsers,
            filteredUsers: applyAllFilters(currentUsers, state.filters),
            currentPage: page,
            totalCount: count || 0,
            hasMore: hasMoreData,
            isLoading: false,
          });
        } catch (err) {
          console.error("Error loading users:", err);
          set({
            error: err instanceof Error ? err.message : "Failed to load users",
            isLoading: false,
          });
        }
      },

      searchUsers: (query: string) => {
        const { users, filters } = get();

        if (!query.trim()) {
          set({
            filteredUsers: applyAllFilters(users, filters),
            searchQuery: "",
          });
          return;
        }

        const searchTerm = query.toLowerCase();
        const filtered = users.filter(
          (user) =>
            matchesSearch(user, searchTerm) && matchesFilters(user, filters),
        );

        set({
          filteredUsers: filtered,
          searchQuery: query,
        });
      },

      applyFilters: (newFilters) => {
        const { users, filters, searchQuery } = get();
        const updatedFilters = { ...filters, ...newFilters };

        let filtered = users;

        if (searchQuery) {
          const searchTerm = searchQuery.toLowerCase();
          filtered = users.filter((user) => matchesSearch(user, searchTerm));
        }

        filtered = applyAllFilters(filtered, updatedFilters);

        set({
          filteredUsers: filtered,
          filters: updatedFilters,
        });
      },

      clearFilters: () => {
        const { users, searchQuery } = get();

        let filtered = users;
        if (searchQuery) {
          const searchTerm = searchQuery.toLowerCase();
          filtered = users.filter((user) => matchesSearch(user, searchTerm));
        }

        set({
          filteredUsers: filtered,
          filters: {
            tipchainRegistered: false,
            hasBuilderScore: false,
            hasSocials: false,
          },
        });
      },

      getCreatorStats: async () => {
        try {
          const { count: totalCount } = await supabase
            .from("tipchain_users")
            .select("*", { count: "exact", head: true });

          const { count: registeredCount } = await supabase
            .from("tipchain_users")
            .select("*", { count: "exact", head: true })
            .eq("tipchain_registered", true);

          const { count: builderScoreCount } = await supabase
            .from("tipchain_users")
            .select("*", { count: "exact", head: true })
            .gt("builder_score_points", 0);

          const { count: socialsCount } = await supabase
            .from("tipchain_users")
            .select("*", { count: "exact", head: true })
            .or(
              "twitter_handle.not.is.null,github_handle.not.is.null,farcaster_handle.not.is.null",
            );

          return {
            total: totalCount || 0,
            registered: registeredCount || 0,
            withBuilderScore: builderScoreCount || 0,
            withSocials: socialsCount || 0,
          };
        } catch (error) {
          console.error("Error fetching stats:", error);
          return {
            total: 0,
            registered: 0,
            withBuilderScore: 0,
            withSocials: 0,
          };
        }
      },
    }),
    {
      name: "users-storage",
      
      partialize: (state) => ({
        filters: state.filters,
        searchQuery: state.searchQuery,        
      }),     
    },
  ),
);

function matchesSearch(user: SupabaseUser, searchTerm: string): boolean {
  return (
    user.tipchain_display_name?.toLowerCase().includes(searchTerm) ||
    user.tipchain_basename?.toLowerCase().includes(searchTerm) ||
    user.tipchain_bio?.toLowerCase().includes(searchTerm) ||
    user.twitter_handle?.toLowerCase().includes(searchTerm) ||
    user.github_handle?.toLowerCase().includes(searchTerm) ||
    user.farcaster_handle?.toLowerCase().includes(searchTerm) ||
    user.display_name?.toLowerCase().includes(searchTerm) ||
    false
  );
}

function matchesFilters(
  user: SupabaseUser,
  filters: UsersState["filters"],
): boolean {
  if (filters.tipchainRegistered && !user.tipchain_registered) return false;
  if (filters.hasBuilderScore && !(user.builder_score_points || 0) > 0)
    return false;
  if (
    filters.hasSocials &&
    !(user.twitter_handle || user.github_handle || user.farcaster_handle)
  )
    return false;
  return true;
}

function applyAllFilters(
  users: SupabaseUser[],
  filters: UsersState["filters"],
): SupabaseUser[] {
  return users.filter((user) => matchesFilters(user, filters));
}
