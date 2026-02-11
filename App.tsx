
import React, { useState, useEffect, useMemo } from 'react';
import { 
    ShoppingBag, Search, ShoppingCart, X, Plus, 
    Trash2, Settings, CheckCircle2, 
    MapPin, MessageCircle, Save
} from 'lucide-react';
import { Product, CartItem, CustomerInfo } from './types';
import { STORE_NAME, WHATSAPP_NUMBER, CATEGORIES, INITIAL_PRODUCTS } from './constants';

const TRANSLATIONS = {
    en: {
        slogan: "Fresh Groceries, Best Prices",
        searchPlaceholder: "Search items...",
        all: "All Items",
        cartTitle: "Your Basket",
        deliveryTitle: "Delivery Details",
        placeOrder: "Order on WhatsApp",
        checkout: "Checkout Now",
        mubarak: "Order Sent!",
        redirecting: "Opening WhatsApp...",
        adminTitle: "Store Manager",
        addLocation: "Add Location",
        locationCaptured: "GPS Locked ✓",
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
        addLocation: "لوکیشن شامل کریں",
        locationCaptured: "لوکیشن مل گئی ہے ✓",
    }
};

const App: React.FC = () => {
    const [lang, setLang] = useState<'en' | 'ur'>('ur');
    const [products, setProducts] = useState<Product[]>(() => {
        const saved = localStorage.getItem('tdr_products');
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
        localStorage.setItem('tdr_products', JSON.stringify(products));
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
        setIsCartOpen(true);
    };

    const getLoc = () => {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCustomerInfo(prev => ({ ...prev, location: { lat: pos.coords.latitude, lng: pos.coords.longitude } }));
                setIsLocating(false);
            },
            () => { alert("Please turn on GPS"); setIsLocating(false); }
        );
    };

    const handleConfirmOrder = () => {
        let msg = `*NEW ORDER - ${STORE_NAME}*\n\n👤 Name: ${customerInfo.name}\n📞 Phone: ${customerInfo.phone}\n📍 Address: ${customerInfo.address}\n`;
        if (customerInfo.location) msg += `🗺️ Map: https://www.google.com/maps?q=${customerInfo.location.lat},${customerInfo.location.lng}\n`;
        msg += `\n📦 *Items:*\n`;
        cart.forEach((i) => msg += `- ${i.name} (${i.unit}) x ${i.quantity} = Rs. ${i.price * i.quantity}\n`);
        msg += `\n💰 *Total: Rs. ${cartTotal}*`;
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
            unit: newP.unit,
            image: newP.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop',
            inStock: true
        };
        setProducts([productToAdd, ...products]);
        setNewP({ name: '', price: '', unit: '', category: CATEGORIES[0].en, image: '' });
    };

    return (
        <div className={`min-h-screen bg-[#F8FAF9] flex flex-col ${lang === 'ur' ? 'font-urdu' : ''}`}>
            {/* Header */}
            <nav className="sticky top-0 z-40 bg-emerald-600 text-white shadow-lg h-20 flex items-center justify-between px-6">
                <div className={`flex items-center gap-4 ${lang === 'ur' ? 'flex-row-reverse text-right' : ''}`}>
                    <div className="bg-white p-2 rounded-xl shadow-inner"><ShoppingBag className="text-emerald-600 w-6 h-6" /></div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tight">{STORE_NAME}</h1>
                        <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{t.slogan}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setLang(lang === 'en' ? 'ur' : 'en')} className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20">{lang === 'en' ? 'اردو' : 'English'}</button>
                    <button onClick={() => setIsCartOpen(true)} className="relative bg-amber-500 p-3 rounded-xl shadow-xl hover:bg-amber-600 transition-colors">
                        <ShoppingCart size={22} />
                        {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-emerald-600 font-bold">{cart.length}</span>}
                    </button>
                    <button onClick={() => setIsAdminOpen(true)} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"><Settings size={20}/></button>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 pb-32">
                {/* Search Bar */}
                <div className="relative mb-10 max-w-2xl mx-auto group">
                    <input 
                        type="text" placeholder={t.searchPlaceholder} 
                        className={`w-full py-5 pl-14 pr-6 rounded-3xl outline-none shadow-2xl border-none text-md bg-white transition-all group-focus-within:ring-2 ring-emerald-500/20 ${lang === 'ur' ? 'text-right' : ''}`}
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)} 
                    />
                    <Search className={`absolute ${lang === 'ur' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-emerald-600`} size={24} />
                </div>

                {/* Categories */}
                <div className={`flex gap-3 overflow-x-auto pb-6 hide-scrollbar ${lang === 'ur' ? 'flex-row-reverse' : ''}`}>
                    <button onClick={() => setSelectedCategory('All')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shrink-0 transition-all ${selectedCategory === 'All' ? 'bg-emerald-600 text-white shadow-xl scale-105' : 'bg-white text-gray-400 hover:text-emerald-600'}`}>{t.all}</button>
                    {CATEGORIES.map(c => (
                        <button key={c.en} onClick={() => setSelectedCategory(c.en)} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shrink-0 transition-all ${selectedCategory === c.en ? 'bg-emerald-600 text-white shadow-xl scale-105' : 'bg-white text-gray-400 hover:text-emerald-600'}`}>
                            {lang === 'en' ? c.en : c.ur}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {filteredProducts.map(p => (
                        <div key={p.id} className="bg-white rounded-[32px] shadow-xl border border-gray-100 flex flex-col h-full relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                            <div className="aspect-square bg-gray-50 overflow-hidden relative">
                                <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                                    <span className="text-[10px] font-black text-emerald-600">{p.unit}</span>
                                </div>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest mb-1">{p.category}</p>
                                <h3 className={`font-bold text-gray-900 text-sm mb-4 line-clamp-2 leading-snug h-10 ${lang === 'ur' ? 'text-right' : ''}`}>{p.name}</h3>
                                <div className="mt-auto flex items-center justify-between">
                                    <div className={lang === 'ur' ? 'text-right' : ''}>
                                        <span className="text-xl font-black text-gray-900">Rs. {p.price}</span>
                                    </div>
                                    <button onClick={() => addToCart(p)} className="bg-amber-500 text-white p-3.5 rounded-2xl shadow-lg hover:bg-amber-600 active:scale-90 transition-all"><Plus size={20} strokeWidth={3}/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* WhatsApp Floating Button */}
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="fixed bottom-8 right-8 z-40 bg-emerald-500 text-white p-5 rounded-full shadow-[0_10px_40px_rgba(16,185,129,0.4)] animate-bounce-slow hover:scale-110 transition-transform">
                <MessageCircle size={32} />
            </a>

            {/* Checkout Modal */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={() => setIsCartOpen(false)} />
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left rounded-l-[40px] overflow-hidden">
                        <div className="p-8 bg-emerald-600 text-white flex justify-between items-center">
                            <h2 className="text-2xl font-black italic tracking-tight">{checkoutStep === 'idle' ? t.cartTitle : t.deliveryTitle}</h2>
                            <button onClick={() => setIsCartOpen(false)} className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-colors"><X size={20}/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {checkoutStep === 'idle' ? (
                                cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center opacity-30"><ShoppingBag size={80}/><p className="mt-6 font-black uppercase tracking-widest">Basket is Empty</p></div> :
                                cart.map((item) => (
                                    <div key={item.id} className="bg-gray-50 p-5 rounded-3xl border border-gray-100 flex gap-5 items-center group transition-all hover:bg-white hover:shadow-lg">
                                        <img src={item.image} className="w-16 h-16 rounded-2xl object-cover shadow-sm" alt={item.name} />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-gray-800">{item.name}</h4>
                                            <p className="text-[11px] text-emerald-600 font-bold">Rs. {item.price} x {item.quantity}</p>
                                        </div>
                                        <button onClick={() => setCart(cart.filter(x => x.id !== item.id))} className="text-red-200 hover:text-red-500 transition-colors p-2"><Trash2 size={20}/></button>
                                    </div>
                                ))
                            ) : checkoutStep === 'details' ? (
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Full Name</label>
                                        <input placeholder="Aapka Naam" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 ring-emerald-500 transition-all shadow-inner" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2">WhatsApp Number</label>
                                        <input placeholder="Mobile Number" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 ring-emerald-500 transition-all shadow-inner" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Home Address</label>
                                        <textarea placeholder="Ghar ka mukammal pata" rows={3} value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 ring-emerald-500 transition-all shadow-inner resize-none" />
                                    </div>
                                    <button onClick={getLoc} className={`w-full py-5 rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all ${customerInfo.location ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                        {isLocating ? 'Locating...' : customerInfo.location ? t.locationCaptured : t.addLocation} <MapPin size={20}/>
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                                    <CheckCircle2 size={80} className="mx-auto text-emerald-600 mb-6 drop-shadow-lg" />
                                    <h2 className="text-3xl font-black mb-2">{t.mubarak}</h2>
                                    <p className="text-gray-400 font-medium">{t.redirecting}</p>
                                </div>
                            )}
                        </div>

                        {checkoutStep !== 'success' && cart.length > 0 && (
                            <div className="p-8 border-t bg-gray-50 space-y-5">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Total Bill</span>
                                    <span className="text-3xl font-black text-emerald-800">Rs. {cartTotal}</span>
                                </div>
                                <button 
                                    onClick={() => checkoutStep === 'idle' ? setCheckoutStep('details') : handleConfirmOrder()}
                                    className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black uppercase text-xs shadow-[0_10px_20px_rgba(5,150,105,0.3)] hover:bg-emerald-700 transition-all"
                                >
                                    {checkoutStep === 'idle' ? t.checkout : t.placeOrder}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Admin Dashboard */}
            {isAdminOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsAdminOpen(false)} />
                    <div className="relative bg-white w-full max-w-2xl rounded-[48px] shadow-2xl p-10 max-h-[90vh] overflow-y-auto border border-white/20">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-3xl font-black italic">{t.adminTitle}</h2>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Manage your store inventory</p>
                            </div>
                            <button onClick={() => setIsAdminOpen(false)} className="p-3 bg-gray-100 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"><X/></button>
                        </div>
                        
                        <div className="bg-emerald-50 p-8 rounded-[32px] mb-10 border border-emerald-100/50">
                            <h3 className="font-black text-emerald-800 mb-6 text-sm flex items-center gap-3 uppercase"><Plus size={18} strokeWidth={4}/> Add New Inventory Item</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input placeholder="Product Name" value={newP.name} onChange={e => setNewP({...newP, name: e.target.value})} className="p-4 rounded-2xl border-none shadow-sm focus:ring-2 ring-emerald-500" />
                                <input placeholder="Price (PKR)" type="number" value={newP.price} onChange={e => setNewP({...newP, price: e.target.value})} className="p-4 rounded-2xl border-none shadow-sm focus:ring-2 ring-emerald-500" />
                                <input placeholder="Unit (e.g. 1kg)" value={newP.unit} onChange={e => setNewP({...newP, unit: e.target.value})} className="p-4 rounded-2xl border-none shadow-sm focus:ring-2 ring-emerald-500" />
                                <select value={newP.category} onChange={e => setNewP({...newP, category: e.target.value})} className="p-4 rounded-2xl border-none shadow-sm focus:ring-2 ring-emerald-500 font-bold text-gray-500">
                                    {CATEGORIES.map(c => <option key={c.en} value={c.en}>{c.en}</option>)}
                                </select>
                                <input placeholder="Image Link (Unsplash URL preferred)" value={newP.image} onChange={e => setNewP({...newP, image: e.target.value})} className="p-4 rounded-2xl border-none shadow-sm focus:ring-2 ring-emerald-500 md:col-span-2" />
                                <button onClick={addNewProduct} className="md:col-span-2 bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 shadow-lg hover:bg-emerald-700 transition-all"><Save size={18}/> Save to Inventory</button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-black text-gray-300 text-[10px] uppercase tracking-[0.2em] ml-2">Current Stock</h4>
                            {products.map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                    <div className="flex items-center gap-5">
                                        <img src={p.image} className="w-14 h-14 rounded-2xl object-cover shadow-sm" alt={p.name} />
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-800">{p.name}</h4>
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Rs. {p.price} / {p.unit}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setProducts(products.filter((x) => x.id !== p.id))} className="p-3 text-red-200 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
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
