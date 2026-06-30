import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../test/mocks';
import { mockNavigate } from '../test/mocks';
import { api } from '@/lib/api';
import Appointments from './Appointments';

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

const UPCOMING = [
  { id: 1, scheduledAt: '2026-07-10T14:30:00', type: 'on_site', status: 'confirmed', reason: 'Consultation Ophtalmologie', location: 'VanClinic Toamasina', ophthalmologist: { firstName: 'Marie', lastName: 'Rakoto' } },
];

const goToType = async () => {
  await waitFor(() => screen.getByTestId('appointment-card'));
  fireEvent.click(screen.getByText(/appointments\.newAppointment/));
  await waitFor(() => screen.getByText('appointments.appointmentType'));
};

const goToDate = async () => {
  await goToType();
  fireEvent.click(screen.getByText('appointments.generalConsultation'));
  fireEvent.click(screen.getByText('appointments.continue'));
  await waitFor(() => screen.getByText('appointments.chooseDate'));
};

const goToTime = async () => {
  await goToDate();
  const dateBtns = screen.getAllByRole('button').filter(b => /^(lun|mar|mer|jeu|ven|sam|dim)/i.test(b.textContent ?? ''));
  fireEvent.click(dateBtns[0]);
  fireEvent.click(screen.getByText('appointments.continue'));
  await waitFor(() => screen.getByText('appointments.chooseTime'));
};

const goToConfirm = async () => {
  await goToTime();
  fireEvent.click(screen.getByText('09:00'));
  fireEvent.click(screen.getByText('appointments.continue'));
  await waitFor(() => screen.getByText('appointments.confirmation'));
};

describe('Appointments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.get.mockResolvedValue({ data: UPCOMING });
    mockApi.post.mockResolvedValue({ data: { appointment: { id: 42 } } });
  });

  it('affiche la liste des rendez-vous depuis l\'API', async () => {
    render(<Appointments />);
    await waitFor(() => {
      expect(screen.getByTestId('appointment-card')).toBeInTheDocument();
      expect(screen.getByText('Consultation Ophtalmologie')).toBeInTheDocument();
    });
  });

  it('affiche "aucun rendez-vous" quand la liste est vide', async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    render(<Appointments />);
    await waitFor(() => {
      expect(screen.getByTestId('empty-appointments')).toBeInTheDocument();
    });
  });

  it('passe à l\'étape type sur clic Nouveau rendez-vous', async () => {
    render(<Appointments />);
    await waitFor(() => screen.getByTestId('appointment-card'));
    fireEvent.click(screen.getByText(/appointments\.newAppointment/));
    await waitFor(() => {
      expect(screen.getByText('appointments.appointmentType')).toBeInTheDocument();
    });
  });

  it('le bouton Continuer est désactivé sans sélection de type', async () => {
    render(<Appointments />);
    await goToType();
    expect(screen.getByText('appointments.continue')).toBeDisabled();
  });

  it('active Continuer après sélection du type', async () => {
    render(<Appointments />);
    await goToType();
    fireEvent.click(screen.getByText('appointments.generalConsultation'));
    expect(screen.getByText('appointments.continue')).not.toBeDisabled();
  });

  it('navigue type → date → heure → confirmation', async () => {
    render(<Appointments />);
    await goToConfirm();
    expect(screen.getByText('appointments.confirmation')).toBeInTheDocument();
  });

  it('appelle POST /appointments sur confirmation', async () => {
    render(<Appointments />);
    await goToConfirm();
    fireEvent.click(screen.getByText('appointments.confirm'));
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/appointments', expect.objectContaining({
        type: 'on_site',
        location: 'VanClinic mobile — Toamasina',
      }));
    });
  });

  it('affiche le numéro de confirmation depuis l\'API', async () => {
    render(<Appointments />);
    await goToConfirm();
    fireEvent.click(screen.getByText('appointments.confirm'));
    await waitFor(() => {
      expect(screen.getByTestId('confirmation-number')).toHaveTextContent('#RDV-42');
    });
  });

  it('affiche une erreur si le POST /appointments échoue', async () => {
    mockApi.post.mockRejectedValue({ response: { data: { error: 'Créneau non disponible.' } } });
    render(<Appointments />);
    await goToConfirm();
    fireEvent.click(screen.getByText('appointments.confirm'));
    await waitFor(() => {
      expect(screen.getByText('Créneau non disponible.')).toBeInTheDocument();
    });
  });

  it('le bouton Retour revient à la liste', async () => {
    render(<Appointments />);
    await goToType();
    fireEvent.click(screen.getByRole('button', { name: '' }));
    await waitFor(() => {
      expect(screen.getByText('appointments.title')).toBeInTheDocument();
    });
  });

  it('le bouton succès navigue vers /dashboard', async () => {
    render(<Appointments />);
    await goToConfirm();
    fireEvent.click(screen.getByText('appointments.confirm'));
    await waitFor(() => screen.getByText('appointments.backToDashboard'));
    fireEvent.click(screen.getByText('appointments.backToDashboard'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
