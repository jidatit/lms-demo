import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';

// third-party
import ReactApexChart from 'react-apexcharts';

// ==============================|| INVITE GOAL - CHART ||============================== //

export default function RadialBarChart({ percentage = 0 }) {
  const theme = useTheme();

  // Initialize with safe default
  const validPercentage = typeof percentage === 'number' && !isNaN(percentage)
    ? Math.max(0, Math.min(100, percentage))
    : 0;

  const [options, setOptions] = useState({
    chart: {
      type: 'radialBar',
      offsetY: -40
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: '70%',
          background: 'transparent'
        },
        track: {
          background: theme.palette.grey[200],
          strokeWidth: '50%'
        },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: -30,
            fontSize: '24px',
            color: theme.palette.text.primary,
            formatter: function (val) {
              return val.toFixed(2) + '%';
            }
          }
        }
      }
    },
    stroke: { lineCap: 'round', width: 20 },
    colors: [theme.palette.primary.main]
  });

  // Always initialize with valid array
  const [series, setSeries] = useState([validPercentage]);
  const [isReady, setIsReady] = useState(false);

  // Update options when theme changes
  useEffect(() => {
    setOptions((prev) => ({
      ...prev,
      plotOptions: {
        ...prev.plotOptions,
        radialBar: {
          ...prev.plotOptions.radialBar,
          track: {
            ...prev.plotOptions.radialBar.track,
            background: theme.palette.grey[200]
          },
          dataLabels: {
            ...prev.plotOptions.radialBar.dataLabels,
            value: {
              ...prev.plotOptions.radialBar.dataLabels.value,
              color: theme.palette.text.primary
            }
          }
        }
      },
      colors: [theme.palette.primary.main]
    }));
  }, [theme]);

  // Update series when percentage changes - ensure it's always valid
  useEffect(() => {
    const newValidPercentage = typeof percentage === 'number' && !isNaN(percentage)
      ? Math.max(0, Math.min(100, percentage))
      : 0;
    setSeries([newValidPercentage]);
    // Mark as ready only after series is set
    setIsReady(true);
  }, [percentage]);

  // Don't render until ready and validated
  if (!isReady || !series || !Array.isArray(series) || series.length === 0) {
    return null;
  }

  const firstValue = series[0];
  if (typeof firstValue !== 'number' || isNaN(firstValue)) {
    return null;
  }

  return <ReactApexChart key={`radial-${firstValue}-${theme.palette.mode}`} options={options} series={series} type="radialBar" height={350} />;
}

RadialBarChart.propTypes = {
  percentage: PropTypes.number
};
