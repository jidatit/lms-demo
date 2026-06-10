import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  CSVExport,
  DebouncedInput,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';
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
import { Trash, Edit, Eye } from 'iconsax-react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';

export const fuzzyFilter = (row, columnId, value) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  return itemRank.passed;
};

function ReactTable({ data, columns, activeTab, setActiveTab }) {
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
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

export default function GroupInfo({ groupLeaders, subscribers }) {
  const [activeTab, setActiveTab] = useState('Group Leader');
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const groupLeadersColumns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 100,
        cell: ({ getValue }) => {
          const fullId = getValue();
          const shortId = fullId?.split('-')[0] || fullId;
          return (
            <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }} title={fullId}>
              {shortId}
            </Stack>
          );
        }
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        size: 150,
        cell: ({ getValue }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{getValue()}</Stack>
        )
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        size: 150,
        cell: ({ getValue }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{getValue()}</Stack>
        )
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 250,
        cell: ({ getValue }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }} title={getValue()}>
            {getValue()}
          </Stack>
        )
      }
      //   {
      //     header: 'Actions',
      //     cell: ({ row }) => (
      //       <Stack direction="row" alignItems="center" spacing={1}>
      //         <Tooltip title="Delete">
      //           <IconButton color="error" onClick={() => handleDeleteClick(row)}>
      //             <Trash size={20} />
      //           </IconButton>
      //         </Tooltip>
      //         <Tooltip title="Edit">
      //           <IconButton color="primary" onClick={() => handleEditClick(row.original)}>
      //             <Edit size={20} />
      //           </IconButton>
      //         </Tooltip>
      //       </Stack>
      //     )
      //   }
    ],
    []
  );

  const subscribersColumns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 100,
        cell: ({ getValue }) => {
          const fullId = getValue();
          const shortId = fullId?.split('-')[0] || fullId;
          return (
            <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }} title={fullId}>
              {shortId}
            </Stack>
          );
        }
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        size: 150,
        cell: ({ getValue }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{getValue()}</Stack>
        )
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        size: 150,
        cell: ({ getValue }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{getValue()}</Stack>
        )
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 250,
        cell: ({ getValue }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }} title={getValue()}>
            {getValue()}
          </Stack>
        )
      }
      //   {
      //     header: 'Actions',
      //     cell: ({ row }) => (
      //       <Stack direction="row" alignItems="center" spacing={1}>
      //         <Tooltip title="Delete">
      //           <IconButton color="error" onClick={() => handleDeleteClick(row)}>
      //             <Trash size={20} />
      //           </IconButton>
      //         </Tooltip>
      //         <Tooltip title="Edit">
      //           <IconButton color="primary" onClick={() => handleEditClick(row.original)}>
      //             <Edit size={20} />
      //           </IconButton>
      //         </Tooltip>
      //       </Stack>
      //     )
      //   }
    ],
    []
  );

  const data = activeTab === 'Group Leader' ? groupLeaders : subscribers;
  const columns = activeTab === 'Group Leader' ? groupLeadersColumns : subscribersColumns;

  return (
    <MainCard content={false}>
      <Grid
        container
        direction={matchDownSM ? 'column' : 'row'}
        spacing={2}
        sx={{ pb: 2, alignItems: 'center', justifyContent: 'space-between' }}
      >
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
            <Box sx={{ display: 'flex', flexGrow: 1, minWidth: '300px' }}>
              <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)} sx={{ borderColor: 'divider' }}>
                <Tab label="Managers" value="Group Leader" />
                <Tab label="Employee" value="Subscribers" />
              </Tabs>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <ReactTable {...{ data, columns, activeTab, setActiveTab }} />
        </Grid>
      </Grid>
    </MainCard>
  );
}

ReactTable.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  activeTab: PropTypes.string,
  setActiveTab: PropTypes.func
};

GroupInfo.propTypes = {
  groupLeaders: PropTypes.array,
  subscribers: PropTypes.array
};
