// import React, { useState, useEffect } from 'react';

// import {
//   Button,
//   Typography,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Grid,
//   Card,
//   IconButton,
//   CardContent,
//   styled,
//   List,
//   ListItem,
//   Checkbox,
//   ListItemText,
//   useTheme,
//   CircularProgress,
//   TextField
// } from '@mui/material';

// import { Link, useNavigate } from 'react-router-dom';

// import courseicon from '../../../assets/images/e-commerce/course.png';

// import axiosInstance from 'utils/axiosConfig';
// import { Stack } from '@mui/system';
// import ProductImages from 'sections/apps/e-commerce/product-details/ProductImages';
// import ProductInfo from 'sections/apps/e-commerce/product-details/ProductInfo';
// import MainCard from 'components/MainCard';
// import { Add, Trash } from 'iconsax-react';
// import RelatedProducts from 'sections/apps/e-commerce/product-details/RelatedProducts';
// import { useAuth } from 'contexts/AuthContext';
// import { openSnackbar } from 'api/snackbar';
// import { useBundleById, useUpdateBundle } from 'api/queries/bundles';
// import { useCourses } from 'api/queries/courses';

// const BundleDetails = () => {
//   const [loading_course, setloading_course] = useState(true);
//   const [editImage, setEditImage] = useState(false);
//   const [admin, setAdmin] = useState('');
//   const [bundleDetails, setBundleDetails] = useState({});
//   const [coursesDetails, setCoursesDetails] = useState([]);
//   const [courseId, setCourseId] = useState('');
//   const [coursesData, setCoursesData] = useState([]);
//   const [courseIds, setCourseIds] = useState([]);
//   const [bundleDiscounts, setBundleDiscounts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const theme = useTheme();
//   const { data, refetch } = useCourses({});

//   useEffect(() => {
//     if (data?.data) {
//       setCoursesData(data?.data);
//     }
//   }, [data]);

//   // const getAllCourses = async () => {
//   //   try {
//   //     const result = await axiosInstance.get('/courses/all');
//   //     const courses = result.data.data;
//   //     setCoursesData(courses);
//   //   } catch (error) {
//   //     console.log(error);
//   //   }
//   // };

//   const getDiscounts = async () => {
//     try {
//       const result = await axiosInstance.get('/discounts/get'); // Adjust endpoint as necessary
//       const discounts = result.data.data;

//       // Separate discounts based on resource type
//       const courses = discounts.filter((d) => d.resource_type === 'course');
//       const bundles = discounts.filter((d) => d.resource_type === 'bundle');

//       setBundleDiscounts(bundles);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     // getAllCourses();
//     getDiscounts();
//   }, []);

//   const nav = useNavigate();
//   const { currentUser } = useAuth();

//   const searchParams = new URLSearchParams(window.location.search);
//   const bundleId = searchParams.get('id');

//   const { data: bundle, isLoading: bundleLoading } = useBundleById(bundleId);
//   const updateBundle = useUpdateBundle();

//   const isAdminparam = searchParams.get('admin');

//   const isAdmin = currentUser.role === 'admin' && isAdminparam;

//   const [open, setOpen] = useState(false);
//   const [selectedCourses, setSelectedCourses] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');

//   const fetchBundleAndCourseDetails = async (bundleId, bundle) => {
//     const bundleData = bundle;
//     bundleData.quantity = 1;
//     bundleData.subtotal = bundleData.seatPrice;
//     setBundleDetails(bundle);
//     setCoursesDetails(bundle.courses);

//     return;
//   };

//   const handleSave = async (updatedFields) => {
//     setloading_course(true);
//     const updatedData = {
//       ...updatedFields,
//       courseIds
//     };

//     try {
//       await axiosInstance.put(`/courses/update_bundles/${bundleDetails?.bundleId}`, updatedData);
//       setBundleDetails((prev) => ({ ...prev, ...updatedFields }));
//       // toast.success('Bundle details updated successfully!');
//       openSnackbar({
//         open: true,
//         message: 'Bundle details updated successfully!',
//         variant: 'alert',
//         alert: {
//           color: 'success'
//         },
//         anchorOrigin: {
//           vertical: 'top',
//           horizontal: 'right'
//         }
//       });
//     } catch (error) {
//       console.log('Error updating course details:', error);
//       // toast.error('Error updating course details!');
//       openSnackbar({
//         open: true,
//         message: 'Error updating course details!',
//         variant: 'alert',
//         alert: {
//           color: 'error'
//         },
//         anchorOrigin: {
//           vertical: 'top',
//           horizontal: 'right'
//         }
//       });
//     } finally {
//       setloading_course(false);
//     }
//   };

//   useEffect(() => {
//     const searchParams = new URLSearchParams(window.location.search);
//     const id = searchParams.get('id');
//     setCourseId(id);

//     const admin = searchParams.get('admin');
//     setAdmin(admin);

//     if (id) {
//       fetchBundleAndCourseDetails(id);
//     }
//   }, []);

//   useEffect(() => {
//     if (bundle) {
//       setLoading(false);
//       const bundleData = bundle?.data;
//       bundleData.quantity = 1;
//       bundleData.subtotal = bundleData.seatPrice;
//       setBundleDetails(bundleData);
//       setCoursesDetails(bundleData.courses);
//     }
//   }, [bundleId, bundle]);

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     setNewImage(file);
//     setImagePreview(URL.createObjectURL(file));
//   };

//   const handleOpenDialog = () => {
//     setOpen(true);
//     setSelectedCourses([]);
//   };

//   const handleCloseDialog = () => {
//     setOpen(false);
//   };

//   const handleCourseSelect = (courseId) => {
//     setSelectedCourses((prev) => (prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]));
//   };

//   const handleUpdateBundleCourses = async (updatedCourseIds) => {
//     try {
//       setloading_course(true);

//       const payload = {
//         ...bundleDetails,
//         courseIds: updatedCourseIds
//       };
//       const response = await updateBundle.mutateAsync({ id: bundleDetails?.id, payload });
//       if (response?.success) {
//         openSnackbar({
//           open: true,
//           message: 'Bundle courses updated successfully!',
//           variant: 'alert',
//           alert: {
//             color: 'success'
//           },
//           anchorOrigin: {
//             vertical: 'top',
//             horizontal: 'right'
//           }
//         });
//         setBundleDetails(response.data);
//         setCoursesDetails(response.data.courses);
//       }
//     } catch (error) {
//       console.error('Error updating bundle courses:', error);
//       // toast.error('Failed to update bundle courses!');
//       openSnackbar({
//         open: true,
//         message: 'Failed to update bundle courses!',
//         variant: 'alert',
//         alert: {
//           color: 'error'
//         },
//         anchorOrigin: {
//           vertical: 'top',
//           horizontal: 'right'
//         }
//       });
//     } finally {
//       setloading_course(false);
//     }
//   };

//   const handleDeleteCourse = async (courseId) => {
//     const updatedCourseIds = coursesDetails.filter((course) => course.id !== courseId).map((course) => course.id);

//     handleUpdateBundleCourses(updatedCourseIds);
//   };

//   const availableCourses = coursesData.filter((course) => !coursesDetails.some((existingCourse) => existingCourse.id === course.id));
//   const handleAddCourses = async () => {
//     const updatedCourseIds = [...coursesDetails.map((course) => course.id), ...selectedCourses];

//     handleUpdateBundleCourses(updatedCourseIds);
//     handleCloseDialog();
//   };

//   const filteredCourses = availableCourses.filter((course) => course.title.toLowerCase().includes(searchQuery.toLowerCase()));

//   if (loading) {
//     return (
//       <Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
//         <CircularProgress />
//       </Stack>
//     );
//   }
//   return (
//     <>
//       <Grid container spacing={2}>
//         <Grid item xs={12}>
//           <Grid container spacing={3}>
//             <Grid item xs={12} sm={8} md={5} lg={4}>
//               <ProductImages image={courseicon} />
//             </Grid>

//             <Grid item xs={12} md={7} lg={8}>
//               <MainCard border={false} sx={{ height: '100%', bgcolor: 'secondary.lighter' }}>
//                 <ProductInfo
//                   product={bundleDetails}
//                   discounts={bundleDiscounts}
//                   onSave={handleSave}
//                   admin={isAdmin}
//                   coursesData={coursesData}
//                   fetchBundleAndCourseDetails={fetchBundleAndCourseDetails}
//                 />
//               </MainCard>
//             </Grid>
//           </Grid>
//         </Grid>
//         <Grid item xs={12} md={7} xl={8}>
//           <MainCard title={`Courses in Bundle `}>
//             {isAdmin ? (
//               <IconButton
//                 variant="contained"
//                 color="primary"
//                 onClick={(e) => {
//                   handleOpenDialog();
//                 }}
//                 sx={{
//                   position: 'absolute',
//                   top: '14px',
//                   right: '12px'
//                 }}
//               >
//                 <Add />
//               </IconButton>
//             ) : null}

//             {coursesDetails && coursesDetails.length > 0 ? (
//               <Grid
//                 sx={{
//                   display: 'flex',
//                   flexWrap: 'wrap',

//                   marginBottom: 3,
//                   padding: 1,
//                   gap: 2
//                 }}
//               >
//                 {coursesDetails.map((item, index) => (
//                   <MainCard
//                     border={false}
//                     shadow={theme.customShadows.z1}
//                     sx={{
//                       height: '120px',
//                       maxWidth: '31%',
//                       width: '100%',
//                       position: 'relative',
//                       '@media (max-width: 600px)': {
//                         height: '120px', // Full height below 600px
//                         width: '100%', // Full width below 600px
//                         maxWidth: '100%'
//                       }
//                     }}
//                   >
//                     <Stack>
//                       <Typography variant="h6">{item.title} </Typography>
//                       <Typography
//                         variant="caption"
//                         color="text.secondary"
//                         sx={{
//                           display: '-webkit-box',
//                           overflow: 'hidden',
//                           WebkitBoxOrient: 'vertical',
//                           WebkitLineClamp: 2
//                         }}
//                       >
//                         {item.description}
//                       </Typography>
//                     </Stack>

//                     {coursesDetails.length > 1 && (
//                       <IconButton
//                         variant="contained"
//                         color="error"
//                         onClick={(e) => {
//                           e.preventDefault();
//                           e.stopPropagation();
//                           handleDeleteCourse(item.id);
//                         }}
//                         sx={{
//                           position: 'absolute',
//                           bottom: '8px',
//                           right: '8px'
//                         }}
//                       >
//                         <Trash />
//                       </IconButton>
//                     )}
//                   </MainCard>
//                 ))}
//                 <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
//                   <DialogTitle>Add Courses to Bundle</DialogTitle>
//                   <DialogContent>
//                     <TextField
//                       fullWidth
//                       placeholder="Search for a course"
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       sx={{ mb: 2 }}
//                     />
//                     <List>
//                       {filteredCourses.map((course) => (
//                         <ListItem
//                           key={course.id}
//                           dense
//                           secondaryAction={
//                             <Checkbox
//                               edge="end"
//                               checked={selectedCourses.includes(course.id)}
//                               onChange={() => handleCourseSelect(course.id)}
//                             />
//                           }
//                         >
//                           <ListItemText primary={course.title} secondary={`Course ID: ${course.id} `} />
//                         </ListItem>
//                       ))}
//                     </List>
//                   </DialogContent>
//                   <DialogActions>
//                     <Button onClick={handleCloseDialog} color="error">
//                       Cancel
//                     </Button>
//                     <Button onClick={handleAddCourses} variant="contained" color="primary" disabled={selectedCourses.length === 0}>
//                       Add Selected Courses
//                     </Button>
//                   </DialogActions>
//                 </Dialog>
//               </Grid>
//             ) : (
//               <Stack
//                 sx={{
//                   width: '100%',
//                   display: 'flex',
//                   justifyContent: 'center',
//                   alignItems: 'center'
//                 }}
//               >
//                 {loading_course ? <CircularProgress /> : <p className="text-gray-500 text-center">No courses available.</p>}
//               </Stack>
//             )}
//           </MainCard>
//         </Grid>
//         <Grid item xs={12} md={5} xl={4} sx={{ position: 'relative' }}>
//           <MainCard
//             title="Related Bundles"
//             sx={{
//               height: 'calc(100% - 16px)',
//               position: { xs: 'relative', md: 'absolute' },
//               top: '16px',
//               left: { xs: 0, md: 16 },
//               right: 0
//             }}
//             content={false}
//           >
//             {<RelatedProducts id={bundleDetails.id} category={bundleDetails.category} discounts={bundleDiscounts} />}
//           </MainCard>
//         </Grid>
//       </Grid>
//     </>
//   );
// };

// export default BundleDetails;

import React, { useState, useEffect } from 'react';

import {
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Card,
  IconButton,
  CardContent,
  styled,
  List,
  ListItem,
  Checkbox,
  ListItemText,
  useTheme,
  CircularProgress,
  TextField
} from '@mui/material';

import { Link, useNavigate } from 'react-router-dom';

import courseicon from '../../../assets/images/e-commerce/course.png';

import axiosInstance from 'utils/axiosConfig';
import { Stack } from '@mui/system';
import ProductImages from 'sections/apps/e-commerce/product-details/ProductImages';
import ProductInfo from 'sections/apps/e-commerce/product-details/ProductInfo';
import MainCard from 'components/MainCard';
import { Add, Trash } from 'iconsax-react';
import RelatedProducts from 'sections/apps/e-commerce/product-details/RelatedProducts';
import { useAuth } from 'contexts/AuthContext';
import { openSnackbar } from 'api/snackbar';
import { useBundleById, useUpdateBundle } from 'api/queries/bundles';
import { useCourses } from 'api/queries/courses';

const BundleDetails = () => {
  const [loading_course, setloading_course] = useState(true);
  const [editImage, setEditImage] = useState(false);
  const [admin, setAdmin] = useState('');
  const [bundleDetails, setBundleDetails] = useState({});
  const [coursesDetails, setCoursesDetails] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [coursesData, setCoursesData] = useState([]);
  const [courseIds, setCourseIds] = useState([]);
  const [bundleDiscounts, setBundleDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const { data, refetch } = useCourses({});

  useEffect(() => {
    if (data?.data) {
      setCoursesData(data?.data);
    }
  }, [data]);
  //
  // const getAllCourses = async () => {
  //   try {
  //     const result = await axiosInstance.get('/courses/all');
  //     const courses = result.data.data;
  //     setCoursesData(courses);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const getDiscounts = async () => {
    try {
      const result = await axiosInstance.get('/discounts/get'); // Adjust endpoint as necessary
      const discounts = result.data.data;

      // Separate discounts based on resource type
      const courses = discounts.filter((d) => d.resource_type === 'course');
      const bundles = discounts.filter((d) => d.resource_type === 'bundle');

      setBundleDiscounts(bundles);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // getAllCourses();
    getDiscounts();
  }, []);

  const nav = useNavigate();
  const { currentUser } = useAuth();

  const searchParams = new URLSearchParams(window.location.search);
  const bundleId = searchParams.get('id');

  const { data: bundle, isLoading: bundleLoading } = useBundleById(bundleId);
  const updateBundle = useUpdateBundle();

  const isAdminparam = searchParams.get('admin');

  const isAdmin = currentUser.role === 'admin' && isAdminparam;

  const [open, setOpen] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBundleAndCourseDetails = async (bundleId, bundle) => {
    const bundleData = bundle;
    bundleData.quantity = 1;
    bundleData.subtotal = bundleData.seatPrice;
    setBundleDetails(bundle);
    setCoursesDetails(bundle.courses);

    return;
  };

  const handleSave = async (updatedFields) => {
    setloading_course(true);
    const updatedData = {
      ...updatedFields,
      courseIds
    };

    try {
      await axiosInstance.put(`/courses/update_bundles/${bundleDetails?.bundleId}`, updatedData);
      setBundleDetails((prev) => ({ ...prev, ...updatedFields }));
      // toast.success('Bundle details updated successfully!');
      openSnackbar({
        open: true,
        message: 'Bundle details updated successfully!',
        variant: 'alert',
        alert: {
          color: 'success'
        },
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        }
      });
    } catch (error) {
      console.log('Error updating course details:', error);
      // toast.error('Error updating course details!');
      openSnackbar({
        open: true,
        message: 'Error updating course details!',
        variant: 'alert',
        alert: {
          color: 'error'
        },
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        }
      });
    } finally {
      setloading_course(false);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('id');
    setCourseId(id);

    const admin = searchParams.get('admin');
    setAdmin(admin);

    if (id) {
      fetchBundleAndCourseDetails(id);
    }
  }, []);

  useEffect(() => {
    if (bundle) {
      setLoading(false);
      const bundleData = bundle?.data;
      bundleData.quantity = 1;
      bundleData.subtotal = bundleData.seatPrice;
      setBundleDetails(bundleData);
      setCoursesDetails(bundleData.courses);
    }
  }, [bundleId, bundle]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleOpenDialog = () => {
    setOpen(true);
    setSelectedCourses([]);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourses((prev) => (prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]));
  };

  const handleUpdateBundleCourses = async (updatedCourseIds) => {
    try {
      setloading_course(true);

      const payload = {
        ...bundleDetails,
        courseIds: updatedCourseIds
      };
      const response = await updateBundle.mutateAsync({ id: bundleDetails?.id, payload });
      if (response?.success) {
        openSnackbar({
          open: true,
          message: 'Bundle courses updated successfully!',
          variant: 'alert',
          alert: {
            color: 'success'
          },
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right'
          }
        });
        setBundleDetails(response.data);
        setCoursesDetails(response.data.courses);
      }
    } catch (error) {
      console.error('Error updating bundle courses:', error);
      // toast.error('Failed to update bundle courses!');
      openSnackbar({
        open: true,
        message: 'Failed to update bundle courses!',
        variant: 'alert',
        alert: {
          color: 'error'
        },
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        }
      });
    } finally {
      setloading_course(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    const updatedCourseIds = coursesDetails.filter((course) => course.id !== courseId).map((course) => course.id);

    handleUpdateBundleCourses(updatedCourseIds);
  };

  const availableCourses = coursesData.filter((course) => !coursesDetails.some((existingCourse) => existingCourse.id === course.id));
  const handleAddCourses = async () => {
    const updatedCourseIds = [...coursesDetails.map((course) => course.id), ...selectedCourses];

    handleUpdateBundleCourses(updatedCourseIds);
    handleCloseDialog();
  };

  const filteredCourses = availableCourses.filter((course) => course.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Stack>
    );
  }
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={8} md={5} lg={4}>
              <ProductImages image={courseicon} />
            </Grid>

            <Grid item xs={12} md={7} lg={8}>
              <MainCard border={false} sx={{ height: '100%', bgcolor: 'secondary.lighter' }}>
                <ProductInfo
                  product={bundleDetails}
                  discounts={bundleDetails?.discounts}
                  onSave={handleSave}
                  admin={isAdmin}
                  coursesData={coursesData}
                  fetchBundleAndCourseDetails={fetchBundleAndCourseDetails}
                />
              </MainCard>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={7} xl={8}>
          <MainCard title={`Courses in Bundle `}>
            {isAdmin ? (
              <IconButton
                variant="contained"
                color="primary"
                onClick={(e) => {
                  handleOpenDialog();
                }}
                sx={{
                  position: 'absolute',
                  top: '14px',
                  right: '12px'
                }}
              >
                <Add />
              </IconButton>
            ) : null}

            {coursesDetails && coursesDetails.length > 0 ? (
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
                  <MainCard
                    border={false}
                    shadow={theme.customShadows.z1}
                    sx={{
                      height: '120px',
                      maxWidth: '31%',
                      width: '100%',
                      position: 'relative',
                      '@media (max-width: 600px)': {
                        height: '120px', // Full height below 600px
                        width: '100%', // Full width below 600px
                        maxWidth: '100%'
                      }
                    }}
                  >
                    <Stack>
                      <Typography variant="h6">{item.title} </Typography>
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
                        {item.description}
                      </Typography>
                    </Stack>

                    {coursesDetails.length > 1 && (
                      <IconButton
                        variant="contained"
                        color="error"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteCourse(item.id);
                        }}
                        sx={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px'
                        }}
                      >
                        <Trash />
                      </IconButton>
                    )}
                  </MainCard>
                ))}
                <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                  <DialogTitle>Add Courses to Bundle</DialogTitle>
                  <DialogContent>
                    <TextField
                      fullWidth
                      placeholder="Search for a course"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <List>
                      {filteredCourses.map((course) => (
                        <ListItem
                          key={course.id}
                          dense
                          secondaryAction={
                            <Checkbox
                              edge="end"
                              checked={selectedCourses.includes(course.id)}
                              onChange={() => handleCourseSelect(course.id)}
                            />
                          }
                        >
                          <ListItemText primary={course.title} secondary={`Course ID: ${course.id} `} />
                        </ListItem>
                      ))}
                    </List>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseDialog} color="error">
                      Cancel
                    </Button>
                    <Button onClick={handleAddCourses} variant="contained" color="primary" disabled={selectedCourses.length === 0}>
                      Add Selected Courses
                    </Button>
                  </DialogActions>
                </Dialog>
              </Grid>
            ) : (
              <Stack
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {loading_course ? <CircularProgress /> : <p className="text-gray-500 text-center">No courses available.</p>}
              </Stack>
            )}
          </MainCard>
        </Grid>
        <Grid item xs={12} md={5} xl={4} sx={{ position: 'relative' }}>
          <MainCard
            title="Related Bundles"
            sx={{
              height: 'calc(100% - 16px)',
              position: { xs: 'relative', md: 'absolute' },
              top: '16px',
              left: { xs: 0, md: 16 },
              right: 0
            }}
            content={false}
          >
            {<RelatedProducts id={bundleDetails?.id} category={bundleDetails?.category} discounts={bundleDetails?.discounts} />}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default BundleDetails;
