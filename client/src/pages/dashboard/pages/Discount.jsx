import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Grid,
  InputLabel,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  LinearProgress,
  Fade
} from '@mui/material';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import axiosInstance from 'utils/axiosConfig';
import { useAuth } from 'contexts/AuthContext';
import { Add } from 'iconsax-react';
import { FaTrash } from 'react-icons/fa6';
import { TbRosetteDiscountFilled } from 'react-icons/tb';
import { MdDiscount } from 'react-icons/md';
import { useBundles } from 'api/queries/bundles';
import { useCreateDiscount, useDeleteDiscount, useDiscounts, useUpdateDiscount } from 'api/queries/discounts';
import SeatDiscountConfig from '../components/SeatDiscountConfig';
import { toast } from 'utils/toast';

const DiscountPage = () => {
  const { currentUser } = useAuth();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [courseDiscounts, setCourseDiscounts] = useState({});
  const [bundleDiscounts, setBundleDiscounts] = useState([]);
  const [bundlesData, setBundlesData] = useState([]);
  const [loading, setLoading] = useState({
    bundles: false,
    discounts: false,
    courses: false,
    actions: false
  });
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedBundles, setSelectedBundles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [discountDetails, setDiscountDetails] = useState({
    percentage: ''
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateDiscountDetails, setUpdateDiscountDetails] = useState({
    resourceId: null,
    percentage: ''
  });

  const { mutateAsync: createDiscount, isPending, isSuccess } = useCreateDiscount();
  const updateDiscountMutation = useUpdateDiscount();
  const { mutateAsync: deleteDiscount, isPending: deleting } = useDeleteDiscount();

  const [value, setValue] = useState(0);
  const groups = [
    { label: 'SPECIAL DISCOUNT', value: 0, icon: <MdDiscount size={20} /> },
    { label: 'PER SEAT', value: 1, icon: <TbRosetteDiscountFilled size={20} /> }
  ];

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const LoadingOverlay = () => (
    // <Fade in={loading.bundles || loading.discounts || loading.courses}>
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <Box sx={{ width: '200px', mb: 2 }}>
        <LinearProgress
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(0, 72, 111, 0.2)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#009688'
            }
          }}
        />
      </Box>
      <Typography
        variant="body1"
        sx={{
          color: '#23436d',
          fontWeight: 500
        }}
      >
        Loading {loading.bundles ? 'bundles' : loading.discounts ? 'discounts' : 'courses'}...
      </Typography>
    </Box>
    // </Fade>
  );

  const { data: discountsData, refetch: fetchDiscounts, isLoading: isDiscountsLoading } = useDiscounts();

  useEffect(() => {
    setLoading(prev => ({ ...prev, discounts: isDiscountsLoading }));
    if (discountsData?.data) {
      setBundleDiscounts(discountsData?.data);
      setLoading(prev => ({ ...prev, discounts: false }));
    }
  }, [discountsData, isDiscountsLoading]);

  const updateDiscount = async (e) => {
    try {
      setLoading(prev => ({ ...prev, actions: true }));
      const payload = {
        percentage: updateDiscountDetails.percentage
      };

      const result = await updateDiscountMutation.mutateAsync({
        id: updateDiscountDetails.resourceId,
        payload
      });


      toast({
        message: `Discount Updated Successfully`,
        type: 'success'
      });
      setShowUpdateModal(false);
    } catch (error) {
      toast({
        message: `Error updating discount`,
        type: 'error'
      });
      console.error('Error updating discount:', error);
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };

  const handleModalOpen = () => {
    if ((!selectedCourses || selectedCourses.length === 0) && (!selectedBundles || selectedBundles.length === 0)) {
      toast({
        message: `Select at least one course or bundle`,
        type: 'error'
      });
      return;
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDiscountDetails((prev) => ({ ...prev, [name]: value }));
  };

  const applyDiscount = async () => {
    setLoading(prev => ({ ...prev, actions: true }));
    const discountData = {
      percentage: discountDetails.percentage
    };

    try {
      const existingDiscountedCourses = [];
      const existingDiscountedBundles = [];
      let successfulApplications = 0;

      const payload = {
        ...discountData,
        bundleIds: selectedBundles
      };

      const response = await createDiscount(payload);

      if (!response.success) {
        toast({
          message: `Failed to add discount : ${response.data.message}`,
          type: 'error'
        });
      } else {
        successfulApplications = response?.data?.length || 1;
      }

      if (existingDiscountedBundles.length > 0) {
        toast({
          message: `${existingDiscountedBundles.length} bundle(s) already have active discounts.`,
          type: 'error'
        });
      }
      if (successfulApplications > 0) {
        toast({
          message: `Successfully applied ${successfulApplications} discount(s).`,
          type: 'success'
        });
      }

      await Promise.all([refechBundles(), fetchDiscounts()]);
      setShowModal(false);
    } catch (error) {
      toast({
        message: `An error occurred while applying the discounts`,
        type: 'error'
      });
      console.error('Error applying discount:', error);
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };

  const { data: bundles, refetch: refechBundles, isLoading: isBundlesLoading } = useBundles({});

  useEffect(() => {
    setLoading(prev => ({ ...prev, bundles: isBundlesLoading }));
    if (bundles?.data) {
      setBundlesData(bundles?.data);
      setLoading(prev => ({ ...prev, bundles: false }));
    }
  }, [bundles, isBundlesLoading, currentUser.email]);

  const deleteDiscounts = async () => {
    setLoading(prev => ({ ...prev, actions: true }));
    try {
      const nonDiscountedCourses = [];
      const nonDiscountedBundles = [];
      let successfulDeletions = 0;

      for (const bundleId of selectedBundles) {
        const discount = getDiscountForBundle(bundleId, bundleDiscounts);

        if (!discount) {
          nonDiscountedBundles.push(bundleId);
          continue;
        }

        const response = await deleteDiscount(discount.id);

        if (!response.success) {
          if (response.message === 'No active discount found for the selected resource.') {
            nonDiscountedBundles.push(bundleId);
          } else {
            toast({
              message: `Failed to delete discount for bundle ${bundleId}: ${response.message}`,
              type: 'error'
            });
          }
        } else {
          successfulDeletions++;
        }
      }

      if (nonDiscountedCourses.length > 0) {
        toast({
          message: `${nonDiscountedCourses.length} course(s) did not have active discounts.`,
          type: 'error'
        });
      }
      if (nonDiscountedBundles.length > 0) {
        toast({
          message: `${nonDiscountedBundles.length} bundle(s) did not have active discounts.`,
          type: 'error'
        });
      }
      if (successfulDeletions > 0) {
        toast({
          message: `Successfully deleted ${successfulDeletions} discount(s).`,
          type: 'success'
        });
      }
      setShowDeleteConfirmation(false);
      setSelectedCourses([]);
      setSelectedBundles([]);
    } catch (error) {
      console.error('Error deleting discounts:', error);
      toast({
        message: 'An error occurred while deleting the discounts.',
        type: 'error'
      });
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };

  const handleBundleSelection = (bundleId) => {
    setSelectedBundles((prev) => (prev.includes(bundleId) ? prev.filter((id) => id !== bundleId) : [...prev, bundleId]));
  };

  const handleUpdateModalOpen = (itemId, discount) => {
    setUpdateDiscountDetails({
      resourceId: discount.id,
      percentage: discount.percentage
    });
    setShowUpdateModal(true);
  };

  const handleDeleteModalOpen = () => {
    if ((!selectedCourses || selectedCourses.length === 0) && (!selectedBundles || selectedBundles.length === 0)) {
      toast({
        message: 'Select at least one course or bundle to delete discount',
        type: 'error'
      });
      return;
    }
    setShowDeleteConfirmation(true);
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateDiscountDetails((prev) => ({ ...prev, [name]: value }));
  };

  const hasDiscountCourse = selectedCourses.some((courseId) => courseDiscounts[courseId] && courseDiscounts[courseId].enable === 'true');
  const hasDiscountBundle = selectedBundles.some((bundleId) => bundleDiscounts.some((discount) => discount.bundleId === bundleId));

  const handleToggleAllBundles = () => {
    if (selectedBundles.length === bundlesData.length) {
      setSelectedBundles([]);
    } else {
      setSelectedBundles(bundlesData.map((bundle) => bundle.id));
    }
  };

  const getDiscountForBundle = (bundleId, bundleDiscounts) => {
    if (!bundleDiscounts) return null;
    for (const discount of bundleDiscounts) {
      if (discount.bundleId === bundleId) {
        return {
          ...discount,
          enable: true
        };
      }
    }
    return null;
  };

  return (
    <>
      {(loading.bundles || loading.discounts || loading.courses) && <LoadingOverlay />}
      <Box>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          {groups.map((group, index) => (
            <Tab
              key={index}
              label={group.label}
              icon={group.icon}
              iconPosition="start"
              value={group.value}
            />
          ))}
        </Tabs>
      </Box>

      <Box value={value} index={0} role="tabpanel" hidden={value !== 0}>
        {value === 0 && (
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}
            >
              <Typography variant="h4" gutterBottom>
                Bundles
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  onClick={handleToggleAllBundles}
                  variant="contained"
                  disabled={loading.bundles || loading.discounts}
                >
                  {selectedBundles.length === bundlesData.length ? 'Deselect' : 'Select'} All Bundles
                </Button>
              </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              {bundlesData.map((bundle) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={bundle.bundleId}>
                  <AnalyticEcommerce
                    item={bundle}
                    isSelected={selectedBundles.includes(bundle.id)}
                    onSelect={handleBundleSelection}
                    discount={getDiscountForBundle(bundle.id, bundleDiscounts)}
                    onUpdateDiscount={handleUpdateModalOpen}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          position: 'fixed',
          top: '5rem',
          right: '1rem',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}
      >
        {(selectedCourses.length > 0 || selectedBundles.length > 0) && !hasDiscountCourse && !hasDiscountBundle && (
          <Tooltip title="Create Discount" placement="left">
            <Fab
              color="primary"
              onClick={handleModalOpen}
              aria-label="add"
              disabled={loading.actions}
            >
              <Add style={{ fontSize: '1.3rem' }} />
            </Fab>
          </Tooltip>
        )}
        {(hasDiscountCourse || hasDiscountBundle) && (
          <Tooltip title="Delete Discount" placement="left">
            <Fab
              color="error"
              onClick={handleDeleteModalOpen}
              aria-label="delete"
              disabled={loading.actions}
            >
              <FaTrash />
            </Fab>
          </Tooltip>
        )}
      </Box>

      <Box value={value} index={1} role="tabpanel" hidden={value !== 1}>
        {value === 1 && (
          <Box sx={{ p: 3 }}>
            <SeatDiscountConfig />
          </Box>
        )}
      </Box>

      <>
        <Dialog
          open={showModal}
          onClose={() => setShowModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create Discount</DialogTitle>
          <DialogContent>
            <InputLabel htmlFor="discountpercentage" sx={{ mb: 0.5 }}>
              Discount Percentage
            </InputLabel>
            <TextField
              autoFocus
              margin="dense"
              name="percentage"
              id="discountpercentage"
              type="number"
              fullWidth
              variant="outlined"
              value={discountDetails.percentage}
              onChange={handleInputChange}
              disabled={loading.actions}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setShowModal(false)}
              color="error"
              disabled={loading.actions}
            >
              Cancel
            </Button>
            <Button
              onClick={applyDiscount}
              variant="contained"
              disabled={loading.actions || isPending}
            >
              {loading.actions || isPending ? 'Applying...' : 'Apply Discount'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          maxWidth="sm"
          fullWidth
          open={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
        >
          <DialogTitle>Update Discount</DialogTitle>
          <DialogContent>
            <InputLabel htmlFor="Discount Percentage" sx={{ mb: 0.5 }}>
              Discount Percentage
            </InputLabel>
            <TextField
              autoFocus
              margin="dense"
              name="percentage"
              id="Discount Percentage"
              type="number"
              fullWidth
              variant="outlined"
              value={updateDiscountDetails.percentage}
              onChange={handleUpdateInputChange}
              disabled={loading.actions}
            />
          </DialogContent>
          <DialogActions>
            <Button
              color="error"
              onClick={() => setShowUpdateModal(false)}
              disabled={loading.actions}
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                updateDiscount();
              }}
              variant="contained"
              disabled={loading.actions || updateDiscountMutation.isPending}
            >
              {loading.actions || updateDiscountMutation.isPending ? 'Updating...' : 'Update Discount'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete the selected discounts? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setShowDeleteConfirmation(false)}
              disabled={loading.actions}
            >
              Cancel
            </Button>
            <Button
              disabled={loading.actions || deleting}
              onClick={deleteDiscounts}
              variant="contained"
              color="error"
            >
              {loading.actions || deleting ? 'Deleting...' : 'Delete Discounts'}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </>
  );
};

export default DiscountPage;