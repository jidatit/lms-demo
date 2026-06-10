import PropTypes from 'prop-types';
import { useEffect, useState, useMemo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';

// third-party
import ReactApexChart from 'react-apexcharts';

// project-imports
import { ThemeMode } from 'config';

// chart options
const areaChartOptions = {
  chart: {
    type: 'line',
    zoom: { enabled: false },
    sparkline: { enabled: true }
  },
  plotOptions: { bar: { borderRadius: 0 } },
  dataLabels: { enabled: false },
  markers: { hover: { size: 5 } },
  tooltip: { x: { show: false } },
  grid: { show: false },
  stroke: { width: 2 }
};

// ==============================|| TOTAL CARD - CHART ||============================== //

export function TotalChart({ color, data }) {
  const theme = useTheme();
  const mode = theme.palette.mode;

  // Validate and sanitize data using useMemo - ensures it's always valid
  const validData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }
    // Filter out invalid values and ensure all are numbers
    const sanitized = data
      .map(val => typeof val === 'number' && !isNaN(val) ? val : 0)
      .filter(val => val >= 0);

    return sanitized.length > 0 ? sanitized : null;
  }, [data]);

  // Create series only when data is valid
  const series = useMemo(() => {
    if (!validData || validData.length === 0) {
      return null;
    }
    return [{ name: 'Usage', data: validData }];
  }, [validData]);

  const [options, setOptions] = useState({
    ...areaChartOptions,
    colors: [color || theme.palette.primary.main],
    theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
  });

  const [isReady, setIsReady] = useState(false);

  // Update options when theme or color changes - only if we have valid data
  useEffect(() => {
    if (!series || !validData) {
      setIsReady(false);
      return;
    }

    setOptions((prev) => ({
      ...prev,
      colors: [color || theme.palette.primary.main],
      theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
    }));

    // Mark as ready only after options are set
    setIsReady(true);
  }, [color, mode, theme, series, validData]);

  // Reset ready state when data becomes invalid
  useEffect(() => {
    if (!validData || !series) {
      setIsReady(false);
    }
  }, [validData, series]);

  // ⛔ DO NOT RENDER CHART UNTIL READY
  // Multiple validation layers to prevent ApexCharts from accessing undefined
  if (!isReady || !series || !Array.isArray(series) || series.length === 0) {
    return null;
  }

  const firstSeries = series[0];
  if (!firstSeries || !Array.isArray(firstSeries.data) || firstSeries.data.length === 0) {
    return null;
  }

  // Validate all data points are numbers
  const hasValidData = firstSeries.data.every(val => typeof val === 'number' && !isNaN(val));
  if (!hasValidData) {
    return null;
  }

  // Safe key generation - include theme mode to force remount on theme change
  const dataLength = firstSeries.data.length;
  const firstValue = firstSeries.data[0] ?? 0;
  const lastValue = firstSeries.data[dataLength - 1] ?? 0;
  const chartKey = `total-chart-${dataLength}-${firstValue}-${lastValue}-${mode}`;

  return (
    <ReactApexChart
      key={chartKey}
      options={options}
      series={series}
      type="line"
      height={150}
    />
  );
}



TotalChart.propTypes = { color: PropTypes.string, data: PropTypes.array };
