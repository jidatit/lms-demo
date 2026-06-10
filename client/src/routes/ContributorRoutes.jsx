import { default as ContributorLayout } from 'layout/Dashboard/contributorLayout';
import BuyNewLicense from 'pages/contrib_dashboard/pages/BuyNewLicense';
import Campaigns from 'pages/contrib_dashboard/pages/Campaigns';
// import DashboardPage from 'pages/contrib_dashboard/pages/DashboardPage';
import MyBundleCart from 'pages/contrib_dashboard/pages/MyBundelCart';
import MyCart from 'pages/contrib_dashboard/pages/MyCart';
import BundleDetails from 'pages/contrib_dashboard/pages/ViewBundles';
import GroupManagementPage from 'pages/contrib_dashboard/pages/GroupManagmentPage';
import ReportingPage from 'pages/dashboard/pages/ReportingPage';
import Knowledge from 'pages/dashboard/pages/Knowledge';
import InvoiceCheckout from 'pages/contrib_dashboard/pages/InvoiceCheckout';
import InvoiceList from 'pages/contrib_dashboard/pages/InvoiceList';
import CreateInvoice from 'pages/contrib_dashboard/pages/CreateInvoice';
import EditInvoice from 'pages/contrib_dashboard/pages/EditInvoice';
import EmailTemplatesPage from 'pages/contrib_dashboard/pages/EmailTemplatesPage';
import CompaniesTable from 'pages/contrib_dashboard/pages/Companies';
import UserProfile from 'pages/apps/profiles/user';
import UserTabPersonal from 'sections/apps/profiles/user/TabPersonal';
import UserTabPayment from 'sections/apps/profiles/user/TabPayment';
import UserTabPassword from 'sections/apps/profiles/user/TabPassword';
import UserTabSettings from 'sections/apps/profiles/user/TabSettings';

import HelpdeskDashboard from 'pages/helpdesk/dashboard';
import CreateTicket from 'pages/helpdesk/ticket/create-ticket';
import TicketList from 'pages/helpdesk/ticket/ticket-list';
import TicketDetails from 'pages/helpdesk/ticket/ticket-details';
import Subscription from 'pages/shared/pages/Subscription';
import UserManagement from 'pages/Subscription/UserManagement';
import DashboardPage from 'pages/dashboard/pages/DashboardPage';
const ContributorRoutes = {
  path: '/contrib_dashboard',
  children: [
    {
      path: '',
      element: <ContributorLayout />,
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
          path: 'buy_new_license',
          element: <BuyNewLicense />
        },
        {
          path: 'mycart',
          element: <MyCart />
        },
        {
          path: 'mybundlecart',
          element: <MyBundleCart />
        },
        { path: 'view_bundles', element: <BundleDetails /> },
        {
          path: 'groups',
          element: <GroupManagementPage />
        },
        {
          path: 'subscription',
          element: <UserManagement />
        },
        {
          path: 'reporting',
          element: <ReportingPage mode={'contributor'} />
        },
        {
          path: 'knowledge',
          element: <Knowledge />
        },
        {
          path: 'checkout',
          element: <InvoiceCheckout />
        },
        {
          path: 'invoices',
          element: <InvoiceList />
        },
        {
          path: 'invoices/details',
          element: <InvoiceCheckout />
        },
        {
          path: 'invoices/create',
          element: <CreateInvoice />
        },
        {
          path: 'invoices/edit',
          element: <EditInvoice />
        },
        // {
        //   path: 'email_templates',
        //   element: <EmailTemplatesPage />
        // },
        {
          path: 'companies',
          element: <CompaniesTable />
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
      // element: <DashboardPage />
    }
    // {
    //   path: 'groups',
    //   element: <GroupManagementPage />
    // },
    // {
    //   path: 'all_users',
    //   element: <AllUsers />
    // },
    // {
    //   path: 'courses',
    //   element: <UploadCourse />
    // },
    // {
    //   path: 'buy_new_license',
    //   element: <AdminBuyNewLicense />
    // },
    // {
    //   path: 'mycart',
    //   element: <AdminMyCart />
    // },
    // {
    //   path: 'discounts',
    //   element: <DiscountPage />
    // },
    // {
    //   path: 'view_details/:id',
    //   element: <ViewGroupDetails />
    // },
    // {
    //   path: 'course_details',
    //   element: <CourseDetails />
    // },
    // {
    //   path: 'view_course',
    //   element: <ViewCourse />
    // },
    // {
    //   path: 'view_bundles',
    //   element: <ViewBundles />
    // },
    // {
    //   path: 'campaigns',
    //   element: <Campaigns />
    // },
    // {
    //   path: 'knowledge',
    //   element: <Knowledge />
    // },
    // {
    //   path: '/maintenance',
    //   element: <PagesLayout />,
    //   children: [
    //     {
    //       path: '404',
    //       element: <MaintenanceError />
    //     },
    //     {
    //       path: '500',
    //       element: <MaintenanceError500 />
    //     },
    //     {
    //       path: 'under-construction',
    //       element: <MaintenanceUnderConstruction />
    //     },
    //     {
    //       path: 'coming-soon',
    //       element: <MaintenanceComingSoon />
    //     }
    //   ]
    // },
    // {
    //   path: '*',
    //   element: <MaintenanceError />
    // }
  ]
};
export default ContributorRoutes;
