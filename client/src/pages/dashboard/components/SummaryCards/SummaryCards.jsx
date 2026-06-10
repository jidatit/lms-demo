// material-ui
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import RoundIconCard from 'components/statistics/RoundIconCard';

// project-imports
import { GRID_COMMON_SPACING } from 'config';

// ==============================|| MEMBERSHIP - DASHBOARD ||============================== //

export default function SummaryCards({ dashboardWidgetData = [], loading = false }) {
    if (loading) {
        return (
            <Grid container spacing={GRID_COMMON_SPACING}>
                {[1, 2, 3, 4].map((index) => (
                    <Grid item key={index} xs={12} sm={6} xl={3}>
                        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                    </Grid>
                ))}
            </Grid>
        );
    }

    return (
        <Grid container spacing={GRID_COMMON_SPACING}>
            {dashboardWidgetData.map((card, index) => (
                <Grid
                    item
                    key={index}
                    xs={12}
                    sm={6}
                    xl={3}
                >
                    <RoundIconCard
                        primary={card.primary}
                        secondary={card.secondary}
                        content={card.content}
                        iconPrimary={card.iconPrimary}
                        color={card.color}
                        bgcolor={card.bgcolor}
                        avatarSize="md"
                        circular
                    />
                </Grid>
            ))}
        </Grid>
    );
}
