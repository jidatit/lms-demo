// hooks/useHelpdesk.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client'; // your axios instance

// ---------------------------------------------------------------------
// 2. CREATE TICKET (files instead of attachments)
// ---------------------------------------------------------------------
export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subject, categoryId, description, files }) => {
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('categoryId', categoryId);
      formData.append('description', description);

      if (files && files.length > 0) {
        files.forEach((file) => formData.append('files', file));
      }

      const { data } = await apiClient.post('/helpdesk/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpdeskTickets'] });
    }
  });
};

// ---------------------------------------------------------------------
// 3. LIST TICKETS (with filters & pagination)
// ---------------------------------------------------------------------
export const useHelpdeskTickets = (filters = {}) => {
  return useQuery({
    queryKey: ['helpdeskTickets', filters],
    queryFn: async () => {
      const { data } = await apiClient.get('/helpdesk/tickets', {
        params: filters
      });
      return data; // { tickets: [...], pagination: {...} }
    },
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true
  });
};

// ---------------------------------------------------------------------
// 4. GET SINGLE TICKET (with replies & attachments)
// ---------------------------------------------------------------------
export const useHelpdeskTicket = (ticketId) => {
  return useQuery({
    queryKey: ['helpdeskTicket', ticketId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/helpdesk/tickets/${ticketId}`);
      return data;
    },
    enabled: !!ticketId
  });
};

// ---------------------------------------------------------------------
// 5. ADD REPLY (files instead of attachments)
// ---------------------------------------------------------------------
export const useAddReply = (ticketId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ message, files }) => {
      const formData = new FormData();
      formData.append('message', message);
      if (files && files.length > 0) {
        files.forEach((file) => formData.append('files', file));
      }

      const { data } = await apiClient.post(`/helpdesk/tickets/${ticketId}/reply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpdeskTicket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['helpdeskTickets'] });
    }
  });
};

// ---------------------------------------------------------------------
// 6. CLOSE TICKET
// ---------------------------------------------------------------------
export const useCloseTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId) => {
      const { data } = await apiClient.patch(`/helpdesk/tickets/${ticketId}/close`);
      return data;
    },
    onSuccess: (_, ticketId) => {
      queryClient.invalidateQueries({ queryKey: ['helpdeskTicket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['helpdeskTickets'] });
    }
  });
};

// ---------------------------------------------------------------------
// 7. DELETE TICKET (admin only)
// ---------------------------------------------------------------------
export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId) => {
      const { data } = await apiClient.delete(`/helpdesk/tickets/${ticketId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpdeskTickets'] });
      queryClient.invalidateQueries({ queryKey: ['helpdeskStats'] });
      queryClient.invalidateQueries({ queryKey: ['helpdeskDashboard'] });
    }
  });
};

// ---------------------------------------------------------------------
// 8. GET CATEGORIES (for dropdown)
// ---------------------------------------------------------------------
export const useHelpdeskCategories = () => {
  return useQuery({
    queryKey: ['helpdeskCategories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/helpdesk/categories');
      return data; // { data: [{ id, name }] }
    },
    staleTime: 10 * 60 * 1000
  });
};

// ---------------------------------------------------------------------
// 8. DELETE REPLY (admin only)
// ---------------------------------------------------------------------
export const useDeleteReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, replyId }) => {
      const { data } = await apiClient.delete(`/helpdesk/tickets/${ticketId}/replies/${replyId}`);
      return data;
    },
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['helpdeskTicket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['helpdeskTickets'] });
    }
  });
};

// ---------------------------------------------------------------------
// 9. GET STATS (with optional enabled)
// ---------------------------------------------------------------------
export const useHelpdeskStats = (options = {}) => {
  return useQuery({
    queryKey: ['helpdeskStats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/helpdesk/stats');
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options // 👈 allows passing { enabled: false } etc.
  });
};

// ---------------------------------------------------------------------
// 10. GET DASHBOARD (cards + 7-day charts) (with optional enabled)
// ---------------------------------------------------------------------
export const useHelpdeskDashboard = (options = {}) => {
  return useQuery({
    queryKey: ['helpdeskDashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get('/helpdesk/dashboard');
      return data.data; // array of 3 cards
    },
    staleTime: 5 * 60 * 1000,
    ...options // 👈 allows passing { enabled: false } etc.
  });
};
