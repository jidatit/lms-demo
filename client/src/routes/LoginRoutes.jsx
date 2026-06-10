import { lazy } from 'react';

// project-imports
import AuthLayout from 'layout/Auth';
import Loadable from 'components/Loadable';
import Login3 from 'pages/auth/login3';

// render - login
const AuthLogin = Loadable(lazy(() => import('pages/auth/auth1/login')));
const AuthRegister = Loadable(lazy(() => import('pages/auth/auth1/register')));
const AuthForgotPassword = Loadable(lazy(() => import('pages/auth/auth1/forgot-password')));
const AuthCheckMail = Loadable(lazy(() => import('pages/auth/auth1/check-mail')));
const AuthResetPassword = Loadable(lazy(() => import('pages/auth/auth1/reset-password')));
const AuthCodeVerification = Loadable(lazy(() => import('pages/auth/auth1/code-verification')));

// ==============================|| AUTH ROUTES ||============================== //

const LoginRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      // element: <AuthLayout />,
      children: [
        {
          path: '/',
          element: <Login3 />
        },
        {
          path: 'login',
          element: <Login3 />
        }
        // {
        //   path: 'register',
        //   element: <AuthRegister />
        // },
        // {
        //   path: 'forgot-password',
        //   element: <AuthForgotPassword />
        // },
        // {
        //   path: 'check-mail',
        //   element: <AuthCheckMail />
        // },
        // {
        //   path: 'reset-password',
        //   element: <AuthResetPassword />
        // },
        // {
        //   path: 'code-verification',
        //   element: <AuthCodeVerification />
        // }
      ]
    }
  ]
};

export default LoginRoutes;
