
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
    ShoppingBag, Search, ShoppingCart, X, Plus, Minus, 
    Trash2, Settings, ChevronRight, CheckCircle2, 
    Phone, MapPin, User, Home, ArrowLeft, ImagePlus, Star,
    Navigation2, LocateFixed, Languages, Sparkles, Percent, MessageCircle, Heart,
    Eraser, HelpCircle, Save
} from 'lucide-react';

// --- CONFIGURATION ---
const STORE_NAME = "TDR-STORE";
const WHATSAPP_NUMBER = "923471115131"; 

const TRANSLATIONS = {
    en: {
        slogan: "Fresh Groceries, Best Prices",
        searchPlaceholder: "Search items...",
        all: "All Items",
        cartTitle: "Your Basket",
        deliveryTitle: "Delivery Details",
        reviewTitle: "Review Order",
        confirmOrder: "Confirm Order?",
        placeOrder: "Order on WhatsApp",
        goBack: "Go Back",
        checkout: "Checkout Now",
        reviewSummary: "Summary",
        total: "Grand Total",
        freeDelivery: "Free Delivery",
        mubarak: "Order Sent!",
        orderReceived: "Successfully.",
        redirecting: "Opening WhatsApp...",
        adminTitle: "Store Manager",
        featuredBadge: "Hot",
        addLocation: "Add Location",
        locationCaptured: "GPS Locked ✓",
        locating: "Locating...",
    },
    ur: {
        slogan: "ٹی ڈی آر ہے تو ٹائم اور پیسے کیوں برباد کریں",
        searchPlaceholder: "اشیاء تلاش کریں...",
        all: "تمام اشیاء",
        cartTitle: "آپ کی ٹوکری",
        deliveryTitle: "ڈیلیوری کی تفصیلات",
        reviewTitle: "آرڈر چیک کریں",
        confirmOrder: "آرڈر کی تصدیق کریں؟",
        placeOrder: "واٹس ایپ پر آرڈر دیں",
        goBack: "واپس جائیں",
        checkout: "چیک آؤٹ کریں",
        reviewSummary: "آرڈر کا خلاصہ",
        total: "کل رقم",
        freeDelivery: "مفت ڈیلیوری",
        mubarak: "آرڈر بھیج دیا گیا!",
        orderReceived: "شکریہ!",
        redirecting: "واٹس ایپ کھل رہا ہے...",
        adminTitle: "دکان مینیجر",
        featuredBadge: "نمایاں",
        addLocation: "لوکیشن شامل کریں",
        locationCaptured: "لوکیشن مل گئی ہے ✓",
        locating: "تلاش جاری ہے...",
    }
};

const CATEGORIES = [
    { en: 'Flour & Grains', ur: 'آٹا اور اناج' },
    { en: 'Oil & Ghee', ur: 'تیل اور گھی' },
    { en: 'Pulses (Daal)', ur: 'دالیں' },
    { en: 'Rice', ur: 'چاول' },
    { en: 'Sugar & Tea', ur: 'چینی اور چائے' },
    { en: 'Dairy', ur: 'دودھ اور دہی' },
    { en: 'Beverages', ur: 'مشروبات' },
    { en: 'Cleaning', ur: 'صفائی کا سامان' }
];

const INITIAL_PRODUCTS = [
    {
        id: '1',
        name: 'Premium Chakki Atta',
        category: 'Flour & Grains',
        price: 1450,
        unit: '10kg Bag',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
        inStock: true,
        isFeatured: true
    },
    {
        id: '2',
        name: 'Premium Banaspati Ghee',
        category: 'Oil & Ghee',
        price: 540,
        unit: '1kg Pouch',
        image: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?q=80&w=800&auto=format&fit=crop',
        inStock: true,
        isFeatured: true
    }
];

const App = () => {
    const [lang, setLang] = useState('en');
    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('tdr_products');
        return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    });
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState('idle');
    const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '', location: null });
    const [isLocating, setIsLocating] = useState(false);

    // Form states for new product
    const [newP, setNewP] = useState({ name: '', price: '', unit: '', category: CATEGORIES[0].en, image: '' });

    const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS];

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

    const addToCart = (product: any) => {
        setCart((prev: any[]) => {
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
        cart.forEach((i: any) => msg += `- ${i.name} (${i.unit}) x ${i.quantity} = Rs. ${i.price * i.quantity}\n`);
        msg += `\n💰 *Total: Rs. ${cartTotal}*`;
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
        setCart([]); setCheckoutStep('success');
        setTimeout(() => { setIsCartOpen(false); setCheckoutStep('idle'); }, 4000);
    };

    const addNewProduct = () => {
        if(!newP.name || !newP.price) return alert("Fill all details");
        const productToAdd = {
            ...newP,
            id: Date.now().toString(),
            price: Number(newP.price),
            image: newP.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop',
            inStock: true
        };
        setProducts([productToAdd, ...products]);
        setNewP({ name: '', price: '', unit: '', category: CATEGORIES[0].en, image: '' });
    };

    return (
        <div className={`min-h-screen bg-[#F8FAF9] flex flex-col ${lang === 'ur' ? 'font-urdu' : ''}`}>
            {/* Nav */}
            <nav className="sticky top-0 z-40 bg-emerald-600 text-white shadow-lg h-20 flex items-center justify-between px-6">
                <div className={`flex items-center gap-4 ${lang === 'ur' ? 'flex-row-reverse' : ''}`}>
                    <div className="bg-white p-2 rounded-xl"><ShoppingBag className="text-emerald-600 w-6 h-6" /></div>
                    <div>
                        <h1 className="text-xl font-black uppercase">{STORE_NAME}</h1>
                        <p className="text-[10px] font-bold opacity-80">{t.slogan}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setLang(lang === 'en' ? 'ur' : 'en')} className="px-3 py-2 bg-white/10 rounded-xl text-[10px] font-black">{lang === 'en' ? 'اردو' : 'English'}</button>
                    <button onClick={() => setIsCartOpen(true)} className="relative bg-amber-500 p-3 rounded-xl shadow-xl">
                        <ShoppingCart size={22} />
                        {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-emerald-600 font-bold">{cart.length}</span>}
                    </button>
                    <button onClick={() => setIsAdminOpen(true)} className="p-2.5 hover:bg-white/10 rounded-xl"><Settings size={20}/></button>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 pb-32">
                {/* Search */}
                <div className="relative mb-10 max-w-2xl mx-auto">
                    <input 
                        type="text" placeholder={t.searchPlaceholder} 
                        className={`w-full py-5 pl-14 pr-6 rounded-3xl outline-none shadow-xl border-none text-md bg-white ${lang === 'ur' ? 'text-right' : ''}`}
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)} 
                    />
                    <Search className={`absolute ${lang === 'ur' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-emerald-600`} size={24} />
                </div>

                {/* Categories */}
                <div className={`flex gap-2 overflow-x-auto pb-6 hide-scrollbar ${lang === 'ur' ? 'flex-row-reverse' : ''}`}>
                    <button onClick={() => setSelectedCategory('All')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shrink-0 transition-all ${selectedCategory === 'All' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-gray-400'}`}>{t.all}</button>
                    {CATEGORIES.map(c => (
                        <button key={c.en} onClick={() => setSelectedCategory(c.en)} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shrink-0 transition-all ${selectedCategory === c.en ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-gray-400'}`}>
                            {lang === 'en' ? c.en : c.ur}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredProducts.map(p => (
                        <div key={p.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full relative overflow-hidden group">
                            <div className="aspect-square bg-gray-50 overflow-hidden">
                                <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            </div>
                            <div className="p-4 flex flex-col flex-1">
                                <p className="text-[9px] text-emerald-600 font-black uppercase mb-1">{p.category}</p>
                                <h3 className={`font-bold text-gray-900 text-xs mb-3 line-clamp-2 leading-tight h-8 ${lang === 'ur' ? 'text-right' : ''}`}>{p.name}</h3>
                                <div className="mt-auto flex items-center justify-between">
                                    <div className={lang === 'ur' ? 'text-right' : ''}>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase">{p.unit}</p>
                                        <span className="text-lg font-black text-gray-900">Rs. {p.price}</span>
                                    </div>
                                    <button onClick={() => addToCart(p)} className="bg-amber-500 text-white p-3 rounded-xl shadow-lg hover:bg-amber-600 active:scale-90 transition-all"><Plus size={18} strokeWidth={4}/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Float WhatsApp */}
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="fixed bottom-6 right-6 z-40 bg-emerald-500 text-white p-4 rounded-full shadow-2xl animate-bounce-slow">
                <MessageCircle size={28} />
            </a>

            {/* Cart Modal */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
                        <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
                            <h2 className="text-xl font-black">{checkoutStep === 'idle' ? t.cartTitle : t.deliveryTitle}</h2>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 bg-white/10 rounded-lg"><X size={20}/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                            {checkoutStep === 'idle' ? (
                                cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center opacity-30"><ShoppingBag size={64}/><p className="mt-4 font-bold">Empty</p></div> :
                                cart.map((item: any) => (
                                    <div key={item.id} className="bg-white p-4 rounded-2xl border mb-3 flex gap-4 items-center">
                                        <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-xs">{item.name}</h4>
                                            <p className="text-[10px] text-emerald-600">Rs. {item.price} x {item.quantity}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setCart(cart.filter(x => x.id !== item.id))} className="text-red-300 hover:text-red-500"><Trash2 size={18}/></button>
                                        </div>
                                    </div>
                                ))
                            ) : checkoutStep === 'details' ? (
                                <div className="space-y-4">
                                    <input placeholder="Aapka Naam" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full p-4 bg-white rounded-2xl border-none shadow-sm" />
                                    <input placeholder="WhatsApp Number" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full p-4 bg-white rounded-2xl border-none shadow-sm" />
                                    <textarea placeholder="Ghar ka mukammal pata (Address)" rows={3} value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full p-4 bg-white rounded-2xl border-none shadow-sm resize-none" />
                                    <button onClick={getLoc} className="w-full py-4 bg-emerald-100 text-emerald-700 rounded-2xl font-black text-xs flex items-center justify-center gap-3">
                                        {isLocating ? 'Locating...' : customerInfo.location ? t.locationCaptured : t.addLocation} <MapPin size={18}/>
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <CheckCircle2 size={64} className="mx-auto text-emerald-600 mb-4" />
                                    <h2 className="text-2xl font-black">{t.mubarak}</h2>
                                    <p className="text-gray-400 text-sm">{t.redirecting}</p>
                                </div>
                            )}
                        </div>

                        {checkoutStep !== 'success' && cart.length > 0 && (
                            <div className="p-6 border-t bg-white space-y-4">
                                <div className="flex justify-between items-center font-black">
                                    <span className="text-gray-400 text-xs">TOTAL</span>
                                    <span className="text-2xl text-emerald-800">Rs. {cartTotal}</span>
                                </div>
                                <button 
                                    onClick={() => checkoutStep === 'idle' ? setCheckoutStep('details') : handleConfirmOrder()}
                                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg"
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
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsAdminOpen(false)} />
                    <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black">{t.adminTitle}</h2>
                            <button onClick={() => setIsAdminOpen(false)} className="p-2 bg-gray-100 rounded-xl"><X/></button>
                        </div>
                        
                        {/* Add Form */}
                        <div className="bg-emerald-50 p-6 rounded-2xl mb-8 border border-emerald-100">
                            <h3 className="font-black text-emerald-800 mb-4 text-sm flex items-center gap-2"><Plus size={16}/> Add New Item</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input placeholder="Product Name" value={newP.name} onChange={e => setNewP({...newP, name: e.target.value})} className="p-3 rounded-xl border-none shadow-sm" />
                                <input placeholder="Price (PKR)" type="number" value={newP.price} onChange={e => setNewP({...newP, price: e.target.value})} className="p-3 rounded-xl border-none shadow-sm" />
                                <input placeholder="Unit (e.g. 1kg)" value={newP.unit} onChange={e => setNewP({...newP, unit: e.target.value})} className="p-3 rounded-xl border-none shadow-sm" />
                                <select value={newP.category} onChange={e => setNewP({...newP, category: e.target.value})} className="p-3 rounded-xl border-none shadow-sm">
                                    {CATEGORIES.map(c => <option key={c.en} value={c.en}>{c.en}</option>)}
                                </select>
                                <input placeholder="Image Link (Optional)" value={newP.image} onChange={e => setNewP({...newP, image: e.target.value})} className="p-3 rounded-xl border-none shadow-sm md:col-span-2" />
                                <button onClick={addNewProduct} className="md:col-span-2 bg-emerald-600 text-white py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2"><Save size={16}/> Add to Shop</button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="space-y-3">
                            {products.map((p: any) => (
                                <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <img src={p.image} className="w-12 h-12 rounded-lg object-cover" />
                                        <div>
                                            <h4 className="font-bold text-xs">{p.name}</h4>
                                            <p className="text-[10px] text-gray-400">Rs. {p.price}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setProducts(products.filter((x: any) => x.id !== p.id))} className="p-2 text-red-300 hover:text-red-500"><Trash2 size={18}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<React.StrictMode><App /></React.StrictMode>);
