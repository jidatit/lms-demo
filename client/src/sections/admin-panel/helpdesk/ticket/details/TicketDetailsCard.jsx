import React, { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import MainCard from 'components/MainCard';
import { messageData } from 'data/helpdesk';
import TicketDetailsCommonCard from './TicketDetailsCommonCard';

// assets
import { Edit, Lock1, Message, ProfileTick, Star1 } from 'iconsax-react';
import { useAddReply } from 'api/queries/helpDesk';
import ReplyModal from 'pages/helpdesk/ReplyModal';

// ==============================|| HELPDESK  - TICKET DETAILS CARD ||============================== //

export default function TicketDetailsCard({ ticket }) {
  const [reply, setReply] = useState('');
  const [files, setFiles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const addReply = useAddReply(ticket.id);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  return (
    <MainCard
      title={
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', color: 'primary.main' }}>
          <Lock1 size={20} />
          <Typography variant="h5" sx={{ color: 'text.primary' }}>
            Ticket {ticket.ticketNumber}      </Typography>
        </Stack>
      }
      content={false}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, px: 3, py: 1 }}
      >
        <Typography variant="h4">{ticket?.subject}</Typography>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
        </Stack>
      </Stack>
      <Divider />

      {ticket?.status === 'open' && (
        <Stack
          direction="row"
          sx={{ gap: 1, px: 3, py: 2, flexWrap: 'wrap' }}
        >
          <Button
            onClick={handleOpenModal}
            color="success"
            startIcon={<Message />}
            sx={{ border: 'none' }}
            variant="dashed"
          >
            Post a Reply
          </Button>
        </Stack>
      )}

      <Divider />
      {/* Replies */}
      {ticket.replies.length === 0 ? (
        <Box p={3}>
          <Typography color="text.secondary" textAlign="center">
            No replies yet.
          </Typography>
        </Box>
      ) : (
        ticket.replies.map((r, i) => (
          <React.Fragment key={r.id}>
            <TicketDetailsCommonCard
              ticketId={ticket?.id}
              replyId={r?.id}
              avatar={r.author.avatar}
              customerName={r.author.name}
              supportAgentName={r.author.name}
              chipLabel={ticket?.replyStatus}
              message={r.message}
              timeAgo={r.timeAgo}
              images={r?.attachments?.map(a => a?.fileUrl)}
            />
            {i < ticket.replies.length - 1 && <Divider />}
          </React.Fragment>
        ))
      )}

      <ReplyModal
        open={modalOpen}
        onClose={handleCloseModal}
        ticketId={ticket.id}
        addReplyMutation={addReply}
      />
      {/* {messageData.map((data, index) => (
        <React.Fragment key={index}>
          <TicketDetailsCommonCard
            avatar={data.avatar}
            chipLabel={data.chipLabel}
            images={data.images}
            message={data.message}
            supportAgentName={data.supportAgentName}
            customerName={data.customerName}
            timeAgo={data.timeAgo}
            codeString={data.codeString}
            likes={data.likes}
            ticketNumber={data.ticketNumber}
          />
          <Divider />
        </React.Fragment>
      ))} */}


    </MainCard>
  );
}
