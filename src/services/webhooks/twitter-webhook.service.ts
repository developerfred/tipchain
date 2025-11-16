/**
 * Twitter Webhook Service
 * Handles Twitter webhook events for Noah AI triggers
 */

import type { TwitterEvent, TwitterEventType, TwitterEventData } from '@/types/noah-ai';

export class TwitterWebhookService {
  private apiKey: string;
  private apiSecret: string;
  private bearerToken: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_TWITTER_API_KEY || '';
    this.apiSecret = import.meta.env.VITE_TWITTER_API_SECRET || '';
    this.bearerToken = import.meta.env.VITE_TWITTER_BEARER_TOKEN || '';
  }

  /**
   * Process Twitter webhook payload
   */
  async processWebhook(payload: any): Promise<void> {
    const event = this.parseTwitterEvent(payload);
    if (!event) {
      console.warn('Unsupported Twitter event type');
      return;
    }

    await this.handleEvent(event);
  }

  /**
   * Parse Twitter webhook payload
   */
  private parseTwitterEvent(payload: any): TwitterEvent | null {
    // Twitter API v2 webhook structure
    if (payload.data) {
      const tweet = payload.data;
      const userId = tweet.author_id;

      return {
        type: 'tweet',
        userId,
        username: payload.includes?.users?.[0]?.username || 'unknown',
        timestamp: tweet.created_at || new Date().toISOString(),
        data: {
          tweetId: tweet.id,
          text: tweet.text,
          likes: tweet.public_metrics?.like_count || 0,
          retweets: tweet.public_metrics?.retweet_count || 0,
          replies: tweet.public_metrics?.reply_count || 0,
          url: `https://twitter.com/${payload.includes?.users?.[0]?.username}/status/${tweet.id}`,
        },
      };
    }

    // Handle different event types
    if (payload.favorite_events) {
      return this.parseFavoriteEvent(payload.favorite_events[0]);
    }

    if (payload.tweet_create_events) {
      return this.parseTweetCreateEvent(payload.tweet_create_events[0]);
    }

    return null;
  }

  /**
   * Parse favorite (like) event
   */
  private parseFavoriteEvent(event: any): TwitterEvent {
    return {
      type: 'like',
      userId: event.user.id_str,
      username: event.user.screen_name,
      timestamp: new Date(event.created_at).toISOString(),
      data: {
        tweetId: event.favorited_status.id_str,
        text: event.favorited_status.text,
      },
    };
  }

  /**
   * Parse tweet create event
   */
  private parseTweetCreateEvent(event: any): TwitterEvent {
    return {
      type: 'tweet',
      userId: event.user.id_str,
      username: event.user.screen_name,
      timestamp: new Date(event.created_at).toISOString(),
      data: {
        tweetId: event.id_str,
        text: event.text,
        likes: event.favorite_count || 0,
        retweets: event.retweet_count || 0,
        replies: event.reply_count || 0,
        url: `https://twitter.com/${event.user.screen_name}/status/${event.id_str}`,
      },
    };
  }

  /**
   * Handle Twitter event
   */
  private async handleEvent(event: TwitterEvent): Promise<void> {
    console.log('Processing Twitter event:', event.type, event.username);

    // Similar to GitHub webhook, evaluate against agent rules
    // In production, this would trigger rule evaluation

    console.log('Twitter event processed successfully');
  }

  /**
   * Fetch tweet by ID (for manual triggers)
   */
  async getTweet(tweetId: string): Promise<TwitterEventData | null> {
    if (!this.bearerToken) {
      console.warn('Twitter bearer token not configured');
      return null;
    }

    try {
      const response = await fetch(
        `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=created_at,public_metrics,author_id&expansions=author_id`,
        {
          headers: {
            'Authorization': `Bearer ${this.bearerToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch tweet: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        tweetId: data.data.id,
        text: data.data.text,
        likes: data.data.public_metrics.like_count,
        retweets: data.data.public_metrics.retweet_count,
        replies: data.data.public_metrics.reply_count,
        url: `https://twitter.com/${data.includes.users[0].username}/status/${data.data.id}`,
      };
    } catch (error) {
      console.error('Error fetching tweet:', error);
      return null;
    }
  }

  /**
   * Monitor user timeline for engagement
   */
  async monitorUser(username: string): Promise<void> {
    console.log(`Monitoring Twitter user: @${username}`);
    // In production, set up timeline monitoring
    // For now, this is a placeholder
  }

  /**
   * Search for mentions
   */
  async searchMentions(query: string): Promise<TwitterEvent[]> {
    if (!this.bearerToken) {
      return [];
    }

    try {
      const response = await fetch(
        `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&tweet.fields=created_at,public_metrics,author_id&expansions=author_id`,
        {
          headers: {
            'Authorization': `Bearer ${this.bearerToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to search mentions: ${response.statusText}`);
      }

      const data = await response.json();

      return data.data?.map((tweet: any, index: number) => ({
        type: 'mention',
        userId: tweet.author_id,
        username: data.includes.users[index]?.username || 'unknown',
        timestamp: tweet.created_at,
        data: {
          tweetId: tweet.id,
          text: tweet.text,
          likes: tweet.public_metrics.like_count,
          retweets: tweet.public_metrics.retweet_count,
          replies: tweet.public_metrics.reply_count,
          url: `https://twitter.com/${data.includes.users[index]?.username}/status/${tweet.id}`,
        },
      })) || [];
    } catch (error) {
      console.error('Error searching mentions:', error);
      return [];
    }
  }
}

export const twitterWebhookService = new TwitterWebhookService();
