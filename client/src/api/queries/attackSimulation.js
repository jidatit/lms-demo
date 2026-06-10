import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../client';

export const useAttackSimulations = (filters = {}) => {
  const { courseId = '', name = '', createdBy = '', page = null, limit = null } = filters;

  const params = {
    ...(courseId && { courseId }),
    ...(name && { name }),
    ...(createdBy && { createdBy }),
    ...(page && { page }),
    ...(limit && { limit })
  };

  const { data, refetch, ...rest } = useQuery({
    queryKey: ['attackSimulations', params],
    queryFn: async () => {
      const response = await apiClient.get('/attackSimulations', { params });
      return response.data;
    }
  });

  return { data, refetch, ...rest };
};

export const useAttackSimulationById = (id) => {
  const { data, refetch, ...rest } = useQuery({
    queryKey: ['attack-simulation', id],
    queryFn: async () => {
      const response = await apiClient.get(`/attackSimulations/${id}`);
      return response.data;
    },
    enabled: !!id
  });

  return { data, refetch, ...rest };
};

export const useCreateAttackSimulation = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.post('/attackSimulations', payload);
      return response.data;
    }
  });
};

export const useDeleteAttackSimulation = () => {
  return useMutation({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`/attackSimulations/${id}`);
      return response.data;
    }
  });
};
