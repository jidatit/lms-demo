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
    Typography
} from '@mui/material';
import { useState } from 'react';
import { toast } from 'utils/toast';
import { useCreateUser } from 'api/queries/users';

const AddPartnerDialog = ({ open, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });

    const { mutateAsync: createUser, isPending } = useCreateUser();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmed = {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim().toLowerCase()
        };

        if (!trimmed.firstName || !trimmed.lastName || !trimmed.email) {
            toast({ message: 'All fields are required', type: 'error' });
            return;
        }

        try {
            await createUser({
                ...trimmed,
                role: 'contributor',
                signInType: 'withPassword'
            });

            toast({ message: 'Partner created successfully', type: 'success' });
            onSuccess?.();                    // refresh table
            onClose();                        // close modal
            setFormData({ firstName: '', lastName: '', email: '' }); // reset
        } catch (error) {
            // ✅ Extract message safely from API response
            const message =
                error?.response?.data?.error?.message ||
                error?.message ||
                'Something went wrong. Please try again.';

            toast({
                message,
                type: 'error'
            });
        }
    };

    const handleClose = () => {
        if (!isPending) {
            onClose();
            setFormData({ firstName: '', lastName: '', email: '' });
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Typography variant="h6" component="div">
                    Add New Partner
                </Typography>
            </DialogTitle>

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Box sx={{ pt: 1 }}>
                        <InputLabel htmlFor="firstName" sx={{ mb: 0.5 }} required>
                            First Name
                        </InputLabel>
                        <TextField
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="John"
                            fullWidth
                            required
                            autoFocus
                            margin="dense"
                            disabled={isPending}
                        />

                        <InputLabel htmlFor="lastName" sx={{ mt: 2, mb: 0.5 }} required>
                            Last Name
                        </InputLabel>
                        <TextField
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Doe"
                            fullWidth
                            required
                            margin="dense"
                            disabled={isPending}
                        />

                        <InputLabel htmlFor="email" sx={{ mt: 2, mb: 0.5 }} required>
                            Email Address
                        </InputLabel>
                        <TextField
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            fullWidth
                            required
                            margin="dense"
                            disabled={isPending}
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleClose} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={isPending}
                        startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isPending ? 'Creating...' : 'Create Partner'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default AddPartnerDialog;