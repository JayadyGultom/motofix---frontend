import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, ExternalLink, Calendar, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { Transaction } from '../types';
import { usePermission } from '../hooks/usePermission';
import { TransactionModal } from './TransactionModal';

export const Transactions: React.FC<{ user: any }> = ({ user }) => {
  const { getActionWarning } = usePermission(user);
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.get<Transaction[]>('/transactions');
      setItems(data || []);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleNewTransaction = () => {
    const warning = getActionWarning('transaction');
    if (warning) {
      alert(warning);
      return;
    }
    setIsModalOpen(true);
  };

  const filteredItems = items.filter(i =>
    i.invoice_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-orange transition-colors" size={18} />
            <input
              type="text"
              placeholder="Cari ID transaksi, pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-card border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-brand-card border border-white/10 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:border-white/20 transition-all whitespace-nowrap">
            <Calendar size={18} />
            <span>Pilih Tanggal</span>
          </button>
        </div>

        <button
          onClick={handleNewTransaction}
          className="flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl text-sm font-bold hover:bg-brand-orange/90 transition-all shadow-lg shadow-brand-orange/20"
        >
          <Plus size={18} />
          <span>Transaksi Baru</span>
        </button>
      </div>

      <div className="bg-brand-card border border-white/5 rounded-3xl overflow-hidden overflow-x-auto custom-scrollbar">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Loader2 className="text-brand-orange animate-spin" size={40} />
            <p className="text-gray-500">Memuat riwayat transaksi...</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">No Invoice</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pelanggan</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mekanik</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Waktu</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Metode</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-brand-orange font-bold uppercase tracking-widest">{item.invoice_no}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-white">{item.customer_name || 'Umum'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-400">{item.mechanic_name || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleString('id-ID')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-white">{formatCurrency(item.total_amount)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500">
                      {item.payment_method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Lihat Detail">
                        <ExternalLink size={16} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-brand-orange hover:bg-brand-orange/5 rounded-lg transition-all" title="Cetak Struk">
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};
