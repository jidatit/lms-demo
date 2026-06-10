import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useGetGroupMembers, useGetGroups } from 'api/queries/groups';
import { useGetUsers, useUpdateUser } from 'api/queries/users';
import useHandleDeleteUser from 'hooks/useDeleteUser';

import { useEffect, useState } from 'react';
import Users from '../components/SubscriptionsUsers';
import { useAuth } from 'contexts/AuthContext';
import { toast } from 'utils/toast';


const AllUsers = () => {
    const { currentUser } = useAuth();

    const [currentId, setCurrentId] = useState(null);
    const [editingUser, setEditingUser] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [ContributorsData, setContributorsData] = useState([]);
    const [GroupLeadersData, setGroupLeadersData] = useState([]);
    const [SubscribersData, setSubscribersData] = useState([]);

    const [searchedContributor, setSearchedContributor] = useState('');
    const [age, setAge] = useState('');
    const [SelectedGroupId, setSelectedGroupId] = useState('');
    const [groupsByContibutor, setGroupsByContibutor] = useState('');
    const [g_id, setg_Id] = useState(null);
    const [delbtnloader, setDelbtnloader] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);


    //ALL NEW MUTAIONS
    const { mutateAsync: getGroups, isPending, data, error } = useGetGroups();
    const { mutateAsync: getUsers, isPending: isUsersPending } = useGetUsers();
    const { mutateAsync: updateUser, isPending: isUpdatePending } = useUpdateUser();
    const { data: membersResponse, isPending: isGroupsPending } = useGetGroupMembers(SelectedGroupId);

    //FETCH ALL USERS
    useEffect(() => {
        fetchAndSetUsersByRole();
    }, []);

    const fetchAndSetUsersByRole = () => {
        getUsers(undefined, {
            onSuccess: (res) => {
                const allUsers = res.data;
                setContributorsData(allUsers.filter((u) => u.role === 'contributor'));
                setSubscribersData(allUsers.filter((u) => u.role === 'subscriber'));
                setGroupLeadersData(allUsers.filter((u) => u.role === 'groupLeader'));

            }
        });
    };
    //DELETE HANDLERS
    const handleDeleteGroupLeader = useHandleDeleteUser({
        setLoading,
        setDelbtnloader,
        setDeleteLoading,
        getAllUsers: fetchAndSetUsersByRole, // Use the unified fetch function
        type: 'Group Leader'
    });
    const handleDeleteSubscriber = useHandleDeleteUser({
        setLoading,
        setDelbtnloader,
        setDeleteLoading,
        getAllUsers: fetchAndSetUsersByRole, // Use the unified fetch function
        type: 'Subscriber'
    });

    const editUser = async ({ currentId, editingUser }) => {
        try {
            setLoading(true);

            const { id, createdAt, updatedAt, groupUsers, ...updateData } = editingUser;

            const response = await updateUser({
                id: currentId,
                updateData
            });
            // Update local state based on role
            const updatedUser = response.data; // or response.user, based on your API response

            if (editingUser.role === 'contributor') {
                setContributorsData((prev) => prev.map((user) => (user.id === currentId ? updatedUser : user)));
            } else if (editingUser.role === 'subscriber') {
                setSubscribersData((prev) => prev.map((user) => (user.id === currentId ? updatedUser : user)));
            } else if (editingUser.role === 'groupLeader') {
                setGroupLeadersData((prev) => prev.map((user) => (user.id === currentId ? updatedUser : user)));
            }

            setEditingUser({});
            toast({
                message: `${editingUser.role} updated successfully!`,
                type: 'success'
            });
        } catch (error) {
            toast({
                message: `Error updating ${editingUser.role}!`,
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDeleteGroupLeader = async () => {
        if (!selectedUser) return;

        try {
            const gophishGroupId = selectedUser.groupUsers?.[0]?.group?.gophishGroupID;

            await handleDeleteGroupLeader(selectedUser.id, selectedUser.email, gophishGroupId);
        } catch (error) {
            toast({
                message: error.message || 'Error fetching group data!',
                type: 'error'
            });
        }
    };

    useEffect(() => {
        if (membersResponse?.success) {
            const members = membersResponse.data || [];

            setGroupLeadersData(members.filter((m) => m.role === 'groupLeader'));
            setSubscribersData(members.filter((m) => m.role === 'subscriber'));
        }
    }, [membersResponse]);

    const handleConfirmDeleteSubs = async () => {
        if (!selectedUser) return;
        try {
            const gophishGroupId = selectedUser.groupUsers?.[0]?.group?.gophishGroupID;
            await handleDeleteSubscriber(selectedUser.id, selectedUser.email, gophishGroupId);
        } catch (error) {
            toast({
                message: error.message || 'Error fetching group data!',
                type: 'error'
            });
        }
    };


    return (
        <>
            <Users
                contributors={ContributorsData}
                subscribers={SubscribersData}
                groupleaders={GroupLeadersData}
                getUsers={fetchAndSetUsersByRole}
                age={age}
                editingUser={editingUser}
                setAge={setAge}
                setEditingUser={setEditingUser}
                editUser={editUser}
                setCurrentId={setCurrentId}
                SelectedGroupId={SelectedGroupId}
                setSelectedGroupId={setSelectedGroupId}
                searchedContributor={searchedContributor}
                setSearchedContributor={setSearchedContributor}
                currentId={currentId}
                isUser={true}
                selectedUser={selectedUser}
                handleConfirmDelete={handleConfirmDeleteGroupLeader}
                handleConfirmDeleteSubs={handleConfirmDeleteSubs}
                setSelectedUser={setSelectedUser}
                loading={loading}
                isUpdatePending={isUpdatePending}
                loadingRemove={loading}
            />

        </>
    );
};
export default AllUsers;
