import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

// project-imports
import Search from './Search';
import Message from './Message';
import Profile from './Profile';
import Notification from './Notification';
import MobileSection from './MobileSection';
import FullScreen from './FullScreen';

import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';
import DrawerHeader from 'layout/Dashboard/Drawer/DrawerHeader';
import Localization from './Localization';
import { useMemo } from 'react';
import SimpleThemeToggle from './SimpleThemeToggle';
import KnowledgeBaseLink from './knowledgeBaseLink';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const { i18n, menuOrientation } = useConfig();

  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const localization = useMemo(() => <Localization />, [i18n]);
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: downLG ? 'space-between' : 'flex-end',
        width: '100%'
      }}
    >
      {menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}

      {/* {!downLG && <Search />} */}

      <Box sx={{ flex: 1, ml: downLG ? 1 : 0 }} />
      <KnowledgeBaseLink />
      <SimpleThemeToggle />
      {!downLG && localization}
      {/* <Notification /> */}
      <FullScreen />
      {/* <Message /> */}

      {!downLG && <Profile />}
      {/* {downLG && <MobileSection />} */}
    </Box>
  );
}
