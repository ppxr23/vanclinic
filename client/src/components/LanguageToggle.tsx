import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  return (
    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 3, gap: 2 }}>
      {(['fr', 'mg'] as const).map((lang) => (
        <button key={lang} onClick={() => setLanguage(lang)} style={{
          padding: '4px 12px', borderRadius: 16, border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 700, transition: 'all 0.2s',
          background: language === lang ? 'white' : 'transparent',
          color: language === lang ? '#1a9b8e' : 'white',
        }}>
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
