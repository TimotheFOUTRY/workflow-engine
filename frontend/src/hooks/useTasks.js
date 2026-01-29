import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../services/taskApi';
import toast from 'react-hot-toast';

export const useMyTasks = (params = {}) => {
  return useQuery({
    queryKey: ['tasks', 'my-tasks', params],
    queryFn: () => taskApi.getMyTasks(params),
  });
};

export const useTask = (taskId) => {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => taskApi.getTask(taskId),
    enabled: !!taskId,
  });
};

export const useTaskStatistics = () => {
  return useQuery({
    queryKey: ['tasks', 'statistics'],
    queryFn: () => taskApi.getTaskStatistics(),
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, decision, data }) => taskApi.completeTask(taskId, decision, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tâche terminée avec succès');
    },
    onError: (error) => {
      toast.error(error.error || 'Échec de la complétion de la tâche');
    },
  });
};

export const useReassignTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, userId }) => taskApi.reassignTask(taskId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tâche réassignée');
    },
    onError: (error) => {
      toast.error(error.error || 'Échec de la réassignation');
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, status }) => taskApi.updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Statut mis à jour');
    },
    onError: (error) => {
      toast.error(error.error || 'Échec de la mise à jour du statut');
    },
  });
};
