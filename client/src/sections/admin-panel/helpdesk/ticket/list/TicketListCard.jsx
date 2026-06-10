// pages/helpdesk/TicketListCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// project-imports
import TicketDetailsDrawer from './TicketDetailsDrawer';
import TicketCommonCard from 'components/cards/helpdesk/TicketCommonCard';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';

// hooks
import { useHelpdeskTickets } from 'api/queries/helpDesk';


// utils
import { adaptTickets } from 'utils/ticketAdapter';


// assets
import { Element3, TextalignJustifycenter } from 'iconsax-react';
import { Button, Grid, MenuItem, Select } from '@mui/material';
import { useAuth } from 'contexts/AuthContext';
import { getBasePath } from 'utils/getBasePath';


// ==============================|| HELPDESK - TICKET LIST CARD ||============================== //

export default function TicketListCard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [alignment, setAlignment] = useState(1);
  const [showBox, setShowBox] = useState(true);
  const [showAvatarStack, setShowAvatarStack] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  // ✅ Only include filter if it’s not "All"
  const filterParams =
    statusFilter !== 'All'
      ? { ticketType: statusFilter.toLowerCase() }
      : {};
  // Fetch tickets
  const { data: rawData, isLoading, error } = useHelpdeskTickets({
    page: 1,
    limit: 20,
    // Add filters later: status, replyStatus, search, etc.
    ...filterParams
  });
  const clearFilter = () => {
    setStatusFilter('All');
  };
  const handleFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  // Adapt API → UI
  const { tickets = [], pagination } = rawData ? adaptTickets(rawData) : {};
  const handleDrawerOpen = (ticket) => {
    setSelectedTicket(ticket);
    setOpenDrawer(true);
  };

  const handleDrawerClose = () => {
    setOpenDrawer(false);
    setSelectedTicket(null);
  };

  const handleAlignment = (event, newAlignment) => {
    if (!newAlignment) return;
    setAlignment(newAlignment);

    if (newAlignment === 1) {
      setShowBox(true);
      setShowAvatarStack(true);
    } else if (newAlignment === 2) {
      setShowBox(false);
      setShowAvatarStack(false);
    } else if (newAlignment === 3) {
      setShowBox(false);
      setShowAvatarStack(true);
    }
  };

  if (isLoading) {
    return (
      <MainCard>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (error) {
    return (
      <MainCard>
        <Typography color="error">Failed to load tickets.</Typography>
      </MainCard>
    );
  }

  return (
    <Stack sx={{ gap: GRID_COMMON_SPACING }}>
      <MainCard>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2} // handles small screen wrapping neatly
        >
          {/* Left side: Title */}
          <Typography variant="h5">
            Ticket List{' '}
            {rawData?.pagination?.totalItems ? `(${rawData.pagination.totalItems})` : ''}
          </Typography>

          {/* Right side: Actions */}
          <Stack direction="row" alignItems="center" spacing={2}>
            {/* Create Ticket Button for groupLeader & contributor */}
            {(currentUser?.role === 'groupLeader' || currentUser?.role === 'contributor') && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  const basePath = getBasePath(currentUser?.role);
                  navigate(`${basePath}/helpdesk/create-ticket`);
                }}
              >
                Create Ticket
              </Button>
            )}

            {/* Dropdown Filter */}
            <Select
              size="small"
              value={statusFilter}
              onChange={handleFilterChange}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Closed">Resolved</MenuItem>
            </Select>

            {/* Clear Filter Button */}
            {statusFilter !== 'All' && (
              <Button variant="outlined" size="small" onClick={clearFilter}>
                Clear Filter
              </Button>
            )}

            {/* View Mode Toggle */}
            <ToggleButtonGroup
              value={alignment}
              exclusive
              onChange={handleAlignment}
              aria-label="view mode"
              sx={{ '& .MuiToggleButton-root': { p: 0.625 } }}
            >
              <ToggleButton value={2} aria-label="compact view">
                <TextalignJustifycenter />
              </ToggleButton>
              <ToggleButton value={1} aria-label="detailed view">
                <Element3 />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>
      </MainCard>

      {tickets.length === 0 ? (
        <MainCard>
          <Typography textAlign="center" color="text.secondary">
            No tickets found.
          </Typography>
        </MainCard>
      ) : (
        tickets.map((ticket) => (
          <TicketCommonCard
            key={ticket.id}
            id={ticket?.id}
            onClick={() => handleDrawerOpen(ticket)}
            // Pass all props expected by TicketCommonCard
            chipLabel={ticket.chipLabel}
            customerName={ticket.customerName}
            ticketCount={ticket.ticketNumber}
            issueTitle={ticket.issueTitle}
            likes={ticket.likes}
            customerAvatar={ticket.customerAvatar}
            customerInitials={ticket.customerInitials}
            supporterAvatar={ticket.lastReplierAvatar}
            supporterName={ticket.lastReplierName}
            updateTime={ticket.updateTime}
            messageCount={ticket.messageCount}
            lastCommentPreview={ticket.lastCommentPreview}
            showBox={showBox}
            showAvatarStack={showAvatarStack}
            borderLeft={ticket.borderLeft}
            borderColor={ticket.borderColor}
          />
        ))
      )}

      {/* Optional: Pagination */}
      {pagination && (pagination.hasNextPage || pagination.hasPreviousPage) && (
        <Stack direction="row" justifyContent="center" gap={1} mt={2}>
          <Button
            disabled={!pagination.hasPreviousPage}
            onClick={() => {/* handle prev */ }}
          >
            Previous
          </Button>
          <Button
            disabled={!pagination.hasNextPage}
            onClick={() => {/* handle next */ }}
          >
            Next
          </Button>
        </Stack>
      )}

      {/*      
      <TicketDetailsDrawer
        isOpen={openDrawer}
        handleDrawerOpen={handleDrawerClose}
        ticket={selectedTicket}
      /> */}
    </Stack>
  );
}