// components/CompanyModal.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputLabel,
  Box,
  CircularProgress,
  Grid,
} from '@mui/material';
import { toast } from 'utils/toast';
import { useCreateCompany } from 'api/queries/companies';

const CompanyModal = ({ open, onClose }) => {
  const { mutateAsync: createCompany, isPending: isCreatingCompany } = useCreateCompany();

  const [formData, setFormData] = useState({
    name: '',
    street: '',

    city: '',
    country: '',
    vatNumber: '',
    email: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const buildAddress = () => {
    const parts = [];

    if (formData.street) parts.push(formData.street.trim());
    if (formData.city) parts.push(formData.city.trim());

    const line1 = parts.join(', ');
    const countryPart = formData.country ? formData.country.trim() : '';

    // Return nice multi-line format: Street + City on first line, Country on second
    return countryPart ? `${line1}\n${countryPart}` : line1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required field checks
    if (!formData.name.trim()) {
      toast({ message: 'Organization name is required', type: 'error' });
      return;
    }
    if (!formData.email.trim()) {
      toast({ message: 'Organization email is required', type: 'error' });
      return;
    }
    if (!formData.street.trim() || !formData.city.trim() || !formData.country.trim()) {
      toast({ message: 'Street, City and Country are required', type: 'error' });
      return;
    }

    const payload = {
      name: formData.name.trim(),
      address: buildAddress(), // ← combined into one string
      vatNumber: formData.vatNumber.trim(),
      email: formData.email.trim(),
    };

    try {
      const response = await createCompany(payload);
      if (response?.success) {
        toast({ message: 'Organization created successfully!', type: 'success' });
        setFormData({
          name: '',
          street: '',
          city: '',
          country: '',
          vatNumber: '',
          email: '',
        });
        onClose?.();
      } else {
        const msg = response?.message || 'Failed to create Organization';
        toast({ message: msg, type: 'error' });
      }
    } catch (error) {
      let msg = error?.message || 'Failed to create Organization';

      if (msg.toLowerCase().includes('vat')) {
        msg = 'VAT Number must be 8–15 uppercase letters/numbers.';
      } else if (msg.toLowerCase().includes('email')) {
        msg = 'Please enter a valid email address.';
      }

      toast({ message: msg, type: 'error' });
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      street: '',
      city: '',
      country: '',
      vatNumber: '',
      email: '',
    });
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>Create New Organization</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ pt: 1 }}>
          {/* Company Name */}
          <InputLabel htmlFor="name" sx={{ mb: 0.5 }}>
            Organization Name *
          </InputLabel>
          <TextField
            autoFocus
            required
            fullWidth
            margin="dense"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isCreatingCompany}
            placeholder="Acme Corp"
          />

          {/* Address Fields – Structured */}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* First Line: Street */}
            <Grid item xs={12}>
              <InputLabel htmlFor="street">Street & Number *</InputLabel>
              <TextField
                required
                fullWidth
                margin="dense"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                disabled={isCreatingCompany}
                placeholder="Rue de la Loi 100"
              />
            </Grid>

            {/* Second Line: City and Country side by side */}
            <Grid item xs={6}>
              <InputLabel htmlFor="city">City *</InputLabel>
              <TextField
                required
                fullWidth
                margin="dense"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={isCreatingCompany}
                placeholder="Brussels"
              />
            </Grid>

            <Grid item xs={6}>
              <InputLabel htmlFor="country">Country *</InputLabel>
              <TextField
                required
                fullWidth
                margin="dense"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled={isCreatingCompany}
                placeholder="Belgium"
              />
            </Grid>
          </Grid>

          {/* VAT Number */}
          <InputLabel htmlFor="vatNumber" sx={{ mt: 2, mb: 0.5 }}>
            VAT Number
          </InputLabel>
          <TextField
            fullWidth
            margin="dense"
            id="vatNumber"
            name="vatNumber"
            value={formData.vatNumber}
            onChange={handleChange}
            disabled={isCreatingCompany}
            placeholder="BE0123456789"
          />

          {/* Email */}
          <InputLabel htmlFor="email" sx={{ mt: 2, mb: 0.5 }}>
            Organization Email *
          </InputLabel>
          <TextField
            required
            fullWidth
            margin="dense"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isCreatingCompany}
            placeholder="contact@acme.com"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={isCreatingCompany}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={
            isCreatingCompany ||
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.street.trim() ||
            !formData.city.trim() ||
            !formData.country.trim()
          }
        >
          {isCreatingCompany ? <CircularProgress size={24} /> : 'Create Organization'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompanyModal;