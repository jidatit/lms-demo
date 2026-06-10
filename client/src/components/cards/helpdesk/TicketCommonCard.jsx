import PropTypes from 'prop-types';
import { useNavigate } from 'react-router';

// material-ui
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import Avatar, { CustomAvatar } from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// assets
import { Calendar, Eye, Heart, Lock1, MessageText, Trash } from 'iconsax-react';
import { useAuth } from 'contexts/AuthContext';
import { useDeleteTicket } from 'api/queries/helpDesk';
import ConfirmDialog from 'pages/dashboard/components/ConfirmDialog';
import { useState } from 'react';
import { getBasePath } from 'utils/getBasePath';

// ==============================|| TICKET COMMON CARD ||============================== //

export default function TicketCommonCard({
  borderLeft = false,
  borderColor,
  showAvatarStack = true,
  showBox = true,
  customerAvatar,
  customerName,
  chipLabel,
  supporterAvatar,
  supporterName,
  updateTime,
  messageCount,
  issueTitle,
  lastCommentPreview,
  drawerOpen,
  id
}) {
  const { currentUser } = useAuth()
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteMutation = useDeleteTicket();

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        message: 'Ticket deleted successfully!',
        type: 'success',
      });
      setConfirmOpen(false);
    } catch (err) {
      toast({
        message: err.message || 'Failed to delete ticket!',
        type: 'error',
      });
    }
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
  };

  const avatarStyle = {
    height: 20,
    width: 20
  };


  return (
    <MainCard sx={{ border: 'none' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: { xs: 2, sm: 3 } }}>
        <Stack direction={{ xs: 'row', sm: 'column' }} sx={{ gap: 1, alignItems: { xs: 'center', sm: 'flex-start' } }}>
          {/* <Avatar sx={{ height: 60, width: 60 }} src={customerAvatar} /> */}
          <CustomAvatar sx={{ height: 60, width: 60 }} name={customerName} size="lg" />

          <Stack sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}>
            {/* <Typography sx={{ color: 'text.secondary' }}>{ticketCount} Ticket</Typography> */}
            {/* <Typography sx={{ color: 'error.main', display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <Heart size={16} variant="Bold" /> {likes}
            </Typography> */}
          </Stack>
        </Stack>
        <Stack sx={{ gap: 1, width: 1 }}>
          <Stack direction="row" onClick={drawerOpen} sx={{ gap: 1, alignItems: 'flex-start', cursor: 'pointer' }}>
            <Typography variant="h5">{customerName}</Typography>
            <Chip size="small" label={chipLabel} sx={{ backgroundColor: borderColor, color: "white" }} />
          </Stack>

          {showAvatarStack && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              onClick={drawerOpen}
              sx={{ gap: 1, alignItems: { xs: 'flex-start', sm: 'center', cursor: 'pointer' } }}
            >
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <Calendar size={14} />
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Updated {updateTime}
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <MessageText size={14} />
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {messageCount}
                </Typography>
              </Stack>
            </Stack>
          )}

          <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
            <Lock1 size={16} />
            <Typography variant="h5">{issueTitle}</Typography>
          </Stack>

          {showBox && (
            <Box onClick={drawerOpen} sx={{ p: 2, bgcolor: 'secondary.lighter', borderRadius: 1, mb: 1, cursor: 'pointer' }}>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mb: 1 }}>
                {/* <Avatar variant="rounded" src={supporterAvatar} alt={supporterName} color="success" sx={avatarStyle} /> */}
                {/* <CustomAvatar sx={{ height: 28, width: 28 }} name={supporterName} size="lg" /> */}

                <Typography component="div" variant="body1" sx={{ fontWeight: 600, display: 'flex', gap: 0.5 }}>
                  Last comment from
                  <Typography sx={{ color: 'text.secondary' }}>{supporterName}:</Typography>
                </Typography>
              </Stack>
              <Stack>
                <Typography
                  variant="body2"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    whiteSpace: 'normal',
                  }}
                  dangerouslySetInnerHTML={{ __html: lastCommentPreview || '<em>No message yet</em>' }}
                />
              </Stack>
            </Box>
          )}

          <Stack direction="row" sx={{ gap: 1.5 }}>
            <Button
              startIcon={<Eye />}
              variant="dashed"
              sx={{ border: 'none' }}
              color="primary"

              onClick={() => {
                const basePath = getBasePath(currentUser?.role);

                navigate(`${basePath}/helpdesk/ticket-details/${id}`);
              }}
            >
              View Ticket
            </Button>
            {currentUser?.role === "admin" &&
              <Button onClick={handleDeleteClick} startIcon={<Trash />} variant="dashed" sx={{ border: 'none' }} color="error">
                Delete
              </Button>
            }
          </Stack>

          <ConfirmDialog
            open={confirmOpen}
            title="Delete Ticket"
            description={`Are you sure you want to delete ticket ? This action cannot be undone.`}
            loading={deleteMutation.isPending}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            confirmText="Delete"
            cancelText="Cancel"
          />
        </Stack>
      </Stack>
    </MainCard>
  );
}

TicketCommonCard.propTypes = {
  borderLeft: PropTypes.bool,
  borderColor: PropTypes.any,
  showAvatarStack: PropTypes.bool,
  showBox: PropTypes.bool,
  customerAvatar: PropTypes.any,
  ticketCount: PropTypes.any,
  likes: PropTypes.any,
  customerName: PropTypes.any,
  chipLabel: PropTypes.any,
  productAvatar: PropTypes.any,
  productName: PropTypes.any,
  supporterAvatar: PropTypes.any,
  supporterName: PropTypes.any,
  updateTime: PropTypes.any,
  messageCount: PropTypes.any,
  issueTitle: PropTypes.any,
  addCode: PropTypes.any,
  removeCode: PropTypes.any,
  drawerOpen: PropTypes.any
};
