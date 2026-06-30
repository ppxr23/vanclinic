import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { api } from '@/lib/api';

export type UserRole = 'patient' | 'ophtalmologue' | 'coordinateur' | 'technicien' | 'agent';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export const ROLE_CONFIG: Record<UserRole, { label: string; color: string; description: string; redirect: string }> = {
  patient:       { label: 'Patient',        color: '#1a9b8e', description: 'Accès aux soins et rendez-vous', redirect: '/dashboard' },
  ophtalmologue: { label: 'Ophtalmologue',  color: '#1a9b8e', description: 'Consultations et dossiers médicaux', redirect: '/admin' },
  coordinateur:  { label: 'Coordinateur',   color: '#5cb85c', description: 'Gestion complète de la plateforme', redirect: '/admin' },
  technicien:    { label: 'Technicien',     color: '#f0821d', description: 'Boutique, inventaire et système', redirect: '/admin' },
  agent:         { label: 'Agent Relais',   color: '#8b5cf6', description: 'Support terrain et patients', redirect: '/admin' },
};

function symfonyRoleToAppRole(roles: string[]): UserRole {
  if (roles.includes('ROLE_OPHTALMOLOGUE')) return 'ophtalmologue';
  if (roles.includes('ROLE_COORDINATEUR'))  return 'coordinateur';
  if (roles.includes('ROLE_TECHNICIEN'))    return 'technicien';
  if (roles.includes('ROLE_AGENT_RELAIS'))  return 'agent';
  return 'patient';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vanclinic_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const { data: tokenData } = await api.post<{ token: string }>('/auth/login', { email, password });
      localStorage.setItem('vanclinic_token', tokenData.token);

      const { data: me } = await api.get<{
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        roles: string[];
      }>('/auth/me');

      const role = symfonyRoleToAppRole(me.roles);
      const u: User = {
        id: me.id,
        email: me.email,
        name: `${me.firstName} ${me.lastName}`,
        role,
        avatar: `${me.firstName[0]}${me.lastName[0]}`.toUpperCase(),
      };
      setUser(u);
      localStorage.setItem('vanclinic_user', JSON.stringify(u));
      return ROLE_CONFIG[role].redirect;
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('vanclinic_token');
    localStorage.removeItem('vanclinic_user');
  }, []);

  const isAdmin = useCallback(() => user?.role !== 'patient', [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
