import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth, ROLE_CONFIG } from '@/contexts/AuthContext';
import { StatusBadge, Card, PageHeader, StatCard, Btn, Avatar, Table, Tr, Td, Tag, BarChart, Grid, Modal, FormGroup, Input, Select } from '@/components/AdminUI';
import { PATIENTS, APPOINTMENTS, ORDERS, INVENTORY, USERS_LIST } from './data';
import { Plus, Download, Filter } from 'lucide-react';

const NAVY = '#1e3a5f'; const TEAL = '#1a9b8e'; const ORANGE = '#f0821d';

// ─── DASHBOARD ────────────────────────────────────────────────
export function DashboardPage() {
  return (
    <div>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de l'activité VanClinic" />
      <Grid cols={4} style={{ marginBottom: 24 }}>
        <StatCard value="3 247" label="Patients suivis" delta="↑ 12% ce mois" deltaUp accent={TEAL} />
        <StatCard value="142" label="RDV ce mois" delta="↑ 8% vs mois dernier" deltaUp accent={NAVY} />
        <StatCard value="1 712" label="Lunettes distribuées" delta="↑ 5% ce trimestre" deltaUp accent="#5cb85c" />
        <StatCard value="89%" label="Taux de satisfaction" delta="↓ 2% vs mois dernier" deltaUp={false} accent={ORANGE} />
      </Grid>
      <Grid cols={2} style={{ marginBottom: 24 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 700, color: NAVY }}>Rendez-vous du jour</span>
            <Btn variant="secondary" size="sm">Voir tout</Btn>
          </div>
          {APPOINTMENTS.slice(0, 4).map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f7f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={a.patient} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{a.patient}</p>
                  <p style={{ fontSize: 11, color: '#6b8a87' }}>{a.type} — {a.time}</p>
                </div>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>Districts couverts</div>
          <BarChart data={[
            { label: 'Toamasina I', value: 1240, max: 1500 },
            { label: 'Toamasina II', value: 890, max: 1500 },
            { label: 'Brickaville', value: 420, max: 1500 },
            { label: 'Mahanoro', value: 380, max: 1500 },
            { label: 'Vatomandry', value: 317, max: 1500 },
          ]} />
        </Card>
      </Grid>
      <Grid cols={3}>
        <Card style={{ gridColumn: 'span 2' }}>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>Dernières commandes</div>
          <Table headers={['Commande', 'Client', 'Montant', 'Statut']}>
            {ORDERS.map(o => (
              <Tr key={o.id}>
                <Td mono><span style={{ color: TEAL, fontWeight: 700 }}>{o.id}</span></Td>
                <Td>{o.client}</Td>
                <Td><strong>{o.amount}</strong></Td>
                <Td><StatusBadge status={o.status} /></Td>
              </Tr>
            ))}
          </Table>
        </Card>
        <Card>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>Alertes stock</div>
          {INVENTORY.filter(i => i.status !== 'ok').map(i => (
            <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f0f7f6' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: i.status === 'critical' ? '#e53e3e' : ORANGE, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{i.name}</p>
                <p style={{ fontSize: 11, color: '#6b8a87' }}>Stock: {i.stock} / Min: {i.min}</p>
              </div>
              <StatusBadge status={i.status} />
            </div>
          ))}
        </Card>
      </Grid>
    </div>
  );
}

// ─── PATIENTS ─────────────────────────────────────────────────
export function PatientsPage() {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('');
  const filtered = PATIENTS.filter(p => !filter || p.district === filter);
  return (
    <div>
      <PageHeader title="Gestion des patients" subtitle={`${PATIENTS.length} patients enregistrés`}>
        <Select style={{ width: 160 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">Tous les districts</option>
          {['Toamasina I','Toamasina II','Brickaville','Mahanoro','Vatomandry'].map(d => <option key={d}>{d}</option>)}
        </Select>
        <Btn variant="primary" onClick={() => setShowModal(true)}><Plus size={14} /> Nouveau patient</Btn>
      </PageHeader>
      <Card>
        <Table headers={['Patient','Âge','District','Pathologie','Dernière visite','Statut','Actions']}>
          {filtered.map(p => (
            <Tr key={p.id}>
              <Td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={p.name} /><div><p style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</p><p style={{ fontSize: 11, color: '#6b8a87' }}>{p.phone}</p></div></div></Td>
              <Td>{p.age} ans</Td>
              <Td>{p.district}</Td>
              <Td><Tag>{p.condition}</Tag></Td>
              <Td><span style={{ color: '#6b8a87' }}>{p.lastVisit}</span></Td>
              <Td><StatusBadge status={p.status} /></Td>
              <Td><div style={{ display: 'flex', gap: 6 }}><Btn variant="secondary" size="sm">Voir</Btn><Btn variant="outline" size="sm">Modifier</Btn></div></Td>
            </Tr>
          ))}
        </Table>
      </Card>
      {showModal && (
        <Modal title="Nouveau patient" onClose={() => setShowModal(false)} onConfirm={() => setShowModal(false)} confirmLabel="Enregistrer">
          <Grid cols={2} style={{ gap: 12 }}>
            <FormGroup label="Prénom"><Input placeholder="Jean" /></FormGroup>
            <FormGroup label="Nom"><Input placeholder="Dupont" /></FormGroup>
          </Grid>
          <FormGroup label="Date de naissance"><Input type="date" /></FormGroup>
          <FormGroup label="Téléphone"><Input placeholder="+261 32 XX XX XX" /></FormGroup>
          <FormGroup label="District">
            <Select><option>Toamasina I</option><option>Toamasina II</option><option>Brickaville</option><option>Mahanoro</option><option>Vatomandry</option></Select>
          </FormGroup>
        </Modal>
      )}
    </div>
  );
}

// ─── APPOINTMENTS ─────────────────────────────────────────────
export function AppointmentsPage() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div>
      <PageHeader title="Rendez-vous" subtitle={`${APPOINTMENTS.length} rendez-vous planifiés`}>
        <Btn variant="primary" onClick={() => setShowModal(true)}><Plus size={14} /> Nouveau RDV</Btn>
      </PageHeader>
      <Grid cols={4} style={{ marginBottom: 20 }}>
        {[{v:'5',l:"Aujourd'hui",c:TEAL},{v:'2',l:'En attente',c:ORANGE},{v:'3',l:'Confirmés',c:'#5cb85c'},{v:'1',l:'Annulés',c:'#e53e3e'}].map(s => (
          <Card key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: s.c + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: s.c }}>{s.v}</div>
            <div><p style={{ fontWeight: 700, color: NAVY }}>{s.v}</p><p style={{ fontSize: 12, color: '#6b8a87' }}>{s.l}</p></div>
          </Card>
        ))}
      </Grid>
      <Card>
        <Table headers={['ID','Patient','Type','Date & Heure','Médecin','District','Statut','Actions']}>
          {APPOINTMENTS.map(a => (
            <Tr key={a.id}>
              <Td mono><span style={{ color: TEAL, fontWeight: 700, fontSize: 11 }}>{a.id}</span></Td>
              <Td><strong>{a.patient}</strong></Td>
              <Td><Tag>{a.type}</Tag></Td>
              <Td>{a.date} <span style={{ color: '#6b8a87' }}>à {a.time}</span></Td>
              <Td><span style={{ color: '#6b8a87', fontSize: 12 }}>{a.doctor}</span></Td>
              <Td>{a.district}</Td>
              <Td><StatusBadge status={a.status} /></Td>
              <Td><div style={{ display: 'flex', gap: 6 }}><Btn variant="secondary" size="sm">Voir</Btn><Btn variant="danger" size="sm">Annuler</Btn></div></Td>
            </Tr>
          ))}
        </Table>
      </Card>
      {showModal && (
        <Modal title="Nouveau rendez-vous" onClose={() => setShowModal(false)} onConfirm={() => setShowModal(false)} confirmLabel="Confirmer">
          <FormGroup label="Patient"><Select>{PATIENTS.map(p => <option key={p.id}>{p.name}</option>)}</Select></FormGroup>
          <FormGroup label="Type"><Select><option>Consultation générale</option><option>Examen ophtalmologique</option><option>Suivi</option><option>Téléexpertise</option></Select></FormGroup>
          <Grid cols={2} style={{ gap: 12 }}>
            <FormGroup label="Date"><Input type="date" /></FormGroup>
            <FormGroup label="Heure"><Select><option>09:00</option><option>09:30</option><option>10:00</option><option>14:00</option><option>14:30</option></Select></FormGroup>
          </Grid>
          <FormGroup label="Médecin"><Select><option>Dr. Marie Rakoto</option><option>Dr. Jean Rakotondrazaka</option></Select></FormGroup>
          <FormGroup label="District"><Select><option>Toamasina I</option><option>Toamasina II</option><option>Brickaville</option><option>Mahanoro</option><option>Vatomandry</option></Select></FormGroup>
        </Modal>
      )}
    </div>
  );
}

// ─── MEDICAL ──────────────────────────────────────────────────
export function MedicalPage() {
  return (
    <div>
      <PageHeader title="Dossiers médicaux">
        <Input placeholder="Rechercher un patient..." style={{ width: 250 }} />
        <Btn variant="primary"><Plus size={14} /> Nouveau dossier</Btn>
      </PageHeader>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {PATIENTS.map(p => (
          <Card key={p.id} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <Avatar name={p.name} />
                <div><p style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</p><p style={{ fontSize: 11, color: '#6b8a87' }}>{p.age} ans · {p.district}</p></div>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <div style={{ height: 1, background: '#f0f7f6', margin: '10px 0' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div><p style={{ fontSize: 10, color: '#9ab0ae' }}>Pathologie</p><p style={{ fontSize: 12, fontWeight: 700 }}>{p.condition}</p></div>
              <div><p style={{ fontSize: 10, color: '#9ab0ae' }}>Score santé</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <div style={{ flex: 1, height: 4, background: '#d0e8e6', borderRadius: 2 }}>
                    <div style={{ width: `${p.score}%`, height: 4, background: p.score > 80 ? '#5cb85c' : p.score > 60 ? ORANGE : '#e53e3e', borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{p.score}%</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="secondary" size="sm" style={{ flex: 1, justifyContent: 'center' }}>Consulter</Btn>
              <Btn variant="outline" size="sm" style={{ flex: 1, justifyContent: 'center' }}>PDF</Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── TELEMEDICINE ─────────────────────────────────────────────
export function TelemedicinePage() {
  const sessions = [
    { patient:'Rabemananjara Solo', from:'Agent Vola', motif:'Suspicion glaucome', date:"Aujourd'hui 09:00", priority:'haute', status:'en_attente' },
    { patient:'Raharinivo Mamy', from:'Dr. Jean Rakotondrazaka', motif:'Suivi post-op cataracte', date:'Hier 14:30', priority:'normale', status:'en_attente' },
    { patient:'Rakoto Andry', from:'Agent Tiana', motif:'Douleur oculaire', date:'23 avr', priority:'urgente', status:'confirme' },
  ];
  return (
    <div>
      <PageHeader title="Télémédecine">
        <Btn variant="primary"><Plus size={14} /> Nouvelle session</Btn>
      </PageHeader>
      <Grid cols={3} style={{ marginBottom: 24 }}>
        <StatCard value="3" label="Sessions actives" accent="#5cb85c" />
        <StatCard value="7" label="En attente de réponse" accent={ORANGE} />
        <StatCard value="18h" label="Délai moyen de réponse" accent={TEAL} />
      </Grid>
      <Card>
        <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>Demandes de téléexpertise</div>
        <Table headers={['Patient','Demandé par','Motif','Date','Priorité','Statut','Actions']}>
          {sessions.map((s, i) => (
            <Tr key={i}>
              <Td><strong>{s.patient}</strong></Td>
              <Td><span style={{ color: '#6b8a87' }}>{s.from}</span></Td>
              <Td>{s.motif}</Td>
              <Td><span style={{ color: '#6b8a87', fontSize: 12 }}>{s.date}</span></Td>
              <Td><span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.priority === 'urgente' ? '#fff0f0' : s.priority === 'haute' ? '#fff0e0' : '#f0f0f0', color: s.priority === 'urgente' ? '#c53030' : s.priority === 'haute' ? '#7a3800' : '#555' }}>{s.priority}</span></Td>
              <Td><StatusBadge status={s.status} /></Td>
              <Td><Btn variant="primary" size="sm">Répondre</Btn></Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ─── PLANNING ─────────────────────────────────────────────────
export function PlanningPage() {
  const days = [
    { day: 'Lun 27', missions: ['Toamasina I', 'Toamasina II'], today: true },
    { day: 'Mar 28', missions: ['Brickaville'], today: false },
    { day: 'Mer 29', missions: ['Mahanoro'], today: false },
    { day: 'Jeu 30', missions: ['Toamasina I'], today: false },
    { day: 'Ven 1', missions: ['Vatomandry', 'Toamasina II'], today: false },
    { day: 'Sam 2', missions: [], today: false },
  ];
  return (
    <div>
      <PageHeader title="Planning du Van mobile" subtitle="Semaine du 27 avril — 2 mai 2026">
        <Btn variant="secondary">← Semaine préc.</Btn>
        <Btn variant="secondary">Semaine suiv. →</Btn>
        <Btn variant="primary"><Plus size={14} /> Planifier mission</Btn>
      </PageHeader>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>Calendrier hebdomadaire</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
          {days.map(d => (
            <div key={d.day} style={{ border: `2px solid ${d.today ? TEAL : '#d0e8e6'}`, borderRadius: 12, padding: 12, minHeight: 120, background: d.today ? '#f0fffe' : 'white' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: d.today ? TEAL : '#6b8a87', marginBottom: 8 }}>{d.day}{d.today && <span style={{ display: 'block', fontSize: 10 }}>Aujourd'hui</span>}</p>
              {d.missions.length > 0 ? d.missions.map(m => (
                <div key={m} style={{ background: TEAL, color: 'white', fontSize: 10, fontWeight: 600, padding: '4px 8px', borderRadius: 6, marginBottom: 4 }}>{m}</div>
              )) : <p style={{ fontSize: 11, color: '#9ab0ae', textAlign: 'center', marginTop: 20 }}>Repos</p>}
            </div>
          ))}
        </div>
      </Card>
      <Grid cols={2}>
        <Card>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 14 }}>Districts à planifier</div>
          {['Toamasina I','Toamasina II','Brickaville','Mahanoro','Vatomandry'].map(d => (
            <div key={d} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f7f6' }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{d}</span>
              <Btn variant="secondary" size="sm">Planifier</Btn>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 14 }}>Équipement du van</div>
          {[{item:'Ophtalmoscope',ok:true},{item:'Lampe à fente',ok:true},{item:'Tonomètre',ok:true},{item:'Générateur',ok:false},{item:'Médicaments urgence',ok:true},{item:'Lunettes de stock',ok:false}].map(e => (
            <div key={e.item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f7f6' }}>
              <span style={{ fontWeight: 600, fontSize: 12 }}>{e.item}</span>
              <StatusBadge status={e.ok ? 'ok' : 'low'} />
            </div>
          ))}
        </Card>
      </Grid>
    </div>
  );
}

// ─── SHOP ─────────────────────────────────────────────────────
export function ShopPage() {
  return (
    <div>
      <PageHeader title="Gestion de la boutique">
        <Btn variant="primary"><Plus size={14} /> Ajouter produit</Btn>
      </PageHeader>
      <Grid cols={4} style={{ marginBottom: 24 }}>
        <StatCard value="847" label="Produits vendus" delta="↑ 15% ce mois" deltaUp accent={TEAL} />
        <StatCard value="12 450 000 Ar" label="Revenus boutique" delta="↑ 8%" deltaUp accent="#5cb85c" />
        <StatCard value="4" label="Commandes en attente" accent={ORANGE} />
        <StatCard value="94%" label="Taux satisfaction" accent={NAVY} />
      </Grid>
      <Card>
        <Table headers={['Produit','Catégorie','Prix','Stock','Statut','Actions']}>
          {INVENTORY.map(i => (
            <Tr key={i.id}>
              <Td><strong>{i.name}</strong></Td>
              <Td><Tag>{i.category}</Tag></Td>
              <Td><span style={{ fontWeight: 700, color: TEAL }}>{i.price}</span></Td>
              <Td><strong style={{ color: i.status === 'critical' ? '#e53e3e' : i.status === 'low' ? ORANGE : NAVY }}>{i.stock}</strong></Td>
              <Td><StatusBadge status={i.status} /></Td>
              <Td><div style={{ display: 'flex', gap: 6 }}><Btn variant="outline" size="sm">Modifier</Btn><Btn variant="danger" size="sm">Supprimer</Btn></div></Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ─── INVENTORY ────────────────────────────────────────────────
export function InventoryPage() {
  return (
    <div>
      <PageHeader title="Inventaire">
        <Btn variant="secondary"><Download size={14} /> Exporter CSV</Btn>
        <Btn variant="primary"><Plus size={14} /> Entrée de stock</Btn>
      </PageHeader>
      <Grid cols={3} style={{ marginBottom: 20 }}>
        <StatCard value="261" label="Unités totales" accent={TEAL} />
        <StatCard value="2" label="Alertes stock bas" accent={ORANGE} />
        <StatCard value="1" label="Ruptures critiques" accent="#e53e3e" />
      </Grid>
      <Card>
        <Table headers={['Référence','Produit','Catégorie','Stock actuel','Stock minimum','Prix','Statut','Actions']}>
          {INVENTORY.map(i => (
            <Tr key={i.id}>
              <Td mono><span style={{ color: TEAL, fontWeight: 700, fontSize: 11 }}>{i.id}</span></Td>
              <Td><strong>{i.name}</strong></Td>
              <Td><Tag>{i.category}</Tag></Td>
              <Td><strong style={{ color: i.status === 'critical' ? '#e53e3e' : i.status === 'low' ? ORANGE : NAVY }}>{i.stock}</strong></Td>
              <Td><span style={{ color: '#6b8a87' }}>{i.min}</span></Td>
              <Td>{i.price}</Td>
              <Td><StatusBadge status={i.status} /></Td>
              <Td><Btn variant="secondary" size="sm">+ Stock</Btn></Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ─── ORDERS ───────────────────────────────────────────────────
export function OrdersPage() {
  return (
    <div>
      <PageHeader title="Commandes" subtitle={`${ORDERS.length} commandes`} />
      <Card>
        <Table headers={['Commande','Client','Articles','Montant','Paiement','Date','Statut','Actions']}>
          {ORDERS.map(o => (
            <Tr key={o.id}>
              <Td mono><span style={{ color: TEAL, fontWeight: 700 }}>{o.id}</span></Td>
              <Td><strong>{o.client}</strong></Td>
              <Td><span style={{ color: '#6b8a87', fontSize: 12 }}>{o.items}</span></Td>
              <Td><strong>{o.amount}</strong></Td>
              <Td><span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#f0f0f0', color: '#555', fontWeight: 600 }}>{o.payment}</span></Td>
              <Td><span style={{ color: '#6b8a87' }}>{o.date}</span></Td>
              <Td><StatusBadge status={o.status} /></Td>
              <Td><Btn variant="secondary" size="sm">Mettre à jour</Btn></Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────
export function ReportsPage() {
  const kpis = [
    { label:'Patients vus', val:'312', target:'300', pct:104 },
    { label:'Consultations réalisées', val:'298', target:'280', pct:106 },
    { label:'Lunettes distribuées', val:'187', target:'200', pct:93 },
    { label:'Présence aux RDV', val:'88%', target:'85%', pct:103 },
    { label:'Délai téléconsultation', val:'18h', target:'24h', pct:125 },
  ];
  return (
    <div>
      <PageHeader title="Rapports">
        <Select style={{ width: 160 }}><option>Avril 2026</option><option>Mars 2026</option></Select>
        <Btn variant="secondary">Exporter PDF</Btn>
        <Btn variant="primary">Générer rapport</Btn>
      </PageHeader>
      <Grid cols={2} style={{ marginBottom: 20 }}>
        <Card>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>Indicateurs clés — Avril 2026</div>
          {kpis.map(k => (
            <div key={k.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{k.label}</span>
                <span style={{ fontWeight: 700, color: k.pct >= 100 ? '#5cb85c' : ORANGE }}>{k.val} <span style={{ color: '#6b8a87' }}>/ {k.target}</span></span>
              </div>
              <div style={{ height: 8, background: '#d0e8e6', borderRadius: 4 }}>
                <div style={{ height: 8, width: `${Math.min(k.pct, 100)}%`, background: k.pct >= 100 ? '#5cb85c' : ORANGE, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>Répartition par district</div>
          <BarChart data={[
            { label:'Toamasina I', value:124, max:200, color:TEAL },
            { label:'Toamasina II', value:89, max:200, color:NAVY },
            { label:'Brickaville', value:48, max:200, color:'#5cb85c' },
            { label:'Mahanoro', value:33, max:200, color:ORANGE },
            { label:'Vatomandry', value:18, max:200, color:'#e53e3e' },
          ]} />
        </Card>
      </Grid>
    </div>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────
export function AnalyticsPage() {
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const values = [180,220,260,240,290,310,285,320,345,312,358,390];
  const max = Math.max(...values);
  return (
    <div>
      <PageHeader title="Analytiques">
        <Select style={{ width: 180 }}><option>12 derniers mois</option><option>6 derniers mois</option></Select>
      </PageHeader>
      <Grid cols={4} style={{ marginBottom: 24 }}>
        <StatCard value="3 247" label="Total patients" accent={TEAL} />
        <StatCard value="1 712" label="Lunettes distribuées" accent={NAVY} />
        <StatCard value="47 500 000 Ar" label="Revenus générés" accent="#5cb85c" />
        <StatCard value="4.7/5" label="Score satisfaction" accent={ORANGE} />
      </Grid>
      <Grid cols={2} style={{ marginBottom: 20 }}>
        <Card>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>Évolution mensuelle des patients</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140 }}>
            {values.map((v, i) => {
              const h = Math.round((v / max) * 120);
              const isLast = i === 11;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', height: h, background: isLast ? TEAL : '#e8f5f3', borderRadius: '4px 4px 0 0' }} />
                  <span style={{ fontSize: 10, color: '#6b8a87' }}>{months[i]}</span>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>Pathologies les plus fréquentes</div>
          <BarChart data={[
            { label:'Myopie', value:1240, max:1500, color:TEAL },
            { label:'Astigmatisme', value:680, max:1500, color:NAVY },
            { label:'Hypermétropie', value:540, max:1500, color:'#5cb85c' },
            { label:'Glaucome', value:420, max:1500, color:ORANGE },
            { label:'Cataracte', value:367, max:1500, color:'#e53e3e' },
          ]} />
        </Card>
      </Grid>
    </div>
  );
}

// ─── USERS ────────────────────────────────────────────────────
export function UsersPage() {
  const [showModal, setShowModal] = useState(false);
  const ROLE_COLORS: Record<string, string> = { coordinateur:TEAL, ophtalmologue:NAVY, technicien:'#5cb85c', agent:ORANGE, patient:'#8b5cf6' };
  const ROLE_LABELS: Record<string, string> = { coordinateur:'Coordinateur', ophtalmologue:'Ophtalmologue', technicien:'Technicien', agent:'Agent Relais', patient:'Patient' };
  return (
    <div>
      <PageHeader title="Utilisateurs" subtitle={`${USERS_LIST.length} comptes`}>
        <Btn variant="primary" onClick={() => setShowModal(true)}><Plus size={14} /> Nouvel utilisateur</Btn>
      </PageHeader>
      <Grid cols={4} style={{ marginBottom: 20 }}>
        {['coordinateur','ophtalmologue','technicien','agent'].map(r => (
          <Card key={r} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: ROLE_COLORS[r] }}>{USERS_LIST.filter(u => u.role === r).length}</p>
            <p style={{ fontSize: 12, color: '#6b8a87' }}>{ROLE_LABELS[r]}s</p>
          </Card>
        ))}
      </Grid>
      <Card>
        <Table headers={['Utilisateur','Rôle','Email','Dernière connexion','Statut','Actions']}>
          {USERS_LIST.map(u => (
            <Tr key={u.id}>
              <Td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={u.name} color={ROLE_COLORS[u.role]} /><strong>{u.name}</strong></div></Td>
              <Td><span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: (ROLE_COLORS[u.role] || '#ccc') + '22', color: ROLE_COLORS[u.role] || '#555' }}>{ROLE_LABELS[u.role]}</span></Td>
              <Td><span style={{ color: '#6b8a87', fontSize: 12 }}>{u.email}</span></Td>
              <Td><span style={{ color: '#6b8a87', fontSize: 12 }}>{u.lastLogin}</span></Td>
              <Td><StatusBadge status={u.status} /></Td>
              <Td><div style={{ display: 'flex', gap: 6 }}><Btn variant="outline" size="sm">Modifier</Btn><Btn variant="danger" size="sm">Supprimer</Btn></div></Td>
            </Tr>
          ))}
        </Table>
      </Card>
      {showModal && (
        <Modal title="Nouvel utilisateur" onClose={() => setShowModal(false)} onConfirm={() => setShowModal(false)} confirmLabel="Créer le compte">
          <Grid cols={2} style={{ gap: 12 }}>
            <FormGroup label="Prénom"><Input placeholder="Jean" /></FormGroup>
            <FormGroup label="Nom"><Input placeholder="Dupont" /></FormGroup>
          </Grid>
          <FormGroup label="Email"><Input type="email" placeholder="utilisateur@vanclinic.mg" /></FormGroup>
          <FormGroup label="Rôle"><Select><option>coordinateur</option><option>ophtalmologue</option><option>technicien</option><option>agent</option><option>patient</option></Select></FormGroup>
          <FormGroup label="Mot de passe provisoire"><Input type="password" placeholder="Min. 8 caractères" /></FormGroup>
        </Modal>
      )}
    </div>
  );
}

// ─── LOGS ─────────────────────────────────────────────────────
export function LogsPage() {
  const logs = [
    { time:'10:32', user:'Dr. Marie Rakoto', action:'Mise à jour dossier médical', target:'Patient P003', type:'info' },
    { time:'10:15', user:'Hery Technicien', action:'Modification stock inventaire', target:'Lentilles -5 unités', type:'warning' },
    { time:'09:58', user:'Rabe Coordinateur', action:'Nouveau rendez-vous créé', target:'Patient P001 — 27 avr', type:'info' },
    { time:'09:40', user:'Agent Vola', action:'Inscription nouveau patient', target:'Rasoa Nivo, 34 ans', type:'success' },
    { time:'09:12', user:'Hery Technicien', action:'Commande expédiée', target:'#CMD-001', type:'success' },
    { time:'08:55', user:'Système', action:'Sauvegarde automatique', target:'Base de données', type:'info' },
  ];
  const colors: Record<string, string> = { info:TEAL, warning:ORANGE, success:'#5cb85c', error:'#e53e3e' };
  return (
    <div>
      <PageHeader title="Journaux système">
        <Select style={{ width: 160 }}><option>Aujourd'hui</option><option>7 derniers jours</option></Select>
        <Btn variant="secondary"><Download size={14} /> Exporter</Btn>
      </PageHeader>
      <Card>
        {logs.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', borderRadius: 8, borderBottom: i < logs.length - 1 ? '1px solid #f0f7f6' : 'none' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b8a87', width: 40, flexShrink: 0 }}>{l.time}</span>
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
  return (
    <div>
      <PageHeader title="Paramètres" />
      <Grid cols={2}>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>Informations de la plateforme</div>
            <FormGroup label="Nom de l'organisation"><Input defaultValue="VanClinic Madagascar" /></FormGroup>
            <FormGroup label="Email de contact"><Input type="email" defaultValue="contact@vanclinic.mg" /></FormGroup>
            <FormGroup label="Région principale"><Input defaultValue="Atsinanana" /></FormGroup>
            <Btn variant="primary">Enregistrer</Btn>
          </Card>
          <Card>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>Sécurité</div>
            <FormGroup label="Délai d'expiration de session">
              <Select><option>30 minutes</option><option>1 heure</option><option>4 heures</option></Select>
            </FormGroup>
            <FormGroup label="Authentification 2FA">
              <Select><option>Activée (SMS)</option><option>Désactivée</option></Select>
            </FormGroup>
            <Btn variant="primary">Sauvegarder</Btn>
          </Card>
        </div>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 16 }}>Intégrations paiement</div>
            {[{ name:'Orange Money', active:true, color:ORANGE }, { name:'Telma Mvola', active:true, color:TEAL }, { name:'Airtel Money', active:true, color:'#cc0000' }, { name:'Visa', active:false, color:NAVY }].map(p => (
              <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f7f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: p.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>💳</div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</span>
                </div>
                <StatusBadge status={p.active ? 'actif' : 'inactif'} />
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 12 }}>Sauvegarde</div>
            <p style={{ fontSize: 13, color: '#6b8a87', marginBottom: 14 }}>Dernière sauvegarde : Aujourd'hui à 08:55</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="secondary" style={{ flex: 1, justifyContent: 'center' }}>Sauvegarder maintenant</Btn>
              <Btn variant="outline" style={{ flex: 1, justifyContent: 'center' }}>Restaurer</Btn>
            </div>
          </Card>
        </div>
      </Grid>
    </div>
  );
}

// ─── EXPORTS ──────────────────────────────────────────────────
// Each file re-exports its own page
export default DashboardPage;
