import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, CircularProgress, Divider, Grid, Stack, Typography } from '@mui/material';
import { useAuth } from 'contexts/AuthContext';
import { getDemoAuthTokens, getDemoUserByRole } from './handlers/auth';
import { DASHBOARD_PATHS } from './utils';

const ROLES = [
  { key: 'admin', label: 'Admin' },
  { key: 'contributor', label: 'Contributor' },
  { key: 'groupLeader', label: 'Group Leader' },
  { key: 'subscriber', label: 'Subscriber' },
  { key: 'supportAgent', label: 'Support Agent' }
];

export default function DemoRoleButtons() {
  const navigate = useNavigate();
  const { passwordlessLogin } = useAuth();
  const [loadingRole, setLoadingRole] = useState(null);
  const [error, setError] = useState('');

  const handleSignInAs = async (roleKey) => {
    setLoadingRole(roleKey);
    setError('');
    try {
      const user = getDemoUserByRole(roleKey);
      if (!user) throw new Error('Unknown role');
      await passwordlessLogin(getDemoAuthTokens(user));
      navigate(DASHBOARD_PATHS[roleKey] || '/login');
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <Stack spacing={2} sx={{ mt: 3, width: '100%' }}>
      <Divider>
        <Typography variant="caption" color="text.secondary">
          Or explore the demo
        </Typography>
      </Divider>
      {error && (
        <Typography color="error" variant="body2" textAlign="center">
          {error}
        </Typography>
      )}
      <Grid container spacing={1.5}>
        {ROLES.map(({ key, label }) => (
          <Grid item xs={12} sm={6} key={key}>
            <Button
              fullWidth
              variant="outlined"
              size="medium"
              disabled={!!loadingRole}
              onClick={() => handleSignInAs(key)}
            >
              {loadingRole === key ? <CircularProgress size={20} /> : `Sign in as ${label}`}
            </Button>
          </Grid>
        ))}
      </Grid>
      <Typography variant="caption" color="text.secondary" textAlign="center">
        Demo mode — Ctrl + Shift + R to reset
      </Typography>
    </Stack>
  );
}
