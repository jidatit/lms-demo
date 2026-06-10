import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../client';

export const useCourses = (filters = {}) => {
  const { title = '', description = '', createdBy = '', bundleId = '', page = null, limit = null } = filters;

  const params = {
    ...(title && { title }),
    ...(description && { description }),
    ...(createdBy && { createdBy }),
    ...(bundleId && { bundleId }),
    ...(page && { page }),
    ...(limit && { limit })
  };

  const { data, refetch, ...rest } = useQuery({
    queryKey: ['courses', params],
    queryFn: async () => {
      const response = await apiClient.get('/courses', { params });
      return response.data;
    }
  });

  return { data, refetch, ...rest };
};

export const useMyCourses = (filters = {}) => {
  const { title = '', description = '', page = null, limit = null } = filters;

  const params = {
    ...(title && { title }),
    ...(description && { description }),
    ...(page && { page }),
    ...(limit && { limit })
  };

  const { data, refetch, ...rest } = useQuery({
    queryKey: ['my-courses', params],
    queryFn: async () => {
      const response = await apiClient.get('/courses/my-courses', { params });
      return response.data;
    }
  });

  return { data, refetch, ...rest };
};

export const useCourseById = (id) => {
  const { data, refetch, ...rest } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const response = await apiClient.get(`/courses/${id}`);
      return response.data;
    },
    enabled: !!id
  });

  return { data, refetch, ...rest };
};

export const useCourseExists = (id) => {
  const { data, refetch, ...rest } = useQuery({
    queryKey: ['course-exists', id],
    queryFn: async () => {
      const response = await apiClient.get(`/courses/${id}/exists`);
      return response.data; // { exists: true/false }
    },
    enabled: !!id
  });

  return { data, refetch, ...rest };
};

export const useCreateCourse = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.post('/courses', payload);
      return response.data;
    }
  });
};

export const useUpdateCourse = () => {
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await apiClient.put(`/courses/${id}`, payload);
      console.log('response response');
      return response.data;
    }
  });
};

export const useDeleteCourse = () => {
  return useMutation({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`/courses/${id}`);
      return response.data; // { success, message }
    }
  });
};
