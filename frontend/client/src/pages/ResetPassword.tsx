import { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';
import { ChevronLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const TEAL = '#1a9b8e'; const NAVY = '#1e3a5f';
type Step = 'email' | 'otp' | 'newpw' | 'success';

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const inp: React.CSSProperties = {
    width: '100%', height: 50, padding: '0 14px',
    border: '2px solid #d0e8e6', borderRadius: 12,
    fontSize: 15, outline: 'none', color: NAVY, background: 'white',
  };

  const prevStep = (): void => {
    setError(null);
    if (step === 'email') setLocation('/login');
    else if (step === 'otp') setStep('email');
    else if (step === 'newpw') setStep('otp');
    else setLocation('/login');
  };

  const handleSendCode = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/forgot-password', { identifier: email });
      setStep('otp');
    } catch {
      setError("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResent(false);
    try {
      await api.post('/auth/forgot-password', { identifier: email });
      setResent(true);
    } catch { /* silencieux */ }
  };

  const handleVerifyToken = () => {
    if (token.length < 10) return;
    setError(null);
    setStep('newpw');
  };

  const handleResetPassword = async () => {
    if (pw.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/reset-password', { token, newPassword: pw });
      setStep('success');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Token invalide ou expiré. Recommencez depuis le début.');
    } finally {
      setLoading(false);
    }
  };

  const STEPS: Step[] = ['email', 'otp', 'newpw', 'success'];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f9f8', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: TEAL, padding: '20px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={prevStep} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={20} color="white" />
          </button>
          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{t('resetPassword.title')}</h1>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: STEPS.indexOf(step) >= i ? 'white' : 'rgba(255,255,255,0.3)', transition: 'background 0.3s' }} />
          ))}
        </div>
      </div>

      <div style={{ padding: '32px 16px', maxWidth: 440, width: '100%', margin: '0 auto', flex: 1 }}>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff5f5', border: '1.5px solid #fc8181', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
            <AlertCircle size={16} color="#e53e3e" />
            <p style={{ color: '#c53030', fontSize: 13 }}>{error}</p>
          </div>
        )}

        {step === 'email' && (
          <div>
            <p style={{ fontSize: 14, color: '#6b8a87', marginBottom: 24 }}>{t('resetPassword.weWillSend')}</p>
            <label style={{ fontSize: 13, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 6 }}>{t('resetPassword.enterEmail')}</label>
            <input type="email" placeholder="vous@example.com" value={email}
              onChange={e => { setEmail(e.target.value); setError(null); }}
              onKeyDown={e => e.key === 'Enter' && handleSendCode()}
              style={{ ...inp, marginBottom: 20 }} />
            <button onClick={handleSendCode} disabled={!email || loading}
              style={{ width: '100%', height: 52, background: (!email || loading) ? '#9bc8c3' : TEAL, color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: (!email || loading) ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Envoi...' : t('resetPassword.sendCode')}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div>
            <p style={{ fontSize: 14, color: '#6b8a87', marginBottom: 24 }}>
              {t('resetPassword.enterCode')} <b style={{ color: NAVY }}>{email}</b>
            </p>
            <label style={{ fontSize: 13, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 6 }}>Token de réinitialisation</label>
            <input type="text" placeholder="Collez le token reçu par email" value={token}
              onChange={e => { setToken(e.target.value.trim()); setError(null); }}
              style={{ ...inp, marginBottom: 8, fontFamily: 'monospace', fontSize: 12 }} />
            <p style={{ fontSize: 11, color: '#9ab0ae', marginBottom: 16 }}>
              En développement : consultez les logs Symfony pour récupérer le token.
            </p>
            <button onClick={handleResend} style={{ background: 'none', border: 'none', color: TEAL, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 20, display: 'block' }}>
              {resent ? 'Email renvoyé !' : t('resetPassword.resend')}
            </button>
            <button onClick={handleVerifyToken} disabled={token.length < 10}
              style={{ width: '100%', height: 52, background: token.length >= 10 ? TEAL : '#9ab0ae', color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: token.length >= 10 ? 'pointer' : 'not-allowed' }}>
              {t('resetPassword.verifyCode')}
            </button>
          </div>
        )}

        {step === 'newpw' && (
          <div>
            <p style={{ fontSize: 14, color: '#6b8a87', marginBottom: 24 }}>{t('resetPassword.createSecure')}</p>
            <label style={{ fontSize: 13, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 6 }}>{t('resetPassword.newPassword')}</label>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={pw}
                onChange={e => { setPw(e.target.value); setError(null); }}
                style={{ ...inp, paddingRight: 44 }} />
              <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ab0ae' }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
              {[8, 12, 16].map(n => (
                <div key={n} style={{ flex: 1, height: 4, borderRadius: 2, background: pw.length >= n ? TEAL : '#e0eeec' }} />
              ))}
            </div>
            <button onClick={handleResetPassword} disabled={pw.length < 8 || loading}
              style={{ width: '100%', height: 52, background: (pw.length >= 8 && !loading) ? TEAL : '#9ab0ae', color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: (pw.length >= 8 && !loading) ? 'pointer' : 'not-allowed' }}>
              {loading ? 'Réinitialisation...' : t('resetPassword.reset')}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eaf5ea', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={44} color="#5cb85c" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: NAVY, marginBottom: 8 }}>{t('resetPassword.success')}</h2>
            <p style={{ fontSize: 14, color: '#6b8a87', marginBottom: 28 }}>{t('resetPassword.successMsg')}</p>
            <button onClick={() => setLocation('/login')}
              style={{ width: '100%', height: 52, background: TEAL, color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
              {t('resetPassword.backToLogin')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
