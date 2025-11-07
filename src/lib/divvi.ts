import { getReferralTag, submitReferral } from "@divvi/referral-sdk";

/**
 * Divvi Consumer Address
 * This is your unique Divvi identifier for tracking referrals
 */
export const DIVVI_CONSUMER_ADDRESS = (import.meta.env
  .VITE_DIVVI_CONSUMER_ADDRESS ||
  "0xd1a8Dd23e356B9fAE27dF5DeF9ea025A602EC81e") as `0x${string}`;

/**
 * Generate a referral tag for a transaction
 * @param userAddress - The user's wallet address
 * @returns Referral tag to append to transaction data
 */
export const generateReferralTag = (userAddress: string): `0x${string}` => {
  try {
    const tag = getReferralTag({
      user: userAddress as `0x${string}`,
      consumer: DIVVI_CONSUMER_ADDRESS,
    });
    return tag;
  } catch (error) {
    console.error("Error generating referral tag:", error);
    return "0x" as `0x${string}`;
  }
};

/**
 * Submit a referral to Divvi after transaction confirmation
 * @param txHash - Transaction hash
 * @param chainId - Chain ID where transaction occurred
 */
export const submitDivviReferral = async (
  txHash: string,
  chainId: number,
): Promise<void> => {
  try {
    await submitReferral({
      txHash: txHash as `0x${string}`,
      chainId,
    });
    console.log("Referral submitted successfully:", txHash);
  } catch (error) {
    console.error("Error submitting referral:", error);
    // Don't throw - referral submission failure shouldn't block the user
  }
};

/**
 * Check if referral tracking is enabled
 */
export const isReferralEnabled = (): boolean => {
  return !!DIVVI_CONSUMER_ADDRESS && DIVVI_CONSUMER_ADDRESS !== "0x0";
};

/**
 * Append referral tag to transaction data
 * @param data - Original transaction data
 * @param userAddress - User's wallet address
 * @returns Transaction data with referral tag appended
 */
export const appendReferralTag = (
  data: `0x${string}`,
  userAddress: string,
): `0x${string}` => {
  if (!isReferralEnabled()) {
    return data;
  }

  try {
    const tag = generateReferralTag(userAddress);
    // Remove '0x' prefix from tag before appending
    const tagWithoutPrefix = tag.slice(2);
    return `${data}${tagWithoutPrefix}` as `0x${string}`;
  } catch (error) {
    console.error("Error appending referral tag:", error);
    return data;
  }
};

/**
 * Track referral in application state (optional)
 * This can be used for analytics or additional tracking
 */
export interface ReferralData {
  txHash: string;
  chainId: number;
  userAddress: string;
  timestamp: number;
  submitted: boolean;
}

/**
 * Store referral data locally for tracking
 */
export const storeReferralData = (data: ReferralData): void => {
  try {
    const stored = localStorage.getItem("tipchain-referrals");
    const referrals: ReferralData[] = stored ? JSON.parse(stored) : [];
    referrals.push(data);

    // Keep only last 100 referrals
    const trimmed = referrals.slice(-100);
    localStorage.setItem("tipchain-referrals", JSON.stringify(trimmed));
  } catch (error) {
    console.error("Error storing referral data:", error);
  }
};

/**
 * Get stored referral data
 */
export const getReferralData = (): ReferralData[] => {
  try {
    const stored = localStorage.getItem("tipchain-referrals");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting referral data:", error);
    return [];
  }
};
