import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { request } from '../api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loginDemoUser: (subscribed?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const fresh = await request<User>('/auth/me');
      setUser(fresh);
      localStorage.setItem('reachwithus_user_profile', JSON.stringify(fresh));
    } catch (e) {
      // Ignore
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('reachwithus_user_token');
    const savedUser = localStorage.getItem('reachwithus_user_profile');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        refreshUser().finally(() => setIsLoading(false));
        return;
      } catch (e) {
        localStorage.removeItem('reachwithus_user_token');
        localStorage.removeItem('reachwithus_user_profile');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await request<{ accessToken: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('reachwithus_user_token', data.accessToken);
      localStorage.setItem('reachwithus_user_profile', JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await request<{ accessToken: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, password }),
      });
      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('reachwithus_user_token', data.accessToken);
      localStorage.setItem('reachwithus_user_profile', JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('reachwithus_user_token');
    localStorage.removeItem('reachwithus_user_profile');
  };

  const loginDemoUser = async (subscribed = false) => {
    // Vikram Sharma is pre-seeded
    // Or Priya Patel
    const email = subscribed ? 'vikram.sharma@example.com' : 'priya.patel@example.com';
    await login(email, 'User@123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        loginDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
