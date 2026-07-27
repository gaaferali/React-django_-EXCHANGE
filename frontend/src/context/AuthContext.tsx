import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../api/apiService';
import { User, AuthContextType } from '../types';
import { STORAGE_KEYS, MESSAGES } from '../constants/config';

// Creatxt
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Comp
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Optionally verify token
          try {
            const profile = await apiService.getProfile();
            setUser(profile);
          } catch (error) {
            // Token invalid, clear storage
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_DATA);
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiService.login(email, password);

      // Store token and user data
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));

      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(MESSAGES.LOGIN_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiService.register(name, email, password);

      // Store token and user data
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));

      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Register error:', error);
      throw new Error(MESSAGES.REGISTER_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = (): void => {
    try {
      // Clear storage
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);

      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Update user function
  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Customhook to use Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
