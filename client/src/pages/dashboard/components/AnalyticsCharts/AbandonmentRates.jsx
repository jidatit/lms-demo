import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

// project-imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';

// assets
import { ArrowDown, ArrowUp } from 'iconsax-react';
import RadialBarChart from '../charts/RadialChart';

// ==============================|| DASHBOARD - ABANDONMENT RATES ||============================== //

export default function AbandonmentRates({
  sent = 0,
  accepted = 0,
  active = 0,
  percentage = 0,
  loading = false,
  onGroupFilterChange
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGroupFilter = (groupId) => {
    if (onGroupFilterChange) {
      onGroupFilterChange(groupId === 'all' ? null : groupId);
    }
    handleClose();
  };

  const data = [
    { name: 'Sent', amount: sent },
    { name: 'Accepted', amount: accepted },
    { name: 'Active', amount: active }
  ];

  if (loading) {
    return (
      <MainCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack sx={{ flex: 1, gap: 1.5, height: '100%', justifyContent: 'space-between' }}>
          <Skeleton variant="text" width={150} height={32} />
          <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 1 }} />
          <Skeleton variant="text" width="100%" height={80} />
        </Stack>
      </MainCard>
    );
  }

  return (
    <MainCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack
        sx={{
          flex: 1,
          height: '100%',
          justifyContent: 'stretch'
        }}
      >
        {/* Header and filter */}
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', flex: '0 0 auto', minHeight: 48 }}
        >
          <Typography variant="h5">Abandonment Rates</Typography>

        </Stack>
        {/* Main content with equal distribution */}
        <Stack
          sx={{
            flex: 1,
            justifyContent: 'stretch',
            alignItems: 'stretch',
            height: '100%',
            minHeight: 0
          }}
        >
          <Stack
            sx={{
              height: '100%',
              flex: 1,
              justifyContent: 'space-between'
            }}
          >
            {/* Chart section: take more space */}
            <Box sx={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
              <Box sx={{ width: '100%', height: { xs: 160, sm: 180, md: 200 }, maxHeight: 240, minHeight: 120 }}>
                <RadialBarChart percentage={percentage} />
              </Box>
            </Box>
            {/* Data section: even distribution and moderate text size */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
              <Stack direction="row" sx={{ width: 1, alignContent: 'center', justifyContent: 'space-around', gap: 2 }}>
                {data.map((value, index) => (
                  <Stack key={index} sx={{ gap: 0.75, alignContent: 'center', alignItems: 'center' }}>
                    <Typography
                      variant="subtitle2"
                      align="center"
                      sx={{ color: 'text.secondary', fontWeight: 400, fontSize: 16 }}
                    >
                      {value.name}
                    </Typography>
                    <Stack
                      direction="row"
                      sx={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                        '& .arrow-up': { color: 'success.main' },
                        '& .arrow-down': { color: 'error.main' }
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 500, fontSize: 22 }}>
                        {value.amount}
                      </Typography>
                      {/* {value.amount > 10 ? <ArrowUp size={20} className="arrow-up" /> : <ArrowDown size={20} className="arrow-down" />} */}
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </MainCard >
  );
}

AbandonmentRates.propTypes = {
  sent: PropTypes.number,
  accepted: PropTypes.number,
  active: PropTypes.number,
  percentage: PropTypes.number,
  loading: PropTypes.bool,
  onGroupFilterChange: PropTypes.func
};
