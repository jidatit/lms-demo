// src/hooks/useBrandSettings.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';

const QUERY_KEY = ['brand-settings'];

// Fetch current brand settings
export const useBrandSettings = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get('/brand-settings');
      return data.data; // { logoUrl, faviconUrl, faviconIcoUrl, appleTouchIconUrl, updatedAt }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30 // 30 minutes
  });
};

// Update brand settings (logo/favicon)
export const useUpdateBrandSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      // formData is a FormData object with 'logo' and/or 'favicon' files
      const { data } = await apiClient.put('/brand-settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data.data;
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(QUERY_KEY, (old) => ({ ...old, ...newData }));
      queryClient.invalidateQueries(QUERY_KEY); // refetch to get fresh URLs
    }
  });
};
