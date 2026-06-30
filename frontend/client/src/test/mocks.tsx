import { vi } from 'vitest';
import type { ReactNode } from 'react';

export const mockNavigate = vi.fn();
export const mockLogin = vi.fn();
export const mockLogout = vi.fn();

vi.mock('wouter', () => ({
  useLocation: () => ['/', mockNavigate],
  Route: ({ children }: { children: ReactNode }) => <>{children}</>,
  Switch: ({ children }: { children: ReactNode }) => <>{children}</>,
  Link: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, login: mockLogin, logout: mockLogout, isAdmin: () => false }),
  ROLE_CONFIG: {
    patient:       { label: 'Patient',       color: '#1a9b8e', description: '', redirect: '/dashboard' },
    ophtalmologue: { label: 'Ophtalmologue', color: '#1a9b8e', description: '', redirect: '/admin' },
    coordinateur:  { label: 'Coordinateur',  color: '#5cb85c', description: '', redirect: '/admin' },
    technicien:    { label: 'Technicien',    color: '#f0821d', description: '', redirect: '/admin' },
    agent:         { label: 'Agent Relais',  color: '#8b5cf6', description: '', redirect: '/admin' },
  },
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'fr',
    setLanguage: vi.fn(),
  }),
  LanguageProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/LanguageToggle', () => ({
  default: () => <div data-testid="lang-toggle" />,
}));

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock('@/components/BottomNav', () => ({
  default: () => <nav data-testid="bottom-nav" />,
}));
