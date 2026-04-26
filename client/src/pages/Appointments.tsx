import { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Calendar, Clock, CheckCircle2, MapPin } from 'lucide-react';

const TEAL = '#1a9b8e'; const NAVY = '#1e3a5f'; const ORANGE = '#f0821d';

type Step = 'list' | 'type' | 'date' | 'time' | 'confirm' | 'success';

export default function Appointments() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('list');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const types = [
    { id: 'consultation', name: t('appointments.generalConsultation'), duration: '30 min', price: '50 000 Ar' },
    { id: 'eye-exam', name: t('appointments.eyeExam'), duration: '45 min', price: '75 000 Ar' },
    { id: 'follow-up', name: t('appointments.followUp'), duration: '20 min', price: '30 000 Ar' },
    { id: 'surgery', name: t('appointments.surgery'), duration: '2h', price: 'Sur devis' },
  ];
  const dates = ['2026-04-21','2026-04-22','2026-04-23','2026-04-24','2026-04-25'];
  const times = ['09:00','10:00','11:00','14:00','15:00','16:00'];

  const handleBack = () => {
    const flow: Step[] = ['list','type','date','time','confirm'];
    const idx = flow.indexOf(step);
    if (idx <= 0) setLocation('/dashboard'); else setStep(flow[idx-1]);
  };
  const handleNext = () => {
    const flow: Step[] = ['type','date','time','confirm','success'];
    const idx = flow.indexOf(step);
    if (step === 'list') { setStep('type'); return; }
    if ((step === 'type' && selectedType) || (step === 'date' && selectedDate) || (step === 'time' && selectedTime) || step === 'confirm') {
      setStep(flow[idx+1] || 'success');
    }
  };

  const card: React.CSSProperties = { background: 'white', borderRadius: 14, border: '1px solid #d0e8e6', padding: 14 };
  const stepTitle: Record<Step, string> = { list: t('appointments.title'), type: t('appointments.appointmentType'), date: t('appointments.chooseDate'), time: t('appointments.chooseTime'), confirm: t('appointments.confirmation'), success: t('appointments.success') };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f9f8', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ background: TEAL, padding: '20px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {step !== 'list' && step !== 'success' && (
            <button onClick={handleBack} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={20} color="white" />
            </button>
          )}
          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{stepTitle[step]}</h1>
        </div>
        {step !== 'list' && step !== 'success' && (
          <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
            {(['type','date','time','confirm'] as Step[]).map((s) => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: ['type','date','time','confirm'].indexOf(s) <= ['type','date','time','confirm'].indexOf(step) ? 'white' : 'rgba(255,255,255,0.3)', transition: 'background 0.3s' }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '20px 16px', maxWidth: 500, margin: '0 auto' }}>
        {/* LIST */}
        {step === 'list' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {[t('appointments.upcoming'), t('appointments.past')].map((tab, i) => (
                <button key={tab} style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, background: i === 0 ? TEAL : '#e8f5f3', color: i === 0 ? 'white' : TEAL }}>{tab}</button>
              ))}
            </div>
            {[
              { title: 'Consultation Ophtalmologie', doctor: 'Dr. Marie Rakoto', date: 'Demain à 14h30', color: TEAL },
              { title: 'Suivi post-opératoire', doctor: 'Dr. Jean Rakotondrazaka', date: '25 avril à 10h00', color: '#5cb85c' },
            ].map((rdv, i) => (
              <div key={i} style={{ ...card, borderLeft: `4px solid ${rdv.color}`, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>{rdv.title}</p>
                    <p style={{ color: '#6b8a87', fontSize: 12, marginTop: 2 }}>{rdv.doctor}</p>
                  </div>
                  <span style={{ background: '#e8f5f3', color: '#0f6e65', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, height: 'fit-content' }}>{t('dashboard.confirmed')}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6b8a87' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} color={rdv.color}/>{rdv.date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} color={rdv.color}/>Toamasina</span>
                </div>
              </div>
            ))}
            <button onClick={handleNext} style={{ width: '100%', height: 52, background: ORANGE, color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>+ Nouveau rendez-vous</button>
          </div>
        )}

        {/* TYPE */}
        {step === 'type' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {types.map((type) => (
                <button key={type.id} onClick={() => setSelectedType(type.id)} style={{ background: 'white', border: `2px solid ${selectedType === type.id ? TEAL : '#d0e8e6'}`, borderRadius: 14, padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.2s' }}>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>{type.name}</p>
                    <p style={{ color: '#6b8a87', fontSize: 12, marginTop: 2 }}>{type.duration}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, color: TEAL, fontSize: 14 }}>{type.price}</p>
                    {selectedType === type.id && <CheckCircle2 size={18} color={TEAL} />}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={handleNext} disabled={!selectedType} style={{ width: '100%', height: 52, background: selectedType ? TEAL : '#9ab0ae', color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: selectedType ? 'pointer' : 'not-allowed' }}>{t('appointments.continue')}</button>
          </div>
        )}

        {/* DATE */}
        {step === 'date' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {dates.map((date) => (
                <button key={date} onClick={() => setSelectedDate(date)} style={{ background: selectedDate === date ? TEAL : 'white', border: `2px solid ${selectedDate === date ? TEAL : '#d0e8e6'}`, borderRadius: 14, padding: '14px 10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <p style={{ fontWeight: 700, color: selectedDate === date ? 'white' : NAVY, fontSize: 14 }}>{new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' })}</p>
                  <p style={{ color: selectedDate === date ? 'rgba(255,255,255,0.85)' : '#6b8a87', fontSize: 13 }}>{new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                </button>
              ))}
            </div>
            <button onClick={handleNext} disabled={!selectedDate} style={{ width: '100%', height: 52, background: selectedDate ? TEAL : '#9ab0ae', color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: selectedDate ? 'pointer' : 'not-allowed' }}>{t('appointments.continue')}</button>
          </div>
        )}

        {/* TIME */}
        {step === 'time' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              {times.map((time) => (
                <button key={time} onClick={() => setSelectedTime(time)} style={{ background: selectedTime === time ? TEAL : 'white', border: `2px solid ${selectedTime === time ? TEAL : '#d0e8e6'}`, borderRadius: 12, padding: '12px 0', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Clock size={14} color={selectedTime === time ? 'white' : TEAL} style={{ margin: '0 auto 4px' }} />
                  <p style={{ fontWeight: 700, color: selectedTime === time ? 'white' : NAVY, fontSize: 14 }}>{time}</p>
                </button>
              ))}
            </div>
            <button onClick={handleNext} disabled={!selectedTime} style={{ width: '100%', height: 52, background: selectedTime ? TEAL : '#9ab0ae', color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: selectedTime ? 'pointer' : 'not-allowed' }}>{t('appointments.continue')}</button>
          </div>
        )}

        {/* CONFIRM */}
        {step === 'confirm' && (
          <div>
            <div style={{ ...card, background: '#e8f5f3', border: '1px solid #b0d8d4', marginBottom: 20 }}>
              <p style={{ fontWeight: 700, color: NAVY, fontSize: 15, marginBottom: 12 }}>{t('appointments.summary')}</p>
              {[
                { label: t('appointments.type'), value: types.find(t => t.id === selectedType)?.name },
                { label: t('appointments.date'), value: new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) },
                { label: t('appointments.time'), value: selectedTime },
                { label: t('appointments.location'), value: 'VanClinic mobile — Toamasina' },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: '#6b8a87' }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: NAVY }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleBack} style={{ flex: 1, height: 52, background: 'transparent', border: `2px solid ${TEAL}`, borderRadius: 14, color: TEAL, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>{t('appointments.modify')}</button>
              <button onClick={handleNext} style={{ flex: 1, height: 52, background: TEAL, border: 'none', borderRadius: 14, color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>{t('appointments.confirm')}</button>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', paddingTop: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eaf5ea', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={44} color="#5cb85c" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: NAVY, marginBottom: 8 }}>{t('appointments.appointmentConfirmed')}</h2>
            <p style={{ color: '#6b8a87', fontSize: 14, marginBottom: 20 }}>{t('appointments.sentTo')}</p>
            <div style={{ ...card, background: '#e8f5f3', marginBottom: 24, textAlign: 'left' }}>
              <p style={{ fontSize: 13, color: '#6b8a87' }}><b style={{ color: NAVY }}>Confirmation: </b>#RDV-2026-04-21-001</p>
            </div>
            <button onClick={() => setLocation('/dashboard')} style={{ width: '100%', height: 52, background: TEAL, color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>{t('appointments.backToDashboard')}</button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
