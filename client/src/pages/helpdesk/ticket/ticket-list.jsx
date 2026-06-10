import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Box, Button, CircularProgress } from '@mui/material';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import TicketNotificationsCard from 'components/cards/helpdesk/TicketNotificationsCard';
import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';
import { useAuth } from 'contexts/AuthContext';
import TicketListCard from 'sections/admin-panel/helpdesk/ticket/list/TicketListCard';
import { useHelpdeskDashboard, useHelpdeskStats } from 'api/queries/helpDesk';
import { getBasePath } from 'utils/getBasePath';
import ProjectOverview from 'sections/widgets/chart/ProjectOverview';
import { useNavigate } from 'react-router';

export default function TicketList() {
    const { currentUser } = useAuth();


    const isPrivileged = currentUser?.role === 'admin' || currentUser?.role === 'supportAgent';


    // Conditionally enable queries (React Query-safe)
    const {
        data: statsData,
        isLoading: isStatsLoading,
        isError: isStatsError
    } = useHelpdeskStats({ enabled: isPrivileged });

    const {
        data: dashboardData,
        isLoading: isDashboardLoading,
        isError: isDashboardError
    } = useHelpdeskDashboard({ enabled: isPrivileged && currentUser?.role === 'admin' });

    const basePath = getBasePath(currentUser?.role);

    const breadcrumbLinks = [
        { title: 'home', to: `${basePath}/home` },
        { title: 'helpdesk', to: `${basePath}/helpdesk/ticket-list` },
        { title: 'ticket-list' }
    ];

    // Transform API → TicketNotificationsCard format
    const notificationsData = statsData
        ? [
            {
                title: 'Ticket Categories',
                notifications: statsData.categories.map((cat) => ({
                    avatar: cat?.name.charAt(0).toUpperCase(),
                    color: cat?.open > 0 ? 'warning' : cat?.closed > 0 ? 'success' : 'secondary',
                    name: cat?.name,
                    badges: {
                        primary: cat?.open > 0 ? `${cat.open}` : undefined,
                        secondary: cat?.closed > 0 ? `${cat.closed}` : undefined
                    }
                }))
            },
            {
                title: 'Support Agent',
                notifications: statsData.supportAgents.map((agent) => ({
                    avatar: agent?.name.charAt(0).toUpperCase(),
                    color: agent?.closed > 0 ? 'success' : 'secondary',
                    name: agent?.name,
                    badges: {
                        secondary: agent?.closed > 0 ? `${agent?.closed}` : undefined
                    }
                }))
            }
        ]
        : [];

    // Dynamically adjust TicketListCard width
    const listGridSize = isPrivileged ? 8 : 12;

    return (
        <>
            {/* <Breadcrumbs custom heading="Ticket List" links={breadcrumbLinks} /> */}
            <Grid container spacing={GRID_COMMON_SPACING}>
                {/* Admin-only Project Overview */}
                {currentUser?.role === 'admin' && (
                    <Grid item xs={12}>
                        <ProjectOverview
                            stats={dashboardData || []}
                            isLoading={isDashboardLoading}
                            error={isDashboardError}
                        />
                    </Grid>
                )}


                {/* Main List */}
                <Grid item xs={12} lg={listGridSize}>
                    <TicketListCard />
                </Grid>

                {/* Stats Sidebar (admin / supportAgent only) */}
                {isPrivileged && (
                    <Grid item xs={12} lg={4}>
                        <Stack spacing={GRID_COMMON_SPACING}>
                            {isStatsLoading ? (
                                <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                                    <CircularProgress />
                                </Box>
                            ) : isStatsError ? (
                                <Typography color="error" align="center">
                                    Failed to load stats
                                </Typography>
                            ) : notificationsData.length > 0 ? (
                                notificationsData.map((section, index) => (
                                    <TicketNotificationsCard
                                        key={index}
                                        title={section.title}
                                        tickets={section.notifications}
                                    />
                                ))
                            ) : (
                                <Typography color="text.secondary" align="center">
                                    No stats available
                                </Typography>
                            )}
                        </Stack>
                    </Grid>
                )}
            </Grid>
        </>
    );
}
