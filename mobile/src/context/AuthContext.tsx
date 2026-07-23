import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { User } from "@/types";

type AuthContextValue = {
  loading: boolean;
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, displayName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = "monster-clash-token";
const USER_KEY = "monster-clash-user";

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    Promise.all([SecureStore.getItemAsync(TOKEN_KEY), SecureStore.getItemAsync(USER_KEY)])
      .then(([savedToken, savedUser]) => {
        setToken(savedToken);
        setUser(savedUser ? JSON.parse(savedUser) : null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = async (nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    await SecureStore.setItemAsync(TOKEN_KEY, nextToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(nextUser));
  };

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    await persist(response.access_token, response.user);
  };

  const register = async (email: string, displayName: string, password: string) => {
    const response = await api.register(email, displayName, password);
    await persist(response.access_token, response.user);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  };

  const value = useMemo(
    () => ({ loading, token, user, login, register, logout }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
