import { RouterProvider } from 'react-router-dom';

// project import
import router from 'routes';
import ThemeCustomization from 'themes';

import Locales from 'components/Locales';
// import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import LogoIcon from 'components/logo/LogoIndex';

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      <LogoIcon /> {/* This injects <link> tags */}
      {/* <RTLLayout> */}
      <Locales>
        <ScrollTop>
          {/* <AuthProvider> */}
          <>
            <RouterProvider router={router} />
            <Snackbar />
          </>
          {/* </AuthProvider> */}
        </ScrollTop>
      </Locales>
      {/* </RTLLayout> */}
    </ThemeCustomization>
  );
}
