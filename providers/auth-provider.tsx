"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  clearLegacyAuthStorage,
  getErrorMessage,
} from "@/lib/api-client";
import * as authService from "@/services/auth";
import type { User } from "@/types/api";

type AuthContextValue = {
  user: User | null;
  /** @deprecated Cookie session — always null; kept for temporary call-site compatibility */
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    username: string;
    email: string;
    password: string;
    full_name?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const bootstrap = useCallback(async () => {
    clearLegacyAuthStorage();
    try {
      const { user: profile } = await authService.getProfile();
      startTransition(() => {
        setUser(profile);
        setLoading(false);
      });
    } catch {
      startTransition(() => {
        setUser(null);
        setLoading(false);
      });
    }
  }, [startTransition]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (payload: {
      username: string;
      email: string;
      password: string;
      full_name?: string;
    }) => {
      const data = await authService.register(payload);
      setUser(data.user);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Still clear local session if the API call fails (e.g. already expired).
    }
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const { user: profile } = await authService.getProfile();
    setUser(profile);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token: null,
      loading,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, loading, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { getErrorMessage };
