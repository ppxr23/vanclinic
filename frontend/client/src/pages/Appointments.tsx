import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { api } from '@/lib/api';
import { ChevronLeft, Calendar, Clock, CheckCircle2, MapPin, AlertCircle, LogOut } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import NotificationBell from '@/components/NotificationBell';

const TEAL = '#1a9b8e'; const NAVY = '#1e3a5f'; const ORANGE = '#f0821d';

type Step = 'list' | 'type' | 'date' | 'time' | 'confirm' | 'success';

interface Appointment {
  id: number;
  scheduledAt: string;
  type: string;
  status: string;
  reason?: string;
  location?: string;
  ophthalmologist?: { firstName: string; lastName: string };
}

export default function Appointments() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('list');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmationNumber, setConfirmationNumber] = useState('');

  useEffect(() => {
    api.get<Appointment[]>('/appointments')
      .then(r => setAppointments(r.data))
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }, []);

  const types = [
    { id: 'on_site', name: t('appointments.generalConsultation'), duration: '30 min', price: '50 000 Ar' },
    { id: 'on_site_eye', name: t('appointments.eyeExam'), duration: '45 min', price: '75 000 Ar' },
    { id: 'follow_up', name: t('appointments.followUp'), duration: '20 min', price: '30 000 Ar' },
    { id: 'screening', name: t('appointments.surgery'), duration: '2h', price: 'Sur devis' },
  ];

  const today = new Date();
  const dates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return d.toISOString().split('T')[0];
  });
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  const handleBack = () => {
    const flow: Step[] = ['list', 'type', 'date', 'time', 'confirm'];
    const idx = flow.indexOf(step);
    if (idx <= 0) setLocation('/dashboard'); else setStep(flow[idx - 1]);
  };

  const handleNext = async () => {
    const flow: Step[] = ['type', 'date', 'time', 'confirm', 'success'];
    const idx = flow.indexOf(step);
    if (step === 'list') { setStep('type'); return; }
    if (step === 'confirm') {
      setSubmitting(true);
      setError('');
      try {
        const scheduledAt = `${selectedDate}T${selectedTime}:00`;
        const apiType = selectedType.replace('_eye', '');
        const reason = types.find(tp => tp.id === selectedType)?.name ?? '';
        const { data } = await api.post<{ appointment?: { id: number } }>('/appointments', {
          scheduledAt,
          type: apiType,
          reason,
          location: 'VanClinic mobile — Toamasina',
          durationMinutes: 30,
        });
        const num = data?.appointment?.id ? `#RDV-${data.appointment.id}` : `#RDV-${Date.now()}`;
        setConfirmationNumber(num);
        setStep('success');
      } catch (e: unknown) {
        const err = e as { response?: { data?: { error?: string } } };
        setError(err?.response?.data?.error || 'Erreur lors de la réservation.');
      } finally {
        setSubmitting(false);
      }
      return;
    }
    if ((step === 'type' && selectedType) || (step === 'date' && selectedDate) || (step === 'time' && selectedTime)) {
      setStep(flow[idx + 1] || 'success');
    }
  };

  const card: React.CSSProperties = { background: 'white', borderRadius: 14, border: '1px solid #d0e8e6', padding: 14 };
  const stepTitle: Record<Step, string> = {
    list: t('appointments.title'),
    type: t('appointments.appointmentType'),
    date: t('appointments.chooseDate'),
    time: t('appointments.chooseTime'),
    confirm: t('appointments.confirmation'),
    success: t('appointments.success'),
  };

  const upcomingAppts = appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status));
  const pastAppts = appointments.filter(a => ['completed', 'cancelled', 'no_show'].includes(a.status));

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

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
          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, flex: 1 }}>{stepTitle[step]}</h1>
          <LanguageToggle />
          <NotificationBell />
          <button onClick={() => { logout(); setLocation('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.15)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'white', fontFamily: 'inherit' }}>
            <LogOut size={14} color="white" /> {t('profile.logout')}
          </button>
        </div>
        {step !== 'list' && step !== 'success' && (
          <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
            {(['type', 'date', 'time', 'confirm'] as Step[]).map((s) => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: ['type', 'date', 'time', 'confirm'].indexOf(s) <= ['type', 'date', 'time', 'confirm'].indexOf(step) ? 'white' : 'rgba(255,255,255,0.3)', transition: 'background 0.3s' }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '20px 16px', maxWidth: 500, margin: '0 auto' }}>
        {/* LIST */}
        {step === 'list' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {([['upcoming', t('appointments.upcoming')], ['past', t('appointments.past')]] as ['upcoming' | 'past', string][]).map(([tab, label]) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, background: activeTab === tab ? TEAL : '#e8f5f3', color: activeTab === tab ? 'white' : TEAL }}>{label}</button>
              ))}
            </div>

            {loadingList ? (
              <p style={{ textAlign: 'center', color: '#6b8a87', padding: 24 }}>Chargement...</p>
            ) : (activeTab === 'upcoming' ? upcomingAppts : pastAppts).length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: 32 }}>
                <p style={{ color: '#6b8a87', fontSize: 14 }} data-testid="empty-appointments">
                  {activeTab === 'upcoming' ? t('appointments.noUpcoming') : t('appointments.noPast')}
                </p>
              </div>
            ) : (
              (activeTab === 'upcoming' ? upcomingAppts : pastAppts).map((rdv) => (
                <div key={rdv.id} style={{ ...card, borderLeft: `4px solid ${TEAL}`, marginBottom: 12 }} data-testid="appointment-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <p style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>{rdv.reason || rdv.type}</p>
                      {rdv.ophthalmologist && (
                        <p style={{ color: '#6b8a87', fontSize: 12, marginTop: 2 }}>Dr. {rdv.ophthalmologist.firstName} {rdv.ophthalmologist.lastName}</p>
                      )}
                    </div>
                    <span style={{ background: '#e8f5f3', color: '#0f6e65', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, height: 'fit-content' }}>{t('dashboard.confirmed')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6b8a87' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} color={TEAL} />
                      {new Date(rdv.scheduledAt).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    {rdv.location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} color={TEAL} />{rdv.location}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}

            <button onClick={handleNext} style={{ width: '100%', height: 52, background: ORANGE, color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
              + {t('appointments.newAppointment')}
            </button>
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
            {error && (
              <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                <AlertCircle size={14} color="#c53030" />
                <p style={{ fontSize: 13, color: '#c53030' }}>{error}</p>
              </div>
            )}
            <div style={{ ...card, background: '#e8f5f3', border: '1px solid #b0d8d4', marginBottom: 20 }}>
              <p style={{ fontWeight: 700, color: NAVY, fontSize: 15, marginBottom: 12 }}>{t('appointments.summary')}</p>
              {[
                { label: t('appointments.type'), value: types.find(tp => tp.id === selectedType)?.name },
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
              <button onClick={handleNext} disabled={submitting} style={{ flex: 1, height: 52, background: submitting ? '#9ab0ae' : TEAL, border: 'none', borderRadius: 14, color: 'white', fontWeight: 700, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                {submitting ? 'Envoi...' : t('appointments.confirm')}
              </button>
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
              <p style={{ fontSize: 13, color: '#6b8a87' }} data-testid="confirmation-number">
                <b style={{ color: NAVY }}>Confirmation: </b>{confirmationNumber}
              </p>
            </div>
            <button onClick={() => setLocation('/dashboard')} style={{ width: '100%', height: 52, background: TEAL, color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>{t('appointments.backToDashboard')}</button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
