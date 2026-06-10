import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';

// ---------------------
// 📌 GET: All Lessons
// ---------------------
export const useLessons = (filters = {}) => {
  const { title = '', courseId = '', page = null, limit = null } = filters;

  const params = {
    ...(title && { title }),
    ...(courseId && { courseId }),
    ...(page && { page }),
    ...(limit && { limit })
  };

  const { data, refetch, ...rest } = useQuery({
    queryKey: ['lessons', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/lessons', { params });
      return data;
    }
  });

  return { data, refetch, ...rest };
};

// ---------------------
// 📌 GET: Lessons by Course
// ---------------------
export const useLessonsByCourse = (courseId, pagination = {}) => {
  const { page = null, limit = null } = pagination;

  const params = {
    ...(page && { page }),
    ...(limit && { limit })
  };

  const { data, refetch, ...rest } = useQuery({
    queryKey: ['lessons-by-course', courseId, params],
    queryFn: async () => {
      const { data } = await apiClient.get(`/lessons/course/${courseId}`, { params });
      return data;
    },
    enabled: !!courseId
  });

  return { data, refetch, ...rest };
};

// ---------------------
// 📌 GET: Lesson by ID
// ---------------------
export const useLessonById = (id) => {
  const { data, refetch, ...rest } = useQuery({
    queryKey: ['lesson', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/lessons/${id}`);
      return data;
    },
    enabled: !!id
  });

  return { data, refetch, ...rest };
};

// ---------------------
// 📌 Mutations with Optimized Invalidation
// ---------------------
export const useCreateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post('/lessons', payload);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant lists
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ['lessons-by-course', variables.courseId] });
      }
    }
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await apiClient.put(`/lessons/${id}`, payload);
      return data;
    },
    onSuccess: (_, { id, payload }) => {
      // Update specific lesson cache
      queryClient.invalidateQueries({ queryKey: ['lesson', id] });

      // If courseId is present, refresh that course's lessons
      if (payload.courseId) {
        queryClient.invalidateQueries({ queryKey: ['lessons-by-course', payload.courseId] });
      }

      // Also refresh the main lessons list
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    }
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await apiClient.delete(`/lessons/${id}`);
      return data;
    },
    onSuccess: (_, id) => {
      // Invalidate lesson details
      queryClient.invalidateQueries({ queryKey: ['lesson', id] });

      // Invalidate lists (keeps it fresh)
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lessons-by-course'] });
    }
  });
};
