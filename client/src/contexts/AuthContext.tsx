import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'patient' | 'ophtalmologue' | 'coordinateur' | 'technicien' | 'agent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

// Comptes de démonstration — un par rôle
export const DEMO_ACCOUNTS: Record<string, User & { password: string }> = {
  'patient@vanclinic.mg': {
    id: 'U001', name: 'Jean Dupont', email: 'patient@vanclinic.mg',
    role: 'patient', avatar: 'JD', password: 'patient123',
  },
  'docteur@vanclinic.mg': {
    id: 'U002', name: 'Dr. Marie Rakoto', email: 'docteur@vanclinic.mg',
    role: 'ophtalmologue', avatar: 'MR', password: 'docteur123',
  },
  'coordinateur@vanclinic.mg': {
    id: 'U003', name: 'Rabe Coordinateur', email: 'coordinateur@vanclinic.mg',
    role: 'coordinateur', avatar: 'RC', password: 'coord123',
  },
  'technicien@vanclinic.mg': {
    id: 'U004', name: 'Hery Technicien', email: 'technicien@vanclinic.mg',
    role: 'technicien', avatar: 'HT', password: 'tech123',
  },
  'agent@vanclinic.mg': {
    id: 'U005', name: 'Vola Agent', email: 'agent@vanclinic.mg',
    role: 'agent', avatar: 'VA', password: 'agent123',
  },
};

export const ROLE_CONFIG: Record<UserRole, { label: string; color: string; description: string; redirect: string }> = {
  patient:       { label: 'Patient',        color: '#1a9b8e', description: 'Accès aux soins et rendez-vous', redirect: '/dashboard' },
  ophtalmologue: { label: 'Ophtalmologue',  color: '#1a9b8e', description: 'Consultations et dossiers médicaux', redirect: '/admin' },
  coordinateur:  { label: 'Coordinateur',   color: '#5cb85c', description: 'Gestion complète de la plateforme', redirect: '/admin' },
  technicien:    { label: 'Technicien',      color: '#f0821d', description: 'Boutique, inventaire et système', redirect: '/admin' },
  agent:         { label: 'Agent Relais',    color: '#8b5cf6', description: 'Support terrain et patients', redirect: '/admin' },
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vanclinic_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, password: string): boolean => {
    const account = DEMO_ACCOUNTS[email.toLowerCase()];
    if (account && account.password === password) {
      const { password: _, ...userWithoutPw } = account;
      setUser(userWithoutPw);
      localStorage.setItem('vanclinic_user', JSON.stringify(userWithoutPw));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vanclinic_user');
  };

  const isAdmin = () => user?.role !== 'patient';

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
