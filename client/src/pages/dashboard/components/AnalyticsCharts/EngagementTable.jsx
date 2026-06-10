import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Paper from '@mui/material/Paper';

// third-party
import { flexRender, useReactTable, getCoreRowModel } from '@tanstack/react-table';

// project-imports
import MainCard from 'components/MainCard';
import { HeaderSort } from 'components/third-party/react-table';

// ==============================|| ENGAGEMENT TABLE ||============================== //

function ReactTable({ columns, data }) {
  const table = useReactTable({
    data,
    columns,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    debugTable: false
  });

  return (
    <MainCard
      title="Engagement Rate"
      content={false}
      divider={false}
    >
      <TableContainer component={Paper} sx={{ maxHeight: 320, overflowY: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableCell key={header.id} {...header.column.columnDef.meta}>
                      {header.isPlaceholder ? null : (
                        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                          <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                          {header.column.getCanSort() && <HeaderSort column={header.column} />}
                        </Stack>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No groups found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} hover>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array
};

// ==========================|| ENGAGEMENT TABLE ||========================== //
export const mockEngagementGroups = [
  {
    groupId: '0211a530-44ed-4fd8-ba80-0a53cf451675',
    groupName: 'OKILO',
    orgName: 'TEST12',
    order: 1,
    engagementScore: 32
  },
  {
    groupId: '5b14c1c9-9599-4a48-bdb4-faaa7d617d10',
    groupName: 'POILKU',
    orgName: 'TEST12',
    order: 2,
    engagementScore: 20
  },
  {
    groupId: '2cc96a77-f814-4061-b01a-5d31a1b8118f',
    groupName: 'CASSEY',
    orgName: 'TEST12',
    order: 3,
    engagementScore: 0
  },
  {
    groupId: 'f2f2fbd7-ccaf-4b74-a415-ee2cbb31608e',
    groupName: 'LOPIE',
    orgName: 'CONTRIBUTO COM',
    order: 4,
    engagementScore: 0
  },
  {
    groupId: 'a1d2c3e4-0001-4fd8-ba80-0a53cf451001',
    groupName: 'NEXORA',
    orgName: 'TEST12',
    order: 5,
    engagementScore: 45
  },
  {
    groupId: 'a1d2c3e4-0002-4fd8-ba80-0a53cf451002',
    groupName: 'VIREN',
    orgName: 'TEST12',
    order: 6,
    engagementScore: 12
  },
  {
    groupId: 'a1d2c3e4-0003-4fd8-ba80-0a53cf451003',
    groupName: 'KALTO',
    orgName: 'CONTRIBUTO COM',
    order: 7,
    engagementScore: 8
  },
  {
    groupId: 'a1d2c3e4-0004-4fd8-ba80-0a53cf451004',
    groupName: 'ZENTRA',
    orgName: 'CONTRIBUTO COM',
    order: 8,
    engagementScore: 0
  },
  {
    groupId: 'a1d2c3e4-0005-4fd8-ba80-0a53cf451005',
    groupName: 'POLYON',
    orgName: 'TEST12',
    order: 9,
    engagementScore: 27
  },
  {
    groupId: 'a1d2c3e4-0006-4fd8-ba80-0a53cf451006',
    groupName: 'ARKEN',
    orgName: 'TEST12',
    order: 10,
    engagementScore: 18
  }
];
export default function EngagementTable({ groups = [], loading = false, groupFilter = null, onGroupFilterChange }) {
  const columns = useMemo(
    () => [
      {
        header: 'Group',
        accessorKey: 'groupName',
        cell: ({ row }) => {
          return (
            <Stack direction="row" sx={{ flexWrap: 'nowrap', gap: 2, alignItems: 'center' }}>
              <Typography variant="body1">{row.original.groupName}</Typography>
            </Stack>
          );
        }
      },
      {
        header: 'Organization',
        accessorKey: 'orgName',
        cell: ({ row }) => <Typography variant="body1">{row.original.orgName}</Typography>
      },
      {
        header: 'Order',
        accessorKey: 'order',
        cell: ({ row }) => <Typography variant="body1">{row.original.order}</Typography>
      }
    ],
    []
  );

  // Filter groups if groupFilter is provided
  const filteredGroups = useMemo(() => {
    if (!groupFilter) return groups;
    return groups.filter(g => g.groupId === groupFilter);
  }, [groups, groupFilter]);


  if (loading) {
    return (
      <MainCard title="Engagement Rate" content={false}>
        <Box sx={{ p: 2 }}>
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
        </Box>
      </MainCard>
    );
  }

  return <ReactTable columns={columns} data={filteredGroups} />;
}

EngagementTable.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.shape({
    groupId: PropTypes.string,
    groupName: PropTypes.string,
    orgName: PropTypes.string,
    order: PropTypes.number,
    engagementScore: PropTypes.number
  })),
  loading: PropTypes.bool,
  groupFilter: PropTypes.string,
  onGroupFilterChange: PropTypes.func
};
