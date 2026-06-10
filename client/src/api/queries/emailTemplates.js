import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from 'api/client';

const API_BASE_URL = '/emailTemplates';

// Default query options
const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  retry: (failureCount, error) => {
    // Retry up to 3 times for non-400/401 errors
    if (error.response?.status === 400 || error.response?.status === 401) return false;
    return failureCount < 3;
  }
};

// Fetch all email templates
export const useGetAllEmailTemplates = (params) => {
  return useQuery({
    queryKey: ['emailTemplates', params],
    queryFn: async () => {
      const response = await apiClient.get(API_BASE_URL, { params });
      return response.data;
    },
    ...defaultQueryOptions,
    keepPreviousData: true
  });
};

export const useGetUserEmailTemplates = (params) => {
  return useQuery({
    queryKey: ['emailTemplates', params],
    queryFn: async () => {
      const response = await apiClient.get(`${API_BASE_URL}/invoice-templates`, { params });
      return response.data;
    },
    ...defaultQueryOptions,
    keepPreviousData: true
  });
};
// Fetch a single email template by ID
export const useGetEmailTemplateById = (id) => {
  return useQuery({
    queryKey: ['emailTemplate', id],
    queryFn: async () => {
      const response = await apiClient.get(`${API_BASE_URL}/${id}`);
      return response.data;
    },
    ...defaultQueryOptions,
    enabled: !!id
  });
};

// Create a new email template
export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (template) => {
      const response = await apiClient.post(API_BASE_URL, template);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
    }
  });
};

// Update an email template
export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put(`${API_BASE_URL}/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplate', id] });
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
    }
  });
};

// Delete an email template
export const useDeleteEmailTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
    }
  });
};

// Fetch available template types
export const useGetTemplateTypes = () => {
  return useQuery({
    queryKey: ['templateTypes'],
    queryFn: async () => {
      const response = await apiClient.get(`${API_BASE_URL}/types`);
      return response.data;
    },
    ...defaultQueryOptions
  });
};
