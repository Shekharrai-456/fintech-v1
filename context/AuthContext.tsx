'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Family, FamilyMember } from '@/types';

interface AuthContextType {
  user: User | null;
  family: Family | null;
  members: FamilyMember[];
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string, familyName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshFamilyMembers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('familyfin_token');
    if (savedToken) {
      setToken(savedToken);
      fetchMe(savedToken);
    } else {
      // Fallback demo Rai Family initialization for instant preview
      fetchMe('demo');
    }
  }, []);

  const fetchMe = async (authToken: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setFamily(data.family);
        setMembers(data.members || []);
      } else {
        // Fallback demo fetch
        const famRes = await fetch('/api/families');
        if (famRes.ok) {
          const famData = await famRes.json();
          setFamily(famData.family);
          setMembers(famData.members || []);
          setUser({
            id: 'user_shekhar_1',
            name: 'Shekhar Rai',
            email: 'shekhar.rai456@gmail.com',
            created_at: new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      console.error('Error fetching auth state:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };

      localStorage.setItem('familyfin_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setFamily(data.family);
      if (data.family) {
        const memRes = await fetch(`/api/families/${data.family.id}/members`);
        if (memRes.ok) {
          const memData = await memRes.json();
          setMembers(memData.members || []);
        }
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Network error during login' };
    }
  };

  const register = async (name: string, email: string, pass: string, familyName?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass, familyName }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };

      localStorage.setItem('familyfin_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setFamily(data.family);
      if (data.family) {
        const memRes = await fetch(`/api/families/${data.family.id}/members`);
        if (memRes.ok) {
          const memData = await memRes.json();
          setMembers(memData.members || []);
        }
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Network error during registration' };
    }
  };

  const logout = () => {
    localStorage.removeItem('familyfin_token');
    setToken(null);
    setUser(null);
  };

  const refreshFamilyMembers = async () => {
    if (family) {
      const res = await fetch(`/api/families/${family.id}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        family,
        members,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshFamilyMembers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
