import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../../test/mocks';
import { api } from '@/lib/api';
import {
  DashboardPage, PatientsPage, AppointmentsPage, MedicalPage,
  TelemedicinePage, PlanningPage, ShopPage, InventoryPage,
  OrdersPage, ReportsPage, AnalyticsPage, UsersPage, LogsPage, SettingsPage,
} from './_pages';

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

// ── Données mock ────────────────────────────────────────────────
const STATS = {
  users: { patients: 45, agents: 5, ophtalmologues: 3 },
  appointments: { scheduled: 12, confirmed: 8, completed: 100, cancelled: 5 },
  revenue: { last_30_days_mga: 5000000, all_time_mga: 25000000 },
  inventory: { low_stock_count: 3 },
};

const APPOINTMENTS = [
  {
    id: 1,
    patient: { id: 1, patientNumber: 'P001', fullName: 'Rakoto Andry' },
    ophthalmologist: { id: 2, fullName: 'Dr. Marie Rakoto' },
    scheduledAt: '2026-06-25T09:00:00',
    createdAt: '2026-06-01T08:00:00',
    type: 'on_site',
    typeLabel: 'Consultation sur site',
    status: 'scheduled',
    statusLabel: 'Planifié',
    reason: 'Contrôle de la vue',
    location: 'Toamasina I',
  },
];

const PATIENTS = [
  {
    id: 1,
    patientNumber: 'PAT-001',
    fullName: 'Rakoto Andry',
    email: 'rakoto@test.mg',
    phone: '+261321122334',
    city: 'Toamasina',
    district: 'Toamasina I',
    gender: 'M',
    birthDate: '1984-05-10',
    isActive: true,
    appointmentCount: 3,
    createdAt: '2026-01-15T10:00:00',
  },
];

const PRODUCTS = [
  {
    id: 1, sku: 'LV-001', name: 'Lunettes de vue classiques',
    category: 'eyeglasses', categoryLabel: 'Lunettes de vue',
    priceMga: 150000, stockQuantity: 48, inStock: true,
  },
  {
    id: 2, sku: 'SS-001', name: 'Lunettes de soleil UV',
    category: 'sunglasses', categoryLabel: 'Lunettes de soleil',
    priceMga: 200000, stockQuantity: 0, inStock: false,
  },
];

const ORDERS = [
  {
    id: 1,
    orderNumber: 'VC-ORD-2026-000001',
    patientName: 'Rakoto Andry',
    status: 'pending',
    statusLabel: 'En attente',
    totalMga: 150000,
    items: [{ productName: 'Lunettes de vue classiques', quantity: 1 }],
    createdAt: '2026-06-01T10:00:00',
  },
];

const USERS = [
  {
    id: 1,
    fullName: 'Dr. Marie Rakoto',
    email: 'docteur@vanclinic.mg',
    phone: '+261341234567',
    roles: ['ROLE_USER', 'ROLE_OPHTALMOLOGUE'],
    isActive: true,
    lastLoginAt: '2026-06-24T08:30:00',
    createdAt: '2026-01-01T00:00:00',
  },
  {
    id: 2,
    fullName: 'Hery Technicien',
    email: 'tech@vanclinic.mg',
    phone: '+261321111111',
    roles: ['ROLE_USER', 'ROLE_TECHNICIEN'],
    isActive: true,
    lastLoginAt: null,
    createdAt: '2026-01-01T00:00:00',
  },
];

const TELE = [
  {
    id: 1,
    patient: { fullName: 'Rakoto Andry' },
    requestedBy: { fullName: 'Hery Tech' },
    question: 'Patient présente une cataracte bilatérale avancée.',
    urgency: 'urgent',
    status: 'pending',
    createdAt: '2026-06-24T07:00:00',
  },
];

const MEDICAL_RECORDS = [
  {
    id: 1,
    visitReason: 'Contrôle annuel',
    status: 'actif',
    createdAt: '2026-05-01T10:00:00',
    ophthalmologist: { fullName: 'Dr. Marie Rakoto' },
    diagnosis: 'Myopie légère',
  },
];

function setupMocks() {
  mockApi.get.mockImplementation((url: string) => {
    if (url === '/admin/dashboard') return Promise.resolve({ data: STATS });
    if (url === '/admin/appointments') return Promise.resolve({ data: APPOINTMENTS });
    if (url === '/admin/patients') return Promise.resolve({ data: PATIENTS });
    if (url === '/products') return Promise.resolve({ data: PRODUCTS });
    if (url === '/admin/orders') return Promise.resolve({ data: ORDERS });
    if (url === '/admin/users') return Promise.resolve({ data: USERS });
    if (url === '/teleexpertise/pending') return Promise.resolve({ data: TELE });
    if (url.startsWith('/medical/records/patient/')) return Promise.resolve({ data: MEDICAL_RECORDS });
    return Promise.resolve({ data: [] });
  });
  mockApi.post.mockResolvedValue({ data: { message: 'ok' } });
  mockApi.patch.mockResolvedValue({ data: { message: 'ok' } });
}

// ── DashboardPage ──────────────────────────────────────────────
describe('DashboardPage', () => {
  beforeEach(() => { vi.clearAllMocks(); setupMocks(); });

  it('affiche le titre "Tableau de bord"', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
  });

  it('affiche le nombre de patients suivis depuis /admin/dashboard', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Patients suivis')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
    });
  });

  it('affiche les derniers rendez-vous depuis /admin/appointments', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getAllByText('Rakoto Andry').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('affiche les alertes de stock bas depuis /products', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Alertes stock')).toBeInTheDocument();
    });
  });

  it('affiche les dernières commandes depuis /admin/orders', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('VC-ORD-2026-000001')).toBeInTheDocument();
    });
  });
});

// ── PatientsPage ──────────────────────────────────────────────
describe('PatientsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); setupMocks(); });

  it('affiche le titre et le sous-titre avec le nombre de patients', async () => {
    render(<PatientsPage />);
    expect(screen.getByText('Gestion des patients')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('1 patients enregistrés')).toBeInTheDocument();
    });
  });

  it('affiche le patient depuis /admin/patients', async () => {
    render(<PatientsPage />);
    await waitFor(() => {
      expect(screen.getByText('Rakoto Andry')).toBeInTheDocument();
      expect(screen.getByText('PAT-001')).toBeInTheDocument();
    });
  });

  it('affiche le filtre de district et le bouton Nouveau patient', () => {
    render(<PatientsPage />);
    expect(screen.getByText(/Nouveau patient/)).toBeInTheDocument();
    expect(screen.getByText('Tous les districts')).toBeInTheDocument();
  });

  it('ouvre le modal de création de patient au clic', async () => {
    render(<PatientsPage />);
    fireEvent.click(screen.getByText(/Nouveau patient/));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Jean')).toBeInTheDocument();
    });
  });

  it('appelle POST /auth/register à la soumission du formulaire', async () => {
    render(<PatientsPage />);
    fireEvent.click(screen.getByText(/Nouveau patient/));
    await waitFor(() => screen.getByPlaceholderText('Jean'));
    fireEvent.click(screen.getByText('Enregistrer'));
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith(
        '/auth/register',
        expect.objectContaining({ preferredLanguage: 'fr' }),
      );
    });
  });
});

// ── AppointmentsPage ──────────────────────────────────────────
describe('AppointmentsPage', () => {
  afterEach(() => { vi.restoreAllMocks(); });
  beforeEach(() => { vi.clearAllMocks(); setupMocks(); });

  it('affiche le titre "Rendez-vous"', () => {
    render(<AppointmentsPage />);
    expect(screen.getByText('Rendez-vous')).toBeInTheDocument();
  });

  it('affiche le rendez-vous depuis /admin/appointments', async () => {
    render(<AppointmentsPage />);
    await waitFor(() => {
      expect(screen.getByText('Rakoto Andry')).toBeInTheDocument();
    });
  });

  it('affiche les compteurs de statuts', async () => {
    render(<AppointmentsPage />);
    await waitFor(() => {
      expect(screen.getByText('Planifiés')).toBeInTheDocument();
      expect(screen.getByText('Confirmés')).toBeInTheDocument();
      expect(screen.getByText('Terminés')).toBeInTheDocument();
      expect(screen.getByText('Annulés')).toBeInTheDocument();
    });
  });

  it('affiche le bouton Confirmer pour un RDV planifié', async () => {
    render(<AppointmentsPage />);
    await waitFor(() => {
      expect(screen.getByText('Confirmer')).toBeInTheDocument();
    });
  });

  it('appelle POST /appointments/{id}/confirm sur clic Confirmer', async () => {
    render(<AppointmentsPage />);
    await waitFor(() => screen.getByText('Confirmer'));
    fireEvent.click(screen.getByText('Confirmer'));
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/appointments/1/confirm');
    });
  });

  it('appelle POST /appointments/{id}/cancel après confirmation de la boîte de dialogue', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<AppointmentsPage />);
    await waitFor(() => screen.getByText('Annuler'));
    fireEvent.click(screen.getByText('Annuler'));
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith(
        '/appointments/1/cancel',
        expect.objectContaining({ reason: 'Annulé par le coordinateur' }),
      );
    });
  });
});

// ── MedicalPage ──────────────────────────────────────────────
describe('MedicalPage', () => {
  beforeEach(() => { vi.clearAllMocks(); setupMocks(); });

  it('affiche le titre "Dossiers médicaux"', () => {
    render(<MedicalPage />);
    expect(screen.getByText('Dossiers médicaux')).toBeInTheDocument();
  });

  it('affiche la liste des patients depuis /admin/patients', async () => {
    render(<MedicalPage />);
    await waitFor(() => {
      expect(screen.getByText('Rakoto Andry')).toBeInTheDocument();
      expect(screen.getByText('PAT-001 · Toamasina I')).toBeInTheDocument();
    });
  });

  it('charge les dossiers médicaux au clic sur un patient', async () => {
    render(<MedicalPage />);
    await waitFor(() => screen.getByText('Rakoto Andry'));
    fireEvent.click(screen.getByText('Rakoto Andry'));
    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalledWith('/medical/records/patient/1');
    });
  });

  it('affiche les dossiers médicaux après sélection du patient', async () => {
    render(<MedicalPage />);
    await waitFor(() => screen.getByText('Rakoto Andry'));
    fireEvent.click(screen.getByText('Rakoto Andry'));
    await waitFor(() => {
      expect(screen.getByText('Contrôle annuel')).toBeInTheDocument();
      expect(screen.getByText('Myopie légère')).toBeInTheDocument();
    });
  });
});

// ── TelemedicinePage ──────────────────────────────────────────
describe('TelemedicinePage', () => {
  beforeEach(() => { vi.clearAllMocks(); setupMocks(); });

  it('affiche le titre "Télémédecine"', () => {
    render(<TelemedicinePage />);
    expect(screen.getByText('Télémédecine')).toBeInTheDocument();
  });

  it('affiche les stats de demandes en attente', async () => {
    render(<TelemedicinePage />);
    await waitFor(() => {
      expect(screen.getByText('Demandes en attente')).toBeInTheDocument();
      expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('affiche la demande de téléexpertise depuis /teleexpertise/pending', async () => {
    render(<TelemedicinePage />);
    await waitFor(() => {
      expect(screen.getByText('Rakoto Andry')).toBeInTheDocument();
      expect(screen.getByText('Hery Tech')).toBeInTheDocument();
    });
  });

  it('ouvre le modal de réponse et appelle POST /teleexpertise/{id}/respond', async () => {
    render(<TelemedicinePage />);
    await waitFor(() => screen.getByText('Répondre'));
    fireEvent.click(screen.getByText('Répondre'));
    await waitFor(() => screen.getByText('Répondre à la demande'));
    fireEvent.click(screen.getByText('Envoyer la réponse'));
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith(
        '/teleexpertise/1/respond',
        expect.objectContaining({ response: '' }),
      );
    });
  });
});

// ── PlanningPage ──────────────────────────────────────────────
describe('PlanningPage', () => {
  beforeEach(() => { vi.clearAllMocks(); setupMocks(); });

  it('affiche le titre "Planning du Van mobile"', () => {
    render(<PlanningPage />);
    expect(screen.getByText('Planning du Van mobile')).toBeInTheDocument();
  });

  it('affiche les jours de la semaine', () => {
    render(<PlanningPage />);
    expect(screen.getByText('Lun')).toBeInTheDocument();
    expect(screen.getByText('Mar')).toBeInTheDocument();
    expect(screen.getByText('Ven')).toBeInTheDocument();
  });

  it('affiche tous les rendez-vous dans le tableau du bas', async () => {
    render(<PlanningPage />);
    await waitFor(() => {
      expect(screen.getByText('Rakoto Andry')).toBeInTheDocument();
    });
  });
});

// ── ShopPage ──────────────────────────────────────────────────
describe('ShopPage', () => {
  beforeEach(() => { vi.clearAllMocks(); setupMocks(); });

  it('affiche le titre "Gestion de la boutique"', () => {
    render(<ShopPage />);
    expect(screen.getByText('Gestion de la boutique')).toBeInTheDocument();
  });

  it('affiche les produits depuis /products', async () => {
    render(<ShopPage />);
    await waitFor(() => {
      expect(screen.getByText('Lunettes de vue classiques')).toBeInTheDocument();
      expect(screen.getByText('LV-001')).toBeInTheDocument();
    });
  });

  it('affiche les stats de stock et de rupture', async () => {
    render(<ShopPage />);
    await waitFor(() => {
      expect(screen.getByText('En stock')).toBeInTheDocument();
      expect(screen.getByText('Ruptures')).toBeInTheDocument();
    });
  });
});

// ── InventoryPage ──────────────────────────────────────────────
describe('InventoryPage', () => {
  beforeEach(() => { vi.clearAllMocks(); setupMocks(); });

  it('affiche le titre "Inventaire"', () => {
    render(<InventoryPage />);
    expect(screen.getByText('Inventaire')).toBeInTheDocument();
  });

  it('affiche la stat "Unités totales"', async () => {
    render(<InventoryPage />);
    await waitFor(() => {
      expect(screen.getByText('Unités totales')).toBeInTheDocument();
    });
  });

  it('affiche les produits avec référence et stock', async () => {
    render(<InventoryPage />);
    await waitFor(() => {
      expect(screen.getByText('Lunettes de vue classiques')).toBeInTheDocument();
      expect(screen.getByText('LV-001')).toBeInTheDocument();
      expect(screen.getAllByText('48').length).toBeGreaterThanOrEqual(1);
    });
  });
});

// ── OrdersPage ──────────────────────────────────────────────────
describe('OrdersPage', () => {
  beforeEach(() => { vi.clearAllMocks(); setupMocks(); });

  it('affiche le titre "Commandes"', () => {
    render(<OrdersPage />);
    expect(screen.getByText('Commandes')).toBeInTheDocument();
  });

  it('affiche la commande depuis /admin/orders', async () => {
    render(<OrdersPage />);
    await waitFor(() => {
      expect(screen.getByText('VC-ORD-2026-000001')).toBeInTheDocument();
      expect(screen.getByText('Rakoto Andry')).toBeInTheDocument();
    });
  });

  it('affiche le bouton "Traiter" pour une commande en attente', async () => {
    render(<OrdersPage />);
    await waitFor(() => {
      expect(screen.getByText('Traiter')).toBeInTheDocument();
    });
  });

  it('appelle PATCH /orders/{id}/status sur clic Traiter', async () => {
    render(<OrdersPage />);
    await waitFor(() => screen.getByText('Traiter'));
    fireEvent.click(screen.getByText('Traiter'));
    await waitFor(() => {
      expect(mockApi.patch).toHaveBeenCalledWith('/orders/1/status', { status: 'processing' });
    });
  });
});

// ── ReportsPage ──────────────────────────────────────────────────
describe('ReportsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); setupMocks(); });

  it('affiche le titre "Rapports"', () => {
    render(<ReportsPage />);
    expect(screen.getByText('Rapports')).toBeInTheDocument();
  });

  it('affiche les indicateurs clés depuis /admin/dashboard', async () => {
    render(<ReportsPage />);
    await waitFor(() => {
      expect(screen.getByText('Patients enregistrés')).toBeInTheDocument();
      expect(screen.getByText('Consultations terminées')).toBeInTheDocument();
    });
  });

  it('affiche le graphique des statuts de rendez-vous', async () => {
    render(<ReportsPage />);
    await waitFor(() => {
      expect(screen.getByText('Statuts des rendez-vous')).toBeInTheDocument();
    });
  });
});

// ── AnalyticsPage ──────────────────────────────────────────────────
describe('AnalyticsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); setupMocks(); });

  it('affiche le titre "Analytiques"', () => {
    render(<AnalyticsPage />);
    expect(screen.getByText('Analytiques')).toBeInTheDocument();
  });

  it('affiche le nombre total de patients depuis /admin/dashboard', async () => {
    render(<AnalyticsPage />);
    await waitFor(() => {
      expect(screen.getByText('Total patients')).toBeInTheDocument();
      expect(screen.getAllByText('45').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('affiche le revenu total et le stock par catégorie', async () => {
    render(<AnalyticsPage />);
    await waitFor(() => {
      expect(screen.getByText('Revenus total')).toBeInTheDocument();
      expect(screen.getByText('Stock par catégorie')).toBeInTheDocument();
    });
  });
});

// ── UsersPage ──────────────────────────────────────────────────────
describe('UsersPage', () => {
  beforeEach(() => { vi.clearAllMocks(); setupMocks(); });

  it('affiche le titre "Utilisateurs"', () => {
    render(<UsersPage />);
    expect(screen.getByText('Utilisateurs')).toBeInTheDocument();
  });

  it('affiche l\'utilisateur depuis /admin/users', async () => {
    render(<UsersPage />);
    await waitFor(() => {
      expect(screen.getByText('Dr. Marie Rakoto')).toBeInTheDocument();
      expect(screen.getByText('docteur@vanclinic.mg')).toBeInTheDocument();
    });
  });

  it('affiche le badge de rôle de l\'ophtalmologue', async () => {
    render(<UsersPage />);
    await waitFor(() => {
      expect(screen.getByText('Ophtalmologue')).toBeInTheDocument();
    });
  });

  it('ouvre le modal "Nouvel utilisateur" sur clic', async () => {
    render(<UsersPage />);
    fireEvent.click(screen.getByText(/Nouvel utilisateur/));
    await waitFor(() => {
      expect(screen.getByText('Créer le compte')).toBeInTheDocument();
    });
  });

  it('appelle POST /admin/users/staff à la soumission du formulaire', async () => {
    render(<UsersPage />);
    fireEvent.click(screen.getByText(/Nouvel utilisateur/));
    await waitFor(() => screen.getByText('Créer le compte'));
    fireEvent.click(screen.getByText('Créer le compte'));
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith(
        '/admin/users/staff',
        expect.objectContaining({ role: 'ROLE_AGENT_RELAIS' }),
      );
    });
  });
});

// ── LogsPage ──────────────────────────────────────────────────────
describe('LogsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); setupMocks(); });

  it('affiche le titre "Journaux système"', () => {
    render(<LogsPage />);
    expect(screen.getByText('Journaux système')).toBeInTheDocument();
  });

  it('affiche les logs de rendez-vous depuis /admin/appointments', async () => {
    render(<LogsPage />);
    await waitFor(() => {
      expect(screen.getByText('Rendez-vous créé')).toBeInTheDocument();
      expect(screen.getAllByText('Rakoto Andry').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('affiche les logs de commandes depuis /admin/orders', async () => {
    render(<LogsPage />);
    await waitFor(() => {
      expect(screen.getByText('Commande passée')).toBeInTheDocument();
    });
  });
});

// ── SettingsPage ──────────────────────────────────────────────────
describe('SettingsPage', () => {
  it('affiche le titre "Paramètres"', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Paramètres')).toBeInTheDocument();
  });

  it('affiche les intégrations de paiement disponibles', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Orange Money')).toBeInTheDocument();
    expect(screen.getByText('Telma Mvola')).toBeInTheDocument();
    expect(screen.getByText('Airtel Money')).toBeInTheDocument();
  });
});
