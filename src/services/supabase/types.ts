export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      tipchain_users: {
        Row: {
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
          builder_score_last_calculated: string | null;
          base_builder_score_points: number | null;
          base_builder_score_rank: number | null;
          base_builder_score_last_calculated: string | null;
          tags: string[] | null;
          leaderboard_position: number | null;
          reward_amount: string | null;
          calculating_score: boolean | null;
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
          primary_wallet_connected_at: string | null;
          primary_wallet_owned_since: string | null;
          twitter_handle: string | null;
          twitter_followers: number | null;
          github_handle: string | null;
          lens_handle: string | null;
          farcaster_handle: string | null;
          total_socials: number | null;
          total_wallets: number | null;
          last_synced_at: string | null;
          sync_status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          talent_protocol_id?: number | null;
          display_name?: string | null;
          name?: string | null;
          bio?: string | null;
          image_url?: string | null;
          location?: string | null;
          human_checkmark?: boolean | null;
          verified_nationality?: boolean | null;
          builder_score_points?: number | null;
          builder_score_rank?: number | null;
          builder_score_last_calculated?: string | null;
          base_builder_score_points?: number | null;
          base_builder_score_rank?: number | null;
          base_builder_score_last_calculated?: string | null;
          tags?: string[] | null;
          leaderboard_position?: number | null;
          reward_amount?: string | null;
          calculating_score?: boolean | null;
          tipchain_registered?: boolean;
          tipchain_basename: string;
          tipchain_display_name: string;
          tipchain_bio: string;
          tipchain_avatar_url?: string | null;
          tipchain_total_tips_received?: number;
          tipchain_tip_count?: number;
          tipchain_is_active?: boolean;
          tipchain_created_at: string;
          primary_wallet_address?: string | null;
          primary_wallet_connected_at?: string | null;
          primary_wallet_owned_since?: string | null;
          twitter_handle?: string | null;
          twitter_followers?: number | null;
          github_handle?: string | null;
          lens_handle?: string | null;
          farcaster_handle?: string | null;
          total_socials?: number | null;
          total_wallets?: number | null;
          last_synced_at?: string | null;
          sync_status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          talent_protocol_id?: number | null;
          display_name?: string | null;
          name?: string | null;
          bio?: string | null;
          image_url?: string | null;
          location?: string | null;
          human_checkmark?: boolean | null;
          verified_nationality?: boolean | null;
          builder_score_points?: number | null;
          builder_score_rank?: number | null;
          builder_score_last_calculated?: string | null;
          base_builder_score_points?: number | null;
          base_builder_score_rank?: number | null;
          base_builder_score_last_calculated?: string | null;
          tags?: string[] | null;
          leaderboard_position?: number | null;
          reward_amount?: string | null;
          calculating_score?: boolean | null;
          tipchain_registered?: boolean;
          tipchain_basename?: string;
          tipchain_display_name?: string;
          tipchain_bio?: string;
          tipchain_avatar_url?: string | null;
          tipchain_total_tips_received?: number;
          tipchain_tip_count?: number;
          tipchain_is_active?: boolean;
          tipchain_created_at?: string;
          primary_wallet_address?: string | null;
          primary_wallet_connected_at?: string | null;
          primary_wallet_owned_since?: string | null;
          twitter_handle?: string | null;
          twitter_followers?: number | null;
          github_handle?: string | null;
          lens_handle?: string | null;
          farcaster_handle?: string | null;
          total_socials?: number | null;
          total_wallets?: number | null;
          last_synced_at?: string | null;
          sync_status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
  };
}
