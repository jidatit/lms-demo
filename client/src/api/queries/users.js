import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';

// export const useGetUsers = () => {
//   return useMutation({
//     mutationFn: async (filters = {}) => {
//       const response = await apiClient.get('/users/get-users', {
//         params: filters
//       });
//       return response.data; // { success, data, pagination, requestedBy }
//     }
//   });
// };
/**
 * ADMIN - Get all users with advanced filters
 * Can filter by contributorId, companyId, groupId
 */
export const useGetUsers = (filters = {}) => {
  const { enabled = true, ...queryFilters } = filters;

  return useQuery({
    queryKey: ['users', queryFilters],
    queryFn: async () => {
      const params = {};
      if (queryFilters.role) params.role = queryFilters.role;
      if (queryFilters.contributorId) params.contributorId = queryFilters.contributorId;
      if (queryFilters.companyId) params.companyId = queryFilters.companyId;
      if (queryFilters.groupId) params.groupId = queryFilters.groupId;
      if (queryFilters.search) params.search = queryFilters.search;
      if (queryFilters.isActive !== undefined) params.isActive = queryFilters.isActive;

      const response = await apiClient.get('/users/get-users', { params });
      return response.data;
    },
    enabled: enabled && !!queryFilters.role // Only fetch when role is specified AND enabled
  });
};

/**
 * Get dashboard statistics based on user role
 * Returns different metrics for Admin, Contributor, and Group Leader
 */
export const useGetDashboardStats = (options = {}) => {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/users/stats/dashboard');
      return response.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * CONTRIBUTOR - Get users from their companies/groups
 * Automatically scoped to current contributor
 */
export const useGetContributorUsers = (filters = {}) => {
  const { enabled = true, ...queryFilters } = filters;

  return useQuery({
    queryKey: ['contributor-users', queryFilters],
    queryFn: async () => {
      const params = {};
      if (queryFilters.role) params.role = queryFilters.role;
      if (queryFilters.companyId) params.companyId = queryFilters.companyId;
      if (queryFilters.groupId) params.groupId = queryFilters.groupId;
      if (queryFilters.search) params.search = queryFilters.search;
      if (queryFilters.isActive !== undefined) params.isActive = queryFilters.isActive;

      const response = await apiClient.get('/users/contributor/my-users', { params });
      return response.data;
    },
    enabled: enabled && !!queryFilters.role // Only fetch when role is specified AND enabled
  });
};
/**
 * GROUP LEADER - Get users from their assigned groups
 * Automatically scoped to current group leader
 */
export const useGetGroupLeaderUsers = (filters = {}) => {
  const { enabled = true, ...queryFilters } = filters;

  return useQuery({
    queryKey: ['group-leader-users', queryFilters],
    queryFn: async () => {
      const params = {};
      if (queryFilters.role) params.role = queryFilters.role;
      if (queryFilters.groupId) params.groupId = queryFilters.groupId;
      if (queryFilters.search) params.search = queryFilters.search;
      if (queryFilters.isActive !== undefined) params.isActive = queryFilters.isActive;

      const response = await apiClient.get('/users/group-leader/my-users', { params });
      return response.data;
    },
    enabled: enabled && !!queryFilters.role // Only fetch when role is specified AND enabled
  });
};

/**
 * Check if user exists by email
 */
export const useCheckUserByEmail = () => {
  return useMutation({
    mutationFn: async (email) => {
      const response = await apiClient.post('/users/check-email', { email });
      return response.data;
    }
  });
};

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async ({ id, updateData }) => {
      const response = await apiClient.put(`/users/${id}/update-user`, updateData);
      return response.data; // { success, message, data, updatedBy }
    }
  });
};

/**
 * DELETE /api/users/:id/delete-user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`/users/${id}/delete-user`);
      return response.data; // { success, message, deletedBy }
    },
    onSuccess: () => {
      // Refresh dashboard stats
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
};

/**
 * POST /api/users/create-user
 * Generic user creation hook
 * Pass role and signInType from caller
 */
export const useCreateUser = () => {
  return useMutation({
    mutationFn: async (formData) => {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role, // dynamic role
        signInType: formData.signInType, // dynamic sign-in type
        isActive: true // default true (can change if needed)
      };

      const response = await apiClient.post('/users/create-user', payload);
      return response.data; // { success, message, data }
    }
  });
};

/**
 * POST /api/v1/users/change-password
 * Change password for authenticated user
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.post('/users/change-password', payload);
      return response.data; // { success: true, message: 'Password changed successfully' }
    }
  });
};
