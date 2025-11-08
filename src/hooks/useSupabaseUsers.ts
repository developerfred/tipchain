import { useState, useEffect, useCallback } from "react";
import { useUsersStore } from "../stores/useUsersStore";

export function useSupabaseUsers() {
  const {
    users,
    filteredUsers,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalCount,
    hasMore,
    loadUsers,
    searchUsers,
    applyFilters,
    clearFilters,
    getCreatorStats,
  } = useUsersStore();

  const [stats, setStats] = useState({
    total: 0,
    registered: 0,
    withBuilderScore: 0,
    withSocials: 0,
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadUsers(0, true);
    loadStats();
  }, []);

  const loadStats = useCallback(async () => {
    const statsData = await getCreatorStats();
    setStats(statsData);
  }, [getCreatorStats]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadUsers(currentPage + 1);
    }
  }, [hasMore, isLoading, currentPage, loadUsers]);

  const refresh = useCallback(() => {
    loadUsers(0, true);
    loadStats();
  }, [loadUsers, loadStats]);

  return {
    users: filteredUsers,
    allUsers: users,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalCount,
    hasMore,
    stats,
    loadMore,
    refresh,
    searchUsers,
    applyFilters,
    clearFilters,
  };
}
