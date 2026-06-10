import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client'; // assumes apiClient is axios with auth headers
import { deleteGophishGroup } from 'utils/gophishUtils';

/**
 * GET GROUPS - with optional filters + enabled flag
 */
export const useGetGroups = (filters = {}) => {
  const { enabled = true, ...queryFilters } = filters;

  return useQuery({
    queryKey: ['groups', queryFilters],
    queryFn: async () => {
      const response = await apiClient.get('/groups/get-groups', {
        params: queryFilters // name, companyId, page, limit, etc.
      });

      return response.data; // { success, data, pagination, requestedBy }
    },
    enabled // ✅ respects enabled flag
  });
};

// Plain API function
export const getGroupMembers = async (groupId) => {
  if (!groupId) throw new Error('Group ID is required');
  const response = await apiClient.get(`/groups/${groupId}/members`);
  return response.data;
  // { success, data: members[], count, requestedBy }
};

export const useGetGroupMembers = (groupId) => {
  return useQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: () => getGroupMembers(groupId),
    enabled: !!groupId // only run when groupId is provided
  });
};

// Plain API function (can be used anywhere)
export const getGroupsByCompany = async (companyId) => {
  if (!companyId) throw new Error('Company ID is required');
  const response = await apiClient.get(`/groups/company/${companyId}`);
  return response.data; // success, data, count, requestedBy
};
// Hook version
export const useGetGroupsByCompany = () => {
  return useMutation({
    mutationFn: getGroupsByCompany
  });
};

// Hook for creating a group with leader (new mutation)
export const useCreateGroupWithLeader = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.post('/groups/with-leader', payload);
      return response.data; // { success, data, message, createdBy }
    }
  });
};

// New hook for toggling group status
export const useToggleGroupStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId) => {
      const response = await apiClient.patch(`/groups/${groupId}/status`);
      return response.data; // { success, data, message, updatedBy }
    },
    onSuccess: () => {
      // Invalidate groups queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, gophishGroupId }) => {
      if (!groupId) throw new Error('Group ID is required');

      // Step 1: Cleanup in GoPhish (optional failure handling)
      if (gophishGroupId) {
        try {
          await deleteGophishGroup(gophishGroupId);
        } catch (err) {
          console.warn(`GoPhish cleanup failed for group ${gophishGroupId}`, err);
          // Don't throw — proceed to backend deletion
        }
      }

      // Step 2: Delete group in backend
      const response = await apiClient.delete(`/groups/${groupId}`);
      return response.data; // { success, message, deletedBy }
    },
    onSuccess: () => {
      // Refresh groups list
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
};

export const useCreateGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, userData }) => {
      if (!groupId) throw new Error('Group ID is required');
      if (!userData) throw new Error('User data is required');

      const response = await apiClient.post(`/groups/${groupId}/members/new`, userData);

      return response.data;
      // { success, data: { user, groupUser }, message, createdBy }
    },
    onSuccess: (_, { groupId }) => {
      // Refresh members list for this specific group
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

      // Optionally refresh the whole groups list if member count is shown
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });
};
//BUlk users add:
export const useBulkCreateGroupMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, users }) => {
      if (!groupId) throw new Error('Group ID is required');
      if (!users || !Array.isArray(users) || users.length === 0) {
        throw new Error('Users array is required and must not be empty');
      }

      const response = await apiClient.post(`/groups/${groupId}/members/bulk`, {
        users
      });

      return response.data;
      /*
        {
          success,
          message,
          data: {
            created: [...],
            errors: [...]
          },
          createdBy: { id, role }
        }
      */
    },
    onSuccess: (_, { groupId }) => {
      // Refresh members list for this group
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });

      // Optionally refresh the whole groups list if member count is displayed
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });
};
export const useAddGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, userId, role }) => {
      if (!groupId) throw new Error('Group ID is required');
      if (!userId) throw new Error('User ID is required');
      if (!role) throw new Error('Role is required');

      const response = await apiClient.post(`/groups/${groupId}/members`, {
        userId,
        role
      });

      return response.data;
      // { success, data: groupUser, message, createdBy }
    },
    onSuccess: (_, { groupId }) => {
      // Refresh this group's members list
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
};

export const removeGroupMember = async ({ groupId, userId }) => {
  const response = await apiClient.delete(`/groups/${groupId}/members/${userId}`);
  return response.data; // { success, message, deletedBy }
};

export const useRemoveGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeGroupMember,
    mutationFn: removeGroupMember,
    onSuccess: (_, { groupId }) => {
      // Refresh dashboard stats
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Error removing group member:', error);
    }
  });
};
