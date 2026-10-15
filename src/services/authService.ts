import type { User, AuthSession, UserRole, Officer } from '../types';
import { DB_KEYS, getAll } from '../data/mockDb';

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  login(email: string, password: string, expectedRole?: UserRole): { session: AuthSession | null; error: string | null } {
    const users = getAll<User>(DB_KEYS.USERS);
    const user = users.find(u =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password_hash === password &&
      u.is_active
    );

    if (!user) {
      return { session: null, error: 'Invalid email or password. Please check your credentials.' };
    }

    if (expectedRole && user.role !== expectedRole) {
      const roleLabels: Record<UserRole, string> = {
        citizen: 'Citizen Portal',
        officer: 'Officer Portal',
        district_admin: 'District Admin Portal',
        super_admin: 'Super Admin Portal',
      };
      return {
        session: null,
        error: `This account does not have ${roleLabels[expectedRole]} access. Please use the correct login portal.`
      };
    }

    // Get officer data if applicable
    let officerData: Officer | undefined;
    if (user.role === 'officer') {
      const officers = getAll<Officer>(DB_KEYS.OFFICERS);
      officerData = officers.find(o => o.user_id === user.id);
    }

    const session: AuthSession = {
      user,
      officer: officerData,
      token: `demo-token-${user.id}-${Date.now()}`,
      expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
    };

    localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(session));
    return { session, error: null };
  },

  logout(): void {
    localStorage.removeItem(DB_KEYS.SESSION);
  },

  getSession(): AuthSession | null {
    const raw = localStorage.getItem(DB_KEYS.SESSION);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (new Date(session.expires_at) < new Date()) {
      localStorage.removeItem(DB_KEYS.SESSION);
      return null;
    }
    return session;
  },

  register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    preferred_language: string;
  }): { user: User | null; error: string | null } {
    const users = getAll<User>(DB_KEYS.USERS);
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { user: null, error: 'An account with this email address already exists.' };
    }

    const newUser: User = {
      id: `u-citizen-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password_hash: data.password,
      role: 'citizen',
      preferred_language: (data.preferred_language as any) || 'en',
      created_at: new Date().toISOString(),
      is_active: true,
    };

    users.push(newUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    return { user: newUser, error: null };
  },

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  },

  getCurrentUser(): User | null {
    return this.getSession()?.user ?? null;
  },

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  },

  canAccessRoute(pathname: string): boolean {
    const session = this.getSession();
    if (!session) {
      // Public routes
      return !pathname.startsWith('/citizen/') &&
        !pathname.startsWith('/officer/') &&
        !pathname.startsWith('/district-admin/') &&
        !pathname.startsWith('/admin/');
    }

    const { role } = session.user;
    if (pathname.startsWith('/citizen/') && role !== 'citizen') return false;
    if (pathname.startsWith('/officer/') && role !== 'officer') return false;
    if (pathname.startsWith('/district-admin/') && role !== 'district_admin') return false;
    if (pathname.startsWith('/admin/') && role !== 'super_admin') return false;

    return true;
  },
};
