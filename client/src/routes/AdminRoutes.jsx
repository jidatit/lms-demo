import { lazy } from 'react';

// project-imports
import Loadable from 'components/Loadable';

import PagesLayout from 'layout/Pages';
import SimpleLayout from 'layout/Simple';
import { SimpleLayoutType } from 'config';
import DashboardLayout from 'layout/Dashboard';
import Campaigns from 'pages/dashboard/pages/Campaigns';
import UploadCourse from 'pages/dashboard/pages/UploadCourse';
import AllUsers from 'pages/dashboard/pages/AllUsers';
import ReportingPage from 'pages/dashboard/pages/ReportingPage';
import CourseDetails from 'pages/dashboard/pages/CourseDetails';
import DiscountPage from 'pages/dashboard/pages/Discount';
import MyBundleCart from 'pages/dashboard/pages/MyBundelCart';
import BuyNewLicense from 'pages/dashboard/pages/BuyNewLicense';
import MyCart from 'pages/dashboard/pages/MyCart';
import Knowledge from 'pages/dashboard/pages/Knowledge';
import BundleDetails from 'pages/dashboard/pages/ViewBundles';
import EmailTemplatesPage from 'pages/dashboard/pages/EmailTemplatesPage';
import InvoiceList from 'pages/dashboard/pages/InvoiceList';
import CreateInvoice from 'pages/dashboard/pages/CreateInvoice';
import InvoiceCheckout from 'pages/dashboard/pages/InvoiceCheckout';
import EditInvoice from 'pages/dashboard/pages/EditInvoice';
import UserProfile from 'pages/apps/profiles/user';
import UserTabPersonal from 'sections/apps/profiles/user/TabPersonal';
import UserTabPayment from 'sections/apps/profiles/user/TabPayment';
import UserTabPassword from 'sections/apps/profiles/user/TabPassword';
import UserTabSettings from 'sections/apps/profiles/user/TabSettings';
import HelpdeskDashboard from 'pages/helpdesk/dashboard';
import CreateTicket from 'pages/helpdesk/ticket/create-ticket';
import TicketList from 'pages/helpdesk/ticket/ticket-list';
import TicketDetails from 'pages/helpdesk/ticket/ticket-details';
import CompaniesTable from 'pages/contrib_dashboard/pages/Companies';
import SiteTheme from 'pages/dashboard/pages/BrandSettings';
import UserManagement from 'pages/Subscription/UserManagement';
//Dashboard Imports
const DashboardPage = Loadable(lazy(() => import('pages/dashboard/pages/DashboardPage')));
const GroupManagementPage = Loadable(lazy(() => import('pages/dashboard/pages/GroupManagmentPage')));

// const UserProfile = Loadable(lazy(() => import('pages/apps/profiles/user')));
// const UserTabPersonal = Loadable(lazy(() => import('sections/apps/profiles/user/TabPersonal')));
// const UserTabPayment = Loadable(lazy(() => import('sections/apps/profiles/user/TabPayment')));
// const UserTabPassword = Loadable(lazy(() => import('sections/apps/profiles/user/TabPassword')));
// const UserTabSettings = Loadable(lazy(() => import('sections/apps/profiles/user/TabSettings')));

// const DashboardLayout = Loadable(lazy(() => import('layout/Dashboard')));


const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/error/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/error/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction/under-construction')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon/coming-soon')));

const AppContactUS = Loadable(lazy(() => import('pages/contact-us')));
// render - sample page

// ==============================|| MAIN ROUTES ||============================== //

const AdminRoutes = {
  path: '/dashboard',
  children: [
    {
      path: '',
      element: <DashboardLayout />,
      children: [
        {
          path: 'home',
          element: <DashboardPage />
        },
        {
          path: 'campaigns',
          element: <Campaigns />
        },
        {
          path: 'groups',
          element: <GroupManagementPage />
        },
        {
          path: 'companies',
          element: <CompaniesTable />
        },
        {
          path: 'courses',
          element: <UploadCourse />
        },
        {
          path: 'all_users',
          element: <AllUsers />
        },
        {
          path: 'reporting',
          element: <ReportingPage />
        },
        {
          path: 'course_details',
          element: <CourseDetails />
        },
        {
          path: 'discounts',
          element: <DiscountPage />
        },
        {
          path: 'mycart',
          element: <MyCart />
        },
        {
          path: 'mybundlecart',
          element: <MyBundleCart />
        },
        {
          path: 'buy_new_license',
          element: <BuyNewLicense />
        },
        {
          path: 'knowledge',
          element: <Knowledge />
        },
        {
          path: 'view_bundles',
          element: <BundleDetails />
        },
        {
          path: 'email_templates',
          element: <EmailTemplatesPage />
        },
        {
          path: 'invoices',
          element: <InvoiceList />
        },
        {
          path: 'invoices/create',
          element: <CreateInvoice />
        },
        {
          path: 'invoices/details',
          element: <InvoiceCheckout />
        },
        {
          path: 'invoices/edit',
          element: <EditInvoice />
        },
        {
          path: 'checkout',
          element: <InvoiceCheckout />
        },
        {
          path: 'subscription',
          element: <UserManagement />
        },
        {
          path: 'brand_settings',
          element: <SiteTheme />
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
      ]
    }

  ]
};

export default AdminRoutes;
