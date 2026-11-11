import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  subtitle?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'blue',
  subtitle,
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      iconText: 'text-blue-600',
      borderHover: 'hover:border-blue-200',
    },
    green: {
      bg: 'bg-emerald-50',
      iconText: 'text-emerald-600',
      borderHover: 'hover:border-emerald-200',
    },
    purple: {
      bg: 'bg-purple-50',
      iconText: 'text-purple-600',
      borderHover: 'hover:border-purple-200',
    },
    orange: {
      bg: 'bg-amber-50',
      iconText: 'text-amber-600',
      borderHover: 'hover:border-amber-200',
    },
  }[color];

  return (
    <div
      className={`p-6 bg-white rounded-xl border border-gray-200/80 shadow-sm transition-all duration-200 hover:shadow-md ${colorMap.borderHover} flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`p-2.5 rounded-lg ${colorMap.bg} ${colorMap.iconText}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold tracking-tight text-gray-900">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1.5 text-xs text-gray-500 flex items-center">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
