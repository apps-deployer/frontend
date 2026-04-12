import React, { createContext, useCallback, useEffect, useState } from "react";
import type { User } from "../types/api";
import { getMe } from "../api/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  logout: () => void;
  setToken: (token: string) => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  logout: () => {},
  setToken: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const setToken = useCallback((token: string) => {
    localStorage.setItem("token", token);
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}
