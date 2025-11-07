import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../services/supabase/client";
import type { SupabaseUser } from "../hooks/useSupabaseUsers";

interface UsersState {
  users: SupabaseUser[];
  filteredUsers: SupabaseUser[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  searchQuery: string;
  filters: {
    tipchainRegistered: boolean;
    hasBuilderScore: boolean;
    hasSocials: boolean;
  };

  // Actions
  loadUsers: () => Promise<void>;
  searchUsers: (query: string) => void;
  applyFilters: (filters: Partial<UsersState["filters"]>) => void;
  clearFilters: () => void;
  getCreatorStats: () => {
    total: number;
    registered: number;
    withBuilderScore: number;
    withSocials: number;
  };
}

const CACHE_DURATION = 5 * 60 * 1000;

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [],
      filteredUsers: [],
      isLoading: false,
      error: null,
      lastFetched: null,
      searchQuery: "",
      filters: {
        tipchainRegistered: false,
        hasBuilderScore: false,
        hasSocials: false,
      },

      loadUsers: async () => {
        const state = get();

        // Verificar cache
        if (
          state.lastFetched &&
          Date.now() - state.lastFetched < CACHE_DURATION
        ) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // Carregar em chunks para não sobrecarregar o Supabase
          let allUsers: SupabaseUser[] = [];
          let page = 0;
          const pageSize = 1000;
          let hasMore = true;

          while (hasMore) {
            const { data, error } = await supabase
              .from("tipchain_users")
              .select("*")
              .range(page * pageSize, (page + 1) * pageSize - 1)
              .order("tipchain_total_tips_received", { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
              allUsers = [...allUsers, ...data];
              page++;

              // Atualizar estado parcialmente para feedback visual
              set({
                users: allUsers,
                filteredUsers: allUsers,
                lastFetched: Date.now(),
              });

              // Continuar carregando se ainda houver dados
              hasMore = data.length === pageSize;
            } else {
              hasMore = false;
            }
          }

          console.log(`Loaded ${allUsers.length} users from Supabase`);
        } catch (err) {
          console.error("Error loading users:", err);
          set({
            error: err instanceof Error ? err.message : "Failed to load users",
          });
        } finally {
          set({ isLoading: false });
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

        // Aplicar busca primeiro
        if (searchQuery) {
          const searchTerm = searchQuery.toLowerCase();
          filtered = users.filter((user) => matchesSearch(user, searchTerm));
        }

        // Aplicar filtros
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

      getCreatorStats: () => {
        const { users } = get();

        return {
          total: users.length,
          registered: users.filter((u) => u.tipchain_registered).length,
          withBuilderScore: users.filter(
            (u) => (u.builder_score_points || 0) > 0,
          ).length,
          withSocials: users.filter(
            (u) => u.twitter_handle || u.github_handle || u.farcaster_handle,
          ).length,
        };
      },
    }),
    {
      name: "users-storage",
      partialize: (state) => ({
        users: state.users,
        lastFetched: state.lastFetched,
      }),
    },
  ),
);

// Funções auxiliares
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
