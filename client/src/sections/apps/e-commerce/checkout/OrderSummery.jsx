import PropTypes from 'prop-types';
// material-ui
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

// project-imports
import MainCard from 'components/MainCard';

// ==============================|| CHECKOUT - ORDER SUMMARY ||============================== //

export default function OrderSummary({ subtotal, vat, seatDiscount, Total }) {
  const show = true;
  return (
    <Stack spacing={3}>
      <MainCard content={false} sx={{ borderRadius: show ? '12px' : '0 0 12px 12px', borderTop: show ? '1px inherit' : 'none' }}>
        <TableContainer>
          <Table sx={{ minWidth: 'auto' }} size="small" aria-label="simple table">
            <TableBody>
              {show && (
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle1">Order Summary</Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
              )}
              <TableRow>
                <TableCell sx={{ borderBottom: 'none' }}>Subtotal</TableCell>
                <TableCell align="right" sx={{ borderBottom: 'none' }}>
                  {subtotal && <Typography variant="subtitle1">${subtotal.toFixed(2)}</Typography>}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ borderBottom: 'none' }}>Vat</TableCell>
                <TableCell align="right" sx={{ borderBottom: 'none' }}>
                  {vat && <Typography variant="subtitle1">{vat}</Typography>}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ borderBottom: 'none' }}>Seat Discount</TableCell>
                <TableCell align="right" sx={{ borderBottom: 'none' }}>
                  {seatDiscount && (
                    <Typography variant="subtitle1" sx={{ color: 'success.main' }}>
                      {seatDiscount && <Typography variant="subtitle1"> -${seatDiscount.toFixed(2)}</Typography>}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>
      <MainCard>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">Total</Typography>
          {Total && (
            <Typography variant="subtitle1" align="right">
              ${Total?.toFixed(2)}
            </Typography>
          )}
        </Stack>
      </MainCard>
    </Stack>
  );
}

OrderSummary.propTypes = { checkout: PropTypes.any, show: PropTypes.bool };
