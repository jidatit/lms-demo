import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControl,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  CircularProgress,
  Stack,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';
import { MdAdd, MdEdit, MdCategory, MdCampaign } from 'react-icons/md';
import { addCategory, getAllCategories } from 'utils/fetch';
import axiosInstance from 'utils/axiosConfig';
import { openSnackbar } from 'api/snackbar';
import { useCreateBundle, useUpdateBundle } from 'api/queries/bundles';

const CreateBundleDialog = ({
  open,
  onClose,
  coursesData,
  handleCreateCourseBundle,
  update = false,
  bundleData = null,
  fetchBundleAndCourseDetails
}) => {
  const [categories, setCategories] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const steps = ['Bundle Details', 'Category', 'Select Courses', 'Campaign Type'];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceperseat: '',
    category: '',
    newCategory: '',
    selectedCourses: [],
    campaignType: 'Simulated Phishing & Security Awareness Training' // Default value
  });


  const createBundle = useCreateBundle();
  const updateBundle = useUpdateBundle();

  useEffect(() => {
    if (open && update && bundleData) {
      console.log('bundleData 2', bundleData);
      // const selectedCourses = typeof bundleData.course_ids === 'string' ? JSON.parse(bundleData.course_ids) : bundleData.course_ids;
      const selectedCourses = bundleData?.courses?.map((course) => {
        return course.id;
      });
      console.log('selectedCourses', selectedCourses);

      setFormData({
        title: bundleData.title || '',
        description: bundleData.description || '',
        priceperseat: bundleData.seatPrice || '',
        category: bundleData.category || '',
        newCategory: '',
        selectedCourses: selectedCourses || [],
        campaignType: bundleData.campaign_type || 'Simulated Phishing & Security Awareness Training'
      });
    }
  }, [open, update, bundleData]);

  const fetchCategories = async () => {
    const fetchedCategories = await getAllCategories();
    setCategories(fetchedCategories);
  };

  const handleAddCategory = async () => {
    if (!formData.newCategory.trim()) return;

    setIsAddingCategory(true); // Start loading

    try {
      const newCategory = await addCategory(formData.newCategory);
      setCategories([...categories, newCategory]);
      setFormData({ ...formData, category: newCategory.id, newCategory: '' });
      setIsCreatingNewCategory(false);
    } catch (error) {
      console.error('Failed to add category:', error);
    } finally {
      setIsAddingCategory(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (update) {
        const payload = {
          title: formData.title,
          description: formData.description,
          seatPrice: Number(formData.priceperseat),
          bundleType: formData.campaignType,
          courseIds: formData.selectedCourses,
          category: formData.category
        };
        const response = await updateBundle.mutateAsync({ id: bundleData?.id, payload });

        if (response?.success) {
          openSnackbar({
            open: true,
            message: 'Course bundle edited successfully.',
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
          fetchBundleAndCourseDetails(bundleData?.bundleId, response?.data);
        }
      } else {
        console.log('formData', formData);
        const payload = {
          title: formData.title,
          description: formData.description,
          seatPrice: Number(formData.priceperseat),
          bundleType: formData.campaignType,
          courseIds: formData.selectedCourses,
          category: formData.category
        };
        console.log('create bundle payload', payload);
        const response = await createBundle.mutateAsync(payload);

        if (response?.success) {
          openSnackbar({
            open: true,
            message: 'Course bundle successfully created.',
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
      }

      setFormData({
        title: '',
        description: '',
        priceperseat: '',
        category: '',
        newCategory: '',
        selectedCourses: [],
        campaignType: 'Simulated Phishing & Security Awareness Training'
      });
      setActiveStep(0);
      onClose();
    } catch (error) {
      setError(error.message);
      openSnackbar({
        open: true,
        message: 'something went wrong please try again .',
        variant: 'error',
        alert: {
          color: 'error'
        },
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        },
        close: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      await handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCourseToggle = (courseId) => {
    setFormData((prev) => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(courseId)
        ? prev.selectedCourses.filter((id) => id !== courseId)
        : [...prev.selectedCourses, courseId]
    }));
  };

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <InputLabel htmlFor="title">Title</InputLabel>
              <TextField
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                fullWidth
                margin="dense"
              />

              <InputLabel htmlFor="description">Description</InputLabel>
              <TextField
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={2}
                margin="dense"
              />

              <InputLabel htmlFor="price">Price per Seat</InputLabel>
              <TextField
                id="price"
                type="number"
                value={formData.priceperseat}
                onChange={(e) => setFormData({ ...formData, priceperseat: e.target.value })}
                fullWidth
                margin="dense"
                InputProps={{
                  startAdornment: <Box sx={{ mr: 1 }}>$</Box>
                }}
              />
            </Box>
          </DialogContent>
        );

      case 1:
        return (
          <DialogContent>
            {/* <FormControl component="fieldset" sx={{ width: '100%' }}>
              <FormLabel component="legend">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdCategory /> Select or Create Category
                </Box>
              </FormLabel>
              <RadioGroup
                value={isCreatingNewCategory ? 'new' : 'existing'}
                onChange={(e) => setIsCreatingNewCategory(e.target.value === 'new')}
                sx={{ mt: 2 }}
              >
                <FormControlLabel value="existing" control={<Radio />} label="Select Existing Category" />
                <FormControlLabel value="new" control={<Radio />} label="Create New Category" />
              </RadioGroup>

              {isCreatingNewCategory ? (
                <>
                  <TextField
                    id="new-category"
                    value={formData.newCategory}
                    onChange={(e) => setFormData({ ...formData, newCategory: e.target.value })}
                    fullWidth
                    InputProps={{
                      startAdornment: <MdAdd style={{ marginRight: 8 }} />
                    }}
                  />
                  <Button onClick={handleAddCategory} variant="contained" color="primary" sx={{ mt: 2 }} disabled={isAddingCategory}>
                    {isAddingCategory ? 'Adding...' : 'Add Category'}
                  </Button>
                </>
              ) : (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Select Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    label="Select Category"
                  >
                    <MenuItem value="" disabled>
                      Select a category
                    </MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </FormControl> */}
            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <FormLabel component="legend">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdCategory /> Enter Category
                </Box>
              </FormLabel>

              <TextField
                id="category"
                placeholder="Enter category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: <MdAdd style={{ marginRight: 8 }} />
                }}
                sx={{ mt: 2 }}
              />
            </FormControl>
          </DialogContent>
        );

      case 2:
        return (
          <DialogContent sx={{ p: 0 }}>
            <Box
              sx={{
                position: 'sticky',
                top: 0,

                zIndex: 2,
                p: 2,
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              <TextField
                fullWidth
                placeholder="Search courses..."
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Box>

            <Box sx={{ maxHeight: '400px', overflowY: 'auto', p: 2 }}>
              <List sx={{ width: '100%' }}>
                {coursesData
                  .filter((course) => course.title.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((course) => (
                    <ListItem
                      key={course.id}
                      dense
                      button
                      onClick={() => handleCourseToggle(course.id)}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox edge="start" checked={formData.selectedCourses.includes(course.id)} tabIndex={-1} disableRipple />
                      </ListItemIcon>
                      <ListItemText
                        primary={course.title}
                        secondary={
                          <Box>
                            <Box>{course.description}</Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
            </Box>
          </DialogContent>
        );

      case 3:
        return (
          <DialogContent>
            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <FormLabel component="legend">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdCampaign /> Select Campaign Type
                </Box>
              </FormLabel>
              <RadioGroup
                value={formData.campaignType}
                onChange={(e) => setFormData({ ...formData, campaignType: e.target.value })}
                sx={{ mt: 2 }}
              >
                <FormControlLabel
                  value="Simulated Phishing & Security Awareness Training"
                  control={<Radio />}
                  label="Simulated Phishing & Security Awareness Training"
                />
                <FormControlLabel value="Advance Training" control={<Radio />} label="Advance Training" />
              </RadioGroup>
            </FormControl>
          </DialogContent>
        );

      default:
        return 'Unknown step';
    }
  }

  const dialogTitle = (
    <DialogTitle>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MdEdit /> {update ? 'Edit Bundle ' : 'Create Bundle'}
      </Box>
    </DialogTitle>
  );

  const errorAlert = error && (
    <Alert severity="error" sx={{ mt: 2 }}>
      {error}
    </Alert>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {dialogTitle}

      <Stepper activeStep={activeStep} sx={{ pt: 2, pb: 1, px: 2 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {getStepContent(activeStep)}
      {errorAlert}

      <Box sx={{ px: 2, py: 2 }}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={2}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
            )}
            {update && (
              <Button variant="contained" color="success" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} /> : 'Save & Exit'}
              </Button>
            )}
          </Stack>

          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              isSubmitting ||
              (activeStep === 0 && (!formData.title || !formData.description || !formData.priceperseat)) ||
              (activeStep === 1 && !formData.category && !formData.newCategory) ||
              (activeStep === 2 && formData.selectedCourses.length === 0)
            }
          >
            {isSubmitting ? <CircularProgress size={24} /> : activeStep === steps.length - 1 ? 'Create Bundle' : 'Next'}
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
};

export default CreateBundleDialog;
