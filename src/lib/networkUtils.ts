/**
 * Network utility functions for TipChain
 */

export interface NetworkInfo {
  chainId: number;
  name: string;
  shortName: string;
  color: string;
  currency: string;
  rpcUrl?: string;
  blockExplorer?: string;
}

/**
 * Get short network name for display
 */
export function getShortNetworkName(chainId: number): string {
  const networkMap: Record<number, string> = {
    8453: 'Base',
    84532: 'Base Sepolia',
    42220: 'Celo',
    44787: 'Celo Alfajores',
    10: 'Optimism',
    10143: 'Monad Testnet',
    534351: 'Scroll Sepolia',
    168587773: 'Blast Sepolia',
    // Add more networks as needed
  };

  return networkMap[chainId] || `Chain ${chainId}`;
}

/**
 * Get network info by chain ID
 */
export function getNetworkInfo(chainId: number): NetworkInfo | null {
  const networks: Record<number, NetworkInfo> = {
    8453: {
      chainId: 8453,
      name: 'Base',
      shortName: 'Base',
      color: 'bg-blue-600',
      currency: 'ETH',
      blockExplorer: 'https://basescan.org',
    },
    84532: {
      chainId: 84532,
      name: 'Base Sepolia',
      shortName: 'Base',
      color: 'bg-blue-400',
      currency: 'ETH',
      blockExplorer: 'https://sepolia.basescan.org',
    },
    42220: {
      chainId: 42220,
      name: 'Celo',
      shortName: 'CELO',
      color: 'bg-green-500',
      currency: 'CELO',
      blockExplorer: 'https://celoscan.io',
    },
    44787: {
      chainId: 44787,
      name: 'Celo Alfajores',
      shortName: 'CELO',
      color: 'bg-green-300',
      currency: 'CELO',
      blockExplorer: 'https://alfajores.celoscan.io',
    },
    10: {
      chainId: 10,
      name: 'Optimism',
      shortName: 'OP',
      color: 'bg-red-500',
      currency: 'ETH',
      blockExplorer: 'https://optimistic.etherscan.io',
    },
    10143: {
      chainId: 10143,
      name: 'Monad Testnet',
      shortName: 'Monad',
      color: 'bg-purple-500',
      currency: 'MON',
    },
    534351: {
      chainId: 534351,
      name: 'Scroll Sepolia',
      shortName: 'Scroll',
      color: 'bg-orange-500',
      currency: 'ETH',
      blockExplorer: 'https://sepolia.scrollscan.com',
    },
    168587773: {
      chainId: 168587773,
      name: 'Blast Sepolia',
      shortName: 'Blast',
      color: 'bg-yellow-500',
      currency: 'ETH',
      blockExplorer: 'https://sepolia.blastscan.io',
    },
  };

  return networks[chainId] || null;
}

/**
 * Check if chain is a testnet
 */
export function isTestnet(chainId: number): boolean {
  const testnets = [84532, 44787, 10143, 534351, 168587773];
  return testnets.includes(chainId);
}

/**
 * Get block explorer URL for address
 */
export function getExplorerAddressUrl(
  chainId: number,
  address: string,
): string | null {
  const network = getNetworkInfo(chainId);
  if (!network?.blockExplorer) return null;
  return `${network.blockExplorer}/address/${address}`;
}

/**
 * Get block explorer URL for transaction
 */
export function getExplorerTxUrl(chainId: number, txHash: string): string | null {
  const network = getNetworkInfo(chainId);
  if (!network?.blockExplorer) return null;
  return `${network.blockExplorer}/tx/${txHash}`;
}

/**
 * Get all supported networks
 */
export function getSupportedNetworks(): NetworkInfo[] {
  return [
    getNetworkInfo(8453)!,
    getNetworkInfo(84532)!,
    getNetworkInfo(42220)!,
    getNetworkInfo(44787)!,
    getNetworkInfo(10)!,
    getNetworkInfo(10143)!,
    getNetworkInfo(534351)!,
    getNetworkInfo(168587773)!,
  ];
}

/**
 * Get mainnet networks only
 */
export function getMainnetNetworks(): NetworkInfo[] {
  return getSupportedNetworks().filter((n) => !isTestnet(n.chainId));
}

/**
 * Get testnet networks only
 */
export function getTestnetNetworks(): NetworkInfo[] {
  return getSupportedNetworks().filter((n) => isTestnet(n.chainId));
}
