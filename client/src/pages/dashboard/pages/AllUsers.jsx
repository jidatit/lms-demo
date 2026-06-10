import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { AddCircle, Edit, Trash, Eye } from 'iconsax-react';
import { FaUser } from 'react-icons/fa';

// TanStack Table
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender
} from '@tanstack/react-table';

// Custom components
import ScrollX from 'components/ScrollX';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import HeaderSort from 'components/third-party/react-table/HeaderSort';
import TablePagination from 'components/third-party/react-table/TablePagination';
import { RowSelection } from 'components/third-party/react-table';

// Hooks & API
import { useGetUsers } from 'api/queries/users'; // Adjust path if needed
import { useDeleteUser } from 'api/queries/users'; // Optional: if you have delete support
import { toast } from 'utils/toast';
import SupportAgentModal from '../components/SupportAgentModal';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

// ==============================|| ALL USERS - SUPPORT AGENTS ONLY ||============================== //

export default function AllUsers() {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const [openAddModal, setOpenAddModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Fetch only Support Agents
  const { data: supportAgents = [], isLoading } = useGetUsers({
    role: 'supportAgent', // Adjust role value as per your backend
    enabled: true
  });
  console.log("data", supportAgents)

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser(); // Optional

  // Columns for Support Agents
  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 100,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
            {cell.getValue()}
          </Stack>
        )
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        size: 150
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        size: 150
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 280,
        Cell: ({ cell }) => (
          <Stack sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }} title={cell.getValue()}>
            {cell.getValue()}
          </Stack>
        )
      },
      // {
      //   header: 'Actions',
      //   size: 150,
      //   Cell: ({ row }) => (
      //     <Stack direction="row" alignItems="center" spacing={1}>
      //       <Tooltip title="Edit">
      //         <IconButton color="primary" onClick={() => handleEditClick(row.original)}>
      //           <Edit size={20} />
      //         </IconButton>
      //       </Tooltip>
      //       <Tooltip title="Delete">
      //         <IconButton color="error" onClick={() => handleDeleteClick(row.original)}>
      //           <Trash size={20} />
      //         </IconButton>
      //       </Tooltip>
      //     </Stack>
      //   )
      // }
    ],
    []
  );

  const handleEditClick = (agent) => {
    // You can open the same modal with pre-filled data
    setSelectedAgent(agent);
    setOpenAddModal(true);
  };

  const handleDeleteClick = (agent) => {
    setSelectedAgent(agent);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedAgent?.id) {
      deleteUser(selectedAgent.id, {
        onSuccess: () => {
          toast({ message: 'Support Agent deleted successfully.', type: 'success' });
          setDeleteModalOpen(false);
        },
        onError: (err) => {
          toast({ message: err.message || 'Failed to delete.', type: 'error' });
        }
      });
    }
  };

  const table = useReactTable({
    data: supportAgents?.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <>
      <MainCard content={false}>
        <Grid container spacing={2} sx={{ p: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Header with Add Button */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FaUser /> Support Agents
            </Typography>
          </Grid>

          <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircle />}
              onClick={() => setOpenAddModal(true)}
            >
              Add Support Agent
            </Button>
          </Grid>

          {/* Table */}
          <Grid item xs={12}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <Typography>Loading support agents...</Typography>
              </Box>
            ) : supportAgents.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <Typography color="text.secondary">No support agents found.</Typography>
              </Box>
            ) : (
              <ScrollX>
                <Stack>
                  <TableContainer>
                    <Table sx={{ minWidth: 750 }}>
                      <TableHead>
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <TableCell
                                key={header.id}
                                style={{ width: header.column.columnDef.size || 'auto' }}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                                  {header.column.getCanSort() && <HeaderSort column={header.column} />}
                                </Stack>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableHead>

                      <TableBody>
                        {table.getRowModel().rows.map((row) => (
                          <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* <Box sx={{ p: 2 }}>
                    <TablePagination
                      {...{
                        setPageSize: table.setPageSize,
                        setPageIndex: table.setPageIndex,
                        getState: table.getState,
                        getPageCount: table.getPageCount(),
                        initialPageSize: 10
                      }}
                    />
                  </Box> */}
                </Stack>
              </ScrollX>
            )}
          </Grid>
        </Grid>
      </MainCard>

      {/* Add / Edit Modal */}
      <SupportAgentModal
        open={openAddModal}
        onClose={() => {
          setOpenAddModal(false);
          setSelectedAgent(null);
        }}
        agent={selectedAgent} // Pass for edit mode
        onAgentCreated={() => {
          toast({ message: 'Support agent saved successfully.', type: 'success' });
        }}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedAgent?.email}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

AllUsers.propTypes = {
  // No props needed for this standalone component
};