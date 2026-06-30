import { useState, useEffect, useCallback, useRef } from 'react';
import { StatusBadge, Card, PageHeader, StatCard, Btn, Avatar, Table, Tr, Td, Tag, BarChart, Grid, Modal, FormGroup, Input, Select } from '@/components/AdminUI';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';
import { Plus, Download, RefreshCw, Image, Trash2, Upload } from 'lucide-react';

const NAVY = '#1e3a5f'; const TEAL = '#1a9b8e'; const ORANGE = '#f0821d';

// ─── HOOK UTILITAIRE ──────────────────────────────────────────
function useApi<T>(url: string, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    api.get<T>(url)
      .then(r => { setData(r.data); setLoading(false); })
      .catch(e => { setError(e.response?.data?.error || 'Erreur de chargement'); setLoading(false); });
  }, [url, ...deps]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, reload: fetch };
}

function Loader() {
  const { t } = useLanguage();
  return <div style={{ textAlign: 'center', padding: 40, color: '#6b8a87' }}><RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} /> {t('common.loading')}</div>;
}
function ErrorMsg({ msg }: { msg: string }) {
  return <div style={{ textAlign: 'center', padding: 40, color: '#e53e3e' }}>{msg}</div>;
}
function fmgDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmgDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR') + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
function fmgAmount(mga: number) {
  return new Intl.NumberFormat('fr-MG').format(mga) + ' Ar';
}

// ─── TYPES ─────────────────────────────────────────────────────
type ApiPatient = { id: number; patientNumber: string; fullName: string; email: string; phone: string; city: string; district: string; gender: string; birthDate: string; isActive: boolean; appointmentCount: number; createdAt: string };
type ApiAppointment = { id: number; patient: { id: number; patientNumber: string; fullName: string }; ophthalmologist: { id: number; fullName: string } | null; scheduledAt: string; createdAt: string; type: string; typeLabel: string; status: string; statusLabel: string; reason: string; location: string };
type ApiUser = { id: number; fullName: string; email: string; phone: string; roles: string[]; isActive: boolean; lastLoginAt: string | null; createdAt: string };
type ApiProduct = { id: number; sku: string; name: string; category: string; categoryLabel: string; priceMga: number; stockQuantity: number; inStock: boolean; images: string[] };
type ApiOrder = { id: number; orderNumber: string; patientName: string; status: string; statusLabel: string; totalMga: number; items: { productName: string; quantity: number }[]; createdAt: string };
type ApiDashboard = { users: { patients: number; agents: number; ophtalmologues: number }; appointments: { scheduled: number; confirmed: number; completed: number; cancelled: number }; revenue: { last_30_days_mga: number; all_time_mga: number }; inventory: { low_stock_count: number } };
type ApiTele = { id: number; patient: { fullName: string }; requestedBy: { fullName: string }; question: string; urgency: string; status: string; createdAt: string };
type ApiSession = { id: number; locationName: string; district: string; commune: string | null; startDate: string; endDate: string; status: string; maxAppointments: number; appointmentCount: number; availableSlots: number; leadOphthalmologist: { id: number; fullName: string } | null; notes: string | null; createdAt: string };

// ─── DASHBOARD ────────────────────────────────────────────────
export function DashboardPage() {
  const { t } = useLanguage();
  const { data: stats, loading: sl } = useApi<ApiDashboard>('/admin/dashboard');
  const { data: appts, loading: al } = useApi<ApiAppointment[]>('/admin/appointments');
  const { data: orders, loading: ol } = useApi<ApiOrder[]>('/admin/orders');
  const { data: products, loading: pl } = useApi<ApiProduct[]>('/products');

  const lowStock = products?.filter(p => p.stockQuantity < 10) ?? [];
  const totalAppts = stats ? Object.values(stats.appointments).reduce((a, b) => a + b, 0) : 0;

  return (
    <div>
      <PageHeader title={t('admin.nav.dashboard')} subtitle={t('admin.pages.dashboard.subtitle')} />
      {sl ? <Loader /> : stats ? (
        <Grid cols={4} style={{ marginBottom: 24 }}>
          <StatCard value={String(stats.users.patients)} label={t('admin.pages.dashboard.patientsFollowed')} accent={TEAL} />
          <StatCard value={String(totalAppts)} label={t('admin.pages.dashboard.totalAppointments')} accent={NAVY} />
          <StatCard value={fmgAmount(stats.revenue.last_30_days_mga)} label={t('admin.pages.dashboard.revenue30d')} accent="#5cb85c" />
          <StatCard value={String(stats.inventory.low_stock_count)} label={t('admin.pages.dashboard.stockAlerts')} accent={ORANGE} />
        </Grid>
      ) : <ErrorMsg msg={t('admin.pages.dashboard.accessReserved')} />}
      <Grid cols={2} style={{ marginBottom: 24 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 700, color: NAVY }}>{t('admin.pages.dashboard.recentAppointments')}</span>
          </div>
          {al ? <Loader /> : (appts ?? []).slice(0, 4).map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f7f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={a.patient.fullName ?? '?'} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{a.patient.fullName}</p>
                  <p style={{ fontSize: 11, color: '#6b8a87' }}>{a.typeLabel} — {fmgDateTime(a.scheduledAt)}</p>
                </div>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>{t('admin.pages.dashboard.lowStock')}</div>
          {pl ? <Loader /> : lowStock.length === 0 ? (
            <p style={{ color: '#6b8a87', fontSize: 13 }}>{t('admin.pages.dashboard.noLowStock')}</p>
          ) : lowStock.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f0f7f6' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.stockQuantity === 0 ? '#e53e3e' : ORANGE, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{p.name}</p>
                <p style={{ fontSize: 11, color: '#6b8a87' }}>Stock: {p.stockQuantity}</p>
              </div>
              <StatusBadge status={p.stockQuantity === 0 ? 'critical' : 'low'} />
            </div>
          ))}
        </Card>
      </Grid>
      <Card>
        <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>{t('admin.pages.dashboard.recentOrders')}</div>
        {ol ? <Loader /> : (
          <Table headers={[t('admin.pages.orders.colOrder'), t('admin.pages.orders.colClient'), t('admin.pages.orders.colItems'), t('admin.pages.orders.colAmount'), t('admin.pages.orders.colStatus'), t('admin.pages.orders.colDate')]}>
            {(orders ?? []).slice(0, 5).map(o => (
              <Tr key={o.id}>
                <Td mono><span style={{ color: TEAL, fontWeight: 700 }}>{o.orderNumber}</span></Td>
                <Td>{o.patientName}</Td>
                <Td><span style={{ color: '#6b8a87', fontSize: 12 }}>{o.items.map(i => `${i.productName} ×${i.quantity}`).join(', ')}</span></Td>
                <Td><strong>{fmgAmount(o.totalMga)}</strong></Td>
                <Td><StatusBadge status={o.status} /></Td>
                <Td><span style={{ color: '#6b8a87' }}>{fmgDate(o.createdAt)}</span></Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

// ─── PATIENTS ─────────────────────────────────────────────────
export function PatientsPage() {
  const { t } = useLanguage();
  const { data: patients, loading, error, reload } = useApi<ApiPatient[]>('/admin/patients');
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', password: 'Patient2025!', district: 'Toamasina I', birthDate: '' });
  const [saving, setSaving] = useState(false);

  const filtered = (patients ?? []).filter(p => !filter || p.district === filter);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await api.post('/auth/register', { ...form, preferredLanguage: 'fr' });
      setShowModal(false);
      reload();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title={t('admin.pages.patients.title')} subtitle={`${patients?.length ?? '...'} ${t('admin.pages.patients.subtitle')}`}>
        <Select style={{ width: 160 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">{t('admin.pages.patients.allDistricts')}</option>
          {['Toamasina I', 'Toamasina II', 'Brickaville', 'Mahanoro', 'Vatomandry'].map(d => <option key={d}>{d}</option>)}
        </Select>
        <Btn variant="primary" onClick={() => setShowModal(true)}><Plus size={14} /> {t('admin.pages.patients.newPatient')}</Btn>
      </PageHeader>
      <Card>
        {loading ? <Loader /> : error ? <ErrorMsg msg={error} /> : (
          <Table headers={[t('admin.pages.patients.colPatient'), t('admin.pages.patients.colDistrict'), t('admin.pages.patients.colPhone'), t('admin.pages.patients.colAppointments'), t('admin.pages.patients.colStatus'), t('admin.pages.patients.colRegistered')]}>
            {filtered.map(p => (
              <Tr key={p.id}>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={p.fullName} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{p.fullName}</p>
                      <p style={{ fontSize: 11, color: '#6b8a87' }}>{p.patientNumber}</p>
                    </div>
                  </div>
                </Td>
                <Td>{p.district ?? '—'}</Td>
                <Td><span style={{ color: '#6b8a87' }}>{p.phone}</span></Td>
                <Td><Tag>{p.appointmentCount}</Tag></Td>
                <Td><StatusBadge status={p.isActive ? 'actif' : 'inactif'} /></Td>
                <Td><span style={{ color: '#6b8a87' }}>{fmgDate(p.createdAt)}</span></Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
      {showModal && (
        <Modal title={t('admin.pages.patients.modal.title')} onClose={() => setShowModal(false)} onConfirm={handleCreate} confirmLabel={saving ? t('admin.pages.patients.modal.saving') : t('admin.pages.patients.modal.save')}>
          <Grid cols={2} style={{ gap: 12 }}>
            <FormGroup label={t('admin.pages.patients.modal.firstName')}><Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Jean" /></FormGroup>
            <FormGroup label={t('admin.pages.patients.modal.lastName')}><Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Dupont" /></FormGroup>
          </Grid>
          <FormGroup label={t('admin.pages.patients.modal.email')}><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="patient@example.mg" /></FormGroup>
          <FormGroup label={t('admin.pages.patients.modal.phone')}><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+261 32 XX XX XX" /></FormGroup>
          <FormGroup label={t('admin.pages.patients.modal.birthDate')}><Input type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} /></FormGroup>
          <FormGroup label={t('admin.pages.patients.modal.district')}>
            <Select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))}>
              {['Toamasina I', 'Toamasina II', 'Brickaville', 'Mahanoro', 'Vatomandry'].map(d => <option key={d}>{d}</option>)}
            </Select>
          </FormGroup>
        </Modal>
      )}
    </div>
  );
}

// ─── APPOINTMENTS ─────────────────────────────────────────────
export function AppointmentsPage() {
  const { t } = useLanguage();
  const { data: appointments, loading, error, reload } = useApi<ApiAppointment[]>('/admin/appointments');
  const { data: patients } = useApi<ApiPatient[]>('/admin/patients');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patientId: '', scheduledAt: '', type: 'on_site', reason: '', location: 'Toamasina I' });
  const [saving, setSaving] = useState(false);

  const counts = {
    scheduled: (appointments ?? []).filter(a => a.status === 'scheduled').length,
    confirmed: (appointments ?? []).filter(a => a.status === 'confirmed').length,
    completed: (appointments ?? []).filter(a => a.status === 'completed').length,
    cancelled: (appointments ?? []).filter(a => a.status === 'cancelled').length,
  };

  const handleCancel = async (id: number) => {
    if (!confirm(t('admin.pages.appointments.confirmCancel'))) return;
    await api.post(`/appointments/${id}/cancel`, { reason: t('admin.pages.appointments.cancelReason') });
    reload();
  };

  const handleConfirm = async (id: number) => {
    await api.post(`/appointments/${id}/confirm`);
    reload();
  };

  return (
    <div>
      <PageHeader title={t('admin.nav.appointments')} subtitle={`${appointments?.length ?? '...'} ${t('admin.pages.appointments.subtitle')}`}>
        <Btn variant="primary" onClick={() => setShowModal(true)}><Plus size={14} /> {t('admin.pages.appointments.newRdv')}</Btn>
      </PageHeader>
      <Grid cols={4} style={{ marginBottom: 20 }}>
        {[{ v: counts.scheduled, l: t('admin.pages.appointments.scheduled'), c: TEAL }, { v: counts.confirmed, l: t('admin.pages.appointments.confirmed'), c: '#5cb85c' }, { v: counts.completed, l: t('admin.pages.appointments.completed'), c: NAVY }, { v: counts.cancelled, l: t('admin.pages.appointments.cancelled'), c: '#e53e3e' }].map(s => (
          <Card key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: s.c + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: s.c }}>{s.v}</div>
            <div><p style={{ fontWeight: 700, color: NAVY }}>{s.v}</p><p style={{ fontSize: 12, color: '#6b8a87' }}>{s.l}</p></div>
          </Card>
        ))}
      </Grid>
      <Card>
        {loading ? <Loader /> : error ? <ErrorMsg msg={error} /> : (
          <Table headers={[t('admin.pages.appointments.colPatient'), t('admin.pages.appointments.colType'), t('admin.pages.appointments.colDateTime'), t('admin.pages.appointments.colDoctor'), t('admin.pages.appointments.colLocation'), t('admin.pages.appointments.colStatus'), t('admin.pages.appointments.colActions')]}>
            {(appointments ?? []).map(a => (
              <Tr key={a.id}>
                <Td><strong>{a.patient.fullName}</strong></Td>
                <Td><Tag>{a.typeLabel}</Tag></Td>
                <Td>{fmgDateTime(a.scheduledAt)}</Td>
                <Td><span style={{ color: '#6b8a87', fontSize: 12 }}>{a.ophthalmologist?.fullName ?? '—'}</span></Td>
                <Td>{a.location ?? '—'}</Td>
                <Td><StatusBadge status={a.status} /></Td>
                <Td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {a.status === 'scheduled' && <Btn variant="secondary" size="sm" onClick={() => handleConfirm(a.id)}>{t('admin.pages.appointments.confirm')}</Btn>}
                    {(a.status === 'scheduled' || a.status === 'confirmed') && <Btn variant="danger" size="sm" onClick={() => handleCancel(a.id)}>{t('admin.pages.appointments.cancel')}</Btn>}
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
      {showModal && (
        <Modal title={t('admin.pages.appointments.modal.title')} onClose={() => setShowModal(false)} onConfirm={async () => {
          setSaving(true);
          try {
            await api.post('/admin/appointments', { ...form, patientId: Number(form.patientId) });
            setShowModal(false);
            setForm({ patientId: '', scheduledAt: '', type: 'on_site', reason: '', location: 'Toamasina I' });
            reload();
          } catch (e: any) {
            alert(e.response?.data?.error || 'Erreur');
          } finally { setSaving(false); }
        }} confirmLabel={saving ? t('admin.pages.appointments.modal.saving') : t('admin.pages.appointments.modal.confirm')}>
          <FormGroup label={t('admin.pages.appointments.modal.patient')}>
            <Select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}>
              <option value="">{t('admin.pages.appointments.modal.selectPatient')}</option>
              {(patients ?? []).map(p => (
                <option key={p.id} value={p.id}>{p.fullName} ({p.patientNumber})</option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup label={t('admin.pages.appointments.modal.type')}>
            <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="on_site">{t('admin.pages.appointments.modal.typeOnSite')}</option>
              <option value="teleexpertise">{t('admin.pages.appointments.modal.typeTeleexpertise')}</option>
              <option value="follow_up">{t('admin.pages.appointments.modal.typeFollowUp')}</option>
              <option value="screening">{t('admin.pages.appointments.modal.typeScreening')}</option>
            </Select>
          </FormGroup>
          <FormGroup label={t('admin.pages.appointments.modal.datetime')}><Input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} /></FormGroup>
          <FormGroup label={t('admin.pages.appointments.modal.location')}><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Toamasina I" /></FormGroup>
          <FormGroup label={t('admin.pages.appointments.modal.reason')}><Input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} /></FormGroup>
        </Modal>
      )}
    </div>
  );
}

// ─── MEDICAL ──────────────────────────────────────────────────
export function MedicalPage() {
  const { t } = useLanguage();
  const { data: patients, loading, error } = useApi<ApiPatient[]>('/admin/patients');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: records, loading: rl, reload: reloadRecords } = useApi<any[]>(selectedId ? `/medical/records/patient/${selectedId}` : '', [selectedId]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    consultationDate: new Date().toISOString().slice(0, 10),
    chiefComplaint: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    observations: '',
  });

  const filtered = (patients ?? []).filter(p => !search || p.fullName.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await api.post(`/medical/records/patient/${selectedId}`, form);
      setShowCreateModal(false);
      setForm({ consultationDate: new Date().toISOString().slice(0, 10), chiefComplaint: '', diagnosis: '', treatment: '', prescription: '', observations: '' });
      reloadRecords();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erreur');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title={t('admin.pages.medical.title')}>
        <Input placeholder={t('admin.pages.medical.search')} style={{ width: 250 }} value={search} onChange={e => setSearch(e.target.value)} />
      </PageHeader>
      <Grid cols={2} style={{ gap: 20 }}>
        <Card>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>{t('admin.pages.medical.patients')}</div>
          {loading ? <Loader /> : error ? <ErrorMsg msg={error} /> : filtered.map(p => (
            <div key={p.id} onClick={() => setSelectedId(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f0f7f6', cursor: 'pointer', background: selectedId === p.id ? '#f0fffe' : 'transparent', borderRadius: 8, paddingLeft: 8 }}>
              <Avatar name={p.fullName} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 13 }}>{p.fullName}</p>
                <p style={{ fontSize: 11, color: '#6b8a87' }}>{p.patientNumber} · {p.district ?? '—'}</p>
              </div>
              <span style={{ fontSize: 11, color: '#6b8a87' }}>{p.appointmentCount} {t('admin.pages.medical.rdv')}</span>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 700, color: NAVY }}>
              {selectedId ? `${t('admin.pages.medical.recordsFor')} ${patients?.find(p => p.id === selectedId)?.fullName}` : t('admin.pages.medical.selectPatient')}
            </span>
            {selectedId && (
              <Btn variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
                <Plus size={13} /> {t('admin.pages.medical.createRecord')}
              </Btn>
            )}
          </div>
          {!selectedId ? (
            <p style={{ color: '#6b8a87', fontSize: 13, textAlign: 'center', padding: 40 }}>{t('admin.pages.medical.clickPatient')}</p>
          ) : rl ? <Loader /> : (records ?? []).length === 0 ? (
            <p style={{ color: '#6b8a87', fontSize: 13 }}>{t('admin.pages.medical.noRecords')}</p>
          ) : (records ?? []).map((r: any) => (
            <div key={r.id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f7f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{r.chiefComplaint ?? t('admin.pages.medical.consultation')}</span>
                <span style={{ fontSize: 11, color: '#6b8a87' }}>{r.consultationDate ? fmgDate(r.consultationDate) : r.createdAt ? fmgDate(r.createdAt) : ''}</span>
              </div>
              <p style={{ fontSize: 11, color: '#6b8a87' }}>{r.createdBy ?? '—'}</p>
              {r.diagnosis && <p style={{ fontSize: 12, marginTop: 4, color: NAVY }}>{r.diagnosis}</p>}
              {r.prescription && (
                <p style={{ fontSize: 12, marginTop: 4, background: '#f4f9f8', borderRadius: 6, padding: '4px 8px', color: '#1a9b8e', fontStyle: 'italic' }}>
                  Ordonnance: {r.prescription}
                </p>
              )}
            </div>
          ))}
        </Card>
      </Grid>

      {showCreateModal && (
        <Modal
          title={`${t('admin.pages.medical.createRecord')} — ${patients?.find(p => p.id === selectedId)?.fullName}`}
          onClose={() => setShowCreateModal(false)}
          onConfirm={handleCreate}
          confirmLabel={saving ? t('common.saving') : t('admin.pages.medical.save')}
        >
          <FormGroup label={t('admin.pages.medical.consultationDate')}>
            <Input type="date" value={form.consultationDate} onChange={e => setForm(f => ({ ...f, consultationDate: e.target.value }))} />
          </FormGroup>
          <FormGroup label={t('admin.pages.medical.chiefComplaint')}>
            <Input value={form.chiefComplaint} onChange={e => setForm(f => ({ ...f, chiefComplaint: e.target.value }))} placeholder={t('admin.pages.medical.chiefComplaintPlaceholder')} />
          </FormGroup>
          <FormGroup label={t('admin.pages.medical.diagnosis')}>
            <Input value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder={t('admin.pages.medical.diagnosisPlaceholder')} />
          </FormGroup>
          <FormGroup label={t('admin.pages.medical.treatment')}>
            <Input value={form.treatment} onChange={e => setForm(f => ({ ...f, treatment: e.target.value }))} placeholder={t('admin.pages.medical.treatmentPlaceholder')} />
          </FormGroup>
          <FormGroup label={t('admin.pages.medical.prescription')}>
            <textarea
              value={form.prescription}
              onChange={e => setForm(f => ({ ...f, prescription: e.target.value }))}
              rows={4}
              placeholder={t('admin.pages.medical.prescriptionPlaceholder')}
              style={{ width: '100%', padding: 10, border: '2px solid #d0e8e6', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }}
            />
          </FormGroup>
          <FormGroup label={t('admin.pages.medical.observations')}>
            <textarea
              value={form.observations}
              onChange={e => setForm(f => ({ ...f, observations: e.target.value }))}
              rows={3}
              placeholder={t('admin.pages.medical.observationsPlaceholder')}
              style={{ width: '100%', padding: 10, border: '2px solid #d0e8e6', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }}
            />
          </FormGroup>
        </Modal>
      )}
    </div>
  );
}

// ─── TELEMEDICINE ─────────────────────────────────────────────
export function TelemedicinePage() {
  const { t } = useLanguage();
  const { data: sessions, loading, error, reload } = useApi<ApiTele[]>('/teleexpertise/pending');
  const { data: allAppointments, loading: al } = useApi<ApiAppointment[]>('/admin/appointments');
  const [respondId, setRespondId] = useState<number | null>(null);
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);

  const teleAppts = (allAppointments ?? []).filter(a => a.type === 'teleexpertise' && (a.status === 'scheduled' || a.status === 'confirmed'));

  const handleRespond = async () => {
    if (!respondId) return;
    setSaving(true);
    try {
      await api.post(`/teleexpertise/${respondId}/respond`, { response });
      setRespondId(null);
      setResponse('');
      reload();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erreur');
    } finally { setSaving(false); }
  };

  const urgencyColor = (u: string) => ({ urgent: '#e53e3e', high: ORANGE, normal: '#6b8a87', low: '#9ab0ae' }[u] ?? '#6b8a87');

  return (
    <div>
      <PageHeader title={t('admin.nav.telemedicine')} />
      <Grid cols={3} style={{ marginBottom: 24 }}>
        <StatCard value={String(teleAppts.length)} label={t('admin.pages.telemedicine.pendingAppts')} accent={TEAL} />
        <StatCard value={String((sessions ?? []).length)} label={t('admin.pages.telemedicine.pending')} accent={ORANGE} />
        <StatCard value={String((sessions ?? []).filter(s => s.urgency === 'urgent').length)} label={t('admin.pages.telemedicine.urgencies')} accent="#e53e3e" />
      </Grid>

      {/* RDV de type télémédecine */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>{t('admin.pages.telemedicine.rdvTitle')}</div>
        {al ? <Loader /> : teleAppts.length === 0 ? (
          <p style={{ color: '#6b8a87', fontSize: 13, textAlign: 'center', padding: 20 }}>{t('admin.pages.telemedicine.noRdv')}</p>
        ) : (
          <Table headers={[t('admin.pages.telemedicine.colPatient'), t('admin.pages.appointments.colType'), t('admin.pages.appointments.colDateTime'), t('admin.pages.appointments.colDoctor'), t('admin.pages.appointments.colStatus')]}>
            {teleAppts.map(a => (
              <Tr key={a.id}>
                <Td><strong>{a.patient.fullName}</strong></Td>
                <Td><Tag>{a.typeLabel}</Tag></Td>
                <Td>{fmgDateTime(a.scheduledAt)}</Td>
                <Td><span style={{ color: '#6b8a87', fontSize: 12 }}>{a.ophthalmologist?.fullName ?? '—'}</span></Td>
                <Td><StatusBadge status={a.status} /></Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Demandes de téléexpertise entre médecins */}
      <Card>
        <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>{t('admin.pages.telemedicine.requests')}</div>
        {loading ? <Loader /> : error ? <ErrorMsg msg={error} /> : (sessions ?? []).length === 0 ? (
          <p style={{ color: '#6b8a87', fontSize: 13, textAlign: 'center', padding: 20 }}>{t('admin.pages.telemedicine.noPending')}</p>
        ) : (
          <Table headers={[t('admin.pages.telemedicine.colPatient'), t('admin.pages.telemedicine.colRequestedBy'), t('admin.pages.telemedicine.colQuestion'), t('admin.pages.telemedicine.colDate'), t('admin.pages.telemedicine.colUrgency'), t('admin.pages.telemedicine.colActions')]}>
            {(sessions ?? []).map(s => (
              <Tr key={s.id}>
                <Td><strong>{s.patient?.fullName}</strong></Td>
                <Td><span style={{ color: '#6b8a87' }}>{s.requestedBy?.fullName}</span></Td>
                <Td><span style={{ fontSize: 12 }}>{s.question?.substring(0, 60)}{(s.question?.length ?? 0) > 60 ? '…' : ''}</span></Td>
                <Td><span style={{ color: '#6b8a87', fontSize: 12 }}>{fmgDate(s.createdAt)}</span></Td>
                <Td><span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: urgencyColor(s.urgency) + '22', color: urgencyColor(s.urgency) }}>{s.urgency}</span></Td>
                <Td><Btn variant="primary" size="sm" onClick={() => setRespondId(s.id)}>{t('admin.pages.telemedicine.respond')}</Btn></Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
      {respondId && (
        <Modal title={t('admin.pages.telemedicine.modal.title')} onClose={() => setRespondId(null)} onConfirm={handleRespond} confirmLabel={saving ? t('admin.pages.telemedicine.modal.sending') : t('admin.pages.telemedicine.modal.send')}>
          <FormGroup label={t('admin.pages.telemedicine.modal.answer')}>
            <textarea value={response} onChange={e => setResponse(e.target.value)} rows={5} style={{ width: '100%', padding: 12, border: '2px solid #d0e8e6', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} placeholder={t('admin.pages.telemedicine.modal.placeholder')} />
          </FormGroup>
        </Modal>
      )}
    </div>
  );
}

// ─── PLANNING ─────────────────────────────────────────────────
export function PlanningPage() {
  const { t } = useLanguage();
  const { data: sessions, loading, error, reload } = useApi<ApiSession[]>('/admin/sessions');
  const { data: ophtalmos } = useApi<ApiUser[]>('/admin/users');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ locationName: '', district: 'Toamasina I', commune: '', startDate: '', endDate: '', maxAppointments: '50', notes: '', leadOphthalmologistId: '' });
  const [saving, setSaving] = useState(false);

  const ophtalmoList = (ophtalmos ?? []).filter(u => u.roles.includes('ROLE_OPHTALMOLOGUE'));

  const upcoming = (sessions ?? []).filter(s => s.status === 'planned' || s.status === 'active');
  const past = (sessions ?? []).filter(s => s.status === 'completed' || s.status === 'cancelled');

  const handleCreate = async () => {
    setSaving(true);
    try {
      await api.post('/admin/sessions', { ...form, maxAppointments: Number(form.maxAppointments), leadOphthalmologistId: form.leadOphthalmologistId ? Number(form.leadOphthalmologistId) : null });
      setShowModal(false);
      setForm({ locationName: '', district: 'Toamasina I', commune: '', startDate: '', endDate: '', maxAppointments: '50', notes: '', leadOphthalmologistId: '' });
      reload();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erreur');
    } finally { setSaving(false); }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await api.patch(`/admin/sessions/${id}/status`, { status });
      reload();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erreur');
    }
  };

  return (
    <div>
      <PageHeader title={t('admin.nav.planning')} subtitle={`${sessions?.length ?? '...'} ${t('admin.pages.planning.subtitle')}`}>
        <Btn variant="primary" onClick={() => setShowModal(true)}><Plus size={14} /> {t('admin.pages.planning.newMission')}</Btn>
      </PageHeader>

      <Grid cols={3} style={{ marginBottom: 20 }}>
        <StatCard value={String(upcoming.length)} label={t('admin.pages.planning.activeMissions')} accent={TEAL} />
        <StatCard value={String(past.filter(s => s.status === 'completed').length)} label={t('admin.pages.planning.completedMissions')} accent={NAVY} />
        <StatCard value={String(upcoming.reduce((s, m) => s + m.availableSlots, 0))} label={t('admin.pages.planning.availableSlots')} accent="#5cb85c" />
      </Grid>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: NAVY, marginBottom: 14 }}>{t('admin.pages.planning.upcoming')}</div>
        {loading ? <Loader /> : error ? <ErrorMsg msg={error} /> : upcoming.length === 0 ? (
          <p style={{ color: '#6b8a87', fontSize: 13, textAlign: 'center', padding: 24 }}>{t('admin.pages.planning.noMissions')}</p>
        ) : (
          <Table headers={[t('admin.pages.planning.colLocation'), t('admin.pages.planning.colDistrict'), t('admin.pages.planning.colDates'), t('admin.pages.planning.colDoctor'), t('admin.pages.planning.colSlots'), t('admin.pages.planning.colStatus'), t('admin.pages.planning.colActions')]}>
            {upcoming.map(s => {
              const nextStatus: Record<string, { status: string; label: string }> = {
                planned: { status: 'active', label: t('admin.pages.planning.start') },
                active: { status: 'completed', label: t('admin.pages.planning.finish') },
              };
              const next = nextStatus[s.status];
              return (
                <Tr key={s.id}>
                  <Td><strong>{s.locationName}</strong>{s.commune && <span style={{ display: 'block', fontSize: 11, color: '#6b8a87' }}>{s.commune}</span>}</Td>
                  <Td><Tag>{s.district}</Tag></Td>
                  <Td><span style={{ fontSize: 12 }}>{fmgDate(s.startDate)}<br /><span style={{ color: '#6b8a87' }}>→ {fmgDate(s.endDate)}</span></span></Td>
                  <Td><span style={{ color: '#6b8a87', fontSize: 12 }}>{s.leadOphthalmologist?.fullName ?? '—'}</span></Td>
                  <Td><span style={{ fontWeight: 700, color: s.availableSlots === 0 ? '#e53e3e' : TEAL }}>{s.availableSlots} / {s.maxAppointments}</span></Td>
                  <Td><StatusBadge status={s.status} /></Td>
                  <Td>
                    {next && <Btn variant="secondary" size="sm" onClick={() => handleStatusUpdate(s.id, next.status)}>{next.label}</Btn>}
                    {s.status !== 'cancelled' && <Btn variant="danger" size="sm" onClick={() => handleStatusUpdate(s.id, 'cancelled')}>{t('admin.pages.planning.cancel')}</Btn>}
                  </Td>
                </Tr>
              );
            })}
          </Table>
        )}
      </Card>

      {past.length > 0 && (
        <Card>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 14 }}>{t('admin.pages.planning.history')}</div>
          <Table headers={[t('admin.pages.planning.colLocation'), t('admin.pages.planning.colDistrict'), t('admin.pages.planning.colDates'), t('admin.pages.planning.colAppointments'), t('admin.pages.planning.colStatus')]}>
            {past.map(s => (
              <Tr key={s.id}>
                <Td><strong>{s.locationName}</strong></Td>
                <Td><Tag>{s.district}</Tag></Td>
                <Td><span style={{ fontSize: 12, color: '#6b8a87' }}>{fmgDate(s.startDate)} → {fmgDate(s.endDate)}</span></Td>
                <Td><span style={{ fontWeight: 700 }}>{s.appointmentCount} / {s.maxAppointments}</span></Td>
                <Td><StatusBadge status={s.status} /></Td>
              </Tr>
            ))}
          </Table>
        </Card>
      )}

      {showModal && (
        <Modal title={t('admin.pages.planning.modal.title')} onClose={() => setShowModal(false)} onConfirm={handleCreate} confirmLabel={saving ? t('admin.pages.planning.modal.saving') : t('admin.pages.planning.modal.confirm')}>
          <FormGroup label={t('admin.pages.planning.modal.locationName')}><Input value={form.locationName} onChange={e => setForm(f => ({ ...f, locationName: e.target.value }))} placeholder={t('admin.pages.planning.modal.locationPlaceholder')} /></FormGroup>
          <Grid cols={2} style={{ gap: 12 }}>
            <FormGroup label={t('admin.pages.planning.modal.district')}>
              <Select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))}>
                {['Toamasina I', 'Toamasina II', 'Brickaville', 'Mahanoro', 'Vatomandry'].map(d => <option key={d}>{d}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label={t('admin.pages.planning.modal.commune')}><Input value={form.commune} onChange={e => setForm(f => ({ ...f, commune: e.target.value }))} placeholder={t('admin.pages.planning.modal.communePlaceholder')} /></FormGroup>
          </Grid>
          <Grid cols={2} style={{ gap: 12 }}>
            <FormGroup label={t('admin.pages.planning.modal.startDate')}><Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></FormGroup>
            <FormGroup label={t('admin.pages.planning.modal.endDate')}><Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></FormGroup>
          </Grid>
          <Grid cols={2} style={{ gap: 12 }}>
            <FormGroup label={t('admin.pages.planning.modal.maxAppointments')}><Input type="number" value={form.maxAppointments} onChange={e => setForm(f => ({ ...f, maxAppointments: e.target.value }))} min="1" /></FormGroup>
            <FormGroup label={t('admin.pages.planning.modal.ophthalmologist')}>
              <Select value={form.leadOphthalmologistId} onChange={e => setForm(f => ({ ...f, leadOphthalmologistId: e.target.value }))}>
                <option value="">{t('admin.pages.planning.modal.none')}</option>
                {ophtalmoList.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
              </Select>
            </FormGroup>
          </Grid>
          <FormGroup label={t('admin.pages.planning.modal.notes')}><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder={t('admin.pages.planning.modal.notesPlaceholder')} /></FormGroup>
        </Modal>
      )}
    </div>
  );
}

// ─── SHOP ─────────────────────────────────────────────────────
export function ShopPage() {
  const { t } = useLanguage();
  const PRODUCT_CATEGORIES = [
    { value: 'eyeglasses', label: t('admin.pages.shop.categories.eyeglasses') },
    { value: 'sunglasses', label: t('admin.pages.shop.categories.sunglasses') },
    { value: 'lenses', label: t('admin.pages.shop.categories.lenses') },
    { value: 'contact_lenses', label: t('admin.pages.shop.categories.contactLenses') },
    { value: 'accessories', label: t('admin.pages.shop.categories.accessories') },
  ];
  const { data: products, loading, error, reload } = useApi<ApiProduct[]>('/products');
  const [showModal, setShowModal] = useState(false);
  const [imagesProduct, setImagesProduct] = useState<ApiProduct | null>(null);
  const [form, setForm] = useState({ sku: '', name: '', description: '', category: 'eyeglasses', brand: '', priceMga: '', stockQuantity: '0' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await api.post('/admin/products', { ...form, priceMga: Number(form.priceMga), stockQuantity: Number(form.stockQuantity) });
      setShowModal(false);
      setForm({ sku: '', name: '', description: '', category: 'eyeglasses', brand: '', priceMga: '', stockQuantity: '0' });
      reload();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erreur');
    } finally { setSaving(false); }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !imagesProduct) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post<ApiProduct>(`/products/${imagesProduct.id}/images`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImagesProduct(data);
      reload();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erreur upload');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDeleteImage = async (idx: number) => {
    if (!imagesProduct) return;
    setDeletingIdx(idx);
    try {
      const { data } = await api.delete<ApiProduct>(`/products/${imagesProduct.id}/images/${idx}`);
      setImagesProduct(data);
      reload();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erreur suppression');
    } finally { setDeletingIdx(null); }
  };

  return (
    <div>
      <PageHeader title={t('admin.pages.shop.title')}>
        <Btn variant="primary" onClick={() => setShowModal(true)}><Plus size={14} /> {t('admin.pages.shop.addProduct')}</Btn>
      </PageHeader>
      <Grid cols={3} style={{ marginBottom: 24 }}>
        <StatCard value={String(products?.length ?? '...')} label={t('admin.pages.shop.activeProducts')} accent={TEAL} />
        <StatCard value={String(products?.filter(p => p.inStock).length ?? '...')} label={t('admin.pages.shop.inStock')} accent="#5cb85c" />
        <StatCard value={String(products?.filter(p => !p.inStock).length ?? '...')} label={t('admin.pages.shop.outOfStock')} accent="#e53e3e" />
      </Grid>
      <Card>
        {loading ? <Loader /> : error ? <ErrorMsg msg={error} /> : (
          <Table headers={[t('admin.pages.shop.colPhoto'), t('admin.pages.shop.colProduct'), t('admin.pages.shop.colRef'), t('admin.pages.shop.colCategory'), t('admin.pages.shop.colPrice'), t('admin.pages.shop.colStock'), t('admin.pages.shop.colStatus'), t('admin.pages.shop.colImages')]}>
            {(products ?? []).map(p => (
              <Tr key={p.id}>
                <Td>
                  {p.images?.length > 0 ? (
                    <img src={p.images[0]} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid #d0e8e6' }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f0f7f6', border: '1px dashed #d0e8e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Image size={18} color="#9ab0ae" />
                    </div>
                  )}
                </Td>
                <Td><strong>{p.name}</strong></Td>
                <Td mono><span style={{ color: TEAL, fontSize: 11 }}>{p.sku}</span></Td>
                <Td><Tag>{p.categoryLabel}</Tag></Td>
                <Td><span style={{ fontWeight: 700, color: TEAL }}>{fmgAmount(p.priceMga)}</span></Td>
                <Td><strong style={{ color: p.stockQuantity === 0 ? '#e53e3e' : p.stockQuantity < 5 ? ORANGE : NAVY }}>{p.stockQuantity}</strong></Td>
                <Td><StatusBadge status={p.inStock ? 'actif' : 'rupture'} /></Td>
                <Td>
                  <Btn variant="secondary" size="sm" onClick={() => setImagesProduct(p)}>
                    <Image size={13} /> {p.images?.length ?? 0}
                  </Btn>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Modal création produit */}
      {showModal && (
        <Modal title={t('admin.pages.shop.modal.addTitle')} onClose={() => setShowModal(false)} onConfirm={handleCreate} confirmLabel={saving ? t('admin.pages.shop.modal.saving') : t('admin.pages.shop.modal.add')}>
          <Grid cols={2} style={{ gap: 12 }}>
            <FormGroup label={t('admin.pages.shop.modal.sku')}><Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="VC-LUN-003" /></FormGroup>
            <FormGroup label={t('admin.pages.shop.modal.brand')}><Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="VanOptic" /></FormGroup>
          </Grid>
          <FormGroup label={t('admin.pages.shop.modal.name')}><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></FormGroup>
          <FormGroup label={t('admin.pages.shop.modal.description')}><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></FormGroup>
          <FormGroup label={t('admin.pages.shop.modal.category')}>
            <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {PRODUCT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </FormGroup>
          <Grid cols={2} style={{ gap: 12 }}>
            <FormGroup label={t('admin.pages.shop.modal.price')}><Input type="number" value={form.priceMga} onChange={e => setForm(f => ({ ...f, priceMga: e.target.value }))} placeholder="45000" min="0" /></FormGroup>
            <FormGroup label={t('admin.pages.shop.modal.stockQty')}><Input type="number" value={form.stockQuantity} onChange={e => setForm(f => ({ ...f, stockQuantity: e.target.value }))} min="0" /></FormGroup>
          </Grid>
        </Modal>
      )}

      {/* Modal gestion images */}
      {imagesProduct && (
        <Modal title={`${t('admin.pages.shop.images.title')} ${imagesProduct.name}`} onClose={() => setImagesProduct(null)} onConfirm={() => setImagesProduct(null)} confirmLabel={t('admin.pages.shop.images.close')}>
          {(imagesProduct.images ?? []).length === 0 ? (
            <p style={{ color: '#6b8a87', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>{t('admin.pages.shop.images.noPhotos')}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
              {(imagesProduct.images ?? []).map((url, idx) => (
                <div key={idx} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid #d0e8e6', aspectRatio: '1' }}>
                  <img src={url} alt={`Photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={() => handleDeleteImage(idx)}
                    disabled={deletingIdx === idx}
                    style={{ position: 'absolute', top: 4, right: 4, width: 26, height: 26, borderRadius: '50%', background: '#e53e3e', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={12} color="white" />
                  </button>
                  {idx === 0 && (
                    <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 10, fontWeight: 700, background: TEAL, color: 'white', padding: '2px 6px', borderRadius: 6 }}>{t('admin.pages.shop.images.main')}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload nouvelle photo */}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleUploadImage} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{ width: '100%', height: 48, border: '2px dashed #d0e8e6', borderRadius: 12, background: uploading ? '#f4f9f8' : 'white', cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: uploading ? '#9ab0ae' : TEAL }}
          >
            <Upload size={16} />
            {uploading ? t('admin.pages.shop.images.uploading') : t('admin.pages.shop.images.upload')}
          </button>
        </Modal>
      )}
    </div>
  );
}

// ─── INVENTORY ────────────────────────────────────────────────
export function InventoryPage() {
  const { t } = useLanguage();
  const { data: products, loading, error } = useApi<ApiProduct[]>('/products');

  const total = (products ?? []).reduce((s, p) => s + p.stockQuantity, 0);
  const lowCount = (products ?? []).filter(p => p.stockQuantity > 0 && p.stockQuantity < 10).length;
  const criticalCount = (products ?? []).filter(p => p.stockQuantity === 0).length;

  const exportCsv = () => {
    const rows = [
      [t('admin.pages.inventory.colRef'), t('admin.pages.inventory.colProduct'), t('admin.pages.inventory.colCategory'), t('admin.pages.shop.modal.brand'), t('admin.pages.shop.modal.price'), t('admin.pages.inventory.colCurrentStock'), t('admin.pages.inventory.colStatus')],
      ...(products ?? []).map(p => [
        p.sku, p.name, p.categoryLabel, (p as any).brand ?? '',
        String(p.priceMga), String(p.stockQuantity),
        p.stockQuantity === 0 ? t('admin.pages.inventory.statusOut') : p.stockQuantity < 10 ? t('admin.pages.inventory.statusLow') : t('admin.pages.inventory.statusOk'),
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `inventaire-vanclinic-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader title={t('admin.pages.inventory.title')}>
        <Btn variant="secondary" onClick={exportCsv} disabled={!products}><Download size={14} /> {t('admin.pages.inventory.exportCsv')}</Btn>
      </PageHeader>
      <Grid cols={3} style={{ marginBottom: 20 }}>
        <StatCard value={String(total)} label={t('admin.pages.inventory.totalUnits')} accent={TEAL} />
        <StatCard value={String(lowCount)} label={t('admin.pages.inventory.lowStock')} accent={ORANGE} />
        <StatCard value={String(criticalCount)} label={t('admin.pages.inventory.outOfStock')} accent="#e53e3e" />
      </Grid>
      <Card>
        {loading ? <Loader /> : error ? <ErrorMsg msg={error} /> : (
          <Table headers={[t('admin.pages.inventory.colRef'), t('admin.pages.inventory.colProduct'), t('admin.pages.inventory.colCategory'), t('admin.pages.inventory.colCurrentStock'), t('admin.pages.inventory.colPrice'), t('admin.pages.inventory.colStatus')]}>
            {(products ?? []).map(p => (
              <Tr key={p.id}>
                <Td mono><span style={{ color: TEAL, fontWeight: 700, fontSize: 11 }}>{p.sku}</span></Td>
                <Td><strong>{p.name}</strong></Td>
                <Td><Tag>{p.categoryLabel}</Tag></Td>
                <Td><strong style={{ color: p.stockQuantity === 0 ? '#e53e3e' : p.stockQuantity < 10 ? ORANGE : NAVY }}>{p.stockQuantity}</strong></Td>
                <Td>{fmgAmount(p.priceMga)}</Td>
                <Td><StatusBadge status={p.stockQuantity === 0 ? 'critical' : p.stockQuantity < 10 ? 'low' : 'ok'} /></Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

// ─── ORDERS ───────────────────────────────────────────────────
export function OrdersPage() {
  const { t } = useLanguage();
  const { data: orders, loading, error, reload } = useApi<ApiOrder[]>('/admin/orders');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleStatusUpdate = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      await api.patch(`/orders/${id}/status`, { status });
      reload();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erreur');
    } finally { setUpdatingId(null); }
  };

  const nextStatus: Record<string, string> = {
    pending: 'preparing',
    preparing: 'shipped',
    shipped: 'delivered',
  };
  const nextLabel: Record<string, string> = {
    pending: t('admin.pages.orders.process'),
    preparing: t('admin.pages.orders.ship'),
    shipped: t('admin.pages.orders.deliveredAction'),
  };

  return (
    <div>
      <PageHeader title={t('admin.nav.orders')} subtitle={`${orders?.length ?? '...'} ${t('admin.pages.orders.subtitle')}`} />
      <Grid cols={4} style={{ marginBottom: 20 }}>
        {[
          { s: 'pending', l: t('admin.pages.orders.pending'), c: ORANGE },
          { s: 'preparing', l: t('admin.pages.orders.preparing'), c: TEAL },
          { s: 'shipped', l: t('admin.pages.orders.shipped'), c: NAVY },
          { s: 'delivered', l: t('admin.pages.orders.delivered'), c: '#5cb85c' },
        ].map(({ s, l, c }) => (
          <Card key={s} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: c }}>{(orders ?? []).filter(o => o.status === s).length}</p>
            <p style={{ fontSize: 12, color: '#6b8a87' }}>{l}</p>
          </Card>
        ))}
      </Grid>
      <Card>
        {loading ? <Loader /> : error ? <ErrorMsg msg={error} /> : (
          <Table headers={[t('admin.pages.orders.colOrder'), t('admin.pages.orders.colClient'), t('admin.pages.orders.colItems'), t('admin.pages.orders.colAmount'), t('admin.pages.orders.colStatus'), t('admin.pages.orders.colDate'), t('admin.pages.orders.colActions')]}>
            {(orders ?? []).map(o => (
              <Tr key={o.id}>
                <Td mono><span style={{ color: TEAL, fontWeight: 700 }}>{o.orderNumber}</span></Td>
                <Td><strong>{o.patientName}</strong></Td>
                <Td><span style={{ color: '#6b8a87', fontSize: 12 }}>{o.items.map(i => `${i.productName} ×${i.quantity}`).join(', ')}</span></Td>
                <Td><strong>{fmgAmount(o.totalMga)}</strong></Td>
                <Td><StatusBadge status={o.status} /></Td>
                <Td><span style={{ color: '#6b8a87' }}>{fmgDate(o.createdAt)}</span></Td>
                <Td>
                  {nextStatus[o.status] && (
                    <Btn variant="secondary" size="sm" onClick={() => handleStatusUpdate(o.id, nextStatus[o.status])} >
                      {updatingId === o.id ? '...' : nextLabel[o.status]}
                    </Btn>
                  )}
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────
export function ReportsPage() {
  const { t } = useLanguage();
  const { data: stats } = useApi<ApiDashboard>('/admin/dashboard');
  const { data: appts } = useApi<ApiAppointment[]>('/admin/appointments');

  const completed = (appts ?? []).filter(a => a.status === 'completed').length;
  const total = (appts ?? []).length;

  const exportPdf = () => {
    if (!stats || !appts) return;
    const now = new Date().toLocaleDateString('fr-FR');
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Rapport VanClinic</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#1e3a5f}h1{color:#1e3a5f;border-bottom:3px solid #1a9b8e;padding-bottom:8px}h2{color:#1a9b8e;margin-top:28px}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#1e3a5f;color:white;padding:8px 12px;text-align:left;font-size:13px}td{padding:8px 12px;border-bottom:1px solid #d0e8e6;font-size:13px}.stat{display:inline-block;background:#f0fffe;border:2px solid #1a9b8e;border-radius:8px;padding:12px 20px;margin:6px;text-align:center}.stat-val{font-size:24px;font-weight:700;color:#1a9b8e}.stat-lbl{font-size:12px;color:#6b8a87}@media print{button{display:none}}</style>
</head><body>
<h1>Rapport d'activité — VanClinic Madagascar</h1>
<p style="color:#6b8a87">Généré le ${now}</p>
<h2>Indicateurs clés</h2>
<div>
  <div class="stat"><div class="stat-val">${stats.users.patients}</div><div class="stat-lbl">Patients</div></div>
  <div class="stat"><div class="stat-val">${total}</div><div class="stat-lbl">Total RDV</div></div>
  <div class="stat"><div class="stat-val">${completed}</div><div class="stat-lbl">Consultations terminées</div></div>
  <div class="stat"><div class="stat-val">${total > 0 ? Math.round((completed / total) * 100) : 0}%</div><div class="stat-lbl">Taux de présence</div></div>
  <div class="stat"><div class="stat-val">${new Intl.NumberFormat('fr-MG').format(stats.revenue.last_30_days_mga)} Ar</div><div class="stat-lbl">Revenus 30 jours</div></div>
</div>
<h2>Rendez-vous par statut</h2>
<table><tr><th>Statut</th><th>Nombre</th></tr>
  <tr><td>Planifiés</td><td>${stats.appointments.scheduled}</td></tr>
  <tr><td>Confirmés</td><td>${stats.appointments.confirmed}</td></tr>
  <tr><td>Terminés</td><td>${stats.appointments.completed}</td></tr>
  <tr><td>Annulés</td><td>${stats.appointments.cancelled}</td></tr>
</table>
<h2>Liste des rendez-vous</h2>
<table><tr><th>Patient</th><th>Type</th><th>Date</th><th>Lieu</th><th>Statut</th></tr>
${appts.map(a => `<tr><td>${a.patient.fullName}</td><td>${a.typeLabel}</td><td>${new Date(a.scheduledAt).toLocaleDateString('fr-FR')}</td><td>${a.location ?? '—'}</td><td>${a.statusLabel}</td></tr>`).join('')}
</table>
</body></html>`;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  return (
    <div>
      <PageHeader title={t('admin.nav.reports')}>
        <Btn variant="secondary" onClick={exportPdf} disabled={!stats || !appts}>{t('admin.pages.reports.exportPdf')}</Btn>
      </PageHeader>
      <Grid cols={2} style={{ marginBottom: 20 }}>
        <Card>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>{t('admin.pages.reports.kpis')}</div>
          {stats && [
            { label: t('admin.pages.reports.patientsRegistered'), val: stats.users.patients, target: 300 },
            { label: t('admin.pages.reports.consultationsCompleted'), val: completed, target: 200 },
            { label: t('admin.pages.reports.ordersProcessed'), val: stats.appointments.completed, target: 50 },
            { label: t('admin.pages.reports.attendanceRate'), val: total > 0 ? Math.round((completed / total) * 100) : 0, target: 85, suffix: '%' },
          ].map(k => (
            <div key={k.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{k.label}</span>
                <span style={{ fontWeight: 700, color: k.val >= k.target ? '#5cb85c' : ORANGE }}>{k.val}{k.suffix ?? ''} <span style={{ color: '#6b8a87' }}>/ {k.target}{k.suffix ?? ''}</span></span>
              </div>
              <div style={{ height: 8, background: '#d0e8e6', borderRadius: 4 }}>
                <div style={{ height: 8, width: `${Math.min((k.val / k.target) * 100, 100)}%`, background: k.val >= k.target ? '#5cb85c' : ORANGE, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>{t('admin.pages.reports.appointmentStatus')}</div>
          {stats && (
            <BarChart data={[
              { label: t('admin.pages.reports.scheduled'), value: stats.appointments.scheduled, max: total || 1, color: TEAL },
              { label: t('admin.pages.reports.confirmed'), value: stats.appointments.confirmed, max: total || 1, color: '#5cb85c' },
              { label: t('admin.pages.reports.completed'), value: stats.appointments.completed, max: total || 1, color: NAVY },
              { label: t('admin.pages.reports.cancelled'), value: stats.appointments.cancelled, max: total || 1, color: '#e53e3e' },
            ]} />
          )}
        </Card>
      </Grid>
    </div>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────
export function AnalyticsPage() {
  const { t } = useLanguage();
  const { data: stats } = useApi<ApiDashboard>('/admin/dashboard');
  const { data: products } = useApi<ApiProduct[]>('/products');

  const totalPatients = stats?.users.patients ?? 0;
  const totalAgents = stats?.users.agents ?? 0;
  const totalOphtalmologues = stats?.users.ophtalmologues ?? 0;
  const revenueAllTime = stats?.revenue.all_time_mga ?? 0;

  return (
    <div>
      <PageHeader title={t('admin.nav.analytics')}>
      </PageHeader>
      <Grid cols={4} style={{ marginBottom: 24 }}>
        <StatCard value={String(totalPatients)} label={t('admin.pages.analytics.totalPatients')} accent={TEAL} />
        <StatCard value={String(totalAgents)} label={t('admin.pages.analytics.agents')} accent={NAVY} />
        <StatCard value={String(totalOphtalmologues)} label={t('admin.pages.analytics.ophthalmologists')} accent="#5cb85c" />
        <StatCard value={fmgAmount(revenueAllTime)} label={t('admin.pages.analytics.totalRevenue')} accent={ORANGE} />
      </Grid>
      <Grid cols={2}>
        <Card>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>{t('admin.pages.analytics.team')}</div>
          <BarChart data={[
            { label: t('admin.pages.analytics.patients'), value: totalPatients, max: totalPatients || 1, color: TEAL },
            { label: t('admin.pages.analytics.agentsLabel'), value: totalAgents, max: totalPatients || 1, color: NAVY },
            { label: t('admin.pages.analytics.ophthalmologistsLabel'), value: totalOphtalmologues, max: totalPatients || 1, color: '#5cb85c' },
          ]} />
        </Card>
        <Card>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>{t('admin.pages.analytics.stockByCategory')}</div>
          {products && (() => {
            const byCategory: Record<string, number> = {};
            products.forEach(p => { byCategory[p.categoryLabel] = (byCategory[p.categoryLabel] ?? 0) + p.stockQuantity; });
            const maxVal = Math.max(...Object.values(byCategory), 1);
            return (
              <BarChart data={Object.entries(byCategory).map(([label, value]) => ({ label, value, max: maxVal }))} />
            );
          })()}
        </Card>
      </Grid>
    </div>
  );
}

// ─── USERS ────────────────────────────────────────────────────
export function UsersPage() {
  const { t } = useLanguage();
  const { data: users, loading, error, reload } = useApi<ApiUser[]>('/admin/users');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'ROLE_AGENT_RELAIS', password: 'Vanclinic2025!' });
  const [saving, setSaving] = useState(false);

  const ROLE_COLORS: Record<string, string> = { ROLE_COORDINATEUR: TEAL, ROLE_OPHTALMOLOGUE: NAVY, ROLE_TECHNICIEN: '#5cb85c', ROLE_AGENT_RELAIS: ORANGE, ROLE_PATIENT: '#8b5cf6' };
  const ROLE_LABELS: Record<string, string> = { ROLE_COORDINATEUR: 'Coordinateur', ROLE_OPHTALMOLOGUE: 'Ophtalmologue', ROLE_TECHNICIEN: 'Technicien', ROLE_AGENT_RELAIS: 'Agent Relais', ROLE_PATIENT: 'Patient' };

  const getRole = (roles: string[]) => roles.find(r => r !== 'ROLE_USER') ?? 'ROLE_USER';

  const handleCreate = async () => {
    setSaving(true);
    try {
      await api.post('/admin/users/staff', form);
      setShowModal(false);
      reload();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erreur');
    } finally { setSaving(false); }
  };

  const staffUsers = (users ?? []).filter(u => !u.roles.includes('ROLE_PATIENT'));
  const counts: Record<string, number> = {};
  staffUsers.forEach(u => { const r = getRole(u.roles); counts[r] = (counts[r] ?? 0) + 1; });

  return (
    <div>
      <PageHeader title={t('admin.pages.users.title')} subtitle={`${users?.length ?? '...'} ${t('admin.pages.users.subtitle')}`}>
        <Btn variant="primary" onClick={() => setShowModal(true)}><Plus size={14} /> {t('admin.pages.users.newUser')}</Btn>
      </PageHeader>
      <Grid cols={4} style={{ marginBottom: 20 }}>
        {['ROLE_COORDINATEUR', 'ROLE_OPHTALMOLOGUE', 'ROLE_TECHNICIEN', 'ROLE_AGENT_RELAIS'].map(r => (
          <Card key={r} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: ROLE_COLORS[r] }}>{counts[r] ?? 0}</p>
            <p style={{ fontSize: 12, color: '#6b8a87' }}>{ROLE_LABELS[r]}s</p>
          </Card>
        ))}
      </Grid>
      <Card>
        {loading ? <Loader /> : error ? <ErrorMsg msg={error} /> : (
          <Table headers={[t('admin.pages.users.colUser'), t('admin.pages.users.colRole'), t('admin.pages.users.colEmail'), t('admin.pages.users.colLastLogin'), t('admin.pages.users.colStatus')]}>
            {(users ?? []).map(u => {
              const role = getRole(u.roles);
              const color = ROLE_COLORS[role] ?? '#ccc';
              return (
                <Tr key={u.id}>
                  <Td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={u.fullName} color={color} /><strong>{u.fullName}</strong></div></Td>
                  <Td><span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: color + '22', color }}>{ROLE_LABELS[role] ?? role}</span></Td>
                  <Td><span style={{ color: '#6b8a87', fontSize: 12 }}>{u.email}</span></Td>
                  <Td><span style={{ color: '#6b8a87', fontSize: 12 }}>{u.lastLoginAt ? fmgDateTime(u.lastLoginAt) : t('admin.pages.users.never')}</span></Td>
                  <Td><StatusBadge status={u.isActive ? 'actif' : 'inactif'} /></Td>
                </Tr>
              );
            })}
          </Table>
        )}
      </Card>
      {showModal && (
        <Modal title={t('admin.pages.users.modal.title')} onClose={() => setShowModal(false)} onConfirm={handleCreate} confirmLabel={saving ? t('admin.pages.users.modal.creating') : t('admin.pages.users.modal.create')}>
          <Grid cols={2} style={{ gap: 12 }}>
            <FormGroup label={t('admin.pages.users.modal.firstName')}><Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Jean" /></FormGroup>
            <FormGroup label={t('admin.pages.users.modal.lastName')}><Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Dupont" /></FormGroup>
          </Grid>
          <FormGroup label={t('admin.pages.users.modal.email')}><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="utilisateur@vanclinic.mg" /></FormGroup>
          <FormGroup label={t('admin.pages.users.modal.phone')}><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+261 34 XX XX XX" /></FormGroup>
          <FormGroup label={t('admin.pages.users.modal.role')}>
            <Select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="ROLE_AGENT_RELAIS">Agent Relais</option>
              <option value="ROLE_OPHTALMOLOGUE">Ophtalmologue</option>
              <option value="ROLE_TECHNICIEN">Technicien</option>
              <option value="ROLE_COORDINATEUR">Coordinateur</option>
            </Select>
          </FormGroup>
          <FormGroup label={t('admin.pages.users.modal.password')}><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></FormGroup>
        </Modal>
      )}
    </div>
  );
}

// ─── LOGS ─────────────────────────────────────────────────────
export function LogsPage() {
  const { t } = useLanguage();
  const { data: appts } = useApi<ApiAppointment[]>('/admin/appointments');
  const { data: orders } = useApi<ApiOrder[]>('/admin/orders');

  const logs = [
    ...(appts ?? []).slice(0, 5).map(a => ({
      time: fmgDateTime(a.createdAt),
      user: a.patient.fullName,
      action: t('admin.pages.logs.appointmentCreated'),
      target: `${a.typeLabel} — ${fmgDate(a.scheduledAt)}`,
      type: 'info',
    })),
    ...(orders ?? []).slice(0, 5).map(o => ({
      time: fmgDateTime(o.createdAt),
      user: o.patientName,
      action: t('admin.pages.logs.orderPlaced'),
      target: `${o.orderNumber} — ${fmgAmount(o.totalMga)}`,
      type: 'success',
    })),
  ].sort((a, b) => b.time.localeCompare(a.time));

  const colors: Record<string, string> = { info: TEAL, success: '#5cb85c', warning: ORANGE, error: '#e53e3e' };

  return (
    <div>
      <PageHeader title={t('admin.pages.logs.title')}>
        <Select style={{ width: 160 }}><option>{t('admin.pages.logs.all')}</option></Select>
      </PageHeader>
      <Card>
        {logs.length === 0 ? <Loader /> : logs.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', borderRadius: 8, borderBottom: i < logs.length - 1 ? '1px solid #f0f7f6' : 'none' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b8a87', width: 120, flexShrink: 0 }}>{l.time}</span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[l.type], flexShrink: 0 }} />
            <span style={{ fontWeight: 600, fontSize: 13, width: 160, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.user}</span>
            <span style={{ fontSize: 13, flex: 1 }}>{l.action}</span>
            <span style={{ fontSize: 12, color: '#6b8a87', flexShrink: 0 }}>{l.target}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────
export function SettingsPage() {
  const { t } = useLanguage();
  return (
    <div>
      <PageHeader title={t('admin.nav.settings')} />
      <Grid cols={2}>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>{t('admin.pages.settings.platform')}</div>
            <FormGroup label={t('admin.pages.settings.orgName')}><Input defaultValue="VanClinic Madagascar" /></FormGroup>
            <FormGroup label={t('admin.pages.settings.contactEmail')}><Input type="email" defaultValue="contact@vanclinic.mg" /></FormGroup>
            <FormGroup label={t('admin.pages.settings.mainRegion')}><Input defaultValue="Atsinanana" /></FormGroup>
            <Btn variant="primary">{t('admin.pages.settings.save')}</Btn>
          </Card>
          <Card>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>{t('admin.pages.settings.security')}</div>
            <FormGroup label={t('admin.pages.settings.sessionTimeout')}>
              <Select><option>{t('admin.pages.settings.hour1')}</option><option>{t('admin.pages.settings.hour4')}</option><option>{t('admin.pages.settings.hour8')}</option></Select>
            </FormGroup>
            <Btn variant="primary">{t('admin.pages.settings.saveBtn')}</Btn>
          </Card>
        </div>
        <div>
          <Card>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>{t('admin.pages.settings.paymentIntegrations')}</div>
            {[{ name: 'Orange Money', active: true, color: ORANGE }, { name: 'Telma Mvola', active: true, color: TEAL }, { name: 'Airtel Money', active: true, color: '#cc0000' }].map(p => (
              <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f7f6' }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</span>
                <StatusBadge status={p.active ? 'actif' : 'inactif'} />
              </div>
            ))}
          </Card>
        </div>
      </Grid>
    </div>
  );
}

export default DashboardPage;
