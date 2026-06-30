import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth, ROLE_CONFIG, UserRole } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import { api } from '@/lib/api';
import {
  LayoutGrid, Users, Calendar, FileText, Video, Map,
  ShoppingBag, Package, ClipboardList, BarChart2, TrendingUp,
  UserCog, ScrollText, Settings, LogOut,
} from 'lucide-react';

const TEAL = '#1a9b8e'; const NAVY = '#1e3a5f'; const ORANGE = '#f0821d';

const NAV_ITEMS = [
  { id: 'dashboard',    icon: LayoutGrid,    section: 'principal',  roles: ['coordinateur','ophtalmologue','technicien','agent'] },
  { id: 'patients',     icon: Users,         section: 'medical',    roles: ['coordinateur','ophtalmologue','agent'] },
  { id: 'appointments', icon: Calendar,      section: 'medical',    roles: ['coordinateur','ophtalmologue','agent'] },
  { id: 'medical',      icon: FileText,      section: 'medical',    roles: ['coordinateur','ophtalmologue'] },
  { id: 'telemedicine', icon: Video,         section: 'medical',    roles: ['ophtalmologue','coordinateur'] },
  { id: 'planning',     icon: Map,           section: 'operations', roles: ['coordinateur'] },
  { id: 'shop',         icon: ShoppingBag,   section: 'commerce',   roles: ['technicien','coordinateur'] },
  { id: 'inventory',    icon: Package,       section: 'commerce',   roles: ['technicien','coordinateur'] },
  { id: 'orders',       icon: ClipboardList, section: 'commerce',   roles: ['technicien','coordinateur'] },
  { id: 'reports',      icon: BarChart2,     section: 'analyse',    roles: ['coordinateur'] },
  { id: 'analytics',    icon: TrendingUp,    section: 'analyse',    roles: ['coordinateur'] },
  { id: 'users',        icon: UserCog,       section: 'admin',      roles: ['coordinateur','technicien'] },
  { id: 'logs',         icon: ScrollText,    section: 'admin',      roles: ['technicien'] },
  { id: 'settings',     icon: Settings,      section: 'admin',      roles: ['coordinateur','ophtalmologue','technicien','agent'] },
];

interface NavCounts { patients: number; appointments: number; orders: number; lowStock: number; }

interface Props { children: ReactNode; currentPage: string; }

export default function AdminLayout({ children, currentPage }: Props) {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [navCounts, setNavCounts] = useState<NavCounts>({ patients: 0, appointments: 0, orders: 0, lowStock: 0 });

  useEffect(() => {
    api.get<NavCounts>('/admin/nav-counts').then(r => setNavCounts(r.data)).catch(() => {});
  }, []);

  if (!user) { setLocation('/login'); return null; }

  const role = user.role as UserRole;
  const cfg = ROLE_CONFIG[role];
  const allowedItems = NAV_ITEMS.filter(i => i.roles.includes(role));

  const sections: Record<string, typeof NAV_ITEMS> = {};
  allowedItems.forEach(item => {
    if (!sections[item.section]) sections[item.section] = [];
    sections[item.section].push(item);
  });

  const Sidebar = () => (
    <aside style={{ width: 240, background: TEAL, display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100, overflowY: 'auto' }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/New_Logo.png" alt="VanClinic" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: '50%', background: 'white', padding: 2 }} onError={(e) => (e.currentTarget.style.display = 'none')} />
        <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>
          Van<span style={{ color: '#5cb85c' }}>C</span>lini<span style={{ color: ORANGE }}>C</span>
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>ADMIN</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {Object.entries(sections).map(([section, items]) => (
          <div key={section}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, padding: '12px 10px 6px' }}>
              {t(`admin.sections.${section}`)}
            </p>
            {items.map(item => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              const badgeMap: Record<string, number> = {
                patients: navCounts.patients,
                appointments: navCounts.appointments,
                orders: navCounts.orders,
                inventory: navCounts.lowStock,
              };
              const badge = badgeMap[item.id] ?? 0;
              return (
                <button key={item.id} onClick={() => setLocation(`/admin/${item.id}`)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, background: active ? 'rgba(255,255,255,0.15)' : 'transparent', color: 'white', transition: 'all 0.15s', marginBottom: 2 }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                  <Icon size={16} style={{ flexShrink: 0, opacity: active ? 1 : 0.65 }} />
                  <span style={{ flex: 1, textAlign: 'left', opacity: active ? 1 : 0.65 }}>{t(`admin.nav.${item.id}`)}</span>
                  {badge > 0 && <span style={{ background: ORANGE, color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>{badge}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Language toggle + User footer */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {role !== 'patient' && (
          <button onClick={() => setLocation('/dashboard')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>
            <span>📱</span> {t('admin.switchToApp')}
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.06)', borderRadius: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>{user.avatar}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{cfg.label}</p>
          </div>
          <button onClick={() => { logout(); setLocation('/login'); }} title={t('admin.logout')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => e.currentTarget.style.color = '#e53e3e'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f9f8' }}>
      <Sidebar />
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <header style={{ height: 60, background: 'white', borderBottom: '1px solid #d0e8e6', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, position: 'sticky', top: 0, zIndex: 50 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>{t(`admin.nav.${currentPage}`) || 'Admin'}</span>
          <div style={{ flex: 1 }} />
          <LanguageToggle variant="dark" />
          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: cfg.color + '22', color: cfg.color }}>{cfg.label}</span>
          <button onClick={() => { logout(); setLocation('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: `1.5px solid #d0e8e6`, background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#6b8a87', fontFamily: 'inherit' }}>
            <LogOut size={14} /> {t('admin.logout')}
          </button>
        </header>
        {/* Page content */}
        <main style={{ flex: 1, padding: 24, maxWidth: 1400 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
