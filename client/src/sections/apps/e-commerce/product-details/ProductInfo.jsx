import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';

// third-party
// import { useFormik, Form, FormikProvider } from 'formik';
// import * as yup from 'yup';

// project-imports
import ColorOptions from '../products/ColorOptions';
import Avatar from 'components/@extended/Avatar';
import CryptoJS from 'crypto-js';
import { ThemeMode } from 'config';

// assets
import { Add, Edit, Minus, ShopAdd, ShoppingCart } from 'iconsax-react';
import { IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import CreateBundleDialog from 'pages/dashboard/components/CreateBundleDialog';
import { useAuth } from 'contexts/AuthContext';

// product color select
function getColor(color) {
  return ColorOptions.filter((item) => item.value === color);
}

// const validationSchema = yup.object({
//   color: yup.string().required('Color selection is required')
// });

// ==============================|| COLORS OPTION ||============================== //

function Colors({ checked, colorsData }) {
  const theme = useTheme();
  return (
    <Grid item>
      <Tooltip title={colorsData.length && colorsData[0] && colorsData[0].label ? colorsData[0].label : ''}>
        <ButtonBase
          sx={{ borderRadius: '50%', '&:focus-visible': { outline: `2px solid ${theme.palette.secondary.dark}`, outlineOffset: 2 } }}
        >
          <Avatar
            color="inherit"
            size="sm"
            sx={{
              bgcolor: colorsData[0]?.bg,
              color: theme.palette.mode === ThemeMode.DARK ? 'secondary.800' : 'secondary.lighter',
              border: '3px solid',
              borderColor: checked ? theme.palette.secondary.light : theme.palette.background.paper
            }}
          >
            {' '}
          </Avatar>
        </ButtonBase>
      </Tooltip>
    </Grid>
  );
}
const ENCRYPTION_KEY = 'my_$uper_$ecret_KEY-to-d-crypt';

// ==============================|| PRODUCT DETAILS - INFORMATION ||============================== //

export default function ProductInfo({ product, discounts, onSave, admin, coursesData, fetchBundleAndCourseDetails }) {
  const [cartItem, setCartItem] = useState(null);
  const { currentUser } = useAuth();
  const url = currentUser && currentUser.role === 'admin' ? '/dashboard/' : '/contrib_dashboard/';
  const [isModalOpen, setModalOpen] = useState(false);
  const [tempDetails, setTempDetails] = useState({
    title: product.name,
    description: product.description,
    seatprice: product.seatPrice
  });
  useEffect(() => {
    const storedCartItem = localStorage.getItem('cartItemId');

    if (storedCartItem) {
      let foundBundleId = null;
      // Decrypt the stored cart item
      const bytes = CryptoJS.AES.decrypt(storedCartItem, ENCRYPTION_KEY);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      if (decryptedData && decryptedData.userId === currentUser.id) {
        foundBundleId = decryptedData.id;
      }

      if (decryptedData?.id === product.id) {
        setCartItem(true);
      }
      console.log('Fetched cart item from localStorage:', foundBundleId);
    }
  }, []);

  // const discount = discounts.find((d) => d.resource_Id === product.bundleId && d.enable === 'true');
  const discount = discounts[0] || null;
  // console.log('disco', discount);

  const getOriginalPrice = () => parseFloat(product.seatPrice) || 0;

  const originalPrice = getOriginalPrice();
  // console.log('op', originalPrice);
  // console.log('discount.percentage', discount.percentage);

  const offerPrice = discount ? originalPrice * (1 - (parseFloat(discount?.percentage) || 0) / 100) : originalPrice;
  // console.log('offerPrice', offerPrice);
  const handleCloseBundleModal = () => {
    setModalOpen(false);
  };
  const handleCreateCourseBundle = () => {};
  return (
    <Stack
      spacing={1}
      sx={{
        position: 'relative'
      }}
    >
      {admin ? (
        <IconButton
          variant="contained"
          color="primary"
          onClick={(e) => {
            setModalOpen(!isModalOpen);
          }}
          sx={{
            position: 'absolute',
            // top: '12px',
            right: '12px'
          }}
        >
          <Edit />
        </IconButton>
      ) : null}

      <Typography variant="h3">{product.title}</Typography>
      <Chip
        size="small"
        label={'bundle'}
        sx={{
          width: 'fit-content',
          borderRadius: '4px',
          color: 'success.main',
          bgcolor: 'success.lighter'
        }}
      />
      <Typography color="text.secondary">{product.description}</Typography>
      <Grid container>
        <Grid item xs={12}>
          <Stack direction="row" alignItems="left" spacing={1}>
            <Typography variant="h3">${discount && offerPrice ? offerPrice.toFixed(2) : product.seatPrice}</Typography>
            {discount && offerPrice && (
              <Typography variant="h4" color="text.secondary" sx={{ textDecoration: 'line-through', opacity: 0.5, fontWeight: 400 }}>
                ${product.seatPrice}
              </Typography>
            )}
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" alignItems="left" spacing={2} sx={{ mt: 2 }}>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              size="large"
              startIcon={<ShoppingCart />}
              component={Link}
              disabled={cartItem}
              to={`${url}mybundlecart?bundleId=${product.id}`}
            >
              {'Buy Now'}
            </Button>
          </Stack>
        </Grid>
      </Grid>
      <CreateBundleDialog
        open={isModalOpen}
        onClose={handleCloseBundleModal}
        coursesData={coursesData}
        handleCreateCourseBundle={handleCreateCourseBundle}
        update={true}
        bundleData={product}
        fetchBundleAndCourseDetails={fetchBundleAndCourseDetails}
      />
    </Stack>
  );
}

Colors.propTypes = { checked: PropTypes.bool, colorsData: PropTypes.array };

ProductInfo.propTypes = { product: PropTypes.any };
