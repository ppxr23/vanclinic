import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, Calendar, FileText, ShoppingBag, User } from 'lucide-react';

const TEAL = '#1a9b8e';

export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t('nav.home'), path: '/dashboard' },
    { icon: Calendar, label: t('nav.appointments'), path: '/appointments' },
    { icon: FileText, label: t('nav.medicalRecord'), path: '/medical-record' },
    { icon: ShoppingBag, label: t('nav.shop'), path: '/shop' },
    { icon: User, label: t('nav.profile'), path: '/profile' },
  ];

  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #d0e8e6', zIndex: 100 }}>
      <div style={{ maxWidth: 500, margin: '0 auto', display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 68 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          return (
            <button key={item.path} onClick={() => setLocation(item.path)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, border: 'none', background: 'none', cursor: 'pointer', flex: 1, padding: '6px 0', position: 'relative' }}>
              {isActive && (
                <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 28, height: 3, background: TEAL, borderRadius: '3px 3px 0 0' }} />
              )}
              <div style={{ width: 36, height: 36, borderRadius: 10, background: isActive ? '#e8f5f3' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                <Icon size={20} color={isActive ? TEAL : '#9ab0ae'} />
              </div>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400, color: isActive ? TEAL : '#9ab0ae' }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
