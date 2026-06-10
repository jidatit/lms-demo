import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';

// third-party
import ReactApexChart from 'react-apexcharts';

// project-imports
import { ThemeMode } from 'config';
import { Grid, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import MainCard from 'components/MainCard';
import Dot from 'components/@extended/Dot';
import { ArrowUp } from 'iconsax-react';

// chart options
const areaChartOptions = {
  chart: {
    height: 355,
    type: 'area',
    toolbar: {
      show: false
    }
  },
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
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'straight',
    width: 1
  },
  grid: {
    show: true,
    borderColor: '#90A4AE',
    strokeDashArray: 0,
    position: 'back',
    xaxis: {
      lines: {
        show: true
      }
    },
    yaxis: {
      lines: {
        show: true
      }
    }
  }
};

// ==============================|| ANALYTICS - INCOME LINE CHART ||============================== //

export default function IncomeAreaChart({ slot, quantity }) {
  const theme = useTheme();

  const { primary, secondary } = theme.palette.text;
  const line = theme.palette.divider;
  const mode = theme.palette.mode;

  const [options, setOptions] = useState(areaChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [theme.palette.primary.main, theme.palette.primary[700]],
      xaxis: {
        categories:
          slot === 'month'
            ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        labels: {
          style: {
            colors: [
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary
            ]
          }
        },
        axisBorder: {
          show: true,
          color: line
        },
        tickAmount: slot === 'month' ? 11 : 7
      },
      yaxis: {
        labels: {
          style: {
            colors: [secondary]
          }
        }
      },
      grid: {
        borderColor: line
      },
      tooltip: {
        y: {
          formatter(val) {
            return `$ ${val}`;
          }
        }
      },
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      }
    }));
  }, [mode, primary, secondary, line, theme, slot]);

  const [series, setSeries] = useState([
    {
      name: 'Income',
      data: [0, 86, 28, 115, 48, 210, 136]
    }
  ]);

  useEffect(() => {
    switch (quantity) {
      case 'By volume':
        setSeries([
          {
            name: 'Income',
            data: slot === 'month' ? [100, 40, 60, 40, 40, 40, 80, 40, 40, 50, 40, 40] : [100, 20, 60, 20, 20, 80, 20]
          }
        ]);
        break;

      case 'By margin':
        setSeries([
          {
            name: 'Income',
            data: slot === 'month' ? [120, 85, 101, 98, 87, 105, 91, 114, 94, 86, 115, 35] : [51, 40, 28, 51, 42, 109, 100]
          }
        ]);
        break;
      case 'By sales':
        setSeries([
          {
            name: 'Income',
            data: slot === 'month' ? [90, 85, 101, 98, 87, 105, 91, 114, 94, 86, 115, 35] : [21, 40, 28, 51, 42, 109, 100]
          }
        ]);
        break;
      default:
        break;
    }
  }, [slot, quantity]);

  return (
    <Grid container spacing={2}>
      {/* Chart Section */}
      <Grid item xs={12} md={8}>
        <ReactApexChart options={options} series={series} type="area" height={355} />
      </Grid>

      {/* Grid Cards Section */}
      <Grid item xs={12} md={4}>
        <Stack spacing={2}>
          {[1, 2, 3, 4].map((item, index) => (
            <MainCard key={index} content={false} border={false} sx={{ bgcolor: 'background.default' }}>
              <Stack alignItems="flex-start" sx={{ p: 2 }} spacing={0.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Dot componentDiv color={index % 2 === 0 ? 'primary' : 'warning'} />
                  <Typography>Item {`0${item}`}</Typography>
                </Stack>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  $23,876
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.25 }}
                  >
                    <ArrowUp size={14} /> +$76,343
                  </Typography>
                </Typography>
              </Stack>
            </MainCard>
          ))}
        </Stack>
      </Grid>
    </Grid>
  );
}

IncomeAreaChart.propTypes = { slot: PropTypes.string, quantity: PropTypes.any };
