import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../services/workflowApi';
import toast from 'react-hot-toast';

export const useWorkflows = () => {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowApi.getAllWorkflows(),
  });
};

export const useWorkflow = (workflowId) => {
  return useQuery({
    queryKey: ['workflows', workflowId],
    queryFn: () => workflowApi.getWorkflow(workflowId),
    enabled: !!workflowId,
  });
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: workflowApi.createWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow créé avec succès');
    },
    onError: (error) => {
      toast.error(error.error || 'Échec de la création du workflow');
    },
  });
};

export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workflowId, data }) => workflowApi.updateWorkflow(workflowId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflows', variables.workflowId] });
      toast.success('Workflow mis à jour');
    },
    onError: (error) => {
      toast.error(error.error || 'Échec de la mise à jour');
    },
  });
};

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: workflowApi.deleteWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow supprimé');
    },
    onError: (error) => {
      toast.error(error.error || 'Échec de la suppression');
    },
  });
};

export const useStartWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workflowId, data }) => workflowApi.startWorkflowInstance(workflowId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] });
      toast.success('Workflow démarré');
    },
    onError: (error) => {
      toast.error(error.error || 'Échec du démarrage');
    },
  });
};

export const useWorkflowInstances = (workflowId) => {
  return useQuery({
    queryKey: ['workflow-instances', workflowId],
    queryFn: () => workflowApi.getWorkflowInstances(workflowId),
    enabled: !!workflowId,
  });
};

export const useWorkflowInstance = (instanceId) => {
  return useQuery({
    queryKey: ['workflow-instances', 'detail', instanceId],
    queryFn: () => workflowApi.getWorkflowInstance(instanceId),
    enabled: !!instanceId,
  });
};

export const useCancelWorkflowInstance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: workflowApi.cancelWorkflowInstance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] });
      toast.success('Instance annulée');
    },
    onError: (error) => {
      toast.error(error.error || 'Échec de l\'annulation');
    },
  });
};
