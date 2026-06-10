import PropTypes from 'prop-types';
// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

// project-imports
import { TotalChart } from '../charts/TotalChart';
import MainCard from 'components/MainCard';

// assets
import { ArrowUp } from 'iconsax-react';

// ==============================|| DASHBOARD - TOTAL CARD ||============================== //

export default function TotalSubscription({
  title,
  amount = 0,
  percentage = 0,
  color = 'primary',
  data = [],
  loading = false
}) {
  const isPositivePercentage = percentage > 0;

  const formattedAmount = Intl.NumberFormat().format(amount);
  const formattedPercentage = `${isPositivePercentage ? '+' : '-'}${Math.abs(percentage)}%`;
  const arrowRotation = isPositivePercentage ? 'rotate(45deg)' : 'rotate(135deg)';

  if (loading) {
    return (
      <MainCard content={false} sx={{ p: 2.5, display: 'flex', flex: 1, flexDirection: 'column', height: '100%' }}>
        <Stack sx={{ gap: 1, flex: 1, justifyContent: 'center' }}>
          <Skeleton variant="text" width={100} height={20} />
          <Skeleton variant="text" width={150} height={40} />
          <Skeleton variant="rectangular" sx={{ borderRadius: 1, flex: 1 }} height="100%" />
        </Stack>
      </MainCard>
    );
  }

  return (
    <MainCard
      content={false}
      sx={{
        p: 2.5,
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Stack sx={{ gap: 1, flex: 1, height: '100%' }}>
        <Typography variant="body2">{title}</Typography>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
          <Typography variant="h3">{formattedAmount}%</Typography>
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              gap: 0.25,
              '& .arrow-up': { color: 'success.main' },
              '& .arrow-down': { color: 'error.main' }
            }}
          >
            {/* <Typography variant="body2">{formattedPercentage}</Typography>
            <ArrowUp size={16} className={isPositivePercentage ? 'arrow-up' : 'arrow-down'} style={{ transform: arrowRotation }} /> */}
          </Stack>
        </Stack>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'stretch', minHeight: 0 }}>
          {data && data.length > 0 && (
            <TotalChart color={color} data={data} sx={{ flex: 1, }} />
          )}
        </Box>
      </Stack>
    </MainCard>
  );
}

TotalSubscription.propTypes = {
  title: PropTypes.string,
  amount: PropTypes.number,
  percentage: PropTypes.number,
  color: PropTypes.string,
  data: PropTypes.array,
  loading: PropTypes.bool
};
