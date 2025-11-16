/**
 * Noah AI Types and Interfaces
 * Automated tipping via AI agents
 */

export interface NoahAIAgent {
  id: string;
  name: string;
  description?: string;
  wallet: `0x${string}`;
  owner: `0x${string}`;
  rules: TippingRule[];
  budget: AgentBudget;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
  statistics: AgentStatistics;
}

export interface AgentBudget {
  daily: bigint;
  monthly: bigint;
  perTip: {
    min: bigint;
    max: bigint;
  };
  currentDailySpent: bigint;
  currentMonthlySpent: bigint;
  lastResetDate: string;
}

export enum AgentStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export interface TippingRule {
  id: string;
  agentId: string;
  name: string;
  description?: string;
  trigger: TriggerConfig;
  condition: RuleCondition;
  amount: AmountConfig;
  recipients: RecipientSelector;
  enabled: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  lastTriggeredAt?: string;
  triggerCount: number;
}

export interface TriggerConfig {
  type: TriggerType;
  source: string; // GitHub repo, Twitter account, etc.
  event: string; // pr_merged, tweet_engagement, etc.
  filters?: Record<string, unknown>;
}

export enum TriggerType {
  GITHUB_EVENT = 'github_event',
  TWITTER_ENGAGEMENT = 'twitter_engagement',
  ONCHAIN_EVENT = 'onchain_event',
  SCHEDULED = 'scheduled',
  WEBHOOK = 'webhook',
  MANUAL = 'manual',
}

export interface RuleCondition {
  expression: string; // e.g., "stars > 100 AND labels.includes('bug')"
  parameters: Record<string, unknown>;
}

export interface AmountConfig {
  type: 'fixed' | 'dynamic' | 'percentage';
  value: string; // Amount in ETH or formula
  token?: string; // Default to ETH
  network?: number; // Default to agent's preferred network
}

export interface RecipientSelector {
  type: RecipientType;
  value: string; // Address, username, or selector
  fallback?: string; // Fallback address if primary fails
}

export enum RecipientType {
  ADDRESS = 'address',
  GITHUB_USER = 'github_user',
  TWITTER_USER = 'twitter_user',
  BASENAME = 'basename',
  EXPRESSION = 'expression', // Dynamic based on event
}

export interface AgentStatistics {
  totalTips: number;
  totalAmountSent: string; // In ETH
  uniqueRecipients: number;
  successRate: number; // 0-100
  averageTipAmount: string;
  lastTipAt?: string;
  rulesTriggered: Record<string, number>; // Rule ID -> count
}

export interface TipExecution {
  id: string;
  agentId: string;
  ruleId: string;
  recipient: `0x${string}`;
  amount: bigint;
  token: string;
  network: number;
  status: ExecutionStatus;
  txHash?: string;
  error?: string;
  metadata: ExecutionMetadata;
  createdAt: string;
  completedAt?: string;
}

export enum ExecutionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface ExecutionMetadata {
  triggerEvent: unknown; // Original event that triggered the tip
  evaluationResult: unknown; // Condition evaluation details
  budgetCheck: {
    passed: boolean;
    dailyRemaining: bigint;
    monthlyRemaining: bigint;
  };
  recipientResolution?: {
    input: string;
    resolved: `0x${string}`;
    method: string;
  };
}

// GitHub Integration Types
export interface GitHubEvent {
  type: GitHubEventType;
  repository: string;
  actor: string;
  timestamp: string;
  data: unknown;
}

export enum GitHubEventType {
  PUSH = 'push',
  PULL_REQUEST = 'pull_request',
  PULL_REQUEST_MERGED = 'pull_request_merged',
  ISSUE_OPENED = 'issue_opened',
  ISSUE_CLOSED = 'issue_closed',
  STAR = 'star',
  FORK = 'fork',
  RELEASE = 'release',
}

// Twitter Integration Types
export interface TwitterEvent {
  type: TwitterEventType;
  userId: string;
  username: string;
  timestamp: string;
  data: TwitterEventData;
}

export enum TwitterEventType {
  TWEET = 'tweet',
  RETWEET = 'retweet',
  QUOTE = 'quote',
  REPLY = 'reply',
  LIKE = 'like',
  MENTION = 'mention',
}

export interface TwitterEventData {
  tweetId: string;
  text?: string;
  likes?: number;
  retweets?: number;
  replies?: number;
  url?: string;
}

// Onchain Event Types
export interface OnchainEvent {
  type: OnchainEventType;
  network: number;
  address: `0x${string}`;
  blockNumber: number;
  txHash: string;
  timestamp: string;
  data: unknown;
}

export enum OnchainEventType {
  TRANSFER = 'transfer',
  SWAP = 'swap',
  NFT_MINT = 'nft_mint',
  CONTRACT_CALL = 'contract_call',
  ATTESTATION = 'attestation',
}

// Agent Creation/Update
export interface CreateAgentInput {
  name: string;
  description?: string;
  budget: {
    daily: string; // In ETH
    monthly: string; // In ETH
    perTip: {
      min: string;
      max: string;
    };
  };
  rules?: CreateRuleInput[];
}

export interface CreateRuleInput {
  name: string;
  description?: string;
  trigger: TriggerConfig;
  condition: RuleCondition;
  amount: AmountConfig;
  recipients: RecipientSelector;
  enabled?: boolean;
  priority?: number;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string;
  budget?: Partial<CreateAgentInput['budget']>;
  status?: AgentStatus;
}

export interface UpdateRuleInput {
  name?: string;
  description?: string;
  trigger?: TriggerConfig;
  condition?: RuleCondition;
  amount?: AmountConfig;
  recipients?: RecipientSelector;
  enabled?: boolean;
  priority?: number;
}

// Rule Engine Types
export interface RuleEvaluationContext {
  event: GitHubEvent | TwitterEvent | OnchainEvent;
  agent: NoahAIAgent;
  rule: TippingRule;
  budget: AgentBudget;
}

export interface RuleEvaluationResult {
  passed: boolean;
  shouldExecute: boolean;
  recipient?: `0x${string}`;
  amount?: bigint;
  reason?: string;
  errors?: string[];
}
