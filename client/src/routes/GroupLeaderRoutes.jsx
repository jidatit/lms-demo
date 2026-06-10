import GroupLeaderLayout from 'layout/Dashboard/groupLeaderLayout';
import Campaigns from 'pages/groupleader_dashboard/pages/Campaign';
import Courses from 'pages/groupleader_dashboard/pages/Courses';
import DashboardPage from 'pages/groupleader_dashboard/pages/DashboardPage';
import GroupManagementPage from 'pages/groupleader_dashboard/pages/GroupManagmentPage';
import ReportingPage from 'pages/groupleader_dashboard/pages/ReportingPage';
import GettingStarted from 'pages/shared/pages/GettingStarted';
import ViewCourse from 'pages/shared/pages/ViewCourse';

import UserProfile from 'pages/apps/profiles/user';
import UserTabPersonal from 'sections/apps/profiles/user/TabPersonal';
import UserTabPayment from 'sections/apps/profiles/user/TabPayment';
import UserTabPassword from 'sections/apps/profiles/user/TabPassword';
import UserTabSettings from 'sections/apps/profiles/user/TabSettings';


//helpdesk components
import HelpdeskDashboard from 'pages/helpdesk/dashboard';
import CreateTicket from 'pages/helpdesk/ticket/create-ticket';
import TicketList from 'pages/helpdesk/ticket/ticket-list';
import TicketDetails from 'pages/helpdesk/ticket/ticket-details';
import Subscription from 'pages/shared/pages/Subscription';
import Knowledge from 'pages/dashboard/pages/Knowledge';
import UserManagement from 'pages/Subscription/UserManagement';

const GroupLeaderRoutes = {
  path: '/groupleader_dashboard',
  children: [
    {
      path: '',
      element: <GroupLeaderLayout />,
      children: [
        {
          path: 'home',
          element: <DashboardPage />
        },
        {
          path: 'groups',
          element: <GroupManagementPage />
        },
        {
          path: 'campaigns',
          element: <Campaigns />
        },
        {
          path: 'reporting',
          element: <ReportingPage mode={'groupleader'} />
        },
        {
          path: 'subscription',
          element: <UserManagement />
        },
        {
          path: 'courses',
          element: <Courses />
        },
        {
          path: 'view_course',
          element: <ViewCourse />
        },
        {
          path: 'getting_started',
          element: <GettingStarted />
        },
        {
          path: 'knowledge',
          element: <Knowledge />
        },
        {
          path: 'profile',
          children: [
            {
              path: 'user',
              element: <UserProfile />,
              children: [
                {
                  path: 'personal',
                  element: <UserTabPersonal />
                },
                {
                  path: 'payment',
                  element: <UserTabPayment />
                },
                {
                  path: 'password',
                  element: <UserTabPassword />
                },
                {
                  path: 'settings',
                  element: <UserTabSettings />
                }
              ]
            }
          ]
        },
        {
          path: 'helpdesk',
          children: [
            {
              path: 'dashboard',
              element: <HelpdeskDashboard />
            },
            {
              path: 'create-ticket',
              element: <CreateTicket />
            },
            {
              path: 'ticket-list',
              element: <TicketList />
            },
            {
              path: 'ticket-details/:id',
              element: <TicketDetails />
            },
          ]
        }
        // {
        //   path: 'knowledge',
        //   element: <Knowledge />
        // }
      ]
    }
  ]
};
export default GroupLeaderRoutes;
