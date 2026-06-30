import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../test/mocks';
import { mockNavigate, mockLogin } from '../test/mocks';
import Login from './Login';

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLogin = () => render(<Login />);

  it('affiche le champ email et le champ mot de passe', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('vous@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('affiche le toggle email/téléphone', () => {
    renderLogin();
    const buttons = screen.getAllByText('login.email');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('login.phone')).toBeInTheDocument();
  });

  it('affiche une erreur si les champs sont vides à la soumission', async () => {
    renderLogin();
    fireEvent.click(screen.getByText('login.signIn'));
    await waitFor(() => {
      const errors = screen.getAllByText(/login\.required/);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('appelle login() avec email et mot de passe', async () => {
    mockLogin.mockResolvedValue('/dashboard');
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('vous@example.com'), { target: { value: 'test@test.mg' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'monmotdepasse' } });
    fireEvent.click(screen.getByText('login.signIn'));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.mg', 'monmotdepasse');
    });
  });

  it('redirige vers /dashboard après connexion d\'un patient', async () => {
    mockLogin.mockResolvedValue('/dashboard');
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('vous@example.com'), { target: { value: 'patient@test.mg' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('login.signIn'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('redirige vers /admin après connexion d\'un admin', async () => {
    mockLogin.mockResolvedValue('/admin');
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('vous@example.com'), { target: { value: 'docteur@vanclinic.mg' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'Vanclinic2025!' } });
    fireEvent.click(screen.getByText('login.signIn'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('affiche une erreur après échec de connexion', async () => {
    mockLogin.mockResolvedValue(null);
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('vous@example.com'), { target: { value: 'bad@test.mg' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByText('login.signIn'));
    await waitFor(() => {
      expect(screen.getByText('Email ou mot de passe incorrect')).toBeInTheDocument();
    });
  });

  it('désactive le bouton pendant le chargement', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('/dashboard'), 500)));
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('vous@example.com'), { target: { value: 'test@test.mg' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('login.signIn'));
    await waitFor(() => {
      expect(screen.getByText('Connexion...')).toBeDisabled();
    });
  });

  it('bascule en mode téléphone et change le placeholder', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /login\.phone/ }));
    expect(screen.getByPlaceholderText('+261 32 XX XX XX')).toBeInTheDocument();
  });

  it('affiche/masque le mot de passe', () => {
    renderLogin();
    const pwInput = screen.getByPlaceholderText('••••••••');
    expect(pwInput).toHaveAttribute('type', 'password');
    const toggleBtn = pwInput.parentElement!.querySelector('button')!;
    fireEvent.click(toggleBtn);
    expect(pwInput).toHaveAttribute('type', 'text');
  });

  it('affiche les comptes démo en cliquant sur le bouton', () => {
    renderLogin();
    fireEvent.click(screen.getByText(/Comptes de démonstration/));
    expect(screen.getByText('Dr. Marie Rakoto')).toBeInTheDocument();
    expect(screen.getByText('Rabe Coordinateur')).toBeInTheDocument();
  });

  it('connecte automatiquement via un compte démo et redirige vers /admin', async () => {
    mockLogin.mockResolvedValue('/admin');
    renderLogin();
    fireEvent.click(screen.getByText(/Comptes de démonstration/));
    fireEvent.click(screen.getByText('Dr. Marie Rakoto'));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('docteur@vanclinic.mg', 'Vanclinic2025!');
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });
});
