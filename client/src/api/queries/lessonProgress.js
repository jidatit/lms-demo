import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';

// ✅ Get authenticated user's lesson progress with optional filtering
// Filters: { courseId?, userCourseId?, lessonId?, isCompleted? }
export const useMyLessonProgress = (filters = {}) => {
  const { courseId, userCourseId, lessonId, isCompleted } = filters;

  const params = {
    ...(courseId && { courseId }),
    ...(userCourseId && { userCourseId }),
    ...(lessonId && { lessonId }),
    ...(isCompleted !== undefined && { isCompleted: isCompleted.toString() })
  };

  const { data, refetch, ...rest } = useQuery({
    queryKey: ['my-lesson-progress', params],
    queryFn: async () => {
      const response = await apiClient.get('/courseLessonProgresses/my-progress', { params });
      return response.data; // { success, data: [...], pagination, requestedBy }
    },
    enabled: !!(courseId || userCourseId) // Only fetch if courseId or userCourseId is provided
  });

  return { data, refetch, ...rest };
};

// ✅ Check if lesson progress exists by ID (deprecated - endpoint expects progress ID, not courseId)
// Keep for backward compatibility but consider removing if not used elsewhere
export const useLessonProgressExists = (id) => {
  const { data, refetch, ...rest } = useQuery({
    queryKey: ['lesson-progress-exists', id],
    queryFn: async () => {
      const response = await apiClient.get(`/courseLessonProgresses/${id}/exists`);
      return response.data; // { success, data: { exists }, requestedBy }
    },
    enabled: !!id // ⚡ only fetch when id is provided
  });

  return { data, refetch, ...rest };
};

// ✅ Mutation to create lesson progress
export const useCreateLessonProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, userId, userCourseId, isCompleted = false }) => {
      const response = await apiClient.post('/courseLessonProgresses', {
        lessonId,
        userId,
        ...(userCourseId && { userCourseId }),
        isCompleted
      });
      return response.data; // { success, data, message, createdBy }
    },
    onSuccess: () => {
      // Invalidate progress queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['my-lesson-progress'] });
    }
  });
};

// ✅ Mutation to update lesson progress (mark as completed)
export const useUpdateLessonProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isCompleted, userCourseId }) => {
      const response = await apiClient.put(`/courseLessonProgresses/${id}`, {
        isCompleted,
        ...(userCourseId && { userCourseId })
      });
      return response.data; // { success, data, message, updatedBy }
    },
    onSuccess: () => {
      // Invalidate progress queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['my-lesson-progress'] });
    }
  });
};

// ✅ Mutation to toggle triggerCourse flag for a user course
export const useToggleTriggerCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userCourseId, triggerCourse }) => {
      const response = await apiClient.patch(`/userCourses/${userCourseId}/toggle-trigger`, {
        triggerCourse
      });
      return response.data; // { success, data, message, updatedBy }
    },
    onSuccess: (_, variables) => {
      // Invalidate user course queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['user-course', variables.userCourseId] });
      queryClient.invalidateQueries({ queryKey: ['user-courses'] });
    }
  });
};
