import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, Loader2, Package, Wrench, Save } from 'lucide-react';
import { api } from '../lib/api';
import { Product, Service } from '../types';
import { Modal } from './Modal';
import { usePermission } from '../hooks/usePermission';

export const Inventory: React.FC<{ user: any }> = ({ user }) => {
  const { getActionWarning } = usePermission(user);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [itemType, setItemType] = useState<'product' | 'service'>('product');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category_id: 1, // Default or fetch Categories
    stock: 0,
    min_stock: 5,
    buy_price: 0,
    sell_price: 0,
    price: 0 // for service
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pData, sData] = await Promise.all([
        api.get<Product[]>('/products'),
        api.get<Service[]>('/services')
      ]);
      setProducts(pData || []);
      setServices(sData || []);
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = (type: 'product' | 'service') => {
    const warning = getActionWarning('inventory');
    if (warning) {
      alert(warning);
      return;
    }
    setModalMode('add');
    setItemType(type);
    setSelectedItem(null);
    setFormData({
      name: '',
      category_id: 1,
      stock: 0,
      min_stock: 5,
      buy_price: 0,
      sell_price: 0,
      price: 0
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: any, type: 'product' | 'service') => {
    const warning = getActionWarning('inventory');
    if (warning) {
      alert(warning);
      return;
    }
    setModalMode('edit');
    setItemType(type);
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category_id: item.category_id || 1,
      stock: item.stock || 0,
      min_stock: item.min_stock || 0,
      buy_price: item.buy_price || 0,
      sell_price: item.sell_price || 0,
      price: item.price || 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = itemType === 'product' ? '/products' : '/services';
      if (modalMode === 'add') {
        await api.post(endpoint, formData);
      } else {
        await api.put(`${endpoint}/${selectedItem.id}`, formData);
      }
      await fetchData(); // Refresh data
      setIsModalOpen(false);
    } catch (err) {
      alert('Gagal menyimpan data: ' + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, type: 'product' | 'service') => {
    const warning = getActionWarning('inventory');
    if (warning) {
      alert(warning);
      return;
    }
    if (!confirm('Yakin ingin menghapus item ini?')) return;
    try {
      const endpoint = type === 'product' ? '/products' : '/services';
      await api.delete(`${endpoint}/${id}`);
      await fetchData();
    } catch (err) {
      alert('Gagal menghapus data');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const filteredItems = [
    ...products.map(p => ({ ...p, type: 'product' })),
    ...services.map(s => ({ ...s, type: 'service' }))
  ].filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-orange transition-colors" size={18} />
          <input
            type="text"
            placeholder="Cari produk atau jasa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-card border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-brand-card border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => handleAdd('product')}
              className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-lg text-sm font-bold text-white transition-all"
            >
              <Package size={16} className="text-blue-500" />
              <span>+ Produk</span>
            </button>
            <div className="w-px bg-white/10 self-stretch my-1" />
            <button
              onClick={() => handleAdd('service')}
              className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-lg text-sm font-bold text-white transition-all"
            >
              <Wrench size={16} className="text-emerald-500" />
              <span>+ Jasa</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-brand-card border border-white/5 rounded-3xl overflow-hidden overflow-x-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="text-brand-orange animate-spin" size={40} />
            <p className="text-gray-500 font-medium">Memuat data inventory...</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Produk / Jasa</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Stok</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Harga Jual</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map((item: any) => (
                <tr key={`${item.type}-${item.id}`} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.type === 'product' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {item.type === 'product' ? <Package size={16} /> : <Wrench size={16} />}
                      </div>
                      <span className="text-sm font-medium text-white group-hover:text-brand-orange transition-colors">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-md">
                      {item.type === 'product' ? item.category_name : 'Jasa Layanan'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-mono ${item.type === 'service' ? 'text-gray-600' : item.stock < item.min_stock ? 'text-red-500 font-bold' : 'text-gray-300'}`}>
                      {item.type === 'product' ? item.stock : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-white">
                      {formatCurrency(item.type === 'product' ? item.sell_price : item.price)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.type === 'product' && item.stock < item.min_stock ? 'bg-red-500/10 text-red-500' :
                      item.type === 'service' ? 'bg-emerald-500/10 text-emerald-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                      {item.type === 'product' && item.stock < item.min_stock ? 'Low Stock' :
                        item.type === 'service' ? 'Service Active' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item, item.type)}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.type)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${modalMode === 'add' ? 'Tambah' : 'Edit'} ${itemType === 'product' ? 'Produk' : 'Jasa'}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nama {itemType === 'product' ? 'Produk' : 'Jasa'}</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all"
              placeholder={`Contoh: ${itemType === 'product' ? 'Oli Motul' : 'Service CVT'}`}
            />
          </div>

          {itemType === 'product' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Stok Saat Ini</label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Min. Stok (Alert)</label>
                <input
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {itemType === 'product' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Harga Beli</label>
                  <input
                    type="number"
                    required
                    value={formData.buy_price}
                    onChange={(e) => setFormData({ ...formData, buy_price: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Harga Jual</label>
                  <input
                    type="number"
                    required
                    value={formData.sell_price}
                    onChange={(e) => setFormData({ ...formData, sell_price: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all"
                  />
                </div>
              </>
            ) : (
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Biaya Jasa</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all"
                />
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-4 bg-brand-orange text-white rounded-2xl font-bold hover:bg-brand-orange/90 transition-all shadow-lg shadow-brand-orange/20 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              <span>{modalMode === 'add' ? 'Simpan Item' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
