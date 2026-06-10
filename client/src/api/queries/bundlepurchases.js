import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';

export const useAllInvoices = (filters = {}) => {
  const {
    invoiceType,
    status,
    companyId,
    bundlePurchaseId,
    createdBy,
    search,
    dateFrom,
    dateTo,
    dueDateFrom,
    dueDateTo,
    amountMin,
    amountMax,
    page,
    limit
  } = filters;

  const params = {
    ...(invoiceType && { invoiceType }),
    ...(status && { status }),
    ...(companyId && { companyId }),
    ...(bundlePurchaseId && { bundlePurchaseId }),
    ...(createdBy && { createdBy }),
    ...(search && { search }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
    ...(dueDateFrom && { dueDateFrom }),
    ...(dueDateTo && { dueDateTo }),
    ...(amountMin && { amountMin }),
    ...(amountMax && { amountMax }),
    ...(page && { page }),
    ...(limit && { limit })
  };

  const { data, refetch, ...rest } = useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const response = await apiClient.get('/bundlePurchases/invoices', { params });
      return response.data;
    }
  });

  return { data, refetch, ...rest };
};

export const useBundlePurchaseDetails = (id) => {
  const { data, refetch, ...rest } = useQuery({
    queryKey: ['bundlePurchaseDetails', id],
    queryFn: async () => {
      const response = await apiClient.get(`/bundlePurchases/${id}`);
      return response.data;
    },
    enabled: !!id
  });

  return {
    data: data?.data,
    requestedBy: data?.requestedBy,
    refetch,
    ...rest
  };
};
export const useInvoiceSummary = () => {
  const { data, refetch, ...rest } = useQuery({
    queryKey: ['invoiceSummary'],
    queryFn: async () => {
      const response = await apiClient.get('/bundlePurchases/invoices/summary');
      return response.data;
    },
    // Always enabled since no parameters are required
    enabled: true
  });

  return {
    widgetData: data?.widgetData || [],
    receivables: data?.receivables || {},
    requestedBy: data?.requestedBy,
    refetch,
    ...rest
  };
};
export const useBundlePurchases = (filters = {}) => {
  const { bundleId = '', purchasedBy = '', page, limit } = filters;

  const params = {
    ...(bundleId && { bundleId }),
    ...(purchasedBy && { purchasedBy }),
    ...(page && { page }),
    ...(limit && { limit })
  };

  const { data, refetch, ...rest } = useQuery({
    queryKey: ['bundlePurchases', params],
    queryFn: async () => {
      const response = await apiClient.get('/bundlePurchases', { params });
      return response.data;
    }
  });

  return { data, refetch, ...rest };
};

export const useBundlePurchaseById = (id) => {
  const { data, refetch, ...rest } = useQuery({
    queryKey: ['bundlePurchase', id],
    queryFn: async () => {
      const response = await apiClient.get(`/bundle-purchases/${id}`);
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

export const useCreateBundlePurchase = () => {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.post('/bundlePurchases', payload);
      return response.data;
    },
    onSuccess: () => invalidateAll()
  });
};

export const useUpdateBundlePurchase = () => {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await apiClient.put(`/bundle-purchases/${id}`, payload);
      return response.data;
    },
    onSuccess: () => invalidateAll()
  });
};

export const useDeleteBundlePurchase = () => {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`/bundle-purchases/${id}`);
      return response.data;
    },
    onSuccess: () => invalidateAll()
  });
};
