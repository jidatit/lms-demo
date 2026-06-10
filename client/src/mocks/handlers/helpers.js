import { getCurrentUser } from '../utils';

export function enrichUserRef(user) {
  if (!user) {
    return {
      id: 'unknown',
      firstName: 'Unknown',
      lastName: 'User',
      email: '',
      role: 'subscriber',
      profile: { profilePictureUrl: null }
    };
  }
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    profile: { profilePictureUrl: null }
  };
}

export function enrichTicket(ticket, store) {
  const creator = store.users.find((u) => u.id === ticket.createdBy);
  const category = store.helpdeskCategories.find((c) => c.id === ticket.categoryId);
  const replies = (ticket.replies || []).map((r) => {
    const author = store.users.find((u) => u.id === r.authorId) || {
      firstName: r.authorName?.split(' ')[0] || 'Support',
      lastName: r.authorName?.split(' ').slice(1).join(' ') || 'Agent',
      role: 'supportAgent'
    };
    return {
      ...r,
      authorId: r.authorId || author.id,
      author: enrichUserRef(author)
    };
  });

  const lastReply = replies[replies.length - 1];

  return {
    ...ticket,
    ticketNumber: ticket.ticketNumber || `TKT-${ticket.id.slice(-6).toUpperCase()}`,
    category: category ? { id: category.id, name: category.name } : { id: ticket.categoryId, name: ticket.categoryName || 'General' },
    creator: enrichUserRef(creator),
    replyCount: replies.length || 1,
    replyStatus: ticket.status === 'closed' ? 'replied' : replies.length > 1 ? 'replied' : 'pending',
    lastReplyAt: lastReply?.createdAt || ticket.createdAt,
    lastCommentPreview: lastReply?.message || ticket.description?.slice(0, 80) || '',
    lastReplier: lastReply ? enrichUserRef(lastReply.author) : null,
    replies,
    requestedBy: getCurrentUser() ? { id: getCurrentUser().id, role: getCurrentUser().role } : null
  };
}

export function enrichTickets(tickets, store) {
  return tickets.map((t) => enrichTicket(t, store));
}

export function buildHelpdeskStats(store) {
  const categories = store.helpdeskCategories.map((cat) => {
    const catTickets = store.helpdeskTickets.filter((t) => t.categoryId === cat.id);
    return {
      name: cat.name,
      open: catTickets.filter((t) => t.status === 'open').length,
      closed: catTickets.filter((t) => t.status === 'closed').length
    };
  });

  const agents = store.users.filter((u) => u.role === 'supportAgent');
  const supportAgents = agents.map((agent) => ({
    name: `${agent.firstName} ${agent.lastName}`,
    closed: store.helpdeskTickets.filter((t) => t.status === 'closed').length
  }));

  return {
    categories,
    supportAgents,
    open: store.helpdeskTickets.filter((t) => t.status === 'open').length,
    closed: store.helpdeskTickets.filter((t) => t.status === 'closed').length,
    total: store.helpdeskTickets.length
  };
}

export function buildHelpdeskDashboardCards(store) {
  const open = store.helpdeskTickets.filter((t) => t.status === 'open').length;
  const closed = store.helpdeskTickets.filter((t) => t.status === 'closed').length;
  const chart = [3, 5, 4, 6, 2, 4, 3];

  return [
    {
      title: 'Open Tickets',
      count: open,
      details: 'Awaiting response',
      color: 'warning.main',
      open,
      running: 2,
      solved: closed,
      chartData: chart,
      value: open,
      chart
    },
    {
      title: 'In Progress',
      count: 2,
      details: 'Being worked on',
      color: 'info.main',
      open: 2,
      running: 2,
      solved: 0,
      chartData: [2, 3, 2, 4, 3, 2, 1],
      value: 2,
      chart: [2, 3, 2, 4, 3, 2, 1]
    },
    {
      title: 'Resolved',
      count: closed,
      details: 'Closed this month',
      color: 'success.main',
      open: 0,
      running: 0,
      solved: closed,
      chartData: [1, 2, 3, 4, 4, 5, closed],
      value: closed,
      chart: [1, 2, 3, 4, 4, 5, closed]
    }
  ];
}

export function buildSeatDashboard(company, store, currentUser) {
  const companyGroups = store.groups.filter((g) => g.companyId === company?.id);
  const groupIds = companyGroups.map((g) => g.id);

  const bundles = store.bundles.map((bundle) => {
    const gb = store.groupBundles.find((x) => x.bundleId === bundle.id && groupIds.includes(x.groupId));
    const assigned = gb?.allocatedSeats ?? company?.totalSeats ?? 100;
    const used = gb?.usedSeats ?? Math.floor(assigned * 0.7);
    const availableToAssign = Math.max(assigned - used, 0);

    return {
      bundleId: bundle.id,
      title: bundle.title || bundle.bundleName,
      bundleType: bundle.campaignType || 'training',
      assignedToThisCompany: assigned,
      usedInThisCompany: used,
      availableToAssign,
      canAssign: true,
      bundleName: bundle.bundleName || bundle.title
    };
  });

  return {
    company,
    summary: {
      totalSeats: company?.totalSeats ?? 0,
      allocatedSeats: company?.allocatedSeats ?? 0,
      availableSeats: (company?.totalSeats ?? 0) - (company?.allocatedSeats ?? 0)
    },
    bundles,
    metadata: {
      isOwner: currentUser?.role === 'admin' || currentUser?.role === 'contributor',
      isAdminViewing: currentUser?.role === 'admin'
    }
  };
}

export function enrichGroup(group) {
  return {
    ...group,
    gophishGroupID: group.gophishGroupID ?? group.gophishGroupId ?? 1,
    gophishGroupId: group.gophishGroupId ?? group.gophishGroupID ?? 1,
    signInType: group.signInType || 'passwordless'
  };
}

export function getDashboardStatsForRole(user, store) {
  const contributors = store.users.filter((u) => u.role === 'contributor');
  const companies = store.companies;
  const groups = store.groups;
  const users = store.users;

  if (user?.role === 'admin') {
    return {
      role: 'admin',
      stats: {
        partners: contributors.length,
        organizations: companies.length,
        groups: groups.length,
        users: users.length
      }
    };
  }

  if (user?.role === 'contributor') {
    const myCompanies = companies.filter((c) => c.contributorId === user.id);
    const myCompanyIds = myCompanies.map((c) => c.id);
    const myGroups = groups.filter((g) => myCompanyIds.includes(g.companyId));
    const myUsers = users.filter((u) => myCompanyIds.includes(u.companyId));
    const totalSeats = myCompanies.reduce((s, c) => s + (c.totalSeats || 0), 0);
    const allocated = myCompanies.reduce((s, c) => s + (c.allocatedSeats || 0), 0);
    const pct = totalSeats ? Math.round((allocated / totalSeats) * 100) : 0;

    return {
      role: 'contributor',
      stats: {
        organizations: myCompanies.length,
        groups: myGroups.length,
        users: myUsers.length,
        subscriptions: { display: `${allocated}/${totalSeats}`, percentage: String(pct) }
      }
    };
  }

  if (user?.role === 'groupLeader') {
    const myGroups = groups.filter((g) => g.leaderId === user.id);
    const myGroupIds = myGroups.map((g) => g.id);
    const members = users.filter((u) => myGroupIds.includes(u.groupId));
    const registrations = store.userCourses.filter((uc) => members.some((m) => m.id === uc.userId)).length;
    const totalSeats = 50;
    const used = members.length;

    return {
      role: 'groupLeader',
      stats: {
        registrations,
        groups: myGroups.length,
        users: members.length,
        subscriptions: { display: `${used}/${totalSeats}`, percentage: String(Math.round((used / totalSeats) * 100)) }
      }
    };
  }

  return {
    role: user?.role || 'admin',
    stats: {
      partners: contributors.length,
      organizations: companies.length,
      groups: groups.length,
      users: users.length
    }
  };
}

export function buildGophishCampaigns(store, email, groupNames = []) {
  const baseName = groupNames.length ? groupNames.join('|') : 'Engineering Team';
  return {
    campaigns: store.gophishCampaigns.map((c, i) => ({
      ...c,
      name: email ? `email: ${email} | ${c.name}` : `${baseName} | ${c.name}`,
      status: i === 0 ? 'In progress' : c.status
    }))
  };
}

export function buildModuleReportData(store) {
  const groups = store.groups;
  return {
    modulesStats: store.courses.map((c, i) => {
      const group = groups[i % groups.length];
      return {
        course_id: c.id,
        course_title: c.title,
        course: c.title,
        enrolled: 12 + i * 3,
        not_started: 2,
        in_progress: 5,
        completed: 5 + i,
        group_id: group?.id,
        group_name: group?.name || 'Engineering Team',
        avg_completion_percentage: c.progress || 0,
        completion: c.progress
      };
    }),
    courses_len: store.courses.length,
    all_group_users_len: store.userReportStats.length
  };
}

export function enrichBundle(bundle, store) {
  if (!bundle) return null;
  const courseIds = bundle.courseIds || [];
  const courses = courseIds
    .map((cid) => store.courses.find((c) => c.id === cid))
    .filter(Boolean);
  const bundleDiscounts = store.discounts.filter(
    (d) => d.bundleId === bundle.id || d.resource_id === bundle.id || d.resource_type === 'bundle'
  );
  const seatPrice = bundle.seatPrice ?? bundle.seatprice ?? 99.99;

  return {
    ...bundle,
    title: bundle.title || bundle.bundleName,
    bundleName: bundle.bundleName || bundle.title,
    description: bundle.description || bundle.bundleDescription || '',
    bundleDescription: bundle.bundleDescription || bundle.description || '',
    seatPrice,
    seatprice: seatPrice,
    courses: courses.length ? courses : [],
    courseIds: courseIds.length ? courseIds : courses.map((c) => c.id),
    discounts:
      bundleDiscounts.length > 0
        ? bundleDiscounts.map((d) => ({
            ...d,
            percentage: d.percentage,
            resource_Id: d.resource_id || bundle.id,
            enable: 'true'
          }))
        : [{ percentage: 10, resource_Id: bundle.id, enable: 'true' }]
  };
}

export function enrichCourse(course) {
  if (!course) return null;
  return {
    ...course,
    featuredImage: course.featuredImage || course.imageUrl || null,
    priceperseat: course.priceperseat ?? course.pricePerSeat ?? 0
  };
}

export function buildInvoiceWidgetData(store) {
  const paid = store.invoices.filter((i) => i.status === 'paid');
  const pending = store.invoices.filter((i) => i.status === 'pending' || i.status === 'unpaid');
  const totalAmount = store.invoices.reduce((s, i) => s + (i.amount || 0), 0);
  const paidAmount = paid.reduce((s, i) => s + (i.amount || 0), 0);
  const pendingAmount = pending.reduce((s, i) => s + (i.amount || 0), 0);

  return [
    {
      title: 'Total',
      count: totalAmount,
      percentage: 12.5,
      isLoss: false,
      invoice: String(store.invoices.length),
      color: 'warning',
      chartData: [40, 55, 45, 60, 50, 65, totalAmount > 0 ? 70 : 30]
    },
    {
      title: 'Paid',
      count: paidAmount,
      percentage: 8.2,
      isLoss: false,
      invoice: String(paid.length),
      color: 'success',
      chartData: [20, 35, 30, 45, 40, 50, paidAmount > 0 ? 55 : 20]
    },
    {
      title: 'Pending',
      count: pendingAmount,
      percentage: -4.1,
      isLoss: true,
      invoice: String(pending.length),
      color: 'error',
      chartData: [15, 25, 20, 30, 25, 35, pendingAmount > 0 ? 40 : 15]
    }
  ];
}

export function buildReceivablesSummary(store) {
  const total = store.invoices.reduce((s, i) => s + (i.amount || 0), 0);
  const overdue = store.invoices
    .filter((i) => i.status === 'pending' || i.status === 'unpaid')
    .reduce((s, i) => s + (i.amount || 0), 0);
  const current = total - overdue;
  return {
    total,
    current,
    overdue,
    progress: total ? Math.round((current / total) * 100) : 0
  };
}

function companyBillingProfile(company) {
  if (!company) return null;
  const slug = company.name.toLowerCase().replace(/\s+/g, '');
  return {
    id: company.id,
    name: company.name,
    address: `${company.name}, ${company.country || 'US'}`,
    vatNumber: `VAT-${company.id.slice(-3).toUpperCase()}001`,
    email: `billing@${slug}.com`
  };
}

export function enrichBundlePurchase(bp, store) {
  if (!bp) return null;
  const bundle = enrichBundle(store.bundles.find((b) => b.id === bp.bundleId), store);
  const purchaser = store.users.find((u) => u.id === bp.purchasedBy);
  const discount = store.discounts.find((d) => d.bundleId === bp.bundleId);
  const seatPrice = bundle?.seatPrice ?? 99.99;
  const baseTotal = bp.seatsPurchased * seatPrice;
  const totalPrice =
    bp.totalPrice ??
    (discount ? baseTotal - (baseTotal * discount.percentage) / 100 : baseTotal);

  return {
    ...bp,
    seatsPurchased: bp.seatsPurchased,
    totalPrice: Number(totalPrice.toFixed(2)),
    description: bundle?.description || '',
    bundle,
    courses: bundle?.courses || [],
    discount: discount || null,
    createdByUser: enrichUserRef(purchaser),
    createdAt: bp.createdAt
  };
}

export function enrichInvoicesForList(store) {
  const admin = store.users.find((u) => u.role === 'admin') || store.users[0];
  return store.invoices.map((inv, idx) => {
    const company = store.companies.find((c) => c.id === inv.companyId);
    const bp = inv.bundlePurchaseId
      ? store.bundlePurchases.find((b) => b.id === inv.bundlePurchaseId)
      : null;
    const enrichedBp = bp ? enrichBundlePurchase(bp, store) : null;
    const invoiceType = inv.invoiceType === 'bundle' ? 'internal' : inv.invoiceType || 'internal';

    return {
      ...inv,
      invoiceType,
      avatar: inv.avatar ?? (idx % 6) + 1,
      createdAt: inv.createdAt || '2025-03-01T10:00:00Z',
      dueDate: inv.dueDate || '2025-06-30',
      createdByUser: {
        firstName: inv.createdByUser?.firstName || admin?.firstName || 'Alex',
        lastName: inv.createdByUser?.lastName || admin?.lastName || 'Morgan',
        email: inv.createdByUser?.email || admin?.email,
        profile: inv.createdByUser?.profile || {
          businessName: company?.name || 'SecureLearn Demo',
          phoneNumber: '+1 555-0100',
          businessAddress: company ? `${company.name}, ${company.country || 'US'}` : '123 Demo St'
        }
      },
      company: inv.company || companyBillingProfile(company),
      bundlePurchase: enrichedBp
        ? {
            id: enrichedBp.id,
            seatsPurchased: enrichedBp.seatsPurchased,
            totalPrice: enrichedBp.totalPrice,
            bundle: enrichedBp.bundle
              ? {
                  id: enrichedBp.bundle.id,
                  title: enrichedBp.bundle.title,
                  seatPrice: enrichedBp.bundle.seatPrice,
                  description: enrichedBp.bundle.description
                }
              : null
          }
        : inv.bundlePurchase
    };
  });
}

export function buildUserReportStats(store) {
  return store.users
    .filter((u) => u.role === 'subscriber' || u.role === 'groupLeader')
    .map((u) => {
      const group = store.groups.find((g) => g.id === u.groupId);
      const enrollments = store.userCourses.filter((uc) => uc.userId === u.id);
      const completed = enrollments.filter((e) => e.status === 'completed').length;
      const inProgress = enrollments.filter((e) => e.status === 'active').length;
      return {
        firstname: u.firstName,
        lastname: u.lastName,
        email: u.email,
        group_id: u.groupId || group?.id,
        group_name: group?.name || 'Engineering Team',
        enrolled_courses: enrollments.length || 2,
        not_started_courses: Math.max(0, 2 - completed),
        in_progress_courses: inProgress || 1,
        completed_courses: completed
      };
    });
}
