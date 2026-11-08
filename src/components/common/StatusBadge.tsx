import React from 'react';
import { ApplicationStatus } from '../../types';
import { STATUS_META } from '../../lib/constants';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const meta = STATUS_META[status] || STATUS_META.new;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  const dotClasses = {
    new: 'bg-blue-500',
    under_review: 'bg-amber-500',
    contacted: 'bg-purple-500',
    approved: 'bg-emerald-500',
    rejected: 'bg-rose-500',
    on_hold: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${meta.bg} ${meta.text} ${meta.border} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotClasses[status] || 'bg-slate-400'}`}
        />
      )}
      <span>{meta.label}</span>
    </span>
  );
};
