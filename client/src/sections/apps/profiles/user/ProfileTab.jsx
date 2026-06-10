import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// material-ui
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';

// assets
import { CardCoin, Lock, Profile, Setting3 } from 'iconsax-react';
import { useAuth } from 'contexts/AuthContext';

function getPathIndex(pathname) {
  let selectedTab = 0;
  switch (pathname) {
    case '/dashboard/profile/user/payment':
      selectedTab = 1;
      break;
    case '/dashboard/profile/user/password':
      selectedTab = 2;
      break;
    case '/dashboard/profile/user/settings':
      selectedTab = 3;
      break;
    case '/dashboard/profile/user/personal':
    default:
      selectedTab = 0;
  }
  return selectedTab;
}

// ==============================|| USER PROFILE - BASIC ||============================== //

export default function ProfileTab() {
  const navigate = useNavigate();
  const { currentUser } = useAuth()
  const { pathname } = useLocation();

  const [selectedIndex, setSelectedIndex] = useState(getPathIndex(pathname));
  const handleListItemClick = (index, path) => {
    setSelectedIndex(index);

    let basePath = '/dashboard';
    switch (currentUser?.role) {
      case 'subscriber':
        basePath = '/subscriber_dashboard';
        break;
      case 'groupLeader':
        basePath = '/groupleader_dashboard';
        break;
      case 'contributor':
        basePath = '/contrib_dashboard';
        break;
      case 'supportAgent':
        basePath = '/agent_dashboard';
        break;
      default:
        basePath = '/dashboard';
    }
    navigate(`${basePath}${path}`);
  };


  useEffect(() => {
    setSelectedIndex(getPathIndex(pathname));
  }, [pathname]);

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32, color: 'secondary.main' } }}>
      <ListItemButton selected={selectedIndex === 0} onClick={() => handleListItemClick(0, '/profile/user/personal')}
      >
        <ListItemIcon>
          <Profile size={18} />
        </ListItemIcon>
        <ListItemText primary="Personal Information" />
      </ListItemButton>

      <ListItemButton selected={selectedIndex === 2} onClick={() => handleListItemClick(2, '/profile/user/password')}>
        <ListItemIcon>
          <Lock size={18} />
        </ListItemIcon>
        <ListItemText primary="Change Password" />
      </ListItemButton>

    </List>
  );
}
