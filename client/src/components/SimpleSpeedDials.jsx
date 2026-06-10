import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import Box from '@mui/material/Box';

import { Buildings, Heart, Printer, Profile2User, Save2, Share, ShoppingBag, User } from 'iconsax-react';
import { useAuth } from 'contexts/AuthContext';

export default function SimpleSpeedDials() {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  // Role-based actions
  const getActions = () => {
    if (userRole === 'admin') {
      return [
        { icon: <Buildings />, name: 'Organization', path: '/dashboard/subscription' },
        { icon: <Profile2User />, name: 'Groups', path: '/dashboard/subscription' },
        { icon: <User />, name: 'User', path: '/dashboard/subscription' },
        { icon: <ShoppingBag />, name: 'License', path: '/dashboard/buy_new_license' }
      ];
    }

    if (userRole === 'contributor') {
      return [
        { icon: <Buildings />, name: 'Organization', path: '/contrib_dashboard/subscription' },
        { icon: <Profile2User />, name: 'Groups', path: '/contrib_dashboard/subscription' },
        { icon: <User />, name: 'User', path: '/contrib_dashboard/subscription' },
        { icon: <ShoppingBag />, name: 'License', path: '/contrib_dashboard/buy_new_license' }
      ];
    }

    return [];
  };

  const actions = getActions();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 2000
      }}
    >
      <SpeedDial
        ariaLabel="quick actions"
        icon={<SpeedDialIcon />}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        direction="up"
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              navigate(action.path);
              setOpen(false);
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
}
