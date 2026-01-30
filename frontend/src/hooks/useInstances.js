import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import instanceApi from '../services/instanceApi';
import { toast } from 'react-hot-toast';

export const useInstance = (instanceId) => {
  return useQuery({
    queryKey: ['instance', instanceId],
    queryFn: () => instanceApi.getInstance(instanceId),
    enabled: !!instanceId,
    refetchInterval: 5000 // Refresh every 5 seconds for real-time updates
  });
};

export const useInstancesByWorkflow = (workflowId) => {
  return useQuery({
    queryKey: ['instances', 'workflow', workflowId],
    queryFn: () => instanceApi.getInstancesByWorkflow(workflowId),
    enabled: !!workflowId
  });
};

export const useSubscribeToInstance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (instanceId) => instanceApi.subscribe(instanceId),
    onSuccess: (data, instanceId) => {
      queryClient.invalidateQueries(['instance', instanceId]);
      toast.success('Abonné aux notifications');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Erreur lors de l\'abonnement');
    }
  });
};

export const useUnsubscribeFromInstance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (instanceId) => instanceApi.unsubscribe(instanceId),
    onSuccess: (data, instanceId) => {
      queryClient.invalidateQueries(['instance', instanceId]);
      toast.success('Désabonné');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Erreur lors du désabonnement');
    }
  });
};
