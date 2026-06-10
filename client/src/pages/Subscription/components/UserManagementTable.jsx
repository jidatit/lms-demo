import { useMemo, useState, useRef, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
    Box,
    Chip,
    Divider,
    Grid,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tooltip,
    Typography,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    InputLabel,
    Menu,
    MenuItem,
    Skeleton,
} from '@mui/material';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';

// Components
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import CustomTooltip from 'components/@extended/Tooltip';
import {
    HeaderSort,
    RowSelection,
    TablePagination,
} from 'components/third-party/react-table';

// Icons
import { Add, AddCircle, CloseCircle, Edit, Eye, Key, Trash } from 'iconsax-react';
import { IoMdPersonAdd } from 'react-icons/io';
import { MdGroupAdd, MdGridView } from 'react-icons/md';

// Local components
import FilterBar from './FilterBar';
import { getTabConfigForRole } from './TabConfig';
import {
    EmptyPartners,
    EmptyCompanies,
    EmptyGroups,
    EmptyGroupLeaders,
    EmptyStaff,
} from './EmptyStates';

// Modals
import CompanyModal from 'pages/dashboard/components/CompanyModal';
import UpdateCompanyModal from 'pages/dashboard/components/CompanyUpdateModal';
import ViewDashboardModal from 'pages/dashboard/components/ViewDashboardModal';
import CompaniesViewModal from 'pages/dashboard/components/CompaniesViewModal';
import AssignSeatsModal from 'components/AssignSeatsModal';
import AddPartnerDialog from 'components/AddPartnerDialog';

// Queries
import { useDeleteCompany } from 'api/queries/companies';
import { useDeleteGroup, useToggleGroupStatus } from 'api/queries/groups';
import { toast } from 'utils/toast';
import { useResendMicrosoftInvitation } from 'api/queries/microsoftEntraId';
import AddGroupModal from 'components/AddGroupModal';
import BulkAddGroupMembersModal from 'components/BulkAddGroupMembersModal';
import AddGroupMemberModal from 'components/AddGroupMemberModal';


// Fuzzy filter function
export const fuzzyFilter = (row, columnId, value) => {
    const itemRank = rankItem(row.getValue(columnId), value);
    return itemRank.passed;
};

// ==================== REACT TABLE COMPONENT ====================
function ReactTable({ data, columns }) {
    const [sorting, setSorting] = useState([{ id: columns[0]?.accessorKey || 'id', desc: false }]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState('');

    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
            sorting,
            rowSelection,
            globalFilter,
        },
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        globalFilterFn: fuzzyFilter,
    });

    return (
        <ScrollX>
            <Stack>
                <RowSelection selected={Object.keys(rowSelection)?.length} />
                <TableContainer>
                    <Table sx={{ minWidth: 750, tableLayout: 'fixed' }}>
                        <TableHead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableCell
                                            key={header.id}
                                            style={{ width: header.column.columnDef.size || 'auto' }}
                                            {...header.column.columnDef.meta}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                                                    {header.column.getCanSort() && <HeaderSort column={header.column} />}
                                                </Stack>
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHead>
                        <TableBody>
                            {table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                                            {typeof cell.getValue() === 'string' ? (
                                                cell.column.columnDef.accessorKey === 'id' ? (
                                                    // ✅ Show only first part of the ID (same as first table)
                                                    cell.getValue()?.includes('-') ? (
                                                        cell.getValue().split('-')[0]
                                                    ) : (
                                                        cell.getValue()
                                                    )
                                                ) : cell.getValue()?.length > 25 ? (
                                                    <CustomTooltip
                                                        title={cell.getValue()}
                                                        arrow
                                                        color="primary"
                                                        placement="top"
                                                    >
                                                        <span>{`${cell.getValue().slice(0, 25)}...`}</span>
                                                    </CustomTooltip>
                                                ) : (
                                                    cell.getValue()
                                                )
                                            ) : (
                                                flexRender(cell.column.columnDef.cell, cell.getContext())
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>

                    </Table>
                </TableContainer>
                <Divider />
                <Box sx={{ p: 2 }}>
                    <TablePagination
                        {...{
                            setPageSize: table.setPageSize,
                            setPageIndex: table.setPageIndex,
                            getState: table.getState,
                            getPageCount: table.getPageCount,
                            initialPageSize: 10,
                        }}
                    />
                </Box>
            </Stack>
        </ScrollX>
    );
}

// ==================== LOADING SKELETON ====================
const TableSkeleton = () => (
    <Box sx={{ p: 2 }}>
        {[...Array(5)].map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={60} sx={{ mb: 1 }} />
        ))}
    </Box>
);

// ==================== MAIN COMPONENT ====================
export default function UserManagementTable({
    role,
    activeTab,
    setActiveTab,
    tableData,
    dataLoading,
    contributors,
    filters,
    onFilterChange,
    currentId,
    setCurrentId,
    editingUser,
    setEditingUser,
    selectedUser,
    setSelectedUser,
    editUser,
    handleConfirmDeleteGroupLeader,
    handleConfirmDeleteSubs,
    loading,
    isUpdatePending,
    loadingRemove,
    refetchData,
}) {
    const theme = useTheme();
    const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

    // Get role-specific tab configuration
    const tabConfig = getTabConfigForRole(role);

    // Modal states
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [companyModalOpen, setCompanyModalOpen] = useState(false);
    const [updateCompanyModalOpen, setUpdateCompanyModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [addPartnerOpen, setAddPartnerOpen] = useState(false);
    const [assignSeatsModalOpen, setAssignSeatsModalOpen] = useState(false);
    const [selectedCompanyForSeats, setSelectedCompanyForSeats] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContributor, setSelectedContributor] = useState('');
    const [selectedName, setSelectedName] = useState('');
    const [selectedContributorId, setSelectedContributorId] = useState('');
    const [confirmDeleteCompanyOpen, setConfirmDeleteCompanyOpen] = useState(false);
    const [selectedCompanyIdToDelete, setSelectedCompanyIdToDelete] = useState(null);
    const [addGroupModalOpen, setAddGroupModalOpen] = useState(false); // ← NEW

    // Find this section in your code and ADD these 4 new states:
    const [addGroupLeaderModalOpen, setAddGroupLeaderModalOpen] = useState(false);
    const [addStaffModalOpen, setAddStaffModalOpen] = useState(false);
    const [bulkAddGroupLeaderModalOpen, setBulkAddGroupLeaderModalOpen] = useState(false);
    const [bulkAddStaffModalOpen, setBulkAddStaffModalOpen] = useState(false);
    const [selectedGroupForAddMember, setSelectedGroupForAddMember] = useState(null);

    // Menu state for Add buttons
    const [anchorEl, setAnchorEl] = useState(null);
    const buttonRef = useRef(null);

    // Confirmation dialog state (single reusable dialog)
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    // --- Add group mutation hooks and stable wrappers to avoid ReferenceError ---
    // Mutations
    const { mutate: deleteCompanyMutate, isPending: isDeleteCompanyPending } = useDeleteCompany();
    const { mutateAsync: deleteGroup } = useDeleteGroup();
    const { mutateAsync: toggleGroupStatus } = useToggleGroupStatus();
    const { mutate: resendInvitation, isPending: isResendPending } = useResendMicrosoftInvitation();

    const openConfirm = ({ title, message, action }) => {
        setConfirmTitle(title || 'Confirm');
        setConfirmMessage(message || 'Are you sure?');
        setConfirmAction(() => action);
        setConfirmOpen(true);
    };

    const handleConfirm = async () => {
        if (!confirmAction) return setConfirmOpen(false);
        setConfirmLoading(true);
        setConfirmOpen(false);
        try {
            await confirmAction();
        } catch (err) {
            toast({ message: err?.message || 'Operation failed', type: 'error' });
        } finally {
            setConfirmLoading(false);
            refetchData();
        }
    };

    // ==================== HANDLERS ====================
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setCurrentId(user.id);
        setEditModalOpen(true);
    };

    const handleDeleteClick = (row) => {
        setSelectedUser({ ...row.original });
        setDeleteModalOpen(true);
    };

    const handleResendInvitation = () => {
        resendInvitation(currentId, {
            onSuccess: (data) => {
                toast({ message: data.message || 'Invitation resent successfully.', type: 'success' });
            },
            onError: (error) => {
                toast({ message: error.message || 'Failed to resend invitation.', type: 'error' });
            },
        });
    };

    const handleOpenViewModal = (row) => {
        setSelectedContributor(row.original.email);
        setSelectedName(`${row.original.firstName} ${row.original.lastName}`);
        setIsModalOpen(true);
    };

    const handleOpenViewCompanyModal = (row) => {
        setSelectedContributorId(row.original.id);
        setViewModalOpen(true);
    };

    const handleOpenAssignSeatsModal = (company) => {
        setSelectedCompanyForSeats(company);
        setAssignSeatsModalOpen(true);
    };

    const handleOpenUpdateCompanyModal = (company) => {
        setSelectedCompany(company);
        setUpdateCompanyModalOpen(true);
    };

    const handleDeleteCompany = (id) => {
        deleteCompanyMutate(id, {
            onSuccess: () => {
                toast({ message: 'Company deleted successfully.', type: 'success' });
                setConfirmDeleteCompanyOpen(false);
                refetchData();
            },
            onError: (error) => {
                toast({ message: error?.message || 'Failed to delete company', type: 'error' });
            },
        });
    };

    // ==================== COLUMN DEFINITIONS ====================
    const partnersColumns = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
                size: 100,
                Cell: ({ cell }) => (
                    <Typography fontFamily="monospace" fontSize="0.875rem">
                        {cell.getValue()?.slice(0, 8)}...
                    </Typography>
                ),
            },
            {
                accessorKey: 'firstName',
                header: 'First Name',
                size: 150,
            },
            {
                accessorKey: 'lastName',
                header: 'Last Name',
                size: 150,
            },
            {
                accessorKey: 'email',
                header: 'Email',
                size: 250,
            },
            {
                header: 'Actions',
                size: 200,
                cell: ({ row }) => (
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Tooltip title="Delete">
                            <IconButton color="error" onClick={() => handleDeleteClick(row)}>
                                <Trash size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                            <IconButton color="primary" onClick={() => handleEditClick(row.original)}>
                                <Edit size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="View Dashboard">
                            <IconButton color="primary" onClick={() => handleOpenViewModal(row)}>
                                <Eye size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Group Info">
                            <IconButton color="primary" onClick={() => handleOpenViewCompanyModal(row)}>
                                <MdGridView size={20} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                ),
            },
        ],
        []
    );

    const groupLeadersColumns = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
                size: 100,
                Cell: ({ cell }) => (
                    <Typography fontFamily="monospace" fontSize="0.875rem">
                        {cell.getValue()?.slice(0, 8)}...
                    </Typography>
                ),
            },
            {
                accessorKey: 'firstName',
                header: 'First Name',
                size: 150,
            },
            {
                accessorKey: 'lastName',
                header: 'Last Name',
                size: 150,
            },
            {
                accessorKey: 'email',
                header: 'Email',
                size: 250,
            },
            {
                accessorKey: 'isActive',
                header: 'Status',
                size: 150,
                Cell: ({ row }) => {
                    const { isActive, signInType } = row.original;
                    if (signInType === 'microsoftEntraID') {
                        return (
                            <Chip
                                label={isActive ? 'Accepted' : 'Pending'}
                                color={isActive ? 'success' : 'warning'}
                                size="small"
                            />
                        );
                    }
                    return <Chip label="Active" color="success" size="small" />;
                },
            },
            {
                header: 'Actions',
                size: 150,
                cell: ({ row }) => (
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Tooltip title="Delete">
                            <IconButton color="error" onClick={() => handleDeleteClick(row)}>
                                <Trash size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                            <IconButton color="primary" onClick={() => handleEditClick(row.original)}>
                                <Edit size={20} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                ),
            },
        ],
        []
    );

    const staffColumns = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
                size: 100,
                Cell: ({ cell }) => (
                    <Typography fontFamily="monospace" fontSize="0.875rem">
                        {cell.getValue()?.slice(0, 8)}...
                    </Typography>
                ),
            },
            {
                accessorKey: 'firstName',
                header: 'First Name',
                size: 150,
            },
            {
                accessorKey: 'lastName',
                header: 'Last Name',
                size: 150,
            },
            {
                accessorKey: 'email',
                header: 'Email',
                size: 250,
            },
            {
                accessorKey: 'isActive',
                header: 'Status',
                size: 150,
                Cell: ({ row }) => {
                    const { isActive, signInType } = row.original;
                    if (signInType === 'microsoftEntraID') {
                        return (
                            <Chip
                                label={isActive ? 'Accepted' : 'Pending'}
                                color={isActive ? 'success' : 'warning'}
                                size="small"
                            />
                        );
                    }
                    return <Chip label="Active" color="success" size="small" />;
                },
            },
            {
                header: 'Actions',
                size: 150,
                cell: ({ row }) => (
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Tooltip title="Delete">
                            <IconButton color="error" onClick={() => handleDeleteClick(row)}>
                                <Trash size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                            <IconButton color="primary" onClick={() => handleEditClick(row.original)}>
                                <Edit size={20} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                ),
            },
        ],
        []
    );

    const companiesColumns = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
                size: 100,
                Cell: ({ cell }) => (
                    <Typography fontFamily="monospace" fontSize="0.875rem">
                        {cell.getValue()?.slice(0, 8)}...
                    </Typography>
                ),
            },
            {
                accessorKey: 'name',
                header: 'Name',
                size: 200,
            },
            {
                accessorKey: 'address',
                header: 'Address',
                size: 250,
            },
            {
                accessorKey: 'email',
                header: 'Email',
                size: 250,
            },
            {
                header: 'License Usage',
                accessorFn: (row) => row?.seatSummary?.used + ' / ' + row?.seatSummary?.assigned,
                Cell: ({ row }) => {
                    const seat = row?.original?.seatSummary;
                    if (!seat) return '0 / 0';

                    return (
                        <Stack sx={{ whiteSpace: 'nowrap' }}>
                            {seat?.used} / {seat?.assigned}
                        </Stack>
                    );
                },
                size: 150
            },
            {
                header: 'Actions',
                size: 200,
                cell: ({ row }) => (
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Tooltip title="Assign Seats">
                            <IconButton color="success" onClick={() => handleOpenAssignSeatsModal(row.original)}>
                                <Key size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton
                                color="error"
                                onClick={() => {
                                    setSelectedCompanyIdToDelete(row.original.id);
                                    setConfirmDeleteCompanyOpen(true);
                                }}
                            >
                                <Trash size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                            <IconButton color="primary" onClick={() => handleOpenUpdateCompanyModal(row.original)}>
                                <Edit size={20} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                ),
            },
        ],
        []
    );

    const groupsColumns = useMemo(() => {
        const columns = [
            {
                accessorKey: 'id',
                header: 'ID',
                size: 100,
                cell: ({ cell }) => (
                    <Typography fontFamily="monospace" fontSize="0.875rem">
                        {cell.getValue()?.slice(0, 8)}...
                    </Typography>
                ),
            },
            {
                accessorKey: 'name',
                header: 'Group Name',
                size: 200,
            },
            {
                accessorKey: 'company.name',
                header: 'Company',
                size: 200,
                Cell: ({ row }) => row.original.company?.name || '-',
            },
            {
                header: 'No. of Users',
                accessorFn: (row) => row.groupUsers?.length || 0,
                size: 120,
                cell: ({ cell }) => <span>{cell.getValue()}</span>,
            },
            {
                header: 'Status',
                accessorFn: (row) => (row.isActive ? 'Active' : 'Inactive'),
                size: 120,
                cell: ({ row }) => {
                    const active = row.original.isActive;
                    return (
                        <Chip
                            label={active ? 'Active' : 'Inactive'}
                            color={active ? 'success' : 'default'}
                            size="small"
                        />
                    );
                },
            },
        ];

        // Conditionally add Actions column
        if (role !== 'groupLeader') {
            columns.push({
                header: 'Actions',
                size: 150,
                cell: ({ row }) => {
                    const group = row.original;
                    const isActive = group?.isActive;

                    return (
                        <Stack direction="row" spacing={1}>
                            <Tooltip title={isActive ? 'Deactivate' : 'Activate'}>
                                <IconButton
                                    size="small"
                                    color={isActive ? 'warning' : 'success'}
                                    onClick={() =>
                                        openConfirm({
                                            title: isActive ? 'Deactivate Group' : 'Activate Group',
                                            message: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'
                                                } this group?`,
                                            action: async () => {
                                                await toggleGroupStatus(group.id);
                                                toast({
                                                    message: isActive ? 'Group deactivated' : 'Group activated',
                                                    type: 'success',
                                                });
                                            },
                                        })
                                    }
                                >
                                    {isActive ? <CloseCircle size={18} /> : <AddCircle size={18} />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                        openConfirm({
                                            title: 'Delete Group',
                                            message: 'Delete this group permanently?',
                                            action: async () => {
                                                await deleteGroup({
                                                    groupId: group.id,
                                                    gophishGroupId: group.gophishGroupID,
                                                });
                                                toast({ message: 'Group deleted successfully', type: 'success' });
                                            },
                                        })
                                    }
                                >
                                    <Trash size={18} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    );
                },
            });
        }

        return columns;
    }, [role, refetchData, toggleGroupStatus, deleteGroup]);


    // ==================== GET COLUMNS FOR ACTIVE TAB ====================
    const getColumnsForTab = () => {
        switch (activeTab) {
            case 'partners':
                return partnersColumns;
            case 'companies':
                return companiesColumns;
            case 'groups':
                return groupsColumns;
            case 'groupLeaders':
                return groupLeadersColumns;
            case 'staff':
                return staffColumns;
            default:
                return [];
        }
    };

    // ==================== GET EMPTY STATE FOR TAB ====================
    const getEmptyState = () => {
        switch (activeTab) {
            case 'partners':
                return <EmptyPartners onAdd={() => setAddPartnerOpen(true)} />;
            case 'companies':
                return <EmptyCompanies onAdd={() => setCompanyModalOpen(true)} role={role} />;
            case 'groups':
                return <EmptyGroups onAdd={null} role={role} />;
            case 'groupLeaders':
                return <EmptyGroupLeaders onAdd={null} role={role} />;
            case 'staff':
                return <EmptyStaff onAdd={null} role={role} />;
            default:
                return null;
        }
    };

    // ==================== RENDER ====================
    return (
        <>
            <MainCard content={false}>
                <Grid container direction="column" spacing={2} sx={{ pb: 2 }}>
                    {/* Tabs and Action Buttons Row */}
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                gap: 2,
                                p: 1.5,
                                pb: 0,
                                justifyContent: matchDownSM ? 'center' : 'space-between',
                            }}
                        >
                            {/* Tabs */}
                            <Box sx={{ display: 'flex', flexGrow: 1, minWidth: '300px' }}>
                                <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)}>
                                    {tabConfig.tabs.map((tab) => (
                                        <Tab
                                            key={tab.key}
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Box sx={{ mr: 1 }}>{tab.icon}</Box>
                                                    {tab.label}
                                                </Box>
                                            }
                                            value={tab.key}
                                        />
                                    ))}
                                </Tabs>
                            </Box>

                            {/* Action Buttons */}
                            <Box>
                                {activeTab === 'partners' && role === 'admin' && (
                                    <Button
                                        variant="contained"
                                        startIcon={<AddCircle />}
                                        onClick={() => setAddPartnerOpen(true)}
                                    >
                                        Add Partner
                                    </Button>
                                )}

                                {activeTab === 'companies' && (
                                    <Button
                                        variant="contained"
                                        startIcon={<AddCircle />}
                                        onClick={() => setCompanyModalOpen(true)}
                                    >
                                        Add Organization
                                    </Button>
                                )}


                                {activeTab === 'groups' && role !== 'groupLeader' && (
                                    <Button
                                        variant="contained"
                                        startIcon={<AddCircle />}
                                        onClick={() => setAddGroupModalOpen(true)}
                                    >
                                        Add Group
                                    </Button>
                                )}
                                {/* 
                                {activeTab === 'groupLeaders' && role !== 'groupLeader' && (
                                    <>
                                        <Button
                                            ref={buttonRef}
                                            variant="contained"
                                            startIcon={<AddCircle />}
                                            onClick={handleClick}
                                        >
                                            Add Group Leader
                                        </Button>
                                        <Menu
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl)}
                                            onClose={handleClose}
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                        >
                                            <MenuItem
                                                onClick={() => {
                                                    handleClose();
                                                    // handleAddGroupLeader(); // Implement this
                                                }}
                                            >
                                                <IoMdPersonAdd style={{ fontSize: '20px', marginRight: '10px' }} />
                                                Add One
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => {
                                                    handleClose();
                                                    // handleAddBulkGL(); // Implement this
                                                }}
                                            >
                                                <MdGroupAdd style={{ fontSize: '20px', marginRight: '10px' }} />
                                                Add Bulk
                                            </MenuItem>
                                        </Menu>
                                    </>
                                )}

                                {activeTab === 'staff' && (
                                    <>
                                        <Button
                                            ref={buttonRef}
                                            variant="contained"
                                            startIcon={<AddCircle />}
                                            onClick={handleClick}
                                        >
                                            Add Staff
                                        </Button>
                                        <Menu
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl)}
                                            onClose={handleClose}
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                        >
                                            <MenuItem
                                                onClick={() => {
                                                    handleClose();
                                                    // handleAddSubscriber(); // Implement this
                                                }}
                                            >
                                                <IoMdPersonAdd style={{ fontSize: '20px', marginRight: '10px' }} />
                                                Add One
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => {
                                                    handleClose();
                                                    // handleAddBulkSubscribers(); // Implement this
                                                }}
                                            >
                                                <MdGroupAdd style={{ fontSize: '20px', marginRight: '10px' }} />
                                                Add Bulk
                                            </MenuItem>
                                        </Menu>
                                    </>
                                )} */}
                                {/* GROUP LEADERS MENU */}
                                {activeTab === 'groupLeaders' && role !== 'groupLeader' && (
                                    <>
                                        <Button
                                            ref={buttonRef}
                                            variant="contained"
                                            startIcon={<AddCircle />}
                                            onClick={handleClick}
                                        >
                                            Add Manager
                                        </Button>

                                        <Menu
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl)}
                                            onClose={handleClose}
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                        >
                                            {/* Add One */}
                                            <MenuItem
                                                onClick={() => {
                                                    handleClose();

                                                    // if (!filters.groupId) {
                                                    //     toast({
                                                    //         message: 'Please select a group first using the group filter',
                                                    //         type: 'warning',
                                                    //     });
                                                    //     return;
                                                    // }

                                                    // // const selectedGroup = groups.find(g => g.id === filters.groupId);
                                                    // // if (!selectedGroup) {
                                                    // //     toast({ message: 'Selected group not found', type: 'error' });
                                                    // //     return;
                                                    // // }

                                                    // setSelectedGroupForAddMember(filters.groupId);
                                                    setAddGroupLeaderModalOpen(true);
                                                }}
                                            >
                                                <IoMdPersonAdd style={{ fontSize: 20, marginRight: 10 }} />
                                                Add One
                                            </MenuItem>

                                            {/* Add Bulk */}
                                            <MenuItem
                                                onClick={() => {
                                                    handleClose();
                                                    setBulkAddGroupLeaderModalOpen(true);
                                                }}
                                            >
                                                <MdGroupAdd style={{ fontSize: 20, marginRight: 10 }} />
                                                Add Bulk
                                            </MenuItem>
                                        </Menu>
                                    </>
                                )}

                                {/* STAFF MENU */}
                                {activeTab === 'staff' && (
                                    <>
                                        <Button
                                            ref={buttonRef}
                                            variant="contained"
                                            startIcon={<AddCircle />}
                                            onClick={handleClick}
                                        >
                                            Add Employee
                                        </Button>

                                        <Menu
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl)}
                                            onClose={handleClose}
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                        >
                                            {/* Add One */}
                                            <MenuItem
                                                onClick={() => {
                                                    handleClose();
                                                    setAddStaffModalOpen(true);
                                                }}
                                            >
                                                <IoMdPersonAdd style={{ fontSize: 20, marginRight: 10 }} />
                                                Add One
                                            </MenuItem>

                                            {/* Add Bulk */}
                                            <MenuItem
                                                onClick={() => {
                                                    handleClose();
                                                    setBulkAddStaffModalOpen(true);
                                                }}
                                            >
                                                <MdGroupAdd style={{ fontSize: 20, marginRight: 10 }} />
                                                Add Bulk
                                            </MenuItem>
                                        </Menu>
                                    </>
                                )}

                            </Box>
                        </Box>
                    </Grid>

                    {/* Filter Bar */}
                    <Grid item xs={12} marginLeft={2}>
                        <FilterBar
                            role={role}
                            activeTab={activeTab}
                            filters={filters}
                            onFilterChange={onFilterChange}
                            contributors={contributors}
                        />
                    </Grid>

                    {/* Table or Empty State */}
                    <Grid item xs={12}>
                        {dataLoading ? (
                            <TableSkeleton />
                        ) : tableData.length === 0 ? (
                            getEmptyState()
                        ) : (
                            <ReactTable data={tableData} columns={getColumnsForTab()} />
                        )}
                    </Grid>
                </Grid>
            </MainCard>

            {/* Reusable confirmation dialog */}
            <Dialog open={confirmOpen || confirmLoading} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>{confirmTitle}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{confirmMessage}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)} disabled={confirmLoading}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirm}
                        disabled={confirmLoading}
                    >
                        {confirmLoading ? 'Processing...' : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ==================== MODALS ==================== */}

            {/* Edit User Modal */}
            <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} fullWidth>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Update the user's information below.
                    </DialogContentText>
                    <InputLabel htmlFor="firstName" sx={{ mb: 0.5 }}>
                        First Name
                    </InputLabel>
                    <TextField
                        id="firstName"
                        value={editingUser?.firstName || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                        fullWidth
                        margin="dense"
                        sx={{ mb: 1.5 }}
                    />
                    <InputLabel htmlFor="lastName" sx={{ mb: 0.5 }}>
                        Last Name
                    </InputLabel>
                    <TextField
                        id="lastName"
                        value={editingUser?.lastName || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                        fullWidth
                        sx={{ mb: 1.5 }}
                        margin="dense"
                    />
                    <InputLabel htmlFor="email" sx={{ mb: 0.5 }}>
                        Email
                    </InputLabel>
                    <TextField
                        id="email"
                        disabled
                        value={editingUser?.email || ''}
                        fullWidth
                        sx={{ mb: 1.5 }}
                        margin="dense"
                    />
                    {editingUser?.signInType === 'microsoftEntraID' && !editingUser?.isActive && (
                        <Button
                            variant="outlined"
                            onClick={handleResendInvitation}
                            disabled={isResendPending}
                            sx={{ mt: 2 }}
                        >
                            {isResendPending ? 'Resending...' : 'Resend Microsoft Invitation'}
                        </Button>
                    )}
                </DialogContent>
                <DialogActions sx={{ padding: '16px' }}>
                    <Button color="error" onClick={() => setEditModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        disabled={isUpdatePending}
                        variant="contained"
                        onClick={async () => {
                            await editUser({ editingUser, currentId });
                            setEditModalOpen(false);
                        }}
                    >
                        {isUpdatePending ? 'Updating...' : 'Update User'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete User Confirmation */}
            <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Deleting this user will remove all their data permanently. Are you sure?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="error" onClick={() => setDeleteModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={loadingRemove}
                        onClick={async () => {
                            if (activeTab === 'staff') {
                                await handleConfirmDeleteSubs();
                            } else if (activeTab === 'groupLeaders') {
                                await handleConfirmDeleteGroupLeader();
                            }
                            setDeleteModalOpen(false);
                        }}
                    >
                        {loadingRemove ? 'Deleting...' : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Company Modals */}
            <CompanyModal
                open={companyModalOpen}
                onClose={() => {
                    setCompanyModalOpen(false);
                    refetchData();
                }}
                onCompanyCreated={() => refetchData()}
            />

            <UpdateCompanyModal
                open={updateCompanyModalOpen}
                onClose={() => {
                    setUpdateCompanyModalOpen(false);
                    refetchData();
                }}
                company={selectedCompany}
                onCompanyCreated={() => refetchData()}
            />

            <Dialog open={confirmDeleteCompanyOpen} onClose={() => setConfirmDeleteCompanyOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this company? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteCompanyOpen(false)} disabled={isDeleteCompanyPending}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleDeleteCompany(selectedCompanyIdToDelete)}
                        color="error"
                        variant="contained"
                        disabled={isDeleteCompanyPending}
                    >
                        {isDeleteCompanyPending ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            <AssignSeatsModal
                open={assignSeatsModalOpen}
                onClose={() => {
                    setAssignSeatsModalOpen(false);
                    refetchData();
                }}
                company={selectedCompanyForSeats}
            />

            {/* Partner Modals */}
            <AddPartnerDialog
                open={addPartnerOpen}
                onClose={() => setAddPartnerOpen(false)}
                onSuccess={() => {
                    setAddPartnerOpen(false);
                    refetchData();
                }}
            />

            <ViewDashboardModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                name={selectedName}
                email={selectedContributor}
            />

            {/* Add Group Modal */}
            <AddGroupModal
                open={addGroupModalOpen}
                onClose={() => setAddGroupModalOpen(false)}
                onSuccess={(newGroup) => {
                    setAddGroupModalOpen(false);
                    refetchData(); // Refetch groups after creation
                }}
            />

            <AddGroupMemberModal
                open={addGroupLeaderModalOpen}
                onClose={() => {
                    setAddGroupLeaderModalOpen(false);
                    setSelectedGroupForAddMember(null);
                }}
                onSuccess={() => {
                    setAddGroupLeaderModalOpen(false);
                    setSelectedGroupForAddMember(null);
                    refetchData(); // Refetch group leaders
                }}

                memberType="groupLeader"
            />

            {/* Add Group Leader - Bulk */}
            <BulkAddGroupMembersModal
                open={bulkAddGroupLeaderModalOpen}
                onClose={() => {
                    setBulkAddGroupLeaderModalOpen(false);
                    setSelectedGroupForAddMember(null);
                }}
                onSuccess={() => {
                    setBulkAddGroupLeaderModalOpen(false);
                    setSelectedGroupForAddMember(null);
                    refetchData(); // Refetch group leaders
                }}

                memberType="groupLeader"
            />

            {/* Add Staff - Single */}
            <AddGroupMemberModal
                open={addStaffModalOpen}
                onClose={() => {
                    setAddStaffModalOpen(false);
                    setSelectedGroupForAddMember(null);
                }}
                onSuccess={() => {
                    setAddStaffModalOpen(false);
                    setSelectedGroupForAddMember(null);
                    refetchData(); // Refetch staff
                }}

                memberType="subscriber"
            />

            {/* Add Staff - Bulk */}
            <BulkAddGroupMembersModal
                open={bulkAddStaffModalOpen}
                onClose={() => {
                    setBulkAddStaffModalOpen(false);
                    setSelectedGroupForAddMember(null);
                }}
                onSuccess={() => {
                    setBulkAddStaffModalOpen(false);
                    setSelectedGroupForAddMember(null);
                    refetchData(); // Refetch staff
                }}

                memberType="subscriber"
            />
            <CompaniesViewModal
                open={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                contributorId={selectedContributorId}
            />
        </>
    );
}