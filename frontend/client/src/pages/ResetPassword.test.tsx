import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../test/mocks';
import { mockNavigate } from '../test/mocks';
import { api } from '@/lib/api';
import ResetPassword from './ResetPassword';

const mockApi = api as unknown as { post: ReturnType<typeof vi.fn> };

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.post.mockResolvedValue({ data: { message: 'ok' } });
  });

  it('affiche le champ email à l\'étape initiale', () => {
    render(<ResetPassword />);
    expect(screen.getByPlaceholderText('vous@example.com')).toBeInTheDocument();
    expect(screen.getByText('resetPassword.sendCode')).toBeInTheDocument();
  });

  it('le bouton est désactivé si l\'email est vide', () => {
    render(<ResetPassword />);
    const btn = screen.getByText('resetPassword.sendCode');
    expect(btn).toBeDisabled();
  });

  it('le bouton s\'active quand l\'email est rempli', () => {
    render(<ResetPassword />);
    fireEvent.change(screen.getByPlaceholderText('vous@example.com'), { target: { value: 'test@test.mg' } });
    expect(screen.getByText('resetPassword.sendCode')).not.toBeDisabled();
  });

  it('appelle POST /auth/forgot-password avec l\'email', async () => {
    render(<ResetPassword />);
    fireEvent.change(screen.getByPlaceholderText('vous@example.com'), { target: { value: 'user@test.mg' } });
    fireEvent.click(screen.getByText('resetPassword.sendCode'));
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/auth/forgot-password', { identifier: 'user@test.mg' });
    });
  });

  it('passe à l\'étape token après envoi de l\'email', async () => {
    render(<ResetPassword />);
    fireEvent.change(screen.getByPlaceholderText('vous@example.com'), { target: { value: 'user@test.mg' } });
    fireEvent.click(screen.getByText('resetPassword.sendCode'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Collez le token reçu par email')).toBeInTheDocument();
    });
  });

  it('affiche une erreur si le réseau échoue sur envoi email', async () => {
    mockApi.post.mockRejectedValue(new Error('Network error'));
    render(<ResetPassword />);
    fireEvent.change(screen.getByPlaceholderText('vous@example.com'), { target: { value: 'user@test.mg' } });
    fireEvent.click(screen.getByText('resetPassword.sendCode'));
    await waitFor(() => {
      expect(screen.getByText(/Erreur lors de l'envoi/)).toBeInTheDocument();
    });
  });

  it('passe à l\'étape nouveau mot de passe après saisie du token', async () => {
    render(<ResetPassword />);
    fireEvent.change(screen.getByPlaceholderText('vous@example.com'), { target: { value: 'user@test.mg' } });
    fireEvent.click(screen.getByText('resetPassword.sendCode'));
    await waitFor(() => screen.getByPlaceholderText('Collez le token reçu par email'));
    const fakeToken = 'a'.repeat(64);
    fireEvent.change(screen.getByPlaceholderText('Collez le token reçu par email'), { target: { value: fakeToken } });
    fireEvent.click(screen.getByText('resetPassword.verifyCode'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
      expect(screen.getByText('resetPassword.reset')).toBeInTheDocument();
    });
  });

  it('appelle POST /auth/reset-password avec token et nouveau mot de passe', async () => {
    render(<ResetPassword />);
    fireEvent.change(screen.getByPlaceholderText('vous@example.com'), { target: { value: 'user@test.mg' } });
    fireEvent.click(screen.getByText('resetPassword.sendCode'));
    await waitFor(() => screen.getByPlaceholderText('Collez le token reçu par email'));
    const fakeToken = 'b'.repeat(64);
    fireEvent.change(screen.getByPlaceholderText('Collez le token reçu par email'), { target: { value: fakeToken } });
    fireEvent.click(screen.getByText('resetPassword.verifyCode'));
    await waitFor(() => screen.getByPlaceholderText('••••••••'));
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'NouveauMdp2025!' } });
    fireEvent.click(screen.getByText('resetPassword.reset'));
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: fakeToken,
        newPassword: 'NouveauMdp2025!',
      });
    });
  });

  it('affiche l\'écran de succès après réinitialisation réussie', async () => {
    render(<ResetPassword />);
    fireEvent.change(screen.getByPlaceholderText('vous@example.com'), { target: { value: 'user@test.mg' } });
    fireEvent.click(screen.getByText('resetPassword.sendCode'));
    await waitFor(() => screen.getByPlaceholderText('Collez le token reçu par email'));
    fireEvent.change(screen.getByPlaceholderText('Collez le token reçu par email'), { target: { value: 'c'.repeat(64) } });
    fireEvent.click(screen.getByText('resetPassword.verifyCode'));
    await waitFor(() => screen.getByPlaceholderText('••••••••'));
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'NouveauMdp2025!' } });
    fireEvent.click(screen.getByText('resetPassword.reset'));
    await waitFor(() => {
      expect(screen.getByText('resetPassword.success')).toBeInTheDocument();
    });
  });

  it('affiche une erreur si le token est invalide', async () => {
    render(<ResetPassword />);
    fireEvent.change(screen.getByPlaceholderText('vous@example.com'), { target: { value: 'user@test.mg' } });
    fireEvent.click(screen.getByText('resetPassword.sendCode'));
    await waitFor(() => screen.getByPlaceholderText('Collez le token reçu par email'));
    fireEvent.change(screen.getByPlaceholderText('Collez le token reçu par email'), { target: { value: 'd'.repeat(64) } });
    fireEvent.click(screen.getByText('resetPassword.verifyCode'));
    await waitFor(() => screen.getByPlaceholderText('••••••••'));
    mockApi.post.mockRejectedValueOnce({ response: { data: { error: 'Token invalide ou expiré.' } } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'NouveauMdp2025!' } });
    fireEvent.click(screen.getByText('resetPassword.reset'));
    await waitFor(() => {
      expect(screen.getByText('Token invalide ou expiré.')).toBeInTheDocument();
    });
  });

  it('le bouton reset est désactivé si le mot de passe est trop court', async () => {
    render(<ResetPassword />);
    fireEvent.change(screen.getByPlaceholderText('vous@example.com'), { target: { value: 'user@test.mg' } });
    fireEvent.click(screen.getByText('resetPassword.sendCode'));
    await waitFor(() => screen.getByPlaceholderText('Collez le token reçu par email'));
    fireEvent.change(screen.getByPlaceholderText('Collez le token reçu par email'), { target: { value: 'e'.repeat(64) } });
    fireEvent.click(screen.getByText('resetPassword.verifyCode'));
    await waitFor(() => screen.getByPlaceholderText('••••••••'));
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'court' } });
    expect(screen.getByText('resetPassword.reset')).toBeDisabled();
  });

  it('le bouton Retour navigation entre étapes', async () => {
    render(<ResetPassword />);
    fireEvent.change(screen.getByPlaceholderText('vous@example.com'), { target: { value: 'user@test.mg' } });
    fireEvent.click(screen.getByText('resetPassword.sendCode'));
    await waitFor(() => screen.getByPlaceholderText('Collez le token reçu par email'));
    const backBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(backBtn);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('vous@example.com')).toBeInTheDocument();
    });
  });

  it('le bouton succès redirige vers /login', async () => {
    render(<ResetPassword />);
    fireEvent.change(screen.getByPlaceholderText('vous@example.com'), { target: { value: 'u@test.mg' } });
    fireEvent.click(screen.getByText('resetPassword.sendCode'));
    await waitFor(() => screen.getByPlaceholderText('Collez le token reçu par email'));
    fireEvent.change(screen.getByPlaceholderText('Collez le token reçu par email'), { target: { value: 'f'.repeat(64) } });
    fireEvent.click(screen.getByText('resetPassword.verifyCode'));
    await waitFor(() => screen.getByPlaceholderText('••••••••'));
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'NouveauMdp2025!' } });
    fireEvent.click(screen.getByText('resetPassword.reset'));
    await waitFor(() => screen.getByText('resetPassword.backToLogin'));
    fireEvent.click(screen.getByText('resetPassword.backToLogin'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
