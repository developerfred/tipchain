/**
 * Karma HQ Integration Configuration
 * Enables tipping to projects listed on Karma GAP
 */

export const KARMA_API_BASE_URL = 'https://tipchain-api.deno.dev';
export const KARMA_GAP_URL = 'https://gap.karmahq.xyz';

/**
 * Karma API endpoints
 */
export const KARMA_ENDPOINTS = {
  PROJECTS: '/projects',
  PROJECT_BY_ID: (id: string) => `/projects/${id}`,
  PROJECT_BY_SLUG: (slug: string) => `/projects/slug/${slug}`,
  GRANT_PROGRAMS: '/grant-programs',
  MILESTONES: (projectId: string) => `/projects/${projectId}/milestones`,
  UPDATES: (projectId: string) => `/projects/${projectId}/updates`,
};

/**
 * Supported networks on Karma
 */
export const KARMA_SUPPORTED_NETWORKS = {
  BASE: 8453,
  BASE_SEPOLIA: 84532,
  OPTIMISM: 10,
  CELO: 42220,
};

/**
 * Project categories on Karma
 */
export enum KarmaProjectCategory {
  DEFI = 'defi',
  NFT = 'nft',
  INFRASTRUCTURE = 'infrastructure',
  SOCIAL = 'social',
  GAMING = 'gaming',
  DAO = 'dao',
  TOOLING = 'tooling',
  OTHER = 'other',
}

/**
 * Project status on Karma
 */
export enum KarmaProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}
