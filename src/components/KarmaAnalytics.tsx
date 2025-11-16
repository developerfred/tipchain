/**
 * Enhanced Karma Project Analytics Component
 * Displays charts and statistics for Karma projects
 */

import { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { KarmaProject } from '@/services/karma.service';

interface KarmaAnalyticsProps {
  project: KarmaProject;
}

export function KarmaAnalytics({ project }: KarmaAnalyticsProps) {
  const fundingData = useMemo(() => {
    if (!project.funding) return [];

    return [
      {
        name: 'Raised',
        value: parseFloat(project.funding.totalRaised || '0'),
        color: '#3b82f6',
      },
      {
        name: 'Remaining',
        value: Math.max(
          0,
          parseFloat(project.funding.goalAmount || '0') - parseFloat(project.funding.totalRaised || '0')
        ),
        color: '#e5e7eb',
      },
    ];
  }, [project.funding]);

  const milestoneData = useMemo(() => {
    if (!project.milestones) return { completed: 0, inProgress: 0, pending: 0 };

    return project.milestones.reduce(
      (acc, milestone) => {
        if (milestone.status === 'completed') acc.completed++;
        else if (milestone.status === 'in-progress') acc.inProgress++;
        else acc.pending++;
        return acc;
      },
      { completed: 0, inProgress: 0, pending: 0 }
    );
  }, [project.milestones]);

  const progressPercentage = useMemo(() => {
    if (!project.funding?.goalAmount || !project.funding.totalRaised) return 0;

    const raised = parseFloat(project.funding.totalRaised);
    const goal = parseFloat(project.funding.goalAmount);

    return Math.min(100, (raised / goal) * 100);
  }, [project.funding]);

  return (
    <div className="space-y-6">
      {/* Funding Progress */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Funding Progress</h3>

        <div className="mb-4">
          <div className="flex justify-between text-sm">
            <span>
              {project.funding?.totalRaised || '0'} {project.funding?.currency || 'USD'}
            </span>
            <span className="text-gray-600">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 h-4 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {project.funding?.goalAmount && (
            <div className="mt-1 text-right text-sm text-gray-600">
              Goal: {project.funding.goalAmount} {project.funding.currency}
            </div>
          )}
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={fundingData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {fundingData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Milestones Chart */}
      {project.milestones && project.milestones.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">Milestone Progress</h3>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{milestoneData.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{milestoneData.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">{milestoneData.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={[
                { name: 'Completed', value: milestoneData.completed },
                { name: 'In Progress', value: milestoneData.inProgress },
                { name: 'Pending', value: milestoneData.pending },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Project Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total Raised"
          value={`${project.funding?.totalRaised || '0'} ${project.funding?.currency || 'USD'}`}
        />
        <StatCard
          label="Status"
          value={project.status}
          valueClassName="capitalize"
        />
        <StatCard
          label="Category"
          value={project.category}
          valueClassName="capitalize"
        />
        <StatCard
          label="Milestones"
          value={project.milestones?.length.toString() || '0'}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueClassName = '',
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-sm text-gray-600">{label}</div>
      <div className={`mt-1 text-xl font-bold ${valueClassName}`}>{value}</div>
    </div>
  );
}
