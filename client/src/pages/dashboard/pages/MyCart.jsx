import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import { Box, Chip, Paper, styled, Table, IconButton, Button, Divider, TextField } from '@mui/material';
import { FaCheckCircle, FaInfoCircle, FaPercentage, FaUsers } from 'react-icons/fa';
import { CiDiscount1 } from 'react-icons/ci';
import axiosInstance from 'utils/axiosConfig';
import { useAuth } from 'contexts/AuthContext';
import { Stack } from '@mui/system';
import MainCard from 'components/MainCard';
import CartEmpty from 'sections/apps/e-commerce/checkout/CartEmpty';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Grid from '@mui/material/Grid';
import { Add, Minus } from 'iconsax-react';
import OrderSummary from 'sections/apps/e-commerce/checkout/OrderSummery';
import AnalyticEcommerce from 'components/cards/statistics/DiscountCard';
import { openSnackbar } from 'api/snackbar';

const fmt = (n) => Number(n || 0).toFixed(2);

const DiscountPaper = styled(Paper)(({ theme, isActive }) => ({
  padding: theme.spacing(2),
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  maxWidth: '208px',
  flex: '1 1 30%',
  margin: theme.spacing(1),

  border: isActive ? `2px solid #02496F` : 'none',
  backgroundColor: isActive ? '#f0f8ff' : 'white',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4]
  }
}));
const DiscountGrid = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(1),
  gap: theme.spacing(2)
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  '& > svg': {
    marginRight: theme.spacing(1)
  }
}));

const MyCart = () => {
  const [course_Id, setCourse_Id] = useState('');
  const [course_details, setcourse_details] = useState([]);
  const [seatDiscounts, setSeatDiscounts] = useState([]);
  const [seatDiscount, setSeatDiscount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [isCartEmpty, setisCartEmpty] = useState(false);
  const [discountDetails, setDiscountDetails] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fetchDiscounts = async () => {
    try {
      const response = await axiosInstance.get('/seats_discounts/get');
      if (response.data.success) {
        setSeatDiscounts(response.data.data);
      } else {
        console.error('Failed to fetch discounts:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const calculateSeatDiscount = () => {
    const totalSeats = course_details.reduce((acc, item) => acc + item.quantity, 0);

    const applicableDiscount = seatDiscounts
      .sort((a, b) => b.seats - a.seats) // Sort discounts in descending order of seats
      .find((discount) => totalSeats >= discount.seats);

    // setAppliedDiscount(applicableDiscount || null);
    if (applicableDiscount) {
      const discountAmount = (subtotal * applicableDiscount.percentage) / 100;
      setSeatDiscount(discountAmount);
    } else {
      setSeatDiscount(0);
    }
  };
  const totalSeats = course_details.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const calculateAppliedDiscount = () => {
      const applicableDiscount = seatDiscounts
        .sort((a, b) => b.seats - a.seats) // Sort by seats in descending order
        .find((discount) => totalSeats >= discount.seats);

      setAppliedDiscount(applicableDiscount || null);
    };

    calculateAppliedDiscount();
  }, [seatDiscounts, totalSeats]);

  useEffect(() => {
    calculateSeatDiscount();
  }, [course_details, subtotal]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const course_id = searchParams.get('course_id');
    if (!course_id) {
      setisCartEmpty(true);
    }
    setCourse_Id(course_id);
  }, []);

  useEffect(() => {
    const getCourseDetails = async () => {
      try {
        if (course_Id) {
          const result = await axiosInstance.get(`/courses/${course_Id}`);
          const data = result.data.data;
          data.quantity = 1;
          data.subtotal = data.quantity * data.priceperseat;
          setcourse_details([data]);
          setSubtotal(data.subtotal);

          // Fetch discount details after fetching course details
          await getDiscountDetails(course_Id, data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getCourseDetails();
  }, [course_Id]);

  // Fetch discount details and apply the discount to the course price
  const getDiscountDetails = async (course_id, courseData) => {
    try {
      const response = await axiosInstance.post('/discounts/getdiscount', {
        resource_id: course_id,
        resource_type: 'course'
      });
      if (response.data.success) {
        const discountData = response.data.data;
        setDiscountDetails(discountData);

        // Calculate the subtotal before the discount
        let subtotal = courseData.quantity * courseData.priceperseat;

        // Apply discount if discount percentage exists
        if (discountData?.percentage) {
          const discountPercentage = discountData.percentage;
          const discountAmount = (subtotal * discountPercentage) / 100;
          subtotal = subtotal - discountAmount;
        }

        courseData.subtotal = subtotal;
        setcourse_details([courseData]);
        setSubtotal(subtotal);
      }
    } catch (error) {
      console.error('Error fetching discount details:', error.message);
    }
  };

  // Handle quantity update
  const handleUpdateQuantity = (updatedQuantity, index) => {
    const updatedDetails = [...course_details];
    updatedDetails[index].quantity = updatedQuantity;

    // Calculate the subtotal with the discount applied
    let subtotal = updatedQuantity * updatedDetails[index].priceperseat;

    // Apply discount if discount percentage exists
    if (discountDetails?.percentage) {
      const discountPercentage = discountDetails.percentage;
      const discountAmount = (subtotal * discountPercentage) / 100;
      subtotal = subtotal - discountAmount;
    }

    updatedDetails[index].subtotal = subtotal;
    setcourse_details(updatedDetails);

    // Update the overall subtotal
    let newSubtotal = 0;
    updatedDetails.forEach((item) => {
      newSubtotal += item.subtotal || 0;
    });
    setSubtotal(newSubtotal);
  };

  // Handle purchase process
  const handlePurchase = async () => {
    try {
      const totalQuantity = course_details.reduce((acc, item) => acc + item.quantity, 0);
      if (totalQuantity > 0) {
        await axiosInstance.post(`/courses/purchase_course_seats/${course_Id}/${totalQuantity}`, {
          buyer: currentUser
        });
        // toast.success('Purchase Successful! You will be redirected shortly.');
        openSnackbar({
          open: true,
          message: 'Purchase Successful! You will be redirected shortly.',
          variant: 'alert',
          alert: {
            color: 'success'
          },
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right'
          }
        });
        setTimeout(() => {
          navigate('/contrib_dashboard/buy_new_license');
        }, 3000);
      } else {
        // toast.error(`No course seats quantity found ${totalQuantity}`);
        openSnackbar({
          open: true,
          message: `No course seats quantity found ${totalQuantity}`,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right'
          }
        });
      }
    } catch (error) {
      console.error('Error purchasing course seats:', error.response ? error.response.data : error.message);
    }
  };

  const CourseRow = ({ item, discountDetails, handleUpdateQuantity, removeProduct, index }) => {
    const [localQuantity, setLocalQuantity] = React.useState(item.quantity);

    const handleIncrease = () => {
      const newQuantity = localQuantity + 1;
      setLocalQuantity(newQuantity);
      handleUpdateQuantity(newQuantity, index);
    };

    const handleDecrease = () => {
      if (localQuantity > 1) {
        const newQuantity = localQuantity - 1;
        setLocalQuantity(newQuantity);
        handleUpdateQuantity(newQuantity, index);
      }
    };

    const handleQuantityChange = (e) => {
      const value = e.target.value;
      if (/^\d*$/.test(value)) {
        setLocalQuantity(value === '' ? '' : parseInt(value, 10));
      }
    };

    const handleQuantityBlur = () => {
      const newQuantity = localQuantity || 1; // Default to 1 if empty
      setLocalQuantity(newQuantity);
      handleUpdateQuantity(newQuantity, index);
    };

    return (
      <TableRow key={index} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
        {/* Course Title */}
        <TableCell align="left">
          <Typography variant="body1" fontWeight="bold">
            {item.title}
          </Typography>
        </TableCell>

        {/* Price with Discount */}
        <TableCell align="center">
          {discountDetails?.percentage ? (
            <Typography>
              <span style={{ textDecoration: 'line-through', color: 'red' }}>${fmt(item.priceperseat)}</span>
              <span style={{ color: 'green', marginLeft: 8 }}>
                ${fmt(item.priceperseat - (item.priceperseat * discountDetails.percentage) / 100)}
              </span>
              / Seat
            </Typography>
          ) : (
            <Typography>${fmt(item.priceperseat)} / Seat</Typography>
          )}
        </TableCell>

        <TableCell align="center">
          <Stack direction="row">
            <Button
              key="three"
              variant="text"
              disabled={localQuantity <= 1}
              onClick={handleDecrease}
              sx={{ pr: 0.75, pl: 0.75, minWidth: '0px !important', '&:hover': { bgcolor: 'transparent' } }}
            >
              <Minus style={{ fontSize: 'inherit' }} />
            </Button>
            <TextField
              value={localQuantity}
              onChange={handleQuantityChange}
              onBlur={handleQuantityBlur}
              size="small"
              inputProps={{
                style: { textAlign: 'center', width: 50 },
                inputMode: 'numeric' // For numeric keyboards on mobile
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

        {/* Subtotal */}
        <TableCell align="right">
          <Typography>${fmt(item.subtotal)}</Typography>
        </TableCell>
      </TableRow>
    );
  };
  return (
    <Stack>
      {seatDiscounts.length > 0 && (
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
                  seats={discount.seats}
                  off={discount.percentage}
                  percentage="10"
                  applied={appliedDiscount?.id === discount.id}
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
                          {course_details.map((item, index) => (
                            <CourseRow
                              key={index}
                              item={item}
                              discountDetails={discountDetails}
                              handleUpdateQuantity={handleUpdateQuantity}
                              index={index}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </MainCard>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <OrderSummary subtotal={subtotal} vat={'Nan'} seatDiscount={seatDiscount} Total={subtotal - seatDiscount} />

              <Button variant="contained" sx={{ textTransform: 'none' }} fullWidth onClick={handlePurchase}>
                Process to Checkout
              </Button>
            </Stack>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
};

export default MyCart;
