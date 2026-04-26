import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import BottomNav from '@/components/BottomNav';
import { Download, Eye, ChevronDown, Pill, Calendar, User } from 'lucide-react';

const TEAL = '#1a9b8e'; const NAVY = '#1e3a5f'; const GREEN = '#5cb85c';
type Tab = 'prescriptions' | 'history' | 'vision';

export default function MedicalRecord() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('prescriptions');
  const [expanded, setExpanded] = useState<string | null>(null);
  const card: React.CSSProperties = { background: 'white', borderRadius: 14, border: '1px solid #d0e8e6', padding: 14 };

  const history = [
    { id: '1', date: '18 avril 2026', doctor: 'Dr. Marie Rakoto', type: 'Consultation ophtalmologie', notes: 'Examen de routine, prescription mise à jour.' },
    { id: '2', date: '25 mars 2026', doctor: 'Dr. Jean Rakotondrazaka', type: 'Suivi post-opératoire', notes: 'Cicatrisation normale, pas de complications.' },
    { id: '3', date: '10 février 2026', doctor: 'Dr. Marie Rakoto', type: 'Intervention chirurgicale', notes: 'Chirurgie réfractive - LASIK.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f9f8', paddingBottom: 90 }}>
      <div style={{ background: TEAL, padding: '20px 20px 24px', borderRadius: '0 0 24px 24px' }}>
        <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{t('medicalRecord.title')}</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 }}>{t('medicalRecord.subtitle')}</p>
      </div>

      <div style={{ padding: '16px', maxWidth: 500, margin: '0 auto' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', background: 'white', borderRadius: 12, padding: 4, gap: 4, marginBottom: 16, border: '1px solid #d0e8e6' }}>
          {(['prescriptions','history','vision'] as Tab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: activeTab === tab ? TEAL : 'transparent', color: activeTab === tab ? 'white' : '#6b8a87', transition: 'all 0.2s' }}>
              {t(`medicalRecord.${tab}`)}
            </button>
          ))}
        </div>

        {/* PRESCRIPTIONS */}
        {activeTab === 'prescriptions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ ...card, borderLeft: `4px solid ${GREEN}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <p style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>{t('medicalRecord.activePrescription')}</p>
                  <p style={{ color: '#6b8a87', fontSize: 12 }}>Dr. Marie Rakoto</p>
                </div>
                <span style={{ background: '#eaf5ea', color: '#27500a', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{t('medicalRecord.valid')}</span>
              </div>
              <div style={{ background: '#f4f9f8', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[['OD (Droit)', '+1.50', '-1.00', '90°', '+1.25'], ['OS (Gauche)', '+1.25', '-0.75', '85°', '+1.00']].map(([eye, sphere, cyl, axis, add]) => (
                    <div key={eye}>
                      <p style={{ fontWeight: 700, color: NAVY, fontSize: 12, textAlign: 'center', marginBottom: 8 }}>{eye}</p>
                      {[['Sphère', sphere], ['Cylindre', cyl], ['Axe', axis], ['Addition', add]].map(([k, v]) => (
                        <p key={k} style={{ fontSize: 12, color: '#6b8a87', marginBottom: 3 }}><b style={{ color: NAVY }}>{k}:</b> {v}</p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontWeight: 700, color: NAVY, fontSize: 13, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Pill size={14} color={TEAL} />{t('medicalRecord.medications')}</p>
                <p style={{ fontSize: 12, color: '#6b8a87' }}>• Gouttes oculaires lubrifiant - 3x/jour</p>
                <p style={{ fontSize: 12, color: '#6b8a87' }}>• Vitamine A - 1 comprimé/jour</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ flex: 1, height: 40, background: 'transparent', border: `2px solid ${TEAL}`, borderRadius: 10, color: TEAL, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Eye size={14} />{t('medicalRecord.view')}</button>
                <button style={{ flex: 1, height: 40, background: TEAL, border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Download size={14} />{t('medicalRecord.downloadPdf')}</button>
              </div>
            </div>

            <div style={{ ...card, borderLeft: '4px solid #d0e8e6', opacity: 0.7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <p style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>{t('medicalRecord.previousPrescription')}</p>
                  <p style={{ color: '#6b8a87', fontSize: 12 }}>Dr. Jean Rakotondrazaka</p>
                </div>
                <span style={{ background: '#f0f0f0', color: '#888', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{t('medicalRecord.expired')}</span>
              </div>
              <p style={{ fontSize: 12, color: '#6b8a87', marginBottom: 10 }}>{t('medicalRecord.expiresOn')} 15 mars 2026</p>
              <button style={{ width: '100%', height: 38, background: 'transparent', border: `2px solid #d0e8e6`, borderRadius: 10, color: '#6b8a87', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Download size={14} />{t('medicalRecord.download')}</button>
            </div>
          </div>
        )}

        {/* HISTORY */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {history.map((c) => (
              <div key={c.id} style={{ ...card, cursor: 'pointer' }} onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Calendar size={13} color={TEAL} />
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#6b8a87' }}>{c.date}</p>
                    </div>
                    <p style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>{c.type}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <User size={13} color="#6b8a87" />
                      <p style={{ fontSize: 12, color: '#6b8a87' }}>{c.doctor}</p>
                    </div>
                  </div>
                  <ChevronDown size={18} color="#9ab0ae" style={{ transform: expanded === c.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
                {expanded === c.id && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e8f5f3' }}>
                    <p style={{ fontSize: 13, color: '#6b8a87', marginBottom: 10 }}><b style={{ color: NAVY }}>{t('medicalRecord.notes')}</b> {c.notes}</p>
                    <button style={{ width: '100%', height: 38, background: 'transparent', border: `2px solid ${TEAL}`, borderRadius: 10, color: TEAL, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Download size={14} />{t('medicalRecord.downloadReport')}</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* VISION */}
        {activeTab === 'vision' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={card}>
              <p style={{ fontWeight: 700, color: NAVY, fontSize: 15, marginBottom: 14 }}>{t('medicalRecord.visualAcuity')}</p>
              {[{ eye: 'OD (Oeil Droit)', score: '20/20', label: t('medicalRecord.normal'), pct: 100, color: GREEN },
                { eye: 'OS (Oeil Gauche)', score: '20/25', label: t('medicalRecord.slightReduction'), pct: 80, color: '#f0821d' }].map((v) => (
                <div key={v.eye} style={{ marginBottom: 16 }}>
                  <p style={{ fontWeight: 700, color: NAVY, fontSize: 13, marginBottom: 8 }}>{v.eye}</p>
                  <div style={{ background: '#f4f9f8', borderRadius: 10, padding: 12 }}>
                    <p style={{ fontSize: 24, fontWeight: 700, color: TEAL, textAlign: 'center' }}>{v.score}</p>
                    <p style={{ fontSize: 11, color: '#6b8a87', textAlign: 'center', marginBottom: 8 }}>{v.label}</p>
                    <div style={{ height: 8, background: '#d0e8e6', borderRadius: 4 }}>
                      <div style={{ height: 8, width: `${v.pct}%`, background: v.color, borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={card}>
              <p style={{ fontWeight: 700, color: NAVY, fontSize: 15, marginBottom: 14 }}>{t('medicalRecord.intraocularpressure')}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[{ label: 'OD', val: '14 mmHg' }, { label: 'OS', val: '15 mmHg' }].map((p) => (
                  <div key={p.label} style={{ background: '#eaf5ea', borderRadius: 12, padding: '14px 10px', textAlign: 'center' }}>
                    <p style={{ fontSize: 12, color: '#6b8a87', marginBottom: 4 }}>{p.label}</p>
                    <p style={{ fontSize: 22, fontWeight: 700, color: GREEN }}>{p.val}</p>
                    <p style={{ fontSize: 11, color: '#27500a', marginTop: 2 }}>Normal</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
