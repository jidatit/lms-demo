import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    List,
    ListItemButton,
    ListItemText,
    InputAdornment,
} from '@mui/material';
import { toast } from 'utils/toast';
import { useCheckUserByEmail } from 'api/queries/users';
import { addMembersToGophishGroup } from 'utils/gophishUtils';
import { useAddGroupMember, useCreateGroupMember } from 'api/queries/groups';
import { useGetGroups, } from 'api/queries/groups'; // Assuming these exist
import { useAuth } from 'contexts/AuthContext';
import { CloseCircle, SearchNormal } from 'iconsax-react';
import Papa from 'papaparse';
import { BiCloudUpload } from 'react-icons/bi';
import { useCompanies } from 'api/queries/companies';

const VALID_ROLES = ['groupLeader', 'subscriber'];

const BulkAddGroupMembersModal = ({
    open,
    onClose,
    onSuccess,
    memberType = 'subscriber', // 'groupLeader' or 'subscriber'
}) => {
    const { currentUser } = useAuth();
    const role = currentUser?.role;

    const isGroupLeader = role === 'groupLeader';
    const isContributorOrAdmin = ['contributor', 'admin'].includes(role);

    const [search, setSearch] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);

    // Bulk form state
    const [csvFileName, setCsvFileName] = useState('');
    const [numberOfUsers, setNumberOfUsers] = useState(5);
    const [users, setUsers] = useState(
        Array.from({ length: 5 }, () => ({ firstName: '', lastName: '', email: '' }))
    );

    const { mutateAsync: checkUserByEmail } = useCheckUserByEmail();
    const { mutateAsync: addGroupMember } = useAddGroupMember();
    const { mutateAsync: createGroupMember } = useCreateGroupMember();

    // ===================================================================
    // DATA FETCHING WITH REACT QUERY
    // ===================================================================

    // 1. GroupLeader: fetch only THEIR groups
    const groupLeaderGroupsFilters = isGroupLeader
        ? { groupLeaderId: currentUser.id, enabled: open }
        : { enabled: false };

    const { data: groupLeaderGroupsData, isLoading: loadingGroupLeaderGroups } = useGetGroups(groupLeaderGroupsFilters);
    const groupLeaderGroups = groupLeaderGroupsData?.data || [];

    // 2. Contributor/Admin adding groupLeader → fetch groups without leader
    const manageableGroupsFilters = isContributorOrAdmin && memberType === 'groupLeader'
        ? { createdBy: currentUser.id, groupLeaderId: null, enabled: open }
        : { enabled: false };

    const { data: manageableGroupsData, isLoading: loadingManageableGroups } = useGetGroups(manageableGroupsFilters);
    const manageableGroups = manageableGroupsData?.data || [];

    // 3. Contributor/Admin adding subscriber → fetch companies
    const companiesFilters = {
        createdBy: role === 'admin' ? undefined : currentUser?.id,
        enabled: open && isContributorOrAdmin && memberType === 'subscriber',
    };

    const { data: companiesData, isLoading: loadingCompanies } = useCompanies(companiesFilters);
    const companies = companiesData?.data || [];

    // 4. Groups for selected company
    const companyGroupsFilters = selectedCompany
        ? { companyId: selectedCompany.id, enabled: true }
        : { enabled: false };

    const { data: companyGroupsData, isLoading: loadingCompanyGroups } = useGetGroups(companyGroupsFilters);
    const companyGroups = companyGroupsData?.data || [];

    // Determine which groups to display
    const availableGroups = isGroupLeader
        ? groupLeaderGroups
        : memberType === 'groupLeader'
            ? manageableGroups
            : selectedCompany
                ? companyGroups
                : [];

    const isLoading = isGroupLeader
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
            setSearch('');
            setCsvFileName('');
            setNumberOfUsers(5);
            setUsers(Array.from({ length: 5 }, () => ({ firstName: '', lastName: '', email: '' })));
        }
    }, [open]);

    // CSV Import Handler
    const handleCsvImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            toast({ message: 'Please select a CSV file', type: 'error' });
            return;
        }

        setCsvFileName(file.name);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data;

                const normalizedRows = rows.map(row => ({
                    firstName: (row['firstName'] || row['First Name'] || row['firstname'] || row['FirstName'] || '').trim(),
                    lastName: (row['lastName'] || row['Last Name'] || row['lastname'] || row['LastName'] || '').trim(),
                    email: (row['email'] || row['Email'] || row['e-mail'] || row['Email Address'] || '').trim().toLowerCase(),
                }));

                const validRows = normalizedRows.filter(row =>
                    row.firstName && row.lastName && row.email &&
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)
                );

                if (validRows.length === 0) {
                    toast({ message: 'No valid users found in CSV', type: 'error' });
                    return;
                }

                const limitedRows = validRows.slice(0, 15);

                setNumberOfUsers(limitedRows.length);
                setUsers(limitedRows.map(row => ({
                    firstName: row.firstName,
                    lastName: row.lastName,
                    email: row.email,
                })));

                toast({
                    message: `Imported ${limitedRows.length} user${limitedRows.length > 1 ? 's' : ''}`,
                    type: 'success',
                });

                if (validRows.length > 15) {
                    toast({ message: 'Only first 15 users imported (limit)', type: 'warning' });
                }
            },
            error: () => {
                toast({ message: 'Failed to parse CSV file', type: 'error' });
            },
        });
    };

    const handleNumberChange = (e) => {
        const num = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 15);
        setNumberOfUsers(num);
        setUsers(prev => {
            const newUsers = [...prev];
            while (newUsers.length < num) newUsers.push({ firstName: '', lastName: '', email: '' });
            return newUsers.slice(0, num);
        });
    };

    const handleChange = (index, field, value) => {
        setUsers(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const getValidUsers = () => users.filter(u =>
        u.firstName.trim() &&
        u.lastName.trim() &&
        u.email.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email.trim())
    );

    const formatSignInType = (str) =>
        str.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
    //TODO LOGIC HAS TO BE CHANGED , THIS IS NOT THE RIGHT
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedGroup) return;

        const validUsers = getValidUsers();
        if (validUsers.length === 0) {
            toast({ message: 'Please fill at least one complete user', type: 'error' });
            return;
        }

        let loading = true; // We'll use toast for feedback instead of state
        const results = { added: 0, created: 0, errors: [] };
        const role = memberType === 'groupLeader' ? 'groupLeader' : 'subscriber';

        for (const user of validUsers) {
            const email = user?.email.trim().toLowerCase();

            try {
                const { exists, user: existing } = await checkUserByEmail(email);

                // 🔥 ROLE MUST MATCH MEMBER TYPE
                if (exists && existing?.role !== role) {
                    results.errors.push({
                        email,
                        error: `This user already exists as a ${existing?.role} and cannot be added as a ${role}.`,
                    });
                    continue;
                }

                if (exists) {
                    await addGroupMember({
                        groupId: selectedGroup?.id,
                        userId: existing?.id,
                        role,
                    });
                    results.added++;
                } else {
                    await createGroupMember({
                        groupId: selectedGroup?.id,
                        userData: {
                            firstName: user?.firstName.trim(),
                            lastName: user?.lastName.trim(),
                            email,
                            role,
                            signInType: selectedGroup?.signInType || 'passwordless',
                        },
                    });
                    results.created++;
                }
            } catch (err) {
                results.errors.push({
                    email,
                    error: err.message || 'Failed to add user',
                });
            }
        }


        // GoPhish sync
        if (selectedGroup.gophishGroupID && (results.added + results.created > 0)) {
            const targets = validUsers
                .filter(u => !results.errors.some(e => e.email === u.email.trim().toLowerCase()))
                .map(u => ({
                    email: u?.email.trim().toLowerCase(),
                    first_name: u?.firstName.trim(),
                    last_name: u?.lastName.trim(),
                    position: memberType === 'groupLeader' ? 'Group Leader' : 'Subscriber',
                }));

            try {
                await addMembersToGophishGroup(selectedGroup?.gophishGroupID, targets);
            } catch (err) {
                toast({ message: 'Added to app, but GoPhish sync failed', type: 'warning' });
            }
        }

        // Final feedback
        const total = results.added + results.created;
        if (total > 0) {
            toast({
                message: `Success: ${total} user${total > 1 ? 's' : ''} added (${results.added} existing, ${results.created} new)`,
                type: 'success',
            });
        }
        results.errors.forEach(e => toast({ message: `${e.email}: ${e.error}`, type: 'error' }));

        onSuccess?.(results);
        onClose();
    };

    // ===================================================================
    // RENDER: Group Selection Step
    // ===================================================================
    if (!selectedGroup) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>Select Group for Bulk Add</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchNormal /></InputAdornment>,
                        }}
                        sx={{ mb: 3 }}
                    />

                    {isLoading ? (
                        <Box textAlign="center" py={5}><CircularProgress /></Box>
                    ) : isContributorOrAdmin && memberType === 'subscriber' && !selectedCompany ? (
                        // Show companies for contributor/admin adding subscribers
                        <List>
                            {filteredCompanies.length === 0 ? (
                                <Typography textAlign="center" py={2} color="text.secondary">
                                    No organizations found
                                </Typography>
                            ) : (
                                filteredCompanies.map(company => (
                                    <ListItemButton
                                        key={company.id}
                                        onClick={() => setSelectedCompany(company)}
                                        sx={{ borderRadius: 1, mb: 1 }}
                                    >
                                        <ListItemText
                                            primary={company.name}
                                            secondary={company.address || '—'}
                                        />
                                    </ListItemButton>
                                ))
                            )}
                        </List>
                    ) : (
                        // Show groups (groupLeader's groups, manageable, or company groups)
                        <Box>
                            {selectedCompany && (
                                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                                    {selectedCompany.name} – Choose Group
                                </Typography>
                            )}
                            <List>
                                {filteredGroups.length === 0 ? (
                                    <Typography textAlign="center" py={2} color="text.secondary">
                                        {isGroupLeader ? 'You are not assigned to any group' : 'No groups found'}
                                    </Typography>
                                ) : (
                                    filteredGroups.map(group => (
                                        <ListItemButton
                                            key={group.id}
                                            onClick={() => setSelectedGroup(group)}
                                            sx={{ borderRadius: 1, mb: 1 }}
                                        >
                                            <ListItemText
                                                primary={group.name}
                                                secondary={`${group.id.split('-')[0]} • ${formatSignInType(group.signInType)}`}
                                                primaryTypographyProps={{ fontWeight: 500 }}
                                            />
                                        </ListItemButton>
                                    ))
                                )}
                            </List>

                            {selectedCompany && (
                                <Button onClick={() => setSelectedCompany(null)} sx={{ mt: 2 }}>
                                    ← Back to Organizations
                                </Button>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="error">Cancel</Button>
                </DialogActions>
            </Dialog>
        );
    }

    // ===================================================================
    // RENDER: Bulk Form Step
    // ===================================================================
    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    Bulk Add {memberType === 'groupLeader' ? 'Managers' : 'Employees'} to
                    <Box component="span" sx={{ color: 'primary.main', ml: 1 }}>
                        {selectedGroup.name}
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={4} px={1} py={2} flexWrap="wrap">
                        <Box display="flex" alignItems="center" gap={2}>
                            <TextField
                                label="Number of users"
                                type="number"
                                value={numberOfUsers}
                                onChange={handleNumberChange}
                                sx={{ width: 160 }}
                                inputProps={{ min: 1, max: 15 }}
                                size="small"
                            />
                            <Typography variant="caption" color="text.secondary">Max 15 at once</Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                            <Button variant="outlined" component="label" startIcon={<BiCloudUpload />} sx={{ textTransform: 'none' }}>
                                Import from CSV
                                <input type="file" hidden accept=".csv" onChange={handleCsvImport} onClick={e => e.target.value = null} />
                            </Button>
                            {csvFileName && <Typography variant="body2" color="success.main">Imported: {csvFileName}</Typography>}
                            <Typography variant="caption" color="text.secondary">
                                CSV should have: First Name, Last Name, Email
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ maxHeight: 600, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Grid container sx={{ backgroundColor: 'primary.main', color: 'white', fontWeight: 'bold', p: 2, position: 'sticky', top: 0, zIndex: 1 }}>
                            <Grid item xs={4}><Typography textAlign="center">First Name *</Typography></Grid>
                            <Grid item xs={4}><Typography textAlign="center">Last Name *</Typography></Grid>
                            <Grid item xs={4}><Typography textAlign="center">Email *</Typography></Grid>
                        </Grid>

                        {users.map((user, i) => {
                            const filled = user.firstName || user.lastName || user.email;
                            const valid = filled && user.firstName && user.lastName && user.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email);

                            return (
                                <Grid container spacing={2} key={i} sx={{ p: 2, alignItems: 'center' }}>
                                    <Grid item xs={4}>
                                        <TextField
                                            fullWidth size="small" placeholder="First Name"
                                            value={user.firstName}
                                            onChange={e => handleChange(i, 'firstName', e.target.value)}
                                            error={filled && !user.firstName}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            fullWidth size="small" placeholder="Last Name"
                                            value={user.lastName}
                                            onChange={e => handleChange(i, 'lastName', e.target.value)}
                                            error={filled && !user.lastName}
                                        />
                                    </Grid>
                                    <Grid item xs={3.5}>
                                        <TextField
                                            fullWidth size="small" placeholder="email@company.com" type="email"
                                            value={user.email}
                                            onChange={e => handleChange(i, 'email', e.target.value)}
                                            error={filled && (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))}
                                        />
                                    </Grid>
                                    <Grid item xs={0.5}>
                                        <Button
                                            size="small" color="error"
                                            onClick={() => {
                                                if (users.length <= 1) return toast({ message: 'At least one row required', type: 'warning' });
                                                setUsers(prev => prev.filter((_, idx) => idx !== i));
                                                setNumberOfUsers(prev => prev - 1);
                                            }}
                                            sx={{ minWidth: '18px', p: 0.5, borderRadius: '50%' }}
                                        >
                                            <CloseCircle fontSize="small" />
                                        </Button>
                                    </Grid>
                                </Grid>
                            );
                        })}
                    </Box>

                    <Alert severity="info" sx={{ mt: 3 }}>
                        Valid users: {getValidUsers().length} / {numberOfUsers}
                    </Alert>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setSelectedGroup(null)}>Back</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={getValidUsers().length === 0}
                        startIcon={false && <CircularProgress size={20} />}
                    >
                        Add {getValidUsers().length} User{getValidUsers().length > 1 ? 's' : ''}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default BulkAddGroupMembersModal;