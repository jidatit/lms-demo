import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';

const useInvalidateAll = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [], exact: false });
};

/**
 * Create or update a custom invoice email template
 * API: POST /emailTemplates/custom-invoice-template
 */
export const useCreateOrUpdateCustomInvoiceTemplate = () => {
  const invalidateAll = useInvalidateAll();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.post('/emailTemplates/custom-invoice-template', payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    },
    onSuccess: () => invalidateAll()
  });
};

/**
 * Get all email templates
 * API: GET /emailTemplates?page=&limit=
 */
export const useEmailTemplates = (filters = {}) => {
  const { page, limit } = filters;

  const params = {
    ...(page && { page }),
    ...(limit && { limit })
  };

  const { data, refetch, ...rest } = useQuery({
    queryKey: ['emailTemplates', params],
    queryFn: async () => {
      const response = await apiClient.get('/emailTemplates', { params });
      return response.data;
    }
  });

  return { data, refetch, ...rest };
};

/**
 * Get invoice-specific email templates
 * API: GET /emailTemplates/invoice-templates
 */
export const useInvoiceTemplates = (filters = {}) => {
  const { page, limit } = filters;

  const params = {
    ...(page && { page }),
    ...(limit && { limit })
  };

  const { data, refetch, ...rest } = useQuery({
    queryKey: ['invoiceTemplates', params],
    queryFn: async () => {
      const response = await apiClient.get('/emailTemplates/invoice-templates', { params });
      return response.data;
    }
  });

  return { data, refetch, ...rest };
};

/**
 * Get a single email template by ID
 * API: GET /emailTemplates/:id
 */
export const useEmailTemplateById = (id) => {
  const { data, refetch, ...rest } = useQuery({
    queryKey: ['emailTemplate', id],
    queryFn: async () => {
      const response = await apiClient.get(`/emailTemplates/${id}`);
      return response.data;
    },
    enabled: !!id
  });

  return { data, refetch, ...rest };
};

/**
 * Update an email template by ID
 * API: PUT /emailTemplates/:id
 */
export const useUpdateEmailTemplate = () => {
  const invalidateAll = useInvalidateAll();

  return useMutation({
    mutationFn: async ({ templateId, payload }) => {
      const response = await apiClient.put(`/emailTemplates/${templateId}`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    },
    onSuccess: () => invalidateAll()
  });
};
