import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box'; // Add this import (used in no-data fallback)

// third-party
import ReactApexChart from 'react-apexcharts';

// project-imports
import MainCard from 'components/MainCard';
import { ThemeMode } from 'config';

// assets
import { Add } from 'iconsax-react';

// ==============================|| CHART ||============================== //

function TaskStatusChart({ color, data }) {
    const theme = useTheme();
    const mode = theme.palette.mode;

    const [options, setOptions] = useState({
        chart: {
            id: "task-status-chart",
            type: 'area',
            stacked: true,
            sparkline: { enabled: true }
        },
        dataLabels: { enabled: false },

        markers: { hover: { size: 5 } },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                type: 'vertical',
                inverseColors: false,
                opacityFrom: 0.5,
                opacityTo: 0
            }
        },
        stroke: { curve: 'smooth', width: 2 },
        grid: { show: false }
    });

    useEffect(() => {
        setOptions((prev) => ({
            ...prev,
            chart: {
                ...prev.chart,
                background: 'transparent'  // 🔥 FIXES grey background like previous chart
            },
            colors: [
                theme.palette?.[color?.split?.('.')[0]]?.[color?.split?.('.')[1]] ||
                theme.palette.primary.main
            ],

            theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
        }));
    }, [color, mode, theme]);

    //  Normalize and deeply validate the data
    const safeData = Array.isArray(data)
        ? data.filter((n) => typeof n === 'number' && !isNaN(n))
        : [];

    //  Early return to prevent Apex crash
    if (!safeData.length) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height={60}>
                <Typography variant="caption" color="text.secondary">
                    No data
                </Typography>
            </Box>
        );
    }

    // ✅ NEW: Prepare series here (memoize if needed, but simple for now)
    const series = [{ name: 'Tickets', data: safeData }];

    // ✅ NEW: Conditional render to ensure props are ready (prevents HMR race)
    if (!options || !series) {
        return <ChartSkeleton />; // Reuse your skeleton for a smooth loading state
    }

    return (
        <ReactApexChart
            key={safeData.join('-')} // ✅ ensure re-render when data changes
            options={options}
            series={series} // Use the prepared series
            type="area"
            height={60}
        />
    );
}

TaskStatusChart.propTypes = {
    color: PropTypes.string,
    data: PropTypes.array
};

// Chart Skeleton Component (unchanged)
function ChartSkeleton() {
    return (
        <Skeleton
            variant="rectangular"
            width="100%"
            height={60}
            sx={{ borderRadius: 1 }}
        />
    );
}
// ==============================|| PROJECT OVERVIEW ||============================== //

export default function ProjectOverview({ stats = [], isLoading = false, error = null }) {
    const theme = useTheme();

    const safeStats = Array.isArray(stats) && stats.length ? stats : [];

    // Show error state
    if (error) {
        return (
            <MainCard>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Failed to load helpdesk data: {error.message || 'Unknown error occurred'}
                </Alert>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="h5">Helpdesk Overview</Typography>
                </Stack>
                <Grid container spacing={1.5}>
                    {[1, 2, 3, 4].map((item) => (
                        <Grid item xs={12} sm={6} md={3} key={item}>
                            <Grid container spacing={0} alignItems="center">
                                <Grid item xs={7}>
                                    <Stack spacing={0.25}>
                                        <Skeleton variant="text" width="80%" height={20} />
                                        <Skeleton variant="text" width="60%" height={32} />
                                    </Stack>
                                </Grid>
                                <Grid item xs={5}>
                                    <ChartSkeleton />
                                </Grid>
                            </Grid>
                        </Grid>
                    ))}
                </Grid>
            </MainCard>
        );
    }

    // Show loading skeleton
    if (isLoading) {
        return (
            <MainCard>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Skeleton variant="text" width={200} height={32} />
                </Stack>

                <Grid container spacing={1.5}>
                    {[1, 2, 3, 4].map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item}>
                            <Grid container spacing={0.5} alignItems="center">
                                <Grid item xs={7}>
                                    <Stack spacing={0.25}>
                                        <Skeleton variant="text" width="80%" height={20} />
                                        <Skeleton variant="text" width="60%" height={32} />
                                        <Skeleton variant="text" width="90%" height={16} />
                                    </Stack>
                                </Grid>
                                <Grid item xs={5}>
                                    <ChartSkeleton />
                                </Grid>
                            </Grid>
                        </Grid>
                    ))}
                </Grid>
            </MainCard>
        );
    }

    return (
        <MainCard>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="h5">Helpdesk Overview</Typography>
            </Stack>

            <Grid container spacing={4}>
                {safeStats.length === 0 ? (
                    <Grid item xs={12}>
                        <Typography color="text.secondary" textAlign="center">
                            No data available
                        </Typography>
                    </Grid>
                ) : (
                    safeStats.map((item, index) => {
                        const {
                            title = 'Untitled',
                            details = '',
                            color = 'primary.main',
                            count = 0,
                            chartData = [],
                            fullWidth = false
                        } = item || {};

                        const gridSize = fullWidth ? 12 : 4;

                        return (
                            <Grid item xs={12} sm={6} md={gridSize} key={index}>
                                <Grid container spacing={0.5} alignItems="center">
                                    <Grid item xs={7}>
                                        <Stack spacing={0.25}>
                                            <Typography variant="subtitle2" sx={{ color: color, fontSize: '0.8rem' }}>
                                                {title}
                                            </Typography>
                                            <Typography variant="h5" sx={{ color: color, fontWeight: 600 }}>
                                                {count ?? 0}
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={5}>
                                        <TaskStatusChart color={color} data={chartData} />
                                    </Grid>
                                </Grid>
                            </Grid>
                        );
                    })
                )}
            </Grid>
        </MainCard>
    );
}

ProjectOverview.propTypes = {
    stats: PropTypes.array,
    isLoading: PropTypes.bool,
    error: PropTypes.object
};