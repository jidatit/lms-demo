import PropTypes from 'prop-types';
import { useState, useEffect, useMemo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';

// third-party
import ReactApexChart from 'react-apexcharts';

// project-imports
import { ThemeMode } from 'config';

// ==============================|| STATISTICS - CHART ||============================== //

// ==============================|| DASHBOARD - STATISTICS CARD ||============================== //

export default function StatisticsChart({ data = [], categories = null }) {
  const theme = useTheme();
  // Initialize with empty array to prevent undefined access
  const [chartSeries, setChartSeries] = useState([]);
  const [isReady, setIsReady] = useState(false);
  
  // Extract categories from first data series if not provided
  const chartCategories = useMemo(() => {
    if (categories && Array.isArray(categories) && categories.length > 0) {
      return categories;
    }
    if (data && Array.isArray(data) && data.length > 0 && data[0] && Array.isArray(data[0].data)) {
      return Array.from({ length: data[0].data.length }, (_, i) => `Period ${i + 1}`);
    }
    return [];
  }, [categories, data]);

  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    legend: { show: true, position: 'top', horizontalAlign: 'right' },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        type: 'vertical',
        inverseColors: false,
        opacityFrom: 0.4,
        opacityTo: 0
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (val) {
          return val.toString();
        }
      }
    },
    xaxis: {
      categories: chartCategories,
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value.toString();
        }
      }
    }
  });

  useEffect(() => {
    const { mode, text, divider, primary, success, warning, error } = theme.palette;
    
    // Generate colors for multiple series
    const colors = [primary.main, success.main, warning.main, error.main].slice(0, data.length);
    
    setChartOptions((prev) => ({
      ...prev,
      colors: colors,
      xaxis: {
        ...prev.xaxis,
        categories: chartCategories,
        labels: { style: { colors: text.secondary } },
        axisBorder: { color: divider }
      },
      yaxis: { 
        ...prev.yaxis, 
        labels: { 
          ...prev.yaxis.labels, 
          style: { colors: text.secondary } 
        } 
      },
      grid: { borderColor: divider },
      theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
    }));
  }, [theme.palette, chartCategories, data.length]);

  useEffect(() => {
    // Validate data before setting series
    if (data && Array.isArray(data) && data.length > 0) {
      // Ensure each series has valid data array
      const validData = data.filter(series => 
        series && 
        series.name && 
        Array.isArray(series.data) && 
        series.data.length > 0 &&
        series.data.every(val => typeof val === 'number' && !isNaN(val))
      );
      if (validData.length > 0) {
        setChartSeries(validData);
        setIsReady(true);
      } else {
        setChartSeries([]);
        setIsReady(false);
      }
    } else {
      setChartSeries([]);
      setIsReady(false);
    }
  }, [data]);

  // Don't render until ready and validated
  if (!isReady || !chartSeries || !Array.isArray(chartSeries) || chartSeries.length === 0) {
    return null;
  }

  // Final validation - ensure each series has valid data
  const validSeries = chartSeries.filter(series => 
    series && 
    series.name && 
    Array.isArray(series.data) && 
    series.data.length > 0 &&
    series.data.every(val => typeof val === 'number' && !isNaN(val))
  );

  if (validSeries.length === 0) {
    return null;
  }

  // Ensure categories match data length
  const firstSeriesLength = validSeries[0].data.length;
  const validCategories = chartCategories && Array.isArray(chartCategories) && chartCategories.length === firstSeriesLength
    ? chartCategories
    : Array.from({ length: firstSeriesLength }, (_, i) => `Period ${i + 1}`);

  return (
    <ReactApexChart 
      key={`statistics-${validSeries.length}-${validCategories.length}-${theme.palette.mode}`}
      options={{ ...chartOptions, xaxis: { ...chartOptions.xaxis, categories: validCategories } }} 
      series={validSeries} 
      type="area" 
      height={260} 
    />
  );
}

StatisticsChart.propTypes = { 
  data: PropTypes.array,
  categories: PropTypes.arrayOf(PropTypes.string)
};
