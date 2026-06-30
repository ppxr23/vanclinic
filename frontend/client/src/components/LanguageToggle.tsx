import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageToggle({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const { language, setLanguage } = useLanguage();
  const isLight = variant === 'light';
  return (
    <div style={{ display: 'flex', background: isLight ? 'rgba(255,255,255,0.2)' : '#e8f5f3', borderRadius: 20, padding: 3, gap: 2 }}>
      {(['fr', 'mg'] as const).map((lang) => {
        const active = language === lang;
        return (
          <button key={lang} onClick={() => setLanguage(lang)} style={{
            padding: '4px 12px', borderRadius: 16, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 700, transition: 'all 0.2s',
            background: active ? (isLight ? 'white' : '#1a9b8e') : 'transparent',
            color: active ? (isLight ? '#1a9b8e' : 'white') : (isLight ? 'white' : '#1a9b8e'),
          }}>
            {lang.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
