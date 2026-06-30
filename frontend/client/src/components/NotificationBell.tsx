import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { useLocation } from 'wouter';
import { api } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

const ORANGE = '#f0821d';
const TEAL = '#1a9b8e';
const NAVY = '#1e3a5f';

interface NotifItem {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}j`;
}

const TYPE_ROUTE: Record<string, string> = {
  appointment_reminder: '/appointments',
  appointment_confirmed: '/appointments',
  appointment_cancelled: '/appointments',
  order_confirmed: '/shop',
  order_shipped: '/shop',
  order_delivered: '/shop',
  payment_success: '/shop',
  payment_failed: '/shop',
  teleexpertise_response: '/medical-record',
  security_alert: '/profile',
  educational: '/dashboard',
};

const TYPE_ICON: Record<string, string> = {
  appointment_reminder: '📅',
  appointment_confirmed: '✅',
  appointment_cancelled: '❌',
  order_confirmed: '📦',
  order_shipped: '🚚',
  order_delivered: '✔️',
  payment_success: '💳',
  payment_failed: '⚠️',
  teleexpertise_response: '🔬',
  security_alert: '🔒',
  educational: 'ℹ️',
};

export default function NotificationBell() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotifItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchCount = useCallback(() => {
    api.get<{ count: number }>('/notifications/count')
      .then(r => setCount(r.data.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, 30000);
    return () => clearInterval(id);
  }, [fetchCount]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen = () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    setLoading(true);
    api.get<{ count: number; items: NotifItem[] }>('/notifications')
      .then(r => { setItems(r.data.items); setCount(r.data.count); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleClick = (n: NotifItem) => {
    if (!n.isRead) {
      api.post(`/notifications/${n.id}/read`, {}).catch(() => {});
      setItems(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
      setCount(prev => Math.max(0, prev - 1));
    }
    const route = TYPE_ROUTE[n.type] ?? '/dashboard';
    setOpen(false);
    setLocation(route);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={handleOpen}
        style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
      >
        <Bell size={18} color="white" />
        {count > 0 && (
          <span style={{ position: 'absolute', top: 6, right: 6, width: count > 9 ? 16 : 9, height: 9, background: ORANGE, borderRadius: count > 9 ? 8 : '50%', border: '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'white', fontWeight: 700, lineHeight: 1 }}>
            {count > 9 ? '9+' : ''}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 48, right: 0, width: 320, background: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 1000, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8f5f3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>{t('notifBell.title')}</span>
            {count > 0 && (
              <span style={{ background: ORANGE, color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{count}</span>
            )}
          </div>

          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {loading && (
              <div style={{ padding: 24, textAlign: 'center', color: '#6b8a87', fontSize: 13 }}>...</div>
            )}
            {!loading && items.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: '#9ab0ae', fontSize: 13 }}>{t('notifBell.empty')}</div>
            )}
            {!loading && items.map(n => (
              <div
                key={n.id}
                style={{ padding: '12px 16px', borderBottom: '1px solid #f0f7f6', background: n.isRead ? 'white' : '#f4f9f8', cursor: 'pointer' }}
                onClick={() => handleClick(n)}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{TYPE_ICON[n.type] ?? 'ℹ️'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, color: NAVY, fontSize: 13 }}>{n.title}</span>
                      <span style={{ fontSize: 11, color: '#9ab0ae', flexShrink: 0, marginLeft: 8 }}>{timeAgo(n.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#6b8a87', margin: 0, lineHeight: 1.4 }}>{n.message}</p>
                    {!n.isRead && (
                      <span style={{ fontSize: 11, color: TEAL, fontWeight: 700, marginTop: 4, display: 'inline-block' }}>{t('notifBell.markRead')}</span>
                    )}
                  </div>
                  {!n.isRead && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: TEAL, flexShrink: 0, marginTop: 4 }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
