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
import { Add, AddCircle, Edit, Eye, Trash } from 'iconsax-react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField
} from '@mui/material';
import IconButton from 'components/@extended/IconButton';

import { FaEllipsis } from 'react-icons/fa6';
import { FaBook, FaBox, FaChalkboardTeacher, FaChartBar, FaPlus, FaUser } from 'react-icons/fa';
import { openSnackbar } from 'api/snackbar';
import axiosInstance from 'utils/axiosConfig';
import Search from 'layout/Dashboard/Header/HeaderContent/Search';
import { GoPhishAccountAPIKey, GoPhishPublicURL } from 'utils/constants';
import { useAuth } from 'contexts/AuthContext';

//mui icons
import { Message, DirectInbox, Send, Shield } from 'iconsax-react';
import CustomTooltip from 'components/@extended/Tooltip';
import CampaignAnalyticsDialog from './CampaignAnalyticsDialog';
import TableSkeleton from 'pages/dashboard/components/SkeltonReportsTable';

export const fuzzyFilter = (row, columnId, value) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  return itemRank.passed; // Return a boolean indicating match success
};
// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ loading, data, columns, activeTab, setActiveTab }) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', height: '30vh' }}>
        <TableSkeleton rows={5} columns={7} />
      </Box>
    );
  }
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '10vh' }}>
        <Typography>No data available</Typography>
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
    state: { columnFilters, sorting, rowSelection, globalFilter },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter
  });
  let headers = [];
  columns.map(
    (columns) =>
      // @ts-ignore
      columns.accessorKey &&
      headers.push({
        label: typeof columns.header === 'string' ? columns.header : '#',
        // @ts-ignore
        key: columns.accessorKey
      })
  );

  return (
    <>
      <ScrollX>
        <Stack>
          <RowSelection selected={Object.keys(rowSelection)?.length} />
          <TableContainer>
            <Table sx={{ minWidth: 750, tableLayout: 'fixed' }}>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell key={header.id} {...header.column.columnDef.meta} onClick={header.column.getToggleSortingHandler()}>
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
                          // Slice text and show in Tooltip
                          <CustomTooltip title={cell.getValue()} placement="top" arrow color="primary">
                            <Box
                              sx={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '150px'
                              }}
                            >
                              {cell.getValue()?.length > 15 ? `${cell.getValue().slice(0, 15)}...` : cell.getValue()}
                            </Box>
                          </CustomTooltip>
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
                initialPageSize: 5,
                getRowCount: table.getRowCount
              }}
            />
          </Box>
        </Stack>
      </ScrollX>
    </>
  );
}

// ==============================|| INVOICE - LIST ||============================== //

export default function ReportingTable({
  AllGroups,
  groupName,
  setGroupName,
  SelectedGroupId,
  setSelectedGroupId,
  mode,
  groupLeadersGroups,
  groupNames,
  loadingGroups
}) {
  const [activeTab, setActiveTab] = useState('Campaign Report');
  const [creationCB, setCreationCB] = useState('');
  const [selectedRowsCount, setSelectedRowsCount] = useState({});
  const [data, setData] = useState([]);
  const { currentUser } = useAuth();
  const email = currentUser.email;
  const [usersData, setUsersData] = useState([]);
  const [filteredUsersData, setFilteredUsersData] = useState([]);

  //stats dilog
  const [openAnalytics, setopenAnalytics] = useState(false);
  const [CampaignAnalyticsStats, setCampaignAnalyticsStats] = useState(null);
  const handleOpenAnalytics = (stats) => {
    setopenAnalytics(true);
    setCampaignAnalyticsStats(stats);
  };

  const handleCloseAnalytics = () => {
    setopenAnalytics(false);
    setCampaignAnalyticsStats(null);
  };

  const [modulesData, setModulesData] = useState([]);
  const [filteredModulesData, setFilteredModulesData] = useState([]);
  //REPORTING PAGE
  const campaignsColumns = useMemo(() => {
    return [
      {
        accessorKey: 'name',
        header: 'Name',
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
            {cell.getValue()}
          </Stack>
        )
      },
      {
        accessorKey: 'created_date',
        header: 'Date',
        size: 250,
        Cell: ({ cell }) => <Stack sx={{ whiteSpace: 'nowrap' }}>{cell.getValue()}</Stack>
      },
      {
        accessorKey: 'stats.sent',
        header: (
          <CustomTooltip title="Mail Sent" placement="top" arrow color="primary">
            <Message size={24} color="green" />
          </CustomTooltip>
        ),
        size: 50,
        Cell: ({ cell }) => <>{cell.row.original.stats?.sent || 0}</> // Use optional chaining and fallback to 0 if undefined
      },
      {
        accessorKey: 'stats.opened',
        header: (
          <CustomTooltip title="Email Opened" placement="top" arrow color="primary">
            <DirectInbox size={24} color="yellow" />
          </CustomTooltip>
        ),
        size: 50,
        Cell: ({ cell }) => <>{cell.row.original.stats?.opened || 0}</> // Use optional chaining and fallback to 0 if undefined
      },
      {
        accessorKey: 'stats.clicked',
        header: (
          <CustomTooltip title="Clicked Ads" placement="top" arrow color="primary">
            <Send size={24} color="orange" />
          </CustomTooltip>
        ),
        size: 50,
        Cell: ({ cell }) => <>{cell.row.original.stats?.clicked || 0}</> // Use optional chaining and fallback to 0 if undefined
      },
      {
        accessorKey: 'stats.error',
        header: (
          <CustomTooltip title="Errors" placement="top" arrow color="primary">
            <Shield size={24} color="#8B0020" />
          </CustomTooltip>
        ),
        size: 50,
        Cell: ({ cell }) => <>{cell.row.original.stats?.error || 0}</> // Use optional chaining and fallback to 0 if undefined
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 150, // Keep Status column width
        Cell: ({ cell }) => (
          <Stack
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '150px'
            }}
            title={cell.getValue()}
          >
            {cell.getValue()}
          </Stack>
        )
      },
      {
        accessorKey: 'report',
        header: 'Report',
        size: 150,
        cell: ({ cell }) => (
          <Stack direction="row" alignItems="center" spacing={1}>
            <CustomTooltip title="View" placement="top" arrow color="primary">
              <IconButton
                color="secondary"
                onClick={() => handleOpenAnalytics(cell.row.original.stats)} // Access stats from the row data
              >
                <Eye size={20} />
              </IconButton>
            </CustomTooltip>
          </Stack>
        )
      }
    ];
  }, []);

  const userReportsColumns = useMemo(() => {
    return [
      {
        accessorKey: 'firstName',
        header: 'First Name',
        size: 150,
        Cell: ({ cell }) => (
          <Stack
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '150px'
            }}
            title={cell.getValue()}
          >
            {cell.getValue()}
          </Stack>
        )
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        size: 150,
        Cell: ({ cell }) => (
          <Stack
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '150px'
            }}
            title={cell.getValue()}
          >
            {cell.getValue()}
          </Stack>
        )
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 200,
        Cell: ({ cell }) => (
          <Stack
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '200px'
            }}
            title={cell.getValue()}
          >
            {cell.getValue()}
          </Stack>
        )
      },
      {
        accessorKey: 'modulesEnrolled',
        header: 'Modules Enrolled',
        size: 150,
        Cell: ({ cell }) => <>{cell.getValue()}</>
      },
      {
        accessorKey: 'notStarted',
        header: 'Not Started',
        size: 150,
        Cell: ({ cell }) => <>{cell.getValue()}</>
      },
      {
        accessorKey: 'inProgress',
        header: 'In Progress',
        size: 150,
        Cell: ({ cell }) => <>{cell.getValue()}</>
      },
      {
        accessorKey: 'completed',
        header: 'Completed',
        size: 150,
        Cell: ({ cell }) => <>{cell.getValue()}</>
      }
    ];
  }, []);
  const moduleReportColumns = useMemo(() => {
    return [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 100,
        Cell: ({ cell }) => (
          <Stack
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100px'
            }}
            title={cell.getValue()}
          >
            {cell.getValue()}
          </Stack>
        )
      },
      {
        accessorKey: 'module',
        header: 'Module',
        size: 200,
        Cell: ({ cell }) => (
          <Stack
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '200px'
            }}
            title={cell.getValue()}
          >
            {cell.getValue()}
          </Stack>
        )
      },
      {
        accessorKey: 'enrolled',
        header: 'Enrolled',
        size: 150,
        Cell: ({ cell }) => <>{cell.getValue()}</>
      },
      {
        accessorKey: 'notStarted',
        header: 'Not Started',
        size: 150,
        Cell: ({ cell }) => <>{cell.getValue()}</>
      },
      {
        accessorKey: 'inProgress',
        header: 'In Progress',
        size: 150,
        Cell: ({ cell }) => <>{cell.getValue()}</>
      },
      {
        accessorKey: 'completed',
        header: 'Completed',
        size: 150,
        Cell: ({ cell }) => <>{cell.getValue()}</>
      },
      {
        accessorKey: 'completionPercentage',
        header: '% Complete',
        size: 150,
        Cell: ({ cell }) => <>{cell.getValue()}</>
      }
    ];
  }, []);

  //campaignsData
  const [campaignData, setCampaignData] = useState([]);

  const getCampaignDataSummaryForGroupLeader = async (name) => {
    try {
      const response = await fetch(`${GoPhishPublicURL}/api/campaigns/summary/?api_key=${GoPhishAccountAPIKey}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Create a regular expression from groupNames array to match any of the group names
      const groupsPattern = new RegExp(groupNames.join('|'), 'i');

      // Filter campaigns where the group names are included in the campaign name
      const userCampaigns = data.campaigns.filter((campaign) => {
        return groupsPattern.test(campaign.name);
      });

      let filteredCampaigns = userCampaigns;

      // If 'name' is provided, further filter based on it
      if (name) {
        const namePattern = new RegExp(`groups: ${name}`, 'i');
        filteredCampaigns = userCampaigns.filter((campaign) => namePattern.test(campaign.name));
      }

      // Clean up the campaign name by removing email and groups info
      filteredCampaigns.forEach((campaign) => {
        const emailPattern = /, email: [^,]+/;
        const groupsPattern = /, groups: .*/;

        // Remove email and groups information from the campaign name
        campaign.name = campaign.name.replace(emailPattern, '').replace(groupsPattern, '').trim();
      });

      // Set the filtered campaign data
      setCampaignData(filteredCampaigns);
      return filteredCampaigns;
    } catch (error) {
      console.error('Error fetching campaign data summary:', error);
    }
  };

  //Users data for groupLeader
  const transformUserDataForGroupLeader = (userStats) => {
    return userStats.map((user) => ({
      firstName: user.firstname,
      lastName: user.lastname,
      email: user.email,
      modulesEnrolled: user.enrolled_courses,
      notStarted: user.not_started_courses,
      inProgress: user.in_progress_courses,
      group_id: user.group_id,
      group_name: user.group_name,
      complete: user.completed_courses
    }));
  };

  const getUsersDataForGroupLeader = async () => {
    try {
      const resp = await axiosInstance.post(`/users_report//all-by-group-leader`, {
        currentUser
      });
      const transformedUsersData = resp.data.data && transformUserDataForGroupLeader(resp.data.data?.all_group_users_stats);
      setUsersData(transformedUsersData);
      setFilteredUsersData(transformedUsersData);
      return transformedUsersData;
    } catch (error) {
      console.log(error.message);
    }
  };

  const transformModuleDataForGroupLeader = (modulesStats) => {
    return modulesStats.map((module) => ({
      id: module.course_id,
      module: module.course_title,
      enrolled: module.enrolled,
      notStarted: module.not_started,
      inProgress: module.in_progress,
      completed: module.completed,
      group_id: module.group_id,
      group_name: module.group_name,
      averageChallengeScore: 0,
      percentageComplete: module.avg_completion_percentage
    }));
  };

  const getModulesDataForGroupLeader = async () => {
    try {
      const resp = await axiosInstance.post(`/modules_report/all-by-group-leader`, {
        currentUser
      });

      const transformedData = resp.data.data?.modulesStats && transformModuleDataForGroupLeader(resp.data.data?.modulesStats);
      setModulesData(transformedData);
      setFilteredModulesData(transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error fetching module data:', error.message);
    }
  };

  const [trainingSubTab, setTrainingSubTab] = useState('Module Report');
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const columns =
    activeTab === 'Campaign Report' ? campaignsColumns : trainingSubTab === 'Module Report' ? moduleReportColumns : userReportsColumns;
  const groups = [
    { label: 'Campaign Report', value: 'Campaign Report', icon: <FaChartBar /> },
    { label: 'Training Overview', value: 'Training Overview', icon: <FaChalkboardTeacher /> }
  ];

  const trainingOverviewTabs = [
    { label: 'Module Report', value: 'Module Report' },
    { label: 'User Reports', value: 'User Reports' }
  ];

  const [open1, setOpen1] = useState(false);
  const [contSearchQuery, setContSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const handleContSearchChange = (event) => {
    setContSearchQuery(event.target.value.toLowerCase());
  };
  const filteredOptions = AllGroups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  const handleChange = (event) => {
    const selectedName = event.target.value;
    const selectedGroup = AllGroups.find((group) => group.name === selectedName);

    if (selectedGroup) {
      setGroupName(selectedName);
      setSelectedGroupId(selectedGroup.id);
    }
  };

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchDataAndFilter = async () => {
      setLoading(true);

      try {
        // Wait until loadingGroups is false and groupName is available
        if (loadingGroups) {
          return; // Prevent API call if groupName is not ready or still loading
        }

        if (activeTab === 'Campaign Report') {
          let campaignData;
          // Fetch campaign data
          campaignData = groupName ? await getCampaignDataSummaryForGroupLeader(groupName) : await getCampaignDataSummaryForGroupLeader();
          setData(campaignData);
        } else if (activeTab === 'Training Overview') {
          if (trainingSubTab === 'Module Report') {
            const modulesData = await getModulesDataForGroupLeader();
            const filteredData = groupName ? modulesData.filter((module) => module.group_name === groupName) : modulesData;
            setData(filteredData);
          } else if (trainingSubTab === 'User Reports') {
            const usersData = await getUsersDataForGroupLeader();
            const filteredUsersData = groupName ? usersData.filter((user) => user.group_name === groupName) : usersData;
            setData(filteredUsersData);
          }
        } else {
          console.log('No matching condition for activeTab');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndFilter();
  }, [activeTab, trainingSubTab, groupName, loadingGroups]);

  return (
    <>
      <MainCard content={false}>
        <Grid
          container
          direction={matchDownSM ? 'column' : 'row'}
          spacing={2}
          sx={{ pb: 2, alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Grid item xs={6}>
            <Box sx={{ p: 1.5, pb: 0, width: '100%' }}>
              <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)} sx={{ borderColor: 'divider' }}>
                {groups.map((group, index) => (
                  <Tab key={index} label={group.label} icon={group.icon} iconPosition="start" value={group.value} />
                ))}
              </Tabs>
            </Box>
          </Grid>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mt: 4,
              mr: 2,
              width: '40%',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            {/* Sub Training Dropdown */}
            {activeTab === 'Training Overview' && (
              <FormControl sx={{ width: '50%' }}>
                <Select
                  value={trainingSubTab}
                  onChange={(e) => setTrainingSubTab(e.target.value)}
                  displayEmpty
                  renderValue={(selected) => (selected ? selected : 'Select SubTab')}
                >
                  {trainingOverviewTabs.map((tab) => (
                    <MenuItem key={tab.value} value={tab.value}>
                      {tab.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* First Dropdown: Select Group */}
            <FormControl
              sx={{
                width: '50%',
                marginLeft: 'auto'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Select
                  open={open1}
                  onOpen={() => setOpen1(true)}
                  onClose={() => setOpen1(false)}
                  labelId="group-select-label"
                  id="group-select"
                  value={groupName}
                  displayEmpty
                  onChange={handleChange}
                  renderValue={(selected) => (selected ? AllGroups.find((o) => o.name === selected)?.name : 'Select Group')}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        overflowY: 'auto',
                        width: '200px'
                      },
                      onClick: (e) => e.stopPropagation()
                    },
                    disableCloseOnSelect: true,
                    disableAutoFocusItem: true
                  }}
                  sx={{
                    width: '100%'
                  }}
                >
                  <Box
                    sx={{ p: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen1(true);
                    }}
                  >
                    <TextField
                      id="group-search-field"
                      variant="outlined"
                      fullWidth
                      placeholder="Search Group"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen1(true);
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Escape') {
                          setOpen1(false);
                        }
                      }}
                    />
                  </Box>
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <MenuItem
                        key={option.name}
                        value={option.name}
                        onClick={() => {
                          setGroupName(option.name);
                          setSelectedGroupId(option.id);
                          setOpen1(false);
                        }}
                      >
                        {option.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No results found</MenuItem>
                  )}
                </Select>
                {groupName && (
                  <IconButton
                    shape="rounded"
                    color="error"
                    onClick={() => {
                      setGroupName('');
                      setSearchQuery('');
                      setSelectedGroupId(null);
                    }}
                    sx={{ fontSize: '24px' }}
                  >
                    <Add style={{ transform: 'rotate(45deg)' }} />
                  </IconButton>
                )}
              </Box>
            </FormControl>
            <CSVExport
              {...{
                data: data || [],
                columns,
                filename: 'data-list.csv'
              }}
            />
          </Box>

          <Grid item xs={12}>
            <ReactTable
              {...{
                loading,
                data,
                columns,
                activeTab,
                setActiveTab,

                creationCB
              }}
            />
          </Grid>
        </Grid>
      </MainCard>
      <CampaignAnalyticsDialog open={openAnalytics} handleClose={handleCloseAnalytics} stats={CampaignAnalyticsStats} />{' '}
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
