import PropTypes from 'prop-types';
import { useState, useEffect, useMemo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

// project-imports
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';
import MainCard from 'components/MainCard';
import { ThemeMode } from 'config';

// third-party
import ReactApexChart from 'react-apexcharts';

// ===========================|| ENROLLMENT RATE - CHART ||=========================== //

function EnrollmentRateChartComponent({ bundleData = [] }) {
  const theme = useTheme();
  const downSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const mode = theme.palette.mode;

  const { primary } = theme.palette.text;
  const line = theme.palette.divider;
  const backColor = theme.palette.background.paper;

  // Prepare chart data from bundleData - ensure it's always valid
  const chartData = useMemo(() => {
    if (!bundleData || !Array.isArray(bundleData) || bundleData.length === 0) {
      return { series: [], labels: [], isValid: false };
    }

    const series = bundleData
      .map(b => (b && typeof b.enrollmentCount === 'number' && !isNaN(b.enrollmentCount)) ? b.enrollmentCount : 0)
      .filter(val => val >= 0);
    const labels = bundleData
      .map(b => (b && b.bundleName) ? b.bundleName : '')
      .filter(label => label !== '');

    return {
      series,
      labels,
      isValid: series.length > 0 && labels.length > 0 && series.length === labels.length
    };
  }, [bundleData]);

  // Create stable series using useMemo - only when data is valid
  const validSeries = useMemo(() => {
    if (!chartData.isValid || !chartData.series || chartData.series.length === 0) {
      return null;
    }
    const sanitized = chartData.series.filter(val => typeof val === 'number' && !isNaN(val) && val >= 0);
    return sanitized.length > 0 && sanitized.length === chartData.labels.length ? sanitized : null;
  }, [chartData]);

  const chartHeight = downSM ? 200 : 240;

  const [options, setOptions] = useState({
    chart: {
      id: 'enrollment-rate-chart',
      type: 'donut',
      height: chartHeight
    },
    labels: [],
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '12px',
      itemMargin: {
        horizontal: 4,
        vertical: 2
      }
    },
    dataLabels: {
      enabled: false
    }
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only update if we have valid data and series
    if (!chartData.isValid || !validSeries || validSeries.length === 0 || !chartData.labels || chartData.labels.length === 0) {
      setIsReady(false);
      return;
    }

    const warning = theme.palette.warning.main;
    const primaryColor = theme.palette.primary.main;
    const secondary = theme.palette.success.main;
    const error = theme.palette.error.main;
    const info = theme.palette.info.main;

    // Generate colors based on number of bundles
    const colors = [warning, primaryColor, secondary, error, info].slice(0, chartData.labels.length);

    setOptions((prevState) => ({
      ...prevState,
      chart: {
        ...prevState.chart,
        height: chartHeight
      },
      labels: chartData.labels,
      colors: colors,
      grid: {
        borderColor: line
      },
      stroke: {
        colors: [backColor]
      },
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      },
      legend: {
        position: 'bottom',
        fontSize: '12px',
        itemMargin: {
          horizontal: 4,
          vertical: 2
        }
      }
    }));

    // Set ready state immediately after options update
    // This ensures it works on both desktop and mobile
    setIsReady(true);
  }, [mode, primary, line, backColor, theme, chartData.labels, chartData.isValid, validSeries, chartHeight, downSM]);

  // Don't render until ready and validated - multiple validation layers
  if (!isReady || !chartData.isValid || !validSeries || !Array.isArray(validSeries) || validSeries.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: chartHeight, flex: 1 }}>
        <Typography variant="body2" color="text.secondary">
          No enrollment data available
        </Typography>
      </Box>
    );
  }

  // Final validation - ensure series matches labels length
  if (validSeries.length !== chartData.labels.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: chartHeight, flex: 1 }}>
        <Typography variant="body2" color="text.secondary">
          No enrollment data available
        </Typography>
      </Box>
    );
  }

  // Validate all values are numbers
  const hasAllValidNumbers = validSeries.every(val => typeof val === 'number' && !isNaN(val) && val >= 0);
  if (!hasAllValidNumbers) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: chartHeight, flex: 1 }}>
        <Typography variant="body2" color="text.secondary">
          No enrollment data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ '.apexcharts-active': { color: 'common.white' }, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ReactApexChart
        key={`enrollment-${validSeries.length}-${validSeries.join('-')}-${mode}-${downSM ? 'sm' : 'lg'}`}
        options={options}
        series={validSeries}
        type="donut"
        height={chartHeight}
      />
    </Box>
  );
}

EnrollmentRateChartComponent.propTypes = {
  bundleData: PropTypes.arrayOf(PropTypes.shape({
    bundleId: PropTypes.string,
    bundleName: PropTypes.string,
    enrollmentCount: PropTypes.number
  }))
};

// ===========================|| ENROLLMENT RATE CHART ||=========================== //

export default function EnrollmentRateChart({ bundleData = [], loading = false, onBundleFilterChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleBundleFilter = (bundleId) => {
    if (onBundleFilterChange) {
      onBundleFilterChange(bundleId === 'all' ? null : bundleId);
    }
    handleClose();
  };

  if (loading) {
    return (
      <MainCard content={false} sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack sx={{ gap: 1, flex: 1 }}>
          <Skeleton variant="text" width={150} height={32} />
          <Skeleton variant="rectangular" sx={{ flex: 1, borderRadius: 1 }} />
        </Stack>
      </MainCard>
    );
  }

  return (
    <MainCard content={false} sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack sx={{ gap: 1, flex: 1, height: '100%', minHeight: 0 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flex: '0 0 auto' }}>
          <Typography variant="h5">Enrollment Rate</Typography>
          <IconButton
            color="secondary"
            id="enrollment-filter-button"
            aria-controls={open ? 'enrollment-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            disableRipple
          >
            <MoreIcon />
          </IconButton>
          <Menu
            id="enrollment-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            slotProps={{ list: { 'aria-labelledby': 'enrollment-filter-button', sx: { p: 1.25, minWidth: 150 } } }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <ListItemButton onClick={() => handleBundleFilter('all')}>All Bundles</ListItemButton>
            {bundleData.map((bundle) => (
              <ListItemButton key={bundle.bundleId} onClick={() => handleBundleFilter(bundle.bundleId)}>
                {bundle.bundleName}
              </ListItemButton>
            ))}
          </Menu>
        </Stack>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
          <EnrollmentRateChartComponent bundleData={bundleData} />
        </Box>
      </Stack>
    </MainCard>
  );
}

EnrollmentRateChart.propTypes = {
  bundleData: PropTypes.arrayOf(PropTypes.shape({
    bundleId: PropTypes.string,
    bundleName: PropTypes.string,
    enrollmentCount: PropTypes.number
  })),
  loading: PropTypes.bool,
  onBundleFilterChange: PropTypes.func
};
