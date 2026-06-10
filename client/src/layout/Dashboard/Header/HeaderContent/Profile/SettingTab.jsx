import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Link from '@mui/material/Link';
import { I24Support, Lock1, Messages1 } from 'iconsax-react';

export default function SettingTab() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const getBasePath = () => {
    switch (currentUser?.role) {
      case 'subscriber':
        return '/subscriber_dashboard';
      case 'groupLeader':
        return '/groupleader_dashboard';
      case 'contributor':
        return '/contrib_dashboard';
      case 'supportAgent':
        return '/agent_dashboard';
      default:
        return '/dashboard';
    }
  };

  const basePath = getBasePath();

  const menuItems = [
    { label: 'Supports', icon: <I24Support variant="Bulk" size={18} />, path: '/helpdesk/ticket-list' },
    { label: 'Privacy Center', icon: <Lock1 variant="Bulk" size={18} />, path: '/privacy' },
    { label: 'Terms & Conditions', icon: <Messages1 variant="Bulk" size={18} />, path: '/terms' }
  ];

  const handleNavigation = (path) => {
    navigate(`${basePath}${path}`);
  };

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
      {menuItems.map((item) => {
        const fullPath = `${basePath}${item.path}`;
        const isSelected = location.pathname === fullPath;

        return (
          <Link key={item.label} style={{ textDecoration: 'none' }}>
            <ListItemButton selected={isSelected} onClick={() => handleNavigation(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </Link>
        );
      })}
    </List>
  );
}
