import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, X, Loader2, Package, Wrench, ChevronRight, User, UserPlus, Save } from 'lucide-react';
import { api } from '../lib/api';
import { Product, Service, Customer, Mechanic } from '../types';
import { Modal } from './Modal';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface SelectedItem {
    id: number;
    type: 'product' | 'service';
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Data for selection
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [mechanics, setMechanics] = useState<Mechanic[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    // Selection state
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [selectedMechanicId, setSelectedMechanicId] = useState<number | null>(null);
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    // Search state
    const [customerSearch, setCustomerSearch] = useState('');
    const [mechanicSearch, setMechanicSearch] = useState('');
    const [itemSearch, setItemSearch] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cData, mData, pData, sData] = await Promise.all([
                api.get<Customer[]>('/customers'),
                api.get<Mechanic[]>('/mechanics'),
                api.get<Product[]>('/products'),
                api.get<Service[]>('/services')
            ]);
            setCustomers(cData || []);
            setMechanics(mData || []);
            setProducts(pData || []);
            setServices(sData || []);
        } catch (err) {
            console.error('Failed to fetch transaction resources', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchData();
            // Reset state
            setSelectedCustomerId(null);
            setSelectedMechanicId(null);
            setSelectedItems([]);
            setDiscount(0);
            setPaymentMethod('Cash');
        }
    }, [isOpen]);

    const subtotal = selectedItems.reduce((acc, item) => acc + item.subtotal, 0);
    const total = subtotal - discount;

    const addItem = (item: Product | Service, type: 'product' | 'service') => {
        const existing = selectedItems.find(i => i.id === item.id && i.type === type);
        if (existing) {
            updateQuantity(item.id, type, existing.quantity + 1);
        } else {
            const price = type === 'product' ? (item as Product).sell_price : (item as Service).price;
            setSelectedItems([...selectedItems, {
                id: item.id,
                type,
                name: item.name,
                price,
                quantity: 1,
                subtotal: price
            }]);
        }
        setItemSearch('');
    };

    const updateQuantity = (id: number, type: 'product' | 'service', qty: number) => {
        if (qty < 1) return;
        setSelectedItems(selectedItems.map(item => {
            if (item.id === id && item.type === type) {
                return { ...item, quantity: qty, subtotal: item.price * qty };
            }
            return item;
        }));
    };

    const removeItem = (id: number, type: 'product' | 'service') => {
        setSelectedItems(selectedItems.filter(item => !(item.id === id && item.type === type)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItems.length === 0) {
            alert('Pilih setidaknya satu item');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                customer_id: selectedCustomerId,
                mechanic_id: selectedMechanicId,
                items: selectedItems.map(item => ({
                    id: item.id,
                    type: item.type,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.subtotal
                })),
                total_amount: total,
                discount: discount,
                payment_method: paymentMethod
            };

            await api.post('/transactions', payload);
            onSuccess();
            onClose();
        } catch (err) {
            alert('Gagal membuat transaksi: ' + (err as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredItems = [
        ...products.map(p => ({ ...p, type: 'product' as const })),
        ...services.map(s => ({ ...s, type: 'service' as const }))
    ].filter(item =>
        item.name.toLowerCase().includes(itemSearch.toLowerCase()) &&
        !selectedItems.some(si => si.id === item.id && si.type === item.type)
    ).slice(0, 5);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase())
    ).slice(0, 5);

    const filteredMechanics = mechanics.filter(m =>
        m.name.toLowerCase().includes(mechanicSearch.toLowerCase())
    ).slice(0, 5);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Buat Transaksi Baru"
            maxWidth="max-w-4xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Section: Pelanggan & Mekanik */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pelanggan</label>
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Cari pelanggan..."
                                    value={selectedCustomerId ? customers.find(c => c.id === selectedCustomerId)?.name : customerSearch}
                                    onChange={(e) => {
                                        setCustomerSearch(e.target.value);
                                        if (selectedCustomerId) setSelectedCustomerId(null);
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-orange/50"
                                />
                                {!selectedCustomerId && customerSearch && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-brand-card border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
                                        {filteredCustomers.map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCustomerId(c.id);
                                                    setCustomerSearch('');
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left border-b border-white/5 last:border-0"
                                            >
                                                <User size={16} className="text-brand-orange" />
                                                <div>
                                                    <p className="text-sm font-bold text-white">{c.name}</p>
                                                    <p className="text-[10px] text-gray-500">{c.phone}</p>
                                                </div>
                                            </button>
                                        ))}
                                        {filteredCustomers.length === 0 && (
                                            <div className="p-4 text-center text-gray-500 text-xs">Pelanggan tidak ditemukan</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mekanik</label>
                            <div className="relative group">
                                <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Cari mekanik..."
                                    value={selectedMechanicId ? mechanics.find(m => m.id === selectedMechanicId)?.name : mechanicSearch}
                                    onChange={(e) => {
                                        setMechanicSearch(e.target.value);
                                        if (selectedMechanicId) setSelectedMechanicId(null);
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-orange/50"
                                />
                                {!selectedMechanicId && mechanicSearch && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-brand-card border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
                                        {filteredMechanics.map(m => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedMechanicId(m.id);
                                                    setMechanicSearch('');
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left border-b border-white/5 last:border-0"
                                            >
                                                <div className="p-1.5 bg-brand-orange/10 rounded-lg">
                                                    <Wrench size={14} className="text-brand-orange" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{m.name}</p>
                                                    <p className="text-[10px] text-gray-500">{m.specialty}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section: Tambah Item */}
                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cari Produk atau Jasa</label>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="text"
                                placeholder="Ketik nama produk/jasa..."
                                value={itemSearch}
                                onChange={(e) => setItemSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-orange/50"
                            />
                            {itemSearch && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-brand-card border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
                                    {filteredItems.map(item => (
                                        <button
                                            key={`${item.type}-${item.id}`}
                                            type="button"
                                            onClick={() => addItem(item, item.type)}
                                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 text-left border-b border-white/5 last:border-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${item.type === 'product' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                    {item.type === 'product' ? <Package size={14} /> : <Wrench size={14} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{item.name}</p>
                                                    <p className="text-[10px] text-gray-500">{item.type === 'product' ? `Stok: ${(item as Product).stock}` : 'Jasa'}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-brand-orange">{formatCurrency(item.type === 'product' ? (item as Product).sell_price : (item as Service).price)}</span>
                                        </button>
                                    ))}
                                    {filteredItems.length === 0 && (
                                        <div className="p-4 text-center text-gray-500 text-xs">Tidak ada hasil yang cocok</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section: Daftar Item Terpilih */}
                <div className="mt-8">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Daftar Item</label>
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/10">
                                    <th className="px-6 py-3">Item</th>
                                    <th className="px-6 py-3 text-center">Harga</th>
                                    <th className="px-6 py-3 text-center">Qty</th>
                                    <th className="px-6 py-3 text-right">Subtotal</th>
                                    <th className="px-6 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {selectedItems.map(item => (
                                    <tr key={`${item.type}-${item.id}`} className="text-sm">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${item.type === 'product' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                    {item.type === 'product' ? <Package size={14} /> : <Wrench size={14} />}
                                                </div>
                                                <span className="font-bold text-white">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-400">
                                            {formatCurrency(item.price)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-white">
                                            {formatCurrency(item.subtotal)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.id, item.type)}
                                                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {selectedItems.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">Belum ada item yang ditambahkan</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section: Ringkasan & Pembayaran */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/10">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Metode Pembayaran</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all font-bold"
                            >
                                <option value="Cash">Tunai (Cash)</option>
                                <option value="Transfer">Transfer Bank</option>
                                <option value="Debit">Kartu Debit</option>
                                <option value="QRIS">QRIS / E-Wallet</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Diskon (IDR)</label>
                            <input
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-orange/50 transition-all font-bold"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-3">
                        <div className="flex justify-between items-center text-gray-500">
                            <span className="text-sm">Subtotal</span>
                            <span className="text-sm font-mono font-bold">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-red-500">
                            <span className="text-sm">Diskon</span>
                            <span className="text-sm font-mono font-bold">-{formatCurrency(discount)}</span>
                        </div>
                        <div className="h-px bg-white/10 my-2" />
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-white tracking-tight uppercase">Total Akhir</span>
                            <span className="text-2xl font-bold text-brand-orange font-mono tracking-tighter">{formatCurrency(total)}</span>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || selectedItems.length === 0}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-brand-orange text-white rounded-2xl font-bold hover:bg-brand-orange/90 transition-all shadow-lg shadow-brand-orange/20 disabled:opacity-50 mt-4 group"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                            <span className="uppercase tracking-widest text-xs">Simpan Transaksi & Cetak Struk</span>
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};
