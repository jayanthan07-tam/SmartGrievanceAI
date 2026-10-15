import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AuthSession, User, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextValue {
  session: AuthSession | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<{ error: string | null }>;
  logout: () => void;
  register: (data: { name: string; email: string; phone: string; password: string; preferred_language: string }) => Promise<{ error: string | null }>;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => authService.getSession());

  const login = useCallback(async (email: string, password: string, role?: UserRole): Promise<{ error: string | null }> => {
    const result = authService.login(email, password, role);
    if (result.session) {
      setSession(result.session);
      return { error: null };
    }
    return { error: result.error };
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
  }, []);

  const register = useCallback(async (data: {
    name: string; email: string; phone: string; password: string; preferred_language: string;
  }): Promise<{ error: string | null }> => {
    const result = authService.register(data);
    if (result.error) return { error: result.error };
    if (result.user) {
      const loginResult = authService.login(data.email, data.password, 'citizen');
      if (loginResult.session) setSession(loginResult.session);
    }
    return { error: null };
  }, []);

  const refreshSession = useCallback(() => {
    setSession(authService.getSession());
  }, []);

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      isAuthenticated: session !== null,
      login,
      logout,
      register,
      refreshSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
