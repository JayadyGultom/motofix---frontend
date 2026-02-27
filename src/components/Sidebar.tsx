import React from 'react';
import {
  LayoutDashboard,
  Package,
  Receipt,
  Wallet,
  Users,
  Wrench,
  LogOut,
  X
} from 'lucide-react';
import { Logo } from './Logo';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active
        ? "bg-brand-orange/10 text-brand-orange border border-brand-orange/20 shadow-[0_0_15px_rgba(242,125,38,0.1)]"
        : "text-gray-400 hover:text-white hover:bg-white/5"
    )}
  >
    <div className={cn(
      "transition-colors",
      active ? "text-brand-orange" : "text-gray-500 group-hover:text-gray-300"
    )}>
      {icon}
    </div>
    <span className="font-medium text-sm">{label}</span>
  </button>
);

interface SidebarProps {
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onLogout,
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  user
}) => {
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'AD';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-brand-dark border-r border-white/5 flex flex-col p-6 z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-12">
          <Logo />
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => { setActiveTab('dashboard'); onClose(); }}
          />
          <SidebarItem
            icon={<Package size={20} />}
            label="Produk & Jasa"
            active={activeTab === 'inventory'}
            onClick={() => { setActiveTab('inventory'); onClose(); }}
          />
          <SidebarItem
            icon={<Receipt size={20} />}
            label="Transaksi"
            active={activeTab === 'transactions'}
            onClick={() => { setActiveTab('transactions'); onClose(); }}
          />
          <SidebarItem
            icon={<Wallet size={20} />}
            label="Keuangan"
            active={activeTab === 'finance'}
            onClick={() => { setActiveTab('finance'); onClose(); }}
          />
          <SidebarItem
            icon={<Users size={20} />}
            label="Pelanggan"
            active={activeTab === 'customers'}
            onClick={() => { setActiveTab('customers'); onClose(); }}
          />
          <SidebarItem
            icon={<Wrench size={20} />}
            label="Mekanik"
            active={activeTab === 'mechanics'}
            onClick={() => { setActiveTab('mechanics'); onClose(); }}
          />
        </nav>

        <div className="mt-auto pt-6 space-y-6">
          <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center text-brand-orange font-bold text-xs border border-brand-orange/30 shrink-0">
              {getInitials(user?.name || 'Admin')}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider truncate">{user?.role || 'User'}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:text-red-400 transition-colors group"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
