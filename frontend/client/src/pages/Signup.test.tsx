import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../test/mocks';
import { mockNavigate, mockLogin } from '../test/mocks';
import { api } from '@/lib/api';
import Signup from './Signup';

const mockApi = api as unknown as { post: ReturnType<typeof vi.fn> };

const REGISTER_RESPONSE = {
  data: {
    token: 'jwt-token-abc',
    user: { id: 1, email: 'jean@test.mg', firstName: 'Jean', lastName: 'Dupont', roles: ['ROLE_PATIENT'] },
    patient: { patientNumber: 'PAT-2025-001' },
  },
};

describe('Signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue(true);
    mockApi.post.mockResolvedValue(REGISTER_RESPONSE);
    Storage.prototype.setItem = vi.fn();
  });

  const fillStep1 = () => {
    fireEvent.change(screen.getByPlaceholderText('Jean'), { target: { value: 'Jean' } });
    fireEvent.change(screen.getByPlaceholderText('Dupont'), { target: { value: 'Dupont' } });
    const dateInput = screen.getByDisplayValue('');
    fireEvent.change(dateInput, { target: { value: '1990-01-15' } });
  };

  const fillStep2 = () => {
    fireEvent.change(screen.getByPlaceholderText('vous@example.com'), { target: { value: 'jean@test.mg' } });
    fireEvent.change(screen.getByPlaceholderText('+261 32 XX XX XX'), { target: { value: '+261320000000' } });
    fireEvent.change(screen.getByPlaceholderText('Antananarivo'), { target: { value: 'Antananarivo' } });
  };

  const fillStep3 = () => {
    const pws = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(pws[0], { target: { value: 'Secure2025!' } });
    fireEvent.change(pws[1], { target: { value: 'Secure2025!' } });
  };

  it('affiche le formulaire à l\'étape 1', () => {
    render(<Signup />);
    expect(screen.getByPlaceholderText('Jean')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Dupont')).toBeInTheDocument();
  });

  it('affiche une erreur si étape 1 vide', async () => {
    render(<Signup />);
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => {
      expect(screen.getByText(/signup\.firstName.*login\.required/)).toBeInTheDocument();
    });
  });

  it('passe à l\'étape 2 après validation étape 1', async () => {
    render(<Signup />);
    fillStep1();
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('vous@example.com')).toBeInTheDocument();
    });
  });

  it('valide le format email à l\'étape 2', async () => {
    render(<Signup />);
    fillStep1();
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => screen.getByPlaceholderText('vous@example.com'));
    fireEvent.change(screen.getByPlaceholderText('vous@example.com'), { target: { value: 'emailinvalide' } });
    fireEvent.change(screen.getByPlaceholderText('+261 32 XX XX XX'), { target: { value: '0320000000' } });
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => {
      expect(screen.getByText('Email invalide')).toBeInTheDocument();
    });
  });

  it('passe à l\'étape 3 après validation étape 2', async () => {
    render(<Signup />);
    fillStep1();
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => screen.getByPlaceholderText('vous@example.com'));
    fillStep2();
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => {
      expect(screen.getAllByPlaceholderText('••••••••').length).toBe(2);
    });
  });

  it('vérifie la longueur minimale du mot de passe', async () => {
    render(<Signup />);
    fillStep1();
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => screen.getByPlaceholderText('vous@example.com'));
    fillStep2();
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => screen.getAllByPlaceholderText('••••••••'));
    fireEvent.change(screen.getAllByPlaceholderText('••••••••')[0], { target: { value: 'court' } });
    fireEvent.change(screen.getAllByPlaceholderText('••••••••')[1], { target: { value: 'court' } });
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => {
      expect(screen.getAllByText('signup.minChars').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('vérifie que les mots de passe correspondent', async () => {
    render(<Signup />);
    fillStep1();
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => screen.getByPlaceholderText('vous@example.com'));
    fillStep2();
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => screen.getAllByPlaceholderText('••••••••'));
    const pws = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(pws[0], { target: { value: 'Secure2025!' } });
    fireEvent.change(pws[1], { target: { value: 'Autre2025!' } });
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => {
      expect(screen.getByText('signup.passwordMismatch')).toBeInTheDocument();
    });
  });

  it('appelle POST /auth/register avec les bonnes données', async () => {
    render(<Signup />);
    fillStep1();
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => screen.getByPlaceholderText('vous@example.com'));
    fillStep2();
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => screen.getAllByPlaceholderText('••••••••'));
    fillStep3();
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@test.mg',
        phone: '+261320000000',
        password: 'Secure2025!',
      }));
    });
  });

  it('affiche l\'écran de succès avec le numéro patient', async () => {
    render(<Signup />);
    fillStep1();
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => screen.getByPlaceholderText('vous@example.com'));
    fillStep2();
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => screen.getAllByPlaceholderText('••••••••'));
    fillStep3();
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => {
      expect(screen.getByText('PAT-2025-001')).toBeInTheDocument();
      expect(screen.getByText('signup.success')).toBeInTheDocument();
    });
  });

  it('affiche l\'erreur serveur en cas d\'email déjà utilisé', async () => {
    mockApi.post.mockRejectedValue({
      response: { data: { error: 'Cet email est déjà utilisé.' } },
    });
    render(<Signup />);
    fillStep1();
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => screen.getByPlaceholderText('vous@example.com'));
    fillStep2();
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => screen.getAllByPlaceholderText('••••••••'));
    fillStep3();
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => {
      expect(screen.getByText('Cet email est déjà utilisé.')).toBeInTheDocument();
    });
  });

  it('le bouton Annuler redirige vers /login depuis l\'étape 1', () => {
    render(<Signup />);
    fireEvent.click(screen.getByText('signup.cancel'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('le bouton Retour revient à l\'étape précédente', async () => {
    render(<Signup />);
    fillStep1();
    fireEvent.click(screen.getByText('signup.next'));
    await waitFor(() => screen.getByPlaceholderText('vous@example.com'));
    fireEvent.click(screen.getByText('signup.back'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Jean')).toBeInTheDocument();
    });
  });
});
