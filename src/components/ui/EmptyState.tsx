import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex min-h-[400px] flex-col items-center justify-center px-4 text-center ${className}`}
    >
      {Icon && (
        <Icon className="mb-4 h-16 w-16 text-gray-400" strokeWidth={1.5} />
      )}
      <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>
      {description && <p className="mb-6 text-gray-600">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
