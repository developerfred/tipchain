export const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || 'G-XXXXXXXXXX';

export const GA_CONFIG = {
  anonymize_ip: true,
  cookie_flags: 'SameSite=None;Secure',
  send_page_view: false, // We'll send manually
};

// Event categories
export const EVENT_CATEGORIES = {
  TIP: 'Tip',
  PROFILE: 'Profile',
  WALLET: 'Wallet',
  NAVIGATION: 'Navigation',
  ENGAGEMENT: 'Engagement',
  CONVERSION: 'Conversion',
  ERROR: 'Error',
} as const;

// Event actions
export const EVENT_ACTIONS = {
  TIP: {
    INITIATED: 'tip_initiated',
    COMPLETED: 'tip_completed',
    FAILED: 'tip_failed',
    AMOUNT_CHANGED: 'tip_amount_changed',
    NETWORK_CHANGED: 'tip_network_changed',
  },
  PROFILE: {
    CREATED: 'profile_created',
    UPDATED: 'profile_updated',
    VIEWED: 'profile_viewed',
    SHARE_CLICKED: 'profile_share_clicked',
  },
  WALLET: {
    CONNECTED: 'wallet_connected',
    DISCONNECTED: 'wallet_disconnected',
    NETWORK_SWITCHED: 'network_switched',
  },
  NAVIGATION: {
    PAGE_VIEW: 'page_view',
    LINK_CLICKED: 'link_clicked',
    BUTTON_CLICKED: 'button_clicked',
  },
  ENGAGEMENT: {
    SCROLL_DEPTH: 'scroll_depth',
    TIME_ON_PAGE: 'time_on_page',
    VIDEO_PLAYED: 'video_played',
  },
  CONVERSION: {
    SIGNUP: 'signup',
    FIRST_TIP: 'first_tip',
    PROFILE_COMPLETE: 'profile_complete',
  },
  ERROR: {
    TRANSACTION_FAILED: 'transaction_failed',
    API_ERROR: 'api_error',
    WALLET_ERROR: 'wallet_error',
  },
} as const;
