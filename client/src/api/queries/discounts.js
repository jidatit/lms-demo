import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';

export const useDiscounts = (filters = {}) => {
  const { bundleId = '', page, limit } = filters;

  const params = {
    ...(bundleId && { bundleId }),
    ...(page && { page }),
    ...(limit && { limit })
  };

  const { data, refetch, ...rest } = useQuery({
    queryKey: ['discounts', params],
    queryFn: async () => {
      const response = await apiClient.get('/discounts', { params });
      return response.data;
    }
  });

  return { data, refetch, ...rest };
};

export const useDiscountById = (id) => {
  const { data, refetch, ...rest } = useQuery({
    queryKey: ['discount', id],
    queryFn: async () => {
      const response = await apiClient.get(`/discounts/${id}`);
      return response.data;
    },
    enabled: !!id
  });

  return { data, refetch, ...rest };
};

const useInvalidateAll = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [], exact: false });
};

export const useCreateDiscount = () => {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.post('/discounts', payload);
      return response.data;
    },
    onSuccess: () => invalidateAll()
  });
};

export const useUpdateDiscount = () => {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      console.log('id,payload', { id, payload });
      const response = await apiClient.put(`/discounts/${id}`, payload);
      return response.data;
    },
    onSuccess: () => invalidateAll()
  });
};

export const useDeleteDiscount = () => {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`/discounts/${id}`);
      return response.data;
    },
    onSuccess: () => invalidateAll()
  });
};
