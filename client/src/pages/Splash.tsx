import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import { Bold } from 'lucide-react';

export default function Splash() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => setLocation('/login'), 3000);
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: '#1a9b8e' }}>
      <div className="absolute top-6 right-6 z-20"><LanguageToggle /></div>
      <div className="absolute top-[-60px] left-[-60px] w-48 h-48 rounded-full opacity-10" style={{ background: '#f0821d' }} />
      <div className="absolute bottom-[-40px] right-[-40px] w-64 h-64 rounded-full opacity-10" style={{ background: '#5cb85c' }} />
      <img src="/New_Logo.png" alt="VanClinic" style={{ width: 200, height: 100, objectFit: 'contain' }} />
      <p className="relative z-10 text-base mt-12" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 20, fontWeight: 'Bold' }}>"{t('splash.subtitle1')}"</p>
      <p className="relative z-10 text-base mb-12" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 20, fontWeight: 'Bold' }}>"{t('splash.subtitle2')}"</p>
      <div className="relative z-10 flex gap-2">
        {[0,1,2].map((i) => (
          <div key={i} className="w-3 h-3 rounded-full bg-white animate-bounce" style={{ animationDelay: `${i*150}ms`, opacity: 0.8 }} />
        ))}
      </div>
    </div>
  );
}
