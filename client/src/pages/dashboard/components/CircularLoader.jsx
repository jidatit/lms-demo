// material ui
import Stack from '@mui/material/Stack';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

// project import
// import CircularWithPath from './@extended/progress/CircularWithPath';

// ==============================|| LOADER - CIRCULAR ||============================== //

export default function CircularLoader() {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', marginBottom: '40px' }}>
      <CircularWithPath />
    </Stack>
  );
}
