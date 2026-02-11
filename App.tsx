
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, Search, ShoppingCart, X, Plus, 
  Trash2, Settings, CheckCircle2, 
  MapPin, MessageCircle, Save, Minus, ChevronRight
} from 'lucide-react';
import { Product, CartItem, CustomerInfo } from './types';
import { STORE_NAME, WHATSAPP_NUMBER, CATEGORIES, INITIAL_PRODUCTS } from './constants';

const TRANSLATIONS = {
  en: {
    slogan: "Pure Food, Fast Delivery",
    searchPlaceholder: "Search fresh items...",
    all: "All Products",
    cartTitle: "Your Basket",
    deliveryTitle: "Delivery Details",
    placeOrder: "Order on WhatsApp",
    checkout: "Checkout Now",
    mubarak: "Order Sent!",
    redirecting: "Opening WhatsApp...",
    adminTitle: "Store Manager",
    addLocation: "Get My Location",
    locationCaptured: "Location Locked ✓",
    total: "Total Bill",
    empty: "Your basket is empty",
  },
  ur: {
    slogan: "ٹی ڈی آر ہے تو ٹائم اور پیسے کیوں برباد کریں",
    searchPlaceholder: "اشیاء تلاش کریں...",
    all: "تمام اشیاء",
    cartTitle: "آپ کی ٹوکری",
    deliveryTitle: "ڈیلیوری کی تفصیلات",
    placeOrder: "واٹس ایپ پر آرڈر دیں",
    checkout: "چیک آؤٹ کریں",
    mubarak: "آرڈر بھیج دیا گیا!",
    redirecting: "واٹس ایپ کھل رہا ہے...",
    adminTitle: "دکان مینیجر",
    addLocation: "لوکیشن معلوم کریں",
    locationCaptured: "لوکیشن مل گئی ہے ✓",
    total: "کل رقم",
    empty: "آپ کی ٹوکری خالی ہے",
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'ur'>('ur');
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('tdr_products_v2');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'details' | 'success'>('idle');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: '', phone: '', address: '', location: null });
  const [isLocating, setIsLocating] = useState(false);
  const [newP, setNewP] = useState({ name: '', price: '', unit: '', category: CATEGORIES[0].en, image: '' });

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    localStorage.setItem('tdr_products_v2', JSON.stringify(products));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const getLoc = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomerInfo(prev => ({ ...prev, location: { lat: pos.coords.latitude, lng: pos.coords.longitude } }));
        setIsLocating(false);
      },
      () => { alert("Please enable GPS for accurate delivery"); setIsLocating(false); }
    );
  };

  const handleConfirmOrder = () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert("Please fill all delivery details");
      return;
    }
    let msg = `*NEW ORDER - ${STORE_NAME}*\n\n👤 *Customer:* ${customerInfo.name}\n📞 *Phone:* ${customerInfo.phone}\n📍 *Address:* ${customerInfo.address}\n`;
    if (customerInfo.location) msg += `🗺️ *GPS:* https://www.google.com/maps?q=${customerInfo.location.lat},${customerInfo.location.lng}\n`;
    msg += `\n🛒 *Items:*\n`;
    cart.forEach((i) => msg += `• ${i.name} (${i.unit}) x ${i.quantity} = Rs. ${i.price * i.quantity}\n`);
    msg += `\n💰 *Grand Total: Rs. ${cartTotal}*`;
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    setCart([]); setCheckoutStep('success');
    setTimeout(() => { setIsCartOpen(false); setCheckoutStep('idle'); }, 4000);
  };

  const addNewProduct = () => {
    if(!newP.name || !newP.price) return alert("Fill all details");
    const productToAdd: Product = {
      id: Date.now().toString(),
      name: newP.name,
      category: newP.category,
      price: Number(newP.price),
      unit: newP.unit || '1kg',
      image: newP.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop',
      inStock: true
    };
    setProducts([productToAdd, ...products]);
    setNewP({ name: '', price: '', unit: '', category: CATEGORIES[0].en, image: '' });
  };

  return (
    <div className={`min-h-screen bg-[#F8FAF9] flex flex-col ${lang === 'ur' ? 'font-urdu' : ''}`}>
      {/* Premium Navbar */}
      <nav className="sticky top-0 z-50 bg-emerald-600 text-white shadow-xl px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className={`flex items-center gap-3 ${lang === 'ur' ? 'flex-row-reverse text-right' : ''}`}>
            <div className="bg-white p-2.5 rounded-2xl shadow-inner">
              <ShoppingBag className="text-emerald-600 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">{STORE_NAME}</h1>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{t.slogan}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setLang(lang === 'en' ? 'ur' : 'en')} 
              className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold border border-white/20 hover:bg-white/20 transition-all"
            >
              {lang === 'en' ? 'اردو' : 'English'}
            </button>
            <button 
              onClick={() => setIsAdminOpen(true)} 
              className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
            >
              <Settings size={20}/>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Search */}
        <div className="relative mb-8 group">
          <input 
            type="text" 
            placeholder={t.searchPlaceholder} 
            className={`w-full py-5 pl-14 pr-6 rounded-[28px] outline-none shadow-lg border-none text-md bg-white transition-all group-focus-within:ring-4 ring-emerald-500/10 ${lang === 'ur' ? 'text-right' : ''}`}
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
          <Search className={`absolute ${lang === 'ur' ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-emerald-600`} size={22} />
        </div>

        {/* Categories Scroller */}
        <div className={`flex gap-3 overflow-x-auto pb-6 hide-scrollbar ${lang === 'ur' ? 'flex-row-reverse' : ''}`}>
          <button 
            onClick={() => setSelectedCategory('All')} 
            className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shrink-0 transition-all ${selectedCategory === 'All' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-gray-400 hover:text-emerald-600 shadow-sm'}`}
          >
            {t.all}
          </button>
          {CATEGORIES.map(c => (
            <button 
              key={c.en} 
              onClick={() => setSelectedCategory(c.en)} 
              className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shrink-0 transition-all ${selectedCategory === c.en ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-gray-400 hover:text-emerald-600 shadow-sm'}`}
            >
              {lang === 'en' ? c.en : c.ur}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 animate-fade-in">
          {filteredProducts.map(p => (
            <div key={p.id} className="product-card bg-white rounded-[32px] overflow-hidden border border-gray-100 flex flex-col shadow-sm">
              <div className="aspect-square relative overflow-hidden bg-gray-50">
                <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">
                  <span className="text-[10px] font-black text-emerald-700">{p.unit}</span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className={`font-bold text-gray-800 text-sm mb-3 line-clamp-2 min-h-[40px] leading-tight ${lang === 'ur' ? 'text-right' : ''}`}>{p.name}</h3>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-lg font-black text-emerald-600">Rs. {p.price}</span>
                  <button 
                    onClick={() => addToCart(p)} 
                    className="bg-amber-500 text-white p-2.5 rounded-xl shadow-md hover:bg-amber-600 active:scale-95 transition-all"
                  >
                    <Plus size={20} strokeWidth={3}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-emerald-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 hover:bg-emerald-700 transition-all animate-bounce-slow"
        >
          <div className="relative">
            <ShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 bg-amber-500 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-emerald-600">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          </div>
          <span className="font-black text-sm uppercase tracking-widest">Rs. {cartTotal}</span>
          <ChevronRight size={20} />
        </button>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in rounded-l-[40px]">
            <div className="p-6 bg-emerald-600 text-white flex justify-between items-center rounded-tl-[40px]">
              <h2 className="text-2xl font-black tracking-tight">{checkoutStep === 'idle' ? t.cartTitle : t.deliveryTitle}</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl"><X/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {checkoutStep === 'idle' ? (
                cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center opacity-30"><ShoppingBag size={80}/><p className="mt-4 font-bold uppercase">{t.empty}</p></div> :
                cart.map((item) => (
                  <div key={item.id} className="bg-gray-50 p-4 rounded-3xl flex gap-4 items-center border border-gray-100">
                    <img src={item.image} className="w-16 h-16 rounded-2xl object-cover" alt={item.name} />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-800 leading-tight">{item.name}</h4>
                      <p className="text-xs text-emerald-600 font-bold mt-1">Rs. {item.price}</p>
                    </div>
                    <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-gray-400 hover:text-emerald-600"><Minus size={16}/></button>
                      <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-gray-400 hover:text-emerald-600"><Plus size={16}/></button>
                    </div>
                    <button onClick={() => setCart(cart.filter(x => x.id !== item.id))} className="text-red-300 hover:text-red-500 transition-colors p-2"><Trash2 size={18}/></button>
                  </div>
                ))
              ) : checkoutStep === 'details' ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Full Name / پورا نام</label>
                    <input placeholder="Enter name" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 ring-emerald-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Phone / فون نمبر</label>
                    <input placeholder="03xx xxxxxxx" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 ring-emerald-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Address / گھر کا پتہ</label>
                    <textarea placeholder="House#, Street, Area" rows={3} value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 ring-emerald-500 resize-none" />
                  </div>
                  <button onClick={getLoc} className={`w-full py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all ${customerInfo.location ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                    {isLocating ? 'Finding...' : customerInfo.location ? t.locationCaptured : t.addLocation} <MapPin size={18}/>
                  </button>
                </div>
              ) : (
                <div className="text-center py-20 animate-fade-in">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} className="text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-black mb-2">{t.mubarak}</h2>
                  <p className="text-gray-400 font-medium">{t.redirecting}</p>
                </div>
              )}
            </div>

            {checkoutStep !== 'success' && cart.length > 0 && (
              <div className="p-8 border-t bg-gray-50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-400 font-black text-xs uppercase tracking-widest">{t.total}</span>
                  <span className="text-3xl font-black text-emerald-800">Rs. {cartTotal}</span>
                </div>
                <button 
                  onClick={() => checkoutStep === 'idle' ? setCheckoutStep('details') : handleConfirmOrder()}
                  className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black uppercase text-xs shadow-xl hover:bg-emerald-700 active:scale-95 transition-all"
                >
                  {checkoutStep === 'idle' ? t.checkout : t.placeOrder}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAdminOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black italic">{t.adminTitle}</h2>
              <button onClick={() => setIsAdminOpen(false)} className="p-2 bg-gray-100 rounded-xl"><X/></button>
            </div>
            
            <div className="bg-emerald-50 p-6 rounded-3xl mb-8">
              <h3 className="font-black text-emerald-800 mb-4 text-xs uppercase">Stock Update</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="Item Name" value={newP.name} onChange={e => setNewP({...newP, name: e.target.value})} className="p-4 rounded-xl border-none shadow-sm focus:ring-2 ring-emerald-500" />
                <input placeholder="Price (PKR)" type="number" value={newP.price} onChange={e => setNewP({...newP, price: e.target.value})} className="p-4 rounded-xl border-none shadow-sm focus:ring-2 ring-emerald-500" />
                <input placeholder="Unit (e.g. 1kg)" value={newP.unit} onChange={e => setNewP({...newP, unit: e.target.value})} className="p-4 rounded-xl border-none shadow-sm focus:ring-2 ring-emerald-500" />
                <select value={newP.category} onChange={e => setNewP({...newP, category: e.target.value})} className="p-4 rounded-xl border-none shadow-sm focus:ring-2 ring-emerald-500 text-gray-500">
                  {CATEGORIES.map(c => <option key={c.en} value={c.en}>{c.en}</option>)}
                </select>
                <input placeholder="Image URL (Unsplash)" value={newP.image} onChange={e => setNewP({...newP, image: e.target.value})} className="p-4 rounded-xl border-none shadow-sm focus:ring-2 ring-emerald-500 md:col-span-2" />
                <button onClick={addNewProduct} className="md:col-span-2 bg-emerald-600 text-white py-4 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-emerald-700">
                  <Save size={18}/> Update Stock
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-black text-gray-300 text-[10px] uppercase ml-2 tracking-widest">Available Inventory</h4>
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <img src={p.image} className="w-12 h-12 rounded-xl object-cover" alt={p.name} />
                    <div>
                      <h4 className="font-bold text-sm text-gray-800 leading-tight">{p.name}</h4>
                      <p className="text-[10px] font-black text-emerald-600">Rs. {p.price} / {p.unit}</p>
                    </div>
                  </div>
                  <button onClick={() => setProducts(products.filter((x) => x.id !== p.id))} className="p-2 text-red-200 hover:text-red-500"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
