import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';
import MainCard from 'components/MainCard';
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { Link } from 'react-router-dom';
import { AddCircle, Eye } from 'iconsax-react';
import { MdClose, MdCreate, MdLaunch } from 'react-icons/md';
import { FaCross, FaEnvelope } from 'react-icons/fa6';
import CustomTooltip from 'components/@extended/Tooltip';
import { FormControl } from '@mui/base';
import EmptyTable from '../EmptyTable';
import { formatDate } from 'utils/formateDate';
import { AiOutlineDelete } from 'react-icons/ai';

// table filter
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function EnhancedTableHead({ onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, headCells }) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells?.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : 'desc'} // Default to desc
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'desc'} // Default to desc
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box sx={visuallyHidden}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default function EnhancedTable({
  action,
  data,
  headCells,
  selectedRow = [],
  setSelectedRow = () => {},
  handleLaunchCampaign = () => {},
  allGroups = [],
  setAllGroups = () => {},
  handleSelectChange = () => {},
  handleDelete = () => {},
  handleView = () => {},
  isContributor,
  LaunchCampagin,
  loading,
  groupLeader,
  onRowClick
}) {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('id');
  const [page, setPage] = useState(0);
  const [dense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openModal, setOpenModal] = useState(false);
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event?.target.value, 10));
    setPage(0);
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const getComparator = (order, orderBy) => {
    return (a, b) => {
      const primaryOrder = order === 'desc' ? descendingComparator(a, b, orderBy) : -descendingComparator(a, b, orderBy);

      if (primaryOrder !== 0) return primaryOrder;
      return b.id - a.id; // Always sort by ID descending as tiebreaker
    };
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  };
  const getTruncatedText = (text) => {
    const maxLength = window.innerWidth < 768 ? 15 : 30; // Shorter truncation on small screens
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data?.length) : 0;
  const handleCloseModal = () => {
    setOpenModal(false);
  };
  return (
    <MainCard
      content={false}
      title={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h5">Campaigns Table</Typography>
          {!isContributor && !groupLeader && (
            <Button variant="contained" color="primary" startIcon={<AddCircle />} onClick={action}>
              {LaunchCampagin ? 'Create Campaign' : 'New Attack Simulation'}
            </Button>
          )}
        </Box>
      }
    >
      <TableContainer>
        <Table sx={{ minWidth: 750, tableLayout: 'fixed' }} aria-labelledby="tableTitle" size={dense ? 'small' : 'medium'}>
          <EnhancedTableHead
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            rowCount={data?.length}
            headCells={headCells}
          />
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : data?.length > 0 ? (
              stableSort(data, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  let targetGroups = [];
                  if (row?.target_groups) {
                    try {
                      targetGroups = typeof row.target_groups === 'string' ? JSON.parse(row.target_groups) : row.target_groups;
                    } catch (error) {
                      console.error('Error parsing target_groups:', error);
                    }
                  }

                  const targetGroupsDisplay = targetGroups.join(', ');

                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={row.id}
                      onClick={() => LaunchCampagin && onRowClick?.(row.id)} // Add this
                      sx={{
                        cursor: LaunchCampagin ? 'pointer' : 'default',
                        '&:hover': {
                          backgroundColor: LaunchCampagin ? 'action.hover' : 'inherit'
                        }
                      }}
                    >
                      {headCells.map((headCell) => (
                        <TableCell key={headCell.id} align={headCell.numeric ? 'right' : 'left'}>
                          {headCell.id === 'actions' ? (
                            <Stack direction="row" spacing={1}>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(row);
                                }}
                                color="error"
                              >
                                <AiOutlineDelete size={20} />
                              </Button>
                            </Stack>
                          ) : headCell.id === 'launch_date' || headCell.id === 'sendbydate' ? (
                            formatDate(row[headCell.id])
                          ) : headCell.id === 'target_groups' ? (
                            targetGroupsDisplay
                          ) : headCell.id === 'id' && typeof row[headCell.id] === 'string' ? (
                            <CustomTooltip title={row[headCell.id]} arrow color="primary" placement="top">
                              <span>{row[headCell.id].split('-')[0]}</span>
                            </CustomTooltip>
                          ) : typeof row[headCell.id] === 'string' ? (
                            <CustomTooltip title={row[headCell.id]} arrow color="primary" placement="top">
                              <span>{getTruncatedText(row[headCell.id])}</span>
                            </CustomTooltip>
                          ) : (
                            row[headCell.id]
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
            ) : (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center">
                  <EmptyTable msg="No Data" />
                </TableCell>
              </TableRow>
            )}
            {emptyRows > 0 && data?.length > 0 && (
              <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                <TableCell colSpan={headCells.length} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider />
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data?.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </MainCard>
  );
}

EnhancedTableHead.propTypes = {
  onSelectAllClick: PropTypes.any,
  order: PropTypes.any,
  orderBy: PropTypes.any,
  numSelected: PropTypes.any,
  rowCount: PropTypes.any,
  onRequestSort: PropTypes.any
};
