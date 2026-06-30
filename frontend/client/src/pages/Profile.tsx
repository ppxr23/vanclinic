import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { User, Mail, Phone, Calendar, Edit2, Bell, Globe, LogOut, ChevronRight, Check, AlertCircle } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import NotificationBell from '@/components/NotificationBell';

const TEAL = '#1a9b8e'; const NAVY = '#1e3a5f';

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const { t, setLanguage, language } = useLanguage();
  const { logout: authLogout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState<ProfileForm>({ firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '' });
  const [notifs, setNotifs] = useState({ appointments: true, reminders: true, promotions: false });

  useEffect(() => {
    api.get('/auth/me').then(r => {
      const d = r.data;
      setForm({
        firstName: d.firstName ?? '',
        lastName: d.lastName ?? '',
        email: d.email ?? '',
        phone: d.phone ?? '',
        dateOfBirth: d.birthDate ?? '',
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      await api.put('/patients/me', {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        birthDate: form.dateOfBirth,
      });
      setSaveSuccess(true);
      setIsEditing(false);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setSaveError(err?.response?.data?.error || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    authLogout();
    setLocation('/login');
  };

  const inp: React.CSSProperties = { width: '100%', height: 46, padding: '0 12px', border: '2px solid #d0e8e6', borderRadius: 10, fontSize: 14, outline: 'none', color: NAVY, background: 'white', boxSizing: 'border-box' };
  const card: React.CSSProperties = { background: 'white', borderRadius: 16, border: '1px solid #d0e8e6', padding: 16, marginBottom: 14 };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f9f8', paddingBottom: 90 }}>
      <div style={{ background: TEAL, padding: '20px 20px 24px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{t('profile.title')}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LanguageToggle />
            <NotificationBell />
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.15)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'white', fontFamily: 'inherit' }}>
              <LogOut size={14} color="white" /> {t('profile.logout')}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px', maxWidth: 500, margin: '0 auto' }}>
        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '3px solid white', boxShadow: '0 4px 16px rgba(26,155,142,0.3)' }}>
            <User size={36} color="white" />
          </div>
          {loading ? (
            <p style={{ color: '#6b8a87', fontSize: 13 }}>Chargement...</p>
          ) : (
            <>
              <p style={{ fontWeight: 700, color: NAVY, fontSize: 18 }} data-testid="profile-name">{form.firstName} {form.lastName}</p>
              <p style={{ color: '#6b8a87', fontSize: 13 }}>{form.email}</p>
            </>
          )}
        </div>

        {saveSuccess && (
          <div style={{ background: '#eaf5ea', border: '1px solid #5cb85c', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#27500a', fontWeight: 700 }}>
            {t('profile.saveSuccess') || 'Profil mis à jour avec succès.'}
          </div>
        )}

        {saveError && (
          <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
            <AlertCircle size={14} color="#c53030" />
            <p style={{ fontSize: 13, color: '#c53030' }}>{saveError}</p>
          </div>
        )}

        {/* Personal info */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontWeight: 700, color: NAVY, fontSize: 15 }}>{t('profile.personalInfo')}</p>
            <button onClick={() => { setIsEditing(!isEditing); setSaveError(''); setSaveSuccess(false); }} style={{ background: 'none', border: 'none', color: TEAL, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Edit2 size={14} />{isEditing ? t('profile.cancel') : t('profile.edit')}
            </button>
          </div>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {([['firstName', t('profile.firstName'), 'text'], ['lastName', t('profile.lastName'), 'text'], ['phone', t('profile.phone'), 'tel'], ['dateOfBirth', t('profile.dateOfBirth'), 'date']] as [keyof ProfileForm, string, string][]).map(([f, label, type]) => (
                <div key={f}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 4 }}>{label}</label>
                  <input type={type} value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} style={inp} />
                </div>
              ))}
              <button onClick={handleSave} disabled={saving} style={{ width: '100%', height: 46, background: saving ? '#9ab0ae' : TEAL, color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', marginTop: 4 }}>
                {saving ? 'Sauvegarde...' : t('profile.save')}
              </button>
            </div>
          ) : (
            <div>
              {[
                { icon: User, label: t('profile.fullName'), value: `${form.firstName} ${form.lastName}` },
                { icon: Mail, label: t('profile.email'), value: form.email },
                { icon: Phone, label: t('profile.phone'), value: form.phone },
                { icon: Calendar, label: t('profile.dateOfBirth'), value: form.dateOfBirth ? new Date(form.dateOfBirth).toLocaleDateString('fr-FR') : '' },
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
              <button
                aria-label={`toggle-${key}`}
                onClick={() => setNotifs({ ...notifs, [key]: !notifs[key] })}
                style={{ width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: notifs[key] ? '#5cb85c' : '#d0e8e6', position: 'relative', transition: 'background 0.2s' }}>
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
        <button onClick={handleLogout} style={{ width: '100%', height: 52, background: '#fee2e2', color: '#c53030', border: '2px solid #fca5a5', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <LogOut size={18} />{t('profile.logout')}
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
