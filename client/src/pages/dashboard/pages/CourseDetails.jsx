import React, { useState, useEffect } from 'react';

import {
  Button,
  Typography,
  Box,
  Card,
  IconButton,
  CardContent,
  Stack,
  Tooltip,
  Grid,
  Accordion,
  AccordionSummary,
  TextField,
  AccordionDetails,
  Switch,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CardHeader,
  Divider
} from '@mui/material';
import { GiPriceTag } from 'react-icons/gi';
import axiosInstance from 'utils/axiosConfig';
import { Book, Edit, Edit2, Stacks } from 'iconsax-react';
import { useNavigate } from 'react-router';
import MainCard from 'components/MainCard';
import { BiCloudUpload } from 'react-icons/bi';
import { MdClear, MdExpandMore, MdOutlinePriceChange, MdPlayLesson, MdTitle, MdUpdate } from 'react-icons/md';
import { FaCloudUploadAlt, FaDollyFlatbed } from 'react-icons/fa';
import { useTheme } from '@emotion/react';
import { openSnackbar } from 'api/snackbar';
import { FaBook, FaBookOpen, FaMoneyCheckDollar } from 'react-icons/fa6';
import { CiMemoPad } from 'react-icons/ci';
import { useCourseById, useUpdateCourse } from 'api/queries/courses';
import { useCreateLesson, useDeleteLesson, useLessonsByCourse, useUpdateLesson } from 'api/queries/lessons';

// import Heading from "./ui";

const CourseDetails = () => {
  // const [editImage, setEditImage] = useState(false);
  // const [admin, setAdmin] = useState('');
  // const [courseId, setCourseId] = useState('');
  // const [courseDetails, setCourseDetails] = useState({
  //   id: '',
  //   title: '',
  //   description: '',
  //   priceperseat: '',
  //   featuredImage: null,
  //   lessons: []
  // });

  // const [newLesson, setNewLesson] = useState({
  //   title: '',
  //   description: '',
  //   lesson_video_path: '',
  //   lesson_video_name: ''
  // });

  // const [imagePreview, setImagePreview] = useState(null);
  // const [newImage, setNewImage] = useState(null);
  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const nav = useNavigate();
  // const getCourseDetails = async (id) => {
  //   try {
  //     const response = await axiosInstance.get(`/courses/all_course_details/${id}`);
  //     const data = response.data.data;
  //     setCourseDetails({
  //       id: data.id,
  //       title: data.title,
  //       featuredImage: data.featuredImage,
  //       description: data.description,
  //       priceperseat: data.priceperseat,
  //       lessons: data.lessons
  //         ? data.lessons.map((lesson) => ({
  //             ...lesson,
  //             lesson_video_path: lesson.materials ? lesson.materials[0].doc_link : '',
  //             lesson_video_name: lesson.materials ? lesson.materials[0].doc_name : '',
  //             isEditing: false
  //           }))
  //         : []
  //     });
  //     setloading_course(false);
  //   } catch (error) {
  //     console.log('Error getting course details:', error);
  //   }
  // };

  // useEffect(() => {
  //   const searchParams = new URLSearchParams(window.location.search);
  //   const id = searchParams.get('id');
  //   setCourseId(id);
  //   const admin = searchParams.get('admin');
  //   setAdmin(admin);

  //   if (id) {
  //     getCourseDetails(id);
  //   }
  // }, []);

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   setNewImage(file);
  //   setImagePreview(URL.createObjectURL(file));
  // };

  // const handleLessonChange = (e, index, videoName) => {
  //   const { name, value } = e.target;
  //   const updatedLessons = [...courseDetails.lessons];
  //   if (name === 'lesson_video_path') {
  //     updatedLessons[index] = {
  //       ...updatedLessons[index],
  //       [name]: value,
  //       lesson_video_name: videoName || updatedLessons[index].lesson_video_name
  //     };
  //   } else {
  //     updatedLessons[index] = { ...updatedLessons[index], [name]: value };
  //   }
  //   setCourseDetails({ ...courseDetails, lessons: updatedLessons });
  // };

  // const handleNewLessonChange = (e) => {
  //   const { name, value } = e.target;
  //   setNewLesson({ ...newLesson, [name]: value });
  // };

  // const addLesson = async () => {
  //   if (newLesson.title && newLesson.description) {
  //     const formData = new FormData();
  //     formData.append('title', newLesson.title);
  //     formData.append('description', newLesson.description);
  //     formData.append('lesson_video_path', newLesson.lesson_video_path);
  //     formData.append('lesson_video_name', newLesson.lesson_video_name);
  //     try {
  //       const response = await axiosInstance.post(`/courses/add_lesson/${courseDetails.id}`, formData, {
  //         headers: {
  //           'Content-Type': 'application/json'
  //         }
  //       });
  //       if (response.data.success) {
  //         toast.success('Lesson Added!');
  //         getCourseDetails(courseDetails.id);
  //         setNewLesson({
  //           title: '',
  //           description: '',
  //           lesson_video_path: '',
  //           lesson_video_name: ''
  //         });
  //         setIsDialogOpen(false);
  //       }
  //     } catch (error) {
  //       console.log('Error adding lesson:', error);
  //     }
  //   } else {
  //     alert('Title and description are required.');
  //   }
  // };

  // const updateLesson = async (index) => {
  //   const lessonToUpdate = courseDetails.lessons[index];
  //   try {
  //     const response = await axiosInstance.put(`/courses/update_lesson/${courseDetails.id}/${lessonToUpdate.id}`, {
  //       title: lessonToUpdate.title,
  //       description: lessonToUpdate.description,
  //       lesson_video_path: lessonToUpdate.lesson_video_path,
  //       lesson_video_name: lessonToUpdate.lesson_video_name
  //     });
  //     if (response.data.success) {
  //       const updatedLessons = [...courseDetails.lessons];
  //       updatedLessons[index] = { ...updatedLessons[index], isEditing: false };
  //       setCourseDetails({ ...courseDetails, lessons: updatedLessons });
  //       toast.success('Lesson Updated!');
  //     }
  //   } catch (error) {
  //     console.log('Error updating lesson:', error);
  //   }
  // };

  // const deleteLesson = async (index) => {
  //   const lessonToDelete = courseDetails.lessons[index];
  //   try {
  //     const response = await axiosInstance.delete(`/courses/delete_lesson/${courseDetails.id}/${lessonToDelete.id}`);
  //     if (response.data.success) {
  //       const updatedLessons = [...courseDetails.lessons];
  //       updatedLessons.splice(index, 1);
  //       setCourseDetails({ ...courseDetails, lessons: updatedLessons });
  //       toast.success('Lesson Deleted!');
  //     }
  //   } catch (error) {
  //     console.log('Error deleting lesson:', error);
  //   }
  // };

  // const handleImageSubmit = async (e) => {
  //   const formData = new FormData();
  //   if (newImage) {
  //     formData.append('featuredImage', newImage);
  //   }
  //   try {
  //     const response = await axiosInstance.put(`/courses/set_image/${courseDetails.id}`, formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data'
  //       }
  //     });
  //     if (response.data.success) {
  //       toast.success('Featured Image Updated!');
  //       getCourseDetails(courseDetails.id);
  //       setNewImage(null);
  //       setImagePreview(null);
  //       setEditImage(false);
  //     }
  //   } catch (error) {
  //     console.log('Error updating featured image:', error);
  //   }
  // };
  // const handleSave = async (updatedFields) => {
  //   try {
  //     await axiosInstance.put(`/courses/update/${courseDetails.id}`, updatedFields);
  //     setCourseDetails((prev) => ({ ...prev, ...updatedFields }));
  //     toast.success('Course details updated successfully!'); // Success toast
  //   } catch (error) {
  //     console.log('Error updating course details:', error);
  //     toast.error('Error updating course details!'); // Error toast
  //   }
  // };

  // const toggleEditing = (index) => {
  //   const updatedLessons = [...courseDetails.lessons];
  //   updatedLessons[index].isEditing = !updatedLessons[index].isEditing;
  //   setCourseDetails({ ...courseDetails, lessons: updatedLessons });
  // };
  const lessonsData = [
    {
      id: 'panel1',
      title: 'Lesson 1',
      formData: {
        title: 'Lesson 1 Title',
        description: 'Description for lesson 1',
        video: 'Dummy 1'
      }
    },
    {
      id: 'panel2',
      title: 'Lesson 2',
      formData: {
        title: 'Lesson 2 Title',
        description: 'Description for lesson 2',
        video: 'Dummy 2'
      }
    },
    {
      id: 'panel3',
      title: 'Lesson 3',
      formData: {
        title: 'Lesson 3 Title',
        description: 'Description for lesson 3',
        video: 'Dummy 3'
      }
    }
  ];
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // For displaying preview
  const [editingImage, setEditingImage] = useState(false); // For displaying preview
  const [expanded, setExpanded] = useState('panel1');
  const [isEditable, setIsEditable] = useState(false); // Switch state
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get('id');
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',

    featuredImage: null,
    lessons: []
  });
  const [courseDetails, setCourseDetails] = useState({
    id: '',
    title: '',
    description: '',

    featuredImage: null,
    lessons: []
  });
  const [imageLoaded, setImageLoaded] = useState(false); // Tracks when the image is fully loaded
  const [admin, setAdmin] = useState('');
  const [courseId, setCourseId] = useState('');
  const [loading, setLoading] = useState(true);
  const [addLessonModalOpen, setAddLessonModalOpen] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    lesson_video_path: '',
    lesson_video_name: ''
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editImage, setEditImage] = useState(false);
  const [editingData, setEditingData] = useState({
    title: '',
    description: ''

    // Add other fields as needed
  });

  const { data, isLoading, error, refetch } = useCourseById(id);
  const { mutate: updateCourse, isPending: isUpdating } = useUpdateCourse();
  const { mutateAsync: createLesson, isPending: isCreatingLessons } = useCreateLesson();
  const { data: courseLessons, refetch: refechLessons } = useLessonsByCourse(id);
  const { mutateAsync: updateLessonMutation, isPending: isUpdatingLessons } = useUpdateLesson();
  const { mutateAsync: deleteLessonMutation, isPending: isDeleting } = useDeleteLesson();

  const handleEditClick = () => {
    setEditModalOpen(true);
    setEditingData({
      title: courseDetails.title,
      description: courseDetails.description

      // Set other fields
    });
  };
  const updateLesson = async (index) => {
    const lessonToUpdate = courseDetails.lessons[index];

    try {
      const payload = {
        title: lessonToUpdate.title,
        description: lessonToUpdate.description,
        videoUrl: lessonToUpdate.lesson_video_path,
        videoName: lessonToUpdate.lesson_video_name
      };
      // console.log('payload', payload);
      const response = await updateLessonMutation({ id: lessonToUpdate.id, payload });

      // console.log('response upd', response);

      if (response.success) {
        const updatedLessons = [...courseDetails.lessons];
        updatedLessons[index] = { ...updatedLessons[index], isEditing: false };
        setCourseDetails({ ...courseDetails, lessons: updatedLessons });
        openSnackbar({
          open: true,
          message: 'Lesson Details updated successfully!',
          transition: 'SlideLeft',
          variant: 'alert',
          alert: {
            color: 'success'
          },
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right'
          },
          close: true
        });
        setIsEditable(!isEditable);
      }
    } catch (error) {
      openSnackbar({
        open: true,
        message: 'Lesson details Updation Failed',
        variant: 'alert',
        transition: 'SlideLeft',
        alert: {
          color: 'error'
        },
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        },
        close: true
      });
      console.log('Error updating lesson:', error);
    }
  };

  const deleteLesson = async (index) => {
    const lessonToDelete = courseDetails.lessons[index];
    try {
      const response = await deleteLessonMutation(lessonToDelete.id);
      if (response.success) {
        const updatedLessons = [...courseDetails.lessons];
        updatedLessons.splice(index, 1);
        setCourseDetails({ ...courseDetails, lessons: updatedLessons });
        openSnackbar({
          open: true,
          message: 'Lesson Deleted successfully!',
          transition: 'SlideLeft',
          variant: 'alert',
          alert: {
            color: 'success'
          },
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right'
          },
          close: true
        });
      }
    } catch (error) {
      openSnackbar({
        open: true,
        message: 'Course deletion Failed',
        variant: 'alert',
        transition: 'SlideLeft',
        alert: {
          color: 'error'
        },
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        },
        close: true
      });
      console.log('Error deleting lesson:', error);
    }
  };

  const getCourseDetails = async (data, lessons) => {
    try {
      setCourseDetails({
        id: data.id,
        title: data.title,
        featuredImage: data.featuredImage || '',
        description: data.description,

        lessons: lessons
          ? lessons.map((lesson) => ({
            ...lesson,
            lesson_video_path: lesson.videoUrl ? lesson.videoUrl : '',
            lesson_video_name: lesson.videoName ? lesson.videoName : '',
            isEditing: false
          }))
          : []
      });
      setLoading(false);
    } catch (error) {
      console.log('Error getting course details:', error);
    }
  };

  useEffect(() => {
    setCourseId(id);
    setAdmin(admin);
    if (id && data && data?.success) {
      getCourseDetails(data?.data, courseLessons?.data || []);
    }
  }, [id, data, courseLessons]);

  // const handleLessonChange = (e, index, videoName) => {
  //   const { name, value } = e.target;
  //   console.log('name', name);
  //   console.log('value', value);
  //   const updatedLessons = [...courseDetails.lessons];
  //   if (name === 'lesson_video_path') {
  //     updatedLessons[index] = {
  //       ...updatedLessons[index],
  //       [name]: value,
  //       lesson_video_name: videoName || updatedLessons[index].lesson_video_name
  //     };
  //   } else {
  //     updatedLessons[index] = { ...updatedLessons[index], [name]: value };
  //   }
  //   setCourseDetails({ ...courseDetails, lessons: updatedLessons });
  // };

  const handleLessonChange = (e, index) => {
    const { name, value } = e.target;
    const updatedLessons = [...courseDetails.lessons];

    if (name === 'selectedVideo') {
      // Find the selected video from your h5pVideosData
      const selectedVideo = h5pVideosData.find((video) => video.id === value || video.name === value);

      if (selectedVideo) {
        updatedLessons[index] = {
          ...updatedLessons[index],
          [name]: value,
          lesson_video_path: selectedVideo.path,
          lesson_video_name: selectedVideo.name
        };
      }
    } else {
      updatedLessons[index] = { ...updatedLessons[index], [name]: value };
    }

    setCourseDetails({ ...courseDetails, lessons: updatedLessons });
  };

  const handleNewLessonChange = (e) => {
    const { name, value } = e.target;
    setNewLesson({ ...newLesson, [name]: value });
  };

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const handleSwitch = () => {
    setIsEditable(!isEditable);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const triggerFileInput = () => {
    document.getElementById('file-input').click();
  };
  const theme = useTheme();

  const handleSave = async (editingData) => {
    try {
      const payload = {
        title: editingData.title,
        description: editingData.description
      };
      const data = await updateCourse({ id: courseId, payload });

      setCourseDetails((prev) => ({ ...prev, ...editingData }));
      openSnackbar({
        open: true,
        message: 'Course details updated successfully!',
        transition: 'SlideLeft',
        variant: 'alert',
        alert: {
          color: 'success'
        },
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        },
        close: true
      });

      setEditModalOpen(false);
    } catch (error) {
      console.log('Error updating course details:', error);

      openSnackbar({
        open: true,
        message: 'Course details Updation Failed',
        variant: 'alert',
        transition: 'SlideLeft',
        alert: {
          color: 'error'
        },
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        },
        close: true
      });
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file); // Set the file object for upload
      const previewURL = URL.createObjectURL(file); // Generate a preview URL
      setImagePreview(previewURL); // Set local preview for display
    }
  };
  const handleImageSubmit = async () => {
    const formData = new FormData();
    if (image) {
      formData.append('featuredImage', image);
    } else {
      openSnackbar({
        open: true,
        message: 'Please select an image before updating.',
        transition: 'SlideLeft',
        variant: 'alert',
        alert: { color: 'error' },
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        close: true
      });
      return;
    }

    try {
      setEditImage(true);
      console.log('Submitting image:', image); // Log the file object for debugging

      // Optimistically set imagePreview to show the uploaded image instantly
      const tempImagePreview = URL.createObjectURL(image);
      setImagePreview(tempImagePreview);

      const response = await axiosInstance.put(`/courses/set_image/${courseDetails.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        // Fetch updated course details to ensure state sync
        await getCourseDetails(courseDetails.id);

        // Reset local image states
        setImage(null);
        setImagePreview(null);

        openSnackbar({
          open: true,
          message: 'Featured Image updated successfully!',
          transition: 'SlideLeft',
          variant: 'alert',
          alert: { color: 'success' },
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          close: true
        });
        setEditingImage(false);
      }
    } catch (error) {
      console.log('Error updating featured image:', error);
      openSnackbar({
        open: true,
        message: 'Failed to upload image',
        transition: 'SlideLeft',
        variant: 'alert',
        alert: { color: 'error' },
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        close: true
      });
    } finally {
      setEditImage(false);
    }
  };

  const handleSaveNewLesson = async (newLesson) => {
    if (newLesson.title && newLesson.description && newLesson.lesson_video_path && newLesson.lesson_video_name) {
      const formData = new FormData();
      formData.append('title', newLesson.title);
      formData.append('description', newLesson.description);
      formData.append('lesson_video_path', newLesson.lesson_video_path);
      formData.append('lesson_video_name', newLesson.lesson_video_name);

      const payload = {
        courseId: courseDetails?.id,
        title: newLesson.title,
        description: newLesson.description,
        videoUrl: newLesson.lesson_video_path,
        videoName: newLesson.lesson_video_name
      };

      try {
        const response = await createLesson(payload);
        if (response?.success) {
          openSnackbar({
            open: true,
            message: 'New Lesson Added successfully!',
            transition: 'SlideLeft',
            variant: 'alert',
            alert: { color: 'success' },
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
            close: true
          });
          refechLessons();
          setNewLesson({
            title: '',
            description: '',
            lesson_video_path: '',
            lesson_video_name: ''
          });
          setAddLessonModalOpen(false);
        }
      } catch (error) {
        openSnackbar({
          open: true,
          message: 'Error Adding Lesson...',
          transition: 'SlideLeft',
          variant: 'alert',
          alert: { color: 'error' },
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          close: true
        });
        console.log('Error adding lesson:', error);
      }
    } else {
      openSnackbar({
        open: true,
        message: 'All fields are required..',
        transition: 'SlideLeft',
        variant: 'alert',
        alert: { color: 'error' },
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        close: true
      });
    }
  };
  const handleSelectVideo = (e) => {
    const selectedVideo = courseDetails.lessons.find((lesson) => lesson.lesson_video_name === e.target.value);
    setNewLesson({
      ...newLesson,
      lesson_video_path: selectedVideo.lesson_video_path,
      lesson_video_name: selectedVideo.lesson_video_name
    });
  };
  const h5pVideosData = [
    {
      name: 'Dummy 1',
      path: '/h5p/content/v1'
    },
    {
      name: 'Dummy 2',
      path: '/h5p/content/v2'
    }
  ];

  return (
    <>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' }}>
          <CircularProgress color="success" />
        </Box>
      ) : (
        <Grid container spacing={3} alignItems="stretch" sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <CardHeader
                  title="Course Details"
                  titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  action={
                    <Tooltip title="Edit All">
                      <IconButton color="error" size="small" onClick={handleEditClick}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  }
                  sx={{ borderBottom: '1px solid #ddd', px: 3.5 }}
                />

                <CardContent>
                  <Stack spacing={3}>
                    {/* Title */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'primary.main' }}>
                          <CiMemoPad color="primary" />
                          <Typography variant="body1" fontWeight="bold">
                            Title
                          </Typography>
                        </Stack>
                        <Typography variant="body1" color="text.secondary">
                          {courseDetails.title}
                        </Typography>
                      </Stack>
                      {/* <Tooltip title="Edit Title">
                        <IconButton color="primary" size="small" onClick={handleEditClick} sx={{ position: 'relative', left: 2.2 }}>
                          <Edit />
                        </IconButton>
                      </Tooltip> */}
                    </Stack>

                    <Divider />

                    {/* Description */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'primary.main' }}>
                          <FaBookOpen color="primary" />
                          <Typography variant="body1" fontWeight="bold">
                            Description
                          </Typography>
                        </Stack>
                        <Typography variant="body1" color="text.secondary">
                          {courseDetails.description}
                        </Typography>
                      </Stack>
                      {/* <Tooltip title="Edit Description">
                        <IconButton color="primary" size="small" onClick={handleEditClick} sx={{ position: 'relative', left: 2.2 }}>
                          <Edit />
                        </IconButton>
                      </Tooltip> */}
                    </Stack>

                    <Divider />

                    {/* Price */}
                    {/* <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'primary.main' }}>
                          <FaDollyFlatbed color="primary" />
                          <Typography variant="body1" fontWeight="bold">
                            Price per seat
                          </Typography>
                        </Stack>
                        <Typography variant="body1" color="text.secondary">
                          ${courseDetails.priceperseat}
                        </Typography>
                      </Stack>
                     
                    </Stack> */}
                  </Stack>
                </CardContent>
              </Card>
              <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                <DialogTitle>Edit Course Details</DialogTitle>
                <DialogContent>
                  <DialogContentText sx={{ mb: 2 }}>Update the Course information below.</DialogContentText>
                  <TextField
                    label="Title"
                    value={editingData.title}
                    onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                    fullWidth
                    margin="dense"
                    sx={{ mb: 1.5 }}
                  />
                  <TextField
                    label="Description"
                    value={editingData.description}
                    onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                    fullWidth
                    sx={{ mb: 1.5 }}
                    margin="dense"
                  />

                  {/* Add other fields based on the structure of courseDetails */}
                </DialogContent>
                <DialogActions sx={{ padding: '16px' }}>
                  <Button color="error" onClick={() => setEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      handleSave(editingData);
                    }}
                  >
                    Update Course
                  </Button>
                </DialogActions>
              </Dialog>
            </Grid>
          </Grid>
          <Card
            elevation={3}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              width: '100%',

              marginTop: '20px'
            }}
          >
            <CardHeader
              title="Course Lessons"
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              sx={{

                borderBottom: '1px solid #ddd',
                px: 3.5
              }}
            />

            <CardContent>
              <Box
                sx={{
                  '& .MuiAccordion-root': {
                    borderColor: theme.palette.divider,
                    '& .MuiAccordionSummary-root': {
                      bgcolor: 'transparent',
                      flexDirection: 'row'
                    },
                    '& .MuiAccordionDetails-root': {
                      borderColor: theme.palette.divider
                    },
                    '& .Mui-expanded': {
                      color: 'primary.main'
                    }
                  }
                }}
              >
                {courseDetails.lessons.map((lesson, index) => (
                  <Accordion key={lesson.id} expanded={expanded === lesson.id} onChange={handleChange(lesson.id)} sx={{ paddingY: 1 }}>
                    <AccordionSummary
                      expandIcon={<MdExpandMore />}
                      aria-controls={`${lesson.id}-content`}
                      id={`${lesson.id}-header`}
                      sx={{
                        bgcolor: 'transparent',
                        '& .MuiAccordionSummary-content': {
                          flexDirection: 'row'
                        }
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <MdPlayLesson size={20} /> {/* Replace with your desired icon */}
                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                          {lesson.title}
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{
                        bgcolor: 'background.paper',
                        borderColor: 'divider',
                        transition: 'max-height 0.3s ease-in-out'
                      }}
                    >
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Switch checked={isEditable} onChange={handleSwitch} />
                          <Typography variant="body1">Enable Editing</Typography>
                        </Stack>

                        <TextField
                          label="Title"
                          name="title"
                          value={lesson.title}
                          onChange={(e) => handleLessonChange(e, index)}
                          disabled={!isEditable}
                          fullWidth
                        />
                        <TextField
                          label="Description"
                          name="description"
                          value={lesson.description}
                          onChange={(e) => handleLessonChange(e, index)}
                          disabled={!isEditable}
                          multiline
                          rows={3}
                          fullWidth
                        />
                        <TextField
                          label="Lesson Video name"
                          name="lesson_video_name"
                          value={lesson.lesson_video_name}
                          onChange={(e) => handleLessonChange(e, index)}
                          disabled={!isEditable}
                          fullWidth
                          multiline
                          margin="normal"
                        />
                        <TextField
                          label="Lesson Video Path"
                          name="lesson_video_path"
                          value={lesson.lesson_video_path}
                          onChange={(e) => handleLessonChange(e, index)}
                          disabled={!isEditable}
                          fullWidth
                          multiline
                          margin="normal"
                        />
                        {/* <FormControl fullWidth>
                          <InputLabel id={`lesson-select-label-${index}`}>Select Video</InputLabel>
                          <Select
                            labelId={`lesson-select-label-${index}`}
                            id={`lesson-select-${index}`}
                            value={lesson.selectedVideo || lesson.lesson_video_name}
                            onChange={(e) => handleLessonChange({ target: { name: 'selectedVideo', value: e.target.value } }, index)}
                            disabled={!isEditable}
                            placeholder="Select Video"
                          >
                            {courseDetails.lessons.map((lessonItem) => (
                              <MenuItem key={lessonItem.id} value={lessonItem.lesson_video_name}>
                                {lessonItem.lesson_video_name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl> */}

                        {/* Action Buttons */}
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                          <Button
                            variant="contained"
                            sx={{
                              bgcolor: 'primary.main'
                            }}
                            startIcon={<Edit />}
                            disabled={!isEditable || isUpdatingLessons}
                            onClick={() => updateLesson(index)}
                          >
                            {isUpdatingLessons ? 'Updating...' : 'Update Lesson'}
                          </Button>
                          <Button
                            disabled={isDeleting}
                            variant="contained"
                            color="error"
                            startIcon={<BiCloudUpload />}
                            onClick={() => deleteLesson(index)}
                          >
                            {isDeleting ? 'Deleting...' : 'Delete Lesson'}
                          </Button>
                        </Stack>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ))}
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    marginTop: '20px'
                  }}
                >
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: 'primary.main'
                    }}
                    startIcon={<Edit />}
                    onClick={() => setAddLessonModalOpen(true)}
                  >
                    Add Lesson
                  </Button>
                  <>
                    <Dialog open={addLessonModalOpen} onClose={() => setAddLessonModalOpen(false)}>
                      <DialogTitle>Add New Lesson</DialogTitle>
                      <DialogContent>
                        <DialogContentText sx={{ mb: 2 }}>Enter the details for the new lesson.</DialogContentText>
                        <TextField
                          label="Title"
                          name="title"
                          value={newLesson.title}
                          onChange={handleNewLessonChange}
                          fullWidth
                          margin="normal"
                        />
                        <TextField
                          label="Description"
                          name="description"
                          value={newLesson.description}
                          onChange={handleNewLessonChange}
                          fullWidth
                          multiline
                          margin="normal"
                        />
                        <TextField
                          label="Lesson Video name"
                          name="lesson_video_name"
                          value={newLesson.lesson_video_name}
                          onChange={handleNewLessonChange}
                          fullWidth
                          multiline
                          margin="normal"
                        />
                        <TextField
                          label="Lesson Video Path"
                          name="lesson_video_path"
                          value={newLesson.lesson_video_path}
                          onChange={handleNewLessonChange}
                          fullWidth
                          multiline
                          margin="normal"
                        />
                        {/* <FormControl fullWidth margin="normal">
                          <InputLabel id="new-lesson-video">Select a video for lesson</InputLabel>
                          <Select
                            labelId="new-lesson-video"
                            name="lesson_video_path"
                            value={newLesson.lesson_video_path}
                            onChange={(e) => {
                              const selectedVideo = h5pVideosData.find((video) => video.path === e.target.value);
                              if (selectedVideo) {
                                setNewLesson({
                                  ...newLesson,
                                  lesson_video_path: selectedVideo.path,
                                  lesson_video_name: selectedVideo.name
                                });
                              }
                            }}
                          >
                            {h5pVideosData &&
                              h5pVideosData.map((video) => (
                                <MenuItem key={video.path} value={video.path}>
                                  {video.name}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl> */}
                      </DialogContent>
                      <DialogActions sx={{ padding: '16px' }}>
                        <Button color="error" onClick={() => setAddLessonModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button disabled={isCreatingLessons} variant="contained" onClick={() => handleSaveNewLesson(newLesson)}>
                          {isCreatingLessons ? 'Creating...' : 'Add Lesson'}
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: 'primary.main'
                    }}
                    startIcon={<BiCloudUpload />}
                  >
                    Review Course
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </>
  );
};

export default CourseDetails;
