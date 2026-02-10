import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../services/authApi';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      console.log('=== Login Success ===');
      console.log('Data received:', data);
      const { user, token, refreshToken } = data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      queryClient.setQueryData(['currentUser'], user);
      toast.success('Connexion réussie !', {
        duration: 5000, // Disparaît après 5 secondes
      });
    },
    onError: (error) => {
      console.log('=== Login Error ===');
      console.log('Error:', error);
      toast.error(error.error || 'Échec de la connexion');
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      toast.success(data.message || 'Inscription réussie ! En attente d\'approbation.');
    },
    onError: (error) => {
      toast.error(error.error || 'Échec de l\'inscription');
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      queryClient.setQueryData(['currentUser'], null);
      queryClient.clear();
      toast.success('Déconnexion réussie');
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Toujours nettoyer même en cas d'erreur
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      queryClient.setQueryData(['currentUser'], null);
      queryClient.clear();
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }
      const response = await authApi.getCurrentUser();
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false,
  });
};
