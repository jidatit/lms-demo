import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// assets
import { Bill, Edit2, Logout, Profile, Profile2User } from 'iconsax-react';
import { useAuth } from 'contexts/AuthContext';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

export default function ProfileTab({ handleLogout }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);

    const role = currentUser?.role;
    // Define base path depending on role
    let basePath = '/dashboard';
    switch (role) {
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
      case 'admin':
        basePath = '/dashboard';
        break;
      default:
        console.warn('Unknown role:', role);
    }
    navigate(`${basePath}/profile/user/personal`);

  };

  const handleBillingClick = () => {
    if (currentUser?.role === 'admin') {
      navigate('/dashboard/invoices');
    } else if (currentUser?.role === 'contributor') {
      navigate('/contrib_dashboard/invoices');
    }
  };

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
      {/* <ListItemButton onClick={(event) => handleListItemClick(event, 0)}>
        <ListItemIcon>
          <Edit2 variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="Edit Profile" />
      </ListItemButton> */}

      <ListItemButton onClick={(event) => handleListItemClick(event, 1)}>
        <ListItemIcon>
          <Profile variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="View Profile" />
      </ListItemButton>

      {/* <ListItemButton selected={selectedIndex === 3} onClick={(event) => handleListItemClick(event, 3)}>
        <ListItemIcon>
          <Profile2User variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="Social Profile" />
      </ListItemButton> */}

      {/* Only show Billing for admin or contributor */}
      {(currentUser?.role === 'admin' || currentUser?.role === 'contributor') && (
        <ListItemButton selected={selectedIndex === 4} onClick={handleBillingClick}>
          <ListItemIcon>
            <Bill variant="Bulk" size={18} />
          </ListItemIcon>
          <ListItemText primary="Billing" />
        </ListItemButton>
      )}

      <ListItemButton selected={selectedIndex === 2} onClick={handleLogout}>
        <ListItemIcon>
          <Logout variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </List>
  );
}

ProfileTab.propTypes = {
  handleLogout: PropTypes.func
};
