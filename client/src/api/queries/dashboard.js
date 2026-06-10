import { useQuery } from '@tanstack/react-query';
import apiClient from '../client';

/**
 * Dashboard API Queries
 * Following the same pattern as other query files
 */

/**
 * Get Dashboard Summary (4 stat cards: registrations, expirations, groups, receivables)
 * @param {Object} filters - Optional filters: { contributorId, companyId, groupId }
 */
export const useDashboardSummary = (filters = {}) => {
  const { contributorId = '', companyId = '', groupId = '' } = filters;

  const params = {
    ...(contributorId && { contributorId }),
    ...(companyId && { companyId }),
    ...(groupId && { groupId })
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'summary', params],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/summary', { params });
      return response.data; // { success: true, data: { registrations, expirations, groups, totalReceivables } }
    },
    staleTime: 2 * 60 * 1000, // Consider fresh for 2 minutes
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 2,
    onError: (err) => {
      console.error('Error fetching dashboard summary:', err);
    }
  });

  return { data, isLoading, error, refetch };
};

/**
 * Get Subscription Stats (seat utilization: purchased vs allocated)
 * @param {Object} filters - Optional filters: { contributorId, companyId, bundleId }
 */
export const useSubscriptionStats = (filters = {}) => {
  const { contributorId = '', companyId = '', bundleId = '' } = filters;

  const params = {
    ...(contributorId && { contributorId }),
    ...(companyId && { companyId }),
    ...(bundleId && { bundleId })
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'subscription-stats', params],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/subscription-stats', { params });
      return response.data; // { success: true, data: { totalPurchased, totalAllocated, utilizationPercentage, chartData } }
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    retry: 2,
    onError: (err) => {
      console.error('Error fetching subscription stats:', err);
    }
  });

  return { data, isLoading, error, refetch };
};

/**
 * Get Enrollment Rate by Bundle (pie chart data)
 * @param {Object} filters - Optional filters: { contributorId, groupId, bundleId }
 */
export const useEnrollmentRate = (filters = {}) => {
  const { contributorId = '', groupId = '', bundleId = '' } = filters;

  const params = {
    ...(contributorId && { contributorId }),
    ...(groupId && { groupId }),
    ...(bundleId && { bundleId })
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'enrollment-rate', params],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/enrollment-rate', { params });
      return response.data; // { success: true, data: { bundles: [{ bundleId, bundleName, enrollmentCount }] } }
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    retry: 2,
    onError: (err) => {
      console.error('Error fetching enrollment rate:', err);
    }
  });

  return { data, isLoading, error, refetch };
};

/**
 * Get Abandonment Rates (invitation funnel: sent, accepted, active)
 * @param {Object} filters - Optional filters: { contributorId, groupId }
 */
export const useAbandonmentRates = (filters = {}) => {
  const { contributorId = '', groupId = '' } = filters;

  const params = {
    ...(contributorId && { contributorId }),
    ...(groupId && { groupId })
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'abandonment-rates', params],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/abandonment-rates', { params });
      return response.data; // { success: true, data: { sent, accepted, active, percentage } }
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    retry: 2,
    onError: (err) => {
      console.error('Error fetching abandonment rates:', err);
    }
  });

  return { data, isLoading, error, refetch };
};

/**
 * Get Completion Rate by Status over Time (pending, active, completed, expired)
 * @param {Object} filters - Optional filters: { contributorId, groupId, period (weekly/monthly) }
 */
export const useCompletionRate = (filters = {}) => {
  const { contributorId = '', groupId = '', period = 'monthly' } = filters;

  const params = {
    ...(contributorId && { contributorId }),
    ...(groupId && { groupId }),
    ...(period && { period }) // weekly or monthly
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'completion-rate', params],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/completion-rate', { params });
      return response.data; // { success: true, data: { pending: { dates, values }, active: { dates, values }, completed: { dates, values }, expired: { dates, values } } }
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    retry: 2,
    onError: (err) => {
      console.error('Error fetching completion rate:', err);
    }
  });

  return { data, isLoading, error, refetch };
};

/**
 * Get Engagement Rate (most active groups based on user engagement)
 * @param {Object} filters - Optional filters: { contributorId, groupId }
 */
export const useEngagementRate = (filters = {}) => {
  const { contributorId = '', groupId = '' } = filters;

  const params = {
    ...(contributorId && { contributorId }),
    ...(groupId && { groupId })
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'engagement-rate', params],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/engagement-rate', { params });
      return response.data; // { success: true, data: { groups: [{ groupId, groupName, orgName, order, engagementScore }] } }
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    retry: 2,
    onError: (err) => {
      console.error('Error fetching engagement rate:', err);
    }
  });

  return { data, isLoading, error, refetch };
};
