import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: string; positive?: boolean };
  onClick?: () => void;
  loading?: boolean;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-green-600',
  iconBg = 'bg-green-50',
  trend,
  onClick,
  loading = false,
}: StatCardProps) {
  const Wrapper = onClick ? 'button' : 'div';

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton h-4 w-28 rounded" />
          <div className="skeleton h-10 w-10 rounded-xl" />
        </div>
        <div className="skeleton h-8 w-20 rounded" />
      </div>
    );
  }

  return (
    <Wrapper
      className={`card p-6 w-full text-left animate-slide-up ${onClick ? 'cursor-pointer hover:shadow-card-hover transition-shadow duration-200' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
      {trend && (
        <p className={`text-xs font-medium mt-2 ${trend.positive !== false ? 'text-green-600' : 'text-red-500'}`}>
          {trend.value}
        </p>
      )}
    </Wrapper>
  );
}
