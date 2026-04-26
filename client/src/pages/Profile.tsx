import { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import BottomNav from '@/components/BottomNav';
import { useAuth, ROLE_CONFIG } from '@/contexts/AuthContext';
import { User, Mail, Phone, Calendar, Edit2, Bell, Globe, LogOut, ChevronRight, Check } from 'lucide-react';

const TEAL = '#1a9b8e'; const NAVY = '#1e3a5f'; const ORANGE = '#f0821d';

export default function Profile() {
  const [, setLocation] = useLocation();
  const { t, setLanguage, language } = useLanguage();
  const { user, logout: authLogout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@example.com', phone: '+261 32 XX XX XX', dateOfBirth: '1990-05-15' });
  const [notifs, setNotifs] = useState({ appointments: true, reminders: true, promotions: false });

  const inp = (field: string, value: string): React.CSSProperties => ({ width: '100%', height: 46, padding: '0 12px', border: '2px solid #d0e8e6', borderRadius: 10, fontSize: 14, outline: 'none', color: NAVY, background: 'white' });
  const card: React.CSSProperties = { background: 'white', borderRadius: 16, border: '1px solid #d0e8e6', padding: 16, marginBottom: 14 };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f9f8', paddingBottom: 90 }}>
      <div style={{ background: TEAL, padding: '20px 20px 24px', borderRadius: '0 0 24px 24px' }}>
        <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{t('profile.title')}</h1>
      </div>

      <div style={{ padding: '20px 16px', maxWidth: 500, margin: '0 auto' }}>
        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '3px solid white', boxShadow: '0 4px 16px rgba(26,155,142,0.3)' }}>
            <User size={36} color="white" />
          </div>
          <p style={{ fontWeight: 700, color: NAVY, fontSize: 18 }}>{form.firstName} {form.lastName}</p>
          <p style={{ color: '#6b8a87', fontSize: 13 }}>{form.email}</p>
        </div>

        {/* Personal info */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontWeight: 700, color: NAVY, fontSize: 15 }}>{t('profile.personalInfo')}</p>
            <button onClick={() => setIsEditing(!isEditing)} style={{ background: 'none', border: 'none', color: TEAL, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Edit2 size={14} />{isEditing ? t('profile.cancel') : t('profile.edit')}
            </button>
          </div>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['firstName', t('profile.firstName'), 'text'], ['lastName', t('profile.lastName'), 'text'], ['email', t('profile.email'), 'email'], ['phone', t('profile.phone'), 'tel'], ['dateOfBirth', t('profile.dateOfBirth'), 'date']].map(([f, label, type]) => (
                <div key={f}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 4 }}>{label}</label>
                  <input type={type} value={form[f as keyof typeof form]} onChange={e => setForm({ ...form, [f]: e.target.value })} style={inp(f, '')} />
                </div>
              ))}
              <button onClick={() => setIsEditing(false)} style={{ width: '100%', height: 46, background: TEAL, color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>{t('profile.save')}</button>
            </div>
          ) : (
            <div>
              {[
                { icon: User, label: t('profile.fullName'), value: `${form.firstName} ${form.lastName}` },
                { icon: Mail, label: t('profile.email'), value: form.email },
                { icon: Phone, label: t('profile.phone'), value: form.phone },
                { icon: Calendar, label: t('profile.dateOfBirth'), value: new Date(form.dateOfBirth).toLocaleDateString('fr-FR') },
              ].map((row, i, arr) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: i < arr.length - 1 ? 12 : 0, marginBottom: i < arr.length - 1 ? 12 : 0, borderBottom: i < arr.length - 1 ? '1px solid #e8f5f3' : 'none' }}>
                    <Icon size={16} color={TEAL} />
                    <div>
                      <p style={{ fontSize: 11, color: '#9ab0ae' }}>{row.label}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{row.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={card}>
          <p style={{ fontWeight: 700, color: NAVY, fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Bell size={16} color={TEAL} />{t('profile.notifications')}</p>
          {([
            ['appointments', t('profile.appointmentReminders'), t('profile.appointmentRemindersDesc')],
            ['reminders', t('profile.medicationReminders'), t('profile.medicationRemindersDesc')],
            ['promotions', t('profile.offersPromotions'), t('profile.offersPromotionsDesc')],
          ] as [keyof typeof notifs, string, string][]).map(([key, label, desc], i, arr) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: i < arr.length - 1 ? 12 : 0, marginBottom: i < arr.length - 1 ? 12 : 0, borderBottom: i < arr.length - 1 ? '1px solid #e8f5f3' : 'none' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{label}</p>
                <p style={{ fontSize: 11, color: '#9ab0ae' }}>{desc}</p>
              </div>
              <button onClick={() => setNotifs({ ...notifs, [key]: !notifs[key] })} style={{ width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: notifs[key] ? '#5cb85c' : '#d0e8e6', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 3, left: notifs[key] ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
              </button>
            </div>
          ))}
        </div>

        {/* Language */}
        <div style={card}>
          <p style={{ fontWeight: 700, color: NAVY, fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Globe size={16} color={TEAL} />{t('profile.language')}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[['fr', t('profile.french')], ['mg', t('profile.malagasy')]].map(([lang, name]) => (
              <button key={lang} onClick={() => setLanguage(lang as 'fr' | 'mg')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: language === lang ? '#e8f5f3' : 'transparent', border: `2px solid ${language === lang ? TEAL : '#d0e8e6'}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
                <span style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>{name}</span>
                {language === lang && <Check size={18} color={TEAL} />}
              </button>
            ))}
          </div>
        </div>

        {/* Account actions */}
        <div style={card}>
          {[t('profile.changePassword'), t('profile.purchaseHistory'), t('profile.terms')].map((label, i, arr) => (
            <button key={label} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', borderBottom: i < arr.length - 1 ? '1px solid #e8f5f3' : 'none' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{label}</span>
              <ChevronRight size={18} color="#9ab0ae" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button onClick={() => setLocation('/login')} style={{ width: '100%', height: 52, background: '#fee2e2', color: '#c53030', border: '2px solid #fca5a5', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <LogOut size={18} />{t('profile.logout')}
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
