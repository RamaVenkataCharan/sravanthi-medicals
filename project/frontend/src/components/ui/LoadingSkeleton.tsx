import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />;
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-slate-100">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="flex-1">
              <Skeleton className={`h-4 rounded ${j === 0 ? 'w-3/4' : j === cols - 1 ? 'w-1/2' : 'w-full'}`} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-24 rounded" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse-soft">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[0, 1, 2, 3].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <Skeleton className="h-5 w-40 rounded" />
        </div>
        <TableSkeleton />
      </div>
    </div>
  );
}

export default Skeleton;
