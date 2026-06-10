import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import Avatar, { CustomAvatar } from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import SyntaxHighlight from 'utils/SyntaxHighlight';

import { useAuth } from 'contexts/AuthContext';

// assets
import { Trash } from 'iconsax-react';
import { useDeleteReply } from 'api/queries/helpDesk';
import ConfirmDialog from 'pages/dashboard/components/ConfirmDialog';

// ==============================|| TICKET DETAILS - COMMON CARD ||============================== //

export default function TicketDetailsCommonCard({
  ticketId,
  replyId,
  avatar,
  supportAgentName,
  chipLabel,
  timeAgo,
  message,
  images = [],
  codeString,
  customerName,
}) {
  const { currentUser } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteMutation = useDeleteReply();

  const handleOpenDelete = () => {
    setConfirmOpen(true);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(
      { ticketId, replyId },
      {
        onSuccess: () => {
          setConfirmOpen(false);
        },
        onError: () => {
          setConfirmOpen(false);
        },
      }
    );
  };

  return (
    <>
      <Stack sx={{ p: 3, gap: 2 }}>
        <Stack sx={{ gap: 3 }} direction={{ xs: 'column', sm: 'row' }}>
          <Stack direction={{ xs: 'row', sm: 'column' }} sx={{ gap: 1, alignItems: 'center' }}>
            {/* <Avatar sx={{ height: 60, width: 60 }} src={avatar} /> */}
            <CustomAvatar sx={{ height: 40, width: 40 }} name={customerName} size="lg" />

          </Stack>

          <Stack sx={{ gap: 2, flex: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack>
                <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                  <Typography variant="h4">{supportAgentName}</Typography>
                  <Chip size="small" label={chipLabel} sx={{ color: 'text.secondary' }} />
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {timeAgo}
                </Typography>
              </Stack>

              {/* Delete Button - Admin Only */}
              {currentUser?.role === 'admin' && (
                <Tooltip title="Delete Reply" arrow placement="top">
                  <IconButton
                    color="error"
                    onClick={handleOpenDelete}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

            {/* Message */}
            <Box
              dangerouslySetInnerHTML={{ __html: message }}
              sx={{
                '& p': { m: 0, fontSize: '0.875rem', lineHeight: 1.5 },
                '& img': { maxWidth: '100%', height: 'auto' },
              }}
            />

            {/* Images */}
            {images.length > 0 && (
              <Stack sx={{ gap: 2, alignItems: 'flex-start' }}>
                <Stack direction="row" sx={{ gap: 2.5, flexWrap: 'wrap' }}>
                  {images.map((image, index) => (
                    <CardMedia
                      key={index}
                      component="img"
                      image={image}
                      alt={`attachment-${index}`}
                      sx={{
                        height: 80,
                        width: 120,
                        borderRadius: 1,
                        objectFit: 'cover',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 },
                      }}
                      onClick={() => window.open(image, '_blank')}
                    />
                  ))}
                </Stack>
              </Stack>
            )}

            {/* Code Block */}
            {codeString && (
              <SyntaxHighlight customStyle={{ margin: 0, fontSize: '0.8rem' }}>
                {codeString}
              </SyntaxHighlight>
            )}
          </Stack>
        </Stack>
      </Stack>

      {/* Confirm Delete Dialog - Using Your Component */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Reply"
        description="Are you sure you want to delete this reply? This action cannot be undone."
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}

// PropTypes
TicketDetailsCommonCard.propTypes = {
  ticketId: PropTypes.string.isRequired,
  replyId: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  supportAgentName: PropTypes.string.isRequired,
  chipLabel: PropTypes.string,
  timeAgo: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(PropTypes.string),
  codeString: PropTypes.string,
};

TicketDetailsCommonCard.defaultProps = {
  avatar: '',
  chipLabel: '',
  images: [],
  codeString: '',
};