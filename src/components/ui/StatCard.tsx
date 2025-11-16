import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from './Card';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  description?: string;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function StatCard({
  icon: Icon,
  title,
  value,
  description,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100',
  trend,
  className = '',
}: StatCardProps) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg ${iconBgColor} p-3`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
          {description && (
            <p className="mt-2 text-sm text-gray-500">{description}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive !== false
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {trend.isPositive !== false ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-sm text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
