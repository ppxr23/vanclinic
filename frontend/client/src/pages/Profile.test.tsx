import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../test/mocks';
import { mockNavigate, mockLogout } from '../test/mocks';
import { api } from '@/lib/api';
import Profile from './Profile';

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
};

const ME_DATA = {
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean@test.mg',
  phone: '+261320000000',
  birthDate: '1990-05-15',
};

describe('Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.get.mockResolvedValue({ data: ME_DATA });
    mockApi.put.mockResolvedValue({ data: { message: 'ok' } });
  });

  it('affiche le nom de l\'utilisateur après chargement', async () => {
    render(<Profile />);
    await waitFor(() => {
      expect(screen.getByTestId('profile-name')).toHaveTextContent('Jean Dupont');
    });
  });

  it('affiche l\'email après chargement', async () => {
    render(<Profile />);
    await waitFor(() => {
      const emails = screen.getAllByText('jean@test.mg');
      expect(emails.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('affiche le titre de la page', () => {
    render(<Profile />);
    expect(screen.getByText('profile.title')).toBeInTheDocument();
  });

  it('active le mode édition sur clic Modifier', async () => {
    render(<Profile />);
    await waitFor(() => screen.getByTestId('profile-name'));
    fireEvent.click(screen.getByText('profile.edit'));
    expect(screen.getByText('profile.save')).toBeInTheDocument();
  });

  it('appelle PUT /patients/me sur sauvegarde', async () => {
    render(<Profile />);
    await waitFor(() => screen.getByTestId('profile-name'));
    fireEvent.click(screen.getByText('profile.edit'));
    await waitFor(() => screen.getByText('profile.save'));
    fireEvent.click(screen.getByText('profile.save'));
    await waitFor(() => {
      expect(mockApi.put).toHaveBeenCalledWith('/patients/me', expect.objectContaining({
        firstName: 'Jean',
        lastName: 'Dupont',
      }));
    });
  });

  it('affiche le message de succès après sauvegarde', async () => {
    render(<Profile />);
    await waitFor(() => screen.getByTestId('profile-name'));
    fireEvent.click(screen.getByText('profile.edit'));
    await waitFor(() => screen.getByText('profile.save'));
    fireEvent.click(screen.getByText('profile.save'));
    await waitFor(() => {
      expect(screen.getByText(/profile\.saveSuccess|Profil mis à jour/)).toBeInTheDocument();
    });
  });

  it('affiche une erreur si la sauvegarde échoue', async () => {
    mockApi.put.mockRejectedValue({ response: { data: { error: 'Erreur serveur.' } } });
    render(<Profile />);
    await waitFor(() => screen.getByTestId('profile-name'));
    fireEvent.click(screen.getByText('profile.edit'));
    await waitFor(() => screen.getByText('profile.save'));
    fireEvent.click(screen.getByText('profile.save'));
    await waitFor(() => {
      expect(screen.getByText('Erreur serveur.')).toBeInTheDocument();
    });
  });

  it('annule l\'édition et revient à la vue', async () => {
    render(<Profile />);
    await waitFor(() => screen.getByTestId('profile-name'));
    fireEvent.click(screen.getByText('profile.edit'));
    await waitFor(() => screen.getByText('profile.cancel'));
    fireEvent.click(screen.getByText('profile.cancel'));
    expect(screen.getByText('profile.edit')).toBeInTheDocument();
  });

  it('bascule la langue via les boutons', async () => {
    render(<Profile />);
    await waitFor(() => screen.getByTestId('profile-name'));
    expect(screen.getByText('profile.french')).toBeInTheDocument();
    expect(screen.getByText('profile.malagasy')).toBeInTheDocument();
  });

  it('affiche les boutons de notifications', async () => {
    render(<Profile />);
    await waitFor(() => screen.getByTestId('profile-name'));
    expect(screen.getByLabelText('toggle-appointments')).toBeInTheDocument();
    expect(screen.getByLabelText('toggle-reminders')).toBeInTheDocument();
  });

  it('appelle logout() et navigue vers /login', async () => {
    render(<Profile />);
    await waitFor(() => screen.getByTestId('profile-name'));
    fireEvent.click(screen.getAllByText('profile.logout')[0]);
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
