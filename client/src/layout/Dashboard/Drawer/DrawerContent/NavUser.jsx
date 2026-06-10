import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';

// project import
import Avatar, { CustomAvatar } from 'components/@extended/Avatar';
import { useGetMenuMaster } from 'api/menu';

// assets
import { ArrowRight2 } from 'iconsax-react';

import avatar1 from 'assets/images/users/avatar-1.png';
import { useAuth } from 'contexts/AuthContext';
import { useUserProfile } from 'api/queries/userProfile';

const ExpandMore = styled(IconButton, { shouldForwardProp: (prop) => prop !== 'theme' && prop !== 'expand' && prop !== 'drawerOpen' })(
  ({ theme, expand, drawerOpen }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(-90deg)',
    marginLeft: 'auto',
    color: theme.palette.secondary.dark,
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    }),
    ...(!drawerOpen && {
      opacity: 0,
      width: 50,
      height: 50
    })
  })
);

// ==============================|| LIST - USER ||============================== //

export default function UserList() {
  const theme = useTheme();
  const navigate = useNavigate();

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const { logout, currentUser } = useAuth();
  const { data: profile, isLoading, error } = useUserProfile();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(`/login`, {
        state: {
          from: ''
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const getDashboardProfilePath = () => {
    switch (currentUser?.role) {
      case 'subscriber':
        return '/subscriber_dashboard/profile/user/personal';
      case 'groupLeader':
        return '/groupleader_dashboard/profile/user/personal';
      case 'contributor':
        return '/contrib_dashboard/profile/user/personal';
      case 'supportAgent':
        return '/agent_dashboard/profile/user/personal';
      default:
        return '/dashboard/profile/user/personal';
    }
  };

  // Get user data with fallbacks
  const getUserData = () => {
    if (isLoading) {
      return {
        firstName: '',
        lastName: '',
        profilePictureUrl: avatar1,
        displayName: ''
      };
    }

    if (error || !profile?.data) {
      return {
        firstName: currentUser?.firstName || '',
        lastName: currentUser?.lastName || 'User',
        profilePictureUrl: avatar1,
        displayName: currentUser?.lastName || 'User'
      };
    }

    const firstName = profile.data.firstName || currentUser?.firstName || '';
    const lastName = profile.data.lastName || currentUser?.lastName || 'User';

    return {
      firstName,
      lastName,
      profilePictureUrl: profile.data.profilePictureUrl || avatar1,
      displayName: drawerOpen ? `${firstName} ${lastName}`.trim() || 'User' : ''
    };
  };

  const userData = getUserData();

  return (
    <Box sx={{ p: 1.25, px: !drawerOpen ? 1.25 : 3, borderTop: '2px solid ', borderTopColor: 'divider' }}>
      <List disablePadding>
        <ListItem
          disablePadding
          secondaryAction={
            <ExpandMore
              theme={theme}
              expand={open}
              drawerOpen={drawerOpen}
              id="basic-button"
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
              aria-label="show more"
            >
              <ArrowRight2 style={{ fontSize: '0.625rem' }} />
            </ExpandMore>
          }
          sx={{
            ...(!drawerOpen && { display: 'flex', justifyContent: 'flex-end' }),
            '& .MuiListItemSecondaryAction-root': { right: !drawerOpen ? 16 : -16 }
          }}
        >
          <ListItemAvatar>
            {isLoading ? (
              <Skeleton
                variant="circular"
                width={drawerOpen ? 46 : 32}
                height={drawerOpen ? 46 : 32}
              />
            ) : (
              // <Avatar
              //   alt="Avatar"
              //   src={userData.profilePictureUrl}
              //   sx={{
              //     ...(drawerOpen && { width: 46, height: 46 }),
              //     ...(!drawerOpen && { width: 32, height: 32 })
              //   }}
              // />
              <CustomAvatar sx={{
                ...(drawerOpen && { width: 46, height: 46 }),
                ...(!drawerOpen && { width: 36, height: 32 })
              }} name={`${userData?.firstName} ${userData?.lastName}`} size="lg" />

            )}
          </ListItemAvatar>
          {drawerOpen && (
            <ListItemText
              primary={
                isLoading ? (
                  <Skeleton variant="text" width={120} height={24} />
                ) : (
                  userData.displayName
                )
              }
            />
          )}
        </ListItem>
      </List>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'basic-button' }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 100, // ← increase or adjust this value
            borderRadius: 2,
            mt: 1,
          },
        }}
      >
        <MenuItem component={Link} to={getDashboardProfilePath()} onClick={handleClose}>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </Box>
  );
}