// pages/helpdesk/TicketDetails.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';


// material-ui
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { GRID_COMMON_SPACING } from 'config';
import TicketDetailsCard from 'sections/admin-panel/helpdesk/ticket/details/TicketDetailsCard';
import TicketDetailsSideCard from 'sections/admin-panel/helpdesk/ticket/details/TicketDetailsSideCard';

// hooks


// utils
import { adaptTicketDetails } from 'utils/ticketAdapter';
import { useHelpdeskTicket } from 'api/queries/helpDesk';
import { toast } from 'utils/toast';
import { useAuth } from 'contexts/AuthContext';
import { getBasePath } from 'utils/getBasePath';

// const getBasePath = (role) => {
//     switch (role) {
//         case 'subscriber': return '/subscriber_dashboard';
//         case 'groupLeader': return '/groupleader_dashboard';
//         case 'contributor': return '/contrib_dashboard';
//         default: return '/dashboard';
//     }
// };

export default function TicketDetails() {
    const { currentUser } = useAuth()
    const { id } = useParams(); // from /:id
    const navigate = useNavigate();
    const { data: rawTicket, isLoading, error } = useHelpdeskTicket(id);

    const ticket = rawTicket ? adaptTicketDetails(rawTicket.data) : null;

    useEffect(() => {
        if (error) {
            toast({
                message: error?.message || 'Failed to load ticket!',
                type: 'error'
            });
            navigate(-1);
        }
    }, [error, navigate]);

    const breadcrumbLinks = [
        { title: 'helpdesk', to: `${getBasePath(currentUser?.role)}/helpdesk/ticket-list` },
        { title: 'ticket details' },
    ];

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (!ticket) return null;

    return (
        <>
            {/* <Breadcrumbs custom heading={`Ticket ${ticket?.ticketNumber}`} links={breadcrumbLinks} /> */}
            <Grid container spacing={GRID_COMMON_SPACING}>
                <Grid item xs={12} md={8}>
                    <TicketDetailsCard ticket={ticket} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TicketDetailsSideCard ticket={ticket} />
                </Grid>
            </Grid>
        </>
    );
}