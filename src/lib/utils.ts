import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export organized utilities for backward compatibility
// New code should import from specific modules for better tree-shaking
export * from './formatters';
export * from './validators';
export * from './networkUtils';

/**
 * Generate avatar URL from address (using DiceBear or similar)
 */
export function generateAvatarUrl(address: string): string {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`;
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
 * Generate shareable tip link
 */
export function generateTipLink(basename: string): string {
  const baseUrl = import.meta.env.VITE_APP_URL || "https://tipchain.app";
  return `${baseUrl}/tip/${basename}`;
}

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
