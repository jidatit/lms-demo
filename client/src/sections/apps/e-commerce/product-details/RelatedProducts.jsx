import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import ListItem from '@mui/material/ListItem';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';

// project-imports
import Avatar from 'components/@extended/Avatar';
import SimpleBar from 'components/third-party/SimpleBar';
import IconButton from 'components/@extended/IconButton';

import { openSnackbar } from 'api/snackbar';
import { ImagePath, getImageUrl } from 'utils/getImageUrl';

// assets
import { Heart, Hospital, Windows } from 'iconsax-react';
import courseicon from '../../../../assets/images/e-commerce/course.png';
import axiosInstance from 'utils/axiosConfig';
import { useBundles } from 'api/queries/bundles';

function ListProduct({ product, id, discounts }) {
  // const discount = discounts.find((d) => d.resource_Id === product.id && d.enable === 'true');
  const discount = discounts[0];

  const getOriginalPrice = () => parseFloat(product.seatPrice) || 0;

  const originalPrice = getOriginalPrice();

  console.log('op', originalPrice);
  const offerPrice = discount ? originalPrice * (1 - (parseFloat(discount.percentage) || 0) / 100) : originalPrice;

  const theme = useTheme();
  const history = useNavigate();

  const [wishlisted, setWishlisted] = useState(false);
  const addToFavourite = () => {
    setWishlisted(!wishlisted);
    openSnackbar({
      open: true,
      message: 'Added to favourites',
      variant: 'alert',
      alert: { color: 'success' }
    });
  };

  const linkHandler = (id) => {
    history(`/dashboard/view_bundles?id=${id}&admin=true`);
    window.location.reload();
  };

  if (product.id === id) {
    return null;
  }

  return (
    <ListItemButton divider onClick={() => linkHandler(product.id)}>
      <ListItemAvatar>
        <Avatar
          alt="Avatar"
          size="xl"
          color="secondary"
          variant="rounded"
          type="combined"
          src={courseicon}
          sx={{ borderColor: theme.palette.divider, mr: 1.15 }}
        />
      </ListItemAvatar>
      <ListItemText
        disableTypography
        primary={<Typography variant="subtitle1">{product.name}</Typography>}
        secondary={
          <Stack spacing={1}>
            <Typography
              color="text.secondary"
              sx={{ display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}
            >
              {product.description}
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="h5">{product.offerPrice ? `$${product.seatPrice}` : `$${offerPrice}`}</Typography>
                {offerPrice && discount && (
                  <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    ${product.seatPrice}
                  </Typography>
                )}
              </Stack>
              {/* <Rating name="simple-controlled" value={product.rating < 4 ? product.rating + 1 : product.rating} readOnly precision={0.1} /> */}
            </Stack>
          </Stack>
        }
        sx={{ mt: 0 }}
      />
    </ListItemButton>
  );
}

// ==============================|| PRODUCT DETAILS - RELATED PRODUCTS ||============================== //

export default function RelatedProducts({ id, discounts, category }) {
  const [related, setRelated] = useState([]);
  const [loader, setLoader] = useState(true);
  const { data: bundles, refetch: refechBundles } = useBundles({ category });

  const navigate = useNavigate();

  // const getAllBundles = async () => {
  //   try {
  //     const result = await axiosInstance.get('/courses/allbundles');
  //     const bundles = result.data.data;
  //     setRelated(bundles);
  //     setLoader(false);
  //   } catch (error) {
  //     setLoader(false);
  //     console.log(error);
  //   }
  // };

  useEffect(() => {
    if (bundles && bundles?.data) setRelated(bundles?.data);
    setLoader(false);
  }, [bundles]);

  let productResult = (
    <List>
      {[1, 2, 3].map((index) => (
        <ListItem key={index}>
          <ListItemAvatar sx={{ minWidth: 72 }}>
            <Skeleton variant="rectangular" width={62} height={62} />
          </ListItemAvatar>
          <ListItemText
            primary={<Skeleton animation="wave" height={22} />}
            secondary={
              <>
                <Skeleton animation="wave" height={14} width="60%" />
                <Skeleton animation="wave" height={18} width="20%" />
                <Skeleton animation="wave" height={14} width="35%" />
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );

  if (related && !loader) {
    productResult = (
      <List
        component="nav"
        sx={{
          '& .MuiListItemButton-root': {
            borderRadius: 0,
            my: 0,
            px: 3,
            py: 2,
            alignItems: 'flex-start',
            '& .MuiListItemSecondaryAction-root': {
              alignSelf: 'flex-start',
              ml: 1,
              position: 'relative',
              right: 'auto',
              top: 'auto',
              transform: 'none'
            },
            '& .MuiListItemAvatar-root': { mr: '7px', mt: 0.75 }
          },
          p: 0
        }}
      >
        {related.map((product, index) => (
          <ListProduct key={index} product={product} discounts={discounts} id={id} />
        ))}
      </List>
    );
  }

  return (
    <SimpleBar sx={{ height: { xs: '100%', md: 'calc(100% - 62px)' } }}>
      <Grid item>
        <Stack>
          {productResult}
          <Button
            color="secondary"
            variant="outlined"
            sx={{ mx: 2, my: 4, textTransform: 'none' }}
            onClick={() => navigate('/dashboard/buy_new_license')}
          >
            View all Products
          </Button>
        </Stack>
      </Grid>
    </SimpleBar>
  );
}

ListProduct.propTypes = { product: PropTypes.any };

RelatedProducts.propTypes = { id: PropTypes.string };
