import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Star, Award, Clock as ClockIcon, TrendingUp, Loader2, Save, Trash2, Edit2 } from 'lucide-react';
import { api } from '../lib/api';
import { Mechanic } from '../types';
import { Modal } from './Modal';
import { usePermission } from '../hooks/usePermission';

export const Mechanics: React.FC<{ user: any }> = ({ user }) => {
  const { getActionWarning } = usePermission(user);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialty: '',
    role: 'Mekanik',
    commission_rate: 10,
    status: 'Active'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.get<Mechanic[]>('/mechanics');
      setMechanics(data || []);
    } catch (err) {
      console.error('Failed to fetch mechanics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    const warning = getActionWarning('mechanic');
    if (warning) {
      alert(warning);
      return;
    }
    setModalMode('add');
    setSelectedMechanic(null);
    setFormData({
      name: '',
      phone: '',
      specialty: '',
      role: 'Mekanik',
      commission_rate: 10,
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (mechanic: Mechanic) => {
    const warning = getActionWarning('mechanic');
    if (warning) {
      alert(warning);
      return;
    }
    setModalMode('edit');
    setSelectedMechanic(mechanic);
    setFormData({
      name: mechanic.name,
      phone: mechanic.phone || '',
      specialty: mechanic.specialty,
      role: mechanic.role || 'Mekanik',
      commission_rate: mechanic.commission_rate,
      status: mechanic.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        await api.post('/mechanics', formData);
      } else {
        await api.put(`/mechanics/${selectedMechanic?.id}`, formData);
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      alert('Gagal menyimpan mekanik: ' + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const warning = getActionWarning('mechanic');
    if (warning) {
      alert(warning);
      return;
    }
    if (!confirm('Yakin ingin menghapus mekanik ini?')) return;
    try {
      await api.delete(`/mechanics/${id}`);
      await fetchData();
    } catch (err) {
      alert('Gagal menghapus mekanik');
    }
  };

  const filteredMechanics = mechanics.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-orange transition-colors" size={18} />
          <input
            type="text"
            placeholder="Cari nama mekanik..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-card border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all"
          />
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl text-sm font-bold hover:bg-brand-orange/90 transition-all shadow-lg shadow-brand-orange/20"
        >
          <UserPlus size={18} />
          <span>Tambah Mekanik</span>
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4">
          <Loader2 className="text-brand-orange animate-spin" size={40} />
          <p className="text-gray-500 font-medium">Memuat data mekanik...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredMechanics.map((mechanic) => (
            <div key={mechanic.id} className="bg-brand-card border border-white/5 rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 group hover:border-brand-orange/30 transition-all duration-300">
              <div className="relative self-center sm:self-start">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center text-gray-500 shrink-0">
                  <span className="text-3xl font-bold">{mechanic.name.charAt(0)}</span>
                </div>
                <div className={`absolute -bottom-2 -right-2 px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wider border ${mechanic.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                  }`}>
                  {mechanic.status}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-brand-orange transition-colors">{mechanic.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">{mechanic.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(mechanic)}
                      className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(mechanic.id)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1 text-brand-orange">
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm font-bold">{mechanic.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Award size={14} />
                    <span className="text-xs">{mechanic.specialty}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <ClockIcon size={14} className="text-gray-500" />
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Kerja</p>
                      <p className="text-sm font-bold text-white">{mechanic.total_jobs} Order</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-brand-orange/10 text-brand-orange rounded-lg">
                      <TrendingUp size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Komisi</p>
                      <p className="text-sm font-bold text-white">{mechanic.commission_rate}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${modalMode === 'add' ? 'Tambah' : 'Edit'} Mekanik`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all"
              placeholder="Contoh: Ahmad Subardjo"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Spesialisasi</label>
            <input
              type="text"
              required
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all"
              placeholder="Contoh: Mesin 4-Tak, Kelistrikan"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Komisi (%)</label>
              <input
                type="number"
                required
                value={formData.commission_rate}
                onChange={(e) => setFormData({ ...formData, commission_rate: parseInt(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-4 bg-brand-orange text-white rounded-2xl font-bold hover:bg-brand-orange/90 transition-all shadow-lg shadow-brand-orange/20 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              <span>{modalMode === 'add' ? 'Simpan Mekanik' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
