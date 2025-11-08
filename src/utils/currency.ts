// utils/currency.ts
import { useChainId } from "wagmi";

export interface NetworkConfig {
  symbol: string;
  name: string;
  decimals: number;
}

export const NETWORK_CURRENCIES: { [key: number]: NetworkConfig } = {
  8453: {
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
  },
  84532: {
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
  },
  42220: {
    symbol: "CELO",
    name: "Celo",
    decimals: 18,
  },
  44787: {
    symbol: "CELO",
    name: "Celo",
    decimals: 18,
  },
  10143: {
    symbol: "MON",
    name: "Monad",
    decimals: 18,
  },
  534351: {
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
  },
  10: {
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
  },
  168587773: {
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
  },
};


export function useCurrency() {
  const chainId = useChainId();

  const getCurrencySymbol = (): string => {
    return NETWORK_CURRENCIES[chainId]?.symbol || "ETH";
  };

  const getCurrencyConfig = (): NetworkConfig => {
    return (
      NETWORK_CURRENCIES[chainId] || {
        symbol: "ETH",
        name: "Ethereum",
        decimals: 18,
      }
    );
  };

  const formatAmount = (
    amount: string | bigint,
    decimals: number = 4,
  ): string => {
    const config = getCurrencyConfig();
    const amountBigInt = typeof amount === "string" ? BigInt(amount) : amount;
    
    const formatted = formatEth(amountBigInt, decimals);
    return `${formatted} ${config.symbol}`;
  };

  return {
    symbol: getCurrencySymbol(),
    config: getCurrencyConfig(),
    formatAmount,
    getCurrencySymbol,
    getCurrencyConfig,
  };
}

export function getCurrencySymbolByChainId(chainId: number): string {
  return NETWORK_CURRENCIES[chainId]?.symbol || "ETH";
}

export function getCurrencyConfigByChainId(chainId: number): NetworkConfig {
  return (
    NETWORK_CURRENCIES[chainId] || {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    }
  );
}

export function formatEth(amount: bigint, decimals: number = 4): string {
  const etherValue = Number(amount) / 1e18;
  return etherValue.toFixed(decimals);
}

export function formatCurrency(
  amount: string | bigint,
  chainId: number,
  decimals: number = 4,
): string {
  const symbol = getCurrencySymbolByChainId(chainId);
  const amountBigInt = typeof amount === "string" ? BigInt(amount) : amount;
  const formatted = formatEth(amountBigInt, decimals);
  return `${formatted} ${symbol}`;
}

export function useNetworkCurrency() {
  const chainId = useChainId();
  return getCurrencySymbolByChainId(chainId);
}
