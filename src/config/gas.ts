/**
 * Gas Configuration for All Networks
 * Optimized gas settings for mainnet and testnet transactions
 */

export interface GasConfig {
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  gasLimit?: bigint;
  gasPrice?: bigint; // For legacy networks
}

/**
 * Gas configurations by chain ID
 * Testnets need higher gas to ensure transactions go through
 */
export const GAS_CONFIGS: Record<number, GasConfig> = {
  // Base Mainnet (8453)
  8453: {
    maxPriorityFeePerGas: BigInt(1000000), // 0.001 gwei
    gasLimit: BigInt(300000),
  },

  // Base Sepolia (84532) - Higher gas for testnet
  84532: {
    maxPriorityFeePerGas: BigInt(1000000000), // 1 gwei
    gasLimit: BigInt(500000),
  },

  // Celo Mainnet (42220)
  42220: {
    maxPriorityFeePerGas: BigInt(1000000000), // 1 gwei
    gasLimit: BigInt(300000),
  },

  // Celo Alfajores (44787) - Higher gas for testnet
  44787: {
    maxPriorityFeePerGas: BigInt(2000000000), // 2 gwei
    gasLimit: BigInt(500000),
  },

  // Optimism (10)
  10: {
    maxPriorityFeePerGas: BigInt(1000000), // 0.001 gwei
    gasLimit: BigInt(300000),
  },

  // Scroll Sepolia (534351) - Testnet
  534351: {
    maxPriorityFeePerGas: BigInt(2000000000), // 2 gwei
    gasLimit: BigInt(500000),
  },

  // Monad Testnet (10143)
  10143: {
    maxPriorityFeePerGas: BigInt(2000000000), // 2 gwei
    gasLimit: BigInt(500000),
  },

  // Unichain Sepolia (1301) - Testnet
  1301: {
    maxPriorityFeePerGas: BigInt(2000000000), // 2 gwei
    gasLimit: BigInt(500000),
  },

  // Blast Sepolia (168587773) - Testnet
  168587773: {
    maxPriorityFeePerGas: BigInt(2000000000), // 2 gwei
    gasLimit: BigInt(500000),
  },
};

/**
 * Get gas configuration for a specific chain
 */
export function getGasConfig(chainId: number): GasConfig {
  return GAS_CONFIGS[chainId] || {
    maxPriorityFeePerGas: BigInt(1000000000), // Default 1 gwei
    gasLimit: BigInt(300000),
  };
}

/**
 * Check if network is a testnet (needs higher gas)
 */
export function isTestnet(chainId: number): boolean {
  const testnets = [84532, 44787, 534351, 10143, 1301, 168587773];
  return testnets.includes(chainId);
}

/**
 * Get recommended gas multiplier for network
 * Testnets get 1.5x multiplier for safety
 */
export function getGasMultiplier(chainId: number): number {
  return isTestnet(chainId) ? 1.5 : 1.2;
}

/**
 * Calculate gas with buffer for safety
 */
export function calculateGasWithBuffer(
  estimatedGas: bigint,
  chainId: number
): bigint {
  const multiplier = getGasMultiplier(chainId);
  return (estimatedGas * BigInt(Math.floor(multiplier * 100))) / BigInt(100);
}

/**
 * Get gas price for legacy networks
 */
export function getLegacyGasPrice(chainId: number): bigint | undefined {
  // Some networks might still use legacy gas pricing
  // Return undefined to use EIP-1559 by default
  return undefined;
}
