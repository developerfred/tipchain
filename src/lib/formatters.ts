/**
 * Formatting utility functions for TipChain
 * Extracted from utils.ts for better organization
 */

import { formatEther, parseEther } from 'viem';

/**
 * Format ETH/CELO amount with proper decimals
 */
export function formatAmount(
  amount: string | bigint,
  decimals: number = 4,
): string {
  try {
    const eth =
      typeof amount === 'string'
        ? formatEther(BigInt(amount))
        : formatEther(amount);
    const num = parseFloat(eth);

    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';

    return num.toFixed(decimals);
  } catch {
    return '0';
  }
}

/**
 * Format amount with currency symbol
 */
export function formatCurrency(
  amount: string | bigint,
  symbol: string = 'CELO',
): string {
  return `${formatAmount(amount)} ${symbol}`;
}

/**
 * Parse amount to wei/smallest unit
 */
export function parseAmount(amount: string): bigint {
  try {
    return parseEther(amount);
  } catch {
    return BigInt(0);
  }
}

/**
 * Format ETH value to readable format
 */
export function formatEth(value: bigint, decimals = 4): string {
  const eth = Number(value) / 1e18;
  return eth.toFixed(decimals);
}

/**
 * Format USD value
 */
export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format timestamp to relative time
 */
export function formatTimeAgo(timestamp: string | number): string {
  const now = Date.now();
  const time =
    typeof timestamp === 'string'
      ? parseInt(timestamp) * 1000
      : timestamp * 1000;

  const diff = now - time;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}y ago`;
  if (months > 0) return `${months}mo ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

/**
 * Format full date
 */
export function formatDate(timestamp: string | number): string {
  const time =
    typeof timestamp === 'string'
      ? parseInt(timestamp) * 1000
      : timestamp * 1000;

  return new Date(time).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length < chars * 2 + 2) return address;

  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
