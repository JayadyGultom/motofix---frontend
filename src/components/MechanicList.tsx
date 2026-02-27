import React, { useState, useEffect } from 'react';
import { Search, Plus, Wrench, Phone, Award, Briefcase, TrendingUp } from 'lucide-react';
import { Mechanic } from '../types';

export default function MechanicList() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMechanics();
  }, []);

  const fetchMechanics = async () => {
    try {
      const res = await fetch('/api/mechanics');
      const data = await res.json();
      setMechanics(data);
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
            placeholder="Cari nama mekanik..."
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 w-full"
          />
        </div>
        <button className="btn-primary flex items-center gap-2 justify-center">
          <Plus size={18} />
          <span>Tambah Mekanik</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mechanics.map((m) => (
          <div key={m.id} className="glass-card p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600">
                  <Wrench size={28} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Komisi</p>
                  <p className="text-lg font-black text-indigo-600">{m.commission_rate}%</p>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-1">{m.name}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <Phone size={14} />
                <span>{m.phone}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Briefcase size={12} />
                    <span className="text-[10px] font-bold uppercase">Pekerjaan</span>
                  </div>
                  <p className="text-lg font-bold text-slate-800">42</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <TrendingUp size={12} />
                    <span className="text-[10px] font-bold uppercase">Rating</span>
                  </div>
                  <p className="text-lg font-bold text-slate-800">4.9</p>
                </div>
              </div>

              <button className="w-full mt-6 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
                Lihat Detail Performa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
