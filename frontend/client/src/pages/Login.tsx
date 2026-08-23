import { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import LanguageToggle from '@/components/LanguageToggle';
import { Eye, EyeOff, Mail, Phone } from 'lucide-react';

const TEAL = '#1a9b8e'; const NAVY = '#1e3a5f'; const ORANGE = '#f0821d';

export default function Login() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { login } = useAuth();
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const newErrors: Record<string, string> = {};
    if (!identifier) newErrors.identifier = `${loginType === 'email' ? t('login.email') : t('login.phone')} ${t('login.required')}`;
    if (!password) newErrors.password = `${t('login.password')} ${t('login.required')}`;
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    const redirect = await login(identifier, password);
    setLoading(false);

    if (redirect) {
      setLocation(redirect);
    } else {
      setErrors({ identifier: 'Email ou mot de passe incorrect' });
    }
  };

  const inp = (hasError?: boolean): React.CSSProperties => ({
    width: '100%', height: 50, padding: '0 14px',
    border: `2px solid ${hasError ? '#e53e3e' : '#d0e8e6'}`,
    borderRadius: 12, fontSize: 15, outline: 'none',
    background: 'white', color: NAVY, transition: 'border-color 0.2s',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f4f9f8', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: TEAL, padding: '40px 24px 32px', borderRadius: '0 0 32px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}><LanguageToggle /></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
         <img src="/New_Logo.png" alt="VanClinic" style={{ width: 200, height: 100, objectFit: 'contain' }} />
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 18, marginTop: 10, fontWeight: 'Bold' }}>{t('login.subtitle')}</p>
        </div>
      </div>

      <div style={{ padding: '24px 20px', maxWidth: 440, width: '100%', margin: '0 auto' }}>
        {/* Toggle */}
        <div style={{ display: 'flex', background: '#e8f5f3', borderRadius: 12, padding: 4, marginBottom: 20 }}>
          {(['email', 'phone'] as const).map((type) => (
            <button key={type} onClick={() => setLoginType(type)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: loginType === type ? TEAL : 'transparent', color: loginType === type ? 'white' : TEAL, transition: 'all 0.2s' }}>
              {type === 'email' ? <Mail size={15} /> : <Phone size={15} />}
              {type === 'email' ? t('login.email') : t('login.phone')}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6 }}>{loginType === 'email' ? t('login.email') : t('login.phone')}</label>
          <input type={loginType === 'email' ? 'email' : 'tel'} placeholder={loginType === 'email' ? 'vous@example.com' : '+261 32 XX XX XX'} value={identifier} onChange={(e) => { setIdentifier(e.target.value); setErrors({}); }} style={inp(!!errors.identifier)} />
          {errors.identifier && <p style={{ color: '#e53e3e', fontSize: 12, marginTop: 4 }}>{errors.identifier}</p>}
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6 }}>{t('login.password')}</label>
          <div style={{ position: 'relative' }}>
            <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => { setPassword(e.target.value); setErrors({}); }} style={{ ...inp(!!errors.password), paddingRight: 44 }} />
            <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b8a87' }}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p style={{ color: '#e53e3e', fontSize: 12, marginTop: 4 }}>{errors.password}</p>}
        </div>

        <button onClick={() => setLocation('/reset-password')} style={{ background: 'none', border: 'none', color: TEAL, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20, display: 'block', textAlign: 'right', width: '100%' }}>
          {t('login.forgotPassword')}
        </button>

        <button onClick={handleLogin} disabled={loading} style={{ width: '100%', height: 52, background: loading ? '#9bc8c3' : TEAL, color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 14 }}>
          {loading ? 'Connexion...' : t('login.signIn')}
        </button>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#6b8a87' }}>
          {t('login.noAccount')}{' '}
          <button onClick={() => setLocation('/signup')} style={{ background: 'none', border: 'none', color: ORANGE, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>{t('login.signUp')}</button>
        </p>
      </div>
    </div>
  );
}
