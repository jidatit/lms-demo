// import React, { useState, useEffect } from 'react';
// import axiosInstance from '../../utils/axiosConfig';
// import { useAuth } from '../../AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { Box, Chip, Paper, styled, Typography } from '@mui/material';
// import { FaCheckCircle, FaInfoCircle, FaPercentage, FaUsers } from 'react-icons/fa';
// import { CiDiscount1 } from 'react-icons/ci';
// import Heading from '../../components/ui';
// import { TickCircle } from 'iconsax-react';
// const DiscountPaper = styled(Paper)(({ theme, isActive }) => ({
//   padding: theme.spacing(2),
//   borderRadius: '12px',
//   transition: 'all 0.3s ease',
//   maxWidth: '208px',
//   flex: '1 1 30%',
//   margin: theme.spacing(1),

//   border: isActive ? `2px solid #02496F` : 'none',
//   backgroundColor: isActive ? '#f0f8ff' : 'white',
//   '&:hover': {
//     transform: 'translateY(-5px)',
//     boxShadow: theme.shadows[4]
//   }
// }));
// const DiscountGrid = styled(Box)(({ theme }) => ({
//   display: 'flex',
//   flexWrap: 'wrap',
//   marginBottom: theme.spacing(3),
//   padding: theme.spacing(1),
//   gap: theme.spacing(2)
// }));
// const IconWrapper = styled(Box)(({ theme }) => ({
//   display: 'flex',
//   alignItems: 'center',
//   marginBottom: theme.spacing(1),
//   '& > svg': {
//     marginRight: theme.spacing(1)
//   }
// }));
const MyCart = () => {
  // const [course_Id, setCourse_Id] = useState('');
  // const [course_details, setcourse_details] = useState([]);

  // const [subtotal, setSubtotal] = useState(0);
  // const [isCartEmpty, setisCartEmpty] = useState(false);
  // const [discountDetails, setDiscountDetails] = useState(null);
  // const { currentUser } = useAuth();
  // const navigate = useNavigate();
  // const [seatDiscounts, setSeatDiscounts] = useState([]);
  // const [seatDiscount, setSeatDiscount] = useState(0);
  // const [appliedDiscount, setAppliedDiscount] = useState(null);
  // const fetchDiscounts = async () => {
  //   try {
  //     const response = await axiosInstance.get('/seats_discounts/get');
  //     if (response.data.success) {
  //       setSeatDiscounts(response.data.data);
  //     } else {
  //       console.error('Failed to fetch discounts:', response.data.message);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching discounts:', error);
  //   }
  // };

  // const calculateSeatDiscount = () => {
  //   const totalSeats = course_details.reduce((acc, item) => acc + item.quantity, 0);

  //   const applicableDiscount = seatDiscounts
  //     .sort((a, b) => b.seats - a.seats) // Sort discounts in descending order of seats
  //     .find((discount) => totalSeats >= discount.seats);
  //   // setAppliedDiscount(applicableDiscount || null);
  //   if (applicableDiscount) {
  //     const discountAmount = (subtotal * applicableDiscount.percentage) / 100;
  //     setSeatDiscount(discountAmount);
  //   } else {
  //     setSeatDiscount(0);
  //   }
  // };
  // const totalSeats = course_details.reduce((acc, item) => acc + item.quantity, 0);

  // useEffect(() => {
  //   const calculateAppliedDiscount = () => {
  //     const applicableDiscount = seatDiscounts
  //       .sort((a, b) => b.seats - a.seats) // Sort by seats in descending order
  //       .find((discount) => totalSeats >= discount.seats);

  //     setAppliedDiscount(applicableDiscount || null);
  //   };

  //   calculateAppliedDiscount();
  // }, [seatDiscounts, totalSeats]);

  // useEffect(() => {
  //   calculateSeatDiscount();
  // }, [course_details, subtotal]);

  // useEffect(() => {
  //   fetchDiscounts();
  // }, []);
  // // Extract course_id from URL parameters
  // useEffect(() => {
  //   const searchParams = new URLSearchParams(window.location.search);
  //   const course_id = searchParams.get('course_id');
  //   if (!course_id) {
  //     setisCartEmpty(true);
  //   }
  //   setCourse_Id(course_id);
  // }, []);

  // // Fetch course details
  // useEffect(() => {
  //   const getCourseDetails = async () => {
  //     try {
  //       if (course_Id) {
  //         const result = await axiosInstance.get(`/courses/${course_Id}`);
  //         const data = result.data.data;
  //         data.quantity = 1;
  //         data.subtotal = data.quantity * data.priceperseat;
  //         setcourse_details([data]);
  //         setSubtotal(data.subtotal);

  //         // Fetch discount details after fetching course details
  //         await getDiscountDetails(course_Id, data);
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   getCourseDetails();
  // }, [course_Id]);

  // // Fetch discount details and apply the discount to the course price
  // const getDiscountDetails = async (course_id, courseData) => {
  //   try {
  //     const response = await axiosInstance.post('/discounts/getdiscount', {
  //       resource_id: course_id,
  //       resource_type: 'course'
  //     });
  //     if (response.data.success) {
  //       const discountData = response.data.data;
  //       setDiscountDetails(discountData);

  //       // Calculate the subtotal before the discount
  //       let subtotal = courseData.quantity * courseData.priceperseat;

  //       // Apply discount if discount percentage exists
  //       if (discountData?.percentage) {
  //         const discountPercentage = discountData.percentage;
  //         const discountAmount = (subtotal * discountPercentage) / 100;
  //         subtotal = subtotal - discountAmount;
  //       }

  //       courseData.subtotal = subtotal;
  //       setcourse_details([courseData]);
  //       setSubtotal(subtotal);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching discount details:', error.message);
  //   }
  // };

  // // Handle quantity update
  // const handleUpdateQuantity = (updatedQuantity, index) => {
  //   const updatedDetails = [...course_details];
  //   updatedDetails[index].quantity = updatedQuantity;

  //   // Calculate the subtotal with the discount applied
  //   let subtotal = updatedQuantity * updatedDetails[index].priceperseat;

  //   // Apply discount if discount percentage exists
  //   if (discountDetails?.percentage) {
  //     const discountPercentage = discountDetails.percentage;
  //     const discountAmount = (subtotal * discountPercentage) / 100;
  //     subtotal = subtotal - discountAmount;
  //   }

  //   updatedDetails[index].subtotal = subtotal;
  //   setcourse_details(updatedDetails);

  //   // Update the overall subtotal
  //   let newSubtotal = 0;
  //   updatedDetails.forEach((item) => {
  //     newSubtotal += item.subtotal || 0;
  //   });
  //   setSubtotal(newSubtotal);
  // };

  // // Handle purchase process
  // const handlePurchase = async () => {
  //   try {
  //     const totalQuantity = course_details.reduce((acc, item) => acc + item.quantity, 0);
  //     if (totalQuantity > 0) {
  //       await axiosInstance.post(`/courses/purchase_course_seats/${course_Id}/${totalQuantity}`, {
  //         buyer: currentUser
  //       });
  //       toast.success('Purchase Successful! You will be redirected shortly.');
  //       setTimeout(() => {
  //         navigate('/contrib_dashboard/buy_new_license');
  //       }, 3000);
  //     } else {
  //       toast.error(`No course seats quantity found ${totalQuantity}`);
  //     }
  //   } catch (error) {
  //     console.error('Error purchasing course seats:', error.response ? error.response.data : error.message);
  //   }
  // };

  return (
    <>
      {/* <div className="w-full flex flex-col  justify-start items-center">
        <div className="w-[100%] flex flex-col justify-center items-center">
          <div className="w-full flex flex-col my-1 justify-center items-start">
            <Heading text="Cart" />
          </div>
          <div className="w-full flex flex-col justify-start mt-5 bg-[#299aa1] rounded-3xl">
            <div className="flex">
              <h1 className="text-white items-start flex justify-start mt-4 text-3xl ml-4">
                <CiDiscount1 style={{ marginRight: '8px', marginTop: '4px' }} />
                Discount offers all year round!
              </h1>
            </div>
            <DiscountGrid>
              {seatDiscounts.map((discount) => (
                <DiscountPaper key={discount.id} isActive={appliedDiscount?.id === discount.id}>
                  <IconWrapper>
                    <FaUsers />
                    <Typography variant="body2" color="text.secondary">
                      {discount.seats}+ seats
                    </Typography>
                  </IconWrapper>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'semibold' }}>
                    {discount.percentage}% Off
                  </Typography>
                  {appliedDiscount?.id === discount.id && (
                    <Chip
                      icon={
                        <TickCircle size="32" color="#FF8A65" />
                        // <FaCheckCircle
                        //   style={{
                        //     color: '#38b09c' // Applying color directly here
                        //   }}
                        //   size={16}
                        // />
                      }
                      label="Applied"
                      color="primary"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </DiscountPaper>
              ))}
            </DiscountGrid>
          </div>

          {!isCartEmpty ? (
            <>
              <div className="w-full flex flex-col justify-center items-center bg-white">
                <div className="w-full py-3 grid grid-cols-4 justify-center items-center gap-1">
                  <div className="w-full flex flex-col justify-center items-center">
                    <p className="font-semibold text-md text-center">Course</p>
                  </div>
                  <div className="w-full flex flex-col justify-center items-center">
                    <p className="font-semibold text-md text-center">Price</p>
                  </div>
                  <div className="w-full flex flex-col justify-center items-center">
                    <p className="font-semibold text-md text-center">Quantity</p>
                  </div>
                  <div className="w-full flex flex-col justify-center items-center">
                    <p className="font-semibold text-md text-center">Sub Total</p>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-slate-400"></div>

                {course_details?.map((item, index) => (
                  <div key={index} className="w-full py-3 grid grid-cols-4 justify-center items-center gap-1">
                    <div className="w-full flex flex-col justify-center items-center">
                      <p className="font-semibold text-md text-center">{item.title}</p>
                    </div>
                    <div className="w-full flex flex-col justify-center items-center">
                      <p className="font-semibold text-md text-center">
                        {discountDetails?.percentage ? (
                          <>
                            <span className="line-through text-red-500">${item.priceperseat}</span>
                            <span className="text-green-600 ml-2">
                              ${item.priceperseat - (item.priceperseat * discountDetails.percentage) / 100}
                            </span>
                            / Seat
                          </>
                        ) : (
                          // If no discount, show the regular price
                          <>${item.priceperseat} / Seat</>
                        )}
                      </p>
                    </div>
                    <div className="w-full flex flex-col justify-center items-center">
                      <QuantityCounter onChange={(quantity) => handleUpdateQuantity(quantity, index)} initialValue={item.quantity || 1} />
                    </div>
                    <div className="w-full flex flex-col justify-center items-center">
                      <p className="font-semibold text-md text-center">$ {item.subtotal || 0}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full h-[2px] bg-slate-400"></div>

              <div className="w-full grid grid-cols-2 py-5 px-[90px] justify-center items-center bg-white">
                <div className="w-full flex flex-col justify-center items-center"></div>
                <div className="w-full flex flex-col justify-center items-center">
                  <div className="w-full flex flex-row justify-between items-center">
                    <p className="text-lg font-normal text-gray-800">SUBTOTAL</p>
                    <p className="text-lg font-semibold text-black">{subtotal}</p>
                  </div>
                  <div className="w-full flex flex-row justify-between items-center">
                    <p className="text-lg font-normal text-gray-800">VAT</p>
                    <p className="text-lg font-semibold text-black">{'NAN'}</p>
                  </div>
                  <div className="w-full flex flex-row justify-between items-center">
                    <p className="text-lg font-normal text-gray-800">SEAT DISCOUNT</p>
                    <p className="text-lg font-semibold text-black">-${seatDiscount.toFixed(2)}</p>
                  </div>
                  <div className="w-full flex flex-row justify-between items-center">
                    <p className="text-lg font-normal text-gray-800">TOTAL</p>
                    <p className="text-lg font-semibold text-black">{(subtotal - seatDiscount).toFixed(2)}</p>
                  </div>
                  <div
                    onClick={handlePurchase}
                    className="cursor-pointer inline-flex items-center px-5 py-2 text-md font-bold text-center text-white bg-[#299aa1] rounded-[22px] hover:bg-[#00A3AE]"
                  >
                    Proceed To Checkout
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="italic font-bold text-1xl">Cart is Empty.</p>
            </>
          )}
        </div>
      </div> */}
      <div>
        <h1>hello</h1>
      </div>
    </>
  );
};

// const QuantityCounter = ({ onChange, initialValue }) => {
//   const [value, setValue] = useState(initialValue);
//   const min = 1;
//   const max = 1000;

//   const handleDecrement = () => {
//     if (value !== 1) {
//       setValue((prevValue) => (prevValue > min ? prevValue - 1 : prevValue));
//       onChange(value - 1);
//     }
//   };

//   const handleIncrement = () => {
//     setValue((prevValue) => (prevValue < max ? prevValue + 1 : prevValue));
//     onChange(value + 1);
//   };

//   const handleChange = (e) => {
//     const newValue = parseInt(e.target.value, 10);
//     if (!isNaN(newValue) && newValue >= min && newValue <= max) {
//       setValue(newValue);
//       onChange(newValue);
//     }
//   };

//   return (
//     <div className="relative flex items-center max-w-[8rem]">
//       <button
//         type="button"
//         id="decrement-button"
//         data-input-counter-decrement="bedrooms-input"
//         className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
//         onClick={handleDecrement}
//       >
//         <svg
//           className="w-3 h-3 text-gray-900 dark:text-white"
//           aria-hidden="true"
//           xmlns="http://www.w3.org/2000/svg"
//           fill="none"
//           viewBox="0 0 18 2"
//         >
//           <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h16" />
//         </svg>
//       </button>
//       <input
//         type="text"
//         id="bedrooms-input"
//         data-input-counter
//         data-input-counter-min="1"
//         data-input-counter-max="5"
//         aria-describedby="helper-text-explanation"
//         className="bg-gray-50 border-x-0 border-gray-300 h-11 font-medium text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full pb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
//         placeholder=""
//         value={value}
//         onChange={handleChange}
//         required
//       />
//       <div className="absolute bottom-1 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 flex items-center text-xs text-gray-400 space-x-1 rtl:space-x-reverse">
//         <span>Seats</span>
//       </div>
//       <button
//         type="button"
//         id="increment-button"
//         data-input-counter-increment="bedrooms-input"
//         className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
//         onClick={handleIncrement}
//       >
//         <svg
//           className="w-3 h-3 text-gray-900 dark:text-white"
//           aria-hidden="true"
//           xmlns="http://www.w3.org/2000/svg"
//           fill="none"
//           viewBox="0 0 18 18"
//         >
//           <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
//         </svg>
//       </button>
//     </div>
//   );
// };

export default MyCart;
