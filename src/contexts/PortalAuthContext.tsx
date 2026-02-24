import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// User types matching the backend
export type UserType = 'staff' | 'admin' | 'super_admin' | 'business_customer';

export interface PortalUser {
  id: string;
  email: string;
  display_name: string;
  role: string;
  user_type: UserType;
  company_id?: string;
  company_name?: string;
  discount_tier?: string;
  phone?: string;
  can_approve_certificates?: boolean;
}

interface PortalAuthContextType {
  user: PortalUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  isBusinessCustomer: boolean;
  canApprove: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const PortalAuthContext = createContext<PortalAuthContextType | undefined>(undefined);

// Use relative /api path to ensure cookies work (same-origin)
// The static server proxies /api to the API server
const API_BASE = '/api';

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  // Permission helpers
  const isAuthenticated = !!user;
  const isStaff = !!user && ['staff', 'admin', 'super_admin'].includes(user.user_type);
  const isAdmin = !!user && ['admin', 'super_admin'].includes(user.user_type);
  const isBusinessCustomer = !!user && user.user_type === 'business_customer';
  const canApprove = !!user && (user.can_approve_certificates === true || isAdmin);

  return (
    <PortalAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isStaff,
        isAdmin,
        isBusinessCustomer,
        canApprove,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  const context = useContext(PortalAuthContext);
  if (context === undefined) {
    throw new Error('usePortalAuth must be used within a PortalAuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withPortalAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: { requireStaff?: boolean; requireAdmin?: boolean }
) {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, isLoading, isStaff, isAdmin } = usePortalAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      window.location.href = '/portal/login';
      return null;
    }

    if (options?.requireStaff && !isStaff) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
            <p className="text-muted-foreground mt-2">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    if (options?.requireAdmin && !isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
            <p className="text-muted-foreground mt-2">Admin access required.</p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
