'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, apiRequest } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedToken = localStorage.getItem('reachwithus_admin_token');
    const savedUser = localStorage.getItem('reachwithus_admin_user');

    const verifySession = async () => {
      try {
        if (!savedToken || !savedUser) return;

        const parsedUser = JSON.parse(savedUser) as User;
        if (parsedUser.role !== 'ADMIN') {
          localStorage.removeItem('reachwithus_admin_token');
          localStorage.removeItem('reachwithus_admin_user');
          return;
        }

        setToken(savedToken);
        setUser(parsedUser);

        try {
          const freshUser = await apiRequest<User>('/auth/me');
          if (freshUser.role === 'ADMIN') {
            setUser(freshUser);
            localStorage.setItem('reachwithus_admin_user', JSON.stringify(freshUser));
          } else {
            throw new Error('Administrator role required');
          }
        } catch {
          // Keep a valid cached admin session when the API is temporarily unavailable.
        }
      } catch {
        localStorage.removeItem('reachwithus_admin_token');
        localStorage.removeItem('reachwithus_admin_user');
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ accessToken: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.user.role !== 'ADMIN') {
        throw new Error('Access denied. Administrator privileges required.');
      }

      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('reachwithus_admin_token', data.accessToken);
      localStorage.setItem('reachwithus_admin_user', JSON.stringify(data.user));
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('reachwithus_admin_token');
    localStorage.removeItem('reachwithus_admin_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
