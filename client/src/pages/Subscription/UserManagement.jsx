import { useState, useEffect } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { toast } from 'utils/toast';
import { useUpdateUser } from 'api/queries/users';
import { useGetUsers } from 'api/queries/users';
import { useCompanies } from 'api/queries/companies';
import { useGetGroups } from 'api/queries/groups';
import useHandleDeleteUser from 'hooks/useDeleteUser';
import UserManagementTable from './components/UserManagementTable';
import { getTabConfigForRole } from './components/TabConfig';
import useRoleBasedData from './hooks/useRoleBasedData';
import DashboardStats from 'components/DashboardStats';
import { Box } from '@mui/system';

const UserManagement = () => {
    const { currentUser } = useAuth();
    const role = currentUser?.role;

    // Get role-specific configuration
    const tabConfig = getTabConfigForRole(role);
    const [activeTab, setActiveTab] = useState(tabConfig.defaultTab);

    // Filter state
    const [filters, setFilters] = useState({
        contributorId: null,
        searchedContributor: '',
        companyId: null,
        companyName: '',
        groupId: null,
        groupName: '',
    });

    // UI state
    const [currentId, setCurrentId] = useState(null);
    const [editingUser, setEditingUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [delbtnloader, setDelbtnloader] = useState([]);

    // Fetch data for ACTIVE TAB ONLY
    const {
        data: tableData,
        isLoading: dataLoading,
        refetch: refetchData,
    } = useRoleBasedData(activeTab, filters);

    // Get contributors for filter (admin only) - ALWAYS ENABLED
    const { data: allUsersData } = useGetUsers({
        role: 'contributor',
        enabled: role === 'admin',
    });
    const contributors = allUsersData?.data || [];

    // Get companies for filter - ONLY when needed
    const shouldFetchCompanies =
        role === 'admin'
            ? ['companies', 'groups', 'groupLeaders', 'staff'].includes(activeTab)
            : ['companies', 'groups', 'groupLeaders', 'staff'].includes(activeTab);

    const { data: companiesData } = useCompanies({
        createdBy: role === 'admin' ? filters.contributorId : currentUser?.id,
        enabled: shouldFetchCompanies,
    });
    const companies = companiesData?.data || [];

    // Get groups for filter - ONLY when needed
    const shouldFetchGroups = ['groups', 'groupLeaders', 'staff'].includes(activeTab);

    const groupsFilters = (() => {
        if (role === 'admin') {
            return {
                createdBy: filters.contributorId,
                companyId: filters.companyId,
                enabled: shouldFetchGroups,
            };
        } else if (role === 'contributor') {
            return {
                createdBy: currentUser?.id,
                companyId: filters.companyId,
                enabled: shouldFetchGroups,
            };
        } else if (role === 'groupLeader') {
            return {
                groupLeaderId: currentUser?.id,
                enabled: shouldFetchGroups,
            };
        }
        return { enabled: false };
    })();

    const { data: groupsData } = useGetGroups(groupsFilters);
    const groups = groupsData?.data || [];

    // Mutations
    const { mutateAsync: updateUser, isPending: isUpdatePending } = useUpdateUser();

    // Delete handlers
    const handleDeleteGroupLeader = useHandleDeleteUser({
        setLoading,
        setDelbtnloader,
        setDeleteLoading,
        getAllUsers: refetchData,
        type: 'Group Leader',
    });

    const handleDeleteSubscriber = useHandleDeleteUser({
        setLoading,
        setDelbtnloader,
        setDeleteLoading,
        getAllUsers: refetchData,
        type: 'Staff Member',
    });

    // Reset filters when tab changes
    useEffect(() => {
        setFilters({
            contributorId: null,
            searchedContributor: '',
            companyId: null,
            companyName: '',
            groupId: null,
            groupName: '',
        });
    }, [activeTab]);

    // Edit user handler
    const editUser = async ({ currentId, editingUser }) => {
        try {
            setLoading(true);

            const { id, createdAt, updatedAt, groupUsers, ...updateData } = editingUser;

            await updateUser({
                id: currentId,
                updateData,
            });

            setEditingUser({});
            toast({
                message: `User updated successfully!`,
                type: 'success',
            });

            // Refetch data after update
            refetchData();
        } catch (error) {
            toast({
                message: `Error updating user!`,
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    // Delete confirmation handlers
    const handleConfirmDeleteGroupLeader = async () => {
        if (!selectedUser) return;

        try {
            const gophishGroupId = selectedUser.groupUsers?.[0]?.group?.gophishGroupID;
            await handleDeleteGroupLeader(selectedUser);
            refetchData();
        } catch (error) {
            toast({
                message: error.message || 'Error deleting group leader!',
                type: 'error',
            });
        }
    };

    const handleConfirmDeleteSubs = async () => {
        if (!selectedUser) return;

        try {
            const gophishGroupId = selectedUser.groupUsers?.[0]?.group?.gophishGroupID;
            await handleDeleteSubscriber(selectedUser);
            refetchData();
        } catch (error) {
            toast({
                message: error.message || 'Error deleting staff member!',
                type: 'error',
            });
        }
    };

    // Filter change handler with cascade logic
    const handleFilterChange = (newFilters) => {
        setFilters((prev) => ({
            ...prev,
            ...newFilters,
        }));
    };

    return (
        <Box display={'flex'} flexDirection={'column'} gap={3}>
            <DashboardStats />

            <UserManagementTable
                role={role}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tableData={tableData}
                dataLoading={dataLoading}
                contributors={contributors}
                companies={companies}
                groups={groups}
                filters={filters}
                onFilterChange={handleFilterChange}
                currentId={currentId}
                setCurrentId={setCurrentId}
                editingUser={editingUser}
                setEditingUser={setEditingUser}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                editUser={editUser}
                handleConfirmDeleteGroupLeader={handleConfirmDeleteGroupLeader}
                handleConfirmDeleteSubs={handleConfirmDeleteSubs}
                loading={loading}
                isUpdatePending={isUpdatePending}
                loadingRemove={deleteLoading}
                refetchData={refetchData}
            />
        </Box>
    );
};

export default UserManagement;