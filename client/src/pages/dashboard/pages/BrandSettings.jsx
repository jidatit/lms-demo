// src/pages/settings/SiteTheme.jsx (or wherever you keep it)
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import {
    styled,
    Button,
    CardMedia,
    Divider,
    Grid,
    IconButton,
    Stack,
    Typography,
    Box,
    CircularProgress
} from '@mui/material';

// third-party
import { useDropzone } from 'react-dropzone';

// project imports
import MainCard from 'components/MainCard';

// assets
import { DocumentUpload, Trash } from 'iconsax-react';
import { useBrandSettings, useUpdateBrandSettings } from 'api/queries/brandSettings';
import { useBranding } from 'contexts/BrandingContext';
import { toast } from 'utils/toast';

// ==============================|| STYLES ||============================== //

const DropzoneContainer = styled(Box)(({ theme }) => ({
    border: '1px dashed',
    borderColor: theme.palette.secondary.main,
    height: 180,
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center'
}));

// ==============================|| SECTION TITLE ||============================== //

function SectionTitle({ title, subHeading }) {
    return (
        <Stack sx={{ gap: 0.5 }}>
            <Typography variant="h5">{title}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {subHeading}
            </Typography>
        </Stack>
    );
}

// ==============================|| UPLOAD FILE COMPONENT ||============================== //

function UploadFile({ item, preview, onDrop, onRemove }) {
    const { getRootProps, getInputProps, open } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg'] },
        maxFiles: 1,
        noClick: true
    });

    return (
        <Stack sx={{ gap: 1 }}>
            <Typography>{item.title}</Typography>
            <DropzoneContainer {...getRootProps()}>
                <input {...getInputProps()} />
                {preview ? (
                    <Stack sx={{ gap: 1.5, alignItems: 'center' }}>
                        <CardMedia
                            component="img"
                            src={preview}
                            alt={item.title}
                            sx={{
                                width: 120,
                                height: 120,
                                objectFit: 'contain',
                                borderRadius: 2,
                                bgcolor: 'background.paper'
                            }}
                        />
                        <Stack direction="row" gap={1}>
                            <Button size="small" onClick={open}>
                                Change
                            </Button>

                        </Stack>
                    </Stack>
                ) : (
                    <Stack alignItems="center" justifyContent="center" sx={{ width: 1, height: 1 }}>
                        <Button variant="outlined" startIcon={<DocumentUpload />} onClick={open}>
                            Upload {item.title}
                        </Button>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>
                            {item.notes}
                        </Typography>
                    </Stack>
                )}
            </DropzoneContainer>
        </Stack>
    );
}

// ==============================|| MAIN COMPONENT ||============================== //

const brandingSections = [
    { title: 'Logo', notes: 'Recommended: 250×60px • PNG, JPG, WebP or SVG' },
    { title: 'Favicon', notes: 'Recommended: 512×512px PNG • Will auto-generate .ico & Apple icons' }
];

export default function SiteTheme() {
    const { data: currentBranding, isLoading: loadingBranding } = useBrandSettings();
    const updateMutation = useUpdateBrandSettings();
    const { branding } = useBranding?.() || {}; // optional live preview from context

    const [uploads, setUploads] = useState({
        logo: null,
        favicon: null
    });

    // Cleanup object URLs
    useEffect(() => {
        return () => {
            Object.values(uploads).forEach((item) => {
                if (item?.preview) URL.revokeObjectURL(item?.preview);
            });
        };
    }, [uploads]);

    const handleDrop = (field) => (acceptedFiles) => {
        if (!acceptedFiles[0]) return;
        const file = acceptedFiles[0];
        const preview = URL.createObjectURL(file);
        setUploads((prev) => ({ ...prev, [field]: { file, preview } }));
    };

    const handleRemove = (field) => {
        if (uploads[field]?.preview) {
            URL.revokeObjectURL(uploads[field]?.preview);
        }
        setUploads((prev) => ({ ...prev, [field]: null }));
    };

    const handleSave = async () => {
        if (!uploads.logo && !uploads.favicon) return;

        const formData = new FormData();
        if (uploads.logo) formData.append('logo', uploads?.logo?.file);
        if (uploads.favicon) formData.append('favicon', uploads?.favicon?.file);

        try {
            await updateMutation.mutateAsync(formData);
            toast({ message: 'Branding updated successfully!', type: 'success' });
            setUploads({ logo: null, favicon: null }); // reset form
        } catch (error) {
            const msg = error?.response?.data?.error?.message || 'Failed to update branding';
            toast({ message: msg, type: 'error' });
        }
    };

    const hasChanges = uploads.logo || uploads.favicon;

    return (
        <Stack spacing={4}>
            {/* Header */}
            <SectionTitle
                title="Logo & Branding"
                subHeading="Upload your custom logo and favicon. Changes appear instantly across the entire platform."
            />
            {/* Upload Fields */}
            {loadingBranding ? (
                <MainCard>
                    <Stack alignItems="center" py={4}>
                        <CircularProgress />
                    </Stack>
                </MainCard>
            ) : (
                <Grid container spacing={4}>
                    {brandingSections.map((item) => {
                        const field = item.title.toLowerCase();
                        const currentUrl =
                            field === 'logo' ? currentBranding?.logoUrl : currentBranding?.faviconUrl;
                        const previewUrl = uploads[field]?.preview || currentUrl;

                        return (
                            <Grid item xs={12} md={6} key={item.title}>
                                <UploadFile
                                    item={item}
                                    preview={previewUrl}
                                    onDrop={handleDrop(field)}
                                    onRemove={() => handleRemove(field)}
                                />
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Save Button */}
            <Stack direction="row" justifyContent="flex-end">
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleSave}
                    disabled={!hasChanges || updateMutation.isPending}
                    startIcon={updateMutation.isPending && <CircularProgress size={20} />}
                >
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </Stack>

            <Divider />


        </Stack>
    );
}

// PropTypes
SectionTitle.propTypes = {
    title: PropTypes.string,
    subHeading: PropTypes.string
};

UploadFile.propTypes = {
    item: PropTypes.shape({
        title: PropTypes.string,
        notes: PropTypes.string
    }),
    preview: PropTypes.string,
    onDrop: PropTypes.func,
    onRemove: PropTypes.func
};