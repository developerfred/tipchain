import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { useNoahAI, useAgent } from '@/hooks/useNoahAI';
import type { CreateAgentInput, CreateRuleInput } from '@/types/noah-ai';

export function NoahAIDashboard() {
  const { agents, loading, createAgent, addRule } = useNoahAI();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showCreateAgent, setShowCreateAgent] = useState(false);

  return (
    <>
      <SEO
        title="Noah AI Dashboard - Automated Tipping Agents"
        description="Manage your AI agents for automated crypto tipping. Set rules, monitor activity, and automate creator support."
      />

      <div className="mx-auto min-h-screen max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Noah AI Dashboard</h1>
            <p className="mt-2 text-lg text-gray-600">Automate your tipping with AI agents</p>
          </div>
          <button
            onClick={() => setShowCreateAgent(true)}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Create Agent
          </button>
        </div>

        {/* Agents Grid */}
        {loading && <div className="text-center">Loading agents...</div>}

        {!loading && agents.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <h3 className="mb-2 text-xl font-semibold">No agents yet</h3>
            <p className="mb-6 text-gray-600">Create your first AI agent to automate tipping</p>
            <button
              onClick={() => setShowCreateAgent(true)}
              className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Create First Agent
            </button>
          </div>
        )}

        {!loading && agents.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onClick={() => setSelectedAgentId(agent.id)}
              />
            ))}
          </div>
        )}

        {/* Agent Details Modal */}
        {selectedAgentId && (
          <AgentDetailsModal
            agentId={selectedAgentId}
            onClose={() => setSelectedAgentId(null)}
          />
        )}

        {/* Create Agent Modal */}
        {showCreateAgent && (
          <CreateAgentModal
            onClose={() => setShowCreateAgent(false)}
            onCreate={async (input) => {
              await createAgent(input);
              setShowCreateAgent(false);
            }}
          />
        )}
      </div>
    </>
  );
}

function AgentCard({ agent, onClick }: { agent: any; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">{agent.name}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
          agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {agent.status}
        </span>
      </div>

      {agent.description && (
        <p className="mb-4 text-sm text-gray-600">{agent.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Total Tips</p>
          <p className="font-semibold">{agent.statistics.totalTips}</p>
        </div>
        <div>
          <p className="text-gray-500">Rules</p>
          <p className="font-semibold">{agent.rules.length}</p>
        </div>
      </div>
    </div>
  );
}

function AgentDetailsModal({ agentId, onClose }: { agentId: string; onClose: () => void }) {
  const { agent, executions } = useAgent(agentId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{agent?.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        {agent && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 font-semibold">Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Total Tips" value={agent.statistics.totalTips.toString()} />
                <StatCard label="Total Sent" value={`${agent.statistics.totalAmountSent} ETH`} />
                <StatCard label="Success Rate" value={`${agent.statistics.successRate}%`} />
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold">Rules ({agent.rules.length})</h3>
              <div className="space-y-2">
                {agent.rules.map((rule) => (
                  <div key={rule.id} className="rounded border p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{rule.name}</span>
                      <span className={`text-xs ${rule.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold">Recent Executions</h3>
              <div className="space-y-2">
                {executions.slice(0, 10).map((exec) => (
                  <div key={exec.id} className="flex items-center justify-between rounded border p-3 text-sm">
                    <span>{exec.amount.toString()} ETH</span>
                    <span className="text-gray-600">{new Date(exec.createdAt).toLocaleString()}</span>
                    <span className={`capitalize ${exec.status === 'completed' ? 'text-green-600' : 'text-gray-600'}`}>
                      {exec.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function CreateAgentModal({ onClose, onCreate }: { onClose: () => void; onCreate: (input: CreateAgentInput) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dailyBudget, setDailyBudget] = useState('1');
  const [monthlyBudget, setMonthlyBudget] = useState('10');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name,
      description,
      budget: {
        daily: dailyBudget,
        monthly: monthlyBudget,
        perTip: { min: '0.001', max: '0.1' },
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8">
        <h2 className="mb-6 text-2xl font-bold">Create AI Agent</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Daily Budget (ETH)</label>
            <input
              type="number"
              step="0.001"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Monthly Budget (ETH)</label>
            <input
              type="number"
              step="0.001"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2"
              required
            />
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 px-4 py-2">
              Cancel
            </button>
            <button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
