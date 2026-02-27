import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Phone, Calendar, Mail, Loader2, Edit2, Trash2, Save } from 'lucide-react';
import { api } from '../lib/api';
import { Customer } from '../types';
import { Modal } from './Modal';
import { usePermission } from '../hooks/usePermission';

export const Customers: React.FC<{ user: any }> = ({ user }) => {
  const { getActionWarning } = usePermission(user);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    status: 'Active'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.get<Customer[]>('/customers');
      setCustomers(data || []);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    const warning = getActionWarning('customer');
    if (warning) {
      alert(warning);
      return;
    }
    setModalMode('add');
    setSelectedCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    const warning = getActionWarning('customer');
    if (warning) {
      alert(warning);
      return;
    }
    setModalMode('edit');
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      status: customer.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        await api.post('/customers', formData);
      } else {
        await api.put(`/customers/${selectedCustomer?.id}`, formData);
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      alert('Gagal menyimpan pelanggan: ' + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const warning = getActionWarning('customer');
    if (warning) {
      alert(warning);
      return;
    }
    if (!confirm('Yakin ingin menghapus pelanggan ini?')) return;
    try {
      await api.delete(`/customers/${id}`);
      await fetchData();
    } catch (err) {
      alert('Gagal menghapus pelanggan');
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-orange transition-colors" size={18} />
          <input
            type="text"
            placeholder="Cari pelanggan (nama atau telepon)..."
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
          <span>Tambah Pelanggan</span>
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4">
          <Loader2 className="text-brand-orange animate-spin" size={40} />
          <p className="text-gray-500 font-medium">Memuat data pelanggan...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-brand-card border border-white/5 rounded-3xl p-6 group hover:border-brand-orange/30 transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange border border-brand-orange/20">
                    <span className="text-lg font-bold">{customer.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-brand-orange transition-colors">{customer.name}</h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mt-1 ${customer.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                      }`}>
                      {customer.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <Phone size={14} />
                  </div>
                  <span className="text-sm">{customer.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <Mail size={14} />
                  </div>
                  <span className="text-sm truncate">{customer.email || 'Email belum diatur'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <Calendar size={14} />
                  </div>
                  <span className="text-sm">Terdaftar: {new Date(customer.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${modalMode === 'add' ? 'Tambah' : 'Edit'} Pelanggan`}
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
              placeholder="Contoh: Budi Santoso"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nomor Telepon / WhatsApp</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all"
              placeholder="Contoh: 08123456789"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Alamat Email (Opsional)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all"
              placeholder="budi@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Alamat Lengkap (Opsional)</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all resize-none"
              placeholder="Alamat rumah pelanggan..."
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-4 bg-brand-orange text-white rounded-2xl font-bold hover:bg-brand-orange/90 transition-all shadow-lg shadow-brand-orange/20 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              <span>{modalMode === 'add' ? 'Simpan Pelanggan' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
