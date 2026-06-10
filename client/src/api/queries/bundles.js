// import { useQuery, useMutation } from '@tanstack/react-query';
// import apiClient from '../client';
// import { Category } from 'iconsax-react';

// // 🔹 Get Bundles (with optional filters)
// export const useBundles = (filters = {}) => {
//   const { title = '', category = '', page = null, limit = null } = filters;

//   const params = {
//     ...(title && { title }),
//     ...(category && { category }),
//     ...(page && { page }),
//     ...(limit && { limit })
//   };

//   const { data, refetch, ...rest } = useQuery({
//     queryKey: ['bundles', params],
//     queryFn: async () => {
//       const response = await apiClient.get('/bundles', { params });
//       return response.data;
//     }
//   });

//   return { data, refetch, ...rest };
// };

// // 🔹 Get Bundle by ID
// export const useBundleById = (id) => {
//   const { data, refetch, ...rest } = useQuery({
//     queryKey: ['bundle', id],
//     queryFn: async () => {
//       const response = await apiClient.get(`/bundles/${id}`);
//       return response.data;
//     },
//     enabled: !!id
//   });

//   return { data, refetch, ...rest };
// };

// // 🔹 Check if Bundle Exists
// export const useBundleExists = (id) => {
//   const { data, refetch, ...rest } = useQuery({
//     queryKey: ['bundle-exists', id],
//     queryFn: async () => {
//       const response = await apiClient.get(`/bundles/${id}/exists`);
//       return response.data; // { exists: true/false }
//     },
//     enabled: !!id
//   });

//   return { data, refetch, ...rest };
// };

// // 🔹 Create Bundle
// export const useCreateBundle = () => {
//   return useMutation({
//     mutationFn: async (payload) => {
//       const response = await apiClient.post('/bundles', payload);
//       return response.data;
//     }
//   });
// };

// // 🔹 Update Bundle
// export const useUpdateBundle = () => {
//   return useMutation({
//     mutationFn: async ({ id, payload }) => {
//       const response = await apiClient.put(`/bundles/${id}`, payload);
//       return response.data;
//     }
//   });
// };

// // 🔹 Delete Bundle
// export const useDeleteBundle = () => {
//   return useMutation({
//     mutationFn: async (id) => {
//       const response = await apiClient.delete(`/bundles/${id}`);
//       return response.data;
//     }
//   });
// };

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';

// 🔹 Get Bundles
export const useBundles = (filters = {}) => {
  const { title = '', category = '', page = null, limit = null } = filters;

  const params = {
    ...(title && { title }),
    ...(category && { category }),
    ...(page && { page }),
    ...(limit && { limit })
  };

  const { data, refetch, ...rest } = useQuery({
    queryKey: ['bundles', params],
    queryFn: async () => {
      const response = await apiClient.get('/bundles', { params });
      return response.data;
    }
  });

  return { data, refetch, ...rest };
};

// 🔹 Get Bundle by ID
export const useBundleById = (id) => {
  const { data, refetch, ...rest } = useQuery({
    queryKey: ['bundle', id],
    queryFn: async () => {
      const response = await apiClient.get(`/bundles/${id}`);
      return response.data;
    },
    enabled: !!id
  });

  return { data, refetch, ...rest };
};

// 🔹 Check if Bundle Exists
export const useBundleExists = (id) => {
  const { data, refetch, ...rest } = useQuery({
    queryKey: ['bundle-exists', id],
    queryFn: async () => {
      const response = await apiClient.get(`/bundles/${id}/exists`);
      return response.data;
    },
    enabled: !!id
  });

  return { data, refetch, ...rest };
};

// Helper: invalidate ALL queries
const useInvalidateAll = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [], exact: false });
};

// 🔹 Create Bundle
export const useCreateBundle = () => {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.post('/bundles', payload);
      return response.data;
    },
    onSuccess: () => invalidateAll()
  });
};

// 🔹 Update Bundle
export const useUpdateBundle = () => {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await apiClient.put(`/bundles/${id}`, payload);
      return response.data;
    },
    onSuccess: () => invalidateAll()
  });
};

// 🔹 Delete Bundle
export const useDeleteBundle = () => {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`/bundles/${id}`);
      return response.data;
    },
    onSuccess: () => invalidateAll()
  });
};
