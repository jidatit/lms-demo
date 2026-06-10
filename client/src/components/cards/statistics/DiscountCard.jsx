import PropTypes from 'prop-types';
// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
// project-imports
import MainCard from 'components/MainCard';
// assets
import { ArrowRight, ArrowUp, TickCircle } from 'iconsax-react';
import { FaCheckCircle, FaUsers } from 'react-icons/fa';
import { maxWidth, width } from '@mui/system';
// ==============================|| STATISTICS - ECOMMERCE CARD  ||============================== //
export default function AnalyticEcommerce({ color = 'primary', seats, off, applied }) {
  return (
    <MainCard contentSX={{ p: 2.25 }} sx={{ maxWidth: '208px', width: '100%', }}>
      <Stack spacing={0.5}>
        {seats && (
          <Typography variant="h6" color="text.secondary">
            <FaUsers /> {seats}+ seats
          </Typography>
        )}
        <Grid container alignItems="center">
          <Grid item>
            <Typography variant="h4" color="inherit">
              {off}% Off
            </Typography>
          </Grid>
        </Grid>
        <Grid>
          {applied && (
            <Grid item>
              <Chip
                variant="combined"
                color={color}
                icon={
                  // <TickCircle  size="32" color="#38b09c" />
                  <FaCheckCircle
                    style={{
                      color: '#38b09c' // Applying color directly here
                    }}
                    size={16}
                  />
                }
                label={`Applied`}
                sx={{ borderRadius: 1, marginTop: 1 }}
                size="small"
              />
            </Grid>
          )}
        </Grid>
      </Stack>
    </MainCard>
  );
}
AnalyticEcommerce.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string,
  count: PropTypes.string,
  percentage: PropTypes.number,
  isLoss: PropTypes.bool,
  extra: PropTypes.string
};
