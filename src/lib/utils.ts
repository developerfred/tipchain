import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEther, parseEther } from "viem";

/**
 * Merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format ETH/CELO amount with proper decimals
 */
export function formatAmount(
  amount: string | bigint,
  decimals: number = 4,
): string {
  try {
    const eth =
      typeof amount === "string"
        ? formatEther(BigInt(amount))
        : formatEther(amount);
    const num = parseFloat(eth);

    if (num === 0) return "0";
    if (num < 0.0001) return "< 0.0001";

    return num.toFixed(decimals);
  } catch {
    return "0";
  }
}

/**
 * Format amount with currency symbol
 */
export function formatCurrency(
  amount: string | bigint,
  symbol: string = "CELO",
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
 * Shorten address for display
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return "";
  if (address.length < chars * 2 + 2) return address;

  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format timestamp to relative time
 */
export function formatTimeAgo(timestamp: string | number): string {
  const now = Date.now();
  const time =
    typeof timestamp === "string"
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
  return "Just now";
}

/**
 * Format full date
 */
export function formatDate(timestamp: string | number): string {
  const time =
    typeof timestamp === "string"
      ? parseInt(timestamp) * 1000
      : timestamp * 1000;

  return new Date(time).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate basename format
 */

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Generate avatar URL from address (using DiceBear or similar)
 */
export function generateAvatarUrl(address: string): string {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Check if running in browser
 */
export const isBrowser = typeof window !== "undefined";

/**
 * Safe JSON parse
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Wait for a specified time
 */

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
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toString();
}

/**
 * Format timestamp to relative time
 */

/**
 * Validate basename format
 */
export function isValidBasename(basename: string): boolean {
  // Only lowercase letters, numbers, and hyphens
  // Must start with letter or number
  // Length between 3-30 characters
  const regex = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;
  return regex.test(basename);
}

/**
 * Generate shareable tip link
 */
export function generateTipLink(basename: string): string {
  const baseUrl = import.meta.env.VITE_APP_URL || "https://tipchain.app";
  return `${baseUrl}/tip/${basename}`;
}

/**
 * Copy to clipboard
 */

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Sleep/delay function
 */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));


/**
 * generateIncentiveLore
 */

export const generateIncentiveLore = (): string => {
  const loreTemplates = [
    "Digital patronage echoes through algorithmic ether, reinforcing creator economy foundations.",
    "Each token transfer forges an ecosystem where creativity becomes viable vocation.",
    "Blockchain immortalizes transactions as testament to human expression value.",
    "Your contribution cultivates a renaissance of independent digital creativity.",
    "Tipping recalibrates creator-fan dynamics in new cultural economy.",
    "Participate in the great digital patronage system of the 21st century.",
    "Decentralized cultural production converges algorithms and human creativity.",
    "Value propagation strengthens the entire ecosystem of digital innovators."
  ];

  const lore = loreTemplates[Math.floor(Math.random() * loreTemplates.length)];
  return (lore + " by tipchain.aipop.fun").slice(0, 100);
};