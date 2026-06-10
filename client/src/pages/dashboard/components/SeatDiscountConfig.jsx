import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Fade,
  Grid,
  IconButton,
  InputLabel,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';

import MainCard from 'components/MainCard';
import axiosInstance from 'utils/axiosConfig';
import { DiscountCircle, Edit, PercentageCircle, Trash } from 'iconsax-react';
import { BiUserCheck } from 'react-icons/bi';
import { toast } from 'utils/toast';
import { useCreateDiscount, useDeleteDiscount, useDiscounts, useUpdateDiscount } from 'api/queries/discounts';
// import AddIcon from "@mui/icons-material/Add";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import axiosInstance from "../../utils/axiosConfig";

export default function SeatDiscountConfig() {
  const [discounts, setDiscounts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [newDiscount, setNewDiscount] = useState({
    seats: {
      seatsThreshold: 0,
      percentage: 0
    },
    percentage: ''
  });
  const [loading, setLoading] = useState(false);


  const { mutateAsync: createDiscount, isPending, isSuccess } = useCreateDiscount();
  const { mutateAsync: updateDiscount, isPending: updating } = useUpdateDiscount();
  const { data: discountsData, refetch: fetchDiscounts } = useDiscounts();

  const handleOpen = (index = -1) => {
    setEditIndex(index);
    if (index >= 0) {
      setNewDiscount(discounts[index]);
    } else {
      setNewDiscount({ seats: '', percentage: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditIndex(-1);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const endpoint = editIndex >= 0 ? '/seats_discounts/update' : '/seats_discounts/add';
      const payload = {
        seats: {
          percentage: Number(newDiscount?.percentage),
          seatsThreshold: Number(newDiscount?.seats?.seatsThreshold)
        },
        percentage: Number(newDiscount?.percentage)
      };

      const response = editIndex >= 0 ? await updateDiscount({ id: newDiscount?.id, payload }) : await createDiscount(payload);

      // const response = await axiosInstance[editIndex >= 0 ? 'put' : 'post'](endpoint, payload);

      if (response.success) {
        toast({ message: `${editIndex >= 0 ? 'Discount updated successfully' : 'Discount added successfully'}`, type: 'success' });

        if (editIndex >= 0) {
          setDiscounts(discounts.map((discount, i) => (i === editIndex ? newDiscount : discount)));
        } else {
          // fetchDiscounts();|
          fetchDiscounts();
        }
      } else {
        toast({ message: `Failed to ${editIndex >= 0 ? 'update' : 'add'} discount: ${response.message}`, type: 'error' });
      }
    } catch (error) {
      toast({ message: `Error ${editIndex >= 0 ? 'updating' : 'adding'} discount: ${error}`, type: 'error' });
      console.log(`Error ${editIndex >= 0 ? 'updating' : 'adding'} discount: ${error}`);
    }
    setLoading(false);
    handleClose();
  };
  const { mutateAsync: deleteDiscount } = useDeleteDiscount();
  const removeDiscount = async (index) => {
    setLoading(true);
    const discountToDelete = discounts[index];

    console.log(discountToDelete);

    try {
      // const response = await axiosInstance.delete('/seats_discounts/delete', {
      //   data: { seats: discountToDelete.seats }
      // });
      const response = await deleteDiscount(discountToDelete.id);


      if (response?.success) {
        // toast.success("Discount Deleted Successfully");
        toast({
          message: `Discount Deleted Successfully`,
          type: 'success'
        });

        setDiscounts(discounts.filter((_, i) => i !== index));
      } else {
        // toast.error(`Failed to delete discount: ${response.data.message}`);
        toast({
          message: `Failed to delete discount`,
          type: 'error'
        });
        console.log(`Failed to delete discount: ${response.data.message}`);
      }
    } catch (error) {
      // toast.error(`Error deleting discount: ${error}`);
      toast({
        message: `Failed to delete discount`,
        type: 'error'
      });
      console.log(`Error deleting discount: ${error}`);
    }
    setLoading(false);
  };


  useEffect(() => {
    // fetchDiscounts();
    if (discountsData?.data) {
      // const seatdiscounts = discountsData?.data.filter((discount) => discount.seats);
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

      console.log('discountsData', seatDiscounts);
      setDiscounts(seatDiscounts);
    }
  }, [discountsData]);

  return (
    <>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Typography variant="h4" gutterBottom>
            Seat-based Discount Configuration
          </Typography>
          <Button onClick={() => handleOpen()} variant="contained" color="primary">
            Add Discount Tier
          </Button>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 3,
            mb: 4
          }}
        >
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // backgroundColor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 1
              }}
            >
              <CircularProgress sx={{ color: 'gray' }} />
            </Box>
          )}
          {/* Mapping over discounts to create MainCard components */}
          {discounts.map((discount, index) => (
            <MainCard
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '24px',
                flexGrow: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-5px)'
                }
              }}
              key={index}
              selected={false}
            >
              <Stack
                spacing={2} // Adjust spacing between items
                sx={{
                  display: 'flex',

                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DiscountCircle
                      size={24}
                      style={{
                        marginRight: '10px',
                        color: 'gray'
                      }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      Discount Tier {index + 1}
                    </Typography>
                  </Box>

                  <Chip
                    variant="combined"
                    color="primary"
                    label={
                      <Typography variant="h6" color="error">
                        {discount.percentage}% off
                      </Typography>
                    }
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    size="small"
                  />
                </Box>

                <Grid container alignItems="center">
                  <Grid item xs={12} sx={{ ml: 0.4 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BiUserCheck
                          size={20}
                          style={{
                            marginRight: '10px',
                            color: 'gray'
                          }}
                        />
                        <Typography
                          style={{
                            color: 'gray',
                            fontSize: '1.0rem'
                          }}
                        >
                          {discount.seats?.seatsThreshold}
                          <span style={{ fontSize: '0.6rem' }}> Seats</span>
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Tooltip title="Edit Discount">
                          <IconButton color="primary" onClick={() => handleOpen(index)}>
                            <Edit size={20} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Discount">
                          <IconButton color="error" onClick={() => removeDiscount(index)}>
                            <Trash size={20} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </MainCard>
          ))}
        </Box>

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth={'xs'}>
          <DialogTitle>{editIndex >= 0 ? 'Edit' : 'Add'} Discount Tier</DialogTitle>
          <DialogContent>
            <InputLabel htmlFor="Seats" sx={{ mb: 0.5 }}>
              Seats
            </InputLabel>
            <TextField
              id="Seats"
              type="number"
              value={newDiscount?.seats?.seatsThreshold}
              onChange={(e) =>
                setNewDiscount({
                  ...newDiscount,
                  seats: {
                    ...newDiscount.seats,
                    seatsThreshold: e.target.value
                  }
                })
              }
              fullWidth
              margin="normal"
            />
            <InputLabel htmlFor="discount" sx={{ mb: 0.5 }}>
              Discount (%)
            </InputLabel>
            <TextField
              id="discount"
              type="number"
              value={newDiscount.percentage}
              onChange={(e) => setNewDiscount({ ...newDiscount, percentage: e.target.value })}
              fullWidth
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="error">
              Cancel
            </Button>
            <Button onClick={handleSave} variant="contained" disabled={isPending || updating}>
              {isPending || updating ? 'Adding' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}
