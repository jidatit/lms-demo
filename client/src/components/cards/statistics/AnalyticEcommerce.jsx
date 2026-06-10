import PropTypes from 'prop-types';
// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { ArrowRight, ArrowUp } from 'iconsax-react';

// ==============================|| STATISTICS - ECOMMERCE CARD  ||============================== //

export default function AnalyticEcommerce({ color = 'primary', item, isSelected, onSelect, discount, onUpdateDiscount }) {
  const isCourse = false;
  const itemId = isCourse ? item.id : item.id;
  const details = isCourse ? item : item;

  const getTitle = () => (isCourse ? details?.title : details?.title);
  const getPrice = () => {
    const price = isCourse ? details?.priceperseat : details?.seatPrice;
    return typeof price === 'number' ? price : parseFloat(price) || 0;
  };

  const handleUpdateClick = (e) => {
    e.stopPropagation();
    onSelect(itemId);
    onUpdateDiscount(itemId, discount);
  };
  const originalPrice = getPrice();
  const discountedPrice = discount && discount?.enable ? originalPrice * (1 - (parseFloat(discount.percentage) || 0) / 100) : originalPrice;
  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : '0.00';
  };

  return (
    <MainCard
      contentSX={{ p: 2.25 }}
      selected={isSelected}
      onClick={() => onSelect(itemId)}
      sx={{
        backgroundColor: isSelected ? 'primary.lighter' : '',

        '&:hover': {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-15px)'
        },

        transition: 'all 0.3s ease', // Smooth transition for all properties
        height: '100%'
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant="h6" color="text.secondary">
          {getTitle()}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {isCourse ? 'Course' : 'Bundle'}
        </Typography>
        <Grid container alignItems="center">
          <Grid item>
            <Typography component="div">
              <Box display="flex" alignItems="center">
                {discount && discount?.enable === true ? (
                  <>
                    <span
                      style={{
                        textDecoration: 'line-through',
                        color: 'gray',
                        marginRight: '10px'
                      }}
                    >
                      ${formatPrice(originalPrice)}
                    </span>
                    <span className="price" style={{ color: 'green', marginRight: '6px' }}>
                      ${formatPrice(discountedPrice)}
                      <span style={{ fontSize: '0.7rem' }}>/Seats</span>
                    </span>
                  </>
                ) : (
                  <span className="price" style={{ marginRight: '8px' }}>
                    ${formatPrice(originalPrice)}
                    <span style={{ fontSize: '0.7rem' }}>/Seats</span>
                  </span>
                )}
                {discount && discount?.enable && (
                  <Chip
                    variant="combined"
                    color={color}
                    label={
                      <Typography variant="h6" color="error">
                        {discount?.percentage}% off
                      </Typography>
                    }
                    sx={{ p: 1, borderRadius: 1 }}
                    size="small"
                  />
                )}
              </Box>
            </Typography>
            {discount && discount?.enable && (
              <Button variant="outlined" color="primary" size="small" onClick={handleUpdateClick} sx={{ mt: 1 }}>
                Update Discount
              </Button>
            )}
          </Grid>
        </Grid>
      </Stack>
    </MainCard>
  );
}

AnalyticEcommerce.propTypes = {
  color: PropTypes.string,
  item: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  discount: PropTypes.object.isRequired,
  onUpdateDiscount: PropTypes.func.isRequired
};
