import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton'; // Import Skeleton for placeholders

export default function HoverSocialCard({ primary, secondary, iconPrimary, color, loading }) {
  const IconPrimary = iconPrimary;
  const primaryIcon = iconPrimary ? <IconPrimary variant="Bold" size={52} /> : null;

  return (
    <Card
      elevation={0}
      sx={{
        background: color,
        position: 'relative',
        color: 'white',
        minHeight: '100px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        '&:hover svg': {
          opacity: 1,
          transform: 'scale(1.1)'
        }
      }}
    >
      <CardContent>
        <Box
          sx={{
            position: 'absolute',
            right: 15,
            top: 25,
            '& svg': {
              opacity: 0.4,
              transition: 'all .3s ease-in-out'
            }
          }}
        >
          {primaryIcon}
        </Box>
        <Grid container spacing={0}>
          <Grid item xs={12}>
            {loading ? (
              <Skeleton variant="text" width={80} height={40} />
            ) : (
              <Typography variant="h3" color="inherit">
                {secondary}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            {loading ? <Skeleton variant="text" width={120} height={30} /> : <Typography color="inherit">{primary}</Typography>}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

HoverSocialCard.propTypes = {
  primary: PropTypes.any,
  secondary: PropTypes.any,
  iconPrimary: PropTypes.elementType.isRequired,
  color: PropTypes.string.isRequired,
  loading: PropTypes.bool
};

HoverSocialCard.defaultProps = {
  loading: false
};
