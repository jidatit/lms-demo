// components/AssignSeatsModal.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    CircularProgress,
    Typography,
    Card,
    CardContent,
    Chip,
    Stack,
    Divider,
    IconButton,
    Alert,
    Skeleton,
    InputAdornment
} from '@mui/material';
import { CloseCircle, InfoCircle, SearchNormal1 } from 'iconsax-react';
import { toast } from 'utils/toast';
import { useCompanySeatDashboard, useAssignSeats } from 'api/queries/companies';

const AssignSeatsModal = ({ open, onClose, company }) => {
    const [selectedBundleId, setSelectedBundleId] = useState('');
    const [seatsToAssign, setSeatsToAssign] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: dashboardData,
        isLoading: isDashboardLoading,
        error: dashboardError
    } = useCompanySeatDashboard(company?.id);

    const { mutateAsync: assignSeats, isPending: isAssigning } = useAssignSeats();

    const isOwner = dashboardData?.metadata?.isOwner === true;
    const isAdminViewing = dashboardData?.metadata?.isAdminViewing === true;

    // Reset on open/close
    useEffect(() => {
        if (open) {
            setSelectedBundleId('');
            setSeatsToAssign('');
            setSearchQuery('');
        }
    }, [open]);

    const handleClose = () => {
        setSelectedBundleId('');
        setSeatsToAssign('');
        setSearchQuery('');
        onClose?.();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isOwner) return;

        if (!selectedBundleId || !seatsToAssign) {
            toast({ message: 'Please select a bundle and enter seats', type: 'error' });
            return;
        }

        const seats = parseInt(seatsToAssign, 10);
        const bundle = dashboardData?.bundles?.find(b => b.bundleId === selectedBundleId);

        if (seats > bundle.availableToAssign) {
            toast({ message: `Only ${bundle.availableToAssign} seats available`, type: 'error' });
            return;
        }

        try {
            await assignSeats({
                companyId: company.id,
                bundleId: selectedBundleId,
                seatsToAssign: seats
            });

            toast({
                message: `Successfully assigned ${seats} seat${seats > 1 ? 's' : ''}`,
                type: 'success'
            });
            handleClose();
        } catch (err) {
            toast({ message: err.message || 'Failed to assign seats', type: 'error' });
        }
    };

    const filteredBundles = dashboardData?.bundles?.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bundleType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                        Seat Assignments — {company?.name}
                    </Typography>
                    <IconButton onClick={handleClose} disabled={isAssigning}>
                        <CloseCircle size={24} />
                    </IconButton>
                </Box>
            </DialogTitle>

            <Divider />

            <DialogContent>
                {isDashboardLoading ? (
                    <Box py={2}>
                        <Skeleton height={60} sx={{ mb: 2 }} />
                        <Skeleton height={120} sx={{ mb: 2 }} />
                        <Skeleton height={120} />
                    </Box>
                ) : dashboardError ? (
                    <Alert severity="error">Failed to load seat data.</Alert>
                ) : (
                    <Box pt={2}>
                        {/* Read-Only Banner for Admin */}
                        {isAdminViewing && (
                            <Alert severity="info" icon={<InfoCircle size={20} />} sx={{ mb: 3 }}>
                                <strong>Read-only mode:</strong> You are currently viewing seats purchased by the company owner. Only the owner can assign or modify these seats.
                            </Alert>
                        )}


                        {/* No Bundles */}
                        {!dashboardData?.bundles || dashboardData.bundles.length === 0 ? (
                            <Alert severity="info">
                                {isOwner
                                    ? "You haven't purchased any bundles yet."
                                    : "The company owner hasn't purchased any bundles yet."}
                            </Alert>
                        ) : (
                            <>
                                {/* Search (only for owner with many bundles) */}
                                {isOwner && dashboardData.bundles.length > 4 && (
                                    <TextField
                                        fullWidth
                                        placeholder="Search bundles..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        sx={{ mb: 3 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchNormal1 size={20} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                )}

                                {/* Bundles List */}
                                <Stack spacing={2}>
                                    {filteredBundles?.length > 0 ? (
                                        filteredBundles.map((bundle) => (
                                            <Card
                                                key={bundle.bundleId}
                                                variant="outlined"
                                                sx={{
                                                    opacity: isOwner ? 1 : 0.8,
                                                    cursor: isOwner && bundle.availableToAssign > 0 ? 'pointer' : 'default',
                                                    border: selectedBundleId === bundle.bundleId ? 2 : 1,
                                                    borderColor: selectedBundleId === bundle.bundleId ? 'primary.main' : 'divider',
                                                }}
                                                onClick={() => isOwner && bundle.availableToAssign > 0 && setSelectedBundleId(bundle.bundleId)}
                                            >
                                                <CardContent sx={{ py: 2 }}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Box>
                                                            <Typography variant="subtitle1" fontWeight={600}>
                                                                {bundle.title}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {bundle.bundleType}
                                                            </Typography>
                                                        </Box>

                                                        <Stack direction="row" spacing={1}>
                                                            {isAdminViewing && (
                                                                <Chip
                                                                    label={`Owner Purchased: ${bundle.totalPurchased}`}
                                                                    size="small"
                                                                    color="default"
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                            <Chip
                                                                label={`Assigned: ${bundle.assignedToThisCompany}`}
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                            />
                                                            <Chip
                                                                label={`Used: ${bundle.usedInThisCompany}`}
                                                                size="small"
                                                                color="info"
                                                                variant="outlined"
                                                            />
                                                            {isOwner && (
                                                                <Chip
                                                                    label={`Available: ${bundle.availableToAssign}`}
                                                                    size="small"
                                                                    color={bundle.availableToAssign > 0 ? 'success' : 'error'}
                                                                    variant={bundle.availableToAssign > 0 ? 'filled' : 'outlined'}
                                                                />
                                                            )}
                                                        </Stack>
                                                    </Stack>

                                                    {/* Owner-only: Assign input */}
                                                    {isOwner && selectedBundleId === bundle.bundleId && bundle.availableToAssign > 0 && (
                                                        <Box mt={2}>
                                                            <TextField
                                                                fullWidth
                                                                size="small"
                                                                type="number"
                                                                label="Seats to assign"
                                                                value={seatsToAssign}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    if (val === '' || (/^\d+$/.test(val) && parseInt(val) <= bundle.availableToAssign)) {
                                                                        setSeatsToAssign(val);
                                                                    }
                                                                }}
                                                                inputProps={{ min: 1, max: bundle.availableToAssign }}
                                                                helperText={`Max ${bundle.availableToAssign} available`}
                                                            />
                                                        </Box>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <Alert severity="info">No bundles match your search.</Alert>
                                    )}
                                </Stack>
                            </>
                        )}
                    </Box>
                )}
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
                <Button onClick={handleClose} disabled={isAssigning}>
                    Close
                </Button>

                {/* Only owner can submit */}
                {isOwner && (
                    <Button
                        variant="contained"
                        type="submit"
                        onClick={handleSubmit}
                        disabled={
                            isAssigning ||
                            !selectedBundleId ||
                            !seatsToAssign ||
                            parseInt(seatsToAssign || '0') <= 0 ||
                            parseInt(seatsToAssign || '0') > (dashboardData?.bundles?.find(b => b.bundleId === selectedBundleId)?.availableToAssign || 0)
                        }
                    >
                        {isAssigning ? (
                            <>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                Assigning...
                            </>
                        ) : (
                            'Assign Seats'
                        )}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default AssignSeatsModal;