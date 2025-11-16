/**
 * Ethereum Attestation Service (EAS) Configuration
 * Attestations for creator verification, tip receipts, and reputation
 */

export const EAS_CONTRACT_ADDRESSES: Record<number, string> = {
  // Base Mainnet
  8453: '0x4200000000000000000000000000000000000021',
  // Base Sepolia
  84532: '0x4200000000000000000000000000000000000021',
  // Optimism Mainnet
  10: '0x4200000000000000000000000000000000000021',
  // Celo Mainnet (if supported)
  42220: '0x', // TODO: Add when EAS is deployed on Celo
};

export const SCHEMA_REGISTRY_ADDRESSES: Record<number, string> = {
  // Base Mainnet
  8453: '0x4200000000000000000000000000000000000020',
  // Base Sepolia
  84532: '0x4200000000000000000000000000000000000020',
  // Optimism Mainnet
  10: '0x4200000000000000000000000000000000000020',
};

/**
 * TipChain Schema UIDs
 * These are the registered schemas for different attestation types
 */
export const TIPCHAIN_SCHEMAS = {
  // Creator Verification Attestation
  CREATOR_VERIFICATION:
    '0x0000000000000000000000000000000000000000000000000000000000000001', // TODO: Replace with actual schema UID after registration

  // Tip Receipt Attestation
  TIP_RECEIPT:
    '0x0000000000000000000000000000000000000000000000000000000000000002', // TODO: Replace with actual schema UID

  // Creator Reputation Attestation
  CREATOR_REPUTATION:
    '0x0000000000000000000000000000000000000000000000000000000000000003', // TODO: Replace with actual schema UID
};

/**
 * Schema Definitions
 * Define the structure of each attestation type
 */
export const SCHEMA_DEFINITIONS = {
  CREATOR_VERIFICATION: {
    name: 'TipChain Creator Verification',
    schema: 'address creator, string basename, bool isVerified, uint256 timestamp',
    description: 'Attestation for verified TipChain creators',
    revocable: true,
  },

  TIP_RECEIPT: {
    name: 'TipChain Tip Receipt',
    schema:
      'address tipper, address creator, uint256 amount, string token, bytes32 txHash, uint256 timestamp',
    description: 'Attestation for completed tips on TipChain',
    revocable: false,
  },

  CREATOR_REPUTATION: {
    name: 'TipChain Creator Reputation',
    schema:
      'address creator, uint256 totalTips, uint256 totalAmount, uint256 supporterCount, uint256 score, uint256 timestamp',
    description: 'On-chain reputation score for TipChain creators',
    revocable: true,
  },
};

/**
 * Check if EAS is supported on chain
 */
export function isEASSupported(chainId: number): boolean {
  return chainId in EAS_CONTRACT_ADDRESSES && EAS_CONTRACT_ADDRESSES[chainId] !== '0x';
}

/**
 * Get EAS contract address for chain
 */
export function getEASAddress(chainId: number): string | null {
  return EAS_CONTRACT_ADDRESSES[chainId] || null;
}

/**
 * Get Schema Registry address for chain
 */
export function getSchemaRegistryAddress(chainId: number): string | null {
  return SCHEMA_REGISTRY_ADDRESSES[chainId] || null;
}
