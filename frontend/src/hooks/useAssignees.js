import { useQuery } from '@tanstack/react-query';
import { assigneeApi } from '../services/assigneeApi';

export const useAssignees = (search = '', enabled = true) => {
  return useQuery({
    queryKey: ['assignees', search],
    queryFn: () => assigneeApi.getAssignees(search, 10),
    enabled,
    staleTime: 30000, // Cache for 30 seconds
  });
};
