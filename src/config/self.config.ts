/**
 * Self.xyz KYC Integration Configuration
 * Preparation for Self Protocol identity verification
 * SDK: https://docs.self.xyz
 */

export const SELF_CONFIG = {
  // Self.xyz App ID (to be configured)
  APP_ID: process.env.VITE_SELF_APP_ID || '',

  // Self.xyz API Base URL
  API_BASE_URL: 'https://api.self.xyz',

  // Supported verification types
  VERIFICATION_TYPES: {
    AGE: 'age_verification',
    COUNTRY: 'country_verification',
    IDENTITY: 'identity_verification',
    ACCREDITATION: 'accreditation_verification',
  },

  // Minimum age requirement
  MIN_AGE: 18,
};

/**
 * Self.xyz verification status
 */
export enum SelfVerificationStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

/**
 * Check if Self.xyz is configured
 */
export function isSelfConfigured(): boolean {
  return !!SELF_CONFIG.APP_ID;
}
