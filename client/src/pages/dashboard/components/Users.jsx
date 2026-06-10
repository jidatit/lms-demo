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
import { Add, AddCircle, CloseCircle, CloseSquare, Edit, Eye, Trash } from 'iconsax-react';
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
import ViewDashboardModal from './ViewDashboardModal';
import CompanyGroupFilter from 'components/CompanyGroupFilter';
import ContributorFilter from './ContributorSelect';
import { useHandleRemoveGroupMember } from 'hooks/useRemoveGroupMember';
import { useDeleteCompany } from 'api/queries/companies';
import { toast } from 'utils/toast';
import { useResendMicrosoftInvitation } from 'api/queries/microsoftEntraId';
import CompanyModal from './CompanyModal';
import UpdateCompanyModal from './CompanyUpdateModal';
import SupportAgentModal from './SupportAgentModal';

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
  companies,
  subscribers,
  contributors,
  groupleaders,
  getUsers,
  supportAgentsData,
  age,
  setAge,
  selectedGroupId,
  setSelectedGroupId,
  setSearchedContributor,
  searchedContributor,
  setSelectedEmail,
  setCurrentId,
  editUser,
  setEditingUser,
  handleAddBulkSubscribers,
  groupManagment,
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
  handleOpenViewCompanyModal,
  handleChangeContributor,
  isUpdatePending,
  loadingRemove
}) {
  const initialActiveTab = groupManagment ? 'Group Leader' : 'Contributor';

  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [creationCB, setCreationCB] = useState('');
  const [selectedRowsCount, setSelectedRowsCount] = useState({});
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [updatecompanyModalOpen, setupdateCompanyModalOpen] = useState(false);
  const [selectedCompnay, setSelectedCompany] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastMame: '',
    email: ''
  }); //

  const [createCourseForm, setCreateCourseForm] = useState({
    title: '',
    description: '',
    priceperseat: ''
  });
  const [showRowSelection, setShowRowSelection] = useState(false);
  const [createCourseBundleForm, setCreateCourseBundleForm] = useState({
    title: '',
    description: '',
    priceperseat: ''
  });

  const handleCreateCourse = async () => {
    try {
      await axiosInstance.post('/courses/add', {
        title: createCourseForm.title,
        description: createCourseForm.description,
        priceperseat: createCourseForm.priceperseat
      });
      openSnackbar({
        open: true,
        message: 'New Course created successfully.',
        variant: 'alert',
        alert: {
          color: 'success'
        },
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        },
        close: true
      });

      setCreateCourseForm({
        title: '',
        description: '',
        priceperseat: ''
      });
      handleCloseModal();
    } catch (error) {
      console.log(error);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState('');
  const [selectedName, setSelectedName] = useState('');

  const { mutate: deleteCompanyMutate, isPending: isDeletePending } = useDeleteCompany();
  const { resendInvitation, isPending: isResendPending, isError, error, data: resendData } = useResendMicrosoftInvitation();
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
  const coursesColumns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: 'bundlePurchase.bundle.id',
        header: 'ID',
        size: 80, // Reduced width
        muiTableHeadCellProps: {
          sx: { paddingLeft: '18px' }
        },
        Cell: ({ cell }) => (
          <Stack
            sx={{
              paddingLeft: '18px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '80px' // Match the column size
            }}
          >
            {cell.getValue()}
          </Stack>
        )
      },
      {
        accessorKey: 'bundlePurchase.bundle.title',
        header: 'Title',
        size: 80, // Reduced width
        Cell: ({ cell }) => (
          <Stack
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '80px'
            }}
          >
            {cell.getValue()}
          </Stack>
        )
      },
      // {
      //   accessorKey: 'bundlePurchase.bundle.description',
      //   header: 'Description',
      //   size: 250, // Increased width
      //   Cell: ({ cell }) => (
      //     <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{cell.getValue()}</Stack>
      //   )
      // },

      {
        header: 'Actions',
        cell: ({ row }) => {
          const bundleId = row.original?.bundlePurchase?.bundle?.id; // safe access
          return (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Tooltip title="View">
                <Link to={`/dashboard/view_bundles?id=${bundleId}${isAdmin ? '&admin=true' : ''}`}>
                  <IconButton color="secondary">
                    <Eye size={20} />
                  </IconButton>
                </Link>
              </Tooltip>
            </Stack>
          );
        }
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
        accessorKey: 'vatNumber',
        header: 'VAT Number',
        size: 150,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{cell.getValue()}</Stack>
        )
      },
      {
        header: 'Actions',
        cell: ({ row }) => (
          <Stack direction="row" alignItems="center" spacing={1}>
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
      // {
      //   accessorKey: 'creator_email',
      //   header: 'Creator email',
      //   size: 180,
      //   Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString()
      // }
      // {
      //   accessorKey: 'created_at',
      //   header: 'Created At',
      //   size: 180,
      //   Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString()
      // }
    ];
  }, []);
  const supportAgentsColumns = useMemo(() => {
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

            {
             //TODO create delete for the support agent
            /* <Tooltip title="Delete">
              <IconButton color="error" onClick={() => handleDeleteClick(row)}>
                <Trash size={20} />
              </IconButton>
            </Tooltip> */}
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
  // Determine the active tab's data and columns
  // const data =
  //   activeTab === 'Contributor'
  //     ? contributors
  //     : activeTab === 'Group Leader'
  //       ? groupleaders
  //       : activeTab === 'Subscribers'
  //         ? subscribers
  //         : activeTab === 'Companies'
  //           ? companies
  //           : activeTab === 'SupportAgents'
  //             ? supportAgentsData
  //             : coursesData;

  // const columns =
  //   activeTab === 'Contributor'
  //     ? contributorsColumns
  //     : activeTab === 'Group Leader'
  //       ? groupLeadersColumns
  //       : activeTab === 'Subscribers'
  //         ? subscribersColumns
  //         : activeTab === 'Companies'
  //           ? companiesColumns
  //           : activeTab === 'SupportAgents'
  //             ? supportAgentsColumns
  //             : coursesColumns;

  //TODO CLEAN THE CODE ABOVE 
  //REMOVED THE COMPANIES COLUMN
  const data =
    activeTab === 'Contributor'
      ? contributors
      : activeTab === 'Group Leader'
        ? groupleaders
        : activeTab === 'Subscribers'
          ? subscribers
          : activeTab === 'SupportAgents'
            ? supportAgentsData
            : coursesData;

  const columns =
    activeTab === 'Contributor'
      ? contributorsColumns
      : activeTab === 'Group Leader'
        ? groupLeadersColumns
        : activeTab === 'Subscribers'
          ? subscribersColumns
          : activeTab === 'SupportAgents'
            ? supportAgentsColumns
            : coursesColumns;


  const groups = [
    ...(groupManagment
      ? [
        { label: 'Group Leader', value: 'Group Leader', icon: <FaBox /> },
        { label: 'Staff', value: 'Subscribers', icon: <FaUser /> },
        // { label: 'Bundles', value: 'Courses', icon: <FaChalkboardTeacher /> }
      ]
      : [
        { label: 'Partners', value: 'Contributor', icon: <FaBook /> },
        { label: 'Group Leader', value: 'Group Leader', icon: <FaBox /> },
        { label: 'Staff', value: 'Subscribers', icon: <FaUser /> },
        // { label: 'Companies', value: 'Companies', icon: <FaUser /> },
        { label: 'Support Agents', value: 'SupportAgents', icon: <FaUser /> }

      ])
  ];

  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [enableRowSelection, disableRowSelection] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [contSearchQuery, setContSearchQuery] = useState('');
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
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
  const handleContributorChange = (email) => {
    setSelectedEmail(email);
    setSearchedContributor(email);
    handleChangeContributor(email);
  };

  const handleContSearchChange = (event) => {
    setContSearchQuery(event.target.value.toLowerCase());
  };

  const handleChange = (groupId, groupName) => {
    setAge(groupName);
    setSelectedGroupId(groupId); // Set the selected group ID
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  const filteredContributors = contributors?.filter((contributor) =>
    contributor.email.toLowerCase().includes(contSearchQuery.toLowerCase())
  );

  const handleAddContributor = (event) => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };
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
                  {groups.map((group, index) => (
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
              {groupManagment && activeTab === 'Group Leader' && (
                // <Button
                //   variant="contained"
                //   sx={{
                //     display: 'flex',
                //     justifyContent: 'center',
                //     alignItems: 'center',
                //     marginTop: '10px',
                //     marginRight: '20px'
                //   }}
                //   startIcon={<AddCircle />}
                //   onClick={handleAddGroupLeader}
                // >
                //   Add Group Leader
                // </Button>
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
              {groupManagment && activeTab === 'Subscribers' && (
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
                          width: 'auto', // Use measured button width
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

              {/* Cl
                      
              {/* Filters and Buttons */}
              {!groupManagment &&
                (activeTab === 'Contributor' ? (
                  <Button
                    variant="contained"
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: '10px',
                      marginRight: '20px'
                    }}
                    startIcon={<AddCircle />}
                    onClick={handleAddContributor}
                  >
                    Add Partner
                  </Button>
                ) : activeTab === 'Companies' ? (
                  <>
                    <Button
                      variant="contained"
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: '10px',
                        marginRight: '20px'
                      }}
                      startIcon={<AddCircle />}
                      onClick={handleOpenCompanyModal}
                    >
                      Add Company
                    </Button>
                  </>
                ) : activeTab === 'SupportAgents' ? (
                  <>
                    <Button
                      variant="contained"
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: '10px',
                        marginRight: '20px'
                      }}
                      startIcon={<AddCircle />}
                      onClick={handleOpenSupportAgentModal}
                    >
                      Add Support Agent
                    </Button>
                  </>
                ) : (
                  <Box sx={{ display: 'flex', gap: 2, justifyItems: 'flex-end' }}>
                    <CompanyGroupFilter
                      groupName={age}
                      setGroupName={setAge}
                      selectedGroupId={selectedGroupId}
                      setSelectedGroupId={setSelectedGroupId}
                      handleChange={handleChange}
                      isAdmin={true}
                      OnClear={OnClear}
                    />
                    <ContributorFilter
                      searchedContributor={searchedContributor}
                      setSearchedContributor={setSearchedContributor}
                      contSearchQuery={contSearchQuery}
                      setContSearchQuery={setContSearchQuery}
                      filteredContributors={filteredContributors}
                      handleContributorChange={handleContributorChange}
                      activeTab={activeTab}
                      getUsers={getUsers}
                    />
                  </Box>
                ))}

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

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Add Partner</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>To create a Partner, please enter the FirstName, LastName, and Email.</DialogContentText>
          <InputLabel htmlFor="firstname" sx={{ mb: 0.5 }}>
            First Name
          </InputLabel>
          <TextField
            id="firstname"
            placeholder="Enter First Name"
            value={FormData.firstname}
            onChange={(e) => setFormData({ ...FormData, firstname: e.target.value })}
            fullWidth
            margin="dense"
            sx={{ mb: 1.5 }}
          />
          <InputLabel htmlFor="lastname" sx={{ mb: 0.5 }}>
            Last Name
          </InputLabel>
          <TextField
            id="lastname"
            placeholder="Enter Last Name"
            value={FormData.lastname}
            onChange={(e) => setFormData({ ...FormData, lastname: e.target.value })}
            fullWidth
            margin="dense"
            sx={{ mb: 1.5 }}
          />
          <InputLabel htmlFor="email" sx={{ mb: 0.5 }}>
            Email
          </InputLabel>
          <TextField
            id="email"
            placeholder="Enter Email"
            value={FormData.email}
            onChange={(e) => setFormData({ ...FormData, email: e.target.value })}
            fullWidth
            margin="dense"
            sx={{ mb: 1.5 }}
          />
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button color="error" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateCourse}>
            Create Partner
          </Button>
        </DialogActions>
      </Dialog>

      <CompanyModal open={companyModalOpen} onClose={handleCloseCompanyModal} onCompanyCreated={handleCompanyCreated} />
      <SupportAgentModal
        open={supportAgentModalOpen}
        onClose={handleCloseSupportAgentModal}
        onAgentCreated={(newAgent) => {
          // Optionally refresh the support agents list here
          console.log('Support agent created:', newAgent);
        }}
      />

      <UpdateCompanyModal
        open={updatecompanyModalOpen}
        onClose={handleCloseUpdateCompanyModal}
        onCompanyCreated={handleCompanyUpdated}
        company={selectedCompnay}
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
