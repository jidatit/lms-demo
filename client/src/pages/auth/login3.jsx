import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Cookies from 'js-cookie';

// project-imports
import Logo from 'components/logo';
import AuthCard from 'sections/auth/AuthCard';
import AuthWrapper3 from 'sections/auth/AuthWrapper3';
import { Button, IconButton, InputAdornment, InputLabel, Paper } from '@mui/material';
import axiosInstance from 'utils/axiosConfig';
import { useAuth } from 'contexts/AuthContext';
import AuthCodeVerification from 'sections/auth/auth-forms/AuthCodeVerification';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

import {
  useInitiatePasswordless,
  useMicrosoftLogin,
  useRequestPasswordReset,
  useResendOTP,
  useResendOtp,
  useResetVerify,
  useSetPassword,
  useVerifyPasswordless
} from 'api/queries/auth';
import DemoRoleButtons from 'mocks/DemoRoleButtons';

export default function Login3() {
  const theme = useTheme();

  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { search } = useLocation();
  const [isSetMode, setIsSetMode] = useState(false); // false = reset, true = set

  // New state variables for multi-step logic
  const [userRole, setUserRole] = useState(null);
  const [signinType, setSigninType] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resend, setResend] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['1', '2'];
  const [microsoftLoading, setMicrosoftLoading] = useState(false);

  const { login, passwordlessLogin, logout } = useAuth();
  const [userData, setUserData] = useState(null); // Store { userId, role, signInType }
  const { mutateAsync: initiatePasswordless } = useInitiatePasswordless();
  const { mutateAsync: verifyPasswordless } = useVerifyPasswordless();
  const { mutateAsync: resendOtp } = useResendOtp();
  const { mutateAsync: requestPasswordReset } = useRequestPasswordReset();
  const { mutateAsync: setPasswordMutation } = useSetPassword();
  const { mutateAsync: resetVerify } = useResetVerify();
  const { mutateAsync: initiateMicrosoftLogin, isPending: microsoftLoginPending } = useMicrosoftLogin();

  const [showPwd, setShowPwd] = useState(false);
  const handleNext = () => {
    setActiveStep((prevStep) => {
      const nextStep = Math.min(prevStep + 1, steps.length - 1);

      return nextStep;
    });
  };
  const handlePrevious = () => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
  };
  // Handle URL parameters for Microsoft Entra ID redirects
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const error = urlParams.get('error');
    const welcome = urlParams.get('welcome');
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    console.log('states', urlParams, error, welcome, code, state);
    // Handle signup success
    if (welcome === 'true') {
      setMessage('Microsoft Entra ID signup completed successfully! You can now sign in.');
    }

    // Handle signup/signin errors
    if (error) {
      setError(decodeURIComponent(error));
      // Clean URL
    }

    // Handle Microsoft OAuth callback (both signup and signin)
    if (code) {
      handleMicrosoftCallback();
    }

    // Check for existing auth in cookies (from Microsoft redirect)
    checkCookieAuth();
  }, [location.search]);

  // Check if user is already authenticated via cookies
  const checkCookieAuth = async () => {
    try {
      let accessToken = Cookies.get('accessToken');
      let refreshToken = Cookies.get('refreshToken');
      let user = Cookies.get('user');

      // Fallback: try query params if missing
      if (!accessToken || !refreshToken || !user) {
        const urlParams = new URLSearchParams(window.location.search);

        const accessTokenParam = urlParams.get('accessToken');
        const refreshTokenParam = urlParams.get('refreshToken');
        const userParam = urlParams.get('user');

        if (accessTokenParam && refreshTokenParam && userParam) {
          accessToken = decodeURIComponent(accessTokenParam);
          refreshToken = decodeURIComponent(refreshTokenParam);
          user = decodeURIComponent(userParam);

          // Save into cookies for future reloads
          Cookies.set('accessToken', accessToken);
          Cookies.set('refreshToken', refreshToken);
          Cookies.set('user', user);

          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }

      if (accessToken && refreshToken && user) {
        const parsedUser = JSON.parse(user);
        await passwordlessLogin({
          accessToken,
          refreshToken,
          user: parsedUser,
        });

        const dashboardPath = getDashboardPath(parsedUser.role);
        navigate(dashboardPath);
      }
    } catch (error) {
      console.error('Cookie auth check failed:', error);
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('user');
    }
  };


  // Handle Microsoft OAuth callback
  const handleMicrosoftCallback = async () => {
    setMicrosoftLoading(true);
    setError(null);

    try {
      // The backend should have already processed the callback and set cookies
      // We just need to check for the cookies and authenticate the user
      setTimeout(() => {
        checkCookieAuth();
        setMicrosoftLoading(false);
      }, 1000); // Small delay to allow cookies to be set
    } catch (error) {
      console.error('Microsoft callback error:', error);
      setError('Microsoft authentication failed. Please try again.');
      setMicrosoftLoading(false);
    }
  };
  const handleMicrosoftSignIn = async () => {
    setMicrosoftLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Use TanStack Query mutation to initiate Microsoft login
      await initiateMicrosoftLogin();
      // The mutation will automatically redirect to Microsoft on success
    } catch (error) {
      console.error('Microsoft login initiation failed:', error);
      setError(error.message || 'Failed to initiate Microsoft login');
      setMicrosoftLoading(false);
    }
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleEmailSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await initiatePasswordless(email);
      if (!data) {
        setError('Unable to find or access your account');
        return;
      }

      setUserData({ userId: data.userId, role: data.role, signInType: data.signInType });
      setSigninType(data.signInType);
      setUserRole(data.role);
      if (data.signInType === 'passwordless') {
        setShowBack(true);
        setIsOtpSent(true);
        setMessage('OTP sent successfully!');
      } else if (data.signInType === 'withPassword') {
        setMessage('Please enter your password');
        setShowBack(true);
      } else {
        setError('Invalid sign-in type');
      }
      handleNext();
    } catch (error) {
      const errorMessage = error.message || 'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (role) => {
    try {
      const data = await resendOtp({
        userId: userData.userId,
        purpose: 'verify'
      });
      console.log('OTP resend data:', data);

      if (data.success === true) {
        setIsOtpSent(true);
        setMessage('OTP sent successfully!');
      } else {
        setMessage(response.data.message);
        setError(response.data.message);
      }
    } catch (error) {
      setMessage('Error sending OTP. Please try again.');
      setError('Error sending OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async (otp) => {
    setLoading(true);
    if (!otp) {
      setError('OTP is required');
      setMessage('OTP is required');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await verifyPasswordless({
        userId: userData.userId,
        otp
      });
      await passwordlessLogin(data);
      const dashboardPath = getDashboardPath(userData.role);
      navigate(dashboardPath);
      setMessage('Logged in successfully');
    } catch (error) {
      const errorMessage = error.message || 'Invalid OTP or OTP expired';
      setError(errorMessage);
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    setShowBack(true);

    try {
      const { success, message: otpMessage, userId, role, signInType } = await requestPasswordReset(email);
      if (success) {
        setUserData({ userId: userId, role: role, signInType: signInType });
        setMessage(otpMessage || 'Reset OTP sent successfully!');
        setResetPassword(true);
        setUserRole('temp');
        setIsOtpSent(true);
      } else {
        setError(otpMessage || 'Failed to send reset OTP.');
        setIsOtpSent(false);
      }
    } catch (err) {
      console.error(err);
      const responseMessage = err?.message;
      setError(responseMessage || 'Something went wrong. Please try again.');
      setIsOtpSent(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResetVerifyOtp = async (otp) => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await resetVerify({ userId: userData?.userId, otp });

      if (response.success) {
        setResetPassword(false);
        setShowResetPassword(true);
        setResend(false);
      } else {
        setMessage(response.message || 'Invalid OTP or OTP expired.');
        setError(response.message || 'Invalid OTP or OTP expired.');
      }
    } catch (error) {
      console.error(error);
      const responseMessage = error?.response?.data?.message;
      setMessage(responseMessage || 'Error verifying OTP. Please try again.');
      setError(responseMessage || 'Error verifying OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);

    try {
      const response = await setPasswordMutation({
        userId: userData?.userId,
        password: newPassword
      });

      if (response.success) {
        setMessage(response.message || 'Password reset successfully!');
        setShowResetPassword(false);
        setUserRole('');
      } else {
        const msg = response.message || 'Failed to reset password.';
        setError(msg);
        setMessage(msg);
      }
    } catch (err) {
      const responseMessage = err?.message;
      setError(responseMessage || 'Error resetting password. Please try again.');
      setMessage(responseMessage || 'Error resetting password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setUserRole(null);
    handlePrevious();
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({ email, password });
      const dashboardPath = getDashboardPath(userRole);
      navigate(dashboardPath);
    } catch (error) {
      const errorMessage = error.message || 'Invalid email or password';
      console.error('Login error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/dashboard/home';
      case 'contributor':
        return '/contrib_dashboard/home';
      case 'groupLeader':
        return '/groupleader_dashboard/home';
      case 'subscriber':
        return '/subscriber_dashboard';
      case 'supportAgent':
        return '/agent_dashboard/profile/user/personal';
      default:
        throw new Error('Invalid user type');
    }
  };
  const renderLoginForm = () => {
    // Initial email input
    if (!userRole) {
      return (
        <Grid container spacing={3}>
          <Box component="form" onSubmit={handleEmailSubmit} sx={{ width: '100%', gap: 2 }}>
            <Grid item xs={12} sx={{ textAlign: 'center', margin: '20px' }}>
              <Stack spacing={1}>
                <Typography variant="h3">Welcome Back</Typography>
                <Typography>Sign up or login with your work email.</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel>Email</InputLabel>
                <TextField
                  required
                  fullWidth
                  id="email"
                  placeholder="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value.trim().toLowerCase());
                    setError('');
                  }}
                  error={!!error}
                  helperText={error}
                  disabled={loading}
                />
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Continue'}
                </Button>

                <Button type="button" onClick={handleMicrosoftSignIn} variant="contained" color="primary" fullWidth>
                  {microsoftLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign in with Microsoft'}
                </Button>
                <div className="flex justify-end">
                  <Typography variant="body2" onClick={handleResetPassword} sx={{ cursor: 'pointer', color: '#23436d', mt: 1 }}>
                    Reset Your Password
                  </Typography>
                </div>
                <DemoRoleButtons />
              </Stack>
            </Grid>
          </Box>
          {message && (
            <Grid item xs={12}>
              <Typography variant="body2" color={message.includes('success') ? 'success.main' : 'error.main'}>
                {message}
              </Typography>
            </Grid>
          )}
        </Grid>
      );
    }

    // Passwordless OTP flow
    // inside your component render...
    if (signinType === 'passwordless') {
      const isError = Boolean(message && !message.toLowerCase().includes('success'));

      return (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack spacing={1}>
              <Typography variant="h3">Enter Verification Code</Typography>
              {/* only show this when not an error */}
              {!isError && <Typography color="secondary">We have sent it to your email.</Typography>}
            </Stack>
          </Grid>

          {/* only show this when not an error */}
          {!isError && (
            <Grid item xs={12}>
              <Typography>We've sent you a code at {email}</Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <AuthCodeVerification handleBack={handleGoBack} loading={loading} onOtpSubmit={handleVerifyOtp} resendOtp={handleEmailSubmit} />
          </Grid>

          {message && (
            <Grid item xs={12}>
              <Typography variant="body2" color={message.toLowerCase().includes('success') ? 'success.main' : 'error.main'}>
                {message}
              </Typography>
            </Grid>
          )}
        </Grid>
      );
    }

    // Reset password OTP flow
    if (resetPassword) {
      return (
        <Box sx={{ width: '100%', gap: 2 }}>
          {!isOtpSent ? (
            <Typography>Sending OTP to {email}...</Typography>
          ) : (
            <>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <Typography variant="h3">Enter Verification Code</Typography>
                  <Typography color="secondary">We have sent it to your email.</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Typography>We've sent you a code at {email}</Typography>
              </Grid>
              <Grid item xs={12}>
                <AuthCodeVerification
                  handleBack={handleGoBack}
                  loading={loading}
                  onOtpSubmit={handleResetVerifyOtp}
                  resendOtp={handleResetPassword}
                />
              </Grid>
              {message && (
                <Grid item xs={12}>
                  <Typography variant="body2" color={message.includes('success') ? 'success.main' : 'error.main'}>
                    {message}
                  </Typography>
                </Grid>
              )}
            </>
          )}

          {resend && (
            <Button disabled={loading} onClick={handleResetPassword} variant="contained" color="primary">
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Send OTP again'}
            </Button>
          )}
        </Box>
      );
    }

    // New password setup
    if (showResetPassword) {
      return (
        <Box component="form" onSubmit={handleConfirmPassword} sx={{ width: '100%', gap: 2 }}>
          <Grid item xs={12}>
            <Stack spacing={1} marginY={4}>
              <Typography variant="h3"> {isSetMode ? 'Set Your Password' : 'Reset Your Password'}</Typography>
            </Stack>
          </Grid>

          <InputLabel>New Password</InputLabel>
          <TextField
            required
            fullWidth
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={!!error}
            margin="normal"
          />
          <InputLabel>Confirm Password</InputLabel>
          <TextField
            required
            fullWidth
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!error}
            helperText={error}
            margin="normal"
          />

          <Button
            disabled={loading}
            type="submit"
            variant="contained"
            color="primary"
            sx={{ marginY: 2 }}
          // className="bg-[#299aa1] px-6 text-lg hover:bg-[#23436d] transition-colors duration-200 ease-in text-white w-full my-4 py-3 rounded-full flex justify-center items-center"
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : isSetMode ? 'Set Password' : 'Reset Password'}
          </Button>
          {message && (
            <Typography color="success" sx={{ mt: 2 }}>
              {message}
            </Typography>
          )}
        </Box>
      );
    }

    return (
      <Box component="form" onSubmit={handlePasswordLogin} sx={{ width: '100%', gap: 2, mt: 4 }}>
        <Grid item xs={12} sx={{ textAlign: 'center', mb: 3 }}>
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Typography variant="h3">Sign in</Typography>
            {/* <Typography>Partner Portal</Typography> */}
          </Stack>
        </Grid>
        <Stack spacing={1} marginY={3}>
          <InputLabel>Email</InputLabel>
          <TextField required fullWidth id="email" placeholder="Email Address" value={email} disabled margin="normal" />
          <InputLabel>Password</InputLabel>
          <TextField
            required
            fullWidth
            id="password"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            helperText={error}
            margin="normal"
          />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button fullWidth color="secondary" variant="outlined" onClick={handleGoBack}>
            Back
          </Button>
          <Button disabled={loading} type="submit" fullWidth variant="contained" color="primary">
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign In'}
          </Button>
        </Stack>
      </Box>
    );
  };
  // whenever we're in an OTP screen and `error` becomes non‐empty, go back
  // useEffect(() => {
  //   if (error && signinType === 'passwordless') {
  //     handleGoBack();
  //   }
  // }, [error, signinType, resetPassword, handleGoBack]);
  return (
    <AuthWrapper3>
      <Grid container spacing={3} sx={{ minHeight: '100%', alignContent: 'space-between' }}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Logo />
            <Typography color="secondary">
              Step
              <Typography variant="subtitle1" sx={{ display: 'inline-block', margin: '0 5px' }}>
                {activeStep + 1}
              </Typography>
              to {steps.length}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sx={{ '& > div': { margin: '24px auto' } }}>
          <Box
            sx={{
              maxWidth: { xs: 300, md: 400 },
              margin: { xs: 2.5, md: 3 },
              '& > *': {
                flexGrow: 1,
                flexBasis: '50%'
              }
            }}
            border={false}
          >
            {renderLoginForm()}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="center" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography align="center">
              By signing in, you confirm to have read
              <Typography component={Link} to={'#'} sx={{ textDecoration: 'none', px: 0.5 }} color="primary">
                Privacy Policy
              </Typography>
              and agree to the
              <Typography component={Link} to={'#'} sx={{ textDecoration: 'none', pl: 0.5 }} color="primary">
                Terms of Service
              </Typography>
              .
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </AuthWrapper3>
  );
}
