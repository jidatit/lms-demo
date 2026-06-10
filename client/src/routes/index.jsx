import { createBrowserRouter } from 'react-router-dom';

// project import

import LoginRoutes from './LoginRoutes';
import AdminRoutes from './AdminRoutes';

import Loadable from 'components/Loadable';
import { lazy } from 'react';
import ContributorRoutes from './ContributorRoutes';
import GroupLeaderRoutes from './GroupLeaderRoutes';
import SubscriberRoutes from './SubscriberRoutes';
import SupportAgentRoutes from './SupportAgentRoutes';
const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/error/404')));
// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [
    LoginRoutes,
    AdminRoutes,
    ContributorRoutes,
    GroupLeaderRoutes,
    SubscriberRoutes,
    SupportAgentRoutes,
    {
      path: '*',
      element: <MaintenanceError />
    }
  ],
  { basename: import.meta.env.VITE_APP_BASE_NAME }
);

export default router;
