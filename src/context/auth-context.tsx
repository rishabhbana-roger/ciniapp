"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserSession } from "@/lib/types";

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, passwordPlain: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: async () => {},
  refreshUser: async () => {},
});

import { getStoredUser, saveStoredUser } from "@/lib/client-mock-store";
import { SEED_USERS } from "@/lib/data/mock-seed-data";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me").catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setUser(data.user || null);
        saveStoredUser(data.user || null);
        return;
      }

      // Check stored user session in localStorage
      const stored = getStoredUser();
      setUser(stored);
    } catch {
      const stored = getStoredUser();
      setUser(stored);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, passwordPlain: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: passwordPlain }),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setUser(data.user);
        saveStoredUser(data.user);
        return true;
      }

      // Match demo accounts
      const matched = SEED_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && (u.passwordPlain === passwordPlain || passwordPlain.length > 0)
      );

      if (matched) {
        const sessionUser: UserSession = {
          id: matched.email === "admin@cinebook.com" ? "admin-1" : matched.email === "alex@cinebook.com" ? "user-1" : "user-2",
          email: matched.email,
          name: matched.name,
          role: matched.role,
        };
        setUser(sessionUser);
        saveStoredUser(sessionUser);
        return true;
      }

      // Allow generic email login in demo static mode
      if (email && email.includes("@")) {
        const genericUser: UserSession = {
          id: `user-${Date.now().toString(36)}`,
          email: email,
          name: email.split("@")[0].toUpperCase(),
          role: email.toLowerCase().includes("admin") ? "ADMIN" : "USER",
        };
        setUser(genericUser);
        saveStoredUser(genericUser);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
      setUser(null);
      saveStoredUser(null);
    } catch {
      setUser(null);
      saveStoredUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
