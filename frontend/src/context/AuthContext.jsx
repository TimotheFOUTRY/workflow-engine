import React, { createContext, useContext } from 'react';
import { useCurrentUser, useLogin, useLogout, useRegister } from '../hooks/useAuth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { data: user, isLoading: loading } = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const registerMutation = useRegister();

  const login = async (credentials) => {
    try {
      await loginMutation.mutateAsync(credentials);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.error || 'Échec de la connexion' };
    }
  };

  const register = async (userData) => {
    try {
      await registerMutation.mutateAsync(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.error || "Échec de l'inscription",
        existingAccountStatus: error.existingAccountStatus
      };
    }
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const isAdmin = () => user?.role === 'admin';
  const isManager = () => user?.role === 'manager' || user?.role === 'admin';
  const isAuthenticated = () => !!user && !!localStorage.getItem('token');

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isManager,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
