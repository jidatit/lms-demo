import { openSnackbar } from 'api/snackbar';

export const toast = ({ message, type, transition = 'SlideLeft', anchorOrigin = { vertical: 'top', horizontal: 'right' } }) => {
  const color = type === 'success' ? 'success' : type === 'error' ? 'error' : 'info';

  openSnackbar({
    open: true,
    message,
    transition,
    variant: 'alert',
    alert: { color },
    anchorOrigin,
    close: true
  });
};
