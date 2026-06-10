import React, { useRef } from 'react';
import { Modal, Box, Typography, IconButton } from '@mui/material';
import DashboardPage from '../../contrib_dashboard/pages/DashboardPage';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { CloseSquare } from 'iconsax-react';

const ViewDashboardModal = ({ isOpen, onClose, email }) => {
  const modalRef = useRef(null);

  return (
    <Modal open={isOpen} onClose={onClose} aria-labelledby="dashboard-modal-title">
      <Box
        ref={modalRef}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',

          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Close Button */}
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 10, right: 10 }} aria-label="Close modal">
          <CloseSquare size="52" />
        </IconButton>

        {/* Title */}
        <Typography id="dashboard-modal-title" variant="h6" sx={{ mb: 2 }}>
          <span style={{ color: '#23436d' }}>{email}</span> - Dashboard
        </Typography>

        {/* Scrollable Content */}
        <Box sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <DashboardPage viewemail={email} />
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewDashboardModal;
