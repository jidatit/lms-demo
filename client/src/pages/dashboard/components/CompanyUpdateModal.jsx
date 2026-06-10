import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, InputLabel, Box, CircularProgress } from '@mui/material';
import { toast } from 'utils/toast';
import { useCreateCompany, useUpdateCompany } from 'api/queries/companies';

const UpdateCompanyModal = ({ open, onClose, company }) => {
  //   const isCreatingCompany = false;
  const { mutateAsync: updateCompany, isPending: isCreatingCompany } = useUpdateCompany();
  // const = useUpdateCompany();
  //   const updateCompany = useUpdateCompany();

  const [formData, setFormData] = useState({
    name: company?.name || '',
    address: company?.address || '',
    vatNumber: company?.vatNumber || '',
    email: company?.email || ''
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        address: company.address || '',
        vatNumber: company.vatNumber || '',
        email: company.email || ''
      });
    }
  }, [company]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        vatNumber: formData.vatNumber.trim(),
        email: formData.email.trim()
      };

      // Basic validation
      if (!payload.name) {
        toast({ message: 'Company name is required', type: 'error' });
        return;
      }

      if (!payload.email) {
        toast({ message: 'Company email is required', type: 'error' });
        return;
      }

      //   const response = await createCompany(payload);
      const response = await updateCompany({
        companyId: company.id,
        companyData: payload
      });

      if (response.success) {
        toast({
          message: 'Company updated successfully!',
          type: 'success'
        });

        // Reset form
        setFormData({
          name: '',
          address: '',
          vatNumber: '',
          email: ''
        });



        // Close modal
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      let errorMessage = error.message || 'Failed to create company';

      if (error.message?.includes('VAT number is required')) {
        errorMessage = 'VAT Number is required, must be 8–15 characters long, and contain only uppercase letters (A–Z) and numbers (0–9).';
      } else if (error.message?.includes('email')) {
        errorMessage = 'Please provide a valid company email address.';
      }

      toast({
        message: errorMessage,
        type: 'error'
      });
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: '',
      address: '',
      vatNumber: '',
      email: ''
    });

    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit
      }}
    >
      <DialogTitle>Edit Company</DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <InputLabel htmlFor="name" sx={{ mb: 0.5 }}>
            Company Name *
          </InputLabel>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            disabled={isCreatingCompany}
            placeholder="Enter company name"
          />

          <InputLabel htmlFor="address" sx={{ mt: 2, mb: 0.5 }}>
            Company Address
          </InputLabel>
          <TextField
            margin="dense"
            id="address"
            name="address"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.address}
            onChange={handleChange}
            disabled={isCreatingCompany}
            placeholder="Enter company address"
          />

          <InputLabel htmlFor="vatNumber" sx={{ mt: 2, mb: 0.5 }}>
            VAT Number
          </InputLabel>
          <TextField
            margin="dense"
            id="vatNumber"
            name="vatNumber"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.vatNumber}
            onChange={handleChange}
            disabled={isCreatingCompany}
            placeholder="Enter VAT number"
          />

          <InputLabel htmlFor="email" sx={{ mt: 2, mb: 0.5 }}>
            Company Email *
          </InputLabel>
          <TextField
            required
            margin="dense"
            id="email"
            name="email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleChange}
            disabled={isCreatingCompany}
            placeholder="company@example.com"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="error" disabled={isCreatingCompany}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={isCreatingCompany || !formData.name.trim() || !formData.email.trim()}>
          {isCreatingCompany ? <CircularProgress size={24} /> : 'Update Company'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateCompanyModal;
