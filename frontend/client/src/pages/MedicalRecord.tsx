import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { api } from '@/lib/api';
import { Download, Eye, ChevronDown, Pill, Calendar, User, LogOut } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import NotificationBell from '@/components/NotificationBell';

const TEAL = '#1a9b8e'; const NAVY = '#1e3a5f'; const GREEN = '#5cb85c';
type Tab = 'prescriptions' | 'history' | 'vision';

interface MedicalRecord {
  id: number;
  consultationDate?: string;
  chiefComplaint?: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  observations?: string;
  rightEyeSphere?: string;
  rightEyeCylinder?: string;
  rightEyeAxis?: number;
  rightEyeVisionCorrected?: string;
  rightEyeVisionUncorrected?: string;
  leftEyeSphere?: string;
  leftEyeCylinder?: string;
  leftEyeAxis?: number;
  leftEyeVisionCorrected?: string;
  leftEyeVisionUncorrected?: string;
  createdBy?: { firstName: string; lastName: string };
  createdAt?: string;
}

function visionScore(s?: string): number {
  if (!s) return 100;
  const parts = s.split('/');
  if (parts.length !== 2) return 100;
  return Math.round((parseInt(parts[0]) / parseInt(parts[1])) * 100);
}

export default function MedicalRecord() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('prescriptions');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<MedicalRecord[]>('/medical/records/my')
      .then(r => setRecords(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const card: React.CSSProperties = { background: 'white', borderRadius: 14, border: '1px solid #d0e8e6', padding: 14 };

  const latest = records[0] ?? null;
  const hasVision = latest && (latest.rightEyeVisionCorrected || latest.leftEyeVisionCorrected);

  return (
    <div style={{ minHeight: '100vh', background: '#f4f9f8', paddingBottom: 90 }}>
      <div style={{ background: TEAL, padding: '20px 20px 24px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{t('medicalRecord.title')}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LanguageToggle />
            <NotificationBell />
            <button onClick={() => { logout(); setLocation('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.15)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'white', fontFamily: 'inherit' }}>
              <LogOut size={14} color="white" /> {t('profile.logout')}
            </button>
          </div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{t('medicalRecord.subtitle')}</p>
      </div>

      <div style={{ padding: '16px', maxWidth: 500, margin: '0 auto' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', background: 'white', borderRadius: 12, padding: 4, gap: 4, marginBottom: 16, border: '1px solid #d0e8e6' }}>
          {(['prescriptions', 'history', 'vision'] as Tab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: activeTab === tab ? TEAL : 'transparent', color: activeTab === tab ? 'white' : '#6b8a87', transition: 'all 0.2s' }}>
              {t(`medicalRecord.${tab}`)}
            </button>
          ))}
        </div>

        {loading && (
          <p style={{ textAlign: 'center', color: '#6b8a87', padding: 32 }}>Chargement...</p>
        )}

        {!loading && records.length === 0 && (
          <div style={{ ...card, textAlign: 'center', padding: 40 }} data-testid="empty-records">
            <p style={{ color: '#6b8a87', fontSize: 14 }}>{t('medicalRecord.noRecords')}</p>
          </div>
        )}

        {/* PRESCRIPTIONS */}
        {!loading && records.length > 0 && activeTab === 'prescriptions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {latest && (
              <div style={{ ...card, borderLeft: `4px solid ${GREEN}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>{t('medicalRecord.activePrescription')}</p>
                    {latest.createdBy && (
                      <p style={{ color: '#6b8a87', fontSize: 12 }}>Dr. {latest.createdBy.firstName} {latest.createdBy.lastName}</p>
                    )}
                  </div>
                  <span style={{ background: '#eaf5ea', color: '#27500a', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{t('medicalRecord.valid')}</span>
                </div>

                {(latest.rightEyeSphere || latest.leftEyeSphere) && (
                  <div style={{ background: '#f4f9f8', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        ['OD (Droit)', latest.rightEyeSphere, latest.rightEyeCylinder, latest.rightEyeAxis],
                        ['OS (Gauche)', latest.leftEyeSphere, latest.leftEyeCylinder, latest.leftEyeAxis],
                      ].map(([eye, sphere, cyl, axis]) => (
                        <div key={String(eye)}>
                          <p style={{ fontWeight: 700, color: NAVY, fontSize: 12, textAlign: 'center', marginBottom: 8 }}>{eye}</p>
                          {[['Sphère', sphere], ['Cylindre', cyl], ['Axe', axis]].map(([k, v]) => v != null && (
                            <p key={String(k)} style={{ fontSize: 12, color: '#6b8a87', marginBottom: 3 }}><b style={{ color: NAVY }}>{k}:</b> {v}</p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {latest.prescription && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontWeight: 700, color: NAVY, fontSize: 13, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Pill size={14} color={TEAL} />{t('medicalRecord.medications')}</p>
                    <p style={{ fontSize: 12, color: '#6b8a87', whiteSpace: 'pre-line' }}>{latest.prescription}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ flex: 1, height: 40, background: 'transparent', border: `2px solid ${TEAL}`, borderRadius: 10, color: TEAL, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Eye size={14} />{t('medicalRecord.view')}</button>
                  <button style={{ flex: 1, height: 40, background: TEAL, border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Download size={14} />{t('medicalRecord.downloadPdf')}</button>
                </div>
              </div>
            )}

            {records.slice(1).map(rec => (
              <div key={rec.id} style={{ ...card, borderLeft: '4px solid #d0e8e6', opacity: 0.7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>{t('medicalRecord.previousPrescription')}</p>
                    {rec.createdBy && <p style={{ color: '#6b8a87', fontSize: 12 }}>Dr. {rec.createdBy.firstName} {rec.createdBy.lastName}</p>}
                  </div>
                  <span style={{ background: '#f0f0f0', color: '#888', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{t('medicalRecord.expired')}</span>
                </div>
                <button style={{ width: '100%', height: 38, background: 'transparent', border: `2px solid #d0e8e6`, borderRadius: 10, color: '#6b8a87', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Download size={14} />{t('medicalRecord.download')}</button>
              </div>
            ))}
          </div>
        )}

        {/* HISTORY */}
        {!loading && records.length > 0 && activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {records.map((rec) => (
              <div key={rec.id} style={{ ...card, cursor: 'pointer' }} onClick={() => setExpanded(expanded === rec.id ? null : rec.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Calendar size={13} color={TEAL} />
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#6b8a87' }}>
                        {rec.consultationDate ? new Date(rec.consultationDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                      </p>
                    </div>
                    <p style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>{rec.chiefComplaint || rec.diagnosis || 'Consultation'}</p>
                    {rec.createdBy && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <User size={13} color="#6b8a87" />
                        <p style={{ fontSize: 12, color: '#6b8a87' }}>Dr. {rec.createdBy.firstName} {rec.createdBy.lastName}</p>
                      </div>
                    )}
                  </div>
                  <ChevronDown size={18} color="#9ab0ae" style={{ transform: expanded === rec.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
                {expanded === rec.id && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e8f5f3' }}>
                    {rec.observations && <p style={{ fontSize: 13, color: '#6b8a87', marginBottom: 10 }}><b style={{ color: NAVY }}>{t('medicalRecord.notes')}</b> {rec.observations}</p>}
                    {rec.diagnosis && <p style={{ fontSize: 13, color: '#6b8a87', marginBottom: 10 }}><b style={{ color: NAVY }}>Diagnostic: </b>{rec.diagnosis}</p>}
                    <button style={{ width: '100%', height: 38, background: 'transparent', border: `2px solid ${TEAL}`, borderRadius: 10, color: TEAL, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Download size={14} />{t('medicalRecord.downloadReport')}</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* VISION */}
        {!loading && activeTab === 'vision' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {hasVision ? (
              <>
                <div style={card}>
                  <p style={{ fontWeight: 700, color: NAVY, fontSize: 15, marginBottom: 14 }}>{t('medicalRecord.visualAcuity')}</p>
                  {[
                    { eye: 'OD (Oeil Droit)', score: latest.rightEyeVisionCorrected, pct: visionScore(latest.rightEyeVisionCorrected), color: GREEN },
                    { eye: 'OS (Oeil Gauche)', score: latest.leftEyeVisionCorrected, pct: visionScore(latest.leftEyeVisionCorrected), color: (pct: number) => pct >= 80 ? GREEN : TEAL },
                  ].map((v) => {
                    const color = typeof v.color === 'function' ? v.color(v.pct) : v.color;
                    return (
                      <div key={v.eye} style={{ marginBottom: 16 }}>
                        <p style={{ fontWeight: 700, color: NAVY, fontSize: 13, marginBottom: 8 }}>{v.eye}</p>
                        <div style={{ background: '#f4f9f8', borderRadius: 10, padding: 12 }}>
                          <p style={{ fontSize: 24, fontWeight: 700, color: TEAL, textAlign: 'center' }}>{v.score || '—'}</p>
                          <p style={{ fontSize: 11, color: '#6b8a87', textAlign: 'center', marginBottom: 8 }}>
                            {v.pct >= 90 ? t('medicalRecord.normal') : t('medicalRecord.slightReduction')}
                          </p>
                          <div style={{ height: 8, background: '#d0e8e6', borderRadius: 4 }}>
                            <div style={{ height: 8, width: `${v.pct}%`, background: color, borderRadius: 4, transition: 'width 0.5s' }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ ...card, textAlign: 'center', padding: 40 }}>
                <p style={{ color: '#6b8a87', fontSize: 14 }}>{t('medicalRecord.noVisionData')}</p>
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
