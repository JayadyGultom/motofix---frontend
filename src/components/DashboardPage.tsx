import React, { useState } from 'react';
import {
  Search,
  Bell,
  Activity,
  LayoutDashboard,
  Package,
  Receipt,
  Wallet,
  Users,
  Wrench,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './Sidebar';
import Dashboard from './Dashboard';
import { Inventory } from './Inventory';
import { Transactions } from './Transactions';
import { Finance } from './Finance';
import { Customers } from './Customers';
import { Mechanics } from './Mechanics';
import { usePermission } from '../hooks/usePermission';

interface DashboardPageProps {
  onLogout: () => void;
  user: any;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout, user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'System Dashboard';
      case 'inventory': return 'Produk & Jasa';
      case 'transactions': return 'Riwayat Transaksi';
      case 'finance': return 'Laporan Keuangan';
      case 'customers': return 'Database Pelanggan';
      case 'mechanics': return 'Manajemen Mekanik';
      default: return 'MotoFix';
    }
  };

  const getIcon = () => {
    switch (activeTab) {
      case 'dashboard': return <LayoutDashboard className="text-brand-orange" size={24} />;
      case 'inventory': return <Package className="text-brand-orange" size={24} />;
      case 'transactions': return <Receipt className="text-brand-orange" size={24} />;
      case 'finance': return <Wallet className="text-brand-orange" size={24} />;
      case 'customers': return <Users className="text-brand-orange" size={24} />;
      case 'mechanics': return <Wrench className="text-brand-orange" size={24} />;
      default: return <Activity className="text-brand-orange" size={24} />;
    }
  };

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="flex min-h-screen bg-brand-dark overflow-hidden">
      <Sidebar
        onLogout={onLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
      />

      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className="absolute inset-0 grid-bg pointer-events-none opacity-20" />

        <header className="h-16 sm:h-20 border-b border-white/5 flex items-center justify-between px-4 sm:px-8 relative z-10 bg-brand-dark/50 backdrop-blur-md sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-white lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="relative w-48 sm:w-96 group hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-brand-orange transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Cari sesuatu..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 sm:py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-orange rounded-full border-2 border-brand-dark" />
            </button>

            <div className="h-8 w-px bg-white/10 mx-1 sm:mx-2" />

            <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold text-emerald-500 uppercase tracking-wider whitespace-nowrap">System Online</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative z-10 custom-scrollbar">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                {getIcon()}
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">{getTitle()}</h2>
              </div>
              <p className="text-gray-500 text-sm font-medium">
                {activeTab === 'dashboard' ? `Selamat datang kembali, ${user?.name || 'Admin'}.` : `Kelola ${getTitle().toLowerCase()} Anda.`}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 self-start sm:self-auto">
              <p className="text-xs sm:text-sm font-mono text-gray-400">{todayStr}</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <Dashboard user={user} />}
              {activeTab === 'inventory' && <Inventory user={user} />}
              {activeTab === 'transactions' && <Transactions user={user} />}
              {activeTab === 'finance' && <Finance user={user} />}
              {activeTab === 'customers' && <Customers user={user} />}
              {activeTab === 'mechanics' && <Mechanics user={user} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
