// pages/helpdesk/CreateTicket.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';

// third-party
import { Formik, Form } from 'formik';
import * as yup from 'yup';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import ReactQuillDemo from 'components/third-party/ReactQuill';
import UploadMultiFile from 'components/third-party/dropzone/MultiFile';
import { APP_DEFAULT_PATH } from 'config';
import { useAuth } from 'contexts/AuthContext';
import { useCreateTicket, useHelpdeskCategories } from 'api/queries/helpDesk';
import { toast } from 'utils/toast';
import { getBasePath } from 'utils/getBasePath';

// ---------------------------------------------------------------------

const breadcrumbLinks = [
    { title: 'helpdesk', to: '/contrib_dashboard/helpdesk/ticket-list' },
    { title: 'create ticket' },
];

// ---------------------------------------------------------------------

export default function CreateTicket() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // --- API hooks ---
    const createMutation = useCreateTicket();
    const { data: catData, isLoading: catLoading, error: catError } = useHelpdeskCategories();

    // --- Show error toast if categories fail ---
    useEffect(() => {
        if (catError) {
            toast({
                message: catError.message || 'Error fetching categories!',
                type: 'error'
            });
        }
    }, [catError]);

    // --- Validation schema ---
    const validationSchema = yup.object().shape({
        subject: yup.string().required('Subject is required').min(3, 'Too short').max(255),
        categoryId: yup.string().required('Please select a category'),
        description: yup.string().required('Description is required').min(10, 'Too short'),
        files: yup.mixed().nullable(),
    });

    // --- Handle form submit ---
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {

        // Additional validation for rich text content
        const plainTextDescription = values.description.replace(/<[^>]*>/g, '').trim();
        if (plainTextDescription.length < 10) {
            toast({
                message: 'Description must be at least 10 characters long',
                type: 'error'
            });
            setSubmitting(false);
            return;
        }

        try {
            await createMutation.mutateAsync({
                subject: values.subject,
                categoryId: values.categoryId,
                description: values.description,
                files: values.files,
            });
            toast({
                message: 'Ticket created successfully!',
                type: 'success'
            });
            resetForm();
            navigate(`${getBasePath(currentUser?.role)}/helpdesk/ticket-list`);
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Failed to create ticket';
            toast({
                message: msg,
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* <Breadcrumbs custom heading="Create Ticket" links={breadcrumbLinks} /> */}

            <MainCard>
                <Formik
                    initialValues={{
                        subject: '',
                        categoryId: '',
                        description: '', // Add description to initial values
                        files: null,
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        setFieldValue,
                        isSubmitting,
                    }) => (
                        <Form>
                            <Grid container rowSpacing={2} columnSpacing={2.5}>
                                {/* Customer - Auto-filled */}
                                <Grid item xs={12} sm={6}>
                                    <Stack sx={{ gap: 1 }}>
                                        <InputLabel>Customer</InputLabel>
                                        <TextField
                                            fullWidth
                                            value={`${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim()}
                                            disabled
                                            placeholder="Loading..."
                                        />
                                    </Stack>
                                </Grid>

                                {/* Category - Fetched from API */}
                                <Grid item xs={12} sm={6}>
                                    <Stack sx={{ gap: 1 }}>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            name="categoryId"
                                            value={values.categoryId}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            displayEmpty
                                            input={<OutlinedInput />}
                                            disabled={catLoading}
                                        >
                                            <MenuItem disabled value="">
                                                {catLoading ? 'Loading...' : 'Select category'}
                                            </MenuItem>
                                            {catData?.data?.map((cat) => (
                                                <MenuItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {touched.categoryId && errors.categoryId && (
                                            <FormHelperText error>{errors.categoryId}</FormHelperText>
                                        )}
                                    </Stack>
                                </Grid>

                                {/* Subject */}
                                <Grid item xs={12}>
                                    <Stack sx={{ gap: 1 }}>
                                        <InputLabel>Subject</InputLabel>
                                        <TextField
                                            fullWidth
                                            name="subject"
                                            value={values.subject}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Enter subject"
                                            error={touched.subject && Boolean(errors.subject)}
                                            helperText={touched.subject && errors.subject}
                                        />
                                    </Stack>
                                </Grid>

                                {/* Description - Rich Text */}
                                <Grid item xs={12}>
                                    <Stack sx={{ gap: 1 }}>
                                        <InputLabel>Description</InputLabel>
                                        <ReactQuillDemo
                                            value={values.description} // Use Formik value
                                            onChange={(value) => setFieldValue('description', value)} // Update Formik field
                                            placeholder="Write your description"
                                            borderRadius={1}
                                        />
                                        {touched.description && errors.description && (
                                            <FormHelperText error>{errors.description}</FormHelperText>
                                        )}
                                    </Stack>
                                </Grid>

                                {/* File Upload */}
                                <Grid item xs={12}>
                                    <Stack sx={{ gap: 1.5 }}>
                                        <InputLabel>Attachments (optional)</InputLabel>
                                        <UploadMultiFile
                                            setFieldValue={setFieldValue}
                                            files={values.files}
                                            error={touched.files && !!errors.files}
                                            showList
                                        />
                                        {touched.files && errors.files && (
                                            <FormHelperText error>{errors.files}</FormHelperText>
                                        )}
                                    </Stack>
                                </Grid>
                            </Grid>

                            {/* Action Buttons */}
                            <Stack
                                direction="row"
                                justifyContent="flex-end"
                                gap={1}
                                sx={{ mt: 3 }}
                            >
                                <Button
                                    color="secondary"
                                    variant="outlined"
                                    onClick={() => {
                                        navigate(-1);
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isSubmitting || createMutation?.isPending}
                                >
                                    {isSubmitting || createMutation?.isPending ? 'Submitting...' : 'Submit'}
                                </Button>
                            </Stack>
                        </Form>
                    )}
                </Formik>
            </MainCard>
        </>
    );
}