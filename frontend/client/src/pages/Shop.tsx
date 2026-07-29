import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { api } from '@/lib/api';
import {
  ShoppingCart, X, ChevronDown, CheckCircle2, AlertCircle,
  LogOut, Package, Plus, Minus, ChevronLeft, Eye,
} from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import NotificationBell from '@/components/NotificationBell';

const TEAL = '#1a9b8e';
const NAVY = '#1e3a5f';
const ORANGE = '#f0821d';
const GREEN = '#5cb85c';

type MainGroup = 'lunettes' | 'verres' | 'accessoires';
type View = 'catalog' | 'cart' | 'payment' | 'success' | 'orders';

const GROUP_CATEGORIES: Record<MainGroup, string[]> = {
  lunettes: ['eyeglasses', 'sunglasses'],
  verres: ['lenses', 'contact_lenses'],
  accessoires: ['accessories'],
};

const GROUP_LABELS: Record<MainGroup, string> = {
  lunettes: 'Lunettes',
  verres: 'Verres',
  accessoires: 'Accessoires',
};

const SUB_CATS: Record<MainGroup, { id: string; label: string }[]> = {
  lunettes: [
    { id: '', label: 'Tous' },
    { id: 'monture', label: 'Montures de vue' },
    { id: 'soleil', label: 'Soleil' },
    { id: 'sport', label: 'Sport' },
    { id: 'lecture', label: 'Lecture' },
    { id: 'enfant', label: 'Enfant' },
  ],
  verres: [
    { id: '', label: 'Tous' },
    { id: 'unifocaux', label: 'Unifocaux' },
    { id: 'progressifs', label: 'Progressifs' },
    { id: 'photochromiques', label: 'Photochromiques' },
    { id: 'polarisants', label: 'Polarisants' },
    { id: 'lentilles', label: 'Lentilles' },
  ],
  accessoires: [
    { id: '', label: 'Tous' },
    { id: 'etuis', label: 'Étuis' },
    { id: 'nettoyage', label: 'Nettoyage' },
    { id: 'cordons', label: 'Cordons' },
    { id: 'outils', label: 'Outils' },
  ],
};

const LENS_TYPES = [
  { id: 'unifocaux', label: 'Unifocaux' },
  { id: 'progressifs', label: 'Progressifs' },
  { id: 'photochromiques', label: 'Photochromiques (Transitions)' },
  { id: 'polarisants', label: 'Polarisants' },
  { id: 'antireflets', label: 'Anti-reflets' },
];

const COLOR_HEX: Record<string, string> = {
  noir: '#1a1a1a', blanc: '#f5f5f5', marron: '#6B3A2A', rouge: '#dc2626',
  bleu: '#2563eb', vert: '#16a34a', rose: '#ec4899', argent: '#9ca3af',
  or: '#d97706', gris: '#6b7280', bordeaux: '#7f1d1d', écaille: '#8B4513',
  'or/vert': '#d97706', 'argent/gris': '#9ca3af', 'noir/noir': '#1a1a1a',
};

const STATUS_ORDER = ['pending', 'paid', 'preparing', 'shipped', 'delivered'];
const STATUS_COLOR: Record<string, string> = {
  pending: ORANGE, paid: '#3b82f6', preparing: TEAL,
  shipped: NAVY, delivered: GREEN, cancelled: '#e53e3e', refunded: '#888',
};
const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente', paid: 'Payé', preparing: 'Préparation',
  shipped: 'Expédié', delivered: 'Livré', cancelled: 'Annulé', refunded: 'Remboursé',
};

interface Prescription {
  od: { sphere: string; cylinder: string; axis: string };
  og: { sphere: string; cylinder: string; axis: string };
  add: string;
}

interface Customization {
  color?: string;
  lensType?: string;
  prescription?: Prescription;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  category: string;
  subCategory?: string;
  brand?: string;
  priceMga: number;
  stockQuantity?: number;
  images?: string[];
  specifications?: { couleurs?: string[]; [k: string]: unknown };
}

interface CartItem {
  uid: string;
  id: number;
  name: string;
  price: number;
  qty: number;
  customization?: Customization;
}

interface OrderItem {
  productName: string;
  quantity: number;
  unitPriceMga: number;
  lineTotalMga: number;
  customization?: Customization;
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

function makeUid(id: number, c?: Customization) {
  return `${id}-${c?.color ?? ''}-${c?.lensType ?? ''}-${c?.prescription ? JSON.stringify(c.prescription) : ''}`;
}

function loadCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem('vanclinic_cart') ?? '[]'); }
  catch { return []; }
}

const CATEGORY_EMOJI: Record<string, string> = {
  eyeglasses: '👓', sunglasses: '🕶️', lenses: '🔬',
  contact_lenses: '💧', accessories: '📦',
};

const emptyPx = (): Prescription => ({
  od: { sphere: '0.00', cylinder: '0.00', axis: '0' },
  og: { sphere: '0.00', cylinder: '0.00', axis: '0' },
  add: '0.00',
});

// ── BuyModal ────────────────────────────────────────────────────────────────
function BuyModal({ product, onClose, onAdd }: {
  product: Product;
  onClose: () => void;
  onAdd: (item: CartItem) => void;
}) {
  const couleurs = product.specifications?.couleurs ?? [];
  const canAddLens = product.category === 'eyeglasses';

  const [color, setColor] = useState(couleurs[0] ?? '');
  const [qty, setQty] = useState(1);
  const [addLens, setAddLens] = useState(false);
  const [lensType, setLensType] = useState('unifocaux');
  const [px, setPx] = useState<Prescription>(emptyPx());
  const isProgressif = lensType === 'progressifs';

  const handleConfirm = () => {
    const customization: Customization = {};
    if (color) customization.color = color;
    if (canAddLens && addLens) {
      customization.lensType = lensType;
      customization.prescription = px;
    }
    const c = Object.keys(customization).length ? customization : undefined;
    onAdd({ uid: makeUid(product.id, c), id: product.id, name: product.name, price: product.priceMga, qty, customization: c });
    onClose();
  };

  const setPxField = (eye: 'od' | 'og', field: keyof Prescription['od'], val: string) =>
    setPx(p => ({ ...p, [eye]: { ...p[eye], [field]: val } }));

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 36, padding: '0 8px', border: '1.5px solid #d0e8e6',
    borderRadius: 8, fontSize: 13, outline: 'none', color: NAVY, boxSizing: 'border-box', textAlign: 'center',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      {/* backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />

      {/* sheet */}
      <div style={{ position: 'relative', background: 'white', borderRadius: '20px 20px 0 0', padding: '0 0 32px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#d0e8e6' }} />
        </div>

        {/* product row */}
        <div style={{ display: 'flex', gap: 12, padding: '8px 16px 16px', borderBottom: '1px solid #f0f7f6' }}>
          <div style={{ width: 72, height: 72, borderRadius: 10, background: '#f4f9f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
            {product.images?.[0]
              ? <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 30 }}>{CATEGORY_EMOJI[product.category] ?? '📦'}</span>}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: NAVY, fontSize: 14, marginBottom: 4 }}>{product.name}</p>
            {product.brand && <p style={{ fontSize: 11, color: '#9ab0ae', marginBottom: 4 }}>{product.brand}</p>}
            <p style={{ fontWeight: 800, color: ORANGE, fontSize: 18 }}>{product.priceMga.toLocaleString()} Ar</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ab0ae', alignSelf: 'flex-start' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '16px' }}>
          {/* color */}
          {couleurs.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 10 }}>
                Couleur : <span style={{ fontWeight: 400, color: TEAL }}>{color}</span>
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {couleurs.map(c => (
                  <button key={c} onClick={() => setColor(c)} style={{
                    width: 30, height: 30, borderRadius: '50%', border: color === c ? `3px solid ${TEAL}` : '2px solid #d0e8e6',
                    background: COLOR_HEX[c] ?? '#ccc', cursor: 'pointer', outline: 'none',
                    boxShadow: color === c ? `0 0 0 2px white inset` : 'none',
                  }} title={c} />
                ))}
              </div>
            </div>
          )}

          {/* qty */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginRight: 4 }}>Quantité :</p>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 34, height: 34, borderRadius: 8, border: '2px solid #d0e8e6', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
            <span style={{ fontWeight: 800, color: NAVY, fontSize: 16, minWidth: 24, textAlign: 'center' }}>{qty}</span>
            <button onClick={() => setQty(q => q + 1)} style={{ width: 34, height: 34, borderRadius: 8, border: `2px solid ${TEAL}`, background: TEAL, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} color="white" /></button>
          </div>

          {/* verres option */}
          {canAddLens && (
            <div style={{ marginBottom: 18, background: '#f4f9f8', borderRadius: 12, padding: 14 }}>
              <button onClick={() => setAddLens(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', width: '100%', padding: 0 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${addLens ? TEAL : '#b0cece'}`, background: addLens ? TEAL : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {addLens && <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>✓</span>}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontWeight: 700, color: NAVY, fontSize: 13 }}>Ajouter des verres correcteurs</p>
                  <p style={{ fontSize: 11, color: '#6b8a87' }}>Avec votre ordonnance optique</p>
                </div>
              </button>

              {addLens && (
                <div style={{ marginTop: 14 }}>
                  {/* lens type */}
                  <p style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Type de verres</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                    {LENS_TYPES.map(lt => (
                      <button key={lt.id} onClick={() => setLensType(lt.id)} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                        background: lensType === lt.id ? `${TEAL}15` : 'white',
                        border: `1.5px solid ${lensType === lt.id ? TEAL : '#d0e8e6'}`,
                        borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                      }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${lensType === lt.id ? TEAL : '#d0e8e6'}`, background: lensType === lt.id ? TEAL : 'white', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: NAVY, fontWeight: lensType === lt.id ? 700 : 400 }}>{lt.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* prescription */}
                  <p style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Eye size={14} color={TEAL} /> Ordonnance optique
                  </p>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '4px 6px', color: '#6b8a87', fontWeight: 600, textAlign: 'left' }}></th>
                          <th style={{ padding: '4px 6px', color: '#6b8a87', fontWeight: 600 }}>Sphère</th>
                          <th style={{ padding: '4px 6px', color: '#6b8a87', fontWeight: 600 }}>Cylindre</th>
                          <th style={{ padding: '4px 6px', color: '#6b8a87', fontWeight: 600 }}>Axe</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(['od', 'og'] as const).map(eye => (
                          <tr key={eye}>
                            <td style={{ padding: '4px 6px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap' }}>{eye === 'od' ? 'OD (droit)' : 'OG (gauche)'}</td>
                            <td style={{ padding: '4px 4px' }}>
                              <input type="number" step="0.25" min="-20" max="20" value={px[eye].sphere}
                                onChange={e => setPxField(eye, 'sphere', e.target.value)} style={inputStyle} />
                            </td>
                            <td style={{ padding: '4px 4px' }}>
                              <input type="number" step="0.25" min="-8" max="8" value={px[eye].cylinder}
                                onChange={e => setPxField(eye, 'cylinder', e.target.value)} style={inputStyle} />
                            </td>
                            <td style={{ padding: '4px 4px' }}>
                              <input type="number" step="1" min="0" max="180" value={px[eye].axis}
                                onChange={e => setPxField(eye, 'axis', e.target.value)} style={inputStyle} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {isProgressif && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                        <p style={{ fontSize: 12, color: NAVY, fontWeight: 700, whiteSpace: 'nowrap' }}>Addition :</p>
                        <input type="number" step="0.25" min="0.75" max="3.5" value={px.add}
                          onChange={e => setPx(p => ({ ...p, add: e.target.value }))} style={{ ...inputStyle, width: 90 }} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <button onClick={handleConfirm} style={{
            width: '100%', height: 50, background: ORANGE, color: 'white', border: 'none',
            borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer',
          }}>
            Ajouter au panier — {(product.priceMga * qty).toLocaleString()} Ar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({ product, onBuy }: { product: Product; onBuy: () => void }) {
  const outOfStock = (product.stockQuantity ?? 1) === 0;
  return (
    <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #e8f5f3', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1', background: '#f4f9f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 44 }}>{CATEGORY_EMOJI[product.category] ?? '📦'}</span>}
        {outOfStock && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9ab0ae', background: 'white', padding: '4px 10px', borderRadius: 20, border: '1px solid #d0e8e6' }}>Rupture</span>
          </div>
        )}
      </div>
      <div style={{ padding: '10px 10px 12px' }}>
        {product.brand && <p style={{ fontSize: 10, color: '#9ab0ae', marginBottom: 2 }}>{product.brand}</p>}
        <p style={{ fontWeight: 700, color: NAVY, fontSize: 12, lineHeight: 1.4, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</p>
        <p style={{ fontWeight: 800, color: ORANGE, fontSize: 14, marginBottom: 10 }}>{product.priceMga.toLocaleString()} Ar</p>
        <button onClick={onBuy} disabled={outOfStock} style={{
          width: '100%', height: 34, background: outOfStock ? '#e0e0e0' : ORANGE,
          color: 'white', border: 'none', borderRadius: 8,
          fontSize: 12, fontWeight: 700, cursor: outOfStock ? 'not-allowed' : 'pointer',
        }}>
          Acheter
        </button>
      </div>
    </div>
  );
}

// ── Main Shop ────────────────────────────────────────────────────────────────
export default function Shop() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();

  const [view, setView] = useState<View>('catalog');
  const [group, setGroup] = useState<MainGroup>('lunettes');
  const [subCat, setSubCat] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>(loadCart);

  // payment
  const [payMethod, setPayMethod] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState('');

  // orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get<Product[]>('/products')
      .then(r => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { localStorage.setItem('vanclinic_cart', JSON.stringify(cart)); }, [cart]);

  const filtered = products.filter(p => {
    const inGroup = GROUP_CATEGORIES[group].includes(p.category);
    const inSub = !subCat || p.subCategory === subCat;
    return inGroup && inSub;
  });

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const ex = prev.find(i => i.uid === item.uid);
      if (ex) return prev.map(i => i.uid === item.uid ? { ...i, qty: i.qty + item.qty } : i);
      return [...prev, item];
    });
  };

  const updateQty = (uid: string, qty: number) => {
    if (qty <= 0) setCart(c => c.filter(i => i.uid !== uid));
    else setCart(c => c.map(i => i.uid === uid ? { ...i, qty } : i));
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const SHIPPING = 5000;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const fetchOrders = () => {
    setLoadingOrders(true);
    api.get<Order[]>('/orders').then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoadingOrders(false));
  };

  const handleConfirmPayment = async () => {
    if (!payMethod) return;
    setSubmitting(true); setPayError('');
    try {
      const { data } = await api.post<{ order?: { id: number; orderNumber?: string } }>('/orders', {
        items: cart.map(i => ({ productId: i.id, quantity: i.qty, customization: i.customization })),
        delivery: { address: 'Livraison à domicile', phone: payerPhone || '+261320000000', district: 'Antananarivo' },
      });
      const orderId = data?.order?.id;
      if (orderId) await api.post(`/payments/order/${orderId}`, { method: payMethod, payerPhone: payerPhone || '+261320000000' });
      setOrderNumber(data?.order?.orderNumber || `#CMD-${Date.now()}`);
      localStorage.removeItem('vanclinic_cart');
      setCart([]);
      setView('success');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setPayError(err?.response?.data?.error || 'Erreur lors du paiement.');
    } finally { setSubmitting(false); }
  };

  const handleCancelOrder = async (orderId: number) => {
    setCancellingId(orderId);
    try {
      await api.post(`/orders/${orderId}/cancel`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch { } finally { setCancellingId(null); }
  };

  const card: React.CSSProperties = { background: 'white', borderRadius: 14, border: '1px solid #d0e8e6', padding: 14 };

  const PAY_METHODS = [
    { id: 'orange_money', name: 'Orange Money', color: ORANGE },
    { id: 'airtel_money', name: 'Airtel Money', color: '#cc0000' },
    { id: 'mvola', name: 'Telma Mvola', color: TEAL },
  ];

  const pxSummary = (c?: Customization) => {
    if (!c?.prescription) return null;
    const { od, og } = c.prescription;
    return `OD: ${od.sphere}/${od.cylinder}×${od.axis} · OG: ${og.sphere}/${og.cylinder}×${og.axis}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f9f8', paddingBottom: 90 }}>

      {/* header */}
      <div style={{ background: TEAL, padding: '14px 16px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 600, margin: '0 auto' }}>
          <h1 style={{ color: 'white', fontSize: 18, fontWeight: 800 }}>Boutique VanClinic</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LanguageToggle />
            <NotificationBell />
            <button onClick={() => { setView('orders'); fetchOrders(); }} title="Mes commandes"
              style={{ width: 40, height: 40, borderRadius: '50%', background: view === 'orders' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={18} color="white" />
            </button>
            <button onClick={() => setView('cart')} data-testid="cart-button"
              style={{ position: 'relative', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={18} color="white" />
              {cartCount > 0 && <span style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, background: ORANGE, borderRadius: '50%', fontSize: 10, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}
            </button>
            <button onClick={() => { logout(); setLocation('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: 12, color: 'white' }}>
              <LogOut size={12} color="white" /> Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 12px' }}>

        {/* CATALOG */}
        {view === 'catalog' && (
          <>
            {/* main tabs */}
            <div style={{ display: 'flex', background: 'white', borderRadius: '0 0 16px 16px', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {(Object.keys(GROUP_LABELS) as MainGroup[]).map(g => (
                <button key={g} onClick={() => { setGroup(g); setSubCat(''); }} style={{
                  flex: 1, padding: '12px 4px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  background: 'none', color: group === g ? TEAL : '#9ab0ae',
                  borderBottom: group === g ? `3px solid ${TEAL}` : '3px solid transparent',
                  transition: 'all 0.15s',
                }}>{GROUP_LABELS[g]}</button>
              ))}
            </div>

            {/* sub-cats */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
              {SUB_CATS[group].map(sc => (
                <button key={sc.id} onClick={() => setSubCat(sc.id)} style={{
                  padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: 12,
                  whiteSpace: 'nowrap', flexShrink: 0,
                  background: subCat === sc.id ? NAVY : 'white',
                  color: subCat === sc.id ? 'white' : '#6b8a87',
                  border: subCat === sc.id ? 'none' : '1px solid #d0e8e6',
                }}>{sc.label}</button>
              ))}
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', color: '#6b8a87', padding: 32 }}>Chargement...</p>
            ) : filtered.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: 40 }} data-testid="empty-products">
                <p style={{ color: '#6b8a87', fontSize: 14 }}>Aucun produit disponible</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {filtered.map(p => (
                  <ProductCard key={p.id} product={p} onBuy={() => setBuyProduct(p)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* CART */}
        {view === 'cart' && (
          <div style={{ paddingTop: 16 }}>
            <button onClick={() => setView('catalog')} style={{ background: 'none', border: 'none', color: TEAL, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
              <ChevronLeft size={16} /> Continuer les achats
            </button>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <ShoppingCart size={48} color="#d0e8e6" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#6b8a87', fontWeight: 700, marginBottom: 16 }}>Panier vide</p>
                <button onClick={() => setView('catalog')} style={{ background: TEAL, color: 'white', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Voir les produits</button>
              </div>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.uid} style={{ ...card, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, color: NAVY, fontSize: 13 }}>{item.name}</p>
                        {item.customization?.color && <p style={{ fontSize: 11, color: '#6b8a87' }}>Couleur : {item.customization.color}</p>}
                        {item.customization?.lensType && <p style={{ fontSize: 11, color: TEAL }}>Verres : {LENS_TYPES.find(l => l.id === item.customization?.lensType)?.label}</p>}
                        {pxSummary(item.customization) && <p style={{ fontSize: 10, color: '#9ab0ae', marginTop: 2 }}>{pxSummary(item.customization)}</p>}
                        <p style={{ color: ORANGE, fontWeight: 700, fontSize: 13, marginTop: 4 }}>{item.price.toLocaleString()} Ar</p>
                      </div>
                      <button onClick={() => updateQty(item.uid, 0)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', alignSelf: 'flex-start' }}><X size={16} /></button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button onClick={() => updateQty(item.uid, item.qty - 1)} style={{ width: 30, height: 30, borderRadius: 8, border: '2px solid #d0e8e6', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                      <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, color: NAVY }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.uid, item.qty + 1)} style={{ width: 30, height: 30, borderRadius: 8, border: `2px solid ${TEAL}`, background: TEAL, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} color="white" /></button>
                    </div>
                  </div>
                ))}
                <div style={{ ...card, background: '#e8f5f3', marginTop: 12 }}>
                  {[['Sous-total', `${cartTotal.toLocaleString()} Ar`], ['Livraison', `${SHIPPING.toLocaleString()} Ar`]].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b8a87', marginBottom: 6 }}><span>{k}</span><span style={{ fontWeight: 700 }}>{v}</span></div>
                  ))}
                  <div style={{ borderTop: '1px solid #b0d8d4', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: TEAL, fontSize: 15 }}><span>Total</span><span>{(cartTotal + SHIPPING).toLocaleString()} Ar</span></div>
                  <button onClick={() => setView('payment')} style={{ width: '100%', height: 48, background: ORANGE, color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 12 }}>Procéder au paiement</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* PAYMENT */}
        {view === 'payment' && (
          <div style={{ paddingTop: 16 }}>
            <button onClick={() => setView('cart')} style={{ background: 'none', border: 'none', color: TEAL, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
              <ChevronLeft size={16} /> Retour au panier
            </button>
            <p style={{ fontWeight: 700, color: NAVY, fontSize: 16, marginBottom: 16 }}>Mode de paiement</p>
            {payError && (
              <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                <AlertCircle size={14} color="#c53030" /><p style={{ fontSize: 13, color: '#c53030' }}>{payError}</p>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {PAY_METHODS.map(m => (
                <button key={m.id} onClick={() => setPayMethod(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'white', border: `2px solid ${payMethod === m.id ? m.color : '#d0e8e6'}`, borderRadius: 14, cursor: 'pointer' }}>
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
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Numéro de téléphone</label>
                <input type="tel" placeholder="+261 32 XX XX XX" value={payerPhone} onChange={e => setPayerPhone(e.target.value)}
                  style={{ width: '100%', height: 48, padding: '0 14px', border: '2px solid #d0e8e6', borderRadius: 12, fontSize: 15, outline: 'none', color: NAVY, boxSizing: 'border-box' }} />
              </div>
            )}
            <div style={{ ...card, background: '#f4f9f8', marginBottom: 16 }}>
              <p style={{ fontWeight: 700, color: NAVY, fontSize: 14, marginBottom: 10 }}>Résumé</p>
              {cart.map(i => (
                <div key={i.uid} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b8a87', marginBottom: 4 }}>
                  <span>{i.name} ×{i.qty}</span><span style={{ fontWeight: 700 }}>{(i.price * i.qty).toLocaleString()} Ar</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #d0e8e6', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: TEAL, fontSize: 15, marginTop: 6 }}>
                <span>Total</span><span>{(cartTotal + SHIPPING).toLocaleString()} Ar</span>
              </div>
            </div>
            <button onClick={handleConfirmPayment} disabled={!payMethod || submitting} style={{ width: '100%', height: 52, background: payMethod && !submitting ? GREEN : '#9ab0ae', color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: payMethod && !submitting ? 'pointer' : 'not-allowed' }}>
              {submitting ? 'Traitement...' : 'Confirmer le paiement'}
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {view === 'success' && (
          <div style={{ textAlign: 'center', paddingTop: 48 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eaf5ea', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={44} color={GREEN} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Paiement réussi !</h2>
            <div style={{ ...card, background: '#e8f5f3', marginBottom: 24, textAlign: 'left' }}>
              <p style={{ fontSize: 13, color: '#6b8a87', marginBottom: 4 }}><b style={{ color: NAVY }}>Commande</b> {orderNumber}</p>
              <p style={{ fontSize: 13, color: '#6b8a87' }}><b style={{ color: NAVY }}>Livraison</b> 3–5 jours ouvrables</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setView('catalog'); setPayMethod(''); setPayerPhone(''); }} style={{ flex: 1, height: 52, background: TEAL, color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Continuer</button>
              <button onClick={() => { fetchOrders(); setView('orders'); }} style={{ flex: 1, height: 52, background: 'white', color: TEAL, border: `2px solid ${TEAL}`, borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Mes commandes</button>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {view === 'orders' && (
          <div style={{ paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <button onClick={() => setView('catalog')} style={{ background: 'none', border: 'none', color: TEAL, cursor: 'pointer' }}><ChevronLeft size={20} /></button>
              <p style={{ fontWeight: 700, color: NAVY, fontSize: 17 }}>Mes commandes</p>
            </div>
            {loadingOrders ? (
              <p style={{ textAlign: 'center', color: '#6b8a87', padding: 40 }}>Chargement...</p>
            ) : orders.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: 48 }}>
                <Package size={48} color="#d0e8e6" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#6b8a87', fontSize: 14 }}>Aucune commande</p>
                <button onClick={() => setView('catalog')} style={{ marginTop: 16, padding: '10px 24px', background: TEAL, color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Voir la boutique</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {orders.map(order => {
                  const isTerminal = ['cancelled', 'refunded', 'delivered'].includes(order.status);
                  const stepIndex = STATUS_ORDER.indexOf(order.status);
                  const isExpanded = expandedOrder === order.id;
                  const color = STATUS_COLOR[order.status] ?? '#888';
                  return (
                    <div key={order.id} style={{ ...card, cursor: 'pointer' }} onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <p style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>{order.orderNumber}</p>
                          <p style={{ fontSize: 11, color: '#9ab0ae', marginTop: 2 }}>
                            {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ background: `${color}18`, color, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>{STATUS_LABEL[order.status] ?? order.status}</span>
                          <ChevronDown size={16} color="#9ab0ae" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: '#6b8a87', marginBottom: 12 }}>{order.items.length} article(s) · {order.totalMga.toLocaleString()} Ar</p>

                      {!isTerminal && stepIndex >= 0 && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {STATUS_ORDER.map((step, i) => {
                              const done = i <= stepIndex;
                              return (
                                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_ORDER.length - 1 ? 1 : 0 }}>
                                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: done ? TEAL : '#d0e8e6', border: `2px solid ${done ? TEAL : '#d0e8e6'}`, flexShrink: 0 }} />
                                  {i < STATUS_ORDER.length - 1 && <div style={{ flex: 1, height: 2, background: i < stepIndex ? TEAL : '#d0e8e6' }} />}
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                            {STATUS_ORDER.map((step, i) => (
                              <p key={step} style={{ fontSize: 9, color: i <= stepIndex ? TEAL : '#9ab0ae', fontWeight: i === stepIndex ? 700 : 400, textAlign: 'center', flex: 1 }}>
                                {STATUS_LABEL[step]}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {isExpanded && (
                        <div style={{ borderTop: '1px solid #e8f5f3', paddingTop: 12, marginTop: 4 }} onClick={e => e.stopPropagation()}>
                          {order.items.map((item, i) => (
                            <div key={i} style={{ marginBottom: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b8a87' }}>
                                <span style={{ color: NAVY }}>{item.productName} <span style={{ color: '#9ab0ae' }}>×{item.quantity}</span></span>
                                <span style={{ fontWeight: 700 }}>{item.lineTotalMga.toLocaleString()} Ar</span>
                              </div>
                              {item.customization?.color && <p style={{ fontSize: 11, color: '#9ab0ae', marginTop: 2 }}>Couleur : {item.customization.color}</p>}
                              {item.customization?.lensType && <p style={{ fontSize: 11, color: TEAL }}>Verres : {LENS_TYPES.find(l => l.id === item.customization?.lensType)?.label}</p>}
                            </div>
                          ))}
                          <div style={{ borderTop: '1px solid #e8f5f3', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: TEAL, fontSize: 14, marginTop: 6 }}>
                            <span>Total</span><span>{order.totalMga.toLocaleString()} Ar</span>
                          </div>
                          {order.status === 'pending' && (
                            <button onClick={() => handleCancelOrder(order.id)} disabled={cancellingId === order.id}
                              style={{ width: '100%', height: 40, marginTop: 12, background: 'transparent', border: '2px solid #e53e3e', borderRadius: 10, color: '#e53e3e', fontWeight: 700, fontSize: 13, cursor: cancellingId === order.id ? 'not-allowed' : 'pointer', opacity: cancellingId === order.id ? 0.6 : 1 }}>
                              {cancellingId === order.id ? 'Annulation...' : 'Annuler la commande'}
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

      {/* Buy Modal */}
      {buyProduct && <BuyModal product={buyProduct} onClose={() => setBuyProduct(null)} onAdd={addToCart} />}

      <BottomNav />
    </div>
  );
}
