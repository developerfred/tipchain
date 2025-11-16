/**
 * Noah AI React Hook
 * Provides access to Noah AI agent functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { noahAIService } from '@/services/noah-ai.service';
import type {
  NoahAIAgent,
  CreateAgentInput,
  UpdateAgentInput,
  TippingRule,
  CreateRuleInput,
  UpdateRuleInput,
  TipExecution,
} from '@/types/noah-ai';

export function useNoahAI() {
  const { address } = useAccount();
  const [agents, setAgents] = useState<NoahAIAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load agents for connected wallet
  const loadAgents = useCallback(async () => {
    if (!address) {
      setAgents([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userAgents = await noahAIService.getAgentsByOwner(address);
      setAgents(userAgents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  // Create new agent
  const createAgent = useCallback(
    async (input: CreateAgentInput) => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const agent = await noahAIService.createAgent(input, address);
        setAgents((prev) => [...prev, agent]);
        return agent;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create agent';
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [address]
  );

  // Update agent
  const updateAgent = useCallback(async (agentId: string, input: UpdateAgentInput) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await noahAIService.updateAgent(agentId, input);
      if (!updated) {
        throw new Error('Agent not found');
      }

      setAgents((prev) => prev.map((a) => (a.id === agentId ? updated : a)));
      return updated;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update agent';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete agent
  const deleteAgent = useCallback(async (agentId: string) => {
    setLoading(true);
    setError(null);

    try {
      const success = await noahAIService.deleteAgent(agentId);
      if (!success) {
        throw new Error('Failed to delete agent');
      }

      setAgents((prev) => prev.filter((a) => a.id !== agentId));
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete agent';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add rule to agent
  const addRule = useCallback(async (agentId: string, input: CreateRuleInput) => {
    setLoading(true);
    setError(null);

    try {
      const rule = await noahAIService.addRule(agentId, input);
      if (!rule) {
        throw new Error('Failed to add rule');
      }

      setAgents((prev) =>
        prev.map((a) => (a.id === agentId ? { ...a, rules: [...a.rules, rule] } : a))
      );

      return rule;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add rule';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update rule
  const updateRule = useCallback(
    async (agentId: string, ruleId: string, input: UpdateRuleInput) => {
      setLoading(true);
      setError(null);

      try {
        const updated = await noahAIService.updateRule(agentId, ruleId, input);
        if (!updated) {
          throw new Error('Rule not found');
        }

        setAgents((prev) =>
          prev.map((a) =>
            a.id === agentId
              ? { ...a, rules: a.rules.map((r) => (r.id === ruleId ? updated : r)) }
              : a
          )
        );

        return updated;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update rule';
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Delete rule
  const deleteRule = useCallback(async (agentId: string, ruleId: string) => {
    setLoading(true);
    setError(null);

    try {
      const success = await noahAIService.deleteRule(agentId, ruleId);
      if (!success) {
        throw new Error('Failed to delete rule');
      }

      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId ? { ...a, rules: a.rules.filter((r) => r.id !== ruleId) } : a
        )
      );

      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete rule';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    agents,
    loading,
    error,
    createAgent,
    updateAgent,
    deleteAgent,
    addRule,
    updateRule,
    deleteRule,
    refresh: loadAgents,
  };
}

/**
 * Hook for agent details and executions
 */
export function useAgent(agentId: string | null) {
  const [agent, setAgent] = useState<NoahAIAgent | null>(null);
  const [executions, setExecutions] = useState<TipExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) {
      setAgent(null);
      setExecutions([]);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [agentData, executionData] = await Promise.all([
          noahAIService.getAgent(agentId),
          noahAIService.getExecutions(agentId),
        ]);

        setAgent(agentData);
        setExecutions(executionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agent data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [agentId]);

  return {
    agent,
    executions,
    loading,
    error,
  };
}
