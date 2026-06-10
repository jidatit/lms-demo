import { useQuery } from '@tanstack/react-query';
import apiClient from '../client';

/**
 * Hook for fetching bundle purchases
 * @params filters - Optional query params: bundleId, purchasedBy, discountId, page, limit
 */
export const useBundlePurchases = (filters = {}) => {
  const { bundleId = '', purchasedBy = '', discountId = '', page = null, limit = null } = filters;

  const params = {
    ...(bundleId && { bundleId }),
    ...(purchasedBy && { purchasedBy }),
    ...(discountId && { discountId }),
    ...(page && { page }),
    ...(limit && { limit })
  };

  const { data, refetch, ...rest } = useQuery({
    queryKey: ['bundlePurchases', params],
    queryFn: async () => {
      const response = await apiClient.get('/bundlePurchases', { params });
      return response.data; // { success, data, pagination, requestedBy }
    }
  });

  return { data, refetch, ...rest };
};
