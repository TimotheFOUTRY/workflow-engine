import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../services/userApi';
import toast from 'react-hot-toast';

export const useUsers = (filters = {}) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userApi.getAllUsers(filters),
  });
};

export const usePendingUsers = () => {
  return useQuery({
    queryKey: ['users', 'pending'],
    queryFn: () => userApi.getPendingUsers(),
  });
};

export const useUser = (userId) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => userApi.getUser(userId),
    enabled: !!userId,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur créé avec succès');
    },
    onError: (error) => {
      toast.error(error.error || 'Échec de la création de l\'utilisateur');
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, data }) => userApi.updateUser(userId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
      toast.success('Utilisateur mis à jour');
    },
    onError: (error) => {
      toast.error(error.error || 'Échec de la mise à jour');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur supprimé');
    },
    onError: (error) => {
      toast.error(error.error || 'Échec de la suppression');
    },
  });
};

export const useApproveUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.approveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur approuvé');
    },
    onError: (error) => {
      toast.error(error.error || 'Échec de l\'approbation');
    },
  });
};

export const useRejectUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.rejectUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur rejeté');
    },
    onError: (error) => {
      toast.error(error.error || 'Échec du rejet');
    },
  });
};

export const useUserStatistics = () => {
  return useQuery({
    queryKey: ['users', 'statistics'],
    queryFn: () => userApi.getUserStatistics(),
  });
};
