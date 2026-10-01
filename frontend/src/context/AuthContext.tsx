import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Household } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  household: Household | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, householdName?: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('freshtrack_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const data = await api.getMe();
          setUser(data.user);
          setHousehold(data.household);
        } catch (err) {
          console.error('Failed to load user session', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('freshtrack_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setHousehold(res.household);
  };

  const register = async (name: string, email: string, password: string, householdName?: string) => {
    const res = await api.register({ name, email, password, householdName });
    localStorage.setItem('freshtrack_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setHousehold(res.household);
  };

  const loginAsDemo = async () => {
    await login('demo@freshtrack.com', 'password123');
  };

  const logout = () => {
    localStorage.removeItem('freshtrack_token');
    setToken(null);
    setUser(null);
    setHousehold(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        household,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
