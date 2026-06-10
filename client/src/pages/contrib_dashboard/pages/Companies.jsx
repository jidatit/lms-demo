import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Skeleton from '@mui/material/Skeleton';

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
import { TablePagination } from 'components/third-party/react-table';

// assets
import { Edit, Key, Trash } from 'iconsax-react';
import { useCompanies, useDeleteCompany } from 'api/queries/companies';
import { toast } from 'utils/toast';
import CompanyModal from 'pages/dashboard/components/CompanyModal';
import UpdateCompanyModal from 'pages/dashboard/components/CompanyUpdateModal';
import IconButton from 'components/@extended/IconButton';
import CustomTooltip from 'components/@extended/Tooltip';
import { useAuth } from 'contexts/AuthContext';
import { fetchAllCompanies, fetchCompaniesByContributor } from 'pages/dashboard/utils/comapniesFunctions';
import AssignSeatsModal from 'components/AssignSeatsModal';

// import CompanyModal from './CompanyModal';
// import UpdateCompanyModal from './CompanyUpdateModal';

export const fuzzyFilter = (row, columnId, value) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  return itemRank.passed;
};

// ==============================|| REACT TABLE - COMPANIES ||============================== //

function CompaniesReactTable({ data, columns, loading }) {
  const [sorting, setSorting] = useState([{ id: columns[0].accessorKey, desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      globalFilter
    },
    onSortingChange: setSorting,
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

  // Skeleton rows for loading state
  const skeletonRows = Array.from({ length: 5 }, (_, index) => (
    <TableRow key={`skeleton-${index}`}>
      {columns.map((column, colIndex) => (
        <TableCell key={`skeleton-cell-${colIndex}`} style={{ width: column.size || 'auto' }}>
          <Skeleton variant="text" height={24} />
        </TableCell>
      ))}
    </TableRow>
  ));

  return (
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
                          <Box>
                            {loading ? (
                              <Skeleton variant="text" width={header.column.columnDef.size ? header.column.columnDef.size - 20 : 100} height={24} />
                            ) : (
                              flexRender(header.column.columnDef.header, header.getContext())
                            )}
                          </Box>
                        </Stack>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {loading ? (
                skeletonRows
              ) : (
                table.getRowModel().rows.map((row) => (
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
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <Box sx={{ p: 2 }}>
          {loading ? (
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Skeleton variant="text" width={120} height={32} />
              <Stack direction="row" spacing={1}>
                <Skeleton variant="rectangular" width={32} height={32} />
                <Skeleton variant="rectangular" width={32} height={32} />
                <Skeleton variant="rectangular" width={32} height={32} />
              </Stack>
            </Stack>
          ) : (
            <TablePagination
              {...{
                setPageSize: table.setPageSize,
                setPageIndex: table.setPageIndex,
                getState: table.getState,
                getPageCount: table.getPageCount,
                initialPageSize: 5
              }}
            />
          )}
        </Box>
      </Stack>
    </ScrollX>
  );
}

// ==============================|| COMPANIES TABLE ||============================== //

export default function CompaniesTable() {
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [updateCompanyModalOpen, setUpdateCompanyModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  // const [loadingCompanies, setLoadingCompanies] = useState(true);
  const { currentUser } = useAuth();

  // Add to your state declarations
  const [assignSeatsModalOpen, setAssignSeatsModalOpen] = useState(false);
  const [selectedCompanyForSeats, setSelectedCompanyForSeats] = useState(null);
  // const [companies, setCompanies] = useState([]);

  // Add this handler
  const handleOpenAssignSeatsModal = (company) => {
    setSelectedCompanyForSeats(company);
    setAssignSeatsModalOpen(true);
  };

  const handleCloseAssignSeatsModal = () => {
    setAssignSeatsModalOpen(false);
    setSelectedCompanyForSeats(null);
  };


  const { data: companies, isLoading: loadingCompanies } = useCompanies(
    currentUser?.role === 'admin'
      ? {}
      : { createdBy: currentUser?.id }
  );

  const { mutate: deleteCompanyMutate, isPending: isDeletePending } = useDeleteCompany();

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

  const openConfirm = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

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

  const handleConfirmDeleteCompany = () => {
    if (selectedId) {
      handleDeleteCompany(selectedId);
    }
  };

  const handleOpenCompanyModal = () => {
    setCompanyModalOpen(true);
  };

  const handleOpenUpdateCompanyModal = (company) => {
    setSelectedCompany(company);
    setUpdateCompanyModalOpen(true);
  };

  const handleCloseCompanyModal = () => {
    setCompanyModalOpen(false);
  };

  const handleCloseUpdateCompanyModal = () => {
    setUpdateCompanyModalOpen(false);
  };
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
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
              <Typography variant="h5" sx={{ flexGrow: 1 }}>
                Companies Management
              </Typography>

              <Button
                variant="contained"
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: '10px'
                }}
                startIcon={<Edit />}
                onClick={handleOpenCompanyModal}
                disabled={loadingCompanies}
              >
                Add Company
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <CompaniesReactTable
              data={companies?.data || []}
              columns={companiesColumns}
              loading={loadingCompanies}
            />
          </Grid>
        </Grid>
      </MainCard>

      <CompanyModal open={companyModalOpen} onClose={handleCloseCompanyModal} />

      <AssignSeatsModal
        open={assignSeatsModalOpen}
        onClose={handleCloseAssignSeatsModal}
        company={selectedCompanyForSeats}
      />

      <UpdateCompanyModal
        open={updateCompanyModalOpen}
        onClose={handleCloseUpdateCompanyModal}
        company={selectedCompany}
      />

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

CompaniesTable.propTypes = {
  companies: PropTypes.array,
  loading: PropTypes.bool
};

CompaniesReactTable.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  loading: PropTypes.bool
};