import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

// project-imports
import Logo from 'components/logo';
import AuthCard from 'sections/auth/AuthCard';
import AuthWrapper3 from 'sections/auth/AuthWrapper3';

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

  // New state variables for multi-step logic
  const [userRole, setUserRole] = useState(null);
  const [signinType, setSigninType] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resend, setResend] = useState(false);

  // Placeholder handler functions (you'll replace with actual implementations)
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // Implement email submission logic
    console.log('Email submitted:', email);
  };

  const handleSendOtp = (role) => {
    // Implement OTP sending logic
    console.log('Sending OTP for role:', role);
    setIsOtpSent(true);
  };

  const handleVerifyOtp = () => {
    // Implement OTP verification logic
    console.log('Verifying OTP:', otp);
  };

  const handleResetPassword = () => {
    // Implement password reset logic
    console.log('Resetting password');
  };

  const handleResetVerifyOtp = () => {
    // Implement reset OTP verification
    console.log('Verifying reset OTP');
  };

  const handleConfrimPassword = (e) => {
    e.preventDefault();
    // Implement password confirmation logic
    console.log('Confirming new password');
  };

  const handlePasswordLogin = (e) => {
    e.preventDefault();
    // Implement password login logic
    console.log('Logging in with password');
  };

  const renderLoginForm = () => {
    // Multi-role selection

    // Initial email input
    if (!userRole) {
      return (
        <Grid container spacing={3}>
          <Box component="form" onSubmit={handleEmailSubmit} sx={{ width: '100%', gap: 2 }}>
            <TextField
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              error={!!error}
              helperText={error}
              disabled={loading}
            />
            <button
              disabled={loading}
              type="submit"
              className="bg-[#299aa1] px-6 text-lg hover:bg-[#23436d] transition-colors duration-200 ease-in text-white w-full my-4 py-3 rounded-full flex justify-center items-center"
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Continue'}
            </button>
            <div className="flex justify-end">
              <Typography variant="body2" onClick={handleResetPassword} sx={{ cursor: 'pointer', color: '#23436d', mt: 1 }}>
                Reset Your Password
              </Typography>
            </div>
          </Box>
        </Grid>
      );
    }

    // Passwordless OTP flow
    if (signinType === 'pwd_less') {
      return (
        <Box sx={{ width: '100%', gap: 2 }}>
          {!isOtpSent ? (
            <Typography>Sending OTP to {email}...</Typography>
          ) : (
            <>
              <TextField
                required
                fullWidth
                id="otp"
                label="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                margin="normal"
              />
              <button
                disabled={loading}
                onClick={handleVerifyOtp}
                className="bg-[#299aa1] px-6 text-lg hover:bg-[#23436d] transition-colors duration-200 ease-in text-white w-full my-4 py-3 rounded-full flex justify-center items-center"
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Verify OTP'}
              </button>
            </>
          )}
          {message && (
            <Typography color={message.includes('successfully') ? 'success' : 'error'} sx={{ mt: 2 }}>
              {message}
            </Typography>
          )}
        </Box>
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
              <TextField
                required
                fullWidth
                id="otp"
                label="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                margin="normal"
              />
              <button
                className="bg-[#299aa1] px-6 text-lg hover:bg-[#23436d] transition-colors duration-200 ease-in text-white w-full my-4 py-3 rounded-full flex justify-center items-center"
                onClick={handleResetVerifyOtp}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Verify OTP'}
              </button>
            </>
          )}
          {message && (
            <Typography color={message.includes('successfully') ? 'success' : 'error'} sx={{ mt: 2 }}>
              {message}
            </Typography>
          )}
          {resend && (
            <button
              disabled={loading}
              onClick={handleResetPassword}
              className="bg-[#23436d] px-6 text-lg text-white my-4 py-3 rounded-full w-full"
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Send OTP again'}
            </button>
          )}
        </Box>
      );
    }

    // New password setup
    if (showResetPassword) {
      return (
        <Box component="form" onSubmit={handleConfrimPassword} sx={{ width: '100%', gap: 2 }}>
          <TextField
            required
            fullWidth
            id="newPassword"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={!!error}
            margin="normal"
          />
          <TextField
            required
            fullWidth
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!error}
            helperText={error}
            margin="normal"
          />
          <button
            disabled={loading}
            type="submit"
            className="bg-[#299aa1] px-6 text-lg hover:bg-[#23436d] transition-colors duration-200 ease-in text-white w-full my-4 py-3 rounded-full flex justify-center items-center"
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Reset Password'}
          </button>
          {message && (
            <Typography color="success" sx={{ mt: 2 }}>
              {message}
            </Typography>
          )}
        </Box>
      );
    }

    return (
      <Box component="form" onSubmit={handlePasswordLogin} sx={{ width: '100%', gap: 2 }}>
        <TextField required fullWidth id="email" label="Email Address" value={email} disabled margin="normal" />
        <TextField
          required
          fullWidth
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!error}
          helperText={error}
          margin="normal"
        />
        <button
          disabled={loading}
          type="submit"
          className="bg-[#299aa1] px-6 text-lg text-white my-4 py-3 w-full flex justify-center items-center rounded-full"
        >
          {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign In'}
        </button>
      </Box>
    );
  };

  return (
    <AuthWrapper3>
      <Grid container spacing={3} sx={{ minHeight: '100%', alignContent: 'space-between' }}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Logo />
          </Stack>
        </Grid>
        <Grid item xs={12} sx={{ '& > div': { margin: '24px auto' } }}>
          <AuthCard border={false}>{renderLoginForm()}</AuthCard>
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
