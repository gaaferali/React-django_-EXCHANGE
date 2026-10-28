import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import api, { tokenStore } from '../api/apiService';
import type { User } from '../types';

interface AuthValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; password_confirm: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<User>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      if (!tokenStore.access() && !tokenStore.refresh()) {
        setLoading(false);
        return;
      }
      try {
        setUser(await api.profile());
      } catch {
        tokenStore.clear();
      } finally {
        setLoading(false);
      }
    };
    void initialize();
    const expire = () => setUser(null);
    window.addEventListener('auth:expired', expire);
    return () => window.removeEventListener('auth:expired', expire);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    tokenStore.set(response.access, response.refresh);
    setUser(response.user);
  };

  const register = async (payload: { name: string; email: string; password: string; password_confirm: string }) => {
    const response = await api.register(payload);
    tokenStore.set(response.access, response.refresh);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    const profile = await api.profile();
    setUser(profile);
    return profile;
  };

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, register, logout, refreshProfile }),
    [user, loading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
