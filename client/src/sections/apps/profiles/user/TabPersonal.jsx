// components/TabPersonal.js
import { useOutletContext } from 'react-router';
import { useEffect } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import InputLabel from '@mui/material/InputLabel';
import Autocomplete from '@mui/material/Autocomplete';
import FormHelperText from '@mui/material/FormHelperText';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';

import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project-imports
import MainCard from 'components/MainCard';
import countries from 'data/countries';
import { openSnackbar } from 'api/snackbar';

// hooks
import { useUserProfile, useUpdateUserProfile } from 'api/queries/userProfile';

// assets
import { Add } from 'iconsax-react';
import { ThemeMode } from 'config';
import { Typography } from '@mui/material';
import { useAuth } from 'contexts/AuthContext';

// styles & constant
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = { PaperProps: { style: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP } } };

function useInputRef() {
  return useOutletContext();
}

// ==============================|| USER PROFILE - PERSONAL ||============================== //
export default function TabPersonal() {
  const theme = useTheme();
  const { data: profile, isLoading, error } = useUserProfile();
  const { updateUserProfileAsync, isUpdating, error: updateError } = useUpdateUserProfile();
  const inputRef = useInputRef();
  const { currentUser } = useAuth();

  // Initialize form values from profile data
  const initialValues = {
    firstname: profile?.data?.firstName || '',
    lastname: profile?.data?.lastName || '',
    email: profile?.data?.email || '',
    dob: profile?.data?.dateOfBirth ? new Date(profile.data.dateOfBirth) : new Date(),
    phoneNumber: profile?.data?.phoneNumber || '',
    designation: profile?.data?.designation || '',
    businessName: profile?.data?.businessName || '',
    businessAddress: profile?.data?.businessAddress || '',
    country: profile?.data?.country || 'US',
    state: profile?.data?.state || '',
    submit: null
  };

  // Validation schema aligned with backend
  const validationSchema = Yup.object().shape({
    firstname: Yup.string()
      .trim()
      .max(255)
      .required('First Name is required.'),

    lastname: Yup.string()
      .trim()
      .max(255)
      .required('Last Name is required.'),

    email: Yup.string()
      .trim()
      .email('Invalid email address.')
      .max(255)
      .required('Email is required.'),

  });


  const handleChangeDay = (event, date, setFieldValue) => {
    setFieldValue('dob', new Date(date.setDate(parseInt(event.target.value, 10))));
  };

  const handleChangeMonth = (event, date, setFieldValue) => {
    setFieldValue('dob', new Date(date.setMonth(parseInt(event.target.value, 10))));
  };

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 18);

  if (error) {
    return (
      <MainCard>
        <Box sx={{ p: 2.5 }}>
          <Typography color="error">Error: {error.message}</Typography>
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard content={false} title="Personal Information" sx={{ '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}>
      <Formik
        enableReinitialize // Reinitialize form when profile data changes
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          setSubmitting(true);
          try {
            await updateUserProfileAsync({
              firstName: values.firstname,
              lastName: values.lastname,
              dateOfBirth: values.dob?.toISOString(),
              phoneNumber: values.phoneNumber,
              designation: values.designation,
              businessName: values.businessName,
              businessAddress: values.businessAddress,
              country: values.country,
              state: values.state
            });
            openSnackbar({
              open: true,
              message: 'Personal profile updated successfully.',
              variant: 'alert',
              alert: { color: 'success' }
            });

            setStatus({ success: true });
          } catch (err) {
            openSnackbar({
              open: true,
              message: err?.message || 'Failed to update profile.',
              variant: 'alert',
              alert: { color: 'error' }
            });
            setErrors({ submit: err?.message || 'Failed to update profile.' });
            setStatus({ success: false });
          } finally {
            setSubmitting(false);
          }
        }}

      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, setFieldValue, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Box sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="personal-first-name">First Name</InputLabel>
                    {isLoading ? (
                      <Skeleton
                        variant="text"
                        width={200}
                        height={32}
                        sx={{
                          filter: 'blur(1px)',
                          backgroundColor: theme.palette.mode === ThemeMode.DARK ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        id="personal-first-name"
                        value={values.firstname}
                        name="firstname"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="First Name"
                        autoFocus
                        inputRef={inputRef}
                      />
                    )}
                  </Stack>
                  {touched.firstname && errors.firstname && (
                    <FormHelperText error id="personal-first-name-helper">
                      {errors.firstname}
                    </FormHelperText>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="personal-last-name">Last Name</InputLabel>
                    {isLoading ? (
                      <Skeleton
                        variant="text"
                        width={200}
                        height={32}
                        sx={{
                          filter: 'blur(1px)',
                          backgroundColor: theme.palette.mode === ThemeMode.DARK ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        id="personal-last-name"
                        value={values.lastname}
                        name="lastname"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Last Name"
                      />
                    )}
                  </Stack>
                  {touched.lastname && errors.lastname && (
                    <FormHelperText error id="personal-last-name-helper">
                      {errors.lastname}
                    </FormHelperText>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="personal-email">Email Address</InputLabel>
                    {isLoading ? (
                      <Skeleton
                        variant="text"
                        width={200}
                        height={32}
                        sx={{
                          filter: 'blur(1px)',
                          backgroundColor: theme.palette.mode === ThemeMode.DARK ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    ) : (
                      <TextField
                        type="email"
                        fullWidth
                        value={values.email}
                        name="email"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        id="personal-email"
                        placeholder="Email Address"
                        disabled
                      />
                    )}
                  </Stack>
                  {touched.email && errors.email && (
                    <FormHelperText error id="personal-email-helper">
                      {errors.email}
                    </FormHelperText>
                  )}
                </Grid>
                {/* <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="dob-month">Date of Birth </InputLabel>
                    {isLoading ? (
                      <Skeleton
                        variant="text"
                        width={200}
                        height={32}
                        sx={{
                          filter: 'blur(1px)',
                          backgroundColor: theme.palette.mode === ThemeMode.DARK ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    ) : (
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Select
                          fullWidth
                          value={values.dob.getMonth().toString()}
                          name="dob-month"
                          onChange={(e) => handleChangeMonth(e, values.dob, setFieldValue)}
                        >
                          <MenuItem value="0">January</MenuItem>
                          <MenuItem value="1">February</MenuItem>
                          <MenuItem value="2">March</MenuItem>
                          <MenuItem value="3">April</MenuItem>
                          <MenuItem value="4">May</MenuItem>
                          <MenuItem value="5">June</MenuItem>
                          <MenuItem value="6">July</MenuItem>
                          <MenuItem value="7">August</MenuItem>
                          <MenuItem value="8">September</MenuItem>
                          <MenuItem value="9">October</MenuItem>
                          <MenuItem value="10">November</MenuItem>
                          <MenuItem value="11">December</MenuItem>
                        </Select>
                        <Select
                          fullWidth
                          value={values.dob.getDate().toString()}
                          name="dob-date"
                          onBlur={handleBlur}
                          onChange={(e) => handleChangeDay(e, values.dob, setFieldValue)}
                          MenuProps={MenuProps}
                        >
                          {[
                            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
                            30, 31
                          ].map((i) => (
                            <MenuItem
                              key={i}
                              value={i}
                              disabled={
                                (values.dob.getMonth() === 1 && i > (values.dob.getFullYear() % 4 === 0 ? 29 : 28)) ||
                                (values.dob.getMonth() % 2 !== 0 && values.dob.getMonth() < 7 && i > 30) ||
                                (values.dob.getMonth() % 2 === 0 && values.dob.getMonth() > 7 && i > 30)
                              }
                            >
                              {i}
                            </MenuItem>
                          ))}
                        </Select>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            views={['year']}
                            value={values.dob}
                            maxDate={maxDate}
                            onChange={(newValue) => {
                              setFieldValue('dob', newValue);
                            }}
                            sx={{ width: 1 }}
                          />
                        </LocalizationProvider>
                      </Stack>
                    )}
                  </Stack>
                  {touched.dob && errors.dob && (
                    <FormHelperText error id="personal-dob-helper">
                      {errors.dob}
                    </FormHelperText>
                  )}
                </Grid> */}
                {(currentUser?.role === 'admin' || currentUser?.role === 'contributor') && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="personal-phone">Phone Number</InputLabel>
                        {isLoading ? (
                          <Skeleton
                            variant="text"
                            width={200}
                            height={32}
                            sx={{
                              filter: 'blur(1px)',
                              backgroundColor: theme.palette.mode === ThemeMode.DARK ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        ) : (
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>

                            <TextField
                              fullWidth
                              id="personal-contact"
                              value={values.phoneNumber}
                              name="phoneNumber"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              placeholder="Phone Number"
                            />
                          </Stack>
                        )}
                      </Stack>
                      {touched.phoneNumber && errors.phoneNumber && (
                        <FormHelperText error id="personal-contact-helper">
                          {errors.phoneNumber}
                        </FormHelperText>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="personal-addrees1">Business Name </InputLabel>
                        {isLoading ? (
                          <Skeleton
                            variant="text"
                            width={200}
                            height={80}
                            sx={{
                              filter: 'blur(1px)',
                              backgroundColor: theme.palette.mode === ThemeMode.DARK ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        ) : (
                          <TextField
                            rows={3}
                            fullWidth
                            id="personal-addrees1"
                            value={values.businessName}
                            name="businessName"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Business Name"
                          />
                        )}
                      </Stack>
                      {touched.businessName && errors.businessName && (
                        <FormHelperText error id="personal-address-helper">
                          {errors.businessName}
                        </FormHelperText>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="personal-addrees2">Business Address</InputLabel>
                        {isLoading ? (
                          <Skeleton
                            variant="text"
                            width={200}
                            height={80}
                            sx={{
                              filter: 'blur(1px)',
                              backgroundColor: theme.palette.mode === ThemeMode.DARK ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        ) : (
                          <TextField
                            multiline
                            rows={3}
                            fullWidth
                            id="personal-addrees2"
                            value={values.businessAddress}
                            name="businessAddress"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Business Address"
                          />
                        )}
                      </Stack>
                    </Grid>
                  </>
                )}
                {/* <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="personal-country">Country</InputLabel>
                    {isLoading ? (
                      <Skeleton
                        variant="text"
                        width={200}
                        height={32}
                        sx={{
                          filter: 'blur(1px)',
                          backgroundColor: theme.palette.mode === ThemeMode.DARK ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    ) : (
                      <Autocomplete
                        id="personal-country"
                        fullWidth
                        value={countries.filter((item) => item.code === values?.country)[0]}
                        onBlur={handleBlur}
                        onChange={(event, newValue) => {
                          setFieldValue('country', newValue === null ? '' : newValue.code);
                        }}
                        options={countries}
                        autoHighlight
                        isOptionEqualToValue={(option, value) => option.code === value?.code}
                        getOptionLabel={(option) => option.label}
                        renderOption={(props, option) => (
                          <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                            {option.code && (
                              <img
                                loading="lazy"
                                width="20"
                                src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                                srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                                alt=""
                              />
                            )}
                            {option.label}
                            {option.code && `(${option.code}) ${option.phone}`}
                          </Box>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Choose a country"
                            name="country"
                            inputProps={{
                              ...params.inputProps,
                              autoComplete: 'new-password' // disable autocomplete and autofill
                            }}
                          />
                        )}
                      />
                    )}
                  </Stack>
                  {touched.country && errors.country && (
                    <FormHelperText error id="personal-country-helper">
                      {errors.country}
                    </FormHelperText>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="personal-state">State</InputLabel>
                    {isLoading ? (
                      <Skeleton
                        variant="text"
                        width={200}
                        height={32}
                        sx={{
                          filter: 'blur(1px)',
                          backgroundColor: theme.palette.mode === ThemeMode.DARK ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        id="personal-state"
                        value={values.state}
                        name="state"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="State"
                      />
                    )}
                  </Stack>
                  {touched.state && errors.state && (
                    <FormHelperText error id="personal-state-helper">
                      {errors.state}
                    </FormHelperText>
                  )}
                </Grid> */}
              </Grid>
            </Box>
            <Box sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mt: 2.5 }}>
                <Button variant="outlined" color="secondary" disabled={isSubmitting || isLoading || isUpdating}>
                  Cancel
                </Button>
                <Button disabled={isSubmitting || isUpdating || Object.keys(errors).length !== 0 || isLoading} type="submit" variant="contained">
                  {isUpdating ? 'Saving...' : 'Save'}
                </Button>
              </Stack>
            </Box>
          </form>
        )}
      </Formik>
    </MainCard>
  );
}