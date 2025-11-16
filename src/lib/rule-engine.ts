/**
 * Noah AI Rule Engine
 * Evaluates rules and determines if tips should be executed
 */

import { parseEther } from 'viem';
import type {
  RuleEvaluationContext,
  RuleEvaluationResult,
  GitHubEvent,
  TwitterEvent,
  OnchainEvent,
  TriggerType,
  RecipientType,
} from '@/types/noah-ai';

/**
 * Evaluate a rule against an event
 */
export function evaluateRule(context: RuleEvaluationContext): RuleEvaluationResult {
  const { event, agent, rule, budget } = context;

  const result: RuleEvaluationResult = {
    passed: false,
    shouldExecute: false,
    errors: [],
  };

  try {
    // 1. Check if agent is active
    if (agent.status !== 'active') {
      result.errors?.push('Agent is not active');
      return result;
    }

    // 2. Check if rule is enabled
    if (!rule.enabled) {
      result.errors?.push('Rule is disabled');
      return result;
    }

    // 3. Check if trigger type matches event type
    if (!checkTriggerMatch(rule.trigger.type, event)) {
      result.errors?.push('Trigger type does not match event');
      return result;
    }

    // 4. Evaluate condition
    const conditionPassed = evaluateCondition(rule.condition, event);
    if (!conditionPassed) {
      result.errors?.push('Condition not met');
      return result;
    }

    result.passed = true;

    // 5. Calculate amount
    const amount = calculateAmount(rule.amount, event);
    if (!amount) {
      result.errors?.push('Failed to calculate amount');
      return result;
    }

    // 6. Check budget constraints
    const budgetCheck = checkBudget(amount, budget, rule.amount);
    if (!budgetCheck.passed) {
      result.errors?.push(`Budget exceeded: ${budgetCheck.reason}`);
      return result;
    }

    result.amount = amount;

    // 7. Resolve recipient
    const recipient = resolveRecipient(rule.recipients, event);
    if (!recipient) {
      result.errors?.push('Failed to resolve recipient');
      return result;
    }

    result.recipient = recipient;
    result.shouldExecute = true;

    return result;
  } catch (error) {
    result.errors?.push(error instanceof Error ? error.message : 'Unknown error');
    return result;
  }
}

/**
 * Check if trigger type matches event
 */
function checkTriggerMatch(
  triggerType: TriggerType,
  event: GitHubEvent | TwitterEvent | OnchainEvent
): boolean {
  switch (triggerType) {
    case TriggerType.GITHUB_EVENT:
      return 'repository' in event;
    case TriggerType.TWITTER_ENGAGEMENT:
      return 'username' in event && 'data' in event;
    case TriggerType.ONCHAIN_EVENT:
      return 'network' in event && 'blockNumber' in event;
    default:
      return false;
  }
}

/**
 * Evaluate condition expression
 */
function evaluateCondition(
  condition: { expression: string; parameters: Record<string, unknown> },
  event: unknown
): boolean {
  try {
    // Simple expression evaluator
    // In production, use a proper expression parser/evaluator
    const expression = condition.expression;
    const context = {
      event,
      params: condition.parameters,
    };

    // GitHub specific conditions
    if ('repository' in (event as GitHubEvent)) {
      const githubEvent = event as GitHubEvent;

      if (expression.includes('pr_merged')) {
        return githubEvent.type === 'pull_request_merged';
      }

      if (expression.includes('labels.includes')) {
        const match = expression.match(/labels\.includes\(['"](.+?)['"]\)/);
        if (match) {
          const requiredLabel = match[1];
          return (githubEvent.data as any)?.labels?.includes(requiredLabel);
        }
      }

      if (expression.includes('stars >')) {
        const match = expression.match(/stars\s*>\s*(\d+)/);
        if (match) {
          const threshold = parseInt(match[1]);
          return (githubEvent.data as any)?.stars > threshold;
        }
      }
    }

    // Twitter specific conditions
    if ('username' in (event as TwitterEvent)) {
      const twitterEvent = event as TwitterEvent;

      if (expression.includes('likes >')) {
        const match = expression.match(/likes\s*>\s*(\d+)/);
        if (match) {
          const threshold = parseInt(match[1]);
          return (twitterEvent.data?.likes || 0) > threshold;
        }
      }

      if (expression.includes('retweets >')) {
        const match = expression.match(/retweets\s*>\s*(\d+)/);
        if (match) {
          const threshold = parseInt(match[1]);
          return (twitterEvent.data?.retweets || 0) > threshold;
        }
      }

      if (expression.includes('mentions:')) {
        const match = expression.match(/mentions:@(\w+)/);
        if (match) {
          const mention = match[1];
          return twitterEvent.data?.text?.includes(`@${mention}`) || false;
        }
      }
    }

    // Default: always pass if no specific condition
    return true;
  } catch (error) {
    console.error('Error evaluating condition:', error);
    return false;
  }
}

/**
 * Calculate tip amount
 */
function calculateAmount(
  amountConfig: { type: string; value: string },
  event: unknown
): bigint | null {
  try {
    switch (amountConfig.type) {
      case 'fixed':
        return parseEther(amountConfig.value);

      case 'dynamic': {
        // Evaluate dynamic expression
        // For now, simple engagement-based calculation
        if ('data' in (event as TwitterEvent)) {
          const twitterEvent = event as TwitterEvent;
          const likes = twitterEvent.data?.likes || 0;
          const baseAmount = 0.001; // 0.001 ETH base
          const bonusAmount = Math.min(likes / 1000, 0.01); // +0.01 ETH per 1000 likes, max 0.01
          return parseEther((baseAmount + bonusAmount).toString());
        }
        return parseEther('0.001'); // Default dynamic amount
      }

      case 'percentage': {
        // Calculate percentage of some base value
        const percentage = parseFloat(amountConfig.value);
        // For now, return fixed amount
        return parseEther((percentage / 100).toString());
      }

      default:
        return parseEther(amountConfig.value);
    }
  } catch (error) {
    console.error('Error calculating amount:', error);
    return null;
  }
}

/**
 * Check if amount is within budget constraints
 */
function checkBudget(
  amount: bigint,
  budget: {
    daily: bigint;
    monthly: bigint;
    perTip: { min: bigint; max: bigint };
    currentDailySpent: bigint;
    currentMonthlySpent: bigint;
  },
  amountConfig: { type: string }
): { passed: boolean; reason?: string } {
  // Check per-tip limits
  if (amount < budget.perTip.min) {
    return { passed: false, reason: 'Amount below minimum per-tip limit' };
  }

  if (amount > budget.perTip.max) {
    return { passed: false, reason: 'Amount exceeds maximum per-tip limit' };
  }

  // Check daily budget
  if (budget.currentDailySpent + amount > budget.daily) {
    return { passed: false, reason: 'Daily budget exceeded' };
  }

  // Check monthly budget
  if (budget.currentMonthlySpent + amount > budget.monthly) {
    return { passed: false, reason: 'Monthly budget exceeded' };
  }

  return { passed: true };
}

/**
 * Resolve recipient address from selector
 */
function resolveRecipient(
  selector: { type: RecipientType; value: string; fallback?: string },
  event: unknown
): `0x${string}` | null {
  try {
    switch (selector.type) {
      case RecipientType.ADDRESS:
        return selector.value as `0x${string}`;

      case RecipientType.GITHUB_USER: {
        // In production, resolve GitHub username to wallet address
        // For now, return fallback or mock
        const githubEvent = event as GitHubEvent;
        if (githubEvent.actor) {
          // Mock resolution: hash username to address
          return generateMockAddress(githubEvent.actor);
        }
        return selector.fallback as `0x${string}` || null;
      }

      case RecipientType.TWITTER_USER: {
        // In production, resolve Twitter username to wallet address
        const twitterEvent = event as TwitterEvent;
        if (twitterEvent.username) {
          return generateMockAddress(twitterEvent.username);
        }
        return selector.fallback as `0x${string}` || null;
      }

      case RecipientType.BASENAME: {
        // In production, resolve basename to address
        // For now, mock resolution
        return generateMockAddress(selector.value);
      }

      case RecipientType.EXPRESSION: {
        // Evaluate expression to get recipient
        // For now, use fallback
        return selector.fallback as `0x${string}` || null;
      }

      default:
        return null;
    }
  } catch (error) {
    console.error('Error resolving recipient:', error);
    return null;
  }
}

/**
 * Generate mock address from string (for demo purposes)
 */
function generateMockAddress(input: string): `0x${string}` {
  const hash = Array.from(input)
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    .toString(16)
    .padStart(40, '0');
  return `0x${hash.substring(0, 40)}` as `0x${string}`;
}

/**
 * Create evaluation context
 */
export function createEvaluationContext(
  event: GitHubEvent | TwitterEvent | OnchainEvent,
  agent: any,
  rule: any
): RuleEvaluationContext {
  return {
    event,
    agent,
    rule,
    budget: agent.budget,
  };
}
