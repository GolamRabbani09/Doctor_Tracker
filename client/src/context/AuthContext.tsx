'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { authApi } from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load user & token from storage and validate with getMe()
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('doctor_tracker_token');
      const storedUser = localStorage.getItem('doctor_tracker_user');

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // ignore parsing error
        }
      }

      try {
        const validatedUser = await authApi.getMe();
        if (validatedUser) {
          setUser(validatedUser);
          localStorage.setItem('doctor_tracker_user', JSON.stringify(validatedUser));
        }
      } catch (err) {
        console.error('Failed to validate token on mount:', err);
        // If token is invalid, clear storage
        localStorage.removeItem('doctor_tracker_token');
        localStorage.removeItem('doctor_tracker_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login(email, password);
      if (result.token) {
        setToken(result.token);
        setUser(result.user);
        localStorage.setItem('doctor_tracker_token', result.token);
        localStorage.setItem('doctor_tracker_user', JSON.stringify(result.user));
      } else {
        throw new Error('Authentication failed: No token received.');
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem('doctor_tracker_token');
    localStorage.removeItem('doctor_tracker_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
