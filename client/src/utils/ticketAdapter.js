// utils/ticketAdapter.js

import { formatDistanceToNow } from 'date-fns';

// Helper: Get initials from name
const getInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

// Map replyStatus → chipLabel
const mapReplyStatus = (status) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'replied':
      return 'Replied';
    default:
      return 'Open';
  }
};
const getDisplayStatus = (ticket) => {
  // Closed tickets
  if (ticket?.status === 'closed') {
    return 'Resolved';
  }

  // New ticket: only one reply (user) and pending
  if (ticket?.replyCount === 1 && ticket?.replyStatus === 'pending') {
    return 'Open';
  }

  // If more replies are added, mark as pending
  if (ticket?.replyCount > 1) {
    return 'Pending';
  }

  // Default fallback (optional)
  return 'Open';
};
// Map status → border color

const getBorderColor = (ticket) => {
  if (ticket?.status === 'closed') return 'success.main'; // Closed → Green
  if (ticket?.replyCount === 1 && ticket?.replyStatus === 'pending') return 'info.main'; // Newly opened → Blue
  if (ticket?.replyCount > 1) return 'warning.main'; // Active conversation → Yellow
  return 'grey.400'; // Default
};

export const adaptTickets = (apiResponse) => {
  const { data: tickets = [], pagination } = apiResponse;

  return {
    tickets: tickets.map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      // chipLabel: mapReplyStatus(t.status),
      chipLabel: getDisplayStatus(t),

      customerName: `${t.creator.firstName} ${t.creator.lastName}`,
      customerAvatar: t?.creator?.profile?.profilePictureUrl || null,
      customerInitials: getInitials(t?.creator?.firstName, t?.creator?.lastName),
      issueTitle: t.subject,
      categoryName: t.category.name,
      likes: 0, // not in API yet
      messageCount: t.replyCount,
      updateTime: t.lastReplyAt
        ? formatDistanceToNow(new Date(t.lastReplyAt), { addSuffix: true })
        : formatDistanceToNow(new Date(t.createdAt), { addSuffix: true }),
      lastCommentPreview: t.lastCommentPreview,
      lastReplierName: t.lastReplier ? `${t.lastReplier.firstName} ${t.lastReplier.lastName}` : null,
      lastReplierAvatar: t.lastReplier?.profile?.profilePictureUrl || null,
      borderLeft: t.replyStatus === 'replied' || t.status === 'closed',
      borderColor: getBorderColor(t),
      showBox: true,
      showAvatarStack: true
    })),
    pagination
  };
};

export const adaptTicketDetails = (apiTicket) => {
  const creator = apiTicket.creator;
  const replies = apiTicket.replies || [];

  return {
    id: apiTicket.id,
    ticketNumber: apiTicket.ticketNumber,
    subject: apiTicket.subject,
    categoryName: apiTicket.category.name,
    status: apiTicket.status,
    replyStatus: apiTicket.replyStatus,
    createdAt: apiTicket.createdAt,
    lastReplyAt: apiTicket.lastReplyAt,
    replyCount: apiTicket?.replyCount,
    creator: {
      name: `${creator.firstName} ${creator.lastName}`,
      avatar: creator.profile?.profilePictureUrl,
      role: creator.role,
      email: creator?.email
    },
    replies: replies.map((r) => ({
      id: r.id,
      author: {
        name: `${r.author.firstName} ${r.author.lastName}`,
        avatar: r.author.profile?.profilePictureUrl,
        role: r.author.role
      },
      message: r.message,
      timeAgo: formatDistanceToNow(new Date(r.createdAt), { addSuffix: true }),
      attachments: r.attachments || [],
      isCustomer: r.authorId === apiTicket.createdBy
    })),
    requestedBy: apiTicket.requestedBy
  };
};
