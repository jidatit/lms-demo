// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';

// project-imports
import NavUser from './NavUser';
import NavCard from './NavCard';
import Navigation from './Navigation';
import { useGetMenuMaster } from 'api/menu';
import SimpleBar from 'components/third-party/SimpleBar';
import { useAuth } from 'contexts/AuthContext';

// ==============================|| DRAWER CONTENT ||============================== //

export default function DrawerContent({ mode }) {
  const { userRole } = useAuth();
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  return (
    <>
      <SimpleBar sx={{ '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}>
        <Navigation mode={mode} />
        {drawerOpen &&
          !downLG &&
          ['contributor', 'groupLeader', 'supportAgent'].includes(userRole) && (
            <NavCard />
          )}
      </SimpleBar>
      <NavUser />
    </>
  );
}
