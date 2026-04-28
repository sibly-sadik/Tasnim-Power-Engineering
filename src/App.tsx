import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, Menu, Phone, Mail, MapPin, Battery, Sun, Zap, 
  ArrowRight, ChevronRight, Facebook, Twitter, Linkedin, X as XIcon, 
  Plus, Minus, Trash2, LayoutDashboard, LogOut, Package, 
  Settings, User, PlusCircle, Edit3, Save, Globe, Heart, Upload,
  TrendingUp, TrendingDown, Users, DollarSign, Box, Activity, ChevronDown, Search, Star, MessageSquare, Moon,
  GraduationCap, Truck, Calendar, ClipboardList, MoreHorizontal, Download, Filter, SortAsc, ArrowLeft, Briefcase
} from 'lucide-react';
import { useState, useEffect, FormEvent, useRef, ChangeEvent } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, AreaChart, Area
} from 'recharts';

// --- Interfaces ---
interface Review {
  id: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  priceValue: number;
  image: string;
  description: string;
  warranty: string;
  stock: number;
  discount?: number;
  rating?: number;
  reviews?: Review[];
}

interface CartItem extends Product {
  quantity: number;
}

interface WishlistItem {
  id: number;
  customerId: string;
  name: string;
  priceValue: number;
  image: string;
  discount?: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  createdAt: string;
}

type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Completed' | 'Cancelled';

interface Order {
  id: string;
  customerId?: string; // Link to customer
  customerName: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  deliveryCharge: number;
  paymentMethod: string;
  transactionId: string;
  date: string;
}

interface DeliverySetting {
  id: string;
  label: string;
  amount: number;
}

interface Category {
  id: string;
  name: string;
}

interface OrderStatusInfo {
  label: OrderStatus;
  color: string;
}

const DEFAULT_DELIVERY_SETTINGS: DeliverySetting[] = [
  { id: '1', label: 'Inside Dhaka', amount: 80 },
  { id: '2', label: 'Outside Dhaka', amount: 150 },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Solar Systems' },
  { id: '2', name: 'Energy Storage' },
  { id: '3', name: 'Lift Parts' },
  { id: '4', name: 'Substation & Transformer' },
  { id: '5', name: 'Circuit Breaker' },
  { id: '6', name: 'Cables & Accessories' }
];

const ADMIN_PASSWORD = 'admin123';

// --- Default Data ---
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Mono PERC Solar Panel (550W)',
    category: 'Solar Systems',
    priceValue: 18500,
    image: 'https://images.unsplash.com/photo-1508514177221-18d29c06b3b4?auto=format&fit=crop&q=80&w=800',
    description: 'High-efficiency mono-crystalline solar panels with half-cut cell technology.',
    warranty: '25 Years Performance',
    stock: 120,
    discount: 10,
    rating: 4.8,
    reviews: [
      { id: '1', customerId: 'c1', customerName: 'Ariful Islam', rating: 5, comment: 'Excellent performance even in low light!', date: '2024-03-15T10:00:00Z' }
    ]
  },
  {
    id: 2,
    name: 'Industrial Lithium-Ion Battery',
    category: 'Energy Storage',
    priceValue: 124000,
    image: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&q=80&w=800',
    description: '48V 100Ah LiFePO4 battery pack for long-lasting industrial power backup.',
    warranty: '5 Years Replacement',
    stock: 15,
    discount: 5,
    rating: 4.5
  },
  {
    id: 3,
    name: 'Advanced Lift Control unit',
    category: 'Lift Parts',
    priceValue: 32800,
    image: 'https://images.unsplash.com/photo-1517036611384-3652df497558?auto=format&fit=crop&q=80&w=800',
    description: 'Integration-ready elevator control logic board with smart acceleration profiling.',
    warranty: '2 Years Limited',
    stock: 45,
    rating: 4.2
  },
  {
    id: 4,
    name: 'Hybrid Solar Inverter (5KW)',
    category: 'Solar Systems',
    priceValue: 85200,
    image: 'https://images.unsplash.com/photo-1511283910308-23129d1f958c?auto=format&fit=crop&q=80&w=800',
    description: 'Pure sine wave hybrid inverter with built-in MPPT solar charge controller.',
    warranty: '3 Years Service',
    stock: 22
  },
  {
    id: 5,
    name: 'Tubular Deep Cycle Battery',
    category: 'Energy Storage',
    priceValue: 22000,
    image: 'https://images.unsplash.com/photo-1611338023530-9799285fdbe2?auto=format&fit=crop&q=80&w=800',
    description: 'Heavy-duty tubular battery designed for high-drain Solar/IPS applications.',
    warranty: '2.5 Years Replacement',
    stock: 80
  },
  {
    id: 6,
    name: 'Automatic Voltage Stabilizer',
    category: 'Power Protection',
    priceValue: 12500,
    image: 'https://images.unsplash.com/photo-1558485940-8eeed8a9da27?auto=format&fit=crop&q=80&w=800',
    description: 'Precision voltage regulation for sensitive medical and industrial equipment.',
    warranty: '1 Year Full',
    stock: 12
  }
];

// --- Components ---

function Navbar({ cartCount, onOpenCart, customer, wishlistCount, theme, onToggleTheme, companyName }: { 
  cartCount: number, 
  onOpenCart: () => void, 
  customer: Customer | null, 
  wishlistCount: number,
  theme: 'light' | 'dark',
  onToggleTheme: () => void,
  companyName: string
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolled || isAdmin 
          ? 'bg-brand-bg-card border-brand-accent/10 py-3 shadow-xl' 
          : 'bg-transparent border-transparent py-3 md:py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-brand-accent flex items-center justify-center rounded-sm rotate-45 group-hover:rotate-0 transition-transform duration-500">
            <div className="text-black font-bold text-lg md:text-xl -rotate-45 group-hover:rotate-0 transition-transform duration-500">{companyName?.[0] || 'T'}</div>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm md:text-lg tracking-tighter uppercase leading-none text-[var(--text-primary)]">
              {companyName}
            </span>
            <span className="text-[7px] md:text-[9px] font-light tracking-[0.3em] uppercase text-brand-accent">
              Engineering Excellence
            </span>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-[var(--text-primary)]">
          {isAdmin ? (
            <Link to="/" className="flex items-center gap-2 hover:text-brand-accent transition-colors">
              <Globe size={14} /> View Store
            </Link>
          ) : (
            <>
              <Link to="/" className="transition-colors hover:text-brand-accent">Home</Link>
              <a href="#products" className="transition-colors hover:text-brand-accent">Products</a>
              <a href="#services" className="transition-colors hover:text-brand-accent">Services</a>
              <a href="#contact" className="transition-colors hover:text-brand-accent">Contact</a>
              
              <div className="h-4 w-[1px] bg-brand-accent/20 mx-2" />
              
              <button 
                onClick={onToggleTheme}
                className="p-2 hover:bg-brand-accent/10 rounded-full transition-colors text-brand-accent"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {customer ? (
                <Link to="/profile" className="flex items-center gap-2 text-brand-accent font-bold">
                  <User size={14} /> {customer.name}
                </Link>
              ) : (
                <Link to="/login" className="flex items-center gap-2 hover:text-brand-accent transition-colors">
                  <User size={14} /> Login
                </Link>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!isAdmin && (
            <div className="flex items-center gap-2">
              {customer && (
                <Link 
                  to="/profile" 
                  className="p-2 rounded-full transition-colors bg-white/5 text-white hover:bg-white/15 relative"
                  title="Wishlist"
                >
                  <Heart size={18} className={wishlistCount > 0 ? "fill-brand-accent text-brand-accent" : ""} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-accent text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}
              <button 
                onClick={onOpenCart}
                className="p-2 rounded-full transition-colors bg-white/5 text-white hover:bg-white/15 relative"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-accent text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          )}
          <div className="md:hidden">
             {customer ? (
                <Link to="/profile" className="p-2 text-brand-accent"><User size={20} /></Link>
             ) : (
                <Link to="/login" className="p-2 text-white/50"><User size={20} /></Link>
             )}
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2 text-xs font-bold text-brand-accent border border-brand-accent/20 px-3 py-1 rounded-full bg-brand-accent/5">
              <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              Admin Mode
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function AdminLogin({ onLogin }: { onLogin: (pw: string) => boolean }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onLogin(password)) {
      setError('');
    } else {
      setError('Invalid password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg-dark flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-brand-bg-card border border-white/5 p-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-accent/10 text-brand-accent rounded-full mb-6">
            <LayoutDashboard size={32} />
          </div>
          <h2 className="font-display font-bold text-2xl uppercase tracking-tighter text-white">System <span className="text-brand-accent">Login</span></h2>
          <p className="text-white/40 text-xs uppercase tracking-[0.2em] mt-2">Restricted Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Password</label>
            <input 
              type="password" 
              required 
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-brand-accent outline-none transition-colors text-white font-mono" 
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-500 text-[10px] uppercase font-bold tracking-wider">{error}</p>}
          <button type="submit" className="w-full py-4 bg-brand-accent text-black font-bold uppercase text-xs tracking-widest hover:brightness-110 transition-all">
            Access Dashboard
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function CheckoutDrawer({ isOpen, onClose, onPlaceOrder, total, customer, paymentPhoneNumber, deliverySettings }: any) {
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    address: '',
    paymentMethod: 'bKash', 
    transactionId: '',
    deliveryId: deliverySettings?.[0]?.id || 'inside'
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const selectedDelivery = deliverySettings?.find((s: any) => s.id === formData.deliveryId) || deliverySettings?.[0];
  const deliveryCharge = selectedDelivery?.amount || 0;
  const finalTotal = total + deliveryCharge;

  useEffect(() => {
    if (customer && isOpen) {
      setFormData(prev => ({
        ...prev,
        name: customer.name || '',
        phone: customer.phone || '',
      }));
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.transactionId) {
      alert('Please enter your transaction ID');
      return;
    }
    const id = await onPlaceOrder({ 
      ...formData, 
      deliveryCharge,
      customerId: customer?.id 
    });
    setOrderId(id);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setFormData({ 
        name: '', 
        phone: '', 
        address: '', 
        paymentMethod: 'bKash', 
        transactionId: '',
        deliveryId: deliverySettings?.[0]?.id || 'inside'
      });
    }, 3000);
  };

  const paymentMethods = [
    { id: 'bKash', name: 'bKash', color: 'bg-[#D12053]', icon: 'https://seeklogo.com/images/B/bkash-logo-0C1572FBB4-seeklogo.com.png' },
    { id: 'Nagad', name: 'Nagad', color: 'bg-[#ED1C24]', icon: 'https://seeklogo.com/images/N/nagad-logo-7A70BBDA97-seeklogo.com.png' },
    { id: 'Rocket', name: 'Rocket', color: 'bg-[#8C3494]', icon: 'https://seeklogo.com/images/D/dutch-bangla-rocket-logo-B4D1CC458D-seeklogo.com.png' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-brand-bg-card z-[90] shadow-2xl flex flex-col border-l border-[var(--border-color)]"
          >
            <div className="p-8 border-b border-[var(--border-color)] flex items-center justify-between">
              <h2 className="font-display font-bold text-xl uppercase tracking-widest text-[var(--text-primary)]">Complete <span className="text-brand-accent">Order</span></h2>
              <button onClick={onClose} className="p-2 hover:bg-[var(--border-color)] rounded-full transition-colors text-[var(--text-secondary)]">
                <XIcon size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 text-[var(--text-primary)]">
              {isSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-green-500/20 text-green-500 flex items-center justify-center rounded-full animate-bounce">
                    <Package size={40} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tighter">Order Placed!</h3>
                    <p className="text-white/40 text-xs mt-2 font-mono">{orderId}</p>
                    <p className="text-white/60 mt-4 leading-relaxed">Thank you for your business. Our team will contact you shortly to confirm the details.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="p-6 bg-white/[0.02] border border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-white/40">
                      <span>Subtotal</span>
                      <span className="font-mono text-white">৳ {total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs uppercase tracking-[0.2em] font-bold text-brand-accent border-t border-white/5 pt-4">
                      <span>Total Amount</span>
                      <span className="font-mono">৳ {total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Full Name</label>
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-brand-accent outline-none transition-colors text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Phone Number</label>
                      <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-brand-accent outline-none transition-colors text-white font-mono" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Delivery Address</label>
                      <textarea required rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-brand-accent outline-none transition-colors resize-none text-white font-sans" />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-accent block">Delivery Location</label>
                      <div className="grid grid-cols-2 gap-3">
                        {deliverySettings?.map((setting: any) => (
                          <button
                            key={setting.id}
                            type="button"
                            onClick={() => setFormData({...formData, deliveryId: setting.id})}
                            className={`p-4 border-2 text-left transition-all rounded-2xl ${
                              formData.deliveryId === setting.id 
                                ? 'border-brand-accent bg-brand-accent/5' 
                                : 'border-white/5 bg-white/5 opacity-50 hover:opacity-100'
                            }`}
                          >
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">{setting.label}</p>
                            <p className="text-sm font-black text-white">৳{setting.amount}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-accent block">Select Payment Method</label>
                      <div className="grid grid-cols-3 gap-3">
                        {paymentMethods.map(method => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setFormData({...formData, paymentMethod: method.id})}
                            className={`p-3 border-2 transition-all flex flex-col items-center gap-2 rounded-xl ${
                              formData.paymentMethod === method.id 
                                ? 'border-brand-accent bg-brand-accent/10' 
                                : 'border-white/5 bg-white/5 opacity-50 grayscale hover:opacity-100 hover:grayscale-0'
                            }`}
                          >
                            <img src={method.icon} alt={method.name} className="w-8 h-8 object-contain" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{method.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">
                        {formData.paymentMethod} Transaction ID
                      </label>
                      <div className="p-3 bg-brand-accent/5 border border-brand-accent/20 rounded-xl mb-3">
                         <p className="text-[9px] text-brand-accent font-bold leading-tight">
                            Please send ৳{finalTotal.toLocaleString()} to our {formData.paymentMethod} Personal: {paymentPhoneNumber} and paste the Transaction ID below.
                         </p>
                      </div>
                      <input 
                        required 
                        placeholder="Enter TxnID (e.g. AHN39LK9)"
                        value={formData.transactionId} 
                        onChange={e => setFormData({...formData, transactionId: e.target.value})} 
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-brand-accent outline-none transition-colors text-brand-accent font-mono font-bold uppercase tracking-widest" 
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-4 bg-brand-accent text-black font-bold uppercase text-xs tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-brand-accent/20">
                    <Save size={16} /> Confirm Order ৳{finalTotal.toLocaleString()}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CartDrawer({ isOpen, onClose, cart, updateQuantity, removeFromCart, total, onCheckout, customer }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-brand-bg-card z-[70] shadow-2xl flex flex-col border-l border-[var(--border-color)]"
          >
            <div className="p-8 border-b border-[var(--border-color)] flex items-center justify-between">
              <h2 className="font-display font-bold text-xl uppercase tracking-widest text-[var(--text-primary)]">Shopping <span className="text-brand-accent">Cart</span></h2>
              <button onClick={onClose} className="p-2 hover:bg-[var(--border-color)] rounded-full transition-colors text-[var(--text-secondary)]">
                <XIcon size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 text-[var(--text-primary)]">
              {cart.length === 0 ? (
                <div className="text-center py-20 bg-[var(--bg-dark)] border border-[var(--border-color)]">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-accent/5 rounded-full mb-6 text-brand-accent">
                    <ShoppingCart size={24} />
                  </div>
                  <p className="text-[var(--text-secondary)]/40 uppercase tracking-widest text-[10px] font-black">Your cart is empty</p>
                </div>
              ) : (
                cart.map((item: any) => (
                  <div key={item.id} className="flex gap-4 bg-[var(--bg-dark)] p-4 border border-[var(--border-color)] group hover:border-brand-accent/20 transition-colors">
                    <div className="w-20 h-20 bg-white/5 dark:bg-[#111] shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-[10px] uppercase tracking-[0.2em] mb-2 text-[var(--text-primary)] group-hover:text-brand-accent transition-colors truncate">{item.name}</h4>
                      <div className="flex flex-col mb-3">
                        {item.discount ? (
                          <>
                            <span className="text-brand-accent font-mono text-sm font-black">৳ {(item.priceValue * (1 - item.discount / 100)).toLocaleString()}</span>
                            <span className="text-[var(--text-secondary)]/30 font-mono text-[9px] line-through">৳ {item.priceValue.toLocaleString()}</span>
                          </>
                        ) : (
                          <span className="text-brand-accent font-mono text-sm font-black">৳ {item.priceValue.toLocaleString()}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-[var(--border-color)] overflow-hidden rounded-sm">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-brand-accent/10 transition-colors text-[var(--text-secondary)]"><Minus size={12} /></button>
                          <span className="w-8 text-center text-[10px] font-black font-mono">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-brand-accent/10 transition-colors text-[var(--text-secondary)]"><Plus size={12} /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-[var(--text-secondary)]/20 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 border-t border-[var(--border-color)] bg-[var(--bg-dark)]">
              <div className="flex items-center justify-between mb-8">
                <span className="uppercase text-[10px] font-black tracking-[0.3em] text-[var(--text-secondary)]/40">Total Amount</span>
                <span className="font-mono text-2xl font-black text-brand-accent tracking-tighter">৳ {total.toLocaleString()}</span>
              </div>
              <button 
                onClick={onCheckout}
                disabled={cart.length === 0}
                className="w-full bg-[var(--text-primary)] text-[var(--bg-dark)] font-black py-5 uppercase text-[10px] tracking-[0.4em] hover:bg-brand-accent hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 shadow-xl"
              >
                {customer ? 'Checkout Now' : 'Login to Checkout'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ProductModal({ product, isOpen, onClose, onAddToCart, onToggleWishlist, isInWishlist, onAddReview, customer }: { 
  product: Product | null, 
  isOpen: boolean, 
  onClose: () => void, 
  onAddToCart: (p: Product) => void, 
  onToggleWishlist: (p: Product) => void, 
  isInWishlist: boolean,
  onAddReview: (productId: number, rating: number, comment: string) => void,
  customer: Customer | null
}) {
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/99 backdrop-blur-xl z-[80]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-5xl max-h-[90vh] bg-brand-bg-card z-[90] shadow-3xl flex flex-col md:flex-row overflow-hidden border border-[var(--border-color)]"
          >
            <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-white/10 rounded-full transition-colors z-[100] text-white">
              <XIcon size={20} />
            </button>

            <div className="md:w-5/12 bg-white/5 dark:bg-[#050505] flex items-center justify-center p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-brand-accent/5 to-transparent pointer-events-none" />
              <motion.img 
                layoutId={`img-${product.id}`}
                src={product.image} 
                alt={product.name} 
                className="w-full h-auto max-h-[50vh] md:max-h-full object-contain relative z-10 transition-transform duration-700 group-hover:scale-110" 
              />
              {product.discount && (
                <div className="absolute top-6 left-6 bg-red-600 text-white text-[10px] font-black px-4 py-2 uppercase tracking-widest flex items-center gap-2 shadow-2xl z-20 skew-x-[-12deg]">
                  <Zap size={14} className="fill-white" /> {product.discount}% OFF
                </div>
              )}
            </div>

            <div className="md:w-7/12 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12">
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-brand-accent text-xs font-black uppercase tracking-[0.4em]">{product.category}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <div className="flex items-center gap-1 text-brand-accent">
                      <Star size={12} className="fill-current" />
                      <span className="text-[10px] font-bold">{product.rating || 'No ratings'}</span>
                    </div>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-black dark:text-white text-brand-slate uppercase tracking-tighter mb-8 leading-[0.9]">{product.name}</h2>
                  <div className="flex items-baseline gap-6 mb-10">
                    {product.discount ? (
                      <>
                        <div className="font-mono text-4xl font-black text-brand-accent tracking-tighter">৳ {(product.priceValue * (1 - product.discount / 100)).toLocaleString()}</div>
                        <div className="font-mono text-xl text-white/20 line-through">৳ {product.priceValue.toLocaleString()}</div>
                      </>
                    ) : (
                      <div className="font-mono text-4xl font-black text-brand-accent tracking-tighter">৳ {product.priceValue.toLocaleString()}</div>
                    )}
                  </div>
                  <p className="text-white/50 leading-relaxed text-lg font-light max-w-xl">{product.description}</p>
                </section>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-white/[0.02] border border-white/5 group hover:border-brand-accent/30 transition-colors">
                      <span className="text-[10px] uppercase text-white/30 font-black block mb-2 tracking-widest">Warranty Program</span>
                      <span className="text-sm text-white font-bold">{product.warranty}</span>
                   </div>
                   <div className="p-6 bg-white/[0.02] border border-white/5 group hover:border-brand-accent/30 transition-colors">
                      <span className="text-[10px] uppercase text-white/30 font-black block mb-2 tracking-widest">Live Inventory</span>
                      <span className={`text-sm font-black uppercase ${product.stock > 10 ? 'text-green-500' : 'text-red-500'}`}>
                        {product.stock > 0 ? `${product.stock} units ready` : 'Contact for Availability'}
                      </span>
                   </div>
                </div>

                <section className="pt-12 border-t border-white/5 space-y-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/40">Technical Reviews</h3>
                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{product.reviews?.length || 0} Comments</div>
                  </div>

                  <div className="space-y-8">
                    {product.reviews?.map((review) => (
                      <div key={review.id} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent text-[10px] font-black">
                              {review.customerName.charAt(0)}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wide dark:text-white text-brand-slate">{review.customerName}</span>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={10} className={i < review.rating ? "text-brand-accent fill-current" : "text-white/10"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-white/50 leading-relaxed pl-11 italic">"{review.comment}"</p>
                        <p className="text-[9px] uppercase tracking-widest text-white/20 pl-11">{new Date(review.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                    {(!product.reviews || product.reviews.length === 0) && (
                      <div className="py-10 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-lg">
                        <MessageSquare size={20} className="mx-auto text-white/10 mb-3" />
                        <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Be the first to review this system</p>
                      </div>
                    )}
                  </div>

                  {customer && (
                    <div className="bg-white/[0.03] p-8 border border-white/5 space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-widest font-black text-brand-accent">Rate this product</span>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button key={s} onClick={() => setNewRating(s)} className="transition-transform active:scale-90">
                              <Star size={18} className={s <= newRating ? "text-brand-accent fill-current" : "text-white/10"} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="relative">
                        <textarea 
                          placeholder="WRITE YOUR TECHNICAL FEEDBACK..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="w-full bg-white/5 border border-brand-accent/10 p-4 text-xs font-bold uppercase tracking-widest dark:text-white text-brand-slate outline-none focus:border-brand-accent transition-colors min-h-[100px] resize-none"
                        />
                      </div>
                      <button 
                        onClick={() => { 
                          if (newComment.trim()) {
                            onAddReview(product.id, newRating, newComment);
                            setNewComment('');
                          }
                        }}
                        className="w-full py-4 bg-brand-accent text-black font-black uppercase text-[10px] tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all"
                      >
                        Submit Review
                      </button>
                    </div>
                  )}
                </section>
              </div>

              <div className="p-8 md:p-12 bg-black/50 border-t border-white/5 flex gap-4">
                <button 
                  onClick={() => { onAddToCart(product); onClose(); }}
                  className="flex-3 bg-white text-black font-black py-5 px-8 uppercase text-xs tracking-[0.3em] hover:bg-brand-accent transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <ShoppingCart size={18} /> Add to Deployment
                </button>
                <button 
                  onClick={() => onToggleWishlist(product)}
                  className={`flex-1 border flex items-center justify-center transition-all active:scale-[0.98] ${isInWishlist ? 'border-brand-accent text-brand-accent bg-brand-accent/5' : 'border-white/10 text-white/40 hover:text-white'}`}
                >
                  <Heart size={20} className={isInWishlist ? "fill-brand-accent" : ""} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function HeroProductSlider({ products }: { products: Product[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (products.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [products.length]);

  if (products.length === 0) return null;

  return (
    <div className="relative w-full h-[350px] md:h-[600px] flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={products[currentIndex].id}
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 1.05 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="absolute inset-0 flex flex-col items-center justify-center px-4"
        >
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-brand-accent/20 blur-[60px] md:blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            <img 
              src={products[currentIndex].image} 
              alt={products[currentIndex].name}
              className="relative z-10 w-full max-w-[280px] md:max-w-[500px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] dark:brightness-110"
            />
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 md:mt-8 text-center"
          >
            <h3 className="font-display font-black text-xl md:text-3xl uppercase tracking-tighter text-brand-accent mb-1 md:mb-2">
              {products[currentIndex].name}
            </h3>
            <div className="flex items-center justify-center gap-4 md:gap-6 mt-2 md:mt-4">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]/40 mb-1">Price Point</span>
                <div className="flex items-center gap-2 md:gap-3">
                  {products[currentIndex].discount ? (
                    <>
                      <div className="flex flex-col items-center md:items-start">
                        <span className="font-mono font-black text-xl md:text-2xl text-brand-accent tracking-tighter leading-none">
                          ৳ {(products[currentIndex].priceValue * (1 - products[currentIndex].discount / 100)).toLocaleString()}
                        </span>
                        <span className="font-mono text-[9px] md:text-[10px] text-[var(--text-secondary)]/30 line-through mt-1">
                          ৳ {products[currentIndex].priceValue.toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-red-600 text-white text-[8px] md:text-[9px] font-black px-1.5 md:px-2 py-0.5 md:py-1 uppercase tracking-tighter skew-x-[-10deg] shadow-lg">
                        -{products[currentIndex].discount}%
                      </div>
                    </>
                  ) : (
                    <span className="font-mono font-black text-xl md:text-2xl text-[var(--text-primary)] tracking-tighter">
                      ৳ {products[currentIndex].priceValue.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {products.slice(0, 5).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1 transition-all duration-500 rounded-full ${currentIndex === idx ? 'w-8 md:w-12 bg-brand-accent' : 'w-3 md:w-4 bg-brand-accent/20 hover:bg-brand-accent/40'}`}
          />
        ))}
      </div>
    </div>
  );
}

function Store({ products, onAddToCart, onToggleWishlist, wishlist, onAddReview, customer }: { products: Product[], onAddToCart: (p: Product) => void, onToggleWishlist: (p: Product) => void, wishlist: WishlistItem[], onAddReview: (pid: number, r: number, c: string) => void, customer: Customer | null }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...new Set(products.map(p => p.category))];
  
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const isInWishlist = (id: number) => wishlist.some(item => item.id === id);

  return (
    <>
      <section id="home" className="relative h-screen min-h-[700px] flex items-center overflow-hidden bg-brand-bg-dark pt-32 lg:pt-20">
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
            className="w-full h-full"
          >
            <img 
              src="https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=1920" 
              alt="Engineering Background" 
              className="w-full h-full object-cover opacity-10 dark:opacity-10"
            />
          </motion.div>
          <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-brand-bg-dark dark:via-brand-bg-dark/80 dark:to-transparent bg-gradient-to-br from-white via-white/80 to-transparent" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 dark:opacity-20 pointer-events-none" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col justify-center h-full pt-10 lg:pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-4 md:mb-8 justify-center lg:justify-start">
                <div className="h-[1px] w-12 bg-brand-accent" />
                <span className="text-brand-accent text-[8px] md:text-xs font-black uppercase tracking-[0.5em] block">
                  ISO 9001:2015 CERTIFIED
                </span>
              </div>
              <h1 className="font-bengali text-3xl sm:text-5xl md:text-8xl lg:text-[9.5rem] font-black text-[var(--text-primary)] mb-6 md:mb-8 leading-[1.2] md:leading-[0.9] lg:leading-[0.8] tracking-tighter text-center lg:text-left">
                তাসনিম পাওয়ার <br />
                <span className="text-brand-accent text-[0.6em] md:text-[0.7em] block mt-1 md:mt-4">ইঞ্জিনিয়ারিং</span>
              </h1>
              <p className="text-[var(--text-secondary)] text-sm md:text-xl mb-8 md:mb-12 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light lg:border-l lg:border-[var(--border-color)] lg:pl-8 text-center lg:text-left">
                Empowering Bangladesh with high-precision solar systems, smart industrial storage, and advanced elevator technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-6 justify-center lg:justify-start">
                <a href="#products" className="bg-brand-accent text-black font-black py-4 md:py-5 px-8 md:px-12 text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] hover:bg-white transition-all transform active:scale-95 text-center font-display shadow-2xl shadow-brand-accent/20">
                  Explore Systems
                </a>
                <button className="group relative overflow-hidden border border-[var(--border-color)] py-4 md:py-5 px-8 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all backdrop-blur-md font-display hover:border-brand-accent text-[var(--text-primary)]">
                  <span className="relative z-10 group-hover:text-brand-accent transition-colors">Technical Catalog</span>
                  <div className="absolute inset-0 bg-brand-accent/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative mt-12 lg:mt-0"
            >
               <HeroProductSlider products={products} />
               
               <div className="absolute -top-12 -right-12 w-48 h-48 border-[20px] border-brand-accent/10 rounded-full animate-ping pointer-events-none hidden lg:block" />
               <div className="absolute -bottom-20 -left-20 text-[10rem] font-black text-white/[0.02] select-none uppercase tracking-tighter leading-none pointer-events-none hidden lg:block">
                 POWER
               </div>
            </motion.div>
          </div>
        </div>
        
        <div className="absolute bottom-12 left-0 w-full flex justify-center animate-bounce opacity-20">
          <div className="w-0.5 h-12 bg-white" />
        </div>
      </section>

      <section id="services" className="py-32 bg-brand-bg-dark border-y border-[var(--border-color)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-4 md:px-6 prose-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Sun, title: 'Utility Solar', desc: 'Commercial-grade photovoltaic integration with smart grid feedback.' },
              { icon: Battery, title: 'Smart Storage', desc: 'Next-gen Lithium-Iron-Phosphate arrays with active BMS.' },
              { icon: Zap, title: 'Lift Logic', desc: 'Precision elevator control units and high-speed motor drivers.' }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group p-12 bg-[var(--bg-card)] border border-[var(--border-color)] transition-all hover:border-brand-accent/30 relative overflow-hidden shadow-sm hover:shadow-xl"
              >
                <div className="absolute bottom-0 right-0 p-2 text-brand-accent/[0.02] font-black text-8xl italic uppercase select-none group-hover:text-brand-accent/[0.05] transition-colors leading-none">
                  0{idx + 1}
                </div>
                <div className="w-20 h-20 bg-brand-accent/5 flex items-center justify-center text-brand-accent mb-12 group-hover:bg-brand-accent group-hover:text-black transition-all rotate-3 skew-x-3 group-hover:rotate-0 group-hover:skew-x-0 border border-brand-accent/10">
                  <item.icon size={32} />
                </div>
                <h3 className="font-display font-black text-3xl mb-4 uppercase tracking-tighter text-[var(--text-primary)]">{item.title}</h3>
                <p className="text-[var(--text-secondary)] mb-8 leading-relaxed text-sm font-sans uppercase tracking-widest">{item.desc}</p>
                <button className="flex items-center gap-4 text-brand-accent font-black text-[10px] uppercase tracking-[0.4em] group-hover:gap-6 transition-all">
                  Full Specs <ArrowRight size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="py-32 bg-brand-bg-dark scroll-mt-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-10">
            <div className="max-w-xl">
              <span className="text-brand-accent text-xs font-black uppercase tracking-[0.5em] mb-4 block font-display">THE CATALOGUE</span>
              <h2 className="text-5xl md:text-7xl font-display font-black text-[var(--text-primary)] uppercase tracking-tighter leading-[0.9]">
                Advanced <span className="text-brand-accent italic">Systems</span>
              </h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
              <div className="relative group min-w-[280px]">
                <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-50 group-focus-within:text-brand-accent transition-colors" />
                <input 
                  type="text" 
                  placeholder="SEARCH SPECIFICATIONS..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] pl-14 pr-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] focus:border-brand-accent outline-none transition-all placeholder:text-[var(--text-secondary)]/30"
                />
              </div>
              <div className="flex bg-[var(--bg-card)] border border-[var(--border-color)] p-1 overflow-x-auto no-scrollbar whitespace-nowrap lg:whitespace-normal">
                {categories.map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all flex-shrink-0 lg:flex-shrink-1 ${activeCategory === cat ? 'bg-brand-accent text-black' : 'text-[var(--text-secondary)]/50 hover:text-[var(--text-primary)]'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8"
          >
            <AnimatePresence mode='popLayout'>
              {filteredProducts.map((product) => (
                <motion.div 
                  layout
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedProduct(product)}
                  className="group bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-brand-accent/50 transition-all p-0 cursor-pointer relative overflow-hidden shadow-sm hover:shadow-2xl"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-white/50 backdrop-blur-sm dark:bg-black flex items-center justify-center">
                    <motion.img 
                      layoutId={`img-${product.id}`}
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-contain grayscale brightness-50 dark:brightness-50 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-110 transition-all duration-1000 p-8" 
                    />
                    {product.discount && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-black px-3 py-1.5 uppercase tracking-widest flex items-center gap-1 z-10 shadow-2xl skew-x-[-10deg]">
                        <Zap size={10} className="fill-white" /> {product.discount}% OFF
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t dark:from-black dark:via-black/80 from-white via-white/80 to-transparent">
                      <button className="w-full bg-[var(--text-primary)] text-[var(--bg-dark)] font-black py-4 text-[9px] uppercase tracking-[0.3em] active:scale-95 transition-all">
                        Technical Specs
                      </button>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-[var(--text-secondary)] opacity-30 text-[9px] uppercase font-black tracking-[0.3em] font-display">{product.category}</p>
                      <div className="flex items-center gap-1 text-brand-accent">
                        <Star size={10} className="fill-current" />
                        <span className="text-[10px] font-bold">{product.rating || 'NEW'}</span>
                      </div>
                    </div>
                    <h3 className="font-display font-black text-xl text-[var(--text-primary)] uppercase tracking-tighter mb-6 group-hover:text-brand-accent transition-colors truncate">{product.name}</h3>
                    <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-6">
                      <div className="flex flex-col">
                        {product.discount ? (
                          <>
                            <span className="font-mono font-black text-brand-accent text-lg tracking-tighter">৳ {(product.priceValue * (1 - product.discount / 100)).toLocaleString()}</span>
                            <span className="font-mono text-[10px] text-[var(--text-secondary)]/30 line-through">৳ {product.priceValue.toLocaleString()}</span>
                          </>
                        ) : (
                          <span className="font-mono font-black text-brand-accent text-lg tracking-tighter">৳ {product.priceValue.toLocaleString()}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
                          className={`transition-colors p-2.5 bg-[var(--border-color)]/20 border border-[var(--border-color)] hover:border-brand-accent/50 ${isInWishlist(product.id) ? 'text-brand-accent' : 'text-[var(--text-secondary)]/20 hover:text-brand-accent'}`}
                        >
                          <Heart size={16} className={isInWishlist(product.id) ? "fill-brand-accent" : ""} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                          className="text-[var(--text-secondary)]/40 hover:text-brand-accent transition-colors p-2.5 bg-[var(--border-color)]/20 border border-[var(--border-color)] hover:border-brand-accent/50"
                        >
                          <ShoppingCart size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          {filteredProducts.length === 0 && (
            <div className="py-40 text-center border border-dashed border-[var(--border-color)]">
              <p className="text-[var(--text-secondary)]/20 font-black uppercase tracking-[0.5em]">No matching systems found in database</p>
            </div>
          )}
        </div>
      </section>

      <ProductModal 
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        isInWishlist={selectedProduct ? isInWishlist(selectedProduct.id) : false}
        onAddReview={onAddReview}
        customer={customer}
      />
    </>
  );
}

function CustomerAuth({ onLogin, onRegister, companyName }: { onLogin: (email: string, pw: string) => boolean | string | Promise<boolean | string>, onRegister: (data: any) => boolean | string | Promise<boolean | string>, companyName: string }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLogin) {
      const result = await Promise.resolve(onLogin(formData.email, formData.password));
      if (result === true) {
        // Success
      } else {
        setError(typeof result === 'string' ? result : 'Invalid credentials');
      }
    } else {
      const result = await Promise.resolve(onRegister(formData));
      if (result === true) {
        setSuccess('Account created successfully! Please login.');
        setIsLogin(true);
      } else {
        setError(typeof result === 'string' ? result : 'Registration failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg-dark flex items-center justify-center p-6 pt-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-brand-bg-card border border-white/5 p-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-accent/10 text-brand-accent rounded-full mb-6">
            <User size={32} />
          </div>
          <h2 className="font-display font-bold text-2xl uppercase tracking-tighter text-white">
            {isLogin ? 'Customer' : 'Join'} <span className="text-brand-accent">{isLogin ? 'Login' : 'Us'}</span>
          </h2>
          <p className="text-white/40 text-xs uppercase tracking-[0.2em] mt-2">{companyName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Full Name</label>
              <input 
                required 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-brand-accent outline-none transition-colors text-white" 
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Email Address</label>
            <input 
              required 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-brand-accent outline-none transition-colors text-white" 
            />
          </div>
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Phone Number</label>
              <input 
                required 
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-brand-accent outline-none transition-colors text-white font-mono" 
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Password</label>
            <input 
              required 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-brand-accent outline-none transition-colors text-white font-mono" 
            />
          </div>

          {error && <p className="text-red-500 text-[10px] uppercase font-bold tracking-wider">{error}</p>}
          {success && <p className="text-green-500 text-[10px] uppercase font-bold tracking-wider">{success}</p>}

          <button type="submit" className="w-full py-4 bg-brand-accent text-black font-bold uppercase text-xs tracking-widest hover:brightness-110 transition-all">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-brand-accent transition-colors"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CustomerProfile({ customer, orders, onLogout, wishlist, onToggleWishlist, onAddToCart }: { customer: Customer, orders: Order[], onLogout: () => void, wishlist: WishlistItem[], onToggleWishlist: (p: Product) => void, onAddToCart: (p: Product) => void }) {
  const customerOrders = orders.filter(o => o.customerId === customer.id);
  const customerWishlist = wishlist;

  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-bg-dark text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
          <div>
            <h1 className="font-display font-bold text-4xl uppercase tracking-tighter text-white">My <span className="text-brand-accent">Profile</span></h1>
            <p className="text-white/40 text-xs uppercase tracking-widest mt-2">{customer.name} • {customer.email}</p>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 border border-white/10 text-white/50 hover:text-white hover:bg-white/5 font-bold text-xs uppercase tracking-widest transition-all rounded-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-brand-bg-card border border-white/5 p-8">
               <h3 className="font-display font-bold text-lg uppercase tracking-tight text-white mb-6 flex items-center gap-3">
                  <User size={18} className="text-brand-accent" /> Account Details
               </h3>
               <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase text-white/30 font-bold block mb-1">Phone</span>
                    <span className="text-sm font-mono">{customer.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-white/30 font-bold block mb-1">Email</span>
                    <span className="text-sm">{customer.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-white/30 font-bold block mb-1">Member Since</span>
                    <span className="text-sm">{new Date(customer.createdAt).toLocaleDateString()}</span>
                  </div>
               </div>
            </div>

            <div className="bg-brand-bg-card border border-white/5 p-8">
               <h3 className="font-display font-bold text-lg uppercase tracking-tight text-white mb-6 flex items-center gap-3">
                  <Heart size={18} className="text-brand-accent fill-brand-accent" /> Wishlist
               </h3>
               <div className="space-y-4">
                  {customerWishlist.length === 0 ? (
                    <p className="text-[10px] uppercase text-white/20 font-bold">Empty Wishlist</p>
                  ) : (
                    customerWishlist.map((item) => (
                      <div key={item.id} className="flex gap-4 group">
                        <div className="w-12 h-12 bg-black shrink-0 border border-white/5 overflow-hidden">
                           <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        </div>
                        <div className="min-w-0 flex-1">
                           <h4 className="text-[10px] uppercase font-bold text-white truncate group-hover:text-brand-accent transition-colors">{item.name}</h4>
                           <p className="text-brand-accent font-mono text-[10px] mb-2">৳ {item.priceValue.toLocaleString()}</p>
                           <div className="flex gap-2">
                             <button 
                               onClick={() => onAddToCart({ id: item.id, name: item.name, priceValue: item.priceValue, image: item.image, category: '', description: '', warranty: '', stock: 0 })}
                               className="text-[8px] uppercase tracking-widest font-bold text-white hover:text-brand-accent transition-colors"
                             >
                               Move to Cart
                             </button>
                             <button 
                               onClick={() => onToggleWishlist({ id: item.id, name: item.name, priceValue: item.priceValue, image: item.image, category: '', description: '', warranty: '', stock: 0 })}
                               className="text-[8px] uppercase tracking-widest font-bold text-red-500/50 hover:text-red-500 transition-colors"
                             >
                               Remove
                             </button>
                           </div>
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-display font-bold text-lg uppercase tracking-tight text-white mb-8 flex items-center gap-3">
               <Package size={18} className="text-brand-accent" /> Order History
            </h3>
            
            <div className="space-y-6">
              {customerOrders.length === 0 ? (
                <div className="text-center py-24 bg-[#050505] border border-dashed border-white/5">
                  <Package size={32} className="mx-auto text-white/10 mb-6" />
                  <p className="text-white/30 uppercase tracking-[0.5em] text-[10px] font-black">No active deployments found</p>
                </div>
              ) : (
                customerOrders.map((order) => (
                  <div key={order.id} className="bg-brand-bg-card border border-white/5 p-10 space-y-10 group hover:border-brand-accent/30 transition-all">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                           <span className="text-[10px] uppercase text-white/30 font-black tracking-[0.3em]">Tracking ID</span>
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                        </div>
                        <span className="font-mono text-xl text-brand-accent font-black tracking-tighter uppercase">{order.id}</span>
                      </div>
                      <div className="flex items-center gap-12">
                        <div className="text-right">
                           <span className="text-[10px] uppercase text-white/30 font-black tracking-[0.3em] block mb-2">Systems</span>
                           <span className="text-white font-black text-xl">{order.items.length}</span>
                        </div>
                        <div className="text-right">
                           <span className="text-[10px] uppercase text-white/30 font-black tracking-[0.3em] block mb-2">Final Investment</span>
                           <span className="font-mono text-2xl font-black text-brand-accent tracking-tighter">৳ {order.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between font-black uppercase text-[10px] tracking-[0.4em] text-white/40">
                         <span>Deployment Progress</span>
                         <span className="text-brand-accent italic">{order.status}</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden flex gap-1">
                        {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => {
                          const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
                          const currentIndex = steps.indexOf(order.status);
                          return (
                            <div key={step} className={`h-full flex-1 transition-all duration-1000 ${idx <= currentIndex ? 'bg-brand-accent' : 'bg-white/5'}`} />
                          )
                        })}
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                         {['Queue', 'Technical Prep', 'In Transit', 'Completed'].map((label, idx) => {
                            const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
                            const currentIndex = steps.indexOf(order.status);
                            return (
                               <div key={label} className={`text-[9px] uppercase font-black tracking-widest transition-colors ${idx <= currentIndex ? 'text-brand-accent' : 'text-white/10'}`}>
                                  {label}
                               </div>
                            )
                         })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-white/5">
                       <div className="space-y-6">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Deployment Components</p>
                          <div className="space-y-3">
                             {order.items.map((item, idx) => (
                               <div key={idx} className="flex justify-between items-center bg-black/40 p-5 border border-white/5 group/item hover:border-brand-accent/30 transition-colors">
                                 <div className="flex items-center gap-4">
                                   <span className="text-brand-accent font-mono text-xs font-black">0{idx+1}</span>
                                   <div className="flex flex-col">
                                      <span className="text-xs font-black text-white uppercase tracking-tighter">{item.name}</span>
                                      <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest">{item.category || 'System Component'}</span>
                                   </div>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-[10px] text-white font-mono font-black tracking-tighter">৳ {(item.priceValue * item.quantity).toLocaleString()}</p>
                                    <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">Qty: {item.quantity}</p>
                                 </div>
                               </div>
                             ))}
                          </div>
                       </div>
                       <div className="bg-brand-accent/[0.01] border border-brand-accent/10 p-10 flex flex-col justify-center relative overflow-hidden group/note">
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/note:opacity-20 transition-opacity">
                             <Settings size={80} className="text-brand-accent animate-spin-slow" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent mb-6">Service Engineer Logs</p>
                          <p className="text-sm text-white/50 leading-relaxed font-light italic relative z-10">
                             {order.status === 'Pending' && "System components are in the engineering queue. Final compatibility checks will be performed within 24 hours."}
                             {order.status === 'Processing' && "Technical preparation in progress. Units are undergoing stress tests and calibration for optimal performance."}
                             {order.status === 'Shipped' && "Deployment unit is active. Logistics team has secured the high-precision arrays for site delivery."}
                             {order.status === 'Delivered' && "Deployment finalized. Installation verified and performance benchmarks met. System live under warranty."}
                          </p>
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, subtext }: { title: string, value: string | number, icon: any, trend?: { label: string, positive: boolean }, subtext?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="w-10 h-10 bg-gray-50 flex items-center justify-center text-gray-400 rounded-xl">
          <Icon size={20} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1.5 rounded-full ${trend.positive ? 'bg-black text-white' : 'bg-red-50 text-red-600 border border-red-100'}`}>
             {trend.positive ? <div className="p-0.5 bg-white/20 rounded-full"><TrendingUp size={10} /></div> : <TrendingDown size={10} />}
             {trend.label}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
        {subtext && <p className="text-[10px] text-gray-400 mt-2 font-medium">{subtext}</p>}
      </div>
    </motion.div>
  );
}

function SidebarItem({ icon: Icon, label, active, soon, onClick }: { icon: any, label: string, active?: boolean, soon?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={!soon ? onClick : undefined}
      className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all group ${active ? 'bg-white shadow-sm ring-1 ring-gray-100' : 'hover:bg-gray-50 text-gray-500 hover:text-gray-900'}`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={active ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-900'} />
        <span className={`text-[13px] font-semibold ${active ? 'text-gray-900' : ''}`}>{label}</span>
      </div>
      {soon && (
        <span className="text-[9px] font-bold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-md uppercase tracking-wide">Soon</span>
      )}
    </div>
  );
}

function AdminPanel({ 
  products, orders, customers = [], onAddProduct, onUpdateProduct, onDeleteProduct, 
  onUpdateOrderStatus, onLogout, whatsappNumber, onUpdateWhatsapp, 
  paymentPhoneNumber, onUpdatePaymentPhone, companyName, onUpdateCompanyName, 
  deliverySettings, onUpdateDeliverySettings, categories, onUpdateCategories 
}: any) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    const exists = categories.find((c: Category) => c.name.toLowerCase() === newCategory.trim().toLowerCase());
    if (exists) return;
    
    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.trim()
    };
    onUpdateCategories([...categories, category]);
    setNewCategory('');
  };

  const handleRemoveCategory = (id: string) => {
    onUpdateCategories(categories.filter((c: Category) => c.id !== id));
  };

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    priceValue: 0,
    image: '',
    description: '',
    warranty: '',
    stock: 0,
    discount: 0
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        category: editingProduct.category,
        priceValue: editingProduct.priceValue,
        image: editingProduct.image,
        description: editingProduct.description,
        warranty: editingProduct.warranty,
        stock: editingProduct.stock,
        discount: editingProduct.discount || 0
      });
    } else {
      setFormData({
        name: '',
        category: '',
        priceValue: 0,
        image: '',
        description: '',
        warranty: '',
        stock: 0,
        discount: 0
      });
    }
  }, [editingProduct]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const productData = {
      ...formData,
      id: editingProduct ? editingProduct.id : Date.now(),
      rating: editingProduct ? editingProduct.rating : 5,
      reviews: editingProduct ? editingProduct.reviews : []
    };

    if (editingProduct) {
      onUpdateProduct(productData);
    } else {
      onAddProduct(productData);
    }
    setView('list');
    setEditingProduct(null);
  };
  
  // Dashboard Stats
  const totalRevenue = orders.filter((o: Order) => o.status === 'Completed').reduce((acc: number, o: Order) => acc + o.total, 0);
  const pendingOrders = orders.filter((o: Order) => o.status === 'Pending').length;
  const lowStockProducts = products.filter((p: Product) => p.stock < 10);

  // Chart Data
  const chartData = [
    { name: 'Feb 4', activity: 200 },
    { name: 'Feb 9', activity: 250 },
    { name: 'Feb 15', activity: 180 },
    { name: 'Feb 21', activity: 320 },
    { name: 'Feb 27', activity: 210 },
    { name: 'Mar 5', activity: 480 },
    { name: 'Mar 11', activity: 190 },
    { name: 'Mar 17', activity: 580 },
    { name: 'Mar 23', activity: 200 },
    { name: 'Mar 29', activity: 720 },
    { name: 'Apr 4', activity: 250 },
    { name: 'Apr 9', activity: 610 },
    { name: 'Apr 15', activity: 200 },
    { name: 'Apr 21', activity: 540 },
    { name: 'Apr 28', activity: 210 },
  ];

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setView('edit');
  };

  const filteredProducts = products.filter((p: Product) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter((o: Order) => 
    orderFilter === 'All' || o.status === orderFilter
  );

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden relative pt-[72px] md:pt-[100px]">
      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-72 bg-[#F9FAFB] border-r border-gray-200 flex flex-col p-6 overflow-y-auto no-scrollbar z-50 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black">
              {companyName?.[0] || 'T'}
            </div>
            <h1 className="text-lg font-black tracking-tight text-gray-900">{companyName} Admin</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-400 hover:text-gray-900 transition-colors">
            <XIcon size={20} />
          </button>
        </div>

        <div className="flex items-center justify-between mb-8">
           <button 
             onClick={() => { setActiveTab('products'); setView('edit'); setEditingProduct(null); setIsSidebarOpen(false); }}
             className="flex-1 bg-black text-white flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-sm shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
           >
             <Plus size={16} /> Quick Create
           </button>
           <button className="ml-3 p-3 border border-gray-200 rounded-xl text-gray-400 bg-white hover:bg-gray-50 transition-colors">
              <Mail size={18} />
           </button>
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4 px-4">Dashboards</p>
            <div className="space-y-1">
              <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
              <SidebarItem icon={Box} label="Products" active={activeTab === 'products'} onClick={() => { setActiveTab('products'); setView('list'); setIsSidebarOpen(false); }} />
              <SidebarItem icon={ShoppingCart} label="Orders" active={activeTab === 'orders'} onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }} />
              <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4 px-4">Pages (Mockup)</p>
            <div className="space-y-1">
              <SidebarItem icon={Mail} label="Email" soon />
              <SidebarItem icon={MessageSquare} label="Chat" soon />
              <SidebarItem icon={Calendar} label="Calendar" soon />
              <SidebarItem icon={Users} label="Customers" soon />
            </div>
          </div>
        </div>

        <div className="mt-auto pt-10">
           <div className="bg-white border border-gray-100 p-6 rounded-2xl mb-8 shadow-sm">
              <p className="text-sm font-black text-gray-900 mb-2">Looking for something more?</p>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">Open an issue or do reach out to me on <span className="font-bold text-gray-900">X</span>.</p>
              <button className="w-full py-2 bg-gray-50 text-xs font-bold rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">Contact Support</button>
           </div>

           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden p-1">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Arham" className="w-full h-full object-cover" alt="Profile" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">Arham Khan</p>
                    <p className="text-[10px] text-gray-400 truncate tracking-tight">hello@arhamkhnz.com</p>
                 </div>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Header */}
        <header className="h-16 md:h-20 border-b border-gray-100 bg-white flex items-center justify-between px-4 md:px-8 shrink-0">
           <div className="flex items-center gap-4 md:gap-8">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-900 transition-colors"
              >
                 <Menu size={20} />
              </button>
              <div className="hidden md:flex relative group min-w-[300px]">
                 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                 <input 
                   type="text" 
                   placeholder="Search..." 
                   className="w-full bg-gray-50 border border-transparent pl-12 pr-4 py-2.5 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-gray-200 outline-none transition-all placeholder:text-gray-400"
                 />
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300 bg-white px-2 py-1 border border-gray-100 rounded-lg">⌘ J</div>
              </div>
              <div className="md:hidden">
                <Search size={18} className="text-gray-400" />
              </div>
           </div>

           <div className="flex items-center gap-4">
              <div className="flex items-center p-1 bg-gray-50 rounded-xl border border-gray-100">
                 <button className="p-2 text-gray-500 hover:bg-white hover:text-gray-900 rounded-lg transition-all"><Settings size={18} /></button>
                 <button className="p-2 text-gray-500 hover:bg-white hover:text-gray-900 rounded-lg transition-all" onClick={onLogout}><Moon size={18} /></button>
                 <button className="p-2 text-gray-500 hover:bg-white hover:text-gray-900 rounded-lg transition-all"><Globe size={18} /></button>
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" className="w-full h-full" alt="" />
              </div>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-10 space-y-6 md:space-y-10 bg-[#F9FAFB]/50">
           {activeTab === 'dashboard' && (
             <>
               {/* Stats Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    title="Total Revenue" 
                    value={`৳ ${totalRevenue.toLocaleString()}`} 
                    icon={DollarSign}
                    trend={{ label: '+12.5%', positive: true }} 
                    subtext="Sales for current month"
                  />
                  <StatCard 
                    title="Pending Orders" 
                    value={pendingOrders.toString()} 
                    icon={ShoppingCart}
                    trend={{ label: 'Needs action', positive: false }} 
                    subtext="Waiting for processing"
                  />
                  <StatCard 
                    title="Low Stock" 
                    value={lowStockProducts.length.toString()} 
                    icon={Box}
                    trend={{ label: 'Alert', positive: false }} 
                    subtext="Products below 10 units"
                  />
                  <StatCard 
                    title="Total Products" 
                    value={products.length.toString()} 
                    icon={Package}
                    trend={{ label: 'Active', positive: true }} 
                    subtext="Total items in catalog"
                  />
               </div>

               {/* Activity Chart */}
               <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                  <div className="flex justify-between items-start mb-10">
                     <div>
                        <h3 className="text-base font-black text-gray-900">Revenue Overview</h3>
                        <p className="text-xs text-gray-400 mt-1 font-medium">Daily revenue trends for the last 15 periods</p>
                     </div>
                  </div>

                  <div className="h-[350px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                           <defs>
                              <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#000" stopOpacity={0.03}/>
                                 <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <XAxis 
                             dataKey="name" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 600 }} 
                             dy={20}
                           />
                           <YAxis hide />
                           <Tooltip 
                             cursor={{ stroke: '#F3F4F6' }}
                             contentStyle={{ backgroundColor: '#fff', border: '1px solid #F3F4F6', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                           />
                           <Area 
                             type="monotone" 
                             dataKey="activity" 
                             stroke="#000" 
                             strokeWidth={2} 
                             fillOpacity={1} 
                             fill="url(#colorActivity)" 
                           />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* Customers List Section */}
               <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                     <div>
                        <h3 className="text-base font-black text-gray-900">Recent Customers</h3>
                        <p className="text-xs text-gray-400 mt-1 font-medium">Overview of recently registered user profiles.</p>
                     </div>
                  </div>

                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="border-b border-gray-50">
                              <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                              <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                              <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Signed Up</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                           {customers.length === 0 ? (
                             <tr>
                                <td colSpan={3} className="px-8 py-10 text-center text-xs text-gray-400">No customers found</td>
                             </tr>
                           ) : (
                             customers.slice(0, 5).map((c: any) => (
                               <tr key={c.email} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-8 py-4">
                                     <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-900 uppercase">
                                           {c.name.charAt(0)}
                                        </div>
                                        <span className="text-[13px] font-bold text-gray-900">{c.name}</span>
                                     </div>
                                  </td>
                                  <td className="px-8 py-4 text-xs text-gray-600">{c.email}</td>
                                  <td className="px-8 py-4 text-xs text-gray-400 font-mono">{new Date(c.createdAt).toLocaleDateString()}</td>
                               </tr>
                             ))
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
             </>
           )}

           {activeTab === 'products' && (
             <div className="space-y-6 md:space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div>
                      <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Product Catalog</h2>
                      <p className="text-xs text-gray-400 mt-1 font-medium">Manage your items, inventory, and active discounts</p>
                   </div>
                   <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="relative flex-1">
                         <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                         <input 
                           type="text" 
                           placeholder="Filter products..." 
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full bg-white border border-gray-100 pl-12 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-gray-200 transition-all shadow-sm"
                         />
                      </div>
                      <button 
                        onClick={() => { setView('edit'); setEditingProduct(null); }}
                        className="bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                      >
                         <Plus size={16} /> Add Product
                      </button>
                   </div>
                </div>

                {view === 'list' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={product.id} 
                        className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm group hover:shadow-md transition-all"
                      >
                         <div className="h-48 bg-gray-50 border-b border-gray-50 relative overflow-hidden">
                            <img src={product.image} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                            {product.discount > 0 && (
                              <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg">{product.discount}% OFF</div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                               <button onClick={() => handleEdit(product)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 hover:scale-110 transition-transform"><Settings size={18} /></button>
                               <button onClick={() => onDeleteProduct(product.id)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 hover:scale-110 transition-transform"><Trash2 size={18} /></button>
                            </div>
                         </div>
                         <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                               <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{product.category}</span>
                               <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${product.stock < 10 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                 {product.stock} in stock
                               </span>
                            </div>
                            <h4 className="text-sm font-bold text-gray-900 mb-4 line-clamp-1">{product.name}</h4>
                            <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                               <div>
                                  <p className="text-xs text-gray-400 line-through">৳ {product.priceValue.toLocaleString()}</p>
                                  <p className="text-base font-black text-gray-900 leading-none mt-1">৳ {(product.priceValue * (1 - (product.discount || 0) / 100)).toLocaleString()}</p>
                               </div>
                               <button onClick={() => handleEdit(product)} className="text-[10px] font-black uppercase text-gray-400 hover:text-gray-900 transition-colors">Edit Details</button>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-4xl bg-white border border-gray-100 rounded-3xl p-10 shadow-sm"
                  >
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
                       <button onClick={() => setView('list')} className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-lg transition-colors"><ArrowLeft size={20} /></button>
                       <div>
                          <h3 className="text-lg font-black text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">Fill in the details to update your catalog</p>
                       </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Product Name</label>
                             <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-5 py-3 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-gray-900 outline-none transition-all" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Category</label>
                             <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-5 py-3 rounded-2xl text-sm text-gray-900 focus:bg-white focus:border-gray-900 outline-none transition-all">
                                <option value="">Select Category</option>
                                {categories.map((cat: Category) => (
                                   <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                             </select>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Price (৳)</label>
                             <input required type="number" value={formData.priceValue} onChange={e => setFormData({...formData, priceValue: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-100 px-5 py-3 rounded-2xl text-xs font-mono text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-gray-900 outline-none transition-all" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Discount (%)</label>
                             <input type="number" value={formData.discount} onChange={e => setFormData({...formData, discount: parseInt(e.target.value) || 0})} className="w-full bg-gray-50 border border-gray-100 px-5 py-3 rounded-2xl text-xs font-mono text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-gray-900 outline-none transition-all" />
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Product Image</label>
                          <div className="flex flex-col md:flex-row gap-4">
                             <input required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="Image URL..." className="flex-1 bg-gray-50 border border-gray-100 px-5 py-3 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-gray-900 outline-none transition-all" />
                             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                             <button type="button" onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-gray-50 border border-gray-100 text-gray-600 font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all flex items-center gap-2">
                                <Upload size={16} /> Upload
                             </button>
                          </div>
                          {formData.image && <img src={formData.image} className="mt-4 w-32 h-32 object-contain bg-gray-50 rounded-2xl border border-gray-100 p-2" />}
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Warranty Details</label>
                          <input required value={formData.warranty} onChange={e => setFormData({...formData, warranty: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-5 py-3 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-gray-900 outline-none transition-all" />
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Stock Quantity</label>
                          <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-100 px-5 py-3 rounded-2xl text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-gray-900 outline-none transition-all" />
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Description</label>
                          <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl text-sm focus:bg-white focus:border-gray-900 outline-none transition-all resize-none" />
                       </div>

                       <button type="submit" className="w-full py-5 bg-black text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-black/10 hover:scale-[1.01] active:scale-[0.99] transition-all">
                         {editingProduct ? 'Update Product Catalog' : 'Publish Product'}
                       </button>
                    </form>
                  </motion.div>
                )}
             </div>
           )}

           {activeTab === 'orders' && (
             <div className="space-y-6 md:space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div>
                      <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Orders Management</h2>
                      <p className="text-xs text-gray-400 mt-1 font-medium">Handle fulfillment, tracking, and order history</p>
                   </div>
                   <div className="flex bg-gray-50 border border-gray-100 rounded-xl p-1 shadow-sm overflow-x-auto no-scrollbar">
                      {['All', 'Pending', 'Processing', 'Completed', 'Cancelled'].map((status) => (
                         <button 
                           key={status}
                           onClick={() => setOrderFilter(status as any)}
                           className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${orderFilter === status ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                         >
                            {status}
                         </button>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:gap-6">
                   {filteredOrders.length === 0 ? (
                     <div className="bg-white border border-gray-100 rounded-3xl p-20 text-center shadow-sm">
                        <Box size={48} className="mx-auto text-gray-200 mb-6" />
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">No orders found</h4>
                     </div>
                   ) : (
                     filteredOrders.map((order: Order) => (
                       <motion.div 
                         layout
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         key={order.id} 
                         className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm group hover:border-gray-200 transition-all"
                       >
                          <div className="flex flex-col lg:flex-row gap-10">
                             <div className="flex-1 space-y-8">
                                <div className="flex items-center justify-between lg:justify-start lg:gap-10">
                                   <div>
                                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">ID</p>
                                      <p className="text-sm font-mono font-black text-gray-900">{order.id}</p>
                                   </div>
                                   <div>
                                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Date</p>
                                      <p className="text-sm font-bold text-gray-900">{new Date(order.date).toLocaleDateString()}</p>
                                   </div>
                                   <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                      order.status === 'Completed' ? 'bg-green-50 text-green-600 border border-green-100' :
                                      order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                                      'bg-orange-50 text-orange-600 border border-orange-100'
                                   }`}>
                                      {order.status}
                                   </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-8 border-t border-gray-50">
                                   <div>
                                      <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2"><Users size={12} /> Customer Info</h5>
                                      <div className="space-y-1">
                                         <p className="text-sm font-black text-gray-900">{order.customerName}</p>
                                         <p className="text-xs text-gray-500 font-mono tracking-tighter">{order.phone}</p>
                                         <p className="text-[11px] text-gray-400 italic leading-relaxed">{order.address}</p>
                                      </div>
                                   </div>
                                   <div>
                                      <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2"><DollarSign size={12} /> Payment Details</h5>
                                      <div className="space-y-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                                         <div>
                                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Method</p>
                                            <div className="flex items-center gap-2">
                                               <div className={`w-2 h-2 rounded-full ${
                                                  order.paymentMethod === 'bKash' ? 'bg-[#D12053]' : 
                                                  order.paymentMethod === 'Nagad' ? 'bg-[#ED1C24]' : 'bg-[#8C3494]'
                                               }`} />
                                               <span className="text-xs font-black text-gray-900">{order.paymentMethod}</span>
                                            </div>
                                         </div>
                                         <div>
                                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Transaction ID</p>
                                            <p className="text-xs font-mono font-bold text-brand-accent bg-brand-accent/5 px-2 py-1 rounded inline-block uppercase">{order.transactionId}</p>
                                         </div>
                                         <div className="pt-2 border-t border-gray-100">
                                            <div className="flex items-center justify-between">
                                               <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Delivery Charge</p>
                                               <p className="text-xs font-black text-gray-900">৳{order.deliveryCharge || 0}</p>
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                   <div>
                                      <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2"><Box size={12} /> Order Items</h5>
                                      <div className="space-y-3">
                                         {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-[11px]">
                                               <span className="font-bold text-gray-900">{item.quantity}x <span className="text-gray-500 font-normal">{item.name}</span></span>
                                               <span className="font-mono text-gray-900">৳ {(item.priceValue * item.quantity).toLocaleString()}</span>
                                            </div>
                                         ))}
                                         <div className="flex justify-between items-center pt-3 border-t border-gray-50 border-dashed mt-3">
                                            <span className="text-[10px] font-black uppercase text-gray-400">Total Amount</span>
                                            <span className="text-base font-black text-gray-900">৳ {order.total.toLocaleString()}</span>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             </div>

                             <div className="lg:w-48 space-y-2 shrink-0">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Set Status</p>
                                {['Pending', 'Processing', 'Completed', 'Cancelled'].map((status) => (
                                   <button 
                                     key={status}
                                     onClick={() => onUpdateOrderStatus(order.id, status as any)}
                                     className={`w-full py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border ${order.status === status ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300 hover:text-gray-900'}`}
                                   >
                                      {status}
                                   </button>
                                ))}
                             </div>
                          </div>
                       </motion.div>
                     ))
                   )}
                </div>
             </div>
           )}

           {activeTab === 'settings' && (
             <div className="space-y-12">
                <div>
                   <h2 className="text-2xl font-black text-gray-900 tracking-tight">System Settings</h2>
                   <p className="text-xs text-gray-400 mt-1 font-medium">Configure global platform parameters and integrations</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm space-y-8 relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 text-gray-50 group-hover:text-gray-100 transition-colors">
                         <LayoutDashboard size={160} className="rotate-12" />
                      </div>
                      
                      <div className="relative z-10">
                         <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100">
                               <LayoutDashboard size={24} />
                            </div>
                            <div>
                               <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">General Settings</h3>
                               <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Manage store information</p>
                            </div>
                         </div>

                         <div className="mb-10 pb-10 border-b border-gray-50">
                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Product Categories</h4>
                            <div className="flex gap-2 mb-4">
                               <input 
                                  type="text" 
                                  placeholder="New Category..." 
                                  value={newCategory} 
                                  onChange={(e) => setNewCategory(e.target.value)} 
                                  className="flex-1 bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-xl text-xs text-gray-900 outline-none focus:bg-white focus:border-gray-900 transition-all font-mono"
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                               />
                               <button onClick={handleAddCategory} className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors">
                                  <Plus size={16} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                               {categories.map((cat: Category) => (
                                  <div key={cat.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                                     <span className="text-[10px] font-black uppercase text-gray-900 tracking-tight">{cat.name}</span>
                                     <button onClick={() => handleRemoveCategory(cat.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                        <Trash2 size={12} />
                                     </button>
                                  </div>
                               ))}
                            </div>
                         </div>

                         <div className="space-y-6">
                            <div>
                               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3 px-1">Company Name</label>
                               <div className="relative">
                                  <Briefcase size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                                  <input 
                                     type="text" 
                                     placeholder="e.g. Tasnim Power Engineering"
                                     value={companyName}
                                     onChange={(e) => onUpdateCompanyName(e.target.value)}
                                     className="w-full bg-gray-50 border border-gray-100 pl-14 pr-6 py-4 rounded-2xl text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-gray-900 outline-none transition-all"
                                  />
                               </div>
                               <p className="text-[9px] text-gray-400 mt-3 px-1">This name will be displayed throughout the store and in invoices.</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm space-y-8 relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 text-gray-50 group-hover:text-gray-100 transition-colors">
                         <Truck size={160} className="rotate-12" />
                      </div>
                      
                      <div className="relative z-10">
                         <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                               <Truck size={24} />
                            </div>
                            <div>
                               <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Delivery Settings</h3>
                               <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Manage delivery charges by region</p>
                            </div>
                         </div>

                         <div className="space-y-6">
                            {deliverySettings?.map((setting: DeliverySetting, idx: number) => (
                              <div key={setting.id} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-3">
                                 <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{setting.label}</span>
                                    <div className="flex items-center gap-2">
                                       <span className="text-xs font-black text-gray-900">৳</span>
                                       <input 
                                          type="number"
                                          value={setting.amount}
                                          onChange={(e) => {
                                             const newSettings = [...deliverySettings];
                                             newSettings[idx] = { ...setting, amount: parseInt(e.target.value) || 0 };
                                             onUpdateDeliverySettings(newSettings);
                                          }}
                                          className="w-20 bg-white border border-gray-100 px-3 py-1 rounded-lg text-xs font-black text-brand-accent outline-none focus:border-brand-accent transition-all"
                                       />
                                    </div>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm space-y-8 relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 text-gray-50 group-hover:text-gray-100 transition-colors">
                         <DollarSign size={160} className="rotate-12" />
                      </div>
                      
                      <div className="relative z-10">
                         <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-accent border border-brand-accent/20">
                               <DollarSign size={24} />
                            </div>
                            <div>
                               <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Payment Settings</h3>
                               <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Mobile banking receive numbers</p>
                            </div>
                         </div>

                         <div className="space-y-6">
                            <div>
                               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3 px-1">bKash/Nagad/Rocket Number</label>
                               <div className="relative">
                                  <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                                  <input 
                                     type="text" 
                                     placeholder="e.g. 01619184281"
                                     value={paymentPhoneNumber}
                                     onChange={(e) => onUpdatePaymentPhone(e.target.value)}
                                     className="w-full bg-gray-50 border border-gray-100 pl-14 pr-6 py-4 rounded-2xl text-sm font-mono text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-900 outline-none transition-all"
                                  />
                               </div>
                               <p className="text-[9px] text-gray-400 mt-3 px-1">The personal number where customers will send money during checkout.</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm space-y-8 relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 text-gray-50 group-hover:text-gray-100 transition-colors">
                         <MessageSquare size={160} className="rotate-12" />
                      </div>
                      
                      <div className="relative z-10">
                         <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 border border-green-100">
                               <MessageSquare size={24} className="fill-current" />
                            </div>
                            <div>
                               <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">WhatsApp Integration</h3>
                               <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Customer support widget</p>
                            </div>
                         </div>

                         <div className="space-y-6">
                            <div>
                               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3 px-1">WhatsApp phone number</label>
                               <div className="relative">
                                  <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                                  <input 
                                     type="text" 
                                     placeholder="e.g. 8801700000000"
                                     value={whatsappNumber}
                                     onChange={(e) => onUpdateWhatsapp(e.target.value)}
                                     className="w-full bg-gray-50 border border-gray-100 pl-14 pr-6 py-4 rounded-2xl text-sm font-mono text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-900 outline-none transition-all"
                                  />
                               </div>
                               <p className="text-[9px] text-gray-400 mt-3 px-1 ring-offset-2">Include country code without '+' (e.g., 88017xxxxxxxx)</p>
                            </div>

                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                               <div className={`w-3 h-3 rounded-full ${whatsappNumber ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                               <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                                  Widget Status: {whatsappNumber ? 'Live' : 'Missing Number'}
                               </span>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white border border-gray-100 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center opacity-50 cursor-not-allowed">
                      <Globe size={40} className="text-gray-200 mb-6" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">SEO Management</h3>
                      <p className="text-[9px] uppercase tracking-widest text-gray-300 mt-2">Feature coming in version 2.0</p>
                   </div>
                </div>
             </div>
           )}
        </div>
      </main>
    </div>
  );
}


function FloatingWhatsApp({ number }: { number: string }) {
  if (!number) return null;
  
  // Clean the number for the link - keep only digits
  const cleanNumber = number.replace(/\D/g, '');
  
  return (
    <motion.a
      href={`https://wa.me/${cleanNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[100] w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:shadow-[0_0_20px_rgba(37,211,102,0.5)] transition-all"
    >
      <MessageSquare className="fill-current" size={28} />
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
      </span>
    </motion.a>
  );
}

function TasnimApp() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('tp_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('tp_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const [whatsappNumber, setWhatsappNumber] = useState(() => localStorage.getItem('tp_whatsapp') || '');
  const [paymentPhoneNumber, setPaymentPhoneNumber] = useState(() => localStorage.getItem('tp_payment_phone') || '01619184281');
  const [companyName, setCompanyName] = useState(() => localStorage.getItem('tp_company_name') || 'Tasnim Power Engineering');
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('tp_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });
  const [deliverySettings, setDeliverySettings] = useState<DeliverySetting[]>(() => {
    const saved = localStorage.getItem('tp_delivery_settings');
    return saved ? JSON.parse(saved) : [
      { id: 'inside', label: 'Inside Dhaka', amount: 60 },
      { id: 'outside', label: 'Outside Dhaka', amount: 120 }
    ];
  });

  useEffect(() => {
    supabase.from('settings').upsert({ key: 'whatsapp_number', value: whatsappNumber }).then();
  }, [whatsappNumber]);

  useEffect(() => {
    supabase.from('settings').upsert({ key: 'payment_phone', value: paymentPhoneNumber }).then();
  }, [paymentPhoneNumber]);

  useEffect(() => {
    supabase.from('settings').upsert({ key: 'company_name', value: companyName }).then();
  }, [companyName]);

  useEffect(() => {
    supabase.from('settings').upsert({ key: 'categories', value: categories }).then();
  }, [categories]);

  useEffect(() => {
    supabase.from('settings').upsert({ key: 'delivery_settings', value: deliverySettings }).then();
  }, [deliverySettings]);

  useEffect(() => {
    async function loadData() {
      try {
        // Products
        const { data: pData } = await supabase.from('products').select('*');
        if (pData && pData.length > 0) {
          setProducts(pData);
        } else {
          setProducts(DEFAULT_PRODUCTS);
          // Ensure default products are correctly mapped to DB
          const productsToInsert = DEFAULT_PRODUCTS.map(p => ({
            ...p,
            id: p.id.toString(),
          }));
          await supabase.from('products').insert(productsToInsert).select();
        }
        
        // Orders
        const { data: oData } = await supabase.from('orders').select('*').order('date', { ascending: false });
        if (oData && oData.length > 0) setOrders(oData);

        // Customers
        const { data: cData } = await supabase.from('customers').select('*');
        if (cData && cData.length > 0) setCustomers(cData);

        // Settings
        const { data: sData } = await supabase.from('settings').select('*');
        if (sData && sData.length > 0) {
          const getSetting = (key: string) => sData.find(s => s.key === key)?.value;
          const w = getSetting('whatsapp_number'); if (w !== undefined) setWhatsappNumber(w);
          const pp = getSetting('payment_phone'); if (pp !== undefined) setPaymentPhoneNumber(pp);
          const cn = getSetting('company_name'); if (cn !== undefined) setCompanyName(cn);
          const cat = getSetting('categories'); if (cat !== undefined) setCategories(cat);
          const ds = getSetting('delivery_settings'); if (ds !== undefined) setDeliverySettings(ds);
        }
      } catch (err) {
        console.error('Failed to fetch from Supabase:', err);
        setProducts(DEFAULT_PRODUCTS);
      }

      // Local storage items
      const cartSaved = localStorage.getItem('tp_cart');
      if (cartSaved) setCart(JSON.parse(cartSaved));
      
      const wishlistSaved = localStorage.getItem('tp_wishlist');
      if (wishlistSaved) setWishlist(JSON.parse(wishlistSaved));
  
      const currentCustomerSaved = localStorage.getItem('tp_current_customer');
      if (currentCustomerSaved) setCurrentCustomer(JSON.parse(currentCustomerSaved));
  
      const authSaved = localStorage.getItem('tp_admin_auth');
      if (authSaved === 'true') setIsAdminAuthenticated(true);
    }
    
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('tp_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('tp_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (currentCustomer) localStorage.setItem('tp_current_customer', JSON.stringify(currentCustomer));
    else localStorage.removeItem('tp_current_customer');
  }, [currentCustomer]);

  const handleAdminLogin = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('tp_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('tp_admin_auth');
  };

  const handleCustomerLogin = async (email: string, pw: string) => {
    const { data } = await supabase.from('customers').select('*').eq('email', email).eq('password', pw).single();
    if (data) {
      setCurrentCustomer(data);
      if (!customers.find(c => c.id === data.id)) {
        setCustomers([...customers, data]);
      }
      return true;
    }
    return 'Invalid email or password';
  };

  const handleCustomerRegister = async (data: any) => {
    if (customers.find(c => c.email === data.email)) {
      return 'Email already exists';
    }
    const newCustomer: Customer = {
      id: `CUST-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString()
    };
    const { data: inserted, error } = await supabase.from('customers').insert([newCustomer]).select();
    if (error) {
      console.error(error);
      return `Failed to register: ${error.message}`;
    }
    setCustomers([...customers, inserted ? inserted[0] : newCustomer]);
    return true;
  };

  const handleCustomerLogout = () => {
    setCurrentCustomer(null);
  };

  const placeOrder = async (customerInfo: { name: string, phone: string, address: string, paymentMethod: string, transactionId: string, deliveryCharge: number, customerId?: string }) => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      customerId: customerInfo.customerId,
      customerName: customerInfo.name,
      phone: customerInfo.phone,
      address: customerInfo.address,
      items: [...cart],
      total: cartTotal + customerInfo.deliveryCharge,
      status: 'Pending',
      paymentMethod: customerInfo.paymentMethod,
      transactionId: customerInfo.transactionId,
      deliveryCharge: customerInfo.deliveryCharge,
      date: new Date().toISOString()
    };
    
    await supabase.from('orders').insert(newOrder);

    setOrders([newOrder, ...orders]);
    setCart([]);
    return newOrder.id;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleAddReview = async (productId: number | string, rating: number, comment: string) => {
    if (!currentCustomer) return;
    
    const newReview: Review = {
      id: Date.now().toString(),
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      rating,
      comment,
      date: new Date().toISOString()
    };

    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) return;

    const updatedReviews = targetProduct.reviews ? [...targetProduct.reviews, newReview] : [newReview];
    
    await supabase.from('products').update({ reviews: updatedReviews }).eq('id', productId);

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const avgRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
        return { ...p, reviews: updatedReviews, rating: Number(avgRating.toFixed(1)) };
      }
      return p;
    }));
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.id !== id));

  const toggleWishlist = (product: Product) => {
    if (!currentCustomer) {
      navigate('/login');
      return;
    }
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id && item.customerId === currentCustomer.id);
      if (exists) {
        return prev.filter(item => !(item.id === product.id && item.customerId === currentCustomer.id));
      }
      return [...prev, { 
        id: product.id, 
        customerId: currentCustomer.id, 
        name: product.name, 
        priceValue: product.priceValue, 
        image: product.image,
        discount: product.discount
      }];
    });
  };

  const customerWishlist = wishlist.filter(item => item.customerId === currentCustomer?.id);
  const wishlistCount = customerWishlist.length;

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => {
    const price = item.discount ? item.priceValue * (1 - item.discount / 100) : item.priceValue;
    return total + (price * item.quantity);
  }, 0);

  return (
    <div className="min-h-screen bg-brand-bg-dark dark:text-white text-brand-slate font-sans scroll-smooth flex flex-col transition-colors duration-300">
      <Navbar 
        cartCount={cartCount} 
        onOpenCart={() => setIsCartOpen(true)} 
        customer={currentCustomer} 
        wishlistCount={wishlistCount}
        theme={theme}
        onToggleTheme={toggleTheme}
        companyName={companyName}
      />
      
      <FloatingWhatsApp number={whatsappNumber} />

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        updateQuantity={updateQuantity} 
        removeFromCart={removeFromCart} 
        total={cartTotal} 
        customer={currentCustomer}
        onCheckout={() => { 
          setIsCartOpen(false); 
          if (currentCustomer) {
            setIsCheckoutOpen(true); 
          } else {
            navigate('/login');
          }
        }}
      />
      <CheckoutDrawer 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        onPlaceOrder={placeOrder} 
        total={cartTotal} 
        customer={currentCustomer}
        paymentPhoneNumber={paymentPhoneNumber}
        deliverySettings={deliverySettings}
      />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={
            <Store 
              products={products} 
              onAddToCart={addToCart} 
              onToggleWishlist={toggleWishlist} 
              wishlist={customerWishlist} 
              onAddReview={handleAddReview}
              customer={currentCustomer}
            />
          } />
          <Route path="/login" element={
            currentCustomer ? (
              <Store 
                products={products} 
                onAddToCart={addToCart} 
                onToggleWishlist={toggleWishlist} 
                wishlist={customerWishlist} 
                onAddReview={handleAddReview}
                customer={currentCustomer}
              />
            ) : (
              <CustomerAuth onLogin={handleCustomerLogin} onRegister={handleCustomerRegister} companyName={companyName} />
            )
          } />
          <Route path="/profile" element={
            currentCustomer ? <CustomerProfile customer={currentCustomer} orders={orders} onLogout={handleCustomerLogout} wishlist={customerWishlist} onToggleWishlist={toggleWishlist} onAddToCart={addToCart} /> : <CustomerAuth onLogin={handleCustomerLogin} onRegister={handleCustomerRegister} companyName={companyName} />
          } />
          <Route path="/admin" element={
            isAdminAuthenticated ? (
              <AdminPanel 
                products={products} 
                orders={orders}
                customers={customers}
                onAddProduct={async (p: any) => {
                  const { data } = await supabase.from('products').insert([p]).select();
                  if (data && data.length > 0) setProducts([...products, data[0]]);
                  else setProducts([...products, p]); // Fallback
                }}
                onUpdateProduct={async (p: any) => {
                  const { data } = await supabase.from('products').update(p).eq('id', p.id).select();
                  if (data && data.length > 0) setProducts(products.map(old => old.id === p.id ? data[0] : old));
                  else setProducts(products.map(old => old.id === p.id ? p : old));
                }}
                onDeleteProduct={async (id: any) => {
                  await supabase.from('products').delete().eq('id', id);
                  setProducts(products.filter(p => p.id !== id));
                }}
                onUpdateOrderStatus={updateOrderStatus}
                onLogout={handleAdminLogout}
                whatsappNumber={whatsappNumber}
                onUpdateWhatsapp={setWhatsappNumber}
                paymentPhoneNumber={paymentPhoneNumber}
                onUpdatePaymentPhone={setPaymentPhoneNumber}
                companyName={companyName}
                onUpdateCompanyName={setCompanyName}
                deliverySettings={deliverySettings}
                onUpdateDeliverySettings={setDeliverySettings}
                categories={categories}
                onUpdateCategories={setCategories}
              />
            ) : (
              <AdminLogin onLogin={handleAdminLogin} />
            )
          } />
        </Routes>
      </main>

      {!location.pathname.startsWith('/admin') && location.pathname !== '/profile' && (
        <footer className="bg-brand-bg-footer border-t border-brand-accent/5 pt-20 pb-10 transition-all">
          <div className="container mx-auto px-4 md:px-6 text-[var(--text-secondary)]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div>
                <div className="flex items-center gap-2 mb-6">
                   <div className="w-8 h-8 bg-brand-accent flex items-center justify-center rounded-sm rotate-45">
                      <div className="text-black font-bold text-xl -rotate-45">{companyName?.[0] || 'T'}</div>
                   </div>
                   <span className="font-display font-bold text-lg uppercase tracking-tighter text-brand-slate dark:text-white">{companyName}</span>
                </div>
                <p className="text-sm font-light opacity-60">Engineering tomorrow with clean energy solutions.</p>
              </div>
              <div className="lg:pl-10">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-slate/40 dark:text-white/40 mb-6 font-display">Links</h4>
                <ul className="space-y-3 text-xs uppercase tracking-widest font-bold opacity-60">
                   <li><Link to="/" className="hover:text-brand-accent transition-all">Home</Link></li>
                   <li><a href="#products" className="hover:text-brand-accent transition-all">Products</a></li>
                   <li><Link to="/admin" className="hover:text-brand-accent transition-all flex items-center gap-2"><LayoutDashboard size={14} /> Admin Panel</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-slate/40 dark:text-white/40 mb-6 font-display">Contact</h4>
                <ul className="space-y-4 text-xs font-mono opacity-60">
                   <li className="flex items-center gap-3"><Phone size={14} className="text-brand-accent" /> +880 1234 567890</li>
                   <li className="flex items-center gap-3"><Mail size={14} className="text-brand-accent" /> info@tasnimpower.com</li>
                </ul>
              </div>
              <div>
                 <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/50 mb-6 font-display">Social</h4>
                 <div className="flex gap-4">
                    <Facebook size={18} className="text-white/20 hover:text-brand-accent cursor-pointer transition-all" />
                    <Linkedin size={18} className="text-white/20 hover:text-brand-accent cursor-pointer transition-all" />
                 </div>
              </div>
            </div>
            <div className="pt-10 border-t border-white/5 flex justify-between items-center text-[9px] uppercase tracking-widest font-bold text-white/10">
               <span>© 2026 {companyName}</span>
               <Link to="/admin">System Login</Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <TasnimApp />
    </Router>
  );
}
