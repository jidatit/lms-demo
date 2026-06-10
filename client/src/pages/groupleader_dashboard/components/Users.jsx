import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
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
  getAllGroupLeaders,
  getAllSubscribers,
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
                            cell.getValue()?.length > 60 ? (
                              <CustomTooltip title={cell.getValue()} arrow color="primary" placement="top">
                                <span>{`${cell.getValue().slice(0, 60)}...`}</span>
                              </CustomTooltip>
                            ) : (
                              cell.getValue()
                            )
                          ) : cell.column.columnDef.accessorKey === 'title' ? (
                            cell.getValue()?.length > 17 ? (
                              <CustomTooltip title={cell.getValue()} arrow color="primary" placement="top">
                                <span>{`${cell.getValue().slice(0, 17)}...`}</span>
                              </CustomTooltip>
                            ) : (
                              cell.getValue()
                            )
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

  AllGroups,

  setSelectedGroupId,
  setSearchedContributor,

  setSelectedEmail,
  setCurrentId,

  setEditingUser,
  groupManagment,
  coursesData,

  setSelectedUser,

  isAdmin,
  handleAddGroupLeader,
  handleAddSubscriber
}) {
  const initialActiveTab = 'Subscribers';

  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [creationCB, setCreationCB] = useState('');
  const [selectedRowsCount, setSelectedRowsCount] = useState({});
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
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

  const coursesColumns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: 'id',
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
        accessorKey: 'title',
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
      {
        accessorKey: 'description',
        header: 'Description',
        size: 250, // Increased width
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{cell.getValue()}</Stack>
        )
      }
      // {
      //   accessorKey: 'priceperseat',
      //   header: 'Price Per Seat',
      //   size: 150,
      //   Cell: ({ cell }) => (
      //     <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>${cell.getValue()}</Stack>
      //   )
      // }
      // {
      //   header: 'Actions',
      //   cell: ({ row }) => (
      //     <Stack direction="row" alignItems="center" spacing={1}>
      //       <Tooltip title="View">
      //         <Link to={`/dashboard/course_details?id=${row.original.id}${isAdmin ? '&admin=true' : ''}`}>
      //           <IconButton color="secondary">
      //             <Eye size={20} />
      //           </IconButton>
      //         </Link>
      //       </Tooltip>
      //     </Stack>
      //   )
      // }
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
        accessorKey: 'firstname',
        header: 'First Name',
        size: 150,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{cell.getValue()}</Stack>
        )
      },
      {
        accessorKey: 'lastname',
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
      {
        accessorKey: 'role',
        header: 'Role',
        size: 150,
        Cell: ({ cell }) => <>{cell.getValue()}</>
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
  const handleEditClick = (row) => {
    // Set the current row's data in the editing state
    setEditModalOpen(true);
    setEditingUser(row);
    setCurrentId(row.original.id);

    // Open the edit modal
    setEditModalOpen(true);
  };
  const handleDeleteClick = (row) => {
    setSelectedUser({ id: row.original.id, email: row.original.email });
    setDeleteModalOpen(true);
  };
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  // Determine the active tab's data and columns
  const data = activeTab === 'Subscribers' ? subscribers : coursesData;

  const columns = activeTab === 'Subscribers' ? subscribersColumns : coursesColumns;

  const groups = [
    { label: 'Subscribers', value: 'Subscribers', icon: <FaUser /> },
    { label: 'Attached Courses', value: 'Courses', icon: <FaChalkboardTeacher /> }
  ];
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [enableRowSelection, disableRowSelection] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [contSearchQuery, setContSearchQuery] = useState('');
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const handleContributorChange = (event) => {
    setSelectedEmail(event.target.value);
    setSearchedContributor(event.target.value);
  };

  const handleContSearchChange = (event) => {
    setContSearchQuery(event.target.value.toLowerCase());
  };

  const filteredOptions = AllGroups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleChange = (event) => {
    const selectedName = event.target.value;
    const selectedGroup = AllGroups.find((group) => group.name === selectedName);

    if (selectedGroup) {
      setAge(selectedName);
      setSelectedGroupId(selectedGroup.id); // Set the selected group ID
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleAddContributor = (event) => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
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
              <>
                {groupManagment && activeTab === 'Subscribers' && (
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
                    onClick={handleAddSubscriber}
                  >
                    Add Subscriber
                  </Button>
                )}

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
                      Add Contributor
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, flexWrap: 'wrap' }}>{/* Group Filter */}</Box>
                  ))}
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
