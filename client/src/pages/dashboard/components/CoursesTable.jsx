import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
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
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';
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
import { AddCircle, Edit, Eye, Trash } from 'iconsax-react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Modal,
  Select,
  TextField
} from '@mui/material';
import { Link } from 'react-router-dom';
import { FaEllipsis, FaBook, FaBox } from 'react-icons/fa6';
import { openSnackbar } from 'api/snackbar';
import axiosInstance from 'utils/axiosConfig';
import CustomTooltip from 'components/@extended/Tooltip';
import CreateBundleDialog from './CreateBundleDialog';
import { useCreateCourse } from 'api/queries/courses';
import TableSkeleton from './SkeltonReportsTable';
<script src="http://localhost:8097"></script>

export const fuzzyFilter = (row, columnId, value) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  return itemRank.passed;
};


const categoryOptions = [
  '',
  'Phishing Awareness',
  'Password Security',
  'Data Protection',
  'GDPR Compliance',
  'Physical Security',
  'Executive Training',
  'General Awareness',
];
function ReactTable({
  data,
  columns,
  activeTab,
  setActiveTab,
  selectedRowsCount,
  setSelectedRowsCount,
  creationCB,
  enableRowSelection,
  setSelectedCourseIds,
  isLoading
}) {
  // Handle loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', height: '30vh' }}>
        <TableSkeleton rows={5} columns={4} />
      </Box>
    );
  }
  // Handle no data case
  // Check if data is null, undefined, an empty object, or an empty array
  if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No {activeTab.toLowerCase()} found
        </Typography>
      </Box>
    );
  }

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
    globalFilterFn: fuzzyFilter,
    debugTable: true
  });

  let headers = [];
  columns?.map(
    (columns) =>
      columns.accessorKey &&
      headers.push({
        label: typeof columns.header === 'string' ? columns.header : '#',
        key: columns.accessorKey
      })
  );

  useEffect(() => {
    const selectedRowsCount = Object.keys(rowSelection).length;
    const selectedCourseIds = Object.keys(rowSelection).filter((key) => rowSelection[key] === true);
    setSelectedRowsCount(selectedRowsCount);
    setSelectedCourseIds(selectedCourseIds);
  }, [rowSelection, setSelectedCourseIds, setSelectedRowsCount]);

  return (
    <>
      <ScrollX>
        <Stack>
          <TableContainer>
            <Table sx={{ minWidth: 750, tableLayout: 'fixed' }}>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell
                        key={header.id}
                        style={{
                          width: header.column.columnDef.size || 'auto'
                        }}
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
                      <TableCell key={cell.id} style={{ width: cell.column.columnDef.size || 'auto' }} {...cell.column.columnDef.meta}>
                        <CustomTooltip title={cell.getValue()} placement="top" arrow color="primary">
                          {typeof cell.getValue() === 'string'
                            ? cell.column.columnDef.accessorKey === 'id'
                              ? cell.getValue().split('-')[0]
                              : cell.column.columnDef.accessorKey === 'description'
                                ? cell.getValue()?.length > 70
                                  ? `${cell.getValue().slice(0, 70)}...`
                                  : cell.getValue()
                                : cell.getValue()?.length > 20
                                  ? `${cell.getValue().slice(0, 20)}...`
                                  : cell.getValue()
                            : flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </CustomTooltip>
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

export default function CoursesTable({ coursesData, bundlesData, getAllCourses, getAllBundles, isLoading }) {
  const [activeTab, setActiveTab] = useState('Courses');
  const [creationCB, setCreationCB] = useState('');
  const [selectedRowsCount, setSelectedRowsCount] = useState({});
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [createCourseForm, setCreateCourseForm] = useState({
    title: '',
    description: '',
    priceperseat: '',
    duration: '',
    category: '',
  });
  const { mutateAsync: createCourse, isPending, isSuccess, error } = useCreateCourse();

  const handleCreateCourse = async () => {
    try {
      if (!createCourseForm.title.trim()) {
        openSnackbar({
          open: true,
          message: 'Course title is required.',
          variant: 'alert',
          alert: { color: 'error' },
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        return;
      }

      setLoading(true);

      const payload = {
        title: createCourseForm.title.trim(),
        description: createCourseForm.description.trim() || null,
        duration: createCourseForm.duration?.trim() || null,
        category: createCourseForm.category?.trim() || null,
      };
      console.log('Creating course with payload:', payload);

      const response = await createCourse(payload);

      if (response?.success) {
        openSnackbar({
          open: true,
          message: 'New Course created successfully!',
          variant: 'alert',
          alert: { color: 'success' },
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          close: true,
        });

        getAllCourses?.(); // refresh list
        setCreateCourseForm({
          title: '',
          description: '',
          duration: '',
          category: '',
        });
        handleCloseModal();
      }
    } catch (error) {
      // Extract meaningful message from API error
      let errorMessage = 'Failed to create course. Please try again.';

      if (error?.response?.data?.error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Special case for duplicate title (409 Conflict)
      if (errorMessage.toLowerCase().includes('already exists') ||
        error?.response?.status === 409) {
        errorMessage = 'A course with this title already exists.';
      }

      openSnackbar({
        open: true,
        message: errorMessage,
        variant: 'alert',
        alert: { color: 'error' },
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        close: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourseBundle = async (data) => {
    try {
      setLoading(true);
      await axiosInstance.post('/courses/addbundle', {
        bundleName: data.title,
        bundleDescription: data.description,
        seatprice: data.priceperseat,
        courseIds: data.selectedCourses,
        category_id: data.category,
        campaignType: data.campaignType
      });

      openSnackbar({
        open: true,
        message: 'Course bundle created successfully.',
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

      setSelectedCourseIds([]);
      setSelectedRowsCount(0);
      handleCloseModal();
      getAllBundles();
    } catch (error) {
      console.error('Error creating course bundle:', error);
      openSnackbar({
        open: true,
        message: 'Error creating course bundle:',
        variant: 'alert',
        alert: {
          color: 'error'
        },
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        },
        close: true
      });
    } finally {
      setLoading(false);
    }
  };

  let isAdmin = true;
  const coursesColumns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: 'id',
        header: 'Id',
        size: 80,
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
              maxWidth: '80px'
            }}
          >
            {cell.getValue()?.slice(0, 15) || ''}
          </Stack>
        )
      },
      {
        accessorKey: 'title',
        header: 'Title',
        size: 80,
        Cell: ({ cell }) => (
          <Stack
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '80px'
            }}
          >
            {cell.getValue()?.slice(0, 15) || ''}
          </Stack>
        )
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 250,
        Cell: ({ cell }) => (
          <Stack
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '250px'
            }}
            title={cell.getValue()}
          >
            {cell.getValue()?.slice(0, 15) || ''}
          </Stack>
        )
      },
      {
        header: 'Details',
        size: 100,
        cell: ({ row }) => (
          <Stack>
            <Link to={`/dashboard/course_details?id=${row.original.id} ${isAdmin ? '&admin=true' : ''}`}>
              <Button>
                <Eye size={20} />
              </Button>
            </Link>
          </Stack>
        )
      }
    ];
    return baseColumns;
  }, []);

  const bundlesColumns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 80,
        muiTableHeadCellProps: { sx: { paddingLeft: '18px' } },
        Cell: ({ cell }) => (
          <Stack
            sx={{
              paddingLeft: '18px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '80px'
            }}
          >
            {cell.getValue()?.slice(0, 15) || ''}
          </Stack>
        )
      },
      {
        accessorKey: 'title',
        header: 'Title',
        size: 80,
        Cell: ({ cell }) => (
          <Stack
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '80px'
            }}
          >
            {cell.getValue()?.slice(0, 15) || ''}
          </Stack>
        )
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 250,
        Cell: ({ cell }) => (
          <Stack
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '250px'
            }}
            title={cell.getValue()}
          >
            {cell.getValue()?.slice(0, 15) || ''}
          </Stack>
        )
      },
      {
        accessorKey: 'category',
        header: 'Category',
        size: 100,
        Cell: ({ cell }) => (
          <Stack
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100px'
            }}
          >
            {cell.getValue()?.slice(0, 15) || ''}
          </Stack>
        )
      },
      {
        accessorKey: 'seatPrice',
        header: '$ / Seat',
        size: 100,
        Cell: ({ cell }) => (
          <Stack
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100px'
            }}
          >
            {'$' + cell.getValue()?.slice(0, 15) || ''}
          </Stack>
        )
      },
      {
        header: 'Details',
        size: 100,
        cell: ({ row }) => (
          <Stack>
            <Link to={`/dashboard/view_bundles?id=${row.original.id}&admin=true`}>
              <Button>
                <Eye size={20} />
              </Button>
            </Link>
          </Stack>
        )
      }
    ];
    return baseColumns;
  }, []);

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const data = activeTab === 'Courses' ? coursesData : bundlesData;
  const columns = activeTab === 'Courses' ? coursesColumns : bundlesColumns;
  const groups = [
    { label: 'Courses', value: 'Courses', icon: <FaBook /> },
    { label: 'Bundles', value: 'Bundles', icon: <FaBox /> }
  ];

  const [openModal, setOpenModal] = useState(false);
  const [openBundleModal, setOpenBundleModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [enableRowSelection, disableRowSelection] = useState(false);

  const handleDropdownChange = (event) => {
    setAnchorEl(null);
    const value = event.target.value;
    setCreationCB(value);
    if (value === 10) {
      disableRowSelection(false);
      setModalType('course');
      setOpenModal(true);
    } else if (value === 20) {
      setModalType('bundle');
      setOpenBundleModal(true);
    }
    setCreationCB('');
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleCloseBundleModal = () => {
    setOpenBundleModal(false);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');

  const handleClose = () => {
    setAnchorEl(null);
  };

  const buttonRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(0);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
  };
  const handleChange = (field) => (e) => {
    setCreateCourseForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };
  return (
    <>
      <MainCard content={false}>
        <Grid container direction={'row'} spacing={2} sx={{ pb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid item xs={6}>
            <Box sx={{ p: 1.5, pb: 0, width: '100%' }}>
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
                      '& .Mui-selected .MuiTab-iconWrapper': {
                        color: 'green'
                      },
                      '& .MuiTab-iconWrapper': {
                        color: (theme) => (theme.palette.mode === 'light' ? 'gray' : 'green')
                      }
                    }}
                  />
                ))}
              </Tabs>
            </Box>
          </Grid>
          <Grid
            item
            sx={{
              marginRight: 2,
              marginTop: '10px',
              display: 'flex',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Button ref={buttonRef} variant="contained" color="primary" startIcon={<AddCircle />} onClick={handleClick}>
              {selectedOption || 'Create Resource'}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              onChange={handleDropdownChange}
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
                  width: buttonWidth || 'auto',
                  marginTop: '8px'
                }
              }}
            >
              <MenuItem value={10} onClick={handleDropdownChange}>
                Create Course
              </MenuItem>
              <MenuItem value={20} onClick={handleDropdownChange}>
                Create Bundle
              </MenuItem>
            </Menu>
          </Grid>

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
                setSelectedCourseIds,
                isLoading
              }}
            />
          </Grid>
        </Grid>
      </MainCard>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={openModal && modalType === 'course'}
        onClose={handleCloseModal}
      >
        <DialogTitle>Create Course</DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Fill in the details below to create a new training course.
          </DialogContentText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Title */}
            <div>
              <InputLabel htmlFor="title" sx={{ mb: 0.5 }}>
                Title *
              </InputLabel>
              <TextField
                required
                id="title"
                value={createCourseForm.title}
                onChange={handleChange('title')}
                fullWidth
                placeholder="e.g., Phishing Awareness 101"
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <InputLabel htmlFor="description" sx={{ mb: 0.5 }}>
                Description
              </InputLabel>
              <TextField
                id="description"
                value={createCourseForm.description}
                onChange={handleChange('description')}
                fullWidth
                rows={4}
                placeholder="Brief overview of what learners will gain..."
                disabled={loading}
              />
            </div>
            <div>
              <InputLabel sx={{ mb: 0.5 }}>Duration</InputLabel>
              <TextField
                fullWidth
                value={createCourseForm.duration || ''}
                onChange={handleChange('duration')}
                placeholder="e.g. 21 days"
                helperText="Free text – exactly how you want it displayed"
                disabled={loading}
              />
            </div>

            {/* Category */}
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                value={createCourseForm.category}
                label="Category"
                onChange={handleChange('category')}
                disabled={loading}
              >
                <MenuItem value="">
                  <em>Not specified</em>
                </MenuItem>
                {categoryOptions.slice(1).map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

          </Box>
        </DialogContent>

        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button
            color="inherit"
            onClick={handleCloseModal}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateCourse}
            disabled={loading || !createCourseForm.title.trim()}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Course'}
          </Button>
        </DialogActions>
      </Dialog>
      <CreateBundleDialog
        open={openBundleModal}
        onClose={handleCloseBundleModal}
        coursesData={coursesData}
        handleCreateCourseBundle={handleCreateCourseBundle}
      />
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
  setActiveTab: PropTypes.func,
  isLoading: PropTypes.bool
};

LinearWithLabel.propTypes = { value: PropTypes.any, others: PropTypes.any };