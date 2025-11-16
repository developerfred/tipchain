/**
 * Noah AI Service
 * Manages AI agents for automated tipping
 */

import { parseEther, formatEther } from 'viem';
import type {
  NoahAIAgent,
  CreateAgentInput,
  UpdateAgentInput,
  TippingRule,
  CreateRuleInput,
  UpdateRuleInput,
  TipExecution,
  AgentStatus,
  ExecutionStatus,
  RuleEvaluationContext,
  RuleEvaluationResult,
} from '@/types/noah-ai';
import { evaluateRule } from '@/lib/rule-engine';

export class NoahAIService {
  private apiBaseUrl: string;
  private agents: Map<string, NoahAIAgent> = new Map();
  private executions: Map<string, TipExecution> = new Map();

  constructor(apiBaseUrl: string = '/api/noah-ai') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Create a new AI agent
   */
  async createAgent(input: CreateAgentInput, ownerAddress: `0x${string}`): Promise<NoahAIAgent> {
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const walletAddress = this.generateAgentWallet(agentId);

    const agent: NoahAIAgent = {
      id: agentId,
      name: input.name,
      description: input.description,
      wallet: walletAddress,
      owner: ownerAddress,
      rules: [],
      budget: {
        daily: parseEther(input.budget.daily),
        monthly: parseEther(input.budget.monthly),
        perTip: {
          min: parseEther(input.budget.perTip.min),
          max: parseEther(input.budget.perTip.max),
        },
        currentDailySpent: 0n,
        currentMonthlySpent: 0n,
        lastResetDate: new Date().toISOString(),
      },
      status: AgentStatus.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statistics: {
        totalTips: 0,
        totalAmountSent: '0',
        uniqueRecipients: 0,
        successRate: 100,
        averageTipAmount: '0',
        rulesTriggered: {},
      },
    };

    // Add rules if provided
    if (input.rules && input.rules.length > 0) {
      for (const ruleInput of input.rules) {
        const rule = this.createRuleFromInput(agentId, ruleInput);
        agent.rules.push(rule);
      }
    }

    this.agents.set(agentId, agent);

    // Save to backend (mocked for now)
    await this.saveAgent(agent);

    return agent;
  }

  /**
   * Get agent by ID
   */
  async getAgent(agentId: string): Promise<NoahAIAgent | null> {
    const agent = this.agents.get(agentId);
    if (agent) return agent;

    // Try to fetch from backend
    try {
      const response = await fetch(`${this.apiBaseUrl}/agents/${agentId}`);
      if (!response.ok) return null;
      const data = await response.json();
      this.agents.set(agentId, data);
      return data;
    } catch (error) {
      console.error('Error fetching agent:', error);
      return null;
    }
  }

  /**
   * Get all agents for an owner
   */
  async getAgentsByOwner(ownerAddress: `0x${string}`): Promise<NoahAIAgent[]> {
    const ownedAgents = Array.from(this.agents.values()).filter(
      (agent) => agent.owner.toLowerCase() === ownerAddress.toLowerCase()
    );

    // TODO: Fetch from backend as well
    return ownedAgents;
  }

  /**
   * Update agent
   */
  async updateAgent(agentId: string, input: UpdateAgentInput): Promise<NoahAIAgent | null> {
    const agent = await this.getAgent(agentId);
    if (!agent) return null;

    if (input.name) agent.name = input.name;
    if (input.description !== undefined) agent.description = input.description;
    if (input.status) agent.status = input.status;

    if (input.budget) {
      if (input.budget.daily) {
        agent.budget.daily = parseEther(input.budget.daily);
      }
      if (input.budget.monthly) {
        agent.budget.monthly = parseEther(input.budget.monthly);
      }
      if (input.budget.perTip) {
        if (input.budget.perTip.min) {
          agent.budget.perTip.min = parseEther(input.budget.perTip.min);
        }
        if (input.budget.perTip.max) {
          agent.budget.perTip.max = parseEther(input.budget.perTip.max);
        }
      }
    }

    agent.updatedAt = new Date().toISOString();
    this.agents.set(agentId, agent);

    await this.saveAgent(agent);
    return agent;
  }

  /**
   * Delete agent
   */
  async deleteAgent(agentId: string): Promise<boolean> {
    const agent = await this.getAgent(agentId);
    if (!agent) return false;

    agent.status = AgentStatus.DELETED;
    agent.updatedAt = new Date().toISOString();

    await this.saveAgent(agent);
    return true;
  }

  /**
   * Add rule to agent
   */
  async addRule(agentId: string, input: CreateRuleInput): Promise<TippingRule | null> {
    const agent = await this.getAgent(agentId);
    if (!agent) return null;

    const rule = this.createRuleFromInput(agentId, input);
    agent.rules.push(rule);
    agent.updatedAt = new Date().toISOString();

    this.agents.set(agentId, agent);
    await this.saveAgent(agent);

    return rule;
  }

  /**
   * Update rule
   */
  async updateRule(
    agentId: string,
    ruleId: string,
    input: UpdateRuleInput
  ): Promise<TippingRule | null> {
    const agent = await this.getAgent(agentId);
    if (!agent) return null;

    const ruleIndex = agent.rules.findIndex((r) => r.id === ruleId);
    if (ruleIndex === -1) return null;

    const rule = agent.rules[ruleIndex];

    if (input.name) rule.name = input.name;
    if (input.description !== undefined) rule.description = input.description;
    if (input.trigger) rule.trigger = input.trigger;
    if (input.condition) rule.condition = input.condition;
    if (input.amount) rule.amount = input.amount;
    if (input.recipients) rule.recipients = input.recipients;
    if (input.enabled !== undefined) rule.enabled = input.enabled;
    if (input.priority !== undefined) rule.priority = input.priority;

    rule.updatedAt = new Date().toISOString();
    agent.rules[ruleIndex] = rule;
    agent.updatedAt = new Date().toISOString();

    this.agents.set(agentId, agent);
    await this.saveAgent(agent);

    return rule;
  }

  /**
   * Delete rule
   */
  async deleteRule(agentId: string, ruleId: string): Promise<boolean> {
    const agent = await this.getAgent(agentId);
    if (!agent) return false;

    const ruleIndex = agent.rules.findIndex((r) => r.id === ruleId);
    if (ruleIndex === -1) return false;

    agent.rules.splice(ruleIndex, 1);
    agent.updatedAt = new Date().toISOString();

    this.agents.set(agentId, agent);
    await this.saveAgent(agent);

    return true;
  }

  /**
   * Execute rule evaluation for an event
   */
  async evaluateEvent(
    context: RuleEvaluationContext
  ): Promise<RuleEvaluationResult> {
    return evaluateRule(context);
  }

  /**
   * Execute a tip based on rule evaluation
   */
  async executeTip(
    agentId: string,
    ruleId: string,
    recipient: `0x${string}`,
    amount: bigint,
    metadata: unknown
  ): Promise<TipExecution> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const execution: TipExecution = {
      id: executionId,
      agentId,
      ruleId,
      recipient,
      amount,
      token: 'ETH',
      network: 8453, // Base by default
      status: ExecutionStatus.PENDING,
      metadata: metadata as any,
      createdAt: new Date().toISOString(),
    };

    this.executions.set(executionId, execution);

    // Process the execution
    this.processExecution(execution);

    return execution;
  }

  /**
   * Get execution history for an agent
   */
  async getExecutions(agentId: string, limit: number = 50): Promise<TipExecution[]> {
    const agentExecutions = Array.from(this.executions.values())
      .filter((exec) => exec.agentId === agentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return agentExecutions;
  }

  /**
   * Get agent statistics
   */
  async getAgentStatistics(agentId: string): Promise<NoahAIAgent['statistics'] | null> {
    const agent = await this.getAgent(agentId);
    return agent?.statistics || null;
  }

  // Private helper methods

  private createRuleFromInput(agentId: string, input: CreateRuleInput): TippingRule {
    return {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      name: input.name,
      description: input.description,
      trigger: input.trigger,
      condition: input.condition,
      amount: input.amount,
      recipients: input.recipients,
      enabled: input.enabled ?? true,
      priority: input.priority ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      triggerCount: 0,
    };
  }

  private generateAgentWallet(agentId: string): `0x${string}` {
    // In production, this would generate a real wallet
    // For now, generate a deterministic address from agentId
    const hash = Array.from(agentId)
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
      .toString(16)
      .padStart(40, '0');
    return `0x${hash.substring(0, 40)}` as `0x${string}`;
  }

  private async saveAgent(agent: NoahAIAgent): Promise<void> {
    // In production, save to backend API
    // For now, just keep in memory
    this.agents.set(agent.id, agent);

    // Mock API call
    try {
      await fetch(`${this.apiBaseUrl}/agents/${agent.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agent),
      });
    } catch (error) {
      // Silently fail for now
      console.warn('Failed to save agent to backend:', error);
    }
  }

  private async processExecution(execution: TipExecution): Promise<void> {
    try {
      execution.status = ExecutionStatus.PROCESSING;
      this.executions.set(execution.id, execution);

      // In production, this would interact with smart contracts
      // For now, simulate the execution
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock transaction hash
      execution.txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      execution.status = ExecutionStatus.COMPLETED;
      execution.completedAt = new Date().toISOString();

      // Update agent statistics
      const agent = await this.getAgent(execution.agentId);
      if (agent) {
        agent.statistics.totalTips += 1;
        agent.statistics.totalAmountSent = (
          BigInt(agent.statistics.totalAmountSent) + execution.amount
        ).toString();
        agent.statistics.lastTipAt = execution.completedAt;

        // Update rule trigger count
        const rule = agent.rules.find((r) => r.id === execution.ruleId);
        if (rule) {
          rule.triggerCount += 1;
          rule.lastTriggeredAt = execution.completedAt;
          agent.statistics.rulesTriggered[rule.id] =
            (agent.statistics.rulesTriggered[rule.id] || 0) + 1;
        }

        // Update budget spent
        agent.budget.currentDailySpent += execution.amount;
        agent.budget.currentMonthlySpent += execution.amount;

        await this.saveAgent(agent);
      }
    } catch (error) {
      execution.status = ExecutionStatus.FAILED;
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.completedAt = new Date().toISOString();
    }

    this.executions.set(execution.id, execution);
  }
}

// Export singleton instance
export const noahAIService = new NoahAIService();
