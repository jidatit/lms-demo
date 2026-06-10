import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    TextField,
    InputLabel,
    FormLabel,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Stepper,
    Step,
    StepLabel,
    Stack,
    Select,
    MenuItem,
} from '@mui/material';
import { toast } from 'utils/toast';
import { useCompanies } from 'api/queries/companies';
import { useAuth } from 'contexts/AuthContext';
import { createGophishGroup, deleteGophishGroup } from 'utils/gophishUtils';
import { useCreateGroupWithLeader } from 'api/queries/groups';

const steps = ['Select Organization', 'Group Details', 'Group Leader'];

const AddGroupModal = ({ open, onClose, onSuccess }) => {
    const { currentUser } = useAuth();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // ==================== FORM STATE ====================
    const [formData, setFormData] = useState({
        // Step 1: Company
        company_id: '',

        // Step 2: Group Details
        groupName: '',
        signInType: 'passwordless',

        // Step 3: Group Leader
        gl_firstName: '',
        gl_lastName: '',
        gl_email: '',
    });

    // ==================== QUERIES ====================
    const { data: companiesData } = useCompanies({
        createdBy: currentUser?.id,
    });
    const companies = companiesData?.data || [];

    const { mutateAsync: createGroup } = useCreateGroupWithLeader();

    // ==================== STEP NAVIGATION ====================
    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            handleGroupSubmit();
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    // ==================== GROUP SUBMISSION ====================
    const handleGroupSubmit = async () => {
        setLoading(true);
        let gophishGroupId = null;

        try {
            // Step 1: Create group in GoPhish
            const targets = [
                {
                    email: formData.gl_email,
                    first_name: formData.gl_firstName,
                    last_name: formData.gl_lastName,
                    position: 'Group Leader',
                },
            ];

            const gophishGroup = await createGophishGroup(formData.groupName, targets);
            gophishGroupId = gophishGroup.id;

            // Step 2: Create group in backend
            const payload = {
                name: formData.groupName,
                companyId: formData.company_id,
                signInType: formData.signInType,
                gophishGroupID: gophishGroupId,
                groupLeader: {
                    firstName: formData.gl_firstName,
                    lastName: formData.gl_lastName,
                    email: formData.gl_email,
                    signInType: formData.signInType,
                },
            };

            const response = await createGroup(payload);

            toast({
                message: response.message || 'Group created successfully!',
                type: 'success',
            });

            // Reset form and close modal
            handleCloseModal();

            // Trigger parent refetch
            if (onSuccess) {
                onSuccess(response.data);
            }
        } catch (error) {
            // Rollback: Delete GoPhish group if backend fails
            if (gophishGroupId) {
                await deleteGophishGroup(gophishGroupId);
            }

            const backendMessage = error?.error?.message || error?.message || '';
            let userMessage;

            if (backendMessage.includes('Mailbox does not exist')) {
                userMessage = 'The provided email address does not exist. Please verify the email.';
            } else if (backendMessage.includes('Failed to send OTP email')) {
                userMessage = 'Could not send verification email. Please check the email address.';
            } else if (backendMessage.includes('already exists')) {
                userMessage = 'A group with this name already exists in the selected Organization.';
            } else {
                userMessage = backendMessage || 'Failed to create group';
            }

            toast({
                message: userMessage,
                type: 'error',
            });

            console.error('Failed to create group:', error);
        } finally {
            setLoading(false);
        }
    };

    // ==================== MODAL CLOSE ====================
    const handleCloseModal = () => {
        setActiveStep(0);
        setFormData({
            company_id: '',
            groupName: '',
            signInType: 'passwordless',
            gl_firstName: '',
            gl_lastName: '',
            gl_email: '',
        });
        onClose();
    };

    // ==================== STEP CONTENT ====================
    const getStepContent = (step) => {
        switch (step) {
            // STEP 0: SELECT COMPANY
            case 0:
                return (
                    <DialogContent>
                        <FormLabel>Select Organization</FormLabel>

                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Select Organization *</InputLabel>
                            <Select
                                value={formData.company_id}
                                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                                label="Select Organization *"
                                disabled={loading}
                            >
                                <MenuItem value="" disabled>
                                    Select an Organization
                                </MenuItem>
                                {companies.map((company) => (
                                    <MenuItem key={company.id} value={company.id}>
                                        {company.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                );

            // STEP 1: GROUP DETAILS
            case 1:
                return (
                    <DialogContent>
                        <InputLabel sx={{ mb: 0.5 }}>Group Name *</InputLabel>
                        <TextField
                            required
                            fullWidth
                            value={formData.groupName}
                            onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                            disabled={loading}
                            placeholder="Enter group name"
                        />

                        <FormLabel sx={{ mt: 3, display: 'block' }}>Sign-In Type</FormLabel>
                        <RadioGroup
                            value={formData.signInType}
                            onChange={(e) => setFormData({ ...formData, signInType: e.target.value })}
                        >
                            <FormControlLabel value="passwordless" control={<Radio />} label="Passwordless" />
                            <FormControlLabel value="withPassword" control={<Radio />} label="With Password" />
                            <FormControlLabel
                                value="microsoftEntraID"
                                control={<Radio />}
                                label="Microsoft Entra ID"
                            />
                        </RadioGroup>
                    </DialogContent>
                );

            // STEP 2: GROUP LEADER
            case 2:
                return (
                    <DialogContent>
                        <InputLabel sx={{ mb: 0.5 }}>First Name *</InputLabel>
                        <TextField
                            required
                            fullWidth
                            value={formData.gl_firstName}
                            onChange={(e) => setFormData({ ...formData, gl_firstName: e.target.value })}
                            disabled={loading}
                            placeholder="Enter first name"
                        />

                        <InputLabel sx={{ mt: 2, mb: 0.5 }}>Last Name *</InputLabel>
                        <TextField
                            required
                            fullWidth
                            value={formData.gl_lastName}
                            onChange={(e) => setFormData({ ...formData, gl_lastName: e.target.value })}
                            disabled={loading}
                            placeholder="Enter last name"
                        />

                        <InputLabel sx={{ mt: 2, mb: 0.5 }}>Email *</InputLabel>
                        <TextField
                            required
                            fullWidth
                            type="email"
                            value={formData.gl_email}
                            onChange={(e) => setFormData({ ...formData, gl_email: e.target.value })}
                            disabled={loading}
                            placeholder="groupleader@example.com"
                        />
                    </DialogContent>
                );

            default:
                return null;
        }
    };

    // ==================== VALIDATION ====================
    const isStepValid = () => {
        switch (activeStep) {
            case 0:
                // Company step: Must have company_id selected
                return !!formData.company_id;
            case 1:
                // Group details: Must have group name
                return !!formData.groupName.trim();
            case 2:
                // Group leader: Must have all required fields
                return (
                    !!formData.gl_firstName.trim() &&
                    !!formData.gl_lastName.trim() &&
                    !!formData.gl_email.trim()
                );
            default:
                return false;
        }
    };

    // ==================== RENDER ====================
    return (
        <Dialog open={open} onClose={handleCloseModal} fullWidth maxWidth="sm">
            <DialogTitle>Add Group</DialogTitle>

            <Stepper activeStep={activeStep} sx={{ pt: 2, pb: 1, px: 2 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {getStepContent(activeStep)}

            <Stack
                direction="row"
                justifyContent={activeStep !== 0 ? 'space-between' : 'flex-end'}
                sx={{ marginX: 2, mb: 2 }}
            >
                {activeStep !== 0 && (
                    <Button onClick={handleBack} disabled={loading}>
                        Back
                    </Button>
                )}
                <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={loading || !isStepValid()}
                >
                    {activeStep === steps.length - 1 ? (loading ? 'Creating...' : 'Create Group') : 'Next'}
                </Button>
            </Stack>
        </Dialog>
    );
};

export default AddGroupModal;