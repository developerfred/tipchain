import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TalentProfile {
  id: string;
  talentProtocolId: number;
  displayName: string;
  name: string;
  bio: string;
  imageUrl: string;
  location: string;
  humanCheckmark: boolean;
  verifiedNationality: boolean;
  builderScore: {
    points: number;
    rankPosition: number;
    lastCalculatedAt: string;
  };
  baseBuilderScore?: {
    points: number;
    rankPosition: number;
    lastCalculatedAt: string;
  };
  tags: string[];
  leaderboardPosition: number;
  rewardAmount: string;
  calculatingScore: boolean;
  createdAt: string;
}

export interface TalentSocial {
  socialName: string;
  socialSlug: string;
  handle: string;
  displayName: string;
  bio: string;
  profileImageUrl: string;
  profileUrl: string;
  followersCount: number;
  followingCount: number;
  location: string;
  ownedSince: string;
  source: string;
}

export interface TalentWallet {
  identifier: string;
  source: string;
  username: string;
  connectedAt: string;
  ownedSince: string;
  importedFrom: string | null;
  invalidToken: boolean;
  sourceType: string | null;
}

export interface TalentUser extends TalentProfile {
  socials: TalentSocial[];
  wallets: TalentWallet[];
  primaryWallet?: string;
  isRegisteredOnTipChain?: boolean;
  tipChainProfile?: any;
}

interface TalentState {
  users: TalentUser[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  perPage: number;
  lastFetched: number | null;

  
  fetchUsers: (page?: number, append?: boolean) => Promise<void>;
  fetchUserDetails: (uuid: string) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  registerUserOnTipChain: (
    uuid: string,
    walletAddress: string,
  ) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; 

export const useTalentStore = create<TalentState>()(
  persist(
    (set, get) => ({
      users: [],
      isLoading: false,
      error: null,
      hasMore: true,
      currentPage: 1,
      perPage: 20,
      lastFetched: null,

      fetchUsers: async (page = 1, append = false) => {
        const state = get();

        
        if (
          state.lastFetched &&
          Date.now() - state.lastFetched < CACHE_DURATION &&
          append
        ) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await fetch(
            `https://www.builderscore.xyz/api/leaderboards?per_page=${state.perPage}&page=${page}`,
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch users: ${response.status}`);
          }

          const data = await response.json();

          if (!data.users || !Array.isArray(data.users)) {
            throw new Error("Invalid response format");
          }

          
          const talentUsers: TalentUser[] = await Promise.all(
            data.users.map(async (user: any) => {
              const profile = user.profile;
              const builderScore = profile.scores?.find(
                (s: any) => s.slug === "builder_score",
              );
              const baseBuilderScore = profile.scores?.find(
                (s: any) => s.slug === "base_builder_score",
              );

              const talentUser: TalentUser = {
                id: profile.id,
                talentProtocolId: profile.talent_protocol_id,
                displayName: profile.display_name,
                name: profile.name,
                bio: profile.bio,
                imageUrl: profile.image_url,
                location: profile.location,
                humanCheckmark: profile.human_checkmark,
                verifiedNationality: profile.verified_nationality,
                builderScore: {
                  points: builderScore?.points || 0,
                  rankPosition: builderScore?.rank_position || 0,
                  lastCalculatedAt: builderScore?.last_calculated_at || "",
                },
                baseBuilderScore: baseBuilderScore
                  ? {
                      points: baseBuilderScore.points,
                      rankPosition: baseBuilderScore.rank_position,
                      lastCalculatedAt: baseBuilderScore.last_calculated_at,
                    }
                  : undefined,
                tags: profile.tags || [],
                leaderboardPosition: user.leaderboard_position,
                rewardAmount: user.reward_amount,
                calculatingScore: profile.calculating_score,
                createdAt: profile.created_at,
                socials: [],
                wallets: [],
              };

              
              get().fetchUserDetails(profile.id).catch(console.error);

              return talentUser;
            }),
          );

          set({
            users: append ? [...state.users, ...talentUsers] : talentUsers,
            isLoading: false,
            currentPage: page,
            hasMore: data.users.length === state.perPage,
            lastFetched: Date.now(),
          });
        } catch (error) {
          console.error("Error fetching talent users:", error);
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch users",
            isLoading: false,
          });
        }
      },

      fetchUserDetails: async (uuid: string) => {
        try {
          const [socialsResponse, walletsResponse] = await Promise.all([
            fetch(
              `https://www.builderscore.xyz/api/talent/socials?uuid=${uuid}`,
            ),
            fetch(
              `https://www.builderscore.xyz/api/talent/accounts?uuid=${uuid}`,
            ),
          ]);

          if (!socialsResponse.ok || !walletsResponse.ok) {
            throw new Error("Failed to fetch user details");
          }

          const socialsData = await socialsResponse.json();
          const walletsData = await walletsResponse.json();

          const socials: TalentSocial[] =
            socialsData.socials?.map((social: any) => ({
              socialName: social.social_name,
              socialSlug: social.social_slug,
              handle: social.handle,
              displayName: social.display_name,
              bio: social.bio,
              profileImageUrl: social.profile_image_url,
              profileUrl: social.profile_url,
              followersCount: social.followers_count,
              followingCount: social.following_count,
              location: social.location,
              ownedSince: social.owned_since,
              source: social.source,
            })) || [];

          const wallets: TalentWallet[] =
            walletsData.map((wallet: any) => ({
              identifier: wallet.identifier,
              source: wallet.source,
              username: wallet.username,
              connectedAt: wallet.connected_at,
              ownedSince: wallet.owned_since,
              importedFrom: wallet.imported_from,
              invalidToken: wallet.invalid_token,
              sourceType: wallet.source_type,
            })) || [];

          // Find primary wallet (oldest connected wallet)
          const primaryWallet = wallets
            .filter((w) => w.source === "wallet")
            .sort(
              (a, b) =>
                new Date(a.connectedAt).getTime() -
                new Date(b.connectedAt).getTime(),
            )[0];

          set((state) => ({
            users: state.users.map((user) =>
              user.id === uuid
                ? {
                    ...user,
                    socials,
                    wallets,
                    primaryWallet: primaryWallet?.identifier,
                  }
                : user,
            ),
          }));
        } catch (error) {
          console.error(`Error fetching details for user ${uuid}:`, error);
        }
      },

      searchUsers: async (query: string) => {
        set({ isLoading: true, error: null });

        try {
          // Since BuilderScore API doesn't have search, we'll filter client-side
          const state = get();
          const filteredUsers = state.users.filter(
            (user) =>
              user.displayName.toLowerCase().includes(query.toLowerCase()) ||
              user.name.toLowerCase().includes(query.toLowerCase()) ||
              user.bio.toLowerCase().includes(query.toLowerCase()) ||
              user.tags.some((tag) =>
                tag.toLowerCase().includes(query.toLowerCase()),
              ),
          );

          set({
            users: filteredUsers,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error searching users:", error);
          set({
            error:
              error instanceof Error ? error.message : "Failed to search users",
            isLoading: false,
          });
        }
      },

      registerUserOnTipChain: async (uuid: string, walletAddress: string) => {
        // Todo: This would integrate with your TipChain contract        
        set((state) => ({
          users: state.users.map((user) =>
            user.id === uuid
              ? {
                  ...user,
                  isRegisteredOnTipChain: true,
                  tipChainProfile: {
                    registeredAt: new Date().toISOString(),
                    walletAddress,
                  },
                }
              : user,
          ),
        }));
      },

      clearError: () => set({ error: null }),

      reset: () =>
        set({
          users: [],
          isLoading: false,
          error: null,
          hasMore: true,
          currentPage: 1,
          lastFetched: null,
        }),
    }),
    {
      name: "talent-store",
      partialize: (state) => ({
        users: state.users,
        lastFetched: state.lastFetched,
      }),
    },
  ),
);
