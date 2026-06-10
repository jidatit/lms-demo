// components/SupportAgentModal.jsx
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
    CircularProgress
} from '@mui/material';
import { toast } from 'utils/toast';
import { useCreateUser } from 'api/queries/users';


const SupportAgentModal = ({ open, onClose, onAgentCreated }) => {
    const { mutateAsync: createUser, isPending } = useCreateUser();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });

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
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                role: 'supportAgent',
                signInType: 'withPassword'
            };

            if (!payload.firstName || !payload.lastName) {
                toast({ message: 'First and last name are required', type: 'error' });
                return;
            }

            if (!payload.email) {
                toast({ message: 'Email is required', type: 'error' });
                return;
            }

            const response = await createUser(payload);

            if (response.success) {
                toast({
                    message: 'Support Agent created successfully!',
                    type: 'success'
                });

                setFormData({
                    firstName: '',
                    lastName: '',
                    email: ''
                });

                if (onAgentCreated) {
                    onAgentCreated(response.data);
                }

                if (onClose) {
                    onClose();
                }
            }
        } catch (error) {
            let errorMessage = error.message || 'Failed to create support agent';

            // if (error.message?.includes('email')) {
            //     errorMessage = 'Please provide a valid email address.';
            // }

            toast({
                message: errorMessage,
                type: 'error'
            });
        }
    };

    const handleClose = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: ''
        });
        if (onClose) onClose();
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
            <DialogTitle>Create Support Agent</DialogTitle>

            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    <InputLabel htmlFor="firstName" sx={{ mb: 0.5 }}>
                        First Name *
                    </InputLabel>
                    <TextField
                        required
                        margin="dense"
                        id="firstName"
                        name="firstName"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={isPending}
                        placeholder="Enter first name"
                    />

                    <InputLabel htmlFor="lastName" sx={{ mt: 2, mb: 0.5 }}>
                        Last Name *
                    </InputLabel>
                    <TextField
                        required
                        margin="dense"
                        id="lastName"
                        name="lastName"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={isPending}
                        placeholder="Enter last name"
                    />

                    <InputLabel htmlFor="email" sx={{ mt: 2, mb: 0.5 }}>
                        Email *
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
                        disabled={isPending}
                        placeholder="agent@example.com"
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} color="error" disabled={isPending}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isPending || !formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()}
                >
                    {isPending ? <CircularProgress size={24} /> : 'Create Agent'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SupportAgentModal;
