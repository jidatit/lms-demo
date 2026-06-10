import PropTypes from 'prop-types';
// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// assets
import { ArrowSwapHorizontal } from 'iconsax-react';

export default function LicenseUsage({ title = 'Total Subscription', amount = 0, loading = false }) {
  const formattedAmount = Intl.NumberFormat().format(amount);

  if (loading) {
    return (
      <MainCard
        content={false}
        sx={(theme) => ({
          bgcolor: 'primary.main',
          color: 'background.paper',
          ...theme.applyStyles('dark', { color: 'text.primary' })
        })}
      >
        <Box sx={{ p: 2 }}>
          <Skeleton variant="text" width={150} height={24} />
          <Skeleton variant="text" width={100} height={32} />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard
      content={false}
      sx={(theme) => ({
        bgcolor: 'primary.main',
        color: 'background.paper',
        ...theme.applyStyles('dark', { color: 'text.primary' }),
        '&:after': {
          content: '""',
          background: `linear-gradient(245deg, transparent 25.46%, rgba(0, 0, 0, 0.2) 68.77%, rgba(0, 0, 0, 0.3) 81.72%)`,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          opacity: 0.6
        }
      })}
    >
      <Box sx={{ p: 2, position: 'inherit', zIndex: 2 }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack>
            <Typography>{title}</Typography>
            <Typography variant="h4">{formattedAmount}</Typography>
          </Stack>
          <Avatar
            variant="rounded"
            type="filled"
            size="lg"
            sx={(theme) => ({ bgcolor: 'primary.darker', ...theme.applyStyles('dark', { bgcolor: 'primary.100' }) })}
          >
            <ArrowSwapHorizontal />
          </Avatar>
        </Stack>
      </Box>
    </MainCard>
  );
}

LicenseUsage.propTypes = {
  title: PropTypes.string,
  amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  loading: PropTypes.bool
};
