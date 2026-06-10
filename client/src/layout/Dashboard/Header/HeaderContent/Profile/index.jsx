import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import CardContent from '@mui/material/CardContent';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

// project-imports
import ProfileTab from './ProfileTab';
import SettingTab from './SettingTab';
import Avatar, { CustomAvatar } from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import IconButton from 'components/@extended/IconButton';

import { ThemeMode } from 'config';

// assets
import avatar1 from 'assets/images/users/avatar-6.png';
import { Setting2, Profile, Logout } from 'iconsax-react';
import { useAuth } from 'contexts/AuthContext';
import { useUserProfile } from 'api/queries/userProfile';

// tab panel wrapper
function TabPanel({ children, value, index, ...other }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
      sx={{ p: 1 }}
    >
      {value === index && children}
    </Box>
  );
}

function a11yProps(index) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`
  };
}

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
// ==============================|| HEADER CONTENT - PROFILE ||============================== //

export default function ProfilePage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: profile, isLoading, error } = useUserProfile();
  const { logout, currentUser } = useAuth();

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

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Get user data with fallbacks
  const getUserData = () => {
    if (isLoading) {
      return {
        firstName: '',
        lastName: '',
        profilePictureUrl: avatar1,
        designation: ''
      };
    }

    if (error || !profile?.data) {
      return {
        firstName: currentUser?.firstName || 'User',
        lastName: currentUser?.lastName || 'Name',
        profilePictureUrl: avatar1,
        designation: currentUser?.role || 'No designation set'
      };
    }

    return {
      firstName: profile.data.firstName || currentUser?.firstName || 'User',
      lastName: profile.data.lastName || currentUser?.lastName || 'Name',
      profilePictureUrl: profile.data.profilePictureUrl || avatar1,
      designation: formatDesignation(profile?.requestedBy?.role),
    };
  };

  const userData = getUserData();

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <ButtonBase
        sx={{
          p: 0.25,
          borderRadius: 1,
          '&:hover': { bgcolor: theme.palette.mode === ThemeMode.DARK ? 'secondary.light' : 'secondary.lighter' },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.secondary.dark}`,
            outlineOffset: 2
          }
        }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        {isLoading ? (
          <Skeleton variant="circular" width={40} height={40} />
        ) : (
          // <Avatar
          //   alt="profile user"
          //   src={userData.profilePictureUrl}
          // />
          <CustomAvatar sx={{ width: 38, height: 38, border: '1px solid' }} name={`${userData?.firstName} ${userData?.lastName}`} size="lg" />

        )}
      </ButtonBase>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                width: 290,
                minWidth: 240,
                maxWidth: 290,
                [theme.breakpoints.down('md')]: { maxWidth: 250 },
                borderRadius: 1.5
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} content={false}>
                  <CardContent sx={{ px: 2.5, pt: 3 }}>
                    <Grid container justifyContent="space-between" alignItems="center">
                      <Grid item>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          {isLoading ? (
                            <Skeleton variant="circular" width={40} height={40} />
                          ) : (
                            // <Avatar alt="profile user" src={userData.profilePictureUrl} />
                            <CustomAvatar name={`${userData?.firstName} ${userData?.lastName}`} size="lg" />

                          )}
                          <Stack>
                            {isLoading ? (
                              <>
                                <Skeleton variant="text" width={120} height={24} />
                                <Skeleton variant="text" width={80} height={20} />
                              </>
                            ) : (
                              <>
                                <Typography variant="subtitle1">
                                  {userData.firstName} {userData.lastName}
                                </Typography>
                                {userData.designation && (
                                  <Typography variant="body2" color="secondary">
                                    {userData.designation}
                                  </Typography>
                                )}
                              </>
                            )}
                          </Stack>
                        </Stack>
                      </Grid>
                      <Grid item>
                        <Tooltip title="Logout">
                          <IconButton size="large" color="error" sx={{ p: 1 }} onClick={handleLogout}>
                            <Logout variant="Bulk" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>

                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs variant="fullWidth" value={value} onChange={handleChange} aria-label="profile tabs">
                      <Tab
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          textTransform: 'capitalize'
                        }}
                        icon={<Profile size={18} style={{ marginBottom: 0, marginRight: '10px' }} />}
                        label="Profile"
                        {...a11yProps(0)}
                      />
                      <Tab
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          textTransform: 'capitalize'
                        }}
                        icon={<Setting2 size={18} style={{ marginBottom: 0, marginRight: '10px' }} />}
                        label="Help"
                        {...a11yProps(1)}
                      />
                    </Tabs>
                  </Box>
                  <TabPanel value={value} index={0} dir={theme.direction}>
                    <ProfileTab handleLogout={handleLogout} />
                  </TabPanel>
                  <TabPanel value={value} index={1} dir={theme.direction}>
                    <SettingTab />
                  </TabPanel>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}

TabPanel.propTypes = { children: PropTypes.node, value: PropTypes.number, index: PropTypes.number, other: PropTypes.any };