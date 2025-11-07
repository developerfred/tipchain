import { useState, useEffect } from "react";
import { supabase } from "../services/supabase/client";
import { useUsersStore } from "../stores/useUsersStore";

export interface SupabaseUser {
    id: string;
    talent_protocol_id: number | null;
    display_name: string | null;
    name: string | null;
    bio: string | null;
    image_url: string | null;
    location: string | null;
    human_checkmark: boolean | null;
    verified_nationality: boolean | null;
    builder_score_points: number | null;
    builder_score_rank: number | null;
    base_builder_score_points: number | null;
    base_builder_score_rank: number | null;
    tags: string[] | null;
    leaderboard_position: number | null;
    tipchain_registered: boolean;
    tipchain_basename: string;
    tipchain_display_name: string;
    tipchain_bio: string;
    tipchain_avatar_url: string | null;
    tipchain_total_tips_received: number;
    tipchain_tip_count: number;
    tipchain_is_active: boolean;
    tipchain_created_at: string;
    primary_wallet_address: string | null;
    twitter_handle: string | null;
    twitter_followers: number | null;
    github_handle: string | null;
    lens_handle: string | null;
    farcaster_handle: string | null;
    total_socials: number | null;
    total_wallets: number | null;
    created_at: string;
    updated_at: string;
}

export interface CombinedCreator {
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
    // Campos específicos do Supabase
    source: "graphql" | "supabase";
    tipchain_registered: boolean;
    primary_wallet_address?: string | null;
    builder_score_points?: number | null;
    base_builder_score_points?: number | null;
    twitter_handle?: string | null;
    github_handle?: string | null;
    farcaster_handle?: string | null;
    human_checkmark?: boolean | null;
    tags?: string[] | null;
}

export function useSupabaseUsers() {
    const {
        users,
        filteredUsers,
        isLoading,
        error,
        loadUsers,
        searchUsers,
        applyFilters,
        clearFilters,
        getCreatorStats,
    } = useUsersStore();

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    return {
        users: filteredUsers,
        allUsers: users,
        isLoading,
        error,
        refetch: loadUsers,
        searchUsers,
        applyFilters,
        clearFilters,
        getCreatorStats,
    };
}
