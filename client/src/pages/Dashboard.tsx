import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import BottomNav from '@/components/BottomNav';
import { Bell, Plus, Clock, MapPin, AlertCircle, TrendingUp } from 'lucide-react';

const TEAL = '#1a9b8e';
const NAVY = '#1e3a5f';
const ORANGE = '#f0821d';
const GREEN = '#5cb85c';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const card = { background: 'white', borderRadius: 16, padding: 16, border: '1px solid #d0e8e6' };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f9f8', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ background: TEAL, padding: '20px 20px 24px', borderRadius: '0 0 28px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white' }}>JD</div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{t('dashboard.welcome')}</p>
              <p style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>Jean Dupont</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <LanguageToggle />
            <button style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Bell size={18} color="white" />
              <span style={{ position: 'absolute', top: 8, right: 8, width: 9, height: 9, background: ORANGE, borderRadius: '50%', border: '2px solid transparent' }} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: t('dashboard.nextAppointments'), value: '2' },
            { label: t('dashboard.prescriptions'), value: '1' },
            { label: t('dashboard.healthScore'), value: '92%' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
              <p style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>{s.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 16px', maxWidth: 500, margin: '0 auto' }}>
        {/* Next appointment */}
        <p style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 12 }}>{t('dashboard.nextAppointment')}</p>
        <div style={{ ...card, borderLeft: `4px solid ${TEAL}`, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <p style={{ fontWeight: 700, color: NAVY, fontSize: 15 }}>Consultation Ophtalmologie</p>
              <p style={{ color: '#6b8a87', fontSize: 13, marginTop: 2 }}>{t('dashboard.doctor')} Marie Rakoto</p>
            </div>
            <span style={{ background: '#e8f5f3', color: '#0f6e65', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>{t('dashboard.confirmed')}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b8a87' }}>
              <Clock size={14} color={TEAL} /> Demain à 14h30
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b8a87' }}>
              <MapPin size={14} color={TEAL} /> {t('dashboard.clinic')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setLocation('/appointments')} style={{ flex: 1, height: 40, background: 'transparent', border: `2px solid ${TEAL}`, borderRadius: 10, color: TEAL, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{t('dashboard.modify')}</button>
            <button onClick={() => setLocation('/appointments')} style={{ flex: 1, height: 40, background: TEAL, border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{t('dashboard.details')}</button>
          </div>
        </div>

        {/* Quick actions - App Icon Style */}
        <p style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 14 }}>{t('dashboard.quickActions')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
          {[
            {
              label: t('dashboard.newAppointment'),
              path: '/appointments',
              icon: (
                <svg width="68" height="68" viewBox="0 0 100 100" fill="none">
                  {/* Cadran blanc de l'horloge */}
                  <circle cx="42" cy="58" r="32" fill="white" opacity="0.95"/>
                  <circle cx="42" cy="58" r="28" stroke="#bae6fd" strokeWidth="1.5" fill="none"/>
                  {/* Marques des heures */}
                  <line x1="42" y1="30" x2="42" y2="36" stroke="#1a9b8e" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="42" y1="80" x2="42" y2="86" stroke="#1a9b8e" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="14" y1="58" x2="20" y2="58" stroke="#1a9b8e" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="64" y1="58" x2="70" y2="58" stroke="#1a9b8e" strokeWidth="3" strokeLinecap="round"/>
                  {/* Aiguilles */}
                  <line x1="42" y1="58" x2="42" y2="40" stroke="#0e7490" strokeWidth="3.5" strokeLinecap="round"/>
                  <line x1="42" y1="58" x2="56" y2="66" stroke="#1a9b8e" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="42" cy="58" r="4" fill="#0e7490"/>
                  {/* Badge plus (coin haut-droit) */}
                  <circle cx="76" cy="24" r="20" fill="#1a9b8e"/>
                  <circle cx="76" cy="24" r="16" fill="#1a9b8e"/>
                  <line x1="76" y1="13" x2="76" y2="35" stroke="white" strokeWidth="5" strokeLinecap="round"/>
                  <line x1="65" y1="24" x2="87" y2="24" stroke="white" strokeWidth="5" strokeLinecap="round"/>
                </svg>
              ),
            },
            {
              label: t('dashboard.myRecord'),
              path: '/medical-record',
              icon: (
                <svg width="68" height="68" viewBox="0 0 100 100" fill="none">
                  {/* Pages empilées derrière */}
                  <rect x="26" y="5" width="58" height="82" rx="6" fill="rgba(255,255,255,0.25)"/>
                  <rect x="22" y="8" width="58" height="80" rx="6" fill="rgba(255,255,255,0.35)"/>
                  {/* Couverture bleue */}
                  <rect x="12" y="10" width="60" height="80" rx="8" fill="#1a9b8e"/>
                  {/* Dos du livre */}
                  <rect x="12" y="10" width="16" height="80" rx="7" fill="#157a70"/>
                  {/* Croix blanche */}
                  <rect x="38" y="30" width="14" height="38" rx="5" fill="white"/>
                  <rect x="26" y="42" width="38" height="14" rx="5" fill="white"/>
                  {/* Étoile scintillante */}
                  <path d="M80 14 L82 6 L84 14 L92 16 L84 18 L82 26 L80 18 L72 16 Z" fill="white" opacity="0.9"/>
                  <circle cx="92" cy="30" r="3.5" fill="white" opacity="0.55"/>
                  <circle cx="86" cy="35" r="2" fill="white" opacity="0.35"/>
                </svg>
              ),
            },
            {
              label: t('dashboard.shop'),
              path: '/shop',
              icon: (
                <svg width="68" height="68" viewBox="0 0 100 100" fill="none">
                  {/* Corps du sac blanc */}
                  <path d="M15 38 L8 88 Q8 94 14 94 L86 94 Q92 94 92 88 L85 38 Z" fill="rgba(255,255,255,0.85)" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
                  {/* Poignées */}
                  <path d="M30 38 Q30 14 50 14 Q70 14 70 38" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  {/* Croix médicale bleue sur le sac */}
                  <rect x="44" y="52" width="12" height="30" rx="5" fill="#1a9b8e"/>
                  <rect x="34" y="62" width="32" height="12" rx="5" fill="#1a9b8e"/>
                  {/* Détail boucle sur poignée */}
                  <circle cx="50" cy="38" r="4" fill="white" stroke="#1a9b8e" strokeWidth="2"/>
                </svg>
              ),
            },
            {
              label: t('profile.title'),
              path: '/profile',
              icon: (
                <svg width="68" height="68" viewBox="0 0 100 100" fill="none">
                  {/* Tête */}
                  <circle cx="50" cy="28" r="18" fill="rgba(255,255,255,0.9)"/>
                  {/* Corps / épaules */}
                  <path d="M10 92 Q10 60 50 60 Q90 60 90 92" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"/>
                  {/* Carte d'identité bleue */}
                  <rect x="54" y="56" width="38" height="28" rx="6" fill="#1a9b8e" stroke="white" strokeWidth="2"/>
                  {/* Photo sur carte */}
                  <circle cx="65" cy="66" r="7" fill="rgba(255,255,255,0.7)"/>
                  {/* Lignes texte carte */}
                  <line x1="76" y1="62" x2="88" y2="62" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="76" y1="68" x2="86" y2="68" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.75"/>
                  <line x1="60" y1="76" x2="88" y2="76" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                </svg>
              ),
            },
          ].map((item) => (
            <button key={item.label} onClick={() => setLocation(item.path)}
              style={{
                position: 'relative',
                background: '#1a9b8e',
                borderRadius: 22,
                padding: '22px 12px 18px',
                textAlign: 'center',
                cursor: 'pointer',
                border: 'none',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(14, 116, 144, 0.35)',
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}>
              <div style={{ position: 'absolute', top: -24, right: -24, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ position: 'absolute', bottom: -18, left: -18, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ position: 'relative' }}>{item.icon}</div>
              <p style={{ color: 'white', fontSize: 13, fontWeight: 700, lineHeight: 1.3, margin: 0, position: 'relative' }}>{item.label}</p>
            </button>
          ))}
        </div>

        {/* Alert */}
        <div style={{ background: '#fff8f0', borderLeft: `4px solid ${ORANGE}`, borderRadius: '0 12px 12px 0', padding: '12px 14px', display: 'flex', gap: 10, marginBottom: 20 }}>
          <AlertCircle size={18} color={ORANGE} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#7a3800', marginBottom: 2 }}>{t('dashboard.reminder')}</p>
            <p style={{ fontSize: 12, color: '#7a3800' }}>{t('dashboard.expiresIn')}</p>
          </div>
        </div>

        {/* Recent activity */}
        <p style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 12 }}>{t('dashboard.recentActivity')}</p>
        <div style={{ ...card }}>
          {[
            { icon: TrendingUp, label: t('dashboard.consultationCompleted'), sub: 'Il y a 2 jours', bg: '#e8f5f3', color: TEAL },
            { icon: Plus, label: t('dashboard.prescriptionReceived'), sub: 'Il y a 1 semaine', bg: '#eaf5ea', color: GREEN },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: i === 0 ? 12 : 0, marginBottom: i === 0 ? 12 : 0, borderBottom: i === 0 ? '1px solid #e8f5f3' : 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={item.color} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{item.label}</p>
                  <p style={{ fontSize: 11, color: '#9ab0ae' }}>{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
