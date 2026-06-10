import React, { forwardRef } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { Box } from '@mui/system';
import { CircularProgress, Typography } from '@mui/material';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CampaignAnalyticsDialog = ({ open, handleClose, stats }) => {
  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Statistical Analysis</DialogTitle>
        {stats && (
          <DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 3 }}>
              {/* Email Sent */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Email Sent
                </Typography>
                <CircularProgress
                  variant="determinate"
                  value={(stats.sent / stats.total) * 100}
                  size={80}
                  sx={{ color: 'teal' }} // Use sx for custom colors
                  thickness={5}
                />
                <Typography variant="h6" color="teal">
                  {stats.sent}
                </Typography>
              </Box>

              {/* Email Opened */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Email Opened
                </Typography>
                <CircularProgress
                  variant="determinate"
                  value={(stats.opened / stats.total) * 100}
                  size={80}
                  sx={{ color: 'warning.main' }} // MUI default color
                  thickness={5}
                />
                <Typography variant="h6" color="warning.main">
                  {stats.opened}
                </Typography>
              </Box>

              {/* Clicked Link */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Clicked Link
                </Typography>
                <CircularProgress
                  variant="determinate"
                  value={(stats.clicked / stats.total) * 100}
                  size={80}
                  sx={{ color: 'orange' }} // Custom color using sx
                  thickness={5}
                />
                <Typography variant="h6" color="orange">
                  {stats.clicked}
                </Typography>
              </Box>

              {/* Submitted Data */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Submitted Data
                </Typography>
                <CircularProgress
                  variant="determinate"
                  value={(stats.submitted_data / stats.total) * 100}
                  size={80}
                  sx={{ color: 'error.main' }} // MUI default color
                  thickness={5}
                />
                <Typography variant="h6" color="error.main">
                  {stats.submitted_data}
                </Typography>
              </Box>

              {/* Email Reported */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Email Reported
                </Typography>
                <CircularProgress
                  variant="determinate"
                  value={(stats.email_reported / stats.total) * 100}
                  size={80}
                  sx={{ color: 'primary.main' }} // MUI default color
                  thickness={5}
                />
                <Typography variant="h6" color="primary.main">
                  {stats.email_reported}
                </Typography>
              </Box>

              {/* Errors */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Error
                </Typography>
                <CircularProgress
                  variant="determinate"
                  value={(stats.error / stats.total) * 100}
                  size={80}
                  sx={{ color: 'secondary.main' }} // MUI default color
                  thickness={5}
                />
                <Typography variant="h6" color="secondary.main">
                  {stats.error ? stats.error : 0}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CampaignAnalyticsDialog;
