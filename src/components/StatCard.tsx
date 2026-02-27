import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  trend, 
  trendType = 'neutral',
  subtitle,
  icon
}) => {
  return (
    <div className="bg-brand-card border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-brand-orange/30 transition-all duration-300">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        {icon}
      </div>
      
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">{title}</p>
      
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trendType === 'up' ? "text-emerald-500" : trendType === 'down' ? "text-red-500" : "text-gray-400"
          )}>
            {trendType === 'up' && <TrendingUp size={14} />}
            {trendType === 'down' && <TrendingDown size={14} />}
            <span>{trend}</span>
          </div>
        )}
        
        {subtitle && (
          <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
