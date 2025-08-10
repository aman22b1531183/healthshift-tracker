// File: frontend/src/contexts/AuthContext.tsx
// CORRECTED AND FINAL VERSION

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { User } from '../types';
import { apiService, setAuthToken } from '../services/api'; // Import our corrected API service

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  updateUserRole: (role: 'manager' | 'careworker') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user: auth0User,
    isAuthenticated,
    isLoading: auth0Loading,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently, // The key function to get the token for our backend
  } = useAuth0();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      if (isAuthenticated && auth0User) {
        try {
          // 1. Get the secret Access Token from Auth0
          const token = await getAccessTokenSilently();

          // 2. Set it for all future apiService calls
          setAuthToken(token);

          // 3. Get or create the user profile from OUR backend, not Supabase
          const backendUser = await apiService.createOrGetUserProfile();
          setUser(backendUser);

        } catch (error) {
          console.error('🔥 Error initializing user with backend:', error);
          setAuthToken(null);
          setUser(null);
        }
      } else {
        // Not authenticated, so ensure no user or token is set
        setAuthToken(null);
        setUser(null);
      }
      setIsLoading(false);
    };

    // Only run this logic once the Auth0 SDK is finished loading
    if (!auth0Loading) {
      initializeUser();
    }
  }, [isAuthenticated, auth0User, auth0Loading, getAccessTokenSilently]);

  const login = () => loginWithRedirect();

  const logout = () => {
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    setAuthToken(null); // Clear the token on logout
    setUser(null);
  };

  const updateUserRole = async (role: 'manager' | 'careworker') => {
    if (user) {
      try {
        const updatedUser = await apiService.updateUserRole(role);
        setUser(updatedUser); // Update state with the confirmed response from the backend
      } catch (error) {
        console.error("Failed to update user role:", error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading: isLoading || auth0Loading,
      isAuthenticated: isAuthenticated && !!user, // User is only truly authenticated if they have a backend profile
      login,
      logout,
      updateUserRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};