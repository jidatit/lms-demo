// src/api/companyApi.js

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from 'api/client';

// Default query options
const QUERY_OPTIONS = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: true,
  refetchOnMount: false
};

// 1. Get all companies (with seat summary in table)
export const getCompanies = async (params = {}) => {
  const response = await apiClient.get('/companies', { params });
  return response.data;
};

export const useCompanies = (filters = {}) => {
  const { enabled = true, ...queryFilters } = filters;

  return useQuery({
    queryKey: ['companies', queryFilters],
    queryFn: () => getCompanies(queryFilters),
    enabled, // ✅ respects enabled flag
    ...QUERY_OPTIONS
  });
};

// ──────────────────────────────────────────────────────────────
// 2. Get seat dashboard for modal
export const getCompanySeatDashboard = async (companyId) => {
  const response = await apiClient.get(`/companies/${companyId}/seat-dashboard`);
  return response.data.data; // { company, summary, bundles }
};

export const useCompanySeatDashboard = (companyId) => {
  return useQuery({
    queryKey: ['company-seat-dashboard', companyId],
    queryFn: () => getCompanySeatDashboard(companyId),
    enabled: !!companyId,

    // FORCE fresh data every time
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
  });
};

// ──────────────────────────────────────────────────────────────
// 3. Assign seats (increases totalSeats correctly)
export const assignSeatsToCompany = async ({ companyId, bundleId, seatsToAssign }) => {
  const response = await apiClient.post(`/companies/${companyId}/assign-seats`, {
    bundleId,
    seatsToAssign
  });
  return response.data;
};

export const useAssignSeats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignSeatsToCompany,
    onSuccess: (data, variables) => {
      // Refresh both the list and the modal data
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({
        queryKey: ['company-seat-dashboard', variables.companyId]
      });
    }
  });
};

// ──────────────────────────────────────────────────────────────
// Existing CRUD (unchanged, pure JS)

export const createCompany = async (companyData) => {
  const response = await apiClient.post('/companies', companyData);
  return response.data;
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    }
  });
};

export const updateCompany = async ({ companyId, companyData }) => {
  const response = await apiClient.put(`/companies/${companyId}`, companyData);
  return response.data;
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    }
  });
};

export const deleteCompany = async (companyId) => {
  const response = await apiClient.delete(`/companies/${companyId}`);
  return response.data;
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    }
  });
};
