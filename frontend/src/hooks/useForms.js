import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formApi } from '../services/formApi';
import toast from 'react-hot-toast';

export const useForms = () => {
  return useQuery({
    queryKey: ['forms'],
    queryFn: () => formApi.getAllForms(),
  });
};

export const useForm = (formId) => {
  return useQuery({
    queryKey: ['forms', formId],
    queryFn: () => formApi.getForm(formId),
    enabled: !!formId,
  });
};

export const useCreateForm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: formApi.createForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast.success('Formulaire créé avec succès');
    },
    onError: (error) => {
      toast.error(error.error || 'Échec de la création du formulaire');
    },
  });
};

export const useUpdateForm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ formId, data }) => formApi.updateForm(formId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['forms', variables.formId] });
      toast.success('Formulaire mis à jour');
    },
    onError: (error) => {
      toast.error(error.error || 'Échec de la mise à jour');
    },
  });
};

export const useDeleteForm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: formApi.deleteForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast.success('Formulaire supprimé');
    },
    onError: (error) => {
      toast.error(error.error || 'Échec de la suppression');
    },
  });
};

export const useValidateForm = () => {
  return useMutation({
    mutationFn: ({ formId, data }) => formApi.validateFormData(formId, data),
    onError: (error) => {
      toast.error(error.error || 'Validation échouée');
    },
  });
};
