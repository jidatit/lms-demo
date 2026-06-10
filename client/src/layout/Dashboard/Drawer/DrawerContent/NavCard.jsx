// material-ui
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import AnimateButton from 'components/@extended/AnimateButton';
import MainCard from 'components/MainCard';

// assets
import avatar from 'assets/images/users/customer-support-1.png';
import { useAuth } from 'contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// ==============================|| DRAWER CONTENT - NAV CARD ||============================== //


export default function NavCard() {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  let helpdeskRoute = null;

  if (userRole === "contributor") {
    helpdeskRoute = "/contrib_dashboard/helpdesk/ticket-list";
  }
  if (userRole === "supportAgent") {
    helpdeskRoute = "/agent_dashboard/helpdesk/ticket-list";
  }

  if (userRole === "groupLeader") {
    helpdeskRoute = "/groupleader_dashboard/helpdesk/ticket-list";
  }

  const handleNavigate = () => {
    if (helpdeskRoute) navigate(helpdeskRoute);
  };

  return (
    <MainCard sx={{ bgcolor: 'secondary.lighter', m: 3 }}>
      <Stack sx={{ gap: 2.5, alignItems: 'center' }}>
        <CardMedia component="img" image={avatar} />
        <Stack sx={{ alignItems: 'center' }}>
          <Typography variant="h5">Need Support?</Typography>
          <Typography variant="h6" color="secondary">
            1 Day Response Time
          </Typography>
        </Stack>

        <AnimateButton>
          <Button
            variant="shadow"
            size="small"
            onClick={handleNavigate}
            disabled={!helpdeskRoute} // optional
          >
            Helpdesk
          </Button>
        </AnimateButton>
      </Stack>
    </MainCard>
  );
}
