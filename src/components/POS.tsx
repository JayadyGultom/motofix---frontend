import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Minus, Trash2, User, Wrench, CreditCard, Banknote, QrCode, Printer, CheckCircle2, ShoppingCart } from 'lucide-react';
import { Product, Service, Customer, Mechanic } from '../types';
import { useReactToPrint } from 'react-to-print';
import { api } from '../lib/api';

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);

  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [selectedMechanic, setSelectedMechanic] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discount, setDiscount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [isSuccess, setIsSuccess] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pData, sData, cData, mData] = await Promise.all([
        api.get<Product[]>('/products'),
        api.get<Service[]>('/services'),
        api.get<Customer[]>('/customers'),
        api.get<Mechanic[]>('/mechanics')
      ]);
      setProducts(pData || []);
      setServices(sData || []);
      setCustomers(cData || []);
      setMechanics(mData || []);
    } catch (err) {
      console.error('Failed to fetch data for POS', err);
    }
  };

  const addToCart = (item: any, type: 'product' | 'service') => {
    const existing = cart.find(i => i.id === item.id && i.type === type);
    if (existing) {
      if (type === 'product' && existing.quantity >= item.stock) return;
      setCart(cart.map(i => i.id === item.id && i.type === type ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price } : i));
    } else {
      setCart([...cart, {
        id: item.id,
        name: item.name,
        price: type === 'product' ? item.sell_price : item.price,
        quantity: 1,
        type,
        subtotal: type === 'product' ? item.sell_price : item.price
      }]);
    }
  };

  const updateQuantity = (id: number, type: string, delta: number) => {
    setCart(cart.map(i => {
      if (i.id === id && i.type === type) {
        const newQty = Math.max(1, i.quantity + delta);
        if (type === 'product') {
          const prod = products.find(p => p.id === id);
          if (prod && newQty > prod.stock) return i;
        }
        return { ...i, quantity: newQty, subtotal: newQty * i.price };
      }
      return i;
    }));
  };

  const removeFromCart = (id: number, type: string) => {
    setCart(cart.filter(i => !(i.id === id && i.type === type)));
  };

  const subtotal = cart.reduce((acc, curr) => acc + curr.subtotal, 0);
  const total = subtotal - discount;

  const handleCheckout = async () => {
    if (cart.length === 0 || isLoading) return;

    setIsLoading(true);
    try {
      const data = await api.post<any>('/transactions', {
        customer_id: selectedCustomer,
        mechanic_id: selectedMechanic,
        items: cart.map(i => ({
          item_type: i.type,
          item_id: i.id,
          item_name: i.name,
          quantity: i.quantity,
          price: i.price,
          subtotal: i.subtotal
        })),
        total_amount: total,
        discount,
        payment_method: paymentMethod
      });

      setLastInvoice({
        invoice_no: data.invoice_no,
        items: cart,
        total,
        discount,
        subtotal,
        customer: customers.find(c => c.id === selectedCustomer)?.name || 'Umum',
        mechanic: mechanics.find(m => m.id === selectedMechanic)?.name || '-',
        date: new Date().toLocaleString('id-ID')
      });
      setIsSuccess(true);
      setCart([]);
      setSelectedCustomer(null);
      setSelectedMechanic(null);
      setDiscount(0);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal memproses transaksi');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const filteredItems = [
    ...products.map(p => ({ ...p, type: 'product' })),
    ...services.map(s => ({ ...s, type: 'service' }))
  ].filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Product Selection */}
      <div className="lg:col-span-7 space-y-6">
        <div className="glass-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari produk atau jasa..."
              className="input-field pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-2">
          {filteredItems.map((item: any) => (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => addToCart(item, item.type)}
              disabled={item.type === 'product' && item.stock <= 0}
              className="glass-card p-4 text-left hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/10 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${item.type === 'product' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {item.type === 'product' ? <Search size={20} /> : <Wrench size={20} />}
              </div>
              <p className="text-sm font-bold text-slate-800 line-clamp-2 mb-1">{item.name}</p>
              <p className="text-xs text-slate-500 mb-2">{item.type === 'product' ? `Stok: ${item.stock}` : 'Jasa'}</p>
              <p className="text-sm font-bold text-indigo-600">
                {formatCurrency(item.type === 'product' ? item.sell_price : item.price)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-card flex flex-col h-[calc(100vh-160px)]">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Keranjang Belanja</h3>
            <div className="grid grid-cols-2 gap-4">
              <select
                className="input-field text-sm"
                value={selectedCustomer || ''}
                onChange={(e) => setSelectedCustomer(Number(e.target.value) || null)}
              >
                <option value="">Pilih Pelanggan (Umum)</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select
                className="input-field text-sm"
                value={selectedMechanic || ''}
                onChange={(e) => setSelectedMechanic(Number(e.target.value) || null)}
              >
                <option value="">Pilih Mekanik</option>
                {mechanics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <ShoppingCart size={48} strokeWidth={1} className="mb-4" />
                <p>Keranjang masih kosong</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-slate-500">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.id, item.type, -1)} className="p-1 hover:bg-white rounded-md transition-colors"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.type, 1)} className="p-1 hover:bg-white rounded-md transition-colors"><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id, item.type)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-500">Diskon</span>
                <input
                  type="number"
                  className="w-24 text-right bg-transparent border-b border-slate-200 focus:border-indigo-500 outline-none text-sm font-semibold"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                <span className="text-slate-800">Total</span>
                <span className="text-indigo-600">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Cash', icon: Banknote, label: 'Tunai' },
                { id: 'Transfer', icon: CreditCard, label: 'Transfer' },
                { id: 'QRIS', icon: QrCode, label: 'QRIS' },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${paymentMethod === method.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'}`}
                >
                  <method.icon size={18} />
                  <span className="text-[10px] font-bold uppercase">{method.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full btn-primary py-4 text-lg font-bold shadow-lg shadow-indigo-200"
            >
              Bayar Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {isSuccess && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 text-center shadow-2xl">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Transaksi Berhasil!</h2>
            <p className="text-slate-500 mb-8">Pembayaran telah diterima dan stok telah diperbarui.</p>

            <div className="space-y-3">
              <button
                onClick={() => handlePrint()}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                Cetak Struk
              </button>
              <button
                onClick={() => setIsSuccess(false)}
                className="w-full py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>

            {/* Hidden Receipt for Printing */}
            <div className="hidden">
              <div ref={receiptRef} className="p-8 text-slate-800 font-mono text-sm">
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold uppercase">MotoMaster Pro</h1>
                  <p>Jl. Raya Bengkel No. 123</p>
                  <p>Telp: 0812-3456-7890</p>
                </div>
                <div className="border-t border-dashed border-slate-300 py-4 space-y-1">
                  <p>No: {lastInvoice?.invoice_no}</p>
                  <p>Tgl: {lastInvoice?.date}</p>
                  <p>Plg: {lastInvoice?.customer}</p>
                  <p>Mek: {lastInvoice?.mechanic}</p>
                </div>
                <div className="border-t border-dashed border-slate-300 py-4">
                  {lastInvoice?.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between mb-2">
                      <div className="flex-1">
                        <p>{item.name}</p>
                        <p className="text-xs">{item.quantity} x {formatCurrency(item.price)}</p>
                      </div>
                      <p>{formatCurrency(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dashed border-slate-300 py-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(lastInvoice?.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diskon</span>
                    <span>-{formatCurrency(lastInvoice?.discount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>TOTAL</span>
                    <span>{formatCurrency(lastInvoice?.total)}</span>
                  </div>
                </div>
                <div className="text-center mt-8">
                  <p>Terima Kasih</p>
                  <p>Selamat Berkendara!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
