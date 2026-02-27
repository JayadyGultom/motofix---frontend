import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ShoppingCart, Package, AlertTriangle, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';
import { usePermission } from '../hooks/usePermission';

export default function Dashboard({ user }: { user: any }) {
  const { isMekanik, canViewFinance } = usePermission(user);
  const [stats, setStats] = useState({
    incomeToday: 0,
    expenseToday: 0,
    transactionsToday: 0,
    lowStockCount: 0
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sData, cData] = await Promise.all([
          api.get<any>('/dashboard/stats'),
          canViewFinance ? api.get<any[]>('/dashboard/charts') : Promise.resolve([])
        ]);

        setStats(sData || { incomeToday: 0, expenseToday: 0, transactionsToday: 0, lowStockCount: 0 });
        setChartData(cData || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [canViewFinance]);

  const formatCurrency = (val: number) => {
    if (isMekanik) return '••••••';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const statCards = [
    { label: 'Pemasukan Hari Ini', value: isMekanik ? 'Only Admin/Cashier can view' : formatCurrency(stats.incomeToday), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Pengeluaran Hari Ini', value: isMekanik ? 'Only Admin/Cashier can view' : formatCurrency(stats.expenseToday), icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Transaksi Hari Ini', value: stats.transactionsToday, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Stok Hampir Habis', value: stats.lowStockCount, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-brand-orange animate-spin" size={40} />
        <p className="text-gray-500 font-medium">Memuat data dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-brand-card border border-white/5 rounded-3xl p-6 hover:border-brand-orange/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className={cn("font-bold text-white tracking-tight", isMekanik && (i === 0 || i === 1) ? "text-sm italic text-gray-500" : "text-2xl")}>
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-brand-card border border-white/5 rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Grafik Pendapatan</h3>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-brand-orange rounded-full" />
                <span className="text-gray-400">Pemasukan</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            {canViewFinance ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F27D26" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F27D26" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} dy={10} minTickGap={0} interval={0} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    tickFormatter={(value) => `Rp${value / 1000000}jt`}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#F27D26' }}
                  />
                  <Area type="linear" dataKey="income" stroke="#F27D26" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border border-white/5 border-dashed rounded-2xl bg-white/5">
                <p className="text-gray-500 text-sm italic">Data grafik hanya tersedia untuk Admin atau Kasir</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-brand-orange rounded-[2rem] p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500">
            <Package size={120} />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Inventory Ringkasan</h3>
            <p className="text-white/80 text-sm mb-8 font-medium">Beberapa produk perlu segera dipesan ulang.</p>
            <div className="space-y-4">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between">
                <span className="text-sm font-bold">Stok Rendah</span>
                <span className="bg-white text-brand-orange px-3 py-1 rounded-full text-xs font-black">{stats.lowStockCount}</span>
              </div>
              <button
                className="w-full py-4 bg-white text-brand-orange rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-opacity-90 transition-all shadow-xl shadow-brand-orange/20"
                onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'inventory' }))}
              >
                Cek Inventori
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
