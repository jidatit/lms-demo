import GroupLeaderLayout from 'layout/Dashboard/groupLeaderLayout';
import SubscriberLayout from 'layout/Dashboard/subscriberLayout';
import GettingStarted from 'pages/shared/pages/GettingStarted';
import ViewCourse from 'pages/shared/pages/ViewCourse';
import Courses from 'pages/subscriber_dashboard/pages/Courses';



import UserProfile from 'pages/apps/profiles/user';
import UserTabPersonal from 'sections/apps/profiles/user/TabPersonal';
import UserTabPayment from 'sections/apps/profiles/user/TabPayment';
import UserTabPassword from 'sections/apps/profiles/user/TabPassword';
import UserTabSettings from 'sections/apps/profiles/user/TabSettings';
const SubscriberRoutes = {
  path: '/subscriber_dashboard',
  children: [
    {
      path: '',
      element: <SubscriberLayout />,
      children: [
        {
          path: '',
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
        // {
        //   path: 'knowledge',
        //   element: <Knowledge />
        // }
      ]
    }
  ]
};
export default SubscriberRoutes;
