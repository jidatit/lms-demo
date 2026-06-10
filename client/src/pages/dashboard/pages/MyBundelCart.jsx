// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import CryptoJS from 'crypto-js';
// import { Box, Chip, Table, Grid, Paper, styled, Divider, Typography, Button, TextField, IconButton } from '@mui/material';
// import { FaCheckCircle, FaInfoCircle, FaPercentage, FaUsers } from 'react-icons/fa';
// import { CiDiscount1 } from 'react-icons/ci';
// import axiosInstance from 'utils/axiosConfig';
// import { useAuth } from 'contexts/AuthContext';
// import { Stack, useTheme } from '@mui/system';
// import TableRow from '@mui/material/TableRow';
// import TableBody from '@mui/material/TableBody';
// import TableCell from '@mui/material/TableCell';
// import MainCard from 'components/MainCard';
// import TableContainer from '@mui/material/TableContainer';
// import { Add, Minus, Trash } from 'iconsax-react';
// import AnalyticEcommerce from 'components/cards/statistics/DiscountCard';
// import CartEmpty from 'sections/apps/e-commerce/checkout/CartEmpty';
// import OrderSummary from 'sections/apps/e-commerce/checkout/OrderSummery';
// import { openSnackbar } from 'api/snackbar';
// import { toast } from 'utils/toast';
// import { useBundleById } from 'api/queries/bundles';
// import { useDiscounts } from 'api/queries/discounts';
// import { useCreateBundlePurchase } from 'api/queries/bundlepurchases';

// const ENCRYPTION_KEY = 'my_$uper_$ecret_KEY-to-d-crypt';

// const MyBundleCart = () => {
//   const [bundleId, setBundleId] = useState(null);
//   const [bundleDetails, setBundleDetails] = useState({});
//   const [coursesDetails, setCoursesDetails] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [discountDetails, setDiscountDetails] = useState(null);
//   const [subtotal, setSubtotal] = useState(0);
//   const [isCartEmpty, setIsCartEmpty] = useState(false);
//   const { currentUser } = useAuth();
//   const navigate = useNavigate();
//   const [seatDiscounts, setSeatDiscounts] = useState([]);
//   const [seatDiscount, setSeatDiscount] = useState(0);
//   const [appliedDiscount, setAppliedDiscount] = useState(null);
//   const [cartItem, setCartItem] = useState(localStorage.getItem('cartItemId'));
//   const { data: discountsData, refetch: fetchDiscounts } = useDiscounts();

//   const theme = useTheme();

//   const calculateSeatDiscount = () => {
//     const totalSeats = bundleDetails.quantity; // Directly access quantity

//     const applicableDiscount = seatDiscounts
//       .sort((a, b) => b?.seats?.seatsThreshold - a?.seats?.seatsThreshold) // Sort discounts in descending order of seats
//       .find((discount) => totalSeats >= discount?.seats?.seatsThreshold);

//     if (applicableDiscount) {
//       const discountAmount = (bundleDetails.subtotal * applicableDiscount.percentage) / 100;
//       setSeatDiscount(discountAmount);
//     } else {
//       setSeatDiscount(0);
//     }
//   };

//   useEffect(() => {
//     calculateSeatDiscount();
//   }, [bundleDetails]);
//   const totalSeats = bundleDetails.quantity;

//   useEffect(() => {
//     const calculateAppliedDiscount = () => {
//       const applicableDiscount = seatDiscounts
//         .sort((a, b) => b?.seats?.seatsThreshold - a?.seats?.seatsThreshold) // Sort by seats in descending order
//         .find((discount) => totalSeats >= discount?.seats?.seatsThreshold);

//       setAppliedDiscount(applicableDiscount || null);
//     };

//     calculateAppliedDiscount();
//   }, [seatDiscounts, totalSeats]);

//   useEffect(() => {
//     const bundleIdFromURL = new URLSearchParams(window.location.search).get('bundleId');
//     const storedCartItem = localStorage.getItem('cartItemId');
//     let foundBundleId = null;

//     if (bundleIdFromURL) {
//       // User is coming directly to buy
//       foundBundleId = bundleIdFromURL;
//     } else if (storedCartItem) {
//       try {
//         // Decrypt the stored cart item
//         const bytes = CryptoJS.AES.decrypt(storedCartItem, ENCRYPTION_KEY);
//         const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

//         if (decryptedData && decryptedData.userId === currentUser.id) {
//           foundBundleId = decryptedData.id;
//         }
//       } catch (error) {
//         console.error('Failed to decrypt cartItemId:', error);
//       }
//     }

//     if (foundBundleId) {
//       setBundleId(foundBundleId);
//     } else {
//       setIsCartEmpty(true);
//     }
//   }, [cartItem]);

//   const { data: bundleData, isLoading, isError } = useBundleById(bundleId);

//   useEffect(() => {
//     if (bundleData && bundleData?.success) {
//       const bundle = bundleData.data;
//       // setBundleDetails({
//       //   ...bundle,
//       //   quantity: 1,
//       //   subtotal: bundle.seatPrice
//       // });
//       const newSubtotal = applyDiscount(1 * bundle?.seatPrice, bundle?.discounts[0]?.percentage);

//       setBundleDetails({
//         ...bundle,
//         quantity: 1,
//         subtotal: newSubtotal || bundle.seatPrice
//       });
//       setSubtotal(Number(bundle?.seatPrice));
//       setDiscountDetails(bundle?.discounts[0]);

//       setCoursesDetails(bundle?.courses || []);
//       // if API returns courses
//     }
//   }, [bundleData]);

//   useEffect(() => {
//     // fetchDiscounts();
//     if (discountsData?.data) {
//       // const seatdiscounts = discountsData?.data.filter((discount) => discount.seats);
//       const seatDiscounts = discountsData?.data
//         .filter((discount) => discount.seats)
//         .map((discount) => ({
//           ...discount,
//           seats: (() => {
//             try {
//               return JSON.parse(discount.seats);
//             } catch (err) {
//               console.error('Invalid seats JSON:', discount.seats);
//               return null;
//             }
//           })()
//         }));

//       console.log('discountsData', seatDiscounts);
//       setSeatDiscounts(seatDiscounts);
//     }
//   }, [discountsData]);

//   // Fetch bundle and associated course details
//   const fetchBundleAndCourseDetails = async (bundleId) => {
//     try {
//       const bundleResponse = await axiosInstance.get(`/courses/bundles/${bundleId}`);
//       const bundleData = bundleResponse.data.data;
//       bundleData.quantity = 1;
//       bundleData.subtotal = bundleData.seatPrice;

//       setBundleDetails(bundleData);
//       setSubtotal(bundleData.subtotal);

//       const coursesResponse = await axiosInstance.get(`/courses/bundles_courses/${bundleId}`);
//       const courseIds = coursesResponse.data.course_ids;

//       // Fetch course details for each course ID
//       const courseDetailsResponses = await Promise.all(courseIds.map((id) => axiosInstance.get(`/courses/${id}`)));
//       const courses = courseDetailsResponses.map((response) => response.data.data);

//       setCoursesDetails(courses);

//       // Fetch any applicable discounts
//       fetchDiscountDetails(bundleId, bundleData);
//     } catch (error) {
//       console.error('Error fetching bundle and course details:', error);
//     }
//   };

//   // Fetch discount details and update bundle subtotal
//   const fetchDiscountDetails = async (bundleId, bundleData) => {
//     try {
//       const discountResponse = await axiosInstance.post('/discounts/getdiscount', {
//         resource_id: bundleId,
//         resource_type: 'bundle'
//       });

//       if (discountResponse.data.success) {
//         const discount = discountResponse.data.data;
//         setDiscountDetails(discount);

//         const discountedSubtotal = applyDiscount(bundleData.quantity * bundleData.seatPrice, discount.percentage);
//         bundleData.subtotal = discountedSubtotal;

//         setBundleDetails(bundleData);
//         setSubtotal(discountedSubtotal);
//       }
//     } catch (error) {
//       console.error('Error fetching discount details:', error);
//     }
//   };

//   // Apply discount to subtotal if available
//   const applyDiscount = (subtotal, discountPercentage) => {
//     if (discountPercentage) {
//       const discountAmount = (subtotal * discountPercentage) / 100;
//       return subtotal - discountAmount;
//     }
//     return subtotal;
//   };

//   // Update the bundle quantity and recalculate the subtotal
//   const handleUpdateQuantity = (updatedQuantity) => {
//     const updatedBundle = { ...bundleDetails };
//     updatedBundle.quantity = updatedQuantity;

//     const newSubtotal = applyDiscount(updatedQuantity * updatedBundle.seatPrice, discountDetails?.percentage);
//     updatedBundle.subtotal = newSubtotal;

//     setBundleDetails(updatedBundle);
//     setSubtotal(newSubtotal);
//   };
//   const createBundlePurchase = useCreateBundlePurchase();
//   // Handle bundle purchase
//   const handlePurchase = async () => {
//     try {
//       const totalQuantity = bundleDetails.quantity;

//       if (totalQuantity > 0) {
//         const payload = {
//           bundleId: bundleId,
//           seatsPurchased: totalQuantity,
//           discountId: appliedDiscount ? appliedDiscount.id : bundleDetails.discounts?.[0]?.id || null
//         };
//         console.log('payload', payload);
//         const response = await createBundlePurchase.mutateAsync(payload);
//         console.log('response', response);
//         if (response?.success) {
//           openSnackbar({
//             open: true,
//             message: 'Purchase successful! Redirecting...',
//             variant: 'alert',
//             alert: {
//               color: 'success'
//             },
//             anchorOrigin: {
//               vertical: 'top',
//               horizontal: 'right'
//             }
//           });
//           localStorage.removeItem('cartItemId');
//           setTimeout(() => navigate('/dashboard/buy_new_license'), 3000);
//         }
//         // await axiosInstance.post(`/courses/purchase_bundle_seats/${bundleId}/${totalQuantity}`, { buyer: currentUser });
//         // toast.success('Purchase successful! Redirecting...');
//       } else {
//         // toast.error('No courses selected.');
//         openSnackbar({
//           open: true,
//           message: 'No courses selected.',
//           variant: 'alert',
//           alert: {
//             color: 'error'
//           },
//           anchorOrigin: {
//             vertical: 'top',
//             horizontal: 'right'
//           }
//         });
//       }
//     } catch (error) {
//       console.error('Error during purchase:', error.response?.data || error.message);
//     }
//   };

//   // const CourseRow = ({ item, discountDetails, handleUpdateQuantity, removeProduct, index }) => {
//   //   const handleIncrease = () => {
//   //     handleUpdateQuantity(item.quantity + 1, index);
//   //   };

//   //   const handleDecrease = () => {
//   //     if (item.quantity > 1) {
//   //       handleUpdateQuantity(item.quantity - 1, index);
//   //     }
//   //   };

//   //   const handleQuantityChange = (e) => {
//   //     const value = e.target.value;
//   //     // Validate to only allow numeric input
//   //     if (/^\d*$/.test(value)) {
//   //       const newQuantity = parseInt(value, 10) || 0;
//   //       handleUpdateQuantity(newQuantity, index);
//   //     }
//   //   };

//   //   return (
//   //     <TableRow key={index} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
//   //       {/* Course Title */}
//   //       <TableCell align="left">
//   //         <Typography variant="body1" fontWeight="bold">
//   //           {item.title}
//   //         </Typography>
//   //       </TableCell>

//   //       {/* Price with Discount */}
//   //       <TableCell align="center">
//   //         {discountDetails?.percentage ? (
//   //           <Typography>
//   //             <span style={{ textDecoration: 'line-through', color: 'red' }}>${item.seatPrice}</span>
//   //             <span style={{ color: 'green', marginLeft: 8 }}>${item.seatPrice - (item.seatPrice * discountDetails.percentage) / 100}</span>
//   //             / Seat
//   //           </Typography>
//   //         ) : (
//   //           <Typography>${item.seatPrice} / Seat</Typography>
//   //         )}
//   //       </TableCell>

//   //       <TableCell align="center">
//   //         <Stack direction="row">
//   //           <Button
//   //             key="three"
//   //             variant="text"
//   //             disabled={item.quantity <= 1}
//   //             onClick={handleDecrease}
//   //             sx={{ pr: 0.75, pl: 0.75, minWidth: '0px !important', '&:hover': { bgcolor: 'transparent' } }}
//   //           >
//   //             <Minus style={{ fontSize: 'inherit' }} />
//   //           </Button>
//   //           {/* <Typography key="two" sx={{ p: '9px 15px', border: '1px solid' }}>
//   //             {item.quantity}
//   //           </Typography> */}
//   //           <TextField
//   //             value={item.quantity}
//   //             onChange={handleQuantityChange}
//   //             size="small"
//   //             inputProps={{
//   //               style: { textAlign: 'center', width: 50 },
//   //               inputMode: 'numeric' // For numeric keyboards on mobile
//   //             }}
//   //           />
//   //           <Button
//   //             key="one"
//   //             variant="text"
//   //             onClick={handleIncrease}
//   //             sx={{ pl: 0.75, pr: 0.75, minWidth: '0px !important', '&:hover': { bgcolor: 'transparent' } }}
//   //           >
//   //             <Add style={{ fontSize: 'inherit' }} />
//   //           </Button>
//   //         </Stack>
//   //       </TableCell>

//   //       {/* Subtotal */}

//   //       {discountDetails?.percentage ? (
//   //         <TableCell align="right">
//   //           <Typography>
//   //             <span style={{ textDecoration: 'line-through', color: 'red' }}>${item.quantity * item.seatPrice}</span>
//   //             <span style={{ color: 'green', marginLeft: 8 }}>${item.subtotal}</span>
//   //           </Typography>
//   //         </TableCell>
//   //       ) : (
//   //         <TableCell align="right">
//   //           <Typography>${item.subtotal || 0}</Typography>
//   //         </TableCell>
//   //       )}
//   //       <TableCell align="right">
//   //         <IconButton
//   //           color="error"
//   //           onClick={() => {
//   //             const bundleIdFromURL = new URLSearchParams(window.location.search).get('bundleId');
//   //             if (bundleIdFromURL) {
//   //               navigate('/dashboard/buy_new_license');
//   //             }
//   //             setLoading(true);
//   //             localStorage.removeItem('cartItemId');
//   //             toast({
//   //               message: 'item removed from cart',
//   //               type: 'success'
//   //             });
//   //             setBundleDetails({});
//   //             setCartItem(null);

//   //             setLoading(false);
//   //           }}
//   //           size="small"
//   //           sx={{ opacity: 0.75, '&:hover': { bgcolor: 'transparent' } }}
//   //         >
//   //           <Trash variant="Bold" />
//   //         </IconButton>
//   //       </TableCell>
//   //     </TableRow>
//   //   );
//   // };

//   const CourseRow = ({ item, discountDetails, handleUpdateQuantity, removeProduct, index }) => {
//     const [inputValue, setInputValue] = useState(item?.quantity?.toString());

//     // Update local state when prop changes
//     useEffect(() => {
//       setInputValue(item?.quantity?.toString());
//     }, [item.quantity]);

//     const handleIncrease = () => {
//       handleUpdateQuantity(item.quantity + 1, index);
//     };

//     const handleDecrease = () => {
//       if (item.quantity > 1) {
//         handleUpdateQuantity(item.quantity - 1, index);
//       }
//     };

//     const handleQuantityChange = (e) => {
//       const value = e.target.value;
//       // Allow empty string or numeric values
//       if (value === '' || /^\d+$/.test(value)) {
//         setInputValue(value);
//       }
//     };

//     const handleQuantityBlur = () => {
//       // When input loses focus, validate and update the actual quantity
//       if (inputValue === '') {
//         // If empty, set to 1
//         setInputValue('1');
//         handleUpdateQuantity(1, index);
//       } else {
//         const newQuantity = parseInt(inputValue, 10);
//         if (newQuantity >= 1) {
//           handleUpdateQuantity(newQuantity, index);
//         } else {
//           // If invalid, reset to current quantity
//           setInputValue(item?.quantity?.toString());
//         }
//       }
//     };

//     return (
//       <TableRow key={index} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
//         {/* Course Title */}
//         <TableCell align="left">
//           <Typography variant="body1" fontWeight="bold">
//             {item.title}
//           </Typography>
//         </TableCell>

//         {/* Price with Discount */}
//         <TableCell align="center">
//           {discountDetails?.percentage ? (
//             <Typography>
//               <span style={{ textDecoration: 'line-through', color: 'red' }}>${item.seatPrice}</span>
//               <span style={{ color: 'green', marginLeft: 8 }}>${item.seatPrice - (item.seatPrice * discountDetails.percentage) / 100}</span>
//               / Seat
//             </Typography>
//           ) : (
//             <Typography>${item.seatPrice} / Seat</Typography>
//           )}
//         </TableCell>

//         <TableCell align="center">
//           <Stack direction="row">
//             <Button
//               key="three"
//               variant="text"
//               disabled={item.quantity <= 1}
//               onClick={handleDecrease}
//               sx={{ pr: 0.75, pl: 0.75, minWidth: '0px !important', '&:hover': { bgcolor: 'transparent' } }}
//             >
//               <Minus style={{ fontSize: 'inherit' }} />
//             </Button>
//             <TextField
//               value={inputValue}
//               onChange={handleQuantityChange}
//               onBlur={handleQuantityBlur}
//               size="small"
//               inputProps={{
//                 style: { textAlign: 'center', width: 50 },
//                 inputMode: 'numeric' // For numeric keyboards on mobile
//               }}
//             />
//             <Button
//               key="one"
//               variant="text"
//               onClick={handleIncrease}
//               sx={{ pl: 0.75, pr: 0.75, minWidth: '0px !important', '&:hover': { bgcolor: 'transparent' } }}
//             >
//               <Add style={{ fontSize: 'inherit' }} />
//             </Button>
//           </Stack>
//         </TableCell>

//         {/* Subtotal */}

//         {discountDetails?.percentage ? (
//           <TableCell align="right">
//             <Typography>
//               <span style={{ textDecoration: 'line-through', color: 'red' }}>${item.quantity * item.seatPrice}</span>
//               <span style={{ color: 'green', marginLeft: 8 }}>${item.subtotal}</span>
//             </Typography>
//           </TableCell>
//         ) : (
//           <TableCell align="right">
//             <Typography>${parseFloat(item.subtotal).toFixed(2) || 0}</Typography>
//           </TableCell>
//         )}
//         <TableCell align="right">
//           <IconButton
//             color="error"
//             onClick={() => {
//               const bundleIdFromURL = new URLSearchParams(window.location.search).get('bundleId');
//               if (bundleIdFromURL) {
//                 navigate('/dashboard/buy_new_license');
//               }
//               setLoading(true);
//               localStorage.removeItem('cartItemId');
//               toast({
//                 message: 'item removed from cart',
//                 type: 'success'
//               });
//               setBundleDetails({});
//               setCartItem(null);

//               setLoading(false);
//             }}
//             size="small"
//             sx={{ opacity: 0.75, '&:hover': { bgcolor: 'transparent' } }}
//           >
//             <Trash variant="Bold" />
//           </IconButton>
//         </TableCell>
//       </TableRow>
//     );
//   };

//   return (
//     <>
//       <Stack>
//         {seatDiscounts?.length > 0 && (
//           <MainCard
//             title={`Discount offers all year round!`}
//             sx={{
//               marginBottom: 3
//             }}
//           >
//             <Grid
//               sx={{
//                 display: 'flex',
//                 flexWrap: 'wrap',

//                 marginBottom: 3,
//                 padding: 1,
//                 gap: 2
//               }}
//             >
//               {seatDiscounts.map((discount) => {
//                 return (
//                   <AnalyticEcommerce
//                     seats={discount?.seats?.seatsThreshold}
//                     off={discount?.percentage}
//                     percentage="10"
//                     applied={appliedDiscount?.id === discount?.id}
//                   />
//                 );
//               })}
//             </Grid>
//           </MainCard>
//         )}

//         {isCartEmpty ? (
//           <CartEmpty />
//         ) : (
//           <Grid container spacing={3}>
//             <Grid item xs={12} md={8}>
//               <Stack spacing={2}>
//                 <MainCard content={false}>
//                   <Grid container>
//                     <Grid item xs={12} sx={{ py: 2.5, pl: 2.5 }}>
//                       <Stack direction="row" alignItems="center" spacing={1}>
//                         <Typography variant="subtitle1">Cart</Typography>
//                       </Stack>
//                     </Grid>
//                     <Grid item xs={12}>
//                       <Divider />
//                     </Grid>
//                     <Grid item xs={12}>
//                       <TableContainer>
//                         <Table sx={{ minWidth: 650 }} aria-label="simple table">
//                           <TableBody>
//                             {/* {bundleDetails.map((item, index) => ( */}
//                             <CourseRow
//                               key={'1'}
//                               item={bundleDetails}
//                               discountDetails={appliedDiscount ? null : bundleDetails?.discounts?.[0]}
//                               handleUpdateQuantity={handleUpdateQuantity}
//                               index={'1'}
//                             />
//                             {/* ))} */}
//                           </TableBody>
//                         </Table>
//                       </TableContainer>
//                     </Grid>
//                   </Grid>
//                 </MainCard>
//                 <MainCard title={`Courses in Bundle`}>
//                   {coursesDetails && coursesDetails?.length > 0 ? (
//                     <Grid
//                       sx={{
//                         display: 'flex',
//                         flexWrap: 'wrap',

//                         marginBottom: 3,
//                         padding: 1,
//                         gap: 2
//                       }}
//                     >
//                       {coursesDetails.map((item, index) => (
//                         <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '120px', maxWidth: '30%', width: '100%' }}>
//                           <Typography variant="h6">{item.title}</Typography>
//                           <Typography
//                             variant="caption"
//                             color="text.secondary"
//                             sx={{
//                               display: '-webkit-box',
//                               overflow: 'hidden',
//                               WebkitBoxOrient: 'vertical',
//                               WebkitLineClamp: 2
//                             }}
//                           >
//                             {item?.description?.length > 70 ? `${item.description.slice(0, 70)}...` : item.description}
//                           </Typography>
//                         </MainCard>
//                       ))}
//                     </Grid>
//                   ) : (
//                     <p className="text-gray-500 text-center">No courses available.</p>
//                   )}
//                 </MainCard>
//               </Stack>
//             </Grid>
//             <Grid item xs={12} md={4}>
//               <Stack spacing={3}>
//                 <OrderSummary subtotal={subtotal} vat={'N/A'} seatDiscount={seatDiscount} Total={subtotal - seatDiscount} />

//                 <Button
//                   variant="contained"
//                   sx={{ textTransform: 'none' }}
//                   fullWidth
//                   onClick={handlePurchase}
//                   disabled={createBundlePurchase.isPending}
//                 >
//                   {createBundlePurchase.isPending ? 'processing' : 'Process to Checkout'}
//                 </Button>
//               </Stack>
//             </Grid>
//           </Grid>
//         )}
//       </Stack>
//     </>
//   );
// };

// export default MyBundleCart;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { Box, Chip, Table, Grid, Paper, styled, Divider, Typography, Button, TextField, IconButton } from '@mui/material';
import { FaCheckCircle, FaInfoCircle, FaPercentage, FaUsers } from 'react-icons/fa';
import { CiDiscount1 } from 'react-icons/ci';
import axiosInstance from 'utils/axiosConfig';
import { useAuth } from 'contexts/AuthContext';
import { Stack, useTheme } from '@mui/system';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import MainCard from 'components/MainCard';
import TableContainer from '@mui/material/TableContainer';
import { Add, Minus, Trash } from 'iconsax-react';
import AnalyticEcommerce from 'components/cards/statistics/DiscountCard';
import CartEmpty from 'sections/apps/e-commerce/checkout/CartEmpty';
import OrderSummary from 'sections/apps/e-commerce/checkout/OrderSummery';
import { openSnackbar } from 'api/snackbar';
import { toast } from 'utils/toast';
import { useBundleById } from 'api/queries/bundles';
import { useDiscounts } from 'api/queries/discounts';
import { useCreateBundlePurchase } from 'api/queries/bundlepurchases';
import { useAdminProfile, useUserProfile } from 'api/queries/userProfile';

const ENCRYPTION_KEY = 'my_$uper_$ecret_KEY-to-d-crypt';
const fmt = (n) => Number(n || 0).toFixed(2);

const MyBundleCart = () => {
  const [bundleId, setBundleId] = useState(null);
  const [bundleDetails, setBundleDetails] = useState({});
  const [coursesDetails, setCoursesDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [discountDetails, setDiscountDetails] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [isCartEmpty, setIsCartEmpty] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [seatDiscounts, setSeatDiscounts] = useState([]);
  const [seatDiscount, setSeatDiscount] = useState(0);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [cartItem, setCartItem] = useState(localStorage.getItem('cartItemId'));
  const { data: discountsData, refetch: fetchDiscounts } = useDiscounts();

  //
  const { data, isLoading: isAdminProfileLoading, error } = useAdminProfile();
  const { data: profile, isLoading: isUserProfileLoading, error: isUserProfileError } = useUserProfile();


  const theme = useTheme();

  // Calculate which discount to apply - seat discount takes priority
  const calculateAppliedDiscount = () => {
    const totalSeats = bundleDetails.quantity;

    // Check if seat discount is applicable
    const applicableSeatDiscount = seatDiscounts
      .sort((a, b) => b?.seats?.seatsThreshold - a?.seats?.seatsThreshold)
      .find((discount) => totalSeats >= discount?.seats?.seatsThreshold);

    // If seat discount is applicable, use it; otherwise use bundle discount
    if (applicableSeatDiscount) {
      setAppliedDiscount(applicableSeatDiscount);
    } else if (bundleDetails.discounts?.[0]) {
      setAppliedDiscount(bundleDetails.discounts[0]);
    } else {
      setAppliedDiscount(null);
    }
  };

  // Calculate subtotal with the appropriate discount (only one discount applied)
  const calculateSubtotal = () => {
    if (!bundleDetails.quantity || !bundleDetails.seatPrice) return 0;

    const baseSubtotal = bundleDetails.quantity * bundleDetails.seatPrice;

    if (appliedDiscount) {
      const discountAmount = (baseSubtotal * appliedDiscount.percentage) / 100;
      return baseSubtotal - discountAmount;
    }

    return baseSubtotal;
  };

  // Calculate seat discount amount for display
  const calculateSeatDiscountAmount = () => {
    if (!appliedDiscount || !bundleDetails.quantity || !bundleDetails.seatPrice) return 0;

    const baseSubtotal = bundleDetails.quantity * bundleDetails.seatPrice;

    // Only return seat discount amount if seat discount is applied
    const applicableSeatDiscount = seatDiscounts
      .sort((a, b) => b?.seats?.seatsThreshold - a?.seats?.seatsThreshold)
      .find((discount) => bundleDetails.quantity >= discount?.seats?.seatsThreshold);

    if (applicableSeatDiscount && appliedDiscount.id === applicableSeatDiscount.id) {
      return (baseSubtotal * appliedDiscount.percentage) / 100;
    }

    return 0;
  };

  useEffect(() => {
    calculateAppliedDiscount();
  }, [seatDiscounts, bundleDetails.quantity, bundleDetails.discounts]);

  useEffect(() => {
    const newSubtotal = calculateSubtotal();
    setSubtotal(newSubtotal);

    const discountAmount = calculateSeatDiscountAmount();
    setSeatDiscount(discountAmount);
  }, [appliedDiscount, bundleDetails.quantity, bundleDetails.seatPrice]);

  const totalSeats = bundleDetails.quantity;

  useEffect(() => {
    const bundleIdFromURL = new URLSearchParams(window.location.search).get('bundleId');
    const storedCartItem = localStorage.getItem('cartItemId');
    let foundBundleId = null;

    if (bundleIdFromURL) {
      foundBundleId = bundleIdFromURL;
    } else if (storedCartItem) {
      try {
        const bytes = CryptoJS.AES.decrypt(storedCartItem, ENCRYPTION_KEY);
        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        if (decryptedData && decryptedData.userId === currentUser.id) {
          foundBundleId = decryptedData.id;
        }
      } catch (error) {
        console.error('Failed to decrypt cartItemId:', error);
      }
    }

    if (foundBundleId) {
      setBundleId(foundBundleId);
    } else {
      setIsCartEmpty(true);
    }
  }, [cartItem]);

  const { data: bundleData, isLoading, isError } = useBundleById(bundleId);

  useEffect(() => {
    if (bundleData && bundleData?.success) {
      const bundle = bundleData.data;

      setBundleDetails({
        ...bundle,
        quantity: 1,
        seatPrice: bundle.seatPrice
      });

      setCoursesDetails(bundle?.courses || []);
    }
  }, [bundleData]);

  useEffect(() => {
    if (discountsData?.data) {
      const seatDiscounts = discountsData?.data
        .filter((discount) => discount.seats)
        .map((discount) => ({
          ...discount,
          seats: (() => {
            try {
              return JSON.parse(discount.seats);
            } catch (err) {
              console.error('Invalid seats JSON:', discount.seats);
              return null;
            }
          })()
        }));

      setSeatDiscounts(seatDiscounts);
    }
  }, [discountsData]);

  // Update the bundle quantity
  const handleUpdateQuantity = (updatedQuantity) => {
    const updatedBundle = { ...bundleDetails };
    updatedBundle.quantity = updatedQuantity;
    setBundleDetails(updatedBundle);
  };

  const handlePurchase = async () => {
    const totalQuantity = bundleDetails.quantity;

    // Calculate pricing based on applied discount
    const baseSubtotal = bundleDetails.quantity * bundleDetails.seatPrice;
    const discountAmount = appliedDiscount ? (baseSubtotal * appliedDiscount.percentage) / 100 : 0;
    const finalTotal = baseSubtotal - discountAmount;

    // Determine which discount ID to use
    let discountId = null;
    if (appliedDiscount) {
      discountId = appliedDiscount.id;
    }

    navigate('/dashboard/checkout', {
      state: {
        bundleId: bundleId,
        seatsPurchased: totalQuantity,

        bundleDetails: {
          title: bundleDetails.title,
          seatPrice: bundleDetails.seatPrice,
          courses: bundleDetails.courses || [],
          description: bundleDetails.description
        },

        discounts: {
          appliedDiscount: appliedDiscount
            ? {
              id: appliedDiscount.id,
              percentage: appliedDiscount.percentage,
              amount: discountAmount,
              isSeatDiscount: seatDiscounts.some((sd) => sd.id === appliedDiscount.id)
            }
            : null
        },

        pricing: {
          baseSubtotal: baseSubtotal,
          discountAmount: discountAmount,
          finalTotal: finalTotal
        },
        customerInfo: {
          name: profile?.data?.businessName || 'N/A',
          phone: profile?.data?.phoneNumber || 'N/A',
          address: profile?.data?.businessAddress || 'N/A',
          email: profile?.data?.email || 'N/A',
        },
        cashierInfo: {
          name: data?.data?.businessName || 'N/A',
          email: data?.data?.email || 'N/A',
          phone: data?.data?.phoneNumber || 'N/A',
          address: data?.data?.businessAddress || 'N/A',
        },
        purchaseDate: new Date().toISOString()
      }
    });
  };

  const CourseRow = ({ item, discountDetails, handleUpdateQuantity, removeProduct, index }) => {
    const [inputValue, setInputValue] = useState(item?.quantity?.toString());

    useEffect(() => {
      setInputValue(item?.quantity?.toString());
    }, [item.quantity]);

    const handleIncrease = () => {
      handleUpdateQuantity(item.quantity + 1, index);
    };

    const handleDecrease = () => {
      if (item.quantity > 1) {
        handleUpdateQuantity(item.quantity - 1, index);
      }
    };

    const handleQuantityChange = (e) => {
      const value = e.target.value;
      if (value === '' || /^\d+$/.test(value)) {
        setInputValue(value);
      }
    };

    const handleQuantityBlur = () => {
      if (inputValue === '') {
        setInputValue('1');
        handleUpdateQuantity(1, index);
      } else {
        const newQuantity = parseInt(inputValue, 10);
        if (newQuantity >= 1) {
          handleUpdateQuantity(newQuantity, index);
        } else {
          setInputValue(item?.quantity?.toString());
        }
      }
    };

    return (
      <TableRow key={index} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
        <TableCell align="left">
          <Typography variant="body1" fontWeight="bold">
            {item.title}
          </Typography>
        </TableCell>

        <TableCell align="center">
          {appliedDiscount?.percentage ? (
            <Typography>
              <span style={{ textDecoration: 'line-through', color: 'red' }}>${fmt(item.seatPrice)}</span>
              <span style={{ color: 'green', marginLeft: 8 }}>
                ${fmt(item.seatPrice - (item.seatPrice * appliedDiscount.percentage) / 100)}
              </span>
              / Seat
            </Typography>
          ) : (
            <Typography>${fmt(item.seatPrice)} / Seat</Typography>
          )}
        </TableCell>

        <TableCell align="center">
          <Stack direction="row">
            <Button
              key="three"
              variant="text"
              disabled={item.quantity <= 1}
              onClick={handleDecrease}
              sx={{ pr: 0.75, pl: 0.75, minWidth: '0px !important', '&:hover': { bgcolor: 'transparent' } }}
            >
              <Minus style={{ fontSize: 'inherit' }} />
            </Button>
            <TextField
              value={inputValue}
              onChange={handleQuantityChange}
              onBlur={handleQuantityBlur}
              size="small"
              inputProps={{
                style: { textAlign: 'center', width: 50 },
                inputMode: 'numeric'
              }}
            />
            <Button
              key="one"
              variant="text"
              onClick={handleIncrease}
              sx={{ pl: 0.75, pr: 0.75, minWidth: '0px !important', '&:hover': { bgcolor: 'transparent' } }}
            >
              <Add style={{ fontSize: 'inherit' }} />
            </Button>
          </Stack>
        </TableCell>

        {appliedDiscount?.percentage ? (
          <TableCell align="right">
            <Typography>
              <span style={{ textDecoration: 'line-through', color: 'red' }}>${fmt(item.quantity * item.seatPrice)}</span>
              <span style={{ color: 'green', marginLeft: 8 }}>${fmt(subtotal)}</span>
            </Typography>
          </TableCell>
        ) : (
          <TableCell align="right">
            <Typography>${fmt(item.quantity * item.seatPrice)}</Typography>
          </TableCell>
        )}
        <TableCell align="right">
          <IconButton
            color="error"
            onClick={() => {
              const bundleIdFromURL = new URLSearchParams(window.location.search).get('bundleId');
              if (bundleIdFromURL) {
                navigate('/dashboard/buy_new_license');
              }
              setLoading(true);
              localStorage.removeItem('cartItemId');
              toast({
                message: 'item removed from cart',
                type: 'success'
              });
              setBundleDetails({});
              setCartItem(null);

              setLoading(false);
            }}
            size="small"
            sx={{ opacity: 0.75, '&:hover': { bgcolor: 'transparent' } }}
          >
            <Trash variant="Bold" />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      <Stack>
        {seatDiscounts?.length > 0 && (
          <MainCard
            title={`Discount offers all year round!`}
            sx={{
              marginBottom: 3
            }}
          >
            <Grid
              sx={{
                display: 'flex',
                flexWrap: 'wrap',

                marginBottom: 3,
                padding: 1,
                gap: 2
              }}
            >
              {seatDiscounts.map((discount) => {
                return (
                  <AnalyticEcommerce
                    seats={discount?.seats?.seatsThreshold}
                    off={discount?.percentage}
                    percentage="10"
                    applied={appliedDiscount?.id === discount?.id}
                  />
                );
              })}
            </Grid>
          </MainCard>
        )}

        {isCartEmpty ? (
          <CartEmpty />
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                <MainCard content={false}>
                  <Grid container>
                    <Grid item xs={12} sx={{ py: 2.5, pl: 2.5 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1">Cart</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <Grid item xs={12}>
                      <TableContainer>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                          <TableBody>
                            <CourseRow
                              key={'1'}
                              item={bundleDetails}
                              discountDetails={appliedDiscount}
                              handleUpdateQuantity={handleUpdateQuantity}
                              index={'1'}
                            />
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </MainCard>
                <MainCard title={`Courses in Bundle`}>
                  {coursesDetails && coursesDetails?.length > 0 ? (
                    <Grid
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',

                        marginBottom: 3,
                        padding: 1,
                        gap: 2
                      }}
                    >
                      {coursesDetails.map((item, index) => (
                        <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '120px', maxWidth: '30%', width: '100%' }}>
                          <Typography variant="h6">{item.title}</Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              overflow: 'hidden',
                              WebkitBoxOrient: 'vertical',
                              WebkitLineClamp: 2
                            }}
                          >
                            {item?.description?.length > 70 ? `${item.description.slice(0, 70)}...` : item.description}
                          </Typography>
                        </MainCard>
                      ))}
                    </Grid>
                  ) : (
                    <p className="text-gray-500 text-center">No courses available.</p>
                  )}
                </MainCard>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <OrderSummary
                  subtotal={bundleDetails.quantity * bundleDetails.seatPrice}
                  vat={'N/A'}
                  seatDiscount={seatDiscount}
                  Total={subtotal}
                />

                <Button variant="contained" sx={{ textTransform: 'none' }} fullWidth onClick={handlePurchase} disabled={isLoading}>
                  {'Process to Checkout'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        )}
      </Stack>
    </>
  );
};

export default MyBundleCart;
