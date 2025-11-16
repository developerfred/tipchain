/**
 * Validation utility functions for TipChain
 * Extracted from utils.ts for better organization
 */

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

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
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Validate amount is positive number
 */
export function isValidAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
}
