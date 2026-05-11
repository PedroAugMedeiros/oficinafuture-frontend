import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../app/services/auth';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial check
    authService.isAuthenticated().then((isAuth) => {
      setIsAuthenticated(isAuth);
      setIsLoading(false);
    });

    // Subscribe to changes (e.g. from apiClient auto-logout on 401)
    const unsubscribe = authService.subscribe((isAuth) => {
      setIsAuthenticated(isAuth);
    });

    return unsubscribe;
  }, []);

  const signIn = async (username, password) => {
    const data = await authService.login(username, password);
    setIsAuthenticated(true);
    return data;
  };

  const signOut = async () => {
    await authService.logout();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
