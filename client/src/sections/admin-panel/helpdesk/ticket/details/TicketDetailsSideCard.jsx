// sections/admin-panel/helpdesk/ticket/details/TicketDetailsSideCard.jsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

// material-ui
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar, { CustomAvatar } from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// assets
import { Calendar, Clock, Trash, Lock1, Timer, TickCircle } from 'iconsax-react';

// hooks
import { useAuth } from 'contexts/AuthContext';
import { useCloseTicket, useDeleteTicket } from 'api/queries/helpDesk';

// components


// utils

import ConfirmDialog from 'pages/dashboard/components/ConfirmDialog';
import { toast } from 'utils/toast';


// ==============================|| TICKET DETAILS - SIDE CARD ||============================== //

export default function TicketDetailsSideCard({ ticket }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // State for dialogs
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  // Mutations
  const deleteMutation = useDeleteTicket();
  const closeMutation = useCloseTicket();

  // --- Delete Handlers ---
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(ticket?.id);
      toast({
        message: 'Ticket deleted successfully!',
        type: 'success',
      });
      setDeleteConfirmOpen(false);
      navigate(getBasePath(currentUser?.role) + '/helpdesk/ticket-list');
    } catch (err) {
      toast({
        message: err.message || 'Failed to delete ticket!',
        type: 'error',
      });
    }
  };

  const getDisplayStatus = (ticket) => {
    // Closed tickets
    if (ticket.status === 'closed') {
      return 'Resolved';
    }

    // New ticket: only one reply (user) and pending
    if (ticket.replyCount === 1 && ticket.replyStatus === 'pending') {
      return 'Open';
    }

    // If more replies are added, mark as pending
    if (ticket.replyCount > 1) {
      return 'Pending';
    }

    // Default fallback (optional)
    return 'Open';
  };

  // --- Close Handlers ---
  const handleCloseClick = (e) => {
    e.stopPropagation();
    setCloseConfirmOpen(true);
  };

  const handleConfirmClose = async () => {
    try {
      await closeMutation.mutateAsync(ticket?.id);
      toast({
        message: 'Ticket closed successfully!',
        type: 'success',
      });
      setCloseConfirmOpen(false);
      // Optional: stay on page, ticket will auto-update via refetch
    } catch (err) {
      toast({
        message: err.message || 'Failed to close ticket!',
        type: 'error',
      });
    }
  };

  const handleCancel = () => {
    setDeleteConfirmOpen(false);
    setCloseConfirmOpen(false);
  };

  // --- Helpers ---
  const getBasePath = (role) => {
    switch (role) {
      case 'subscriber': return '/subscriber_dashboard';
      case 'groupLeader': return '/groupleader_dashboard';
      case 'contributor': return '/contrib_dashboard';
      default: return '/dashboard';
    }
  };

  const isAuthorizedToClose = ['admin', 'supportAgent'].includes(currentUser?.role);
  const isAuthorizedToDelete = currentUser?.role === 'admin';

  // Compute response time
  const responseTime = useMemo(() => {
    if (!ticket?.createdAt || !ticket?.lastReplyAt) return 'N/A';
    const created = new Date(ticket.createdAt);
    const replied = new Date(ticket.lastReplyAt);
    const diffMs = replied - created;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMin = Math.floor((diffMs / (1000 * 60)) % 60);
    return `${diffHrs}h ${diffMin}m`;
  }, [ticket]);

  console.log("ticket details side card render", ticket);

  return (
    <MainCard title="Ticket Details" content={false}>
      {/* --- Status Banner --- */}
      <Stack sx={{ gap: 2, p: 3 }}>
        <Alert
          icon={
            getDisplayStatus(ticket) === 'Open' ? <Calendar /> :
              getDisplayStatus(ticket) === 'Pending' ? <Timer /> :
                <TickCircle />
          }
          variant="border"
          sx={{
            width: 1,
            px: 2,
            py: 0.75,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          severity={
            getDisplayStatus(ticket) === 'Open' ? 'info' :
              getDisplayStatus(ticket) === 'Pending' ? 'warning' :
                'success'
          }
        >
          {getDisplayStatus(ticket) === 'Open' && 'TICKET OPEN'}
          {getDisplayStatus(ticket) === 'Pending' && 'TICKET PENDING'}
          {getDisplayStatus(ticket) === 'Resolved' && 'TICKET RESOLVED'}
        </Alert>
      </Stack>

      <Divider />

      {/* --- Ticket Info List --- */}
      <List disablePadding sx={{ '& .MuiListItem-root': { px: 3, py: 2, '& .MuiListItemText-root': { my: 0 } } }}>
        <ListItem divider>
          <ListItemText
            primary={
              <Stack direction="row">
                <Typography variant="body1" sx={{ width: 120, fontWeight: 500 }}>
                  Customer
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {/* <Avatar src={ticket?.creator?.avatar} alt={ticket?.creator?.name} sx={{ width: 24, height: 24 }} /> */}
                  {/* <CustomAvatar sx={{ width: 24, height: 24 }} name={ticket?.creator?.name} /> */}
                  <Typography color="text.secondary">{ticket?.creator?.name}</Typography>
                </Stack>
              </Stack>
            }
          />
        </ListItem>

        <ListItem divider>
          <ListItemText
            primary={
              <Stack direction="row">
                <Typography variant="body1" sx={{ width: 120, fontWeight: 500 }}>
                  Contact
                </Typography>
                <Typography color="text.secondary">{ticket?.creator?.email || 'N/A'}</Typography>
              </Stack>
            }
          />
        </ListItem>

        <ListItem divider>
          <ListItemText
            primary={
              <Stack direction="row">
                <Typography variant="body1" sx={{ width: 120, fontWeight: 500 }}>
                  Category
                </Typography>
                <Typography color="text.secondary">{ticket?.categoryName}</Typography>
              </Stack>
            }
          />
        </ListItem>

        <ListItem divider>
          <ListItemText
            primary={
              <Stack direction="row" alignItems="center">
                <Typography variant="body1" sx={{ width: 120, fontWeight: 500 }}>
                  Created At
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} color="text.secondary">
                  <Clock size={16} />
                  <Typography>
                    {new Date(ticket?.createdAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </Typography>
                </Stack>
              </Stack>
            }
          />
        </ListItem>

        <ListItem divider>
          <ListItemText
            primary={
              <Stack direction="row" alignItems="center">
                <Typography variant="body1" sx={{ width: 120, fontWeight: 500 }}>
                  Response Time
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} color="text.secondary">
                  <Clock size={16} />
                  <Typography>{responseTime}</Typography>
                </Stack>
              </Stack>
            }
          />
        </ListItem>
      </List>

      {/* --- Action Buttons --- */}
      <Stack direction="column" sx={{ gap: 1.5, px: 3, py: 2 }}>
        {/* Close Ticket */}
        {isAuthorizedToClose && ticket?.status === 'open' && (
          <Button
            onClick={handleCloseClick}
            color="warning"
            size="small"
            startIcon={<Lock1 />}
            variant="dashed"
            sx={{ border: 'none', justifyContent: 'flex-start' }}
            fullWidth
          >
            Close Ticket
          </Button>
        )}

        {/* Delete Ticket */}
        {isAuthorizedToDelete && (
          <Button
            onClick={handleDeleteClick}
            color="error"
            size="small"
            startIcon={<Trash />}
            variant="dashed"
            sx={{ border: 'none', justifyContent: 'flex-start' }}
            fullWidth
          >
            Delete Ticket
          </Button>
        )}
      </Stack>

      {/* --- Confirm Dialogs --- */}
      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Ticket"
        description={`Are you sure you want to delete ticket ${ticket?.ticketNumber}? This action cannot be undone.`}
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancel}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Close Dialog */}
      <ConfirmDialog
        open={closeConfirmOpen}
        title="Close Ticket"
        description={`Are you sure you want to close ticket ${ticket?.ticketNumber}? This will mark it as resolved.`}
        loading={closeMutation.isPending}
        onConfirm={handleConfirmClose}
        onCancel={handleCancel}
        confirmText="Close"
        cancelText="Cancel"
      />
    </MainCard>
  );
}