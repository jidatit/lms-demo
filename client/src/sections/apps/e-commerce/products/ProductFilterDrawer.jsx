import PropTypes from 'prop-types';
// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';

// project-imports
import ProductFilterView from './ProductFilterView';
import ProductFilter from './ProductFilter';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

import { ThemeMode } from 'config';
import { HEADER_HEIGHT } from 'config';
import useConfig from 'hooks/useConfig';

// ==============================|| PRODUCT - FILTER DRAWER ||============================== //

export default function ProductFilterDrawer({
  filter,
  initialState,
  handleDrawerOpen,
  openFilterDrawer,
  setFilter,
  setLoading,
  categories
}) {
  const theme = useTheme();

  const { mode, container } = useConfig();
  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const matchLG = useMediaQuery(theme.breakpoints.only('lg'));
  const drawerBG = mode === ThemeMode.DARK ? 'dark.main' : 'white';

  const filterIsEqual = (a1, a2) =>
    a1 === a2 ||
    (a1.length === a2.length &&
      a1.search === a2.search &&
      a1.sort === a2.sort &&
      a1.price === a2.price &&
      a1.rating === a2.rating &&
      JSON.stringify(a1.gender) === JSON.stringify(a2.gender) &&
      JSON.stringify(a1.categories) === JSON.stringify(a2.categories) &&
      JSON.stringify(a1.colors) === JSON.stringify(a2.colors));
  const handelFilter = (type, params) => {
    setLoading(true);

    setFilter((prev) => {
      let updatedFilter = { ...prev };

      switch (type) {
        case 'categories':
          if (params === 'all') {
            updatedFilter.categories = ['all']; // Reset to "All"
          } else {
            if (prev.categories.includes('all')) {
              updatedFilter.categories = [params]; // Replace "All" with the selected category
            } else {
              updatedFilter.categories = prev.categories.includes(params)
                ? prev.categories.filter((cat) => cat !== params) // Remove if already selected
                : [...prev.categories, params]; // Add if not selected
            }
          }
          break;

        case 'search':
          updatedFilter.search = params;
          break;

        case 'reset':
          updatedFilter = {
            search: '',
            categories: ['all'] // Reset categories to "All"
          };
          break;

        default:
          break;
      }

      return updatedFilter;
    });

    setLoading(false);
  };

  const drawerContent = (
    <Stack sx={{ p: 3, pt: 0 }} spacing={0.5}>
      <ProductFilterView
        filter={filter}
        filterIsEqual={filterIsEqual}
        handelFilter={handelFilter}
        initialState={initialState}
        categories={categories}
      />
      <ProductFilter filter={filter} handelFilter={handelFilter} categories={categories} />
    </Stack>
  );

  return (
    <Drawer
      sx={{
        width: container && matchLG ? 240 : 320,
        flexShrink: 0,
        zIndex: { xs: 1200, lg: 0 },
        mr: openFilterDrawer && !matchDownLG ? 2.5 : 0,
        '& .MuiDrawer-paper': {
          height: matchDownLG ? '100%' : 'auto',
          width: container && matchLG ? 240 : 320,
          boxSizing: 'border-box',
          position: 'relative',
          boxShadow: 'none'
        }
      }}
      variant={matchDownLG ? 'temporary' : 'persistent'}
      anchor="left"
      open={openFilterDrawer}
      ModalProps={{ keepMounted: true }}
      onClose={handleDrawerOpen}
    >
      <MainCard
        title="Filter"
        sx={{
          bgcolor: matchDownLG ? 'transparent' : drawerBG,
          borderRadius: '4px 0 0 4px',
          borderRight: 'none'
        }}
        border={!matchDownLG}
        content={false}
      >
        {matchDownLG && <SimpleBar sx={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}>{drawerContent}</SimpleBar>}
        {!matchDownLG && drawerContent}
      </MainCard>
    </Drawer>
  );
}

ProductFilterDrawer.propTypes = {
  filter: PropTypes.any,
  initialState: PropTypes.any,
  handleDrawerOpen: PropTypes.func,
  openFilterDrawer: PropTypes.oneOfType([PropTypes.bool, PropTypes.any]),
  setFilter: PropTypes.func,
  setLoading: PropTypes.func
};
