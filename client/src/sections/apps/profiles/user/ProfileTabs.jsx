// components/ProfileTabs.js
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';

// project-imports
import ProfileTab from './ProfileTab';
import MainCard from 'components/MainCard';
import Avatar, { CustomAvatar } from 'components/@extended/Avatar';
import MoreIcon from 'components/@extended/MoreIcon';
import IconButton from 'components/@extended/IconButton';

// hooks
import { useUserProfile, useUploadProfilePicture } from 'api/queries/userProfile';

// assets
import { Camera } from 'iconsax-react';
import { ThemeMode } from 'config';
import defaultImages from 'assets/images/users/default.png';
import { toast } from 'utils/toast';

// ==============================|| USER PROFILE - TABS ||============================== //

const formatDesignation = (role) => {
  if (!role) return 'No designation set';

  const roleMap = {
    admin: 'Admin',
    contributor: 'Partner',
    groupLeader: 'Manager',
    subscriber: 'Employee',
    supportAgent: 'Support Agent',
  };

  return roleMap[role] || 'No designation set';
};


export default function ProfileTabs({ focusInput }) {
  const theme = useTheme();
  const { data: profile, isLoading, error, refetch } = useUserProfile();
  const { uploadProfilePictureAsync, isUploading } = useUploadProfilePicture();
  console.log("profile data:", profile);

  const [selectedImage, setSelectedImage] = useState(null);
  const [avatar, setAvatar] = useState("");

  // Update avatar when profile data loads or selected image changes
  useEffect(() => {
    if (profile?.data?.profilePictureUrl) {
      setAvatar(profile.data.profilePictureUrl);
    }
  }, [profile]);

  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle profile picture upload
  const handleUpload = async () => {
    if (!selectedImage) return;

    try {
      await uploadProfilePictureAsync(selectedImage);
      toast({
        message: 'Profile picture uploaded successfully!',
        type: 'success'
      });
      setSelectedImage(null); // Clear selected image after successful upload
    } catch (err) {
      toast({
        message: `Failed to upload profile picture: ${err?.message || 'Unknown error'}`,
        type: 'error'
      });
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <MainCard>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="flex-end">
            <Skeleton variant="circular" width={40} height={40} />
          </Stack>
          <Stack spacing={2.5} alignItems="center">
            {/* Avatar skeleton with blur effect */}
            <Box sx={{ position: 'relative' }}>
              <Skeleton
                variant="circular"
                width={124}
                height={124}
                sx={{
                  filter: 'blur(2px)',
                  backgroundColor: theme.palette.mode === ThemeMode.DARK
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.1)'
                }}
              />
            </Box>

            {/* Text skeletons with blur effect */}
            {/* <Stack spacing={0.5} alignItems="center" sx={{ width: '100%' }}>
              <Skeleton
                variant="text"
                width={200}
                height={32}
                sx={{
                  filter: 'blur(1px)',
                  backgroundColor: theme.palette.mode === ThemeMode.DARK
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.1)'
                }}
              />
              <Skeleton
                variant="text"
                width={120}
                height={24}
                sx={{
                  filter: 'blur(1px)',
                  backgroundColor: theme.palette.mode === ThemeMode.DARK
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.1)'
                }}
              />
            </Stack> */}
          </Stack>
        </Grid>
        <Grid item xs={12}>
          {/* Profile tab loading state */}
          <Box sx={{ filter: 'blur(1px)' }}>
            <Skeleton variant="rectangular" height={200} />
          </Box>
        </Grid>
      </Grid>
    </MainCard>
  );

  // Error state component
  const ErrorState = () => (
    <MainCard>
      <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
        <Typography variant="h5" color="error" align="center">
          Failed to load profile
        </Typography>
        <Typography color="text.secondary" align="center">
          {error?.message || 'An unexpected error occurred'}
        </Typography>
        <Button
          variant="contained"
          onClick={() => refetch()}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>

        {/* Fallback with default data */}
        <Divider sx={{ width: '100%', my: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Default Profile Information
        </Typography>
        <Stack spacing={2.5} alignItems="center">
          <Avatar alt="Default Avatar" src={defaultImages} sx={{ width: 124, height: 124 }} />
          <Stack spacing={0.5} alignItems="center">
            <Typography variant="h5" color="text.secondary">
              User Name
            </Typography>
            <Typography color="text.secondary">
              Position/Designation
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </MainCard>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState />;
  }

  // Fallback data in case profile data is incomplete
  const userData = {
    firstName: profile?.data?.firstName || 'User',
    lastName: profile?.data?.lastName || 'Name',
    designation: formatDesignation(profile?.requestedBy?.role),
    profilePictureUrl: profile?.data?.profilePictureUrl || defaultImages
  };

  return (
    <MainCard>
      <Grid container spacing={6}>
        <Grid item xs={12}>

          <Stack spacing={2.5} alignItems="center">
            <FormLabel
              // htmlFor="change-avtar"
              sx={{
                position: 'relative',
                borderRadius: '50%',
                overflow: 'hidden',
                '&:hover .MuiBox-root': { opacity: 1 },
                cursor: 'pointer'
              }}
            >
              {/* <Avatar alt="Avatar" src={avatar} sx={{ width: 124, height: 124, border: '1px dashed' }} /> */}
              <CustomAvatar name={`${userData?.firstName} ${userData?.lastName}`} size="lg" />

              {/* this is for the upload button */}
              {/* <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  backgroundColor: theme.palette.mode === ThemeMode.DARK ? 'rgba(255, 255, 255, .75)' : 'rgba(0,0,0,.65)',
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Stack spacing={0.5} alignItems="center">
                  <Camera style={{ color: theme.palette.secondary.lighter, fontSize: '2rem' }} />
                  <Typography sx={{ color: 'secondary.lighter' }}>Upload</Typography>
                </Stack>
              </Box> */}
            </FormLabel>
            <TextField
              type="file"
              id="change-avtar"
              placeholder="Outlined"
              variant="outlined"
              sx={{ display: 'none' }}
              onChange={(e) => setSelectedImage(e.target.files?.[0])}
              inputProps={{ accept: 'image/*' }}
            />
            {selectedImage && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={isUploading}
                sx={{ mt: 1 }}
              >
                {isUploading ? <CircularProgress size={24} /> : 'Confirm Upload'}
              </Button>
            )}
            <Stack spacing={0.5} alignItems="center">
              <Typography variant="h5">
                {userData.firstName} {userData.lastName}
              </Typography>
              <Typography color="secondary">{userData.designation}</Typography>
            </Stack>
          </Stack>
        </Grid>
        <Grid item sm={3} sx={{ display: { sm: 'block', md: 'none' } }} />
        {profile?.data?.signinType === "withPassword" &&
          <Grid item xs={12}>
            <ProfileTab />
          </Grid>
        }
      </Grid>
    </MainCard>
  );
}

ProfileTabs.propTypes = { focusInput: PropTypes.func };