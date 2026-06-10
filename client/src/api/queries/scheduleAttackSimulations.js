import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';

// Updated hook definition (for reference or to place in the correct file)
export const useScheduleAttackSimulations = (filters = {}) => {
  const { groupId = '', bundleId = '', status = '', launchStatus = '', page = null, limit = null, createdBy = '' } = filters;

  const params = {
    ...(groupId && { groupId }),
    ...(bundleId && { bundleId }),
    ...(status && { status }),
    ...(launchStatus && { launchStatus }),
    ...(page && { page }),
    ...(limit && { limit }),
    ...(createdBy && { createdBy })
  };

  const { data, refetch, ...rest } = useQuery({
    queryKey: ['schedule-attack-simulations', params],
    queryFn: async () => {
      const response = await apiClient.get('/scheduleAttackSimulations', { params });
      return response.data;
    }
  });

  return { data, refetch, ...rest };
};

export const useScheduleAttackSimulationById = (id) => {
  const { data, refetch, ...rest } = useQuery({
    queryKey: ['schedule-attack-simulation', id],
    queryFn: async () => {
      const response = await apiClient.get(`/scheduleAttackSimulations/${id}`);
      return response.data;
    },
    enabled: !!id
  });

  return { data, refetch, ...rest };
};

export const useCreateScheduleAttackSimulation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.post('/scheduleAttackSimulations', payload);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate the list
      queryClient.invalidateQueries({ queryKey: ['schedule-attack-simulations'] });

      // Invalidate the single query for the new one (if backend returns its ID)
      if (data?.data?.id) {
        queryClient.invalidateQueries({ queryKey: ['schedule-attack-simulation', data.data.id] });
      }
    }
  });
};
export const useDeleteScheduleAttackSimulation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`/scheduleAttackSimulations/${id}`);
      return response.data;
    },
    onSuccess: (_data, id) => {
      // Invalidate the list query
      queryClient.invalidateQueries({ queryKey: ['schedule-attack-simulations'] });

      // Invalidate the single query for the deleted one
      queryClient.invalidateQueries({ queryKey: ['schedule-attack-simulation', id] });
    }
  });
};
