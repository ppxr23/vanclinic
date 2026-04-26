import { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';

const TEAL = '#1a9b8e'; const NAVY = '#1e3a5f';
type Step = 'email' | 'otp' | 'newpw' | 'success';

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [pw, setPw] = useState('');

  const inp: React.CSSProperties = { width: '100%', height: 50, padding: '0 14px', border: '2px solid #d0e8e6', borderRadius: 12, fontSize: 15, outline: 'none', color: NAVY, background: 'white' };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f9f8', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: TEAL, padding: '20px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => step === 'email' ? setLocation('/login') : setStep(step === 'otp' ? 'email' : step === 'newpw' ? 'otp' : 'email')} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={20} color="white" />
          </button>
          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{t('resetPassword.title')}</h1>
        </div>
      </div>

      <div style={{ padding: '32px 16px', maxWidth: 440, width: '100%', margin: '0 auto' }}>
        {step === 'email' && (
          <div>
            <p style={{ fontSize: 14, color: '#6b8a87', marginBottom: 24 }}>{t('resetPassword.weWillSend')}</p>
            <label style={{ fontSize: 13, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 6 }}>{t('resetPassword.enterEmail')}</label>
            <input type="email" placeholder="vous@example.com" value={email} onChange={e => setEmail(e.target.value)} style={{ ...inp, marginBottom: 20 }} />
            <button onClick={() => setStep('otp')} disabled={!email} style={{ width: '100%', height: 52, background: email ? TEAL : '#9ab0ae', color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: email ? 'pointer' : 'not-allowed' }}>{t('resetPassword.sendCode')}</button>
          </div>
        )}
        {step === 'otp' && (
          <div>
            <p style={{ fontSize: 14, color: '#6b8a87', marginBottom: 24 }}>{t('resetPassword.enterCode')} <b style={{ color: NAVY }}>{email}</b></p>
            <label style={{ fontSize: 13, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 6 }}>{t('resetPassword.otpCode')}</label>
            <input type="text" placeholder="123456" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} style={{ ...inp, textAlign: 'center', letterSpacing: 8, fontSize: 22, marginBottom: 12 }} />
            <button onClick={() => {}} style={{ background: 'none', border: 'none', color: TEAL, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 20 }}>{t('resetPassword.resend')}</button>
            <button onClick={() => setStep('newpw')} disabled={otp.length < 6} style={{ width: '100%', height: 52, background: otp.length >= 6 ? TEAL : '#9ab0ae', color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: otp.length >= 6 ? 'pointer' : 'not-allowed' }}>{t('resetPassword.verifyCode')}</button>
          </div>
        )}
        {step === 'newpw' && (
          <div>
            <p style={{ fontSize: 14, color: '#6b8a87', marginBottom: 24 }}>{t('resetPassword.createSecure')}</p>
            <label style={{ fontSize: 13, fontWeight: 700, color: NAVY, display: 'block', marginBottom: 6 }}>{t('resetPassword.newPassword')}</label>
            <input type="password" placeholder="••••••••" value={pw} onChange={e => setPw(e.target.value)} style={{ ...inp, marginBottom: 20 }} />
            <button onClick={() => setStep('success')} disabled={pw.length < 8} style={{ width: '100%', height: 52, background: pw.length >= 8 ? TEAL : '#9ab0ae', color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: pw.length >= 8 ? 'pointer' : 'not-allowed' }}>{t('resetPassword.reset')}</button>
          </div>
        )}
        {step === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eaf5ea', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={44} color="#5cb85c" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: NAVY, marginBottom: 8 }}>{t('resetPassword.success')}</h2>
            <p style={{ fontSize: 14, color: '#6b8a87', marginBottom: 28 }}>{t('resetPassword.successMsg')}</p>
            <button onClick={() => setLocation('/login')} style={{ width: '100%', height: 52, background: TEAL, color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>{t('resetPassword.backToLogin')}</button>
          </div>
        )}
      </div>
    </div>
  );
}
