import React from 'react';

type BadgeVariant = 'expired' | 'critical' | 'warning' | 'ok' | 'out' | 'low' | 'scheduleH' | 'scheduleX' | 'otc' | 'regular' | 'info' | 'purple';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  expired:   'bg-red-100 text-red-700 border border-red-200',
  critical:  'bg-red-50 text-red-600 border border-red-200',
  warning:   'bg-amber-50 text-amber-700 border border-amber-200',
  ok:        'bg-green-50 text-green-700 border border-green-200',
  out:       'bg-gray-100 text-gray-600 border border-gray-200',
  low:       'bg-orange-50 text-orange-700 border border-orange-200',
  scheduleH: 'bg-red-100 text-red-700 border border-red-200',
  scheduleX: 'bg-purple-100 text-purple-700 border border-purple-200',
  otc:       'bg-blue-50 text-blue-700 border border-blue-200',
  regular:   'bg-slate-100 text-slate-600 border border-slate-200',
  info:      'bg-blue-50 text-blue-700 border border-blue-200',
  purple:    'bg-purple-50 text-purple-700 border border-purple-200',
};

export default function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
