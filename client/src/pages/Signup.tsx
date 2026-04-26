import { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import { ChevronLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const TEAL = '#1a9b8e'; const NAVY = '#1e3a5f'; const ORANGE = '#f0821d';

export default function Signup() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ firstName: '', lastName: '', dateOfBirth: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);

  const steps = [t('signup.step1'), t('signup.step2'), t('signup.step3'), t('signup.step4')];

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!form.firstName) e.firstName = `${t('signup.firstName')} ${t('login.required')}`;
      if (!form.lastName) e.lastName = `${t('signup.lastName')} ${t('login.required')}`;
      if (!form.dateOfBirth) e.dateOfBirth = `${t('signup.dateOfBirth')} ${t('login.required')}`;
    } else if (step === 2) {
      if (!form.email) e.email = `${t('signup.email')} ${t('login.required')}`;
      if (!form.phone) e.phone = `${t('signup.phone')} ${t('login.required')}`;
    } else if (step === 3) {
      if (form.password.length < 8) e.password = t('signup.minChars');
      if (form.password !== form.confirmPassword) e.confirmPassword = t('signup.passwordMismatch');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    if (step < 4) setStep(step + 1);
    else setLocation('/dashboard');
  };

  const inp: React.CSSProperties = { width: '100%', height: 50, padding: '0 14px', border: '2px solid #d0e8e6', borderRadius: 12, fontSize: 15, outline: 'none', color: NAVY, background: 'white' };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f9f8', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: TEAL, padding: '20px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={() => step > 1 ? setStep(step - 1) : setLocation('/login')} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={20} color="white" />
          </button>
          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{t('signup.title')}</h1>
          <LanguageToggle />
        </div>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 6 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < step ? 'white' : 'rgba(255,255,255,0.3)', transition: 'background 0.3s' }} />
          ))}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 8 }}>{steps[step - 1]}</p>
      </div>

      <div style={{ padding: '24px 16px', maxWidth: 440, width: '100%', margin: '0 auto', flex: 1 }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[['firstName', t('signup.firstName'), 'Jean', 'text'], ['lastName', t('signup.lastName'), 'Dupont', 'text'], ['dateOfBirth', t('signup.dateOfBirth'), '', 'date']].map(([f, label, ph, type]) => (
              <div key={f}>
                <label style={{ fontSize: 13, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 6 }}>{label}</label>
                <input type={type} placeholder={ph} value={form[f as keyof typeof form]} onChange={e => setForm({ ...form, [f]: e.target.value })} style={{ ...inp, borderColor: errors[f] ? '#e53e3e' : '#d0e8e6' }} />
                {errors[f] && <p style={{ color: '#e53e3e', fontSize: 12, marginTop: 3 }}>{errors[f]}</p>}
              </div>
            ))}
          </div>
        )}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[['email', t('signup.email'), 'vous@example.com', 'email'], ['phone', t('signup.phone'), '+261 32 XX XX XX', 'tel']].map(([f, label, ph, type]) => (
              <div key={f}>
                <label style={{ fontSize: 13, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 6 }}>{label}</label>
                <input type={type} placeholder={ph} value={form[f as keyof typeof form]} onChange={e => setForm({ ...form, [f]: e.target.value })} style={{ ...inp, borderColor: errors[f] ? '#e53e3e' : '#d0e8e6' }} />
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
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ ...inp, borderColor: errors.password ? '#e53e3e' : '#d0e8e6', paddingRight: 44 }} />
                <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ab0ae' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#e53e3e', fontSize: 12, marginTop: 3 }}>{errors.password}</p>}
              <p style={{ fontSize: 12, color: '#9ab0ae', marginTop: 4 }}>{t('signup.minChars')}</p>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 6 }}>{t('signup.confirmPassword')}</label>
              <input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} style={{ ...inp, borderColor: errors.confirmPassword ? '#e53e3e' : '#d0e8e6' }} />
              {errors.confirmPassword && <p style={{ color: '#e53e3e', fontSize: 12, marginTop: 3 }}>{errors.confirmPassword}</p>}
            </div>
          </div>
        )}
        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eaf5ea', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={44} color="#5cb85c" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: NAVY, marginBottom: 8 }}>{t('signup.success')}</h2>
            <div style={{ background: '#e8f5f3', borderRadius: 14, padding: 14, textAlign: 'left', marginTop: 16 }}>
              {[['signup.firstName', `${form.firstName} ${form.lastName}`], ['signup.email', form.email], ['signup.phone', form.phone]].map(([k, v]) => (
                <p key={k} style={{ fontSize: 13, color: '#6b8a87', marginBottom: 4 }}><b style={{ color: NAVY }}>{t(k)}:</b> {v}</p>
              ))}
            </div>
            <p style={{ fontSize: 14, color: '#6b8a87', marginTop: 12 }}>{t('signup.confirmed')}</p>
          </div>
        )}
      </div>

      <div style={{ padding: '16px', display: 'flex', gap: 10, maxWidth: 440, width: '100%', margin: '0 auto' }}>
        <button onClick={() => step > 1 ? setStep(step - 1) : setLocation('/login')} style={{ flex: 1, height: 52, background: 'transparent', border: `2px solid ${TEAL}`, borderRadius: 14, color: TEAL, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          {step > 1 ? t('signup.back') : t('signup.cancel')}
        </button>
        <button onClick={handleNext} style={{ flex: 1, height: 52, background: step === 4 ? ORANGE : TEAL, color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          {step === 4 ? t('signup.finish') : t('signup.next')}
        </button>
      </div>
    </div>
  );
}
