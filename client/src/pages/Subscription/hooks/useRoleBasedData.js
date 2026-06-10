import { useAuth } from 'contexts/AuthContext';
import { useGetUsers, useGetContributorUsers, useGetGroupLeaderUsers } from 'api/queries/users';
import { useCompanies } from 'api/queries/companies';
import { useGetGroups } from 'api/queries/groups';

/**
 * Custom hook that returns the appropriate query based on role, tab, and filters
 * CRITICAL: Only fetches data for the ACTIVE tab to prevent unnecessary API calls
 */
const useRoleBasedData = (activeTab, filters) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role;

  // ==================== PARTNERS TAB ====================
  // Only for admin
  const partnersQuery = useGetUsers({
    role: 'contributor',
    enabled: activeTab === 'partners' && role === 'admin'
  });

  // ==================== COMPANIES TAB ====================
  const companiesQueryFilters =
    role === 'admin'
      ? {
          createdBy: filters.contributorId,
          enabled: activeTab === 'companies'
        }
      : {
          createdBy: currentUser?.id,
          enabled: activeTab === 'companies'
        };

  const companiesQuery = useCompanies(companiesQueryFilters);

  // ==================== GROUPS TAB ====================
  const groupsQueryFilters = (() => {
    if (role === 'admin') {
      return {
        createdBy: filters.contributorId,
        companyId: filters.companyId,
        enabled: activeTab === 'groups'
      };
    } else if (role === 'contributor') {
      return {
        createdBy: currentUser?.id,
        companyId: filters.companyId,
        enabled: activeTab === 'groups'
      };
    } else if (role === 'groupLeader') {
      return {
        groupLeaderId: currentUser?.id, // Get assigned groups
        enabled: activeTab === 'groups'
      };
    }
    return { enabled: false };
  })();

  const groupsQuery = useGetGroups(groupsQueryFilters);

  // ==================== GROUP LEADERS TAB ====================
  // ADMIN: Use get-users endpoint
  const adminGroupLeadersQuery = useGetUsers({
    role: 'groupLeader',
    contributorId: filters.contributorId,
    companyId: filters.companyId,
    groupId: filters.groupId,
    enabled: activeTab === 'groupLeaders' && role === 'admin'
  });

  // CONTRIBUTOR: Use contributor/my-users endpoint
  const contributorGroupLeadersQuery = useGetContributorUsers({
    role: 'groupLeader',
    companyId: filters.companyId,
    groupId: filters.groupId,
    enabled: activeTab === 'groupLeaders' && role === 'contributor'
  });

  // GROUP LEADER: Use group-leader/my-users endpoint
  const groupLeaderGroupLeadersQuery = useGetGroupLeaderUsers({
    role: 'groupLeader',
    groupId: filters.groupId,
    enabled: activeTab === 'groupLeaders' && role === 'groupLeader'
  });

  // ==================== STAFF TAB ====================
  // ADMIN: Use get-users endpoint
  const adminStaffQuery = useGetUsers({
    role: 'subscriber',
    contributorId: filters.contributorId,
    companyId: filters.companyId,
    groupId: filters.groupId,
    enabled: activeTab === 'staff' && role === 'admin'
  });

  // CONTRIBUTOR: Use contributor/my-users endpoint
  const contributorStaffQuery = useGetContributorUsers({
    role: 'subscriber',
    companyId: filters.companyId,
    groupId: filters.groupId,
    enabled: activeTab === 'staff' && role === 'contributor'
  });

  // GROUP LEADER: Use group-leader/my-users endpoint
  const groupLeaderStaffQuery = useGetGroupLeaderUsers({
    role: 'subscriber',
    groupId: filters.groupId,
    enabled: activeTab === 'staff' && role === 'groupLeader'
  });

  // ==================== RETURN APPROPRIATE QUERY ====================
  switch (activeTab) {
    case 'partners':
      return {
        data: partnersQuery.data?.data || [],
        isLoading: partnersQuery.isLoading,
        error: partnersQuery.error,
        refetch: partnersQuery.refetch
      };

    case 'companies':
      return {
        data: companiesQuery.data?.data || [],
        isLoading: companiesQuery.isLoading,
        error: companiesQuery.error,
        refetch: companiesQuery.refetch
      };

    case 'groups':
      return {
        data: groupsQuery.data?.data || [],
        isLoading: groupsQuery.isLoading,
        error: groupsQuery.error,
        refetch: groupsQuery.refetch
      };

    case 'groupLeaders':
      if (role === 'admin') {
        return {
          data: adminGroupLeadersQuery.data?.data || [],
          isLoading: adminGroupLeadersQuery.isLoading,
          error: adminGroupLeadersQuery.error,
          refetch: adminGroupLeadersQuery.refetch
        };
      } else if (role === 'contributor') {
        return {
          data: contributorGroupLeadersQuery.data?.data || [],
          isLoading: contributorGroupLeadersQuery.isLoading,
          error: contributorGroupLeadersQuery.error,
          refetch: contributorGroupLeadersQuery.refetch
        };
      } else {
        return {
          data: groupLeaderGroupLeadersQuery.data?.data || [],
          isLoading: groupLeaderGroupLeadersQuery.isLoading,
          error: groupLeaderGroupLeadersQuery.error,
          refetch: groupLeaderGroupLeadersQuery.refetch
        };
      }

    case 'staff':
      if (role === 'admin') {
        return {
          data: adminStaffQuery.data?.data || [],
          isLoading: adminStaffQuery.isLoading,
          error: adminStaffQuery.error,
          refetch: adminStaffQuery.refetch
        };
      } else if (role === 'contributor') {
        return {
          data: contributorStaffQuery.data?.data || [],
          isLoading: contributorStaffQuery.isLoading,
          error: contributorStaffQuery.error,
          refetch: contributorStaffQuery.refetch
        };
      } else {
        return {
          data: groupLeaderStaffQuery.data?.data || [],
          isLoading: groupLeaderStaffQuery.isLoading,
          error: groupLeaderStaffQuery.error,
          refetch: groupLeaderStaffQuery.refetch
        };
      }

    default:
      return {
        data: [],
        isLoading: false,
        error: null,
        refetch: () => {}
      };
  }
};

export default useRoleBasedData;
