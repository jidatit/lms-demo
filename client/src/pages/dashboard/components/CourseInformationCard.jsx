import React from 'react';
import { Edit, Book, Description, CurrencyDollar } from 'lucide-react';
import { Box, Stack, Typography, IconButton, Paper, Tooltip, Divider } from '@mui/material';

const DetailsCard = ({ courseDetails, handleEditClick }) => {
  const detailRows = [
    {
      label: 'Title',
      value: courseDetails.title,
      icon: <Book color="primary" size={20} />,
      tooltipText: 'Edit Title'
    },
    {
      label: 'Description',
      value: courseDetails.description,
      icon: <Description color="success" size={20} />,
      tooltipText: 'Edit Description'
    }
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        maxWidth: 'lg',
        width: '100%',
        borderRadius: 2,
        bgcolor: 'background.paper'
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Typography variant="h5" fontWeight="600" color="text.primary">
          Course Details
        </Typography>
        <Tooltip title="Edit All">
          <IconButton
            color="error"
            size="small"
            onClick={handleEditClick}
            sx={{
              '&:hover': {
                bgcolor: 'error.lighter'
              }
            }}
          >
            <Edit size={20} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Details Content */}
      <Stack spacing={3}>
        {detailRows.map((row, index) => (
          <Box
            key={row.label}
            sx={{
              p: 2,
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'action.hover'
              },
              transition: 'background-color 0.2s'
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'flex-start' }}>
              {/* Label Section */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 140 }}>
                {row.icon}
                <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                  {row.label}:
                </Typography>
              </Stack>

              {/* Content Section */}
              <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flex: 1 }}>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    flex: 1,
                    wordBreak: 'break-word'
                  }}
                >
                  {row.value}
                </Typography>
                <Tooltip title={row.tooltipText}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={handleEditClick}
                    sx={{
                      opacity: 0,
                      '&:hover': {
                        bgcolor: 'primary.lighter',
                        opacity: 1
                      },
                      '.MuiBox-root:hover &': {
                        opacity: 1
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    <Edit size={16} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default DetailsCard;
