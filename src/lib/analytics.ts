import ReactGA from 'react-ga4';
import { GA_TRACKING_ID, GA_CONFIG } from '@/config/analytics';
import type { AnalyticsEvent } from '@/types/seo';

let isInitialized = false;

/**
 * Initialize Google Analytics
 */
export function initGA(): void {
  if (!GA_TRACKING_ID || GA_TRACKING_ID === 'G-XXXXXXXXXX') {
    console.warn('GA Tracking ID not configured');
    return;
  }

  if (isInitialized) {
    return;
  }

  try {
    ReactGA.initialize(GA_TRACKING_ID, {
      gaOptions: GA_CONFIG,
    });
    isInitialized = true;
    console.log('Google Analytics initialized');
  } catch (error) {
    console.error('Failed to initialize GA:', error);
  }
}

/**
 * Track page view
 */
export function trackPageView(path?: string): void {
  if (!isInitialized) return;

  const page = path || window.location.pathname + window.location.search;

  try {
    ReactGA.send({
      hitType: 'pageview',
      page,
      title: document.title,
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}

/**
 * Track custom event
 */
export function trackEvent({ category, action, label, value }: AnalyticsEvent): void {
  if (!isInitialized) return;

  try {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

/**
 * Track tip transaction
 */
export function trackTip(amount: string, token: string, network: string, success: boolean): void {
  trackEvent({
    category: 'Tip',
    action: success ? 'tip_completed' : 'tip_failed',
    label: `${token} on ${network}`,
    value: parseFloat(amount) || 0,
  });
}

/**
 * Track wallet connection
 */
export function trackWalletConnection(method: 'social' | 'wallet', provider?: string): void {
  trackEvent({
    category: 'Wallet',
    action: 'wallet_connected',
    label: provider || method,
  });
}

/**
 * Track profile creation/update
 */
export function trackProfile(action: 'created' | 'updated', username?: string): void {
  trackEvent({
    category: 'Profile',
    action: `profile_${action}`,
    label: username,
  });
}

/**
 * Track error
 */
export function trackError(errorType: string, errorMessage: string): void {
  trackEvent({
    category: 'Error',
    action: errorType,
    label: errorMessage,
  });
}

/**
 * Track conversion
 */
export function trackConversion(conversionType: string, value?: number): void {
  trackEvent({
    category: 'Conversion',
    action: conversionType,
    value,
  });
}

/**
 * Track scroll depth
 */
export function trackScrollDepth(depth: number): void {
  trackEvent({
    category: 'Engagement',
    action: 'scroll_depth',
    label: `${depth}%`,
    value: depth,
  });
}

/**
 * Set user ID for tracking across sessions
 */
export function setUserId(userId: string): void {
  if (!isInitialized) return;

  try {
    ReactGA.set({ userId });
  } catch (error) {
    console.error('Failed to set user ID:', error);
  }
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, string | number | boolean>): void {
  if (!isInitialized) return;

  try {
    ReactGA.set(properties);
  } catch (error) {
    console.error('Failed to set user properties:', error);
  }
}
