import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { api } from '@/lib/api';
import { ShoppingCart, Plus, Minus, X, CheckCircle2, AlertCircle, LogOut, Package, ChevronDown } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import NotificationBell from '@/components/NotificationBell';

const TEAL = '#1a9b8e'; const NAVY = '#1e3a5f'; const ORANGE = '#f0821d'; const GREEN = '#5cb85c';
type View = 'catalog' | 'cart' | 'payment' | 'success' | 'orders';

interface Product {
  id: number;
  name: string;
  description?: string;
  category: string;
  priceMga: number;
  stockQuantity?: number;
  images?: string[];
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

interface OrderItem {
  productName: string;
  quantity: number;
  unitPriceMga: number;
  lineTotalMga: number;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalMga: number;
  shippingFeeMga: number;
  items: OrderItem[];
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  eyeglasses: '👓',
  sunglasses: '🕶️',
  lenses: '🔬',
  contact_lenses: '💧',
  accessories: '📦',
};

const STATUS_ORDER = ['pending', 'paid', 'preparing', 'shipped', 'delivered'];

const STATUS_COLOR: Record<string, string> = {
  pending: ORANGE,
  paid: '#3b82f6',
  preparing: TEAL,
  shipped: NAVY,
  delivered: GREEN,
  cancelled: '#e53e3e',
  refunded: '#888',
};

function loadCart(): CartItem[] {
  try {
    const saved = localStorage.getItem('vanclinic_cart');
    return saved ? (JSON.parse(saved) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export default function Shop() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  const { t } = useLanguage();
  const [view, setView] = useState<View>('catalog');
  const [cat, setCat] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [payMethod, setPayMethod] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    api.get<Product[]>('/products')
      .then(r => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  // Persist cart to localStorage on every change
  useEffect(() => {
    localStorage.setItem('vanclinic_cart', JSON.stringify(cart));
  }, [cart]);

  const fetchOrders = () => {
    setLoadingOrders(true);
    api.get<Order[]>('/orders')
      .then(r => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  };

  const cats = [
    { id: 'all', label: t('shop.all') },
    { id: 'eyeglasses', label: t('shop.glasses') },
    { id: 'sunglasses', label: 'Lunettes de soleil' },
    { id: 'accessories', label: t('shop.accessories') },
  ];

  const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);

  const addToCart = (p: Product) => {
    const ex = cart.find(i => i.id === p.id);
    if (ex) setCart(cart.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
    else setCart([...cart, { id: p.id, name: p.name, price: p.priceMga, qty: 1 }]);
  };

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) setCart(cart.filter(i => i.id !== id));
    else setCart(cart.map(i => i.id === id ? { ...i, qty } : i));
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const SHIPPING = 5000;

  const card: React.CSSProperties = { background: 'white', borderRadius: 14, border: '1px solid #d0e8e6', padding: 14 };

  const payMethods = [
    { id: 'orange_money', name: 'Orange Money', color: ORANGE },
    { id: 'airtel_money', name: 'Airtel Money', color: '#cc0000' },
    { id: 'mvola', name: 'Telma Mvola', color: TEAL },
  ];

  const handleConfirmPayment = async () => {
    if (!payMethod) return;
    setSubmitting(true);
    setPayError('');
    try {
      const { data: orderData } = await api.post<{ order?: { id: number; orderNumber?: string } }>('/orders', {
        items: cart.map(i => ({ productId: i.id, quantity: i.qty })),
        delivery: {
          address: 'Livraison à domicile',
          phone: payerPhone || '+261320000000',
          district: 'Antananarivo',
        },
      });
      const orderId = orderData?.order?.id;
      if (orderId) {
        await api.post(`/payments/order/${orderId}`, {
          method: payMethod,
          payerPhone: payerPhone || '+261320000000',
        });
      }
      setOrderNumber(orderData?.order?.orderNumber || `#CMD-${Date.now()}`);
      localStorage.removeItem('vanclinic_cart');
      setCart([]);
      setView('success');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setPayError(err?.response?.data?.error || 'Erreur lors du paiement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    setCancellingId(orderId);
    try {
      await api.post(`/orders/${orderId}/cancel`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch {
      // ignore
    } finally {
      setCancellingId(null);
    }
  };

  const statusT = (status: string) => {
    const map: Record<string, string> = {
      pending: t('shop.statusPending'),
      paid: t('shop.statusPaid'),
      preparing: t('shop.statusPreparing'),
      shipped: t('shop.statusShipped'),
      delivered: t('shop.statusDelivered'),
      cancelled: t('shop.statusCancelled'),
      refunded: t('shop.statusRefunded'),
    };
    return map[status] || status;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f9f8', paddingBottom: 90 }}>
      <div style={{ background: TEAL, padding: '20px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{t('shop.title')}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LanguageToggle />
            <NotificationBell />
            {/* Orders history button */}
            <button onClick={() => { setView('orders'); fetchOrders(); }} title={t('shop.myOrders')} style={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', background: view === 'orders' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={20} color="white" />
            </button>
            {/* Cart button */}
            <button data-testid="cart-button" onClick={() => setView('cart')} style={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={20} color="white" />
              {cart.length > 0 && <span style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, background: ORANGE, borderRadius: '50%', fontSize: 10, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cart.reduce((s, i) => s + i.qty, 0)}</span>}
            </button>
            <button onClick={() => { logout(); setLocation('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.15)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'white', fontFamily: 'inherit' }}>
              <LogOut size={14} color="white" /> {t('profile.logout')}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', maxWidth: 500, margin: '0 auto' }}>

        {/* CATALOG */}
        {view === 'catalog' && (
          <>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
              {cats.map(c => (
                <button key={c.id} onClick={() => setCat(c.id)} style={{ padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', background: cat === c.id ? TEAL : 'white', color: cat === c.id ? 'white' : '#6b8a87', border: cat === c.id ? 'none' : '1px solid #d0e8e6' }}>{c.label}</button>
              ))}
            </div>

            {loadingProducts ? (
              <p style={{ textAlign: 'center', color: '#6b8a87', padding: 32 }}>{t('common.loading')}</p>
            ) : filtered.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: 40 }} data-testid="empty-products">
                <p style={{ color: '#6b8a87', fontSize: 14 }}>{t('shop.noProducts')}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {filtered.map(p => (
                  <div key={p.id} style={{ ...card, padding: 0, overflow: 'hidden' }} data-testid="product-card">
                    <div style={{ width: '100%', aspectRatio: '1', background: '#f4f9f8', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #d0e8e6' }}>
                      {p.images && p.images[0] ? (
                        <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 40 }}>{CATEGORY_EMOJI[p.category] || '📦'}</span>
                      )}
                    </div>
                    <div style={{ padding: 10 }}>
                      <p style={{ fontWeight: 700, color: NAVY, fontSize: 12, marginBottom: 2, lineHeight: 1.3 }}>{p.name}</p>
                      {p.description && <p style={{ fontSize: 10, color: '#6b8a87', marginBottom: 4, lineHeight: 1.3 }}>{p.description}</p>}
                      <p style={{ fontWeight: 700, color: TEAL, fontSize: 13, marginBottom: 8 }}>{p.priceMga.toLocaleString()} Ar</p>
                      <button onClick={() => addToCart(p)} style={{ width: '100%', height: 34, background: TEAL, color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{t('shop.add')}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* CART */}
        {view === 'cart' && (
          <div>
            <button onClick={() => setView('catalog')} style={{ background: 'none', border: 'none', color: TEAL, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>← {t('shop.continueShopping')}</button>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <ShoppingCart size={48} color="#d0e8e6" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#6b8a87', fontWeight: 700, marginBottom: 16 }}>{t('shop.emptyCart')}</p>
                <button onClick={() => setView('catalog')} style={{ background: TEAL, color: 'white', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{t('shop.continueShopping')}</button>
              </div>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} style={{ ...card, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <p style={{ fontWeight: 700, color: NAVY, fontSize: 13 }}>{item.name}</p>
                        <p style={{ color: TEAL, fontWeight: 700, fontSize: 13 }}>{item.price.toLocaleString()} Ar</p>
                      </div>
                      <button onClick={() => updateQty(item.id, 0)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e' }}><X size={16} /></button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ width: 30, height: 30, borderRadius: 8, border: '2px solid #d0e8e6', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                      <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, color: NAVY }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ width: 30, height: 30, borderRadius: 8, border: `2px solid ${TEAL}`, background: TEAL, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} color="white" /></button>
                    </div>
                  </div>
                ))}
                <div style={{ ...card, background: '#e8f5f3', marginTop: 12 }}>
                  {[['Sous-total', `${total.toLocaleString()} Ar`], ['Frais de livraison', `${SHIPPING.toLocaleString()} Ar`]].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b8a87', marginBottom: 6 }}><span>{k}</span><span style={{ fontWeight: 700 }}>{v}</span></div>
                  ))}
                  <div style={{ borderTop: '1px solid #b0d8d4', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: TEAL, fontSize: 15 }}><span>Total</span><span>{(total + SHIPPING).toLocaleString()} Ar</span></div>
                  <button onClick={() => setView('payment')} style={{ width: '100%', height: 48, background: ORANGE, color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 12 }}>{t('shop.checkout')}</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* PAYMENT */}
        {view === 'payment' && (
          <div>
            <p style={{ fontWeight: 700, color: NAVY, fontSize: 16, marginBottom: 16 }}>{t('shop.paymentMethod')}</p>

            {payError && (
              <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                <AlertCircle size={14} color="#c53030" />
                <p style={{ fontSize: 13, color: '#c53030' }}>{payError}</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {payMethods.map(m => (
                <button key={m.id} onClick={() => setPayMethod(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'white', border: `2px solid ${payMethod === m.id ? m.color : '#d0e8e6'}`, borderRadius: 14, cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${m.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💳</div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <p style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>{m.name}</p>
                    <p style={{ fontSize: 11, color: '#6b8a87' }}>Paiement mobile sécurisé</p>
                  </div>
                  {payMethod === m.id && <CheckCircle2 size={20} color={m.color} />}
                </button>
              ))}
            </div>

            {payMethod && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{t('shop.phoneNumber')}</label>
                <input
                  type="tel"
                  placeholder="+261 32 XX XX XX"
                  value={payerPhone}
                  onChange={e => setPayerPhone(e.target.value)}
                  style={{ width: '100%', height: 48, padding: '0 14px', border: '2px solid #d0e8e6', borderRadius: 12, fontSize: 15, outline: 'none', color: NAVY, boxSizing: 'border-box' }}
                />
              </div>
            )}

            <div style={{ ...card, background: '#f4f9f8', marginBottom: 16 }}>
              <p style={{ fontWeight: 700, color: NAVY, fontSize: 14, marginBottom: 10 }}>{t('shop.orderSummary')}</p>
              {cart.map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b8a87', marginBottom: 4 }}>
                  <span>{i.name} x{i.qty}</span><span style={{ fontWeight: 700 }}>{(i.price * i.qty).toLocaleString()} Ar</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #d0e8e6', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: TEAL, fontSize: 15, marginTop: 6 }}>
                <span>Total</span><span>{(total + SHIPPING).toLocaleString()} Ar</span>
              </div>
            </div>

            <button onClick={handleConfirmPayment} disabled={!payMethod || submitting} style={{ width: '100%', height: 52, background: payMethod && !submitting ? GREEN : '#9ab0ae', color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: payMethod && !submitting ? 'pointer' : 'not-allowed' }}>
              {submitting ? t('common.loading') : t('shop.confirmPayment')}
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {view === 'success' && (
          <div style={{ textAlign: 'center', paddingTop: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eaf5ea', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={44} color={GREEN} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: NAVY, marginBottom: 8 }}>{t('shop.paymentSuccessful')}</h2>
            <div style={{ ...card, background: '#e8f5f3', marginBottom: 24, textAlign: 'left' }}>
              <p style={{ fontSize: 13, color: '#6b8a87', marginBottom: 4 }} data-testid="order-number"><b style={{ color: NAVY }}>{t('shop.orderNumber')}</b> {orderNumber}</p>
              <p style={{ fontSize: 13, color: '#6b8a87', marginBottom: 4 }}><b style={{ color: NAVY }}>{t('shop.amount')}</b> {(total + SHIPPING).toLocaleString()} Ar</p>
              <p style={{ fontSize: 13, color: '#6b8a87' }}><b style={{ color: NAVY }}>{t('shop.delivery')}</b> 3-5 {t('shop.businessDays')}</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setView('catalog'); setPayMethod(''); setPayerPhone(''); setOrderNumber(''); }} style={{ flex: 1, height: 52, background: TEAL, color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>{t('shop.backToShop')}</button>
              <button onClick={() => { fetchOrders(); setView('orders'); setPayMethod(''); setPayerPhone(''); setOrderNumber(''); }} style={{ flex: 1, height: 52, background: 'white', color: TEAL, border: `2px solid ${TEAL}`, borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>{t('shop.myOrders')}</button>
            </div>
          </div>
        )}

        {/* ORDERS HISTORY */}
        {view === 'orders' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <button onClick={() => setView('catalog')} style={{ background: 'none', border: 'none', color: TEAL, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>←</button>
              <p style={{ fontWeight: 700, color: NAVY, fontSize: 17 }}>{t('shop.myOrders')}</p>
            </div>

            {loadingOrders ? (
              <p style={{ textAlign: 'center', color: '#6b8a87', padding: 40 }}>{t('common.loading')}</p>
            ) : orders.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: 48 }}>
                <Package size={48} color="#d0e8e6" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#6b8a87', fontSize: 14 }}>{t('shop.noOrders')}</p>
                <button onClick={() => setView('catalog')} style={{ marginTop: 16, padding: '10px 24px', background: TEAL, color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{t('shop.backToShop')}</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {orders.map(order => {
                  const isTerminal = order.status === 'cancelled' || order.status === 'refunded' || order.status === 'delivered';
                  const stepIndex = STATUS_ORDER.indexOf(order.status);
                  const isExpanded = expandedOrder === order.id;
                  const color = STATUS_COLOR[order.status] || '#888';

                  return (
                    <div key={order.id} style={{ ...card, cursor: 'pointer' }} onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                      {/* Header row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <p style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>{order.orderNumber}</p>
                          <p style={{ fontSize: 11, color: '#9ab0ae', marginTop: 2 }}>
                            {t('shop.orderDate')} {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ background: `${color}18`, color, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>{statusT(order.status)}</span>
                          <ChevronDown size={16} color="#9ab0ae" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                        </div>
                      </div>

                      {/* Summary row */}
                      <p style={{ fontSize: 12, color: '#6b8a87', marginBottom: 12 }}>
                        {order.items.length} {t('shop.items')} · {order.totalMga.toLocaleString()} Ar
                      </p>

                      {/* Progress tracker (only for non-terminal active statuses) */}
                      {!isTerminal && stepIndex >= 0 && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                            {STATUS_ORDER.map((step, i) => {
                              const done = i <= stepIndex;
                              const stepColor = done ? TEAL : '#d0e8e6';
                              return (
                                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_ORDER.length - 1 ? 1 : 0 }}>
                                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: stepColor, border: `2px solid ${done ? TEAL : '#d0e8e6'}`, flexShrink: 0 }} />
                                  {i < STATUS_ORDER.length - 1 && (
                                    <div style={{ flex: 1, height: 2, background: i < stepIndex ? TEAL : '#d0e8e6' }} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                            {STATUS_ORDER.map(step => (
                              <p key={step} style={{ fontSize: 9, color: STATUS_ORDER.indexOf(step) <= stepIndex ? TEAL : '#9ab0ae', fontWeight: STATUS_ORDER.indexOf(step) === stepIndex ? 700 : 400, textAlign: 'center', flex: 1 }}>
                                {statusT(step)}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Expanded details */}
                      {isExpanded && (
                        <div style={{ borderTop: '1px solid #e8f5f3', paddingTop: 12, marginTop: 4 }} onClick={e => e.stopPropagation()}>
                          {order.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b8a87', marginBottom: 6 }}>
                              <span style={{ color: NAVY }}>{item.productName} <span style={{ color: '#9ab0ae' }}>×{item.quantity}</span></span>
                              <span style={{ fontWeight: 700 }}>{item.lineTotalMga.toLocaleString()} Ar</span>
                            </div>
                          ))}
                          <div style={{ borderTop: '1px solid #e8f5f3', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: TEAL, fontSize: 14, marginTop: 6 }}>
                            <span>Total</span>
                            <span>{order.totalMga.toLocaleString()} Ar</span>
                          </div>
                          {order.shippedAt && (
                            <p style={{ fontSize: 11, color: '#6b8a87', marginTop: 8 }}>
                              📦 Expédié le {new Date(order.shippedAt).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                          {order.deliveredAt && (
                            <p style={{ fontSize: 11, color: GREEN, marginTop: 4 }}>
                              ✓ Livré le {new Date(order.deliveredAt).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={cancellingId === order.id}
                              style={{ width: '100%', height: 40, marginTop: 12, background: 'transparent', border: '2px solid #e53e3e', borderRadius: 10, color: '#e53e3e', fontWeight: 700, fontSize: 13, cursor: cancellingId === order.id ? 'not-allowed' : 'pointer', opacity: cancellingId === order.id ? 0.6 : 1 }}
                            >
                              {cancellingId === order.id ? t('common.loading') : t('shop.cancelOrder')}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  );
}
