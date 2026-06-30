import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import LanguageToggle from '@/components/LanguageToggle';
import BottomNav from '@/components/BottomNav';
import { api } from '@/lib/api';
import { Plus, Clock, MapPin, AlertCircle, TrendingUp, LogOut } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

const TEAL = '#1a9b8e';
const NAVY = '#1e3a5f';
const ORANGE = '#f0821d';
const GREEN = '#5cb85c';

interface ApiUser {
  firstName: string;
  lastName: string;
  email: string;
}

interface Appointment {
  id: number;
  scheduledAt: string;
  type: string;
  status: string;
  reason?: string;
  location?: string;
  ophthalmologist?: { firstName: string; lastName: string };
}

interface MedicalRecord {
  id: number;
  prescription?: string;
}

interface Order {
  id: number;
  status: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { logout } = useAuth();
  const [me, setMe] = useState<ApiUser | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<ApiUser>('/auth/me').then(r => setMe(r.data)).catch(() => {}),
      api.get<Appointment[]>('/appointments').then(r => setAppointments(r.data)).catch(() => {}),
      api.get<MedicalRecord[]>('/medical/records/my').then(r => setRecords(r.data)).catch(() => {}),
      api.get<Order[]>('/orders').then(r => setOrders(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status));
  const nextAppointment = upcoming[0] ?? null;
  const prescriptionCount = records.filter(r => r.prescription).length;
  const activeOrderCount = orders.filter(o => ['pending', 'paid', 'preparing', 'shipped'].includes(o.status)).length;
  const displayName = me ? `${me.firstName} ${me.lastName}` : '...';
  const initials = me ? `${me.firstName[0]}${me.lastName[0]}`.toUpperCase() : '...';

  const card = { background: 'white', borderRadius: 16, padding: 16, border: '1px solid #d0e8e6' };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f9f8', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ background: TEAL, padding: '20px 20px 24px', borderRadius: '0 0 28px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white' }}>{initials}</div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{t('dashboard.welcome')}</p>
              <p style={{ color: 'white', fontSize: 18, fontWeight: 700 }} data-testid="user-name">{displayName}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <LanguageToggle />
            <NotificationBell />
            <button onClick={() => { logout(); setLocation('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.15)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'white', fontFamily: 'inherit' }}>
              <LogOut size={14} color="white" /> {t('profile.logout')}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: t('dashboard.nextAppointments'), value: String(upcoming.length) },
            { label: t('dashboard.prescriptions'), value: String(prescriptionCount) },
            { label: t('dashboard.activeOrders'), value: String(activeOrderCount) },
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

        {loading ? (
          <div style={{ ...card, textAlign: 'center', padding: 24, marginBottom: 20 }}>
            <p style={{ color: '#6b8a87', fontSize: 13 }}>{t('dashboard.loading')}</p>
          </div>
        ) : nextAppointment ? (
          <div style={{ ...card, borderLeft: `4px solid ${TEAL}`, marginBottom: 20 }} data-testid="next-appointment">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <p style={{ fontWeight: 700, color: NAVY, fontSize: 15 }}>{nextAppointment.reason || t('dashboard.consultation')}</p>
                {nextAppointment.ophthalmologist && (
                  <p style={{ color: '#6b8a87', fontSize: 13, marginTop: 2 }}>
                    {t('dashboard.doctor')} {nextAppointment.ophthalmologist.firstName} {nextAppointment.ophthalmologist.lastName}
                  </p>
                )}
              </div>
              <span style={{ background: '#e8f5f3', color: '#0f6e65', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>{t('dashboard.confirmed')}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b8a87' }}>
                <Clock size={14} color={TEAL} /> {formatDate(nextAppointment.scheduledAt)}
              </div>
              {nextAppointment.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b8a87' }}>
                  <MapPin size={14} color={TEAL} /> {nextAppointment.location}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setLocation('/appointments')} style={{ flex: 1, height: 40, background: 'transparent', border: `2px solid ${TEAL}`, borderRadius: 10, color: TEAL, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{t('dashboard.modify')}</button>
              <button onClick={() => setLocation('/appointments')} style={{ flex: 1, height: 40, background: TEAL, border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{t('dashboard.details')}</button>
            </div>
          </div>
        ) : (
          <div style={{ ...card, marginBottom: 20, textAlign: 'center', padding: 24 }} data-testid="no-appointment">
            <p style={{ color: '#6b8a87', fontSize: 13, marginBottom: 12 }}>{t('dashboard.noAppointments')}</p>
            <button onClick={() => setLocation('/appointments')} style={{ padding: '10px 24px', background: TEAL, color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              + {t('dashboard.newAppointment')}
            </button>
          </div>
        )}

        {/* Quick actions */}
        <p style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 14 }}>{t('dashboard.quickActions')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
          {[
            {
              label: t('dashboard.newAppointment'),
              path: '/appointments',
              icon: (
                <svg width="68" height="68" viewBox="0 0 100 100" fill="none">
                  <circle cx="42" cy="58" r="32" fill="white" opacity="0.95"/>
                  <circle cx="42" cy="58" r="28" stroke="#bae6fd" strokeWidth="1.5" fill="none"/>
                  <line x1="42" y1="30" x2="42" y2="36" stroke="#1a9b8e" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="42" y1="80" x2="42" y2="86" stroke="#1a9b8e" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="14" y1="58" x2="20" y2="58" stroke="#1a9b8e" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="64" y1="58" x2="70" y2="58" stroke="#1a9b8e" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="42" y1="58" x2="42" y2="40" stroke="#0e7490" strokeWidth="3.5" strokeLinecap="round"/>
                  <line x1="42" y1="58" x2="56" y2="66" stroke="#1a9b8e" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="42" cy="58" r="4" fill="#0e7490"/>
                  <circle cx="76" cy="24" r="20" fill="#1a9b8e"/>
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
                  <rect x="26" y="5" width="58" height="82" rx="6" fill="rgba(255,255,255,0.25)"/>
                  <rect x="22" y="8" width="58" height="80" rx="6" fill="rgba(255,255,255,0.35)"/>
                  <rect x="12" y="10" width="60" height="80" rx="8" fill="#1a9b8e"/>
                  <rect x="12" y="10" width="16" height="80" rx="7" fill="#157a70"/>
                  <rect x="38" y="30" width="14" height="38" rx="5" fill="white"/>
                  <rect x="26" y="42" width="38" height="14" rx="5" fill="white"/>
                  <path d="M80 14 L82 6 L84 14 L92 16 L84 18 L82 26 L80 18 L72 16 Z" fill="white" opacity="0.9"/>
                </svg>
              ),
            },
            {
              label: t('dashboard.shop'),
              path: '/shop',
              icon: (
                <svg width="68" height="68" viewBox="0 0 100 100" fill="none">
                  <path d="M15 38 L8 88 Q8 94 14 94 L86 94 Q92 94 92 88 L85 38 Z" fill="rgba(255,255,255,0.85)" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
                  <path d="M30 38 Q30 14 50 14 Q70 14 70 38" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  <rect x="44" y="52" width="12" height="30" rx="5" fill="#1a9b8e"/>
                  <rect x="34" y="62" width="32" height="12" rx="5" fill="#1a9b8e"/>
                  <circle cx="50" cy="38" r="4" fill="white" stroke="#1a9b8e" strokeWidth="2"/>
                </svg>
              ),
            },
            {
              label: t('profile.title'),
              path: '/profile',
              icon: (
                <svg width="68" height="68" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="28" r="18" fill="rgba(255,255,255,0.9)"/>
                  <path d="M10 92 Q10 60 50 60 Q90 60 90 92" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"/>
                  <rect x="54" y="56" width="38" height="28" rx="6" fill="#1a9b8e" stroke="white" strokeWidth="2"/>
                  <circle cx="65" cy="66" r="7" fill="rgba(255,255,255,0.7)"/>
                  <line x1="76" y1="62" x2="88" y2="62" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="76" y1="68" x2="86" y2="68" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.75"/>
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
          {appointments.length > 0 ? (
            appointments.slice(-2).reverse().map((appt, i, arr) => (
              <div key={appt.id} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: i === 0 ? 12 : 0, marginBottom: i === 0 ? 12 : 0, borderBottom: i === 0 && arr.length > 1 ? '1px solid #e8f5f3' : 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e8f5f3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TrendingUp size={18} color={TEAL} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{appt.reason || t('dashboard.consultationCompleted')}</p>
                  <p style={{ fontSize: 11, color: '#9ab0ae' }}>{new Date(appt.scheduledAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eaf5ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Plus size={18} color={GREEN} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{t('dashboard.prescriptionReceived')}</p>
                <p style={{ fontSize: 11, color: '#9ab0ae' }}>{t('dashboard.recentActivityEmpty')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
