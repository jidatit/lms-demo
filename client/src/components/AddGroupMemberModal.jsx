import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    TextField,
    InputLabel,
    CircularProgress,
    Box,
    Typography,
    List,
    ListItemText,
    ListItemButton,
    InputAdornment,
} from '@mui/material';
import { toast } from 'utils/toast';
import { useCheckUserByEmail } from 'api/queries/users';
import { addMemberToGophishGroup } from 'utils/gophishUtils';
import { useAddGroupMember, useCreateGroupMember } from 'api/queries/groups';
import { useGetGroups } from 'api/queries/groups'; // Adjust import path
import { useAuth } from 'contexts/AuthContext';
import { FaSearchengin } from 'react-icons/fa6';
import { useCompanies } from 'api/queries/companies';

const AddGroupMemberModal = ({
    open,
    onClose,
    onSuccess,
    memberType = 'subscriber', // 'subscriber' or 'groupLeader'
}) => {
    const { currentUser } = useAuth();
    const role = currentUser?.role;

    const isGroupLeader = role === 'groupLeader';
    const isContributorOrAdmin = ['contributor', 'admin'].includes(role);

    const [search, setSearch] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);

    // Form state
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
    const [existingUser, setExistingUser] = useState(null);
    const [checkingUser, setCheckingUser] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { mutateAsync: checkUserByEmail } = useCheckUserByEmail();
    const { mutateAsync: addGroupMember } = useAddGroupMember();
    const { mutateAsync: createGroupMember } = useCreateGroupMember();

    // ===================================================================
    // DATA FETCHING
    // ===================================================================

    // 1. If current user is groupLeader → fetch only THEIR groups
    const groupLeaderGroupsFilters = isGroupLeader
        ? { groupLeaderId: currentUser.id, enabled: open }
        : { enabled: false };

    const { data: groupLeaderGroupsData, isLoading: loadingGroupLeaderGroups } = useGetGroups(groupLeaderGroupsFilters);
    const groupLeaderGroups = groupLeaderGroupsData?.data || [];

    // 2. For contributor/admin adding groupLeader → fetch groups without leader
    const manageableGroupsFilters = isContributorOrAdmin && memberType === 'groupLeader'
        ? { createdBy: currentUser.id, groupLeaderId: null, enabled: open }
        : { enabled: false };

    const { data: manageableGroupsData, isLoading: loadingManageableGroups } = useGetGroups(manageableGroupsFilters);
    const manageableGroups = manageableGroupsData?.data || [];

    // 3. For contributor/admin adding subscriber → fetch companies
    const companiesFilters = {
        createdBy: isContributorOrAdmin ? (role === 'admin' ? undefined : currentUser.id) : undefined,
        enabled: open && isContributorOrAdmin && memberType === 'subscriber',
    };

    const { data: companiesData, isLoading: loadingCompanies } = useCompanies(companiesFilters);
    const companies = companiesData?.data || [];

    // 4. Groups for selected company (only for contributor/admin adding subscriber)
    const companyGroupsFilters = selectedCompany
        ? { companyId: selectedCompany.id, enabled: true }
        : { enabled: false };

    const { data: companyGroupsData, isLoading: loadingCompanyGroups } = useGetGroups(companyGroupsFilters);
    const companyGroups = companyGroupsData?.data || [];

    // ===================================================================
    // Determine available groups to show in selection
    // ===================================================================
    const availableGroups = isGroupLeader
        ? groupLeaderGroups
        : memberType === 'groupLeader'
            ? manageableGroups
            : selectedCompany
                ? companyGroups
                : [];

    const isLoadingGroups = isGroupLeader
        ? loadingGroupLeaderGroups
        : memberType === 'groupLeader'
            ? loadingManageableGroups
            : loadingCompanies || loadingCompanyGroups;

    const filteredGroups = availableGroups.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.id.toLowerCase().includes(search.toLowerCase())
    );

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    // Reset on close
    useEffect(() => {
        if (!open) {
            setSelectedGroup(null);
            setSelectedCompany(null);
            setFormData({ firstName: '', lastName: '', email: '' });
            setExistingUser(null);
            setSearch('');
        }
    }, [open]);

    const handleBack = () => {
        setSelectedGroup(null);
        setSelectedCompany(null);
    };

    const handleEmailBlur = async () => {
        const email = formData.email.trim().toLowerCase();
        if (!email) return;

        setCheckingUser(true);
        try {
            const result = await checkUserByEmail(email);

            if (result.exists) {
                const userRole = result.user.role;

                //  role must match memberType exactly
                if (userRole !== memberType) {
                    toast({
                        message: `This user already exists with a different role and can’t be added here.`,
                        type: 'error',
                    });


                    setFormData((prev) => ({ ...prev, email: '' }));
                    setExistingUser(null);
                    return;
                }

                setExistingUser(result.user);
                setFormData((prev) => ({ ...prev, email: result.user.email }));
            } else {
                setExistingUser(null);
            }
        } catch (error) {
            toast({ message: 'Failed to check email', type: 'error' });
        } finally {
            setCheckingUser(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedGroup) {
            toast({ message: 'Please select a group', type: 'error' });
            return;
        }

        setSubmitting(true);
        try {
            const email = formData.email.trim().toLowerCase();
            const targetRole = memberType === 'groupLeader' ? 'groupLeader' : 'subscriber';

            let response;

            if (existingUser) {
                if (targetRole === 'subscriber' && existingUser?.role === 'subscriber') {
                    toast({ message: 'This employee is already in another group.', type: 'error' });
                    return;
                }

                response = await addGroupMember({
                    groupId: selectedGroup?.id,
                    userId: existingUser?.id,
                    role: targetRole,
                });
            } else {
                response = await createGroupMember({
                    groupId: selectedGroup.id,
                    userData: {
                        firstName: formData?.firstName.trim(),
                        lastName: formData?.lastName.trim(),
                        email,
                        role: targetRole,
                        signInType: selectedGroup?.signInType || 'passwordless',
                    },
                });
            }

            // GoPhish sync
            if (selectedGroup.gophishGroupID) {
                try {
                    await addMemberToGophishGroup(selectedGroup.gophishGroupID, {
                        email,
                        first_name: formData?.firstName.trim() || existingUser?.firstName || '',
                        last_name: formData?.lastName.trim() || existingUser?.lastName || '',
                        position: targetRole === 'groupLeader' ? 'Group Leader' : 'Subscriber',
                    });
                } catch (err) {
                    toast({ message: 'Added to app, but GoPhish sync failed', type: 'warning' });
                }
            }

            toast({ message: 'Member added successfully!', type: 'success' });
            onSuccess?.(response?.data);
            onClose();
        } catch (err) {
            toast({ message: err.message || 'Failed to add member', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const isFormValid = () =>
        formData.email.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
        (existingUser || (formData.firstName.trim() && formData.lastName.trim()));

    // ===================================================================
    // RENDER: Form (when group is selected)
    // ===================================================================
    if (selectedGroup) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        Add {memberType === 'groupLeader' ? 'Manager' : 'Employee'} to
                        <Box component="span" sx={{ color: 'primary.main', ml: 1 }}>
                            {selectedGroup.name}
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 3 }}>
                            Enter details below. We'll check if the user already exists.
                        </DialogContentText>

                        <InputLabel>Email *</InputLabel>
                        <TextField
                            fullWidth
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            onBlur={handleEmailBlur}
                            disabled={submitting}
                            placeholder="john@example.com"
                            sx={{ mb: 2 }}
                        />
                        {checkingUser && <Typography variant="caption" color="primary">Checking user...</Typography>}

                        {!existingUser && (
                            <>
                                <InputLabel>First Name *</InputLabel>
                                <TextField
                                    fullWidth
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    disabled={submitting}
                                    sx={{ mb: 2 }}
                                />

                                <InputLabel>Last Name *</InputLabel>
                                <TextField
                                    fullWidth
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    disabled={submitting}
                                    sx={{ mb: 2 }}
                                />
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleBack} disabled={submitting}>
                            Back
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={submitting || !isFormValid()}
                        >
                            {submitting ? 'Adding...' : existingUser ? 'Add to Group' : 'Create & Add'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }

    // ===================================================================
    // RENDER: Group / Company Selection
    // ===================================================================
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Select Group</DialogTitle>
            <DialogContent dividers>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><FaSearchengin /></InputAdornment>,
                    }}
                    sx={{ mb: 3 }}
                />

                {isLoadingGroups ? (
                    <Box textAlign="center" py={4}><CircularProgress /></Box>
                ) : isContributorOrAdmin && memberType === 'subscriber' && !selectedCompany ? (
                    // Contributor/Admin adding subscriber → show companies first
                    <List>
                        {filteredCompanies.length === 0 ? (
                            <Typography textAlign="center" py={2} color="text.secondary">
                                No organizations found
                            </Typography>
                        ) : (
                            filteredCompanies.map((company) => (
                                <ListItemButton
                                    key={company.id}
                                    onClick={() => setSelectedCompany(company)}
                                    sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'primary.lighter' } }}
                                >
                                    <ListItemText
                                        primary={company.name}
                                        secondary={company.address || 'No address'}
                                    />
                                </ListItemButton>
                            ))
                        )}
                    </List>
                ) : (
                    // Show groups: either groupLeader's groups, manageable groups, or company groups
                    <Box>
                        {selectedCompany && (
                            <Typography variant="subtitle2" gutterBottom color="text.secondary">
                                {selectedCompany.name} – Select Group
                            </Typography>
                        )}
                        <List>
                            {filteredGroups.length === 0 ? (
                                <Typography textAlign="center" py={2} color="text.secondary">
                                    {isGroupLeader ? 'You are not assigned to any group' : 'No groups found'}
                                </Typography>
                            ) : (
                                filteredGroups.map((group) => (
                                    <ListItemButton
                                        key={group.id}
                                        onClick={() => setSelectedGroup(group)}
                                        sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'primary.lighter' } }}
                                    >
                                        <ListItemText
                                            primary={group.name}
                                            secondary={`ID: ${group.id.split('-')[0]} • ${group.signInType === 'withPassword' ? 'With Password' : 'Passwordless'}`}
                                            primaryTypographyProps={{ fontWeight: 500 }}
                                        />
                                    </ListItemButton>
                                ))
                            )}
                        </List>

                        {selectedCompany && (
                            <Button onClick={() => setSelectedCompany(null)} sx={{ mt: 2 }}>
                                Back to Organizations
                            </Button>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="error">
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddGroupMemberModal;