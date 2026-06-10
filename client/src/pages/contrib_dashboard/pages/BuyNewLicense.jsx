// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// // import { BundleCard } from '../components/BundleCard';
// import { Alert, Box, Chip, CircularProgress, Grid, Tab, Tabs, Typography } from '@mui/material'; // Assuming you're using MUI
// // import { School as SchoolIcon, Collections as CollectionsIcon } from '@mui/icons-material';
// // import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
// // import { Loader } from '../../utils/Loader';
// import { FaCartPlus, FaSchool } from 'react-icons/fa';
// // import Heading from '../../components/ui';
// import courseicon from '../../../assets/images/e-commerce/course.png';
// import axiosInstance from 'utils/axiosConfig';
// import { styled, useTheme } from '@mui/material/styles';

// import { MdCollections, MdSchool } from 'react-icons/md';
// import ProductCard from 'components/cards/e-commerce/ProductCard';
// import ProductFilterDrawer from 'sections/apps/e-commerce/products/ProductFilterDrawer';
// import useConfig from 'hooks/useConfig';
// import ProductsHeader from 'sections/apps/e-commerce/products/ProductsHeader';
// import ProductPlaceholder from 'components/cards/skeleton/ProductPlaceholder';
// import { useBundles } from 'api/queries/bundles';

// const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'container' })(({ theme, open, container }) => ({
//   flexGrow: 1,
//   transition: theme.transitions.create('margin', {
//     easing: theme.transitions.easing.sharp,
//     duration: theme.transitions.duration.shorter
//   }),
//   marginLeft: -320,
//   ...(container && {
//     [theme.breakpoints.only('lg')]: {
//       marginLeft: !open ? -240 : 0
//     }
//   }),
//   [theme.breakpoints.down('lg')]: {
//     paddingLeft: 0,
//     marginLeft: 0
//   },
//   ...(open && {
//     transition: theme.transitions.create('margin', {
//       easing: theme.transitions.easing.easeOut,
//       duration: theme.transitions.duration.shorter
//     }),
//     marginLeft: 0
//   })
// }));

// const BuyNewLicense = () => {
//   const theme = useTheme();
//   const [categories, setCategories] = useState([]);
//   const [coursesData, setCoursesData] = useState([]);
//   const [bundlesData, setBundlesData] = useState([]);
//   const [courseDiscounts, setCourseDiscounts] = useState([]);
//   const [bundleDiscounts, setBundleDiscounts] = useState([]);
//   const [reRender, SetRerender] = useState(1);

//   const { data: bundles, refetch: refechBundles, isLoading: bundlesLoading } = useBundles({});

//   const handleReRender = () => {
//     SetRerender((ren) => ren + 1);
//   };

//   // filter
//   const initialState = {
//     search: '',
//     categories: ['all']
//   };

//   const [filter, setFilter] = useState(initialState);

//   const [isLoading, setLoading] = useState(true);

//   const [openFilterDrawer, setOpenFilterDrawer] = useState(true);
//   const handleDrawerOpen = () => {
//     setOpenFilterDrawer((prevState) => !prevState);
//   };
//   const { container } = useConfig();

//   const getDiscounts = async () => {
//     try {
//       const result = await axiosInstance.get('/discounts/get'); // Adjust endpoint as necessary
//       const discounts = result.data.data;

//       // Separate discounts based on resource type
//       const courses = discounts.filter((d) => d.resource_type === 'course');
//       const bundles = discounts.filter((d) => d.resource_type === 'bundle');

//       setCourseDiscounts(courses);
//       setBundleDiscounts(bundles);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     if (bundles?.data) {
//       setBundlesData(bundles?.data);
//       const uniqueCategories = [
//         ...new Set(
//           bundles.data.map((bundle) => {
//             return bundle.category;
//           })
//         )
//       ];

//       setCategories(uniqueCategories);
//       setLoading(false);
//     }
//   }, [bundles, reRender]);

//   let productResult = <></>;

//   let filteredBundlesData = [...bundlesData];

//   // Apply category filter
//   if (!filter.categories.includes('all') && filter.categories.length > 0) {
//     filteredBundlesData = filteredBundlesData.filter((product) => filter.categories.includes(product?.category));
//   }

//   // Apply search filter
//   if (filter.search.trim()) {
//     filteredBundlesData = filteredBundlesData.filter((product) => product.title.toLowerCase().includes(filter.search.trim().toLowerCase()));
//   }

//   // Generate Product Cards
//   productResult =
//     filteredBundlesData.length > 0 && !bundlesLoading ? (
//       filteredBundlesData.map((product, index) => (
//         <Grid key={index} item xs={12} sm={6} md={4}>
//           <ProductCard
//             id={product.id}
//             image={courseicon}
//             name={product.title}
//             offer={'30%'}
//             isStock={true}
//             description={product.description}
//             salePrice={product.seatPrice}
//             open={true}
//             discounts={bundleDiscounts}
//             to={`/contrib_dashboard/view_bundles?id=${product.id}&admin=true`}
//             CartRoute={`/contrib_dashboard/mybundlecart?bundleId=${product.id}`}
//             handleReRender={handleReRender}
//           />
//         </Grid>
//       ))
//     ) : (
//       <Grid item xs={12} sx={{ mt: 3 }}>
//         No Product
//       </Grid>
//     );
//   return (
//     <>
//       <Box sx={{ display: 'flex' }}>
//         <ProductFilterDrawer
//           filter={filter}
//           setFilter={setFilter}
//           openFilterDrawer={openFilterDrawer}
//           handleDrawerOpen={handleDrawerOpen}
//           setLoading={setLoading}
//           initialState={initialState}
//           categories={categories}
//         />
//         <Main theme={theme} open={openFilterDrawer} container={container}>
//           <Grid container spacing={2.5}>
//             <Grid item xs={12}>
//               <ProductsHeader filter={filter} handleDrawerOpen={handleDrawerOpen} setFilter={setFilter} />
//             </Grid>
//             <Grid item xs={12}>
//               <Grid container spacing={3}>
//                 {false
//                   ? [1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
//                       <Grid key={item} item xs={12} sm={6} md={4} lg={4}>
//                         <ProductPlaceholder />
//                       </Grid>
//                     ))
//                   : productResult}
//               </Grid>
//             </Grid>
//           </Grid>
//         </Main>
//         {/* <FloatingCart /> */}
//       </Box>
//     </>
//   );
// };

// export default BuyNewLicense;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { BundleCard } from '../components/BundleCard';
import { Alert, Box, Chip, CircularProgress, Grid, Tab, Tabs, Typography } from '@mui/material'; // Assuming you're using MUI
// import { School as SchoolIcon, Collections as CollectionsIcon } from '@mui/icons-material';
// import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
// import { Loader } from '../../utils/Loader';
import { FaCartPlus, FaSchool } from 'react-icons/fa';
// import Heading from '../../components/ui';
import courseicon from '../../../assets/images/e-commerce/course.png';
import axiosInstance from 'utils/axiosConfig';
import { styled, useTheme } from '@mui/material/styles';

import { MdCollections, MdOutlineInventory2, MdSchool } from 'react-icons/md';
import ProductCard from 'components/cards/e-commerce/ProductCard';
import ProductFilterDrawer from 'sections/apps/e-commerce/products/ProductFilterDrawer';
import useConfig from 'hooks/useConfig';
import ProductsHeader from 'sections/apps/e-commerce/products/ProductsHeader';
import ProductPlaceholder from 'components/cards/skeleton/ProductPlaceholder';
import { useBundles } from 'api/queries/bundles';

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'container' })(({ theme, open, container }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.shorter
  }),
  marginLeft: -320,
  ...(container && {
    [theme.breakpoints.only('lg')]: {
      marginLeft: !open ? -240 : 0
    }
  }),
  [theme.breakpoints.down('lg')]: {
    paddingLeft: 0,
    marginLeft: 0
  },
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.shorter
    }),
    marginLeft: 0
  })
}));

const BuyNewLicense = () => {
  const theme = useTheme();
  const [categories, setCategories] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [bundlesData, setBundlesData] = useState([]);
  const [courseDiscounts, setCourseDiscounts] = useState([]);
  const [bundleDiscounts, setBundleDiscounts] = useState([]);
  const [reRender, SetRerender] = useState(1);

  const { data: bundles, refetch: refechBundles, isLoading: bundlesLoading } = useBundles({});

  const handleReRender = () => {
    SetRerender((ren) => ren + 1);
  };

  // filter
  const initialState = {
    search: '',
    categories: ['all']
  };

  const [filter, setFilter] = useState(initialState);

  const [isLoading, setLoading] = useState(true);

  const [openFilterDrawer, setOpenFilterDrawer] = useState(true);
  const handleDrawerOpen = () => {
    setOpenFilterDrawer((prevState) => !prevState);
  };
  const { container } = useConfig();

  const getDiscounts = async () => {
    try {
      const result = await axiosInstance.get('/discounts/get'); // Adjust endpoint as necessary
      const discounts = result.data.data;

      // Separate discounts based on resource type
      const courses = discounts.filter((d) => d.resource_type === 'course');
      const bundles = discounts.filter((d) => d.resource_type === 'bundle');

      setCourseDiscounts(courses);
      setBundleDiscounts(bundles);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (bundles?.data) {
      setBundlesData(bundles?.data);
      const uniqueCategories = [
        ...new Set(
          bundles.data.map((bundle) => {
            return bundle.category;
          })
        )
      ];

      setCategories(uniqueCategories);
      setLoading(false);
    }
  }, [bundles, reRender]);

  let productResult = <></>;

  let filteredBundlesData = [...bundlesData];

  // Apply category filter
  if (!filter.categories.includes('all') && filter.categories.length > 0) {
    filteredBundlesData = filteredBundlesData.filter((product) => filter.categories.includes(product?.category));
  }

  // Apply search filter
  if (filter.search.trim()) {
    filteredBundlesData = filteredBundlesData.filter((product) => product.title.toLowerCase().includes(filter.search.trim().toLowerCase()));
  }

  // Generate Product Cards
  productResult =
    filteredBundlesData.length > 0 && !bundlesLoading ? (
      filteredBundlesData.map((product, index) => (
        <Grid key={index} item xs={12} sm={6} md={4}>
          <ProductCard
            id={product.id}
            image={courseicon}
            name={product.title}
            offer={'30%'}
            isStock={true}
            description={product.description}
            salePrice={product.seatPrice}
            open={true}
            discounts={product.discounts}
            to={`/contrib_dashboard/view_bundles?id=${product.id}&admin=true`}
            CartRoute={`/contrib_dashboard/mybundlecart?bundleId=${product.id}`}
            handleReRender={handleReRender}
          />
        </Grid>
      ))
    ) : (
      <Grid item xs={12} sx={{ mt: 3 }}>
        {bundlesLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px', // 👈 set a height so loader can center
              width: '100%'
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              bgcolor: 'background.paper',
              borderRadius: 2,
              p: 3,
              textAlign: 'center'
            }}
          >
            <MdOutlineInventory2 size={48} color={theme.palette.text.secondary} />
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
              No Products Available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {filter.search.trim() || !filter.categories.includes('all')
                ? 'Try adjusting your filters or search terms to find products.'
                : 'No products are currently available. Check back later!'}
            </Typography>
            {(filter.search.trim() || !filter.categories.includes('all')) && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setFilter(initialState)}
                sx={{ mt: 1 }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        )}
      </Grid>
    );
  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <ProductFilterDrawer
          filter={filter}
          setFilter={setFilter}
          openFilterDrawer={openFilterDrawer}
          handleDrawerOpen={handleDrawerOpen}
          setLoading={setLoading}
          initialState={initialState}
          categories={categories}
        />
        <Main theme={theme} open={openFilterDrawer} container={container}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <ProductsHeader filter={filter} handleDrawerOpen={handleDrawerOpen} setFilter={setFilter} />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={3}>
                {false
                  ? [1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                    <Grid key={item} item xs={12} sm={6} md={4} lg={4}>
                      <ProductPlaceholder />
                    </Grid>
                  ))
                  : productResult}
              </Grid>
            </Grid>
          </Grid>
        </Main>
        {/* <FloatingCart /> */}
      </Box>
    </>
  );
};

export default BuyNewLicense;
