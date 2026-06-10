import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';
// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Divider from '@mui/material/Divider';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import SkeletonProductPlaceholder from 'components/cards/skeleton/ProductPlaceholder';

// import { useGetCart, addToCart } from 'api/cart';

import { openSnackbar } from 'api/snackbar';
// import { ImagePath, getImageUrl } from 'utils/getImageUrl';

// assets
import { Heart } from 'iconsax-react';
import { toast } from 'utils/toast';
import { useAuth } from 'contexts/AuthContext';

// ==============================|| PRODUCT CARD ||============================== //

const ENCRYPTION_KEY = 'my_$uper_$ecret_KEY-to-d-crypt';
export default function ProductCard({ id, name, offer, isStock, image, description, discounts, salePrice, to, CartRoute, handleReRender }) {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const [cartItem, setCartItem] = useState(false);

  useEffect(() => {
    const storedCartItem = localStorage.getItem('cartItemId');
    if (storedCartItem) {
      try {
        // Decrypt the data
        const bytes = CryptoJS.AES.decrypt(storedCartItem, ENCRYPTION_KEY);
        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        setCartItem(decryptedData);

        if (decryptedData.userId === currentUser.id && decryptedData.id === id) {
          setCartItem(true);
        } else {
          setCartItem(false);
        }
      } catch (error) {
        console.error('Failed to decrypt cartItemId:', error);
      }
    }
  }, [id, currentUser, handleReRender]);

  // const discount = discounts.find((d) => d.resource_Id === id && d.enable === 'true');//
  const discount = discounts[0];

  const getOriginalPrice = () => parseFloat(salePrice) || 0;
  const originalPrice = getOriginalPrice();
  const offerPrice = discount ? originalPrice * (1 - (parseFloat(discount.percentage) || 0) / 100) : originalPrice;

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return <SkeletonProductPlaceholder />;

  return (
    <Link
      //  to={`/dashboard/view_bundles?id=${id}&admin=true`}
      to={to}
      style={{ textDecoration: 'none' }}
    >
      <MainCard
        content={false}
        sx={{
          '&:hover': {
            transform: 'scale3d(1.02, 1.02, 1)',
            transition: 'all .4s ease-in-out'
          }
        }}
      >
        <Box sx={{ width: '100%', m: 'auto' }}>
          <CardMedia sx={{ height: 250, objectFit: 'cover' }} image={image} component={Link} to={to} />
        </Box>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: '100%', position: 'absolute', top: 0, pt: 1.75, pl: 2, pr: 1 }}
        >
          {discount && <Chip label={`${discount.percentage}% OFF`} variant="combined" color="success" size="small" />}
        </Stack>
        <Divider />
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Stack>
                <Typography
                  // component={Link}
                  color="text.primary"
                  variant="h5"
                  sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', textDecoration: 'none' }}
                >
                  {name}
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    overflow: 'hidden',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                    lineHeight: 1.5,
                    height: 'calc(1.5em * 2)'
                  }}
                >
                  {description}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="nowrap">
                <Stack direction="row" spacing={1} alignItems="center" flexGrow={1} minWidth={0}>
                  <Typography variant="h5">${discount ? offerPrice.toFixed(2) : salePrice}</Typography>
                  {discount && salePrice && (
                    <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                      ${salePrice}
                    </Typography>
                  )}
                </Stack>

                <Button
                  variant="contained"
                  component={Link}
                  onClick={() => {
                    const cartItemLocal = { id: id, user: currentUser.role, userId: currentUser.id };
                    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(cartItemLocal), ENCRYPTION_KEY).toString();
                    localStorage.setItem('cartItemId', encryptedData);
                    handleReRender();
                    toast({ message: 'Added to cart', type: 'success' });
                  }}
                  disabled={!isStock || cartItem}
                  sx={{ minWidth: 120 }} // Prevents button from shrinking
                >
                  {!isStock ? 'Sold Out' : 'Add to Cart'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </MainCard>
    </Link>
  );
}

ProductCard.propTypes = {
  id: PropTypes.any,
  color: PropTypes.any,
  name: PropTypes.any,
  brand: PropTypes.any,
  offer: PropTypes.any,
  isStock: PropTypes.any,
  image: PropTypes.any,
  description: PropTypes.any,
  offerPrice: PropTypes.any,
  salePrice: PropTypes.any,
  rating: PropTypes.any
};
