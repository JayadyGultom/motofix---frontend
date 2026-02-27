import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Agu', laba: 15, pendapatan: 25 },
  { name: 'Sep', laba: 22, pendapatan: 35 },
  { name: 'Okt', laba: 18, pendapatan: 30 },
  { name: 'Nov', laba: 28, pendapatan: 45 },
  { name: 'Des', laba: 35, pendapatan: 55 },
  { name: 'Jan', laba: 30, pendapatan: 48 },
  { name: 'Feb', laba: 42, pendapatan: 60 },
];

export const ChartSection: React.FC = () => {
  return (
    <div className="h-[300px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorLaba" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F27D26" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={(value) => `Rp${value}M`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#141414', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="pendapatan" 
            stroke="#3B82F6" 
            fillOpacity={1} 
            fill="url(#colorPendapatan)" 
            strokeWidth={3}
          />
          <Area 
            type="monotone" 
            dataKey="laba" 
            stroke="#F27D26" 
            fillOpacity={1} 
            fill="url(#colorLaba)" 
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
