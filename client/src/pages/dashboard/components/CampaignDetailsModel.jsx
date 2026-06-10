import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Grid,
  Divider,
  Chip,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import { useScheduleAttackSimulationById } from 'api/queries/scheduleAttackSimulations';

const CampaignDetailsModal = ({ open, onClose, campaignId }) => {
  const { data, isLoading: loading, isError, error, refetch } = useScheduleAttackSimulationById(campaignId);
  const campaignData = data?.data;

  const getLaunchStatusLabel = (status) => {
    switch (status) {
      case 'Deliver Immediately':
        return 'Scheduled for Immediate Delivery';
      case 'scheduled':
        return 'Scheduled';
      default:
        return status || 'Unknown';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Campaign Details</DialogTitle>
      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        )}
        {isError && (
          <Typography color="error" align="center" p={2}>
            {error?.message || 'An error occurred while fetching campaign details'}
          </Typography>
        )}
        {campaignData && !loading && !isError && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6">{campaignData?.name ?? 'Unnamed Campaign'}</Typography>
              <Typography color="textSecondary">ID: {campaignData?.id ?? 'N/A'}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Type</Typography>
              <Typography>{campaignData?.campaignType ?? 'N/A'}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Status</Typography>
              <Chip
                label={getLaunchStatusLabel(campaignData?.launchStatus)}
                color={campaignData?.launchStatus === 'Deliver Immediately' ? 'success' : 'default'}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Launch Date & Time</Typography>
              <Typography>
                {campaignData?.launchDate ? new Date(campaignData.launchDate).toLocaleDateString() : 'N/A'}{' '}
                {campaignData?.launchTime ?? 'N/A'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Time Zone</Typography>
              <Typography>{campaignData?.timezone ?? 'N/A'}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Bundle</Typography>
              <Typography>{campaignData?.bundle?.title ?? 'N/A'}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Created By</Typography>
              <Typography>
                {campaignData?.createdByUser?.firstName ?? 'N/A'} {campaignData?.createdByUser?.lastName ?? ''} (
                {campaignData?.createdByUser?.email ?? 'N/A'})
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1">Groups</Typography>
              {Array.isArray(campaignData?.groups) && campaignData.groups.length > 0 ? (
                campaignData.groups.map((group) => (
                  <Chip key={group?.id} label={group?.name ?? 'Unnamed Group'} style={{ margin: '4px' }} />
                ))
              ) : (
                <Typography color="textSecondary">No groups assigned</Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1">User Courses</Typography>
              {Array.isArray(campaignData?.userCourses) && campaignData.userCourses.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>User ID</TableCell>
                      <TableCell>Course ID</TableCell>
                      <TableCell>Launch Date</TableCell>
                      <TableCell>Expiry Date</TableCell>
                      <TableCell>Visibility</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {campaignData.userCourses.map((course) => (
                      <TableRow key={course?.id}>
                        <TableCell>{course?.userId ?? 'N/A'}</TableCell>
                        <TableCell>{course?.courseId ?? 'N/A'}</TableCell>
                        <TableCell>{course?.launchDate ? new Date(course.launchDate).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>{course?.expiryDate ? new Date(course.expiryDate).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                          <Chip label={course?.visibility ? 'Visible' : 'Hidden'} color={course?.visibility ? 'success' : 'default'} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography color="textSecondary">No user courses assigned</Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1">Created</Typography>
              <Typography>{campaignData?.createdAt ? new Date(campaignData.createdAt).toLocaleString() : 'N/A'}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1">Last Updated</Typography>
              <Typography>{campaignData?.updatedAt ? new Date(campaignData.updatedAt).toLocaleString() : 'N/A'}</Typography>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CampaignDetailsModal;
