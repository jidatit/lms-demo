// CompanyModal.jsx - Create this as a new component file or add it in the same file
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import { SearchNormal1 } from 'iconsax-react';
import CircularLoader from 'pages/dashboard/components/CircularLoader';

function CompanyModal({ open, setOpen, handlerCompany, companies, loading }) {
  const theme = useTheme();

  function closeCompanyModal() {
    setOpen(false);
  }

  return (
    <Dialog
      maxWidth="sm"
      open={open}
      onClose={closeCompanyModal}
      sx={{ '& .MuiDialog-paper': { p: 0 }, '& .MuiBackdrop-root': { opacity: '0.5 !important' } }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Select Organization</Typography>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 2.5 }}>
        <FormControl sx={{ width: '100%', pb: 2 }}>
          <TextField
            autoFocus
            id="search-company"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchNormal1 size={18} />
                </InputAdornment>
              )
            }}
            placeholder="Search organization"
            fullWidth
          />
        </FormControl>
        <Stack spacing={2}>
          <CompanyList handlerCompany={handlerCompany} companies={companies} loading={loading} theme={theme} />
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2.5 }}>
        <Button color="error" onClick={closeCompanyModal}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CompanyList({ handlerCompany, companies, loading, theme }) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularLoader />
      </Box>
    );
  }

  if (companies.length === 0) {
    return (
      <Typography textAlign="center" color="text.secondary">
        No companies available
      </Typography>
    );
  }

  return (
    <>
      {companies.map((company) => (
        <Box
          onClick={() => handlerCompany(company)}
          key={company.id}
          sx={{
            width: '100%',
            border: '1px solid',
            borderColor: 'secondary.200',
            borderRadius: 1,
            p: 1.25,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: theme.palette.primary.lighter,
              borderColor: theme.palette.primary.lighter
            }
          }}
        >
          <Typography variant="subtitle1">{company.name}</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
            <Typography variant="body2" color="secondary">
              {company.address}
            </Typography>
            <Typography variant="body2" color="secondary">
              VAT: {company.vatNumber}
            </Typography>
            <Typography variant="body2" color="secondary">
              ID: {company.id}
            </Typography>
            <Typography variant="body2" color="secondary">
              Email: {company.email}
            </Typography>
          </Stack>
        </Box>
      ))}
    </>
  );
}

CompanyModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  handlerCompany: PropTypes.func,
  companies: PropTypes.array,
  loading: PropTypes.bool
};

CompanyList.propTypes = {
  handlerCompany: PropTypes.func,
  companies: PropTypes.array,
  loading: PropTypes.bool,
  theme: PropTypes.object
};

export default CompanyModal;
