import React, { useMemo, useEffect, useState, lazy } from 'react';
import {
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  CircularProgress,
  FormControl
} from '@mui/material';

import axios from 'axios';
import axiosInstance from 'utils/axiosConfig';
import { GoPhishAccountAPIKey, GoPhishPublicURL } from 'utils/constants';
import Loadable from 'components/Loadable';
import { toast } from 'utils/toast';
import { useAuth } from 'contexts/AuthContext';
import { useCourses } from 'api/queries/courses';
import { useScheduleAttackSimulations } from 'api/queries/scheduleAttackSimulations';
import { ConfirmDeleteDialog } from 'pages/dashboard/components/ConfirmDeleteDialog';
import CampaignDetailsModal from 'pages/dashboard/components/CampaignDetailsModel';
import CampaignStepperForm from 'components/CampaignStepperForm';

const MuiTableEnhanced = Loadable(lazy(() => import('components/tables/mui-tables/enhanced')));

const Campaigns = () => {
  const [openCampaginModal, setOpenCampaginModal] = useState(false);
  const { currentUser } = useAuth();

  // Fetch scheduled campaigns filtered by the current user's ID as createdBy
  const {
    data: allCampaignsLaunch,
    isLoading: dataLoading,
    refetch: scheduleRefresh
  } = useScheduleAttackSimulations({ createdBy: currentUser?.id });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isScheduleCampaign, setIsScheduleCampaign] = useState(true); // Always true now

  // For campaign details preview modal
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const handleCampaignOpen = () => {
    setOpenCampaginModal(true);
  };

  const handleCampaignClose = () => {
    setOpenCampaginModal(false);
  };

  const handleDeleteSchedule = (campaign) => {
    setIsScheduleCampaign(true);
    setSelectedCampaign(campaign);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = async () => {
    scheduleRefresh(); // Refresh scheduled campaigns
  };

  const handleLaunchCampaignDetails = (campaignId) => {
    setSelectedCampaignId(campaignId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCampaignId('');
  };

  const headCellsLaunch = [
    {
      id: 'id',
      numeric: false,
      disablePadding: true,
      label: 'Id'
    },
    {
      id: 'name',
      numeric: false,
      disablePadding: true,
      label: 'Name'
    },
    {
      id: 'campaignType',
      numeric: false,
      disablePadding: true,
      label: 'Campaign Type'
    },
    {
      id: 'status',
      numeric: false,
      disablePadding: true,
      label: 'Status'
    },
    {
      id: 'launchDate',
      numeric: false,
      disablePadding: true,
      label: 'Launch Date'
    },
    {
      id: 'launchTime',
      numeric: false,
      disablePadding: true,
      label: 'Launch Time'
    },
    {
      id: 'actions',
      numeric: false,
      disablePadding: false,
      label: 'Actions'
    }
  ];

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <MuiTableEnhanced
          action={handleCampaignOpen}
          data={allCampaignsLaunch?.data || []}
          headCells={headCellsLaunch}
          LaunchCampagin={true}
          loading={dataLoading}
          handleDelete={handleDeleteSchedule}
          onRowClick={handleLaunchCampaignDetails}
        />
      </Box>

      <CampaignStepperForm open={openCampaginModal} onClose={handleCampaignClose} />

      <ConfirmDeleteDialog
        campaign={selectedCampaign}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onSuccess={handleDeleteSuccess}
        isScheduleCampaign={isScheduleCampaign}
      />

      <CampaignDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        campaignId={selectedCampaignId}
      />
    </>
  );
};

export default Campaigns;

