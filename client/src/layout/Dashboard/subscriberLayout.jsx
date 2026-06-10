import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';

// project-imports
import Drawer from './Drawer';
import Header from './Header';
import Footer from './Footer';
import HorizontalBar from './Drawer/HorizontalBar';
import Loader from 'components/Loader';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import AuthGuard from 'utils/route-guard/AuthGuard';

import { DRAWER_WIDTH, MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import { useAuth } from 'contexts/AuthContext';

// ==============================|| MAIN LAYOUT ||============================== //

export default function SubscriberLayout() {
  const { currentUser, loading, userRole } = useAuth();
  const theme = useTheme();

  const { menuMasterLoading } = useGetMenuMaster();
  const downXL = useMediaQuery(theme.breakpoints.down('xl'));
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));

  const { container, miniDrawer, menuOrientation } = useConfig();

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  // set media wise responsive drawer
  useEffect(() => {
    if (!miniDrawer) {
      handlerDrawerOpen(!downXL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downXL]);

  if (menuMasterLoading) return <Loader />;
  if (loading) {
    return <Loader />;
  }
  return (
    <>
      {currentUser && userRole === 'subscriber' ? (
        <Box sx={{ display: 'flex', width: '100%' }}>
          <Header />
          {!isHorizontal ? <Drawer mode={'subscriber'} /> : <HorizontalBar />}

          <Box component="main" sx={{ width: `calc(100% - ${DRAWER_WIDTH}px)`, flexGrow: 1, p: { xs: 2, md: 3 } }}>
            <Toolbar sx={{ mt: isHorizontal ? 8 : 'inherit', mb: isHorizontal ? 2 : 'inherit' }} />
            <Container
              maxWidth={container ? 'xl' : false}
              sx={{
                xs: 0,
                ...(container && { px: { xs: 0, md: 2 } }),
                position: 'relative',
                minHeight: 'calc(100vh - 130px)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Breadcrumbs mode={'subscriber'} />
              <Outlet />
              <Footer />
            </Container>
          </Box>
        </Box>
      ) : (
        <Navigate to="/" />
      )}
    </>
  );
}
