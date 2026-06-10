import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

// material-ui
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

// project-imports
import MainCard from 'components/MainCard';
import StatisticsChart from '../charts/StatisticsChart';

// ==============================|| DASHBOARD - COMPLETION RATE CHART ||============================== //

export default function CompletionRateChart({ 
  completionData = null, 
  loading = false,
  timeFilter = 'monthly',
  onTimeFilterChange,
  groupFilter = null,
  onGroupFilterChange
}) {
  const [value, setValue] = useState(timeFilter);

  const handleChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    if (onTimeFilterChange) {
      onTimeFilterChange(newValue);
    }
  };

  // Transform completion data for StatisticsChart
  const { chartData, chartCategories } = useMemo(() => {
    if (!completionData) return { chartData: [], chartCategories: [] };

    const { pending, active, completed, expired } = completionData;
    
    // Get dates from any status (they should all have same dates)
    const dates = pending?.dates || active?.dates || completed?.dates || expired?.dates || [];
    
    const data = [
      { 
        name: 'Pending', 
        data: pending?.values || [] 
      },
      { 
        name: 'Active', 
        data: active?.values || [] 
      },
      { 
        name: 'Completed', 
        data: completed?.values || [] 
      },
      { 
        name: 'Expired', 
        data: expired?.values || [] 
      }
    ];
    
    return { chartData: data, chartCategories: dates };
  }, [completionData]);

  if (loading) {
    return (
      <MainCard>
        <Stack sx={{ gap: 1.5 }}>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 1 }} />
        </Stack>
      </MainCard>
    );
  }

  return (
    <MainCard>
      <Stack sx={{ gap: 1.5 }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack sx={{ gap: 0.25 }}>
            <Typography variant="h5">Completion Rate</Typography>
            <Typography sx={{ color: 'secondary.main' }}>
              Course completion rates (pending, active, completed, expired)
            </Typography>
          </Stack>
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth size="small">
              <Select id="completion-time-select" value={value} onChange={handleChange}>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>
        {chartData.length > 0 ? (
          <StatisticsChart data={chartData} categories={chartCategories} />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
            <Typography variant="body2" color="text.secondary">
              No completion data available
            </Typography>
          </Box>
        )}
      </Stack>
    </MainCard>
  );
}

CompletionRateChart.propTypes = {
  completionData: PropTypes.shape({
    pending: PropTypes.shape({
      dates: PropTypes.arrayOf(PropTypes.string),
      values: PropTypes.arrayOf(PropTypes.number)
    }),
    active: PropTypes.shape({
      dates: PropTypes.arrayOf(PropTypes.string),
      values: PropTypes.arrayOf(PropTypes.number)
    }),
    completed: PropTypes.shape({
      dates: PropTypes.arrayOf(PropTypes.string),
      values: PropTypes.arrayOf(PropTypes.number)
    }),
    expired: PropTypes.shape({
      dates: PropTypes.arrayOf(PropTypes.string),
      values: PropTypes.arrayOf(PropTypes.number)
    })
  }),
  loading: PropTypes.bool,
  timeFilter: PropTypes.oneOf(['weekly', 'monthly']),
  onTimeFilterChange: PropTypes.func,
  groupFilter: PropTypes.string,
  onGroupFilterChange: PropTypes.func
};
