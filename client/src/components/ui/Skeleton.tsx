import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'table-row' | 'circular';
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  count = 1,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full w-10 h-10';
      case 'card':
        return 'rounded-xl h-32 w-full';
      case 'table-row':
        return 'rounded-md h-12 w-full';
      case 'text':
      default:
        return 'rounded-md h-4 w-full';
    }
  };

  const items = Array.from({ length: count });

  if (variant === 'table-row') {
    return (
      <div className="w-full space-y-3">
        {items.map((_, i) => (
          <div
            key={i}
            className={`animate-pulse bg-slate-200/80 dark:bg-slate-700/50 ${getVariantClasses()} ${className}`}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-200/80 dark:bg-slate-700/50 ${getVariantClasses()} ${className}`}
        />
      ))}
    </>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => {
  return (
    <div className="w-full divide-y divide-gray-200 bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
        ))}
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-6 py-4 flex items-center gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <div
                key={c}
                className={`h-4 bg-gray-100 rounded animate-pulse ${
                  c === 0 ? 'w-1/3' : 'flex-1'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
