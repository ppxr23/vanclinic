import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../test/mocks';
import { mockNavigate } from '../test/mocks';
import Splash from './Splash';

describe('Splash', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('affiche le logo VanClinic', () => {
    render(<Splash />);
    const logo = screen.getByAltText('VanClinic');
    expect(logo).toBeInTheDocument();
  });

  it('affiche les points de chargement animés', () => {
    const { container } = render(<Splash />);
    const dots = container.querySelectorAll('.animate-bounce');
    expect(dots.length).toBe(3);
  });

  it('redirige vers /login après 3 secondes', async () => {
    render(<Splash />);
    expect(mockNavigate).not.toHaveBeenCalled();
    await act(async () => { vi.advanceTimersByTime(3000); });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('ne redirige pas avant 3 secondes', async () => {
    render(<Splash />);
    await act(async () => { vi.advanceTimersByTime(2999); });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('annule le timer au démontage', async () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const { unmount } = render(<Splash />);
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
