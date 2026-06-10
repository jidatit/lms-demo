import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import OtpInput from 'react18-input-otp';

// project-imports
import AnimateButton from 'components/@extended/AnimateButton';
import { ThemeMode } from 'config';
import { CircularProgress } from '@mui/material';

// ============================|| STATIC - CODE VERIFICATION ||============================ //

export default function AuthCodeVerification({ handleBack, onOtpSubmit, resendOtp, loading }) {
  const theme = useTheme();
  const [otp, setOtp] = useState('');
  const [resendLoading, setResendLoading] = useState(false); // Separate loading state for resend button

  const borderColor = theme.palette.mode === ThemeMode.DARK ? theme.palette.secondary[200] : theme.palette.secondary.light;

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await resendOtp();
    } catch (error) {
      console.error('Error resending OTP:', error);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <OtpInput
          value={otp}
          onChange={(otp) => setOtp(otp)}
          numInputs={6}
          containerStyle={{ justifyContent: 'space-between' }}
          inputStyle={{
            width: '100%',
            margin: '8px',
            padding: '10px',
            border: '1px solid',
            borderColor: borderColor,
            borderRadius: 4
          }}
          focusStyle={{
            outline: 'none',
            boxShadow: theme.customShadows.primary,
            border: '1px solid',
            borderColor: theme.palette.primary.main
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <AnimateButton>
          <Button
            disableElevation
            fullWidth
            disabled={loading}
            size="large"
            type="submit"
            variant="contained"
            onClick={() => {
              if (onOtpSubmit) {
                onOtpSubmit(otp);
              }
            }}
            style={{
              position: 'relative' // Ensures proper alignment of CircularProgress
            }}
          >
            {loading ? (
              <CircularProgress
                size={24} // Adjust size as needed
                style={{
                  color: 'white' // Match your button text color for better UI
                }}
              />
            ) : (
              'Continue'
            )}
          </Button>
        </AnimateButton>
        <Button
          disableElevation
          fullWidth
          disabled={loading}
          size="large"
          type="submit"
          onClick={() => handleBack()}
          style={{
            position: 'relative', // Ensures proper alignment of CircularProgress
            marginTop: '10px'
          }}
        >
          {loading ? (
            <CircularProgress
              size={24} // Adjust size as needed
              style={{
                color: 'white' // Match your button text color for better UI
              }}
            />
          ) : (
            'Go Back'
          )}
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          <Typography>Not received Code?</Typography>
          <Button
            onClick={handleResendOtp}
            variant="body1"
            sx={{ minWidth: 85, ml: 2, textDecoration: 'none', cursor: 'pointer', position: 'relative' }}
            color="primary"
            disabled={resendLoading}
          >
            {resendLoading ? (
              <CircularProgress
                size={16}
                style={{
                  color: theme.palette.primary.main
                }}
              />
            ) : (
              'Resend code'
            )}
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
