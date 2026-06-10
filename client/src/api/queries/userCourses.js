// hooks/useUserCourses.js
import { useQuery } from '@tanstack/react-query';
import apiClient from '../client';

// ✅ Fetch all user-courses (with optional filters)
export const useUserCourses = (filters = {}) => {
  const { userId = '', courseId = '', page = null, limit = null } = filters;

  const params = {
    ...(userId && { userId }),
    ...(courseId && { courseId }),
    ...(page && { page }),
    ...(limit && { limit })
  };

  const { data, refetch, ...rest } = useQuery({
    queryKey: ['user-courses', params],
    queryFn: async () => {
      const response = await apiClient.get('/userCourses', { params });
      return response.data;
    },
    enabled: !!userId // ⚡ only call if userId is provided
  });

  return { data, refetch, ...rest };
};

// ✅ Fetch a single user-course by ID
export const useUserCourseById = (id) => {
  const { data, refetch, ...rest } = useQuery({
    queryKey: ['user-course', id],
    queryFn: async () => {
      const response = await apiClient.get(`/userCourses/${id}`);
      return response.data;
    },
    enabled: !!id // ⚡ only fetch when id is provided
  });

  return { data, refetch, ...rest };
};
