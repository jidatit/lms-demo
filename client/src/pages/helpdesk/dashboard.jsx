// pages/helpdesk/HelpdeskDashboard.jsx
import { useMemo } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import SupportCard from 'components/cards/helpdesk/SupportCard';
import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';
import { useHelpdeskDashboard } from 'api/queries/helpDesk';

// hooks


// ==============================|| HELPDESK DASHBOARD ||============================== //

export default function HelpdeskDashboard() {
    const { data: cards = [], isLoading, error } = useHelpdeskDashboard();

    const breadcrumbLinks = [
        { title: 'home', to: APP_DEFAULT_PATH },
        { title: 'helpdesk', to: '/dashboard/helpdesk/ticket-list' },
        { title: 'dashboard' },
    ];

    // Map API → SupportCard props (add fallback for `running`)
    const adaptedCards = useMemo(() => {
        return cards.map((card) => ({
            ...card,
            running: card.running ?? 0, // fallback if missing
        }));
    }, [cards]);
    console.log("adapted", adaptedCards)

    if (isLoading) {
        return (
            <>
                <Breadcrumbs custom heading="dashboard" links={breadcrumbLinks} />
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Breadcrumbs custom heading="dashboard" links={breadcrumbLinks} />
                <Alert severity="error" sx={{ m: 3 }}>
                    Failed to load dashboard: {error.message || 'Please try again later.'}
                </Alert>
            </>
        );
    }

    return (
        <>
            <Breadcrumbs custom heading="dashboard" links={breadcrumbLinks} />

            <Grid container spacing={GRID_COMMON_SPACING}>
                {adaptedCards.map((card, index) => (
                    <Grid
                        item
                        key={index}
                        xs={12}
                        sm={card.fullWidth ? 12 : 6}
                        lg={card.fullWidth ? 12 : 4}
                    >
                        <SupportCard
                            count={card.count}
                            title={card.title}
                            details={card.details}
                            color={card.color}
                            openValue={card.open}
                            runningValue={card.running}
                            solvedValue={card.solved}
                            chartData={card.chartData}
                        />
                    </Grid>
                ))}
            </Grid>
        </>
    );
}