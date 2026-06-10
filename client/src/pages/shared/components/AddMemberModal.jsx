import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    InputLabel,
    Typography
} from '@mui/material';
import { useCreateGroupMember } from 'api/queries/groups';
import { toast } from 'utils/toast';

const AddMemberModal = ({ open, onClose, role, companyId, groupId, onSuccess }) => {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
    const mutation = useCreateGroupMember();

    const handleSubmit = () => {
        if (!companyId || !groupId) {
            toast({ message: 'Please select Company & Group first', type: 'warning' });
            return;
        }

        mutation.mutate(
            {
                groupId,
                userData: {
                    ...form,
                    email: form.email.trim().toLowerCase(),
                    role,
                    signInType: 'passwordless' // or from group
                }
            },
            {
                onSuccess: () => {
                    toast({ message: `${role === 'groupLeader' ? 'Group Leader' : 'Staff'} added`, type: 'success' });
                    setForm({ firstName: '', lastName: '', email: '' });
                    onClose();
                    onSuccess?.();
                },
                onError: (err) => toast({ message: err.message || 'Failed', type: 'error' })
            }
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add {role === 'groupLeader' ? 'Group Leader' : 'Staff'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <div>
                        <InputLabel>Company</InputLabel>
                        <Typography variant="body2" color="text.secondary">
                            {companyId ? 'Selected' : 'Select from filter first'}
                        </Typography>
                    </div>
                    <div>
                        <InputLabel>Group</InputLabel>
                        <Typography variant="body2" color="text.secondary">
                            {groupId || 'Select from filter first'}
                        </Typography>
                    </div>
                    <TextField
                        label="First Name"
                        fullWidth
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    />
                    <TextField
                        label="Last Name"
                        fullWidth
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    />
                    <TextField
                        label="Email"
                        fullWidth
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={mutation.isLoading || !form.firstName || !form.email}
                >
                    {mutation.isLoading ? 'Adding...' : 'Add'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddMemberModal;