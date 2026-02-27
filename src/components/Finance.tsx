import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Download, Filter, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { StatCard } from './StatCard';
import { api } from '../lib/api';
import { usePermission } from '../hooks/usePermission';

export const Finance: React.FC<{ user: any }> = ({ user }) => {
  const { isMekanik, isKasir, getActionWarning } = usePermission(user);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Mekanik is still masked, but Kasir can now fetch data (read-only)
      if (isMekanik) {
        setLoading(false);
        return;
      }

      try {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const [eData, rData] = await Promise.all([
          api.get<any[]>('/expenses'),
          api.get<any>(`/reports/profit-loss?start=${firstDay}&end=${lastDay}`)
        ]);
        setExpenses(eData || []);
        setReport(rData);
      } catch (err) {
        console.error('Failed to fetch finance data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isMekanik, isKasir]);

  const formatCurrency = (val: number) => {
    if (isMekanik) return '••••••';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const maskMessage = isMekanik ? "Only Admin/Cashier can view" : "";

  const handleRestrictedAction = () => {
    const warning = getActionWarning('finance');
    if (warning) {
      alert(warning);
    } else if (isKasir) {
      // Kasir has read-only access, but Filter/Export are considered administrative/advanced for this specific requirement
      alert("Only Admin can perform this action");
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-brand-orange animate-spin" size={40} />
        <p className="text-gray-500">Memuat riwayat keuangan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Profit Bersih (Bulan Ini)"
          value={isMekanik ? maskMessage : formatCurrency(report?.profit || 0)}
          trend={isMekanik ? "" : "+12.5% bulan ini"}
          trendType="up"
          icon={<TrendingUp className="text-brand-orange" size={48} />}
        />
        <StatCard
          title="Total Pemasukan"
          value={isMekanik ? maskMessage : formatCurrency(report?.income || 0)}
          trend={isMekanik ? "" : "+5.2% dari target"}
          trendType="up"
          icon={<ArrowUpRight className="text-emerald-500" size={48} />}
        />
        <StatCard
          title="Total Pengeluaran"
          value={isMekanik ? maskMessage : formatCurrency(report?.expense || 0)}
          trend={isMekanik ? "" : "-2.1% dari budget"}
          trendType="down"
          icon={<ArrowDownRight className="text-red-500" size={48} />}
        />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Riwayat Pengeluaran</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRestrictedAction}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-card border border-white/10 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-all"
          >
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button
            onClick={handleRestrictedAction}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-card border border-white/10 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-all"
          >
            <Download size={16} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-brand-card border border-white/5 rounded-3xl overflow-hidden overflow-x-auto custom-scrollbar min-h-[200px] flex flex-col">
        {!isMekanik ? (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Waktu</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {expenses.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-md">{item.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleString('id-ID')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-300">{item.description}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-red-400">
                      -{formatCurrency(item.amount)}
                    </span>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500 italic">Belum ada data pengeluaran.</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-gray-500 gap-2">
            <TrendingDown size={40} className="opacity-20 mb-2" />
            <p className="font-bold text-white">{maskMessage}</p>
            <p className="text-sm italic">Data finansial ini bersifat rahasia.</p>
          </div>
        )}
      </div>
    </div>
  );
};
