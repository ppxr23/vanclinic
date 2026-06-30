import { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import LanguageToggle from '@/components/LanguageToggle';
import { ChevronLeft, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';

const TEAL = '#1a9b8e'; const NAVY = '#1e3a5f'; const ORANGE = '#f0821d';

interface FormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  city: string;
  password: string;
  confirmPassword: string;
}

export default function Signup() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    firstName: '', lastName: '', dateOfBirth: '', gender: 'M',
    email: '', phone: '', city: '',
    password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patientNumber, setPatientNumber] = useState<string | null>(null);

  const steps = [t('signup.step1'), t('signup.step2'), t('signup.step3'), t('signup.step4')];

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!form.firstName.trim()) e.firstName = `${t('signup.firstName')} ${t('login.required')}`;
      if (!form.lastName.trim()) e.lastName = `${t('signup.lastName')} ${t('login.required')}`;
      if (!form.dateOfBirth) e.dateOfBirth = `${t('signup.dateOfBirth')} ${t('login.required')}`;
    } else if (step === 2) {
      if (!form.email.trim()) e.email = `${t('signup.email')} ${t('login.required')}`;
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide';
      if (!form.phone.trim()) e.phone = `${t('signup.phone')} ${t('login.required')}`;
    } else if (step === 3) {
      if (form.password.length < 8) e.password = t('signup.minChars');
      if (form.password !== form.confirmPassword) e.confirmPassword = t('signup.passwordMismatch');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    setServerError(null);
    try {
      const { data } = await api.post<{
        token: string;
        user: { id: number; email: string; firstName: string; lastName: string; roles: string[] };
        patient: { patientNumber: string };
      }>('/auth/register', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        birthDate: form.dateOfBirth,
        gender: form.gender,
        city: form.city,
        preferredLanguage: 'fr',
      });

      localStorage.setItem('vanclinic_token', data.token);
      setPatientNumber(data.patient.patientNumber);
      await login(form.email, form.password);
      setStep(4);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setServerError(msg ?? 'Erreur lors de la création du compte. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', height: 50, padding: '0 14px',
    border: '2px solid #d0e8e6', borderRadius: 12,
    fontSize: 15, outline: 'none', color: NAVY, background: 'white',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f9f8', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: TEAL, padding: '20px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button
            onClick={() => step > 1 ? setStep(step - 1) : setLocation('/login')}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={20} color="white" />
          </button>
          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{t('signup.title')}</h1>
          <LanguageToggle />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < step ? 'white' : 'rgba(255,255,255,0.3)', transition: 'background 0.3s' }} />
          ))}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 8 }}>{steps[step - 1]}</p>
      </div>

      <div style={{ padding: '24px 16px', maxWidth: 440, width: '100%', margin: '0 auto', flex: 1 }}>

        {serverError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff5f5', border: '1.5px solid #fc8181', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
            <AlertCircle size={16} color="#e53e3e" />
            <p style={{ color: '#c53030', fontSize: 13 }}>{serverError}</p>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {([
              ['firstName', t('signup.firstName'), 'Jean', 'text'],
              ['lastName', t('signup.lastName'), 'Dupont', 'text'],
              ['dateOfBirth', t('signup.dateOfBirth'), '', 'date'],
            ] as [keyof FormData, string, string, string][]).map(([f, label, ph, type]) => (
              <div key={f}>
                <label style={{ fontSize: 13, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 6 }}>{label}</label>
                <input type={type} placeholder={ph} value={form[f]}
                  onChange={e => { setForm({ ...form, [f]: e.target.value }); setErrors({}); }}
                  style={{ ...inp, borderColor: errors[f] ? '#e53e3e' : '#d0e8e6' }} />
                {errors[f] && <p style={{ color: '#e53e3e', fontSize: 12, marginTop: 3 }}>{errors[f]}</p>}
              </div>
            ))}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 6 }}>Genre</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['M', 'Masculin'], ['F', 'Féminin'], ['O', 'Autre']].map(([v, l]) => (
                  <button key={v} onClick={() => setForm({ ...form, gender: v })}
                    style={{ flex: 1, height: 42, borderRadius: 10, border: `2px solid ${form.gender === v ? TEAL : '#d0e8e6'}`, background: form.gender === v ? TEAL + '18' : 'white', color: form.gender === v ? TEAL : NAVY, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {([
              ['email', t('signup.email'), 'vous@example.com', 'email'],
              ['phone', t('signup.phone'), '+261 32 XX XX XX', 'tel'],
              ['city', 'Ville', 'Antananarivo', 'text'],
            ] as [keyof FormData, string, string, string][]).map(([f, label, ph, type]) => (
              <div key={f}>
                <label style={{ fontSize: 13, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 6 }}>{label}</label>
                <input type={type} placeholder={ph} value={form[f]}
                  onChange={e => { setForm({ ...form, [f]: e.target.value }); setErrors({}); }}
                  style={{ ...inp, borderColor: errors[f] ? '#e53e3e' : '#d0e8e6' }} />
                {errors[f] && <p style={{ color: '#e53e3e', fontSize: 12, marginTop: 3 }}>{errors[f]}</p>}
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 6 }}>{t('signup.password')}</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({}); }}
                  style={{ ...inp, borderColor: errors.password ? '#e53e3e' : '#d0e8e6', paddingRight: 44 }} />
                <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ab0ae' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#e53e3e', fontSize: 12, marginTop: 3 }}>{errors.password}</p>}
              <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                {[8, 12, 16].map(n => (
                  <div key={n} style={{ flex: 1, height: 4, borderRadius: 2, background: form.password.length >= n ? TEAL : '#e0eeec' }} />
                ))}
              </div>
              <p style={{ fontSize: 11, color: '#9ab0ae', marginTop: 4 }}>{t('signup.minChars')}</p>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 6 }}>{t('signup.confirmPassword')}</label>
              <input type="password" placeholder="••••••••" value={form.confirmPassword}
                onChange={e => { setForm({ ...form, confirmPassword: e.target.value }); setErrors({}); }}
                style={{ ...inp, borderColor: errors.confirmPassword ? '#e53e3e' : '#d0e8e6' }} />
              {errors.confirmPassword && <p style={{ color: '#e53e3e', fontSize: 12, marginTop: 3 }}>{errors.confirmPassword}</p>}
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eaf5ea', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={44} color="#5cb85c" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: NAVY, marginBottom: 8 }}>{t('signup.success')}</h2>
            {patientNumber && (
              <div style={{ background: '#e8f5f3', borderRadius: 10, padding: '8px 16px', display: 'inline-block', marginBottom: 12 }}>
                <p style={{ fontSize: 12, color: '#6b8a87' }}>N° patient</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: TEAL }}>{patientNumber}</p>
              </div>
            )}
            <div style={{ background: '#f0f8f7', borderRadius: 14, padding: 14, textAlign: 'left', marginTop: 12 }}>
              {([['signup.firstName', `${form.firstName} ${form.lastName}`], ['signup.email', form.email], ['signup.phone', form.phone]] as [string, string][]).map(([k, v]) => (
                <p key={k} style={{ fontSize: 13, color: '#6b8a87', marginBottom: 4 }}>
                  <b style={{ color: NAVY }}>{t(k)}:</b> {v}
                </p>
              ))}
            </div>
            <p style={{ fontSize: 14, color: '#6b8a87', marginTop: 12 }}>{t('signup.confirmed')}</p>
          </div>
        )}
      </div>

      <div style={{ padding: '16px', display: 'flex', gap: 10, maxWidth: 440, width: '100%', margin: '0 auto' }}>
        {step < 4 && (
          <button onClick={() => step > 1 ? setStep(step - 1) : setLocation('/login')}
            disabled={loading}
            style={{ flex: 1, height: 52, background: 'transparent', border: `2px solid ${TEAL}`, borderRadius: 14, color: TEAL, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {step > 1 ? t('signup.back') : t('signup.cancel')}
          </button>
        )}
        <button
          onClick={step === 4 ? () => setLocation('/dashboard') : handleNext}
          disabled={loading}
          style={{ flex: 1, height: 52, background: loading ? '#9bc8c3' : step === 4 ? ORANGE : TEAL, color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Création...' : step === 4 ? t('signup.finish') : t('signup.next')}
        </button>
      </div>
    </div>
  );
}
