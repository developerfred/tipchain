/**
 * GitHub Webhook Service
 * Handles GitHub webhook events for Noah AI triggers
 */

import type { GitHubEvent, GitHubEventType } from '@/types/noah-ai';
import { noahAIService } from '@/services/noah-ai.service';
import { createEvaluationContext } from '@/lib/rule-engine';

export class GitHubWebhookService {
  private webhookSecret: string;

  constructor(webhookSecret?: string) {
    this.webhookSecret = webhookSecret || import.meta.env.VITE_GITHUB_WEBHOOK_SECRET || '';
  }

  /**
   * Process GitHub webhook payload
   */
  async processWebhook(payload: any, signature: string): Promise<void> {
    // Verify webhook signature
    if (!this.verifySignature(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }

    const event = this.parseGitHubEvent(payload);
    if (!event) {
      console.warn('Unsupported GitHub event type');
      return;
    }

    await this.handleEvent(event);
  }

  /**
   * Parse GitHub webhook payload into our event format
   */
  private parseGitHubEvent(payload: any): GitHubEvent | null {
    const eventType = payload.action || payload.type;

    switch (eventType) {
      case 'opened':
      case 'closed':
        if (payload.pull_request) {
          const isMerged = payload.pull_request.merged;
          return {
            type: isMerged ? 'pull_request_merged' : 'pull_request',
            repository: payload.repository.full_name,
            actor: payload.sender.login,
            timestamp: new Date().toISOString(),
            data: {
              number: payload.pull_request.number,
              title: payload.pull_request.title,
              labels: payload.pull_request.labels?.map((l: any) => l.name) || [],
              merged: isMerged,
              author: payload.pull_request.user.login,
              url: payload.pull_request.html_url,
            },
          };
        }

        if (payload.issue) {
          return {
            type: eventType === 'opened' ? 'issue_opened' : 'issue_closed',
            repository: payload.repository.full_name,
            actor: payload.sender.login,
            timestamp: new Date().toISOString(),
            data: {
              number: payload.issue.number,
              title: payload.issue.title,
              labels: payload.issue.labels?.map((l: any) => l.name) || [],
              author: payload.issue.user.login,
              url: payload.issue.html_url,
            },
          };
        }
        break;

      case 'created':
        if (payload.ref_type === 'tag' || payload.release) {
          return {
            type: 'release',
            repository: payload.repository.full_name,
            actor: payload.sender.login,
            timestamp: new Date().toISOString(),
            data: {
              tag: payload.release?.tag_name || payload.ref,
              name: payload.release?.name,
              url: payload.release?.html_url,
            },
          };
        }
        break;

      case 'started':
        return {
          type: 'star',
          repository: payload.repository.full_name,
          actor: payload.sender.login,
          timestamp: new Date().toISOString(),
          data: {
            stars: payload.repository.stargazers_count,
          },
        };

      case 'forked':
        return {
          type: 'fork',
          repository: payload.repository.full_name,
          actor: payload.sender.login,
          timestamp: new Date().toISOString(),
          data: {
            forks: payload.repository.forks_count,
          },
        };

      case 'push':
        return {
          type: 'push',
          repository: payload.repository.full_name,
          actor: payload.sender.login,
          timestamp: new Date().toISOString(),
          data: {
            ref: payload.ref,
            commits: payload.commits,
          },
        };

      default:
        return null;
    }

    return null;
  }

  /**
   * Handle GitHub event by evaluating agent rules
   */
  private async handleEvent(event: GitHubEvent): Promise<void> {
    console.log('Processing GitHub event:', event.type, event.repository);

    // Get all active agents (in production, query by repository filter)
    // For now, we'll need to implement agent discovery
    // This is a simplified version

    // Example: Process event through rule engine
    // const agents = await this.getRelevantAgents(event);
    // for (const agent of agents) {
    //   for (const rule of agent.rules) {
    //     if (rule.trigger.type === 'github_event') {
    //       const context = createEvaluationContext(event, agent, rule);
    //       const result = await noahAIService.evaluateEvent(context);
    //       if (result.shouldExecute) {
    //         await noahAIService.executeTip(...);
    //       }
    //     }
    //   }
    // }

    console.log('GitHub event processed successfully');
  }

  /**
   * Verify webhook signature
   */
  private verifySignature(payload: any, signature: string): boolean {
    if (!this.webhookSecret) {
      console.warn('GitHub webhook secret not configured, skipping verification');
      return true;
    }

    // In production, verify HMAC signature
    // const expectedSignature = crypto
    //   .createHmac('sha256', this.webhookSecret)
    //   .update(JSON.stringify(payload))
    //   .digest('hex');
    // return `sha256=${expectedSignature}` === signature;

    return true; // Skip verification for now
  }

  /**
   * Register webhook with GitHub repository
   */
  async registerWebhook(repository: string, webhookUrl: string, token: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repository}/hooks`,
        {
          method: 'POST',
          headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
          },
          body: JSON.stringify({
            name: 'web',
            active: true,
            events: [
              'push',
              'pull_request',
              'issues',
              'star',
              'fork',
              'release',
            ],
            config: {
              url: webhookUrl,
              content_type: 'json',
              secret: this.webhookSecret,
              insecure_ssl: '0',
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to register webhook: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error registering GitHub webhook:', error);
      return false;
    }
  }
}

export const githubWebhookService = new GitHubWebhookService();
