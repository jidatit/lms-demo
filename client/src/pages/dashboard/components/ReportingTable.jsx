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
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Modal,
  Popover,
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
import TableSkeleton from './SkeltonReportsTable';
//mui icons
import { Message, DirectInbox, Send, Shield } from 'iconsax-react';
import CustomTooltip from 'components/@extended/Tooltip';
import CampaignAnalyticsDialog from './CampaignAnalyticsDialog';
import CompanyGroupFilter from 'components/CompanyGroupFilter';

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
                                maxWidth: '150px' // Adjust the width as per the column size
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
                getRowCount: table.getRowCount // Add this to get the total number of rows
              }}
            />
          </Box>
        </Stack>
      </ScrollX>
    </>
  );
}

// ==============================|| INVOICE - LIST ||============================== //

export default function ReportingTable({ groupName, setGroupName, SelectedGroupId, setSelectedGroupId, mode }) {
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
  const getCampaignDataSummary = async (groupName) => {
    try {
      const response = await fetch(`${GoPhishPublicURL}/api/campaigns/summary/?api_key=${GoPhishAccountAPIKey}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // // Filter campaigns to include only those matching the group name and containing any email
      // const userCampaigns = data.campaigns.map((campaign) => {
      //   // Regex patterns to match email and groups in the campaign name
      //   const emailPattern = /, email: [^,]+/;
      //   const groupsPattern = /, groups: .*/;

      //   // Clean campaign name by removing both the email and groups part
      //   const cleanedName = campaign.name
      //     .replace(emailPattern, "") // Remove the email part
      //     .replace(groupsPattern, "") // Remove the groups part
      //     .trim();

      //   // Return a new object with the cleaned name, preserving other properties
      //   return {
      //     ...campaign,
      //     name: cleanedName,
      //   };
      // });

      let filteredCampaigns = data.campaigns;
      if (groupName) {
        const groupsPattern = new RegExp(`groups: ${groupName}`);
        filteredCampaigns = data.campaigns.filter((campaign) => groupsPattern.test(campaign.name));
      }

      filteredCampaigns.forEach((campaign) => {
        // Remove email and groups from the campaign name
        const emailPattern = /, email: [^,]+/;
        const groupsPattern = /, groups: .*/;

        campaign.name = campaign.name.replace(emailPattern, '').replace(groupsPattern, '').trim();
      });

      setCampaignData(filteredCampaigns);
      return filteredCampaigns;
    } catch (error) {
      console.error('Error fetching campaign data summary:', error);
    }
  };
  const getCampaignDataSummaryForContributor = async (groupName) => {
    try {
      const response = await fetch(`${GoPhishPublicURL}/api/campaigns/summary/?api_key=${GoPhishAccountAPIKey}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      // const userEmail = currentUser.email;

      const userCampaigns = data.campaigns.filter((campaign) => campaign.name.includes(`email: ${email}`));

      let filteredCampaigns = userCampaigns;
      if (groupName) {
        const groupsPattern = new RegExp(`groups: ${groupName}`);
        filteredCampaigns = data.campaigns.filter((campaign) => groupsPattern.test(campaign.name));
      }

      filteredCampaigns.forEach((campaign) => {
        // Remove email and groups from the campaign name
        const emailPattern = new RegExp(`, email: ${email}`);
        const groupsPattern = /, groups: .*/;

        campaign.name = campaign.name.replace(emailPattern, '').replace(groupsPattern, '').trim();
      });
      const inProgressCount = filteredCampaigns.filter((campaign) => campaign.status === 'In progress').length;

      setCampaignData(filteredCampaigns);
      return filteredCampaigns;
    } catch (error) {
      console.error('Error fetching campaign data summary:', error);
    }
  };

  //UsersData
  const transformUserData = (userStats) => {
    return userStats.map((user) => ({
      firstName: user.firstname,
      lastName: user.lastname,
      email: user.email,
      modulesEnrolled: user.enrolled_courses,
      notStarted: user.not_started_courses,
      inProgress: user.in_progress_courses,
      group_name: user.group_name,
      complete: user.completed_courses
    }));
  };
  const getUsersData = async () => {
    try {
      const resp = await axiosInstance.post(`/users_report/all`, {
        email
      });
      const transformedUsersData = resp.data.data && transformUserData(resp.data.data?.all_group_users_stats);
      setUsersData(transformedUsersData);
      setFilteredUsersData(transformedUsersData);
      setData(transformedUsersData);
      return transformedUsersData;
    } catch (error) {
      console.log(error.message);
    } finally {
    }
  };

  //Modules data
  const transformModuleData = (modulesStats) => {
    return modulesStats.map((module) => ({
      id: module.course_id,
      module: module.course_title,
      enrolled: module.enrolled,
      notStarted: module.not_started,
      inProgress: module.in_progress,
      completed: module.completed,
      group_name: module.group_name,
      averageChallengeScore: 0,
      percentageComplete: module.avg_completion_percentage
    }));
  };
  const getModulesData = async () => {
    try {
      const resp = await axiosInstance.post(`/modules_report/all`, {
        email
      });

      const transformedData = resp.data.data?.modulesStats && transformModuleData(resp.data.data?.modulesStats);

      setModulesData(transformedData);
      setFilteredModulesData(transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error fetching module data:', error.message);
    } finally {
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
  // const filteredOptions = AllGroups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  const handleChange = (groupId, groupName) => {
    console.log('group', groupName, groupId);
    // const selectedName = event.target.value;

    setGroupName(groupName);
    setSelectedGroupId(groupId); // Set the selected group ID
    // getCampaignDataSummary(selectedName);
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'Campaign Report') {
          let campaignData;
          if (mode === 'contributor') {
            campaignData = groupName ? await getCampaignDataSummaryForContributor(groupName) : await getCampaignDataSummaryForContributor();
          } else {
            campaignData = groupName ? await getCampaignDataSummary(groupName) : await getCampaignDataSummary();
          }

          setData(campaignData);
        } else if (activeTab === 'Training Overview') {
          if (trainingSubTab === 'Module Report') {
            const modulesData = await getModulesData();
            const filteredData = groupName ? modulesData.filter((module) => module.group_name === groupName) : modulesData;
            setData(filteredData);
          } else if (trainingSubTab === 'User Reports') {
            const usersData = await getUsersData();
            const filteredUsersData = groupName ? usersData.filter((module) => module.group_name === groupName) : usersData;

            setData(filteredUsersData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, trainingSubTab]);

  useEffect(() => {
    const filterData = async () => {
      if (activeTab === 'Training Overview') {
        if (trainingSubTab === 'Module Report') {
          const filteredData = groupName ? modulesData.filter((module) => module.group_name === groupName) : modulesData;
          setData(filteredData);
        } else if (trainingSubTab === 'User Reports') {
          const filteredUsersData = groupName ? usersData.filter((module) => module.group_name === groupName) : usersData;

          setData(filteredUsersData);
        }
      }
      if (activeTab === 'Campaign Report') {
        let campaignData;
        if (mode === 'contributor') {
          campaignData = groupName ? await getCampaignDataSummaryForContributor(groupName) : await getCampaignDataSummaryForContributor();
        } else {
          campaignData = groupName ? await getCampaignDataSummary(groupName) : await getCampaignDataSummary();
        }
        // const campaignData = await getCampaignDataSummary(groupName);

        setData(campaignData);
      }
    };
    filterData();
  }, [groupName]);

  const [anchorEl, setAnchorEl] = useState(null);

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
                  <Tab
                    key={index}
                    label={group.label}
                    icon={group.icon}
                    iconPosition="start" // Positions the icon before the label
                    value={group.value}
                  />
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
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}
          >
            {/* Sub Training Dropdown */}
            {activeTab === 'Training Overview' && (
              <Box>
                <Button
                  variant="outlined"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{
                    minWidth: 100,
                    textTransform: 'none',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  {trainingSubTab ? trainingSubTab : 'Select SubTab'}
                </Button>
                <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
                  <List sx={{ maxHeight: 200, minWidth: 150, overflow: 'auto' }}>
                    {trainingOverviewTabs.map((tab) => (
                      <ListItem
                        key={tab.value}
                        button
                        onClick={() => {
                          setTrainingSubTab(tab.value);
                          setAnchorEl(null);
                        }}
                      >
                        <ListItemText primary={tab.label} />
                      </ListItem>
                    ))}
                  </List>
                </Popover>
              </Box>
            )}

            <CompanyGroupFilter
              groupName={groupName}
              setGroupName={setGroupName}
              selectedGroupId={SelectedGroupId}
              setSelectedGroupId={setSelectedGroupId}
              // getCampaignDataSummary={getCampaignDataSummary}
              handleChange={handleChange}
            />

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
