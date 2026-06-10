import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '../client';

// Hook for fetching all group bundles (using useQuery for GET operations)
export const useGetGroupBundles = (groupId, options = {}) => {
  return useQuery({
    queryKey: ['groupBundles', groupId],
    queryFn: async () => {
      const response = await apiClient.get('/groupBundles/', {
        params: { groupId } // Add page, limit if needed in the future
      });
      return response.data; // { success, data (groupBundles array), pagination, requestedBy }
    },
    enabled: !!groupId, // Only fetch if groupId is provided
    ...options // Allow overriding options like staleTime, etc.
  });
};
