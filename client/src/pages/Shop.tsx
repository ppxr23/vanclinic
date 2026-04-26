import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import BottomNav from '@/components/BottomNav';
import { ShoppingCart, Plus, Minus, X, CheckCircle2 } from 'lucide-react';

const TEAL = '#1a9b8e'; const NAVY = '#1e3a5f'; const ORANGE = '#f0821d';
type View = 'catalog' | 'cart' | 'payment' | 'success';

const products = [
  { id: '1', name: 'Lunettes de vue classiques', category: 'glasses', price: 150000, emoji: '👓', desc: 'Monture élégante' },
  { id: '2', name: 'Lunettes de soleil UV', category: 'glasses', price: 200000, emoji: '🕶️', desc: 'Protection maximale' },
  { id: '3', name: 'Solution nettoyante', category: 'solutions', price: 35000, emoji: '💧', desc: 'Hygiène complète' },
  { id: '4', name: 'Étui de rangement', category: 'accessories', price: 25000, emoji: '📦', desc: 'Protection robuste' },
  { id: '5', name: 'Chiffon microfibre', category: 'accessories', price: 5000, emoji: '🧽', desc: 'Nettoyage délicat' },
];

export default function Shop() {
  const { t } = useLanguage();
  const [view, setView] = useState<View>('catalog');
  const [cat, setCat] = useState('all');
  const [cart, setCart] = useState<Array<{ id: string; name: string; price: number; qty: number }>>([]);
  const [payMethod, setPayMethod] = useState('');

  const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
  const addToCart = (p: typeof products[0]) => {
    const ex = cart.find(i => i.id === p.id);
    if (ex) setCart(cart.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
    else setCart([...cart, { id: p.id, name: p.name, price: p.price, qty: 1 }]);
  };
  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) setCart(cart.filter(i => i.id !== id));
    else setCart(cart.map(i => i.id === id ? { ...i, qty } : i));
  };
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const card: React.CSSProperties = { background: 'white', borderRadius: 14, border: '1px solid #d0e8e6', padding: 14 };

  const cats = [
    { id: 'all', label: t('shop.all') }, { id: 'glasses', label: t('shop.glasses') },
    { id: 'solutions', label: t('shop.solutions') },
    { id: 'accessories', label: t('shop.accessories') },
  ];
  const payMethods = [
    { id: 'orange', name: 'Orange Money', color: ORANGE },
    { id: 'airtel', name: 'Airtel Money', color: '#cc0000' },
    { id: 'mvola', name: 'Telma Mvola', color: TEAL },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f9f8', paddingBottom: 90 }}>
      <div style={{ background: TEAL, padding: '20px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{t('shop.title')}</h1>
          <button onClick={() => setView('cart')} style={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={20} color="white" />
            {cart.length > 0 && <span style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, background: ORANGE, borderRadius: '50%', fontSize: 10, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cart.length}</span>}
          </button>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {filtered.map(p => (
                <div key={p.id} style={card}>
                  <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>{p.emoji}</div>
                  <p style={{ fontWeight: 700, color: NAVY, fontSize: 13, marginBottom: 2, lineHeight: 1.3 }}>{p.name}</p>
                  <p style={{ fontSize: 11, color: '#6b8a87', marginBottom: 6 }}>{p.desc}</p>
                  <p style={{ fontWeight: 700, color: TEAL, fontSize: 13, marginBottom: 8 }}>{p.price.toLocaleString()} Ar</p>
                  <button onClick={() => addToCart(p)} style={{ width: '100%', height: 36, background: TEAL, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{t('shop.add')}</button>
                </div>
              ))}
            </div>
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
                      <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ width: 30, height: 30, borderRadius: 8, border: `2px solid #d0e8e6`, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                      <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, color: NAVY }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ width: 30, height: 30, borderRadius: 8, border: `2px solid ${TEAL}`, background: TEAL, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} color="white" /></button>
                    </div>
                  </div>
                ))}
                <div style={{ ...card, background: '#e8f5f3', marginTop: 12 }}>
                  {[['Sous-total', `${total.toLocaleString()} Ar`], ['Frais de livraison', '5 000 Ar']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b8a87', marginBottom: 6 }}><span>{k}</span><span style={{ fontWeight: 700 }}>{v}</span></div>
                  ))}
                  <div style={{ borderTop: '1px solid #b0d8d4', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: TEAL, fontSize: 15 }}><span>Total</span><span>{(total + 5000).toLocaleString()} Ar</span></div>
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
                <input type="tel" placeholder="+261 32 XX XX XX" style={{ width: '100%', height: 48, padding: '0 14px', border: '2px solid #d0e8e6', borderRadius: 12, fontSize: 15, outline: 'none', color: NAVY }} />
              </div>
            )}
            <div style={{ ...card, background: '#f4f9f8', marginBottom: 16 }}>
              <p style={{ fontWeight: 700, color: NAVY, fontSize: 14, marginBottom: 10 }}>{t('shop.orderSummary')}</p>
              {cart.map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b8a87', marginBottom: 4 }}>
                  <span>{i.name} x{i.qty}</span><span style={{ fontWeight: 700 }}>{(i.price * i.qty).toLocaleString()} Ar</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #d0e8e6', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: TEAL, fontSize: 15, marginTop: 6 }}><span>Total</span><span>{(total + 5000).toLocaleString()} Ar</span></div>
            </div>
            <button onClick={() => setView('success')} disabled={!payMethod} style={{ width: '100%', height: 52, background: payMethod ? '#5cb85c' : '#9ab0ae', color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: payMethod ? 'pointer' : 'not-allowed' }}>{t('shop.confirmPayment')}</button>
          </div>
        )}

        {/* SUCCESS */}
        {view === 'success' && (
          <div style={{ textAlign: 'center', paddingTop: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eaf5ea', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={44} color="#5cb85c" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: NAVY, marginBottom: 8 }}>{t('shop.paymentSuccessful')}</h2>
            <div style={{ ...card, background: '#e8f5f3', marginBottom: 24, textAlign: 'left' }}>
              <p style={{ fontSize: 13, color: '#6b8a87', marginBottom: 4 }}><b style={{ color: NAVY }}>{t('shop.orderNumber')}</b> #CMD-2026-001</p>
              <p style={{ fontSize: 13, color: '#6b8a87', marginBottom: 4 }}><b style={{ color: NAVY }}>{t('shop.amount')}</b> {(total + 5000).toLocaleString()} Ar</p>
              <p style={{ fontSize: 13, color: '#6b8a87' }}><b style={{ color: NAVY }}>{t('shop.delivery')}</b> 3-5 {t('shop.businessDays')}</p>
            </div>
            <button onClick={() => { setView('catalog'); setCart([]); setPayMethod(''); }} style={{ width: '100%', height: 52, background: TEAL, color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>{t('shop.backToShop')}</button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
