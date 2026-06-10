import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from '@mui/material';
import { Box } from '@mui/system';
import { useDeleteAttackSimulation } from 'api/queries/attackSimulation';
import { useDeleteScheduleAttackSimulation } from 'api/queries/scheduleAttackSimulations';

export const ConfirmDeleteDialog = ({ campaign, open, onClose, onSuccess, isScheduleCampaign }) => {
  const [error, setError] = useState(null);
  const deleteAttackSimulationMutation = useDeleteAttackSimulation();
  const deleteScheduleMutation = useDeleteScheduleAttackSimulation();
  const handleDelete = async () => {
    setError(null);
    try {
      if (isScheduleCampaign) {
        await deleteScheduleMutation.mutateAsync(campaign.id);
      } else {
        await deleteAttackSimulationMutation.mutateAsync(campaign.id);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete campaign');
    }
  };

  const isLoading = deleteAttackSimulationMutation.isPending || deleteScheduleMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm Campaign Deletion</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          You are about to permanently delete the campaign:
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'error.main' }}>
          "{campaign?.name}"
        </Typography>

        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            mb: 2
          }}
        >
          <Typography sx={{ color: 'primary' }}>
            <strong>Important:</strong> This action will:
          </Typography>
          <ul style={{ marginTop: 4, marginBottom: 4, paddingLeft: 20 }}>
            <li>Permanently remove this campaign</li>
            <li>The courses linked to this campaign will be detached from groups</li>
          </ul>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
          sx={{ minWidth: 160 }}
        >
          {isLoading ? 'Processing...' : 'Delete Permanently'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
