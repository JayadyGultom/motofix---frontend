import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Phone, MapPin, Calendar, History } from 'lucide-react';
import { Customer } from '../types';

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama atau nomor telepon..."
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 w-full"
          />
        </div>
        <button className="btn-primary flex items-center gap-2 justify-center">
          <Plus size={18} />
          <span>Tambah Pelanggan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((c) => (
          <div key={c.id} className="glass-card p-6 hover:border-indigo-500 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                {c.name.charAt(0)}
              </div>
              <button className="text-slate-400 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors">
                <History size={18} />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1">{c.name}</h3>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Phone size={14} />
                <span>{c.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin size={14} />
                <span className="line-clamp-1">{c.address}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar size={12} />
                <span>Servis Terakhir:</span>
              </div>
              <span className="text-xs font-bold text-indigo-600">
                {c.last_service ? new Date(c.last_service).toLocaleDateString('id-ID') : 'Belum pernah'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
