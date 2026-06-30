import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../test/mocks';
import { mockNavigate } from '../test/mocks';
import { api } from '@/lib/api';
import Dashboard from './Dashboard';

const mockApi = api as unknown as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

const ME = { firstName: 'Jean', lastName: 'Dupont', email: 'jean@test.mg' };
const APPOINTMENTS = [
  { id: 1, scheduledAt: '2026-07-01T14:30:00', type: 'on_site', status: 'confirmed', reason: 'Consultation Ophtalmologie', location: 'VanClinic Toamasina', ophthalmologist: { firstName: 'Marie', lastName: 'Rakoto' } },
  { id: 2, scheduledAt: '2026-06-10T09:00:00', type: 'follow_up', status: 'completed', reason: 'Suivi post-opératoire' },
];

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.get.mockImplementation((url: string) => {
      if (url === '/auth/me') return Promise.resolve({ data: ME });
      if (url === '/appointments') return Promise.resolve({ data: APPOINTMENTS });
      return Promise.resolve({ data: [] });
    });
  });

  it('affiche le nom de l\'utilisateur depuis l\'API', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Jean Dupont');
    });
  });

  it('affiche les initiales "..." pendant le chargement', () => {
    mockApi.get.mockReturnValue(new Promise(() => {}));
    render(<Dashboard />);
    const allDots = screen.getAllByText('...');
    expect(allDots.length).toBeGreaterThanOrEqual(1);
  });

  it('affiche le prochain rendez-vous depuis l\'API', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByTestId('next-appointment')).toBeInTheDocument();
    });
    const card = screen.getByTestId('next-appointment');
    expect(within(card).getByText('Consultation Ophtalmologie')).toBeInTheDocument();
  });

  it('affiche "aucun rendez-vous" quand la liste est vide', async () => {
    mockApi.get.mockImplementation((url: string) => {
      if (url === '/auth/me') return Promise.resolve({ data: ME });
      if (url === '/appointments') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByTestId('no-appointment')).toBeInTheDocument();
    });
  });

  it('affiche le compte de rendez-vous à venir dans les stats', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Jean Dupont');
    });
    const ones = screen.getAllByText('1');
    expect(ones.length).toBeGreaterThanOrEqual(1);
  });

  it('affiche l\'activité récente avec les rendez-vous passés', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Suivi post-opératoire')).toBeInTheDocument();
    });
  });

  it('navigue vers /appointments depuis le bouton Modifier', async () => {
    render(<Dashboard />);
    await waitFor(() => screen.getByTestId('next-appointment'));
    const btns = screen.getAllByText('dashboard.modify');
    fireEvent.click(btns[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/appointments');
  });

  it('navigue vers /appointments via l\'action rapide', async () => {
    render(<Dashboard />);
    await waitFor(() => screen.getByTestId('user-name'));
    fireEvent.click(screen.getByText('dashboard.newAppointment'));
    expect(mockNavigate).toHaveBeenCalledWith('/appointments');
  });

  it('navigue vers /medical-record via l\'action rapide', async () => {
    render(<Dashboard />);
    await waitFor(() => screen.getByTestId('user-name'));
    fireEvent.click(screen.getByText('dashboard.myRecord'));
    expect(mockNavigate).toHaveBeenCalledWith('/medical-record');
  });

  it('navigue vers /shop via l\'action rapide', async () => {
    render(<Dashboard />);
    await waitFor(() => screen.getByTestId('user-name'));
    fireEvent.click(screen.getByText('dashboard.shop'));
    expect(mockNavigate).toHaveBeenCalledWith('/shop');
  });

  it('gère l\'erreur API sans planter', async () => {
    mockApi.get.mockRejectedValue(new Error('Network error'));
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByTestId('no-appointment')).toBeInTheDocument();
    });
  });
});
