import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';
import FormHelperText from '@mui/material/FormHelperText';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import * as yup from 'yup';
import { v4 as UIDV4 } from 'uuid';
import { format } from 'date-fns';
import { FieldArray, Form, Formik } from 'formik';

// project-imports
import MainCard from 'components/MainCard';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import InvoiceItem from 'sections/apps/invoice/InvoiceItem';
import AddressModal from 'sections/apps/invoice/AddressModal';
import InvoiceModal from 'sections/apps/invoice/InvoiceModal';

import { openSnackbar } from 'api/snackbar';
import {
  handlerCustomerTo,
  handlerCustomerFrom,
  handlerPreview,
  insertInvoice,
  selectCountry,
  useGetInvoice,
  useGetInvoiceMaster
} from 'api/invoice';
import { APP_DEFAULT_PATH } from 'config';

// assets
import { Add, Edit } from 'iconsax-react';
// import CircularLoader from '../components/CircularLoader';
// import incrementer from '../utils/incrementer';
// import { fetchAllCompanies } from '../utils/comapniesFunctions';
import { useEffect, useState } from 'react';
import CompanyModal from 'sections/apps/invoice/CompanyModal';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useUpdateInvoice } from 'api/queries/invoice';
import CircularLoader from 'pages/dashboard/components/CircularLoader';
import { fetchAllCompanies, fetchCompaniesByContributor } from 'pages/dashboard/utils/comapniesFunctions';
import { useAuth } from 'contexts/AuthContext';

const validationSchema = yup.object({
  status: yup.string().required('Please select an invoice status'),
  due_date: yup.date().nullable().required('Due date is required').typeError('Please enter a valid due date'),
  customerInfo: yup
    .object({
      name: yup.string().required('Please select a company')
    })
    .required('Please select a company'),
  invoice_detail: yup
    .array()
    .required('Please add at least one product')
    .min(1, 'Please add at least one product')
    .of(
      yup.object().shape({
        name: yup.string().required('Product name is required'),
        description: yup.string().required('Product description is required'),
        qty: yup
          .number()
          .typeError('Quantity must be a number')
          .positive('Quantity must be greater than 0')
          .integer('Quantity must be a whole number')
          .required('Quantity is required'),
        price: yup.number().typeError('Price must be a number').positive('Price must be greater than 0').required('Price is required')
      })
    ),
  discount: yup
    .number()
    .typeError('Discount must be a number')
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100%')
    .optional()
    .nullable()
});

function CreateForm({ lists, invoiceMaster }) {
  const theme = useTheme();
  const navigation = useNavigate();
  const location = useLocation();
  const notesLimit = 500;

  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const { currentUser } = useAuth();

  // Get state from navigation for pre-filling
  const { state } = location;

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await fetchCompaniesByContributor(currentUser?.id);
        // companiesData = await fetchCompaniesByContributor(currentUser?.id);

        setCompanies(data);

        // Pre-select company from navigation state
        if (state?.companyInfo?.id) {
          const company = data.find((comp) => comp.id === state.companyInfo.id);
          if (company) {
            setSelectedCompany(company);
          }
        } else if (state?.customerInfo?.email) {
          const company = data.find((comp) => comp.id === state.customerInfo.email);
          if (company) {
            setSelectedCompany(company);
          }
        }
      } catch (err) {
        console.error('Failed to fetch companies', err);
      } finally {
        setLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, [state]);

  // Prepare initial values from navigation state
  const getInitialValues = () => {
    if (state) {
      return {
        id: state.invoiceId || Date.now(),
        invoice_id: state.invoiceId || Date.now(),
        status: state.status || '',
        date: new Date(),
        due_date: state.dates?.dueDate ? new Date(state.dates.dueDate) : state.purchaseDate ? new Date(state.purchaseDate) : null,
        cashierInfo: {
          name: state.cashierInfo?.name || 'Belle J. Richter',
          address: state.cashierInfo?.address || '1300 Cooks Mine, NM 87829',
          phone: state.cashierInfo?.phone || '305-829-7809',
          email: state.cashierInfo?.email || 'belljrc23@gmail.com'
        },
        customerInfo: {
          address: state.companyInfo?.address || '',
          email: state.customerInfo?.email || '',
          name: state.customerInfo?.name || state.companyInfo?.name || '',
          phone: '',
          companyId: state.companyInfo?.id || state.customerInfo?.email || ''
        },
        invoice_detail: [
          {
            id: UIDV4(),
            name: state.bundleDetails?.title || state.invoiceDetails?.description || '',
            description: state.bundleDetails?.description || state.invoiceDetails?.itemDescription || '',
            qty: state.seatsPurchased || state.invoiceDetails?.seatsPurchased || 1,
            price: state.bundleDetails?.seatPrice || state.invoiceDetails?.unitPrice || state.pricing?.baseSubtotal || '1.00'
          }
        ],
        discount: state.discountPercentage || state.invoiceDetails?.discountPercentage || 0,
        tax: 0,
        notes: state.notes || state.invoiceDetails?.notes || ''
      };
    }

    // Fallback if no state (shouldn't happen in edit mode)
    return {
      id: Date.now(),
      invoice_id: Date.now(),
      status: '',
      date: new Date(),
      due_date: null,
      cashierInfo: {
        name: 'Belle J. Richter',
        address: '1300 Cooks Mine, NM 87829',
        phone: '305-829-7809',
        email: 'belljrc23@gmail.com'
      },
      customerInfo: {
        address: '',
        email: '',
        name: '',
        phone: '',
        companyId: ''
      },
      invoice_detail: [
        {
          id: UIDV4(),
          name: '',
          description: '',
          qty: 1,
          price: '1.00'
        }
      ],
      discount: 0,
      tax: 0,
      notes: ''
    };
  };
  //   const { mutateAsync: updateInvoice, isLoading, isPending  } = useUpdateInvoice();

  //   const handlerCreate = async (values) => {
  //     const invoiceId = state.id;
  //     if (!state.id) {
  //       openSnackbar({
  //         open: true,
  //         message: 'Invoice ID is missing. Cannot update invoice.',
  //         anchorOrigin: { vertical: 'top', horizontal: 'right' },
  //         variant: 'alert',
  //         alert: { color: 'error' }
  //       });
  //       return;
  //     }
  //     const subtotal = values?.invoice_detail.reduce((prev, curr) => {
  //       if (curr.name.trim().length > 0) return prev + Number(curr.price * Math.floor(curr.qty));
  //       else return prev;
  //     }, 0);
  //     const taxRate = (values.tax * subtotal) / 100;
  //     const discountRate = (values.discount * subtotal) / 100;
  //     const total = subtotal - discountRate + taxRate;

  //     // Prepare the payload with only allowed fields for edit
  //     const payload = {
  //       amount: total,
  //       status: values.status,
  //       description: values.invoice_detail[0]?.description || '',
  //       dueDate: values.due_date ? format(values.due_date, 'yyyy-MM-dd') : null,
  //       companyId: selectedCompany?.id || ''
  //       //   pdfUrl: `https://example.com/invoices/updated_invoice_${values.invoice_id}.pdf`
  //     };

  //     const response = await updateInvoice({
  //       invoiceId,
  //       payload
  //     });
  //     console.log('Edit Invoice Payload:', payload);

  //     // Show success message and stay on edit page
  //     openSnackbar({
  //       open: true,
  //       message: 'Invoice updated successfully',
  //       anchorOrigin: { vertical: 'top', horizontal: 'right' },
  //       variant: 'alert',
  //       alert: { color: 'success' }
  //     });
  //   };
  const { mutateAsync: updateInvoice, isLoading, isPending } = useUpdateInvoice();

  const handlerCreate = async (values) => {
    const invoiceId = state.id;
    if (!state.id) {
      openSnackbar({
        open: true,
        message: 'Invoice ID is missing. Cannot update invoice.',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'error' }
      });
      return;
    }

    try {
      const subtotal = values?.invoice_detail.reduce((prev, curr) => {
        if (curr.name.trim().length > 0) return prev + Number(curr.price * Math.floor(curr.qty));
        else return prev;
      }, 0);
      const taxRate = (values.tax * subtotal) / 100;
      const discountRate = (values.discount * subtotal) / 100;
      const total = subtotal - discountRate + taxRate;

      // Prepare the payload with only allowed fields for edit
      const payload = {
        amount: total,
        status: values.status,
        description: values.invoice_detail[0]?.description || '',
        dueDate: values.due_date ? format(values.due_date, 'yyyy-MM-dd') : null,
        companyId: selectedCompany?.id || ''
        // pdfUrl: `https://example.com/invoices/updated_invoice_${values.invoice_id}.pdf`
      };

      console.log('Edit Invoice Payload:', payload);

      const response = await updateInvoice({
        invoiceId,
        payload
      });

      // Show success message after successful mutation
      openSnackbar({
        open: true,
        message: 'Invoice updated successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'success' }
      });

      // Optional: Navigate back or refresh data
      navigation(-1); // Go back to previous page
      // Or refresh the page data if needed
    } catch (error) {
      console.error('Error updating invoice:', error);
      openSnackbar({
        open: true,
        message: 'Failed to update invoice. Please try again.',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'error' }
      });
    }
  };
  return (
    <Formik
      initialValues={getInitialValues()}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        handlerCreate(values);
      }}
      enableReinitialize
    >
      {({ handleBlur, errors, handleChange, handleSubmit, values, isValid, setFieldValue, touched }) => {
        const handleCompanySelect = (company) => {
          console.log('Selected Company:', {
            id: company.id,
            name: company.name,
            address: company.address,
            vatNumber: company.vatNumber
          });

          setSelectedCompany(company);
          setIsCompanyModalOpen(false);

          setFieldValue('customerInfo', {
            name: company.name,
            address: company.address,
            phone: '',
            email: '',
            companyId: company.id
          });
        };

        const subtotal = values?.invoice_detail.reduce((prev, curr) => {
          if (curr.name.trim().length > 0) return prev + Number(curr.price * Math.floor(curr.qty));
          else return prev;
        }, 0);
        const taxRate = (values.tax * subtotal) / 100;
        const discountRate = (values.discount * subtotal) / 100;
        const total = subtotal - discountRate + taxRate;

        return (
          <Form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h4" gutterBottom>
                  Edit Invoice
                </Typography>
                {/* {state && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Editing invoice with pre-filled data
                  </Typography>
                )} */}
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Stack spacing={1}>
                  <InputLabel>Status</InputLabel>
                  <FormControl sx={{ width: '100%' }}>
                    <Select
                      value={values.status}
                      displayEmpty
                      name="status"
                      renderValue={(selected) => {
                        if (selected.length === 0) {
                          return <Box sx={{ color: 'secondary.400' }}>Select status</Box>;
                        }
                        return selected;
                      }}
                      onChange={handleChange}
                      error={Boolean(errors.status && touched.status)}
                    >
                      <MenuItem disabled value="">
                        Select status
                      </MenuItem>
                      <MenuItem value="paid">Paid</MenuItem>
                      <MenuItem value="unpaid">Unpaid</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
                {touched.status && errors.status && <FormHelperText error={true}>{errors.status}</FormHelperText>}
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Stack spacing={1}>
                  <InputLabel>Due Date</InputLabel>
                  <FormControl sx={{ width: '100%' }} error={Boolean(touched.due_date && errors.due_date)}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        format="dd/MM/yyyy"
                        value={values.due_date}
                        onChange={(newValue) => setFieldValue('due_date', newValue)}
                      />
                    </LocalizationProvider>
                  </FormControl>
                </Stack>
                {touched.due_date && errors.due_date && <FormHelperText error={true}>{errors.due_date}</FormHelperText>}
              </Grid>
              <Grid item xs={12} sm={6} md={3}></Grid>

              {/* From Section */}
              <Grid item xs={12} sm={6}>
                <MainCard sx={{ minHeight: 168 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Stack spacing={2}>
                        <Typography variant="h5">From:</Typography>
                        <Stack sx={{ width: '100%' }}>
                          <Typography variant="subtitle1">{values?.cashierInfo?.name}</Typography>
                          <Typography color="secondary">{values?.cashierInfo?.address}</Typography>
                          <Typography color="secondary">{values?.cashierInfo?.phone}</Typography>
                          <Typography color="secondary">{values?.cashierInfo?.email}</Typography>
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box textAlign={{ xs: 'left', sm: 'right' }} color="secondary.200">
                        <Button
                          variant="outlined"
                          startIcon={<Edit />}
                          color="secondary"
                          onClick={() => handlerCustomerFrom(true)}
                          size="small"
                          disabled={true}
                        >
                          Change
                        </Button>
                        <AddressModal
                          open={invoiceMaster.open}
                          setOpen={(value) => handlerCustomerFrom(value)}
                          handlerAddress={(address) => setFieldValue('cashierInfo', address)}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </MainCard>
              </Grid>

              {/* To Section with Company Selector */}
              <Grid item xs={12} sm={6}>
                <MainCard sx={{ minHeight: 168 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Stack spacing={2}>
                        <Typography variant="h5">To:</Typography>
                        <Stack sx={{ width: '100%' }}>
                          {selectedCompany ? (
                            <>
                              <Typography variant="subtitle1">{selectedCompany.name}</Typography>
                              <Typography color="secondary">{selectedCompany.address}</Typography>
                              <Typography color="secondary">VAT: {selectedCompany.vatNumber}</Typography>
                              <Typography color="secondary">{selectedCompany?.email}</Typography>
                            </>
                          ) : (
                            <Typography color="text.secondary" fontStyle="italic">
                              No company selected
                            </Typography>
                          )}
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box textAlign="right" color="grey.200">
                        <Button
                          size="small"
                          startIcon={<Add />}
                          color="secondary"
                          variant="outlined"
                          onClick={() => setIsCompanyModalOpen(true)}
                        >
                          {selectedCompany ? 'Change' : 'Select'}
                        </Button>

                        <CompanyModal
                          open={isCompanyModalOpen}
                          setOpen={setIsCompanyModalOpen}
                          handlerCompany={handleCompanySelect}
                          companies={companies}
                          loading={loadingCompanies}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </MainCard>
                {touched.customerInfo && errors.customerInfo && <FormHelperText error={true}>{errors?.customerInfo?.name}</FormHelperText>}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h5">Detail</Typography>
              </Grid>
              <Grid item xs={12} disabled={true}>
                <FieldArray
                  name="invoice_detail"
                  render={({ remove, push }) => {
                    return (
                      <>
                        <TableContainer>
                          <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                              <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Qty</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell align="right">Amount</TableCell>
                                <TableCell align="center">Action</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {values.invoice_detail?.map((item, index) => (
                                <TableRow key={item.id}>
                                  <TableCell>{values.invoice_detail.indexOf(item) + 1}</TableCell>
                                  <InvoiceItem
                                    key={item.id}
                                    id={item.id}
                                    index={index}
                                    name={item.name}
                                    description={item.description}
                                    qty={item.qty}
                                    price={item.price}
                                    onDeleteItem={(index) => remove(index)}
                                    onEditItem={handleChange}
                                    Blur={handleBlur}
                                    errors={errors}
                                    touched={touched}
                                    disabled={true}
                                  />
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <Divider />
                        {touched.invoice_detail && errors.invoice_detail && !Array.isArray(errors?.invoice_detail) && (
                          <Stack direction="row" justifyContent="center" sx={{ p: 1.5 }}>
                            <FormHelperText error={true}>{errors.invoice_detail}</FormHelperText>
                          </Stack>
                        )}
                        <Grid container justifyContent="space-between">
                          <Grid item xs={12} md={8}>
                            {/* Add Item button can be added here if needed */}
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Grid container justifyContent="space-between" spacing={2} sx={{ pt: 2.5, pb: 2.5 }}>
                              <Grid item xs={6}>
                                <Stack spacing={1}>
                                  <InputLabel>Discount(%)</InputLabel>
                                  <TextField
                                    type="number"
                                    fullWidth
                                    name="discount"
                                    id="discount"
                                    placeholder="0.0"
                                    value={values.discount}
                                    onChange={handleChange}
                                    disabled={true}
                                    inputProps={{
                                      min: 0,
                                      max: 100
                                    }}
                                  />
                                </Stack>
                              </Grid>
                              <Grid item xs={6}>
                                {/* Tax field can be added here if needed */}
                              </Grid>
                            </Grid>
                            <Grid item xs={12}>
                              <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography color={theme.palette.secondary.main}>Sub Total:</Typography>
                                  <Typography>{'$ ' + subtotal.toFixed(2)}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography color={theme.palette.secondary.main}>Discount:</Typography>
                                  <Typography variant="h6" color="success.main">
                                    {'$ ' + discountRate.toFixed(2)}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography color={theme.palette.secondary.main}>Tax:</Typography>
                                  <Typography>{'$ ' + taxRate.toFixed(2)}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="subtitle1">Grand Total:</Typography>
                                  <Typography variant="subtitle1">{total % 1 === 0 ? '$ ' + total : '$ ' + total.toFixed(2)}</Typography>
                                </Stack>
                              </Stack>
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    );
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel>Notes</InputLabel>
                  <TextField
                    placeholder="Address"
                    rows={3}
                    value={values.notes}
                    multiline
                    name="notes"
                    onChange={handleChange}
                    inputProps={{
                      maxLength: notesLimit
                    }}
                    disabled={true}
                    helperText={`${values.notes.length} / ${notesLimit}`}
                    sx={{
                      width: '100%',
                      '& .MuiFormHelperText-root': {
                        mr: 0,
                        display: 'flex',
                        justifyContent: 'flex-end'
                      }
                    }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                {/* <FormControlLabel
                  control={<Checkbox checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} color="primary" />}
                  label="Send Email"
                /> */}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" justifyContent="flex-end" alignItems="flex-end" spacing={2} sx={{ height: '100%' }}>
                  <Button color="primary" variant="contained" type="submit">
                    Update Invoice
                  </Button>
                  <InvoiceModal
                    isOpen={invoiceMaster.isOpen}
                    setIsOpen={(value) => handlerPreview(value)}
                    key={values.invoice_id}
                    invoiceInfo={{
                      ...values,
                      subtotal,
                      taxRate,
                      discountRate,
                      total,
                      companyId: selectedCompany?.id
                    }}
                    items={values?.invoice_detail}
                    onAddNextInvoice={() => handlerPreview(false)}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
}

export default function EditInvoice() {
  const { invoice } = useGetInvoice();
  const { invoiceMasterLoading, invoiceMaster } = useGetInvoiceMaster();

  const isLoader = invoiceMasterLoading || invoiceMaster === undefined;
  const loader = (
    <Box sx={{ height: 'calc(100vh - 310px)' }}>
      <CircularLoader />
    </Box>
  );

  return (
    <>
      {/* <Breadcrumbs custom heading="New Invoice" links={breadcrumbLinks} /> */}
      <MainCard>{isLoader ? loader : <CreateForm {...{ lists: invoice, invoiceMaster }} />}</MainCard>
    </>
  );
}

CreateForm.propTypes = { lists: PropTypes.array, invoiceMaster: PropTypes.any };
