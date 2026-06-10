// hooks/useUserProfile.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';

// ✅ Fetch the authenticated user's profile
export const useUserProfile = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await apiClient.get('/userProfile');
      return response.data;
    },
    // Optimize: Cache for 5 minutes, consider stale after 5 minutes
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    // Retry failed requests up to 3 times
    retry: 3,
    // Handle errors gracefully
    onError: (err) => {
      console.error('Error fetching user profile:', err);
    }
  });

  return { data, isLoading, error, refetch };
};

// ✅ Update the authenticated user's profile

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (profileData) => {
      const { data } = await apiClient.patch('/userProfile', profileData);
      return data;
    },

    onMutate: async (newProfile) => {
      await queryClient.cancelQueries(['userProfile']);
      const previousProfile = queryClient.getQueryData(['userProfile']);

      queryClient.setQueryData(['userProfile'], (old) => ({
        ...old,
        data: { ...old?.data, ...newProfile }
      }));

      return { previousProfile };
    },

    onError: (err, _, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['userProfile'], context.previousProfile);
      }
      console.error('Profile update failed:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries(['userProfile']);
    }
  });

  return {
    updateUserProfile: mutation.mutate, // for fire-and-forget usage
    updateUserProfileAsync: mutation.mutateAsync, // for async/await usage
    isUpdating: mutation.isPending, // ✅ use isPending for React Query v5
    error: mutation.error
  };
};

//  Simple and clear upload hook
export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const { data } = await apiClient.post('/userProfile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return data;
    },

    onMutate: async (file) => {
      await queryClient.cancelQueries(['userProfile']);
      const previous = queryClient.getQueryData(['userProfile']);

      // Temporary preview while uploading
      queryClient.setQueryData(['userProfile'], (old) => ({
        ...old,
        data: {
          ...old?.data,
          profilePictureUrl: URL.createObjectURL(file)
        }
      }));

      return { previous };
    },

    onError: (error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['userProfile'], context.previous);
      }
    },

    onSuccess: (data) => {
      queryClient.setQueryData(['userProfile'], (old) => ({
        ...old,
        data: {
          ...old?.data,
          profilePictureUrl: data?.profilePictureUrl
        }
      }));
    },

    onSettled: () => {
      queryClient.invalidateQueries(['userProfile']);
    }
  });

  return {
    uploadProfilePicture: mutation.mutate,
    uploadProfilePictureAsync: mutation.mutateAsync,
    isUploading: mutation.isPending, // ✅ Use isPending instead of isLoading in React Query v5
    isSuccess: mutation.isSuccess,
    error: mutation.error
  };
};

export const useAdminProfile = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: async () => {
      const response = await apiClient.get('/userProfile/admin');
      return response.data; // { success: true, data: { id, firstName, ... } }
    },
    // Optimize: Cache for 5 minutes, consider stale after 5 minutes
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    // Retry failed requests up to 3 times
    retry: 3,
    // Handle errors gracefully
    onError: (err) => {
      console.error('Error fetching admin profile:', err);
    }
  });

  return { data, isLoading, error, refetch };
};
