import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';

const useInvalidateAll = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [], exact: false });
};

/**
 * Hook to create an external invoice (with file upload)
 * API: POST /bundlePurchases/invoices
 */
export const useCreateExternalInvoice = () => {
  const invalidateAll = useInvalidateAll();

  return useMutation({
    mutationFn: async (payload) => {
      const formData = new FormData();

      // Required fields from your Postman example
      formData.append('companyId', payload.companyId);
      formData.append('description', payload.description);
      formData.append('itemDescription', payload.itemDescription);
      formData.append('quantity', payload.quantity);
      formData.append('unitPrice', payload.unitPrice);
      formData.append('discountPercentage', payload.discountPercentage);
      formData.append('dueDate', payload.dueDate);
      formData.append('notes', payload.notes);
      formData.append('status', payload.status);
      formData.append('sendEmail', payload.sendEmail);
      formData.append('invoiceNumber', payload.invoiceNumber);

      // File upload (optional)
      if (payload.invoicePdf) {
        formData.append('invoicePdf', payload.invoicePdf);
      }

      const response = await apiClient.post('/bundlePurchases/invoices', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data;
    },
    onSuccess: () => {
      invalidateAll();
    }
  });
};

export const useUpdateInvoice = () => {
  const invalidateAll = useInvalidateAll();

  return useMutation({
    mutationFn: async ({ invoiceId, payload }) => {
      const response = await apiClient.put(`/bundlePurchases/invoices/${invoiceId}`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    },
    onSuccess: () => {
      invalidateAll();
    }
  });
};
