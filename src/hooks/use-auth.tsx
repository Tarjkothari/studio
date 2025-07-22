"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Job Provider' | 'Job Seeker';
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<User | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy user data
const users: (User & { password?: string })[] = [
    { id: '1', name: 'Hiring Manager', email: 'manager@company.com', role: 'Job Provider', password: 'password123' },
    { id: '2', name: 'Jane Doe', email: 'jane.d@example.com', role: 'Job Seeker', password: 'password123' },
    { id: '3', name: 'Admin', email: 'tarjkothari2004@gmail.com', role: 'Admin', password: 'Tarj@2108' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password?: string): Promise<User | null> => {
    setLoading(true);
    // In a real app, you'd make an API call here.
    // For this mock, we'll find the user in our dummy data.
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
        const { password, ...userToStore } = foundUser;
        localStorage.setItem('user', JSON.stringify(userToStore));
        setUser(userToStore);
        setLoading(false);
        return userToStore;
    }
    
    setLoading(false);
    return null;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const value = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
