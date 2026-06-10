import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { Link } from 'react-router-dom';

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';

// project-import
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import EmptyReactTable from '../../../pages/tables/react-table/empty';

import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';

// assets
import { Add, AddCircle, CloseCircle, CloseSquare, Edit, Eye, Key, Trash } from 'iconsax-react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  FormControl,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Modal,
  Select,
  TextField
} from '@mui/material';

import { FaEllipsis } from 'react-icons/fa6';
import { FaBook, FaBox, FaChalkboardTeacher, FaPlus, FaUser } from 'react-icons/fa';
import { openSnackbar } from 'api/snackbar';
import axiosInstance from 'utils/axiosConfig';
import Search from 'layout/Dashboard/Header/HeaderContent/Search';
import CustomTooltip from 'components/@extended/Tooltip';
import { IoMdPersonAdd } from 'react-icons/io';
import { MdGridView, MdGroupAdd } from 'react-icons/md';

import { useCompanies, useDeleteCompany } from 'api/queries/companies';
import { toast } from 'utils/toast';
import { useResendMicrosoftInvitation } from 'api/queries/microsoftEntraId';
import CompanyModal from 'pages/dashboard/components/CompanyModal';
import SupportAgentModal from 'pages/dashboard/components/SupportAgentModal';
import UpdateCompanyModal from 'pages/dashboard/components/CompanyUpdateModal';
import AssignSeatsModal from 'components/AssignSeatsModal';
import ViewDashboardModal from 'pages/dashboard/components/ViewDashboardModal';
import CompanyGroupFilter from 'components/CompanyGroupFilter';
import ContributorFilter from 'pages/dashboard/components/ContributorSelect';
import { useAuth } from 'contexts/AuthContext';
import AddPartnerDialog from 'components/AddPartnerDialog';
import { useDeleteGroup, useGetGroups, useToggleGroupStatus } from 'api/queries/groups';
import CompanyFilter from 'components/CompanyFilter';
import CompaniesViewModal from 'pages/dashboard/components/CompaniesViewModal';


export const fuzzyFilter = (row, columnId, value) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  return itemRank.passed; // Return a boolean indicating match success
};
// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({
  data,
  columns,
  activeTab,
  setActiveTab,
  selectedRowsCount,
  setSelectedRowsCount,
  creationCB,
  enableRowSelection,
  setSelectedCourseIds
}) {
  //   if (!data || data.length === 0) {
  //     return (
  //       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
  //         <CircularProgress color="success" />
  //       </Box>
  //     );
  //   }

  const [sorting, setSorting] = useState([{ id: columns[0].accessorKey, desc: false }]);
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
      globalFilter
    },
    enableRowSelection: enableRowSelection ? true : false,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter, // Ensure this is set to filter rows
    debugTable: true
  });

  let headers = [];
  columns?.map(
    (columns) =>
      // @ts-ignore
      columns.accessorKey &&
      headers.push({
        label: typeof columns.header === 'string' ? columns.header : '#',
        // @ts-ignore
        key: columns.accessorKey
      })
  );

  // useEffect(() => {
  //   setColumnFilters(activeTab === 'Courses' ? [] : [{ id: 'status', value: activeTab }]);
  // }, [activeTab]);
  useEffect(() => {
    const selectedRowsCount = Object.keys(rowSelection).length;
    const selectedCourseIds = Object.keys(rowSelection).filter((key) => rowSelection[key] === true);

    setSelectedRowsCount(selectedRowsCount);
    setSelectedCourseIds(selectedCourseIds);
  }, [rowSelection, setSelectedCourseIds, setSelectedRowsCount]);
  return (
    <>
      {/* Add your other components like DebouncedInput, RowSelection, etc. here */}
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
                          cell.column.columnDef.accessorKey === 'description' ? (
                            cell.getValue()?.length > 40 ? (
                              <CustomTooltip title={cell.getValue()} arrow color="primary" placement="top">
                                <span>{`${cell.getValue().slice(0, 40)}...`}</span>
                              </CustomTooltip>
                            ) : (
                              cell.getValue()
                            )
                          ) : cell.column.columnDef.accessorKey === 'title' ? (
                            cell.getValue()?.length > 11 ? (
                              <CustomTooltip title={cell.getValue()} arrow color="primary" placement="top">
                                <span>{`${cell.getValue().slice(0, 11)}...`}</span>
                              </CustomTooltip>
                            ) : (
                              cell.getValue()
                            )
                          ) : cell.column.columnDef.accessorKey === 'id' ||
                            cell.column.columnDef.accessorKey === 'bundlePurchase.bundle.id' ? (
                            cell.getValue().split('-')[0]
                          ) : cell.getValue()?.length > 25 ? (
                            <CustomTooltip title={cell.getValue()} arrow color="primary" placement="top">
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
                initialPageSize: 5
              }}
            />
          </Box>
        </Stack>
      </ScrollX>
    </>
  );
}

// ==============================|| INVOICE - LIST ||============================== //

export default function Users({
  subscribers,
  contributors,
  groupleaders,
  getUsers,
  age,
  setAge,
  selectedGroupId,
  setSelectedGroupId,
  setSearchedContributor,
  searchedContributor,

  setCurrentId,
  editUser,
  setEditingUser,
  handleAddBulkSubscribers,
  coursesData,
  currentId,
  handleConfirmDelete,
  setSelectedUser,
  editingUser,
  isAdmin,
  handleAddGroupLeader,
  handleAddSubscriber,
  handleConfirmDeleteSubs,
  handleAddBulkGL,
  isUser = false,
  loading,
  isUpdatePending,
  loadingRemove
}) {
  const initialActiveTab = 'Contributor';
  const { currentUser } = useAuth();

  // MUTATIONS & QUERIES

  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [creationCB, setCreationCB] = useState('');
  const [selectedRowsCount, setSelectedRowsCount] = useState({});
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [updatecompanyModalOpen, setupdateCompanyModalOpen] = useState(false);
  const [selectedCompnay, setSelectedCompany] = useState(null);
  // Add this with your other states
  const [selectedContributorForGroups, setSelectedContributorForGroups] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [companyName, setCompanyName] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [addPartnerOpen, setAddPartnerOpen] = useState(false);
  const handleAddContributor = () => setAddPartnerOpen(true);

  const { mutate: deleteCompanyMutate, isPending: isDeletePending } = useDeleteCompany();
  // Add this with your other queries
  const {
    data: groupsData,
    isLoading: loadingGroups,
    refetch: refetchGroups
  } = useGetGroups(
    currentUser?.role === 'admin'
      ? {
        createdBy: selectedContributorForGroups?.id || undefined,
        companyId: selectedCompanyId || undefined
      }
      : {
        createdBy: currentUser?.id,           // Always filter by current user if not admin
      }
  );
  const groups = groupsData?.data || [];
  const { mutateAsync: deleteGroup } = useDeleteGroup();
  const { mutateAsync: toggleGroupStatus } = useToggleGroupStatus();
  const { resendInvitation, isPending: isResendPending, isError, error, data: resendData } = useResendMicrosoftInvitation();


  // Query
  const {
    data: companiesResponse,
    isLoading: loadingCompanies,
    refetch: refetchCompanies
  } = useCompanies(
    currentUser?.role === 'admin'
      ? selectedContributor
        ? { createdBy: selectedContributor.id }
        : {}
      : { createdBy: currentUser?.id }
  );
  const companies = companiesResponse?.data || []; // ← Now companies is the real array
  // Auto-refetch when contributor changes
  useEffect(() => {
    refetchCompanies();
  }, [selectedContributor]);
  const handleResendInvitation = () => {
    resendInvitation(currentId, {
      onSuccess: (data) => {
        toast({ message: data.message || 'Microsoft invitation resent successfully.', type: 'success' });
      },
      onError: (error) => {
        console.log('Error resending Microsoft invitation:', error);
        toast({ message: error.message || 'Failed to resend Microsoft invitation.', type: 'error' });
      }
    });
  };
  const handleCloseViewModal = () => {
    setIsModalOpen(false);
  };
  const handleOpenViewModal = (row) => {
    setSelectedContributor(row.original.email);
    setSelectedName(row.original.name); // Make sure to replace with actual name
    setIsModalOpen(true);
  };
  // modal states
  const [supportAgentModalOpen, setSupportAgentModalOpen] = useState(false);

  // open handler
  const handleOpenSupportAgentModal = () => {
    setSupportAgentModalOpen(true);
  };

  // close handler (optional)
  const handleCloseSupportAgentModal = () => {
    setSupportAgentModalOpen(false);
  };

  const handleOpenCompanyModal = () => {
    setCompanyModalOpen(true);
  };
  const handleOpenUpdateCompanyModal = (company) => {
    setSelectedCompany(company);
    setupdateCompanyModalOpen(true);
  };

  // Handler to close the modal
  const handleCloseCompanyModal = () => {
    setCompanyModalOpen(false);
  };
  const handleCloseUpdateCompanyModal = () => {
    setupdateCompanyModalOpen(false);
  };

  // Callback when company is successfully created
  const handleCompanyCreated = (newCompany) => {
    // Add the new company to your local state
    // setCompanies(prev => [...prev, newCompany]);

    console.log('New company created:', newCompany);
  };
  const handleCompanyUpdated = (newCompany) => {
    // Add the new company to your local state
    // setCompanies(prev => [...prev, newCompany]);

    console.log('New company created:', newCompany);
  };

  const [selectedContributorId, setSelectedContributorId] = useState('');
  const [SelectedGroupIdByCompanies, setSelectedGroupIdByCompanies] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const handleOpenViewCompanyModal = (row) => {
    setSelectedContributorId(row.original.id);
    setViewModalOpen(true);
  };
  const contributorsColumns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 100,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{cell.getValue()}</Stack>
        )
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        size: 150,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{cell.getValue()}</Stack>
        )
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        size: 150,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{cell.getValue()}</Stack>
        )
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 250,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }} title={cell.getValue()}>
            {cell.getValue()}
          </Stack>
        )
      },
      // {
      //   accessorKey: 'role',
      //   header: 'Role',
      //   size: 150,
      //   Cell: ({ cell }) => <>{cell.getValue()}</>
      // },
      {
        header: 'Actions',
        cell: ({ row }) => (
          <Stack direction="row" alignItems="center" spacing={1}>
            {/* <Tooltip title="View">
              <IconButton color="secondary">
                <Eye size={20} />
              </IconButton>
            </Tooltip> */}
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
        )
      }
    ];

    return baseColumns;
  }, []);
  const groupLeadersColumns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 100,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{cell.getValue()}</Stack>
        )
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        size: 150,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{cell.getValue()}</Stack>
        )
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        size: 150,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{cell.getValue()}</Stack>
        )
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 250,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }} title={cell.getValue()}>
            {cell.getValue()}
          </Stack>
        )
      },
      // {
      //   accessorKey: 'role',
      //   header: 'Role',
      //   size: 150,
      //   Cell: ({ cell }) => <>{cell.getValue()}</>
      // },
      {
        accessorKey: 'isActive',
        header: 'ONBOARDED',
        size: 150,
        Cell: ({ row }) => {
          const { isActive, signInType } = row.original;
          if (signInType === 'microsoftEntraID') {
            return <>{isActive ? 'Accepted' : 'Pending'}</>;
          }
          return <>-</>;
        }
      },
      {
        header: 'Actions',
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
        )
      }
    ];

    return baseColumns;
  }, []);
  const subscribersColumns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 100,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{cell.getValue()}</Stack>
        )
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        size: 150,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{cell.getValue()}</Stack>
        )
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        size: 150,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{cell.getValue()}</Stack>
        )
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 250,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }} title={cell.getValue()}>
            {cell.getValue()}
          </Stack>
        )
      },
      // {
      //   accessorKey: 'role',
      //   header: 'Role',
      //   size: 150,
      //   Cell: ({ cell }) => <>{cell.getValue()}</>
      // },
      {
        accessorKey: 'isActive',
        header: 'Accepted',
        size: 150,
        Cell: ({ row }) => {
          const { isActive, signInType } = row.original;
          if (signInType === 'microsoftEntraID') {
            return <>{isActive ? 'Accepted' : 'Pending'}</>;
          }
          return <>-</>;
        }
      },
      {
        header: 'Actions',
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
        )
      }
    ];

    return baseColumns;
  }, []);
  const groupsColumns = useMemo(() => {
    return [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 100,
        Cell: ({ cell }) => (
          <Typography noWrap fontFamily="monospace" fontSize="0.875rem">
            {cell.getValue()?.slice(0, 8)}...
          </Typography>
        )
      },
      {
        accessorKey: 'name',
        header: 'Group Name',
        size: 200,
        Cell: ({ cell }) => <strong>{cell.getValue()}</strong>
      },
      {
        accessorKey: 'company.name',
        header: 'Company',
        size: 200,
        Cell: ({ row }) => row.original.company?.name || '-'
      },
      {
        header: 'No. of Users',
        accessorFn: (row) => row.groupUsers?.length || 0,
        size: 120,
        Cell: ({ cell }) => (
          <Chip label={cell.getValue()} color="primary" size="small" />
        )
      },
      {
        header: 'Status',
        accessorFn: (row) => (row.isActive ? 'Active' : 'Inactive'),
        size: 120,
        Cell: ({ row }) => {
          const active = row.original.isActive;
          return (
            <Chip
              label={active ? 'Active' : 'Inactive'}
              color={active ? 'success' : 'default'}
              size="small"
            />
          );
        }
      },
      {
        header: 'Actions',
        size: 150,
        Cell: ({ row }) => {
          const group = row.original;
          const isActive = group.isActive;
          const handleToggleStatus = async () => {
            try {
              await toggleGroupStatus(group.id);
              toast({
                message: isActive ? 'Group deactivated' : 'Group activated',
                type: 'success'
              });
              refetchGroups();
            } catch (err) {
              toast({ message: 'Failed to update status', type: 'error' });
            }
          };

          const handleDelete = async () => {
            if (!window.confirm('Delete this group permanently? This cannot be undone.')) return;

            try {
              await deleteGroup({
                groupId: group.id,
                gophishGroupId: group.gophishGroupID
              });
              toast({ message: 'Group deleted successfully', type: 'success' });
              refetchGroups();
            } catch (err) {
              toast({ message: err.message || 'Failed to delete group', type: 'error' });
            }
          };

          return (
            <Stack direction="row" spacing={1}>
              <Tooltip title={isActive ? 'Deactivate' : 'Activate'}>
                <IconButton
                  size="small"
                  color={isActive ? 'warning' : 'success'}
                  onClick={handleToggleStatus}
                >
                  {isActive ? <CloseCircle size={18} /> : <AddCircle size={18} />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" color="error" onClick={handleDelete}>
                  <Trash size={18} />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ];
  }, [refetchGroups]);

  // Add to your state declarations
  const [assignSeatsModalOpen, setAssignSeatsModalOpen] = useState(false);
  const [selectedCompanyForSeats, setSelectedCompanyForSeats] = useState(null);
  // Add this handler
  const handleOpenAssignSeatsModal = (company) => {
    setSelectedCompanyForSeats(company);
    setAssignSeatsModalOpen(true);
  };

  const handleCloseAssignSeatsModal = () => {
    setAssignSeatsModalOpen(false);
    setSelectedCompanyForSeats(null);
  };

  const companiesColumns = useMemo(() => {
    return [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 100,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{cell.getValue()}</Stack>
        )
      },
      {
        accessorKey: 'name',
        header: 'Name',
        size: 200,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{cell.getValue()}</Stack>
        )
      },
      {
        accessorKey: 'address',
        header: 'Address',
        size: 250,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>{cell.getValue()}</Stack>
        )
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 250,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>
            {cell.getValue()}
          </Stack>
        )
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
        cell: ({ row }) => (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip title="Assign Seats">
              <IconButton
                color="success"
                onClick={() => handleOpenAssignSeatsModal(row?.original)}
              >
                <Key size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton color="error" onClick={() => openConfirm(row?.original?.id)}>
                <Trash size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton color="primary" onClick={() => handleOpenUpdateCompanyModal(row?.original)}>
                <Edit size={20} />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ];
  }, []);

  // State for confirmation
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Open confirm dialog
  const openConfirm = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  // Mutation with isPending

  const handleDeleteCompany = (id) => {
    deleteCompanyMutate(id, {
      onSuccess: (data) => {
        toast({ message: 'Company deleted successfully.', type: 'success' });
        setConfirmOpen(false);
      },
      onError: (error) => {
        console.log('Error deleting company:', error);
        toast({ message: `${error?.message}`, type: 'error' });
      }
    });
  };

  // Confirm action
  const handleConfirmDeleteCompany = () => {
    if (selectedId) {
      handleDeleteCompany(selectedId);
    }
  };

  const handleEditClick = (row) => {
    // Set the current row's data in the editing state
    setEditModalOpen(true);
    setEditingUser(row);
    setCurrentId(row.id);

    // Open the edit modal
    setEditModalOpen(true);
  };
  const handleDeleteClick = (row) => {
    setSelectedUser({ ...row?.original });
    setDeleteModalOpen(true);
  };
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  // Centralized config for data & columns per tab
  const TAB_CONFIG = {
    Contributor: {
      data: contributors,
      columns: contributorsColumns
    },
    'Group Leader': {
      data: groupleaders,
      columns: groupLeadersColumns
    },
    Subscribers: {
      data: subscribers,
      columns: subscribersColumns
    },
    Companies: { data: companies, columns: companiesColumns }, // ← no .data!
    Groups: { data: groups, columns: groupsColumns } // ← ADD THIS
  };

  // Resolve active tab safely (NO courses fallback)
  const { data = [], columns = [] } = TAB_CONFIG[activeTab] || {};

  const tabs = [
    { label: 'Partners', value: 'Contributor', icon: <FaBook /> },
    { label: 'Companies', value: 'Companies', icon: <FaUser /> },
    { label: 'Groups', value: 'Groups', icon: <MdGroupAdd /> }, // ← NEW TAB
    { label: 'Group Leader', value: 'Group Leader', icon: <FaBox /> },
    { label: 'Staff', value: 'Subscribers', icon: <FaUser /> },

  ];

  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [enableRowSelection, disableRowSelection] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [contSearchQuery, setContSearchQuery] = useState('');

  const [anchorEl, setAnchorEl] = useState(null);
  const handleClose = () => {
    setAnchorEl(null);
  };
  const buttonRef = useRef(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // Update button width when clicked
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
  };
  const handleContributorChange = (contributor) => {
    setSearchedContributor(contributor?.email);
  };

  const handleContSearchChange = (event) => {
    setContSearchQuery(event.target.value.toLowerCase());
  };

  const handleChange = (groupId, groupName) => {
    setAge(groupName);
    setSelectedGroupId(groupId); // Set the selected group ID
  };


  const filteredContributors = contributors?.filter((contributor) =>
    contributor.email.toLowerCase().includes(contSearchQuery.toLowerCase())
  );

  const OnClear = () => {
    setAge('');
    setSearchQuery('');
    setSelectedGroupId(null);
    getUsers();
  };


  return (
    <>
      <MainCard content={false}>
        <Grid
          container
          direction={matchDownSM ? 'column' : 'row'}
          spacing={2}
          sx={{ pb: 2, alignItems: 'center', justifyContent: 'space-between' }}
        >
          {/* Tabs and Filters in One Row */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                pb: 0,
                width: '100%',
                justifyContent: matchDownSM ? 'center' : 'space-between'
              }}
            >
              {/* Tabs */}
              <Box sx={{ display: 'flex', flexGrow: 1, minWidth: '300px' }}>
                <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)} sx={{ borderColor: 'divider' }}>
                  {tabs.map((group, index) => (
                    <Tab
                      key={index}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ mr: 1 }}>{group.icon}</Box>
                          {group.label}
                        </Box>
                      }
                      value={group.value}
                      sx={{
                        '& .Mui-selected .MuiTab-iconWrapper': { color: 'green' },
                        '& .MuiTab-iconWrapper': {
                          color: (theme) => (theme.palette.mode === 'light' ? 'gray' : 'green')
                        }
                      }}
                    />
                  ))}
                </Tabs>
              </Box>
              {activeTab === 'Group Leader' && (
                <Grid
                  item
                  lg={3.5}
                  xl={3.8}
                  sx={{
                    marginRight: 2,
                    marginTop: '10px',
                    display: 'flex',
                    justifyContent: 'end'
                  }}
                >
                  <Grid>
                    <Button
                      // ref={buttonRef}
                      variant="contained"
                      color="primary"
                      startIcon={<AddCircle />}
                      onClick={handleClick}
                    // sx={{ py: 1.5, px: 3 }}
                    >
                      Add Group Leader
                    </Button>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                      // onChange={handleDropdownChange}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left'
                      }}
                      PaperProps={{
                        style: {
                          width: 'auto', // Use measured button width
                          marginTop: '8px'
                        }
                      }}
                    >
                      <MenuItem
                        value={10}
                        onClick={() => {
                          handleClose();
                          handleAddGroupLeader();
                        }}
                        sx={{ width: '100%' }}
                      >
                        <IoMdPersonAdd
                          style={{
                            fontSize: '20px',
                            marginRight: '10px'
                          }}
                        />
                        Add One
                      </MenuItem>
                      <MenuItem
                        value={20}
                        onClick={() => {
                          handleClose();
                          handleAddBulkGL();
                        }}
                        sx={{ width: '100%' }}
                      >
                        <MdGroupAdd
                          style={{
                            fontSize: '20px',
                            marginRight: '10px'
                          }}
                        />
                        Add Bulk
                      </MenuItem>
                    </Menu>
                  </Grid>
                </Grid>
              )}
              {activeTab === 'Subscribers' && (
                <Grid
                  item
                  lg={3.5}
                  xl={3.8}
                  sx={{
                    marginRight: 2,
                    marginTop: '10px',
                    display: 'flex',
                    justifyContent: 'end'
                  }}
                >
                  <Grid>
                    <Button
                      // ref={buttonRef}
                      variant="contained"
                      color="primary"
                      startIcon={<AddCircle />}
                      onClick={handleClick}
                    // sx={{ py: 1.5, px: 3 }}
                    >
                      Add Staff
                    </Button>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                      // onChange={handleDropdownChange}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left'
                      }}
                      PaperProps={{
                        style: {
                          width: 'auto',
                          marginTop: '8px'
                        }
                      }}
                    >
                      <MenuItem
                        value={10}
                        onClick={() => {
                          handleClose();
                          handleAddSubscriber();
                        }}
                        sx={{ width: '100%' }}
                      >
                        <IoMdPersonAdd
                          style={{
                            fontSize: '20px',
                            marginRight: '10px'
                          }}
                        />
                        Add One
                      </MenuItem>
                      <MenuItem
                        value={20}
                        onClick={() => {
                          handleClose();
                          handleAddBulkSubscribers();
                        }}
                        sx={{ width: '100%' }}
                      >
                        <MdGroupAdd
                          style={{
                            fontSize: '20px',
                            marginRight: '10px'
                          }}
                        />
                        Add Bulk
                      </MenuItem>
                    </Menu>
                  </Grid>
                </Grid>
              )}


              <>
                {/* Add Buttons - Only show one at a time based on tab */}
                {activeTab === 'Contributor' && (
                  <Button
                    variant="contained"
                    sx={{ mt: 1.5, mr: 2 }}
                    startIcon={<AddCircle />}
                    onClick={handleAddContributor}
                  >
                    Add Partner
                  </Button>
                )}

                {activeTab === 'Companies' && (
                  <Button
                    variant="contained"
                    sx={{ mt: 1.5, mr: 2 }}
                    startIcon={<AddCircle />}
                    onClick={handleOpenCompanyModal}
                  >
                    Add Company
                  </Button>
                )}

                {activeTab === 'SupportAgents' && (
                  <Button
                    variant="contained"
                    sx={{ mt: 1.5, mr: 2 }}
                    startIcon={<AddCircle />}
                    onClick={handleOpenSupportAgentModal}
                  >
                    Add Support Agent
                  </Button>
                )}

                {/* Filters - Show Contributor Filter on Companies, Group Leader, and Subscribers tabs */}
                {(activeTab === 'Companies' ||
                  activeTab === 'Group Leader' ||
                  activeTab === 'Subscribers' ||
                  activeTab === 'Groups') && (
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* Contributor Filter - Most important for Companies tab */}
                      <ContributorFilter
                        searchedContributor={searchedContributor}
                        setSearchedContributor={setSearchedContributor}
                        contSearchQuery={contSearchQuery}
                        setContSearchQuery={setContSearchQuery}
                        filteredContributors={filteredContributors}
                        handleContributorChange={(contributor) => {
                          handleContributorChange(contributor);
                          setSelectedContributorForGroups(contributor);
                          setSelectedContributor(contributor); // ← this triggers refetch
                        }}
                        activeTab={activeTab}
                        getUsers={getUsers}
                        isAdmin={currentUser?.role === 'admin'}
                        placeholder={
                          activeTab === 'Companies'
                            ? "Filter by Partner"
                            : "Filter by Partner"
                        }
                        onClear={() => {
                          setSelectedContributor(null); // ← this triggers useEffect → refetch all
                          setSelectedContributorForGroups(null); // ← THIS FIX: also clear groups filter
                        }}
                      />

                      {/* Group Filter - Only for Group Leader & Subscribers */}
                      {(activeTab === 'Group Leader' || activeTab === 'Subscribers') && (
                        <CompanyGroupFilter
                          groupName={age}
                          setGroupName={setAge}
                          selectedGroupId={selectedGroupId}
                          setSelectedGroupId={setSelectedGroupId}
                          handleChange={handleChange}
                          isAdmin={true}
                          OnClear={OnClear}
                        />
                      )}
                    </Box>
                  )}
                {activeTab === 'Groups' && (
                  <CompanyFilter
                    selectedCompanyId={selectedCompanyId}
                    setSelectedCompanyId={setSelectedCompanyId}
                    companyName={companyName}
                    setCompanyName={setCompanyName}
                    onCompanyChange={(id) => {
                      setSelectedCompanyId(id);
                      refetchGroups(); // this triggers useGetGroups with new companyId
                    }}
                    onClear={() => {
                      setSelectedCompanyId(null);
                      setCompanyName('');
                      // refetchGroups(); // this shows ALL groups again
                    }}
                  />
                )}
              </>

            </Box>
          </Grid>

          {/* Table */}
          <Grid item xs={12}>
            <ReactTable
              {...{
                data,
                columns,
                activeTab,
                setActiveTab,
                selectedRowsCount,
                setSelectedRowsCount,
                creationCB,
                enableRowSelection,
                setSelectedCourseIds
              }}
            />
          </Grid>
        </Grid>
      </MainCard>



      <CompanyModal open={companyModalOpen} onClose={handleCloseCompanyModal} onCompanyCreated={handleCompanyCreated} />
      <SupportAgentModal
        open={supportAgentModalOpen}
        onClose={handleCloseSupportAgentModal}
        onAgentCreated={(newAgent) => {
          // Optionally refresh the support agents list here
          console.log('Support agent created:', newAgent);
        }}
      />
      <AddPartnerDialog
        open={addPartnerOpen}
        onClose={() => setAddPartnerOpen(false)}
        onSuccess={() => getUsers?.()} // refresh the contributors list
      />
      <UpdateCompanyModal
        open={updatecompanyModalOpen}
        onClose={handleCloseUpdateCompanyModal}
        onCompanyCreated={handleCompanyUpdated}
        company={selectedCompnay}
      />

      <CompaniesViewModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        contributorId={selectedContributorId}
        SelectedGroupId={SelectedGroupIdByCompanies}
        setSelectedGroupId={setSelectedGroupIdByCompanies}
      />

      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} fullWidth>
        <DialogTitle>Edit {activeTab === 'Subscribers' ? 'Staff' : activeTab}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>Update the {activeTab === 'Subscribers' ? 'Staff' : activeTab}'s information below.</DialogContentText>
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
            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
            fullWidth
            sx={{ mb: 1.5 }}
            margin="dense"
          />
          {editingUser?.signInType === 'microsoftEntraID' && editingUser?.isActive != true && (
            <>
              <Button variant="outlined" onClick={handleResendInvitation} disabled={isResendPending} sx={{ mt: 2 }}>
                {isResendPending ? 'Resending...' : 'Resend Microsoft Invitation'}
              </Button>
              {isError && (
                <DialogContentText sx={{ mt: 1, color: 'error.main' }}>
                  Error: {error?.message || 'Failed to resend invitation'}
                </DialogContentText>
              )}
              {resendData && <DialogContentText sx={{ mt: 1, color: 'success.main' }}>{resendData.message}</DialogContentText>}
            </>
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
            {isUpdatePending ? 'Updating...' : `Update ${activeTab}`}
          </Button>
        </DialogActions>
      </Dialog>

      <ViewDashboardModal isOpen={isModalOpen} onClose={handleCloseViewModal} name={selectedName} email={selectedContributor} />
      <AssignSeatsModal
        open={assignSeatsModalOpen}
        onClose={handleCloseAssignSeatsModal}
        company={selectedCompanyForSeats}
      />
      <Dialog
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Box sx={{ p: 1, py: 1.5 }}>
          <DialogTitle id="alert-dialog-title">Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Deleting the user will remove all their data from the app permanently. Are you sure you want to proceed?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              color="error"
              onClick={() => {
                setDeleteModalOpen(false);
              }}
            >
              Disagree
            </Button>
            <Button
              variant="contained"
              disabled={loadingRemove}
              onClick={async () => {
                if (activeTab === 'Subscribers') {
                  await handleConfirmDeleteSubs();
                }
                if (activeTab === 'Group Leader') {
                  await handleConfirmDelete();
                }
                setAge('');
                setSearchQuery('');
                // setSelectedGroupId(null);
                setDeleteModalOpen(false);
              }}
              autoFocus
            >
              {loadingRemove ? 'Removing...' : 'Agree'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this company? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={isDeletePending}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDeleteCompany} color="error" variant="contained" disabled={isDeletePending}>
            {isDeletePending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function LinearWithLabel({ value, ...others }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress color="warning" variant="determinate" value={value} {...others} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="white">{`${Math.round(value)}%`}</Typography>
      </Box>
    </Box>
  );
}

ReactTable.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  activeTab: PropTypes.string,
  setActiveTab: PropTypes.func
};

LinearWithLabel.propTypes = { value: PropTypes.any, others: PropTypes.any };
