// Rich seed data for the LMS demo — all entities the app references

export const DEMO_USERS = {
  admin: {
    id: 'user-admin-001',
    email: 'admin@securelearn.demo',
    firstName: 'Alex',
    lastName: 'Morgan',
    role: 'admin',
    signInType: 'withPassword',
    isActive: true,
    companyId: null
  },
  contributor: {
    id: 'user-contrib-001',
    email: 'contributor@securelearn.demo',
    firstName: 'Jordan',
    lastName: 'Chen',
    role: 'contributor',
    signInType: 'withPassword',
    isActive: true,
    companyId: 'company-001'
  },
  groupLeader: {
    id: 'user-gl-001',
    email: 'groupleader@securelearn.demo',
    firstName: 'Sam',
    lastName: 'Rivera',
    role: 'groupLeader',
    signInType: 'withPassword',
    isActive: true,
    companyId: 'company-001',
    groupId: 'group-001'
  },
  subscriber: {
    id: 'user-sub-001',
    email: 'subscriber@securelearn.demo',
    firstName: 'Taylor',
    lastName: 'Brooks',
    role: 'subscriber',
    signInType: 'withPassword',
    isActive: true,
    companyId: 'company-001',
    groupId: 'group-001'
  },
  supportAgent: {
    id: 'user-agent-001',
    email: 'support@securelearn.demo',
    firstName: 'Casey',
    lastName: 'Nguyen',
    role: 'supportAgent',
    signInType: 'withPassword',
    isActive: true,
    companyId: null
  }
};

export function buildSeedStore() {
  const users = Object.values(DEMO_USERS).concat([
    {
      id: 'user-sub-002',
      email: 'morgan.lee@acme.com',
      firstName: 'Morgan',
      lastName: 'Lee',
      role: 'subscriber',
      signInType: 'passwordless',
      isActive: true,
      companyId: 'company-001',
      groupId: 'group-001'
    },
    {
      id: 'user-sub-003',
      email: 'riley.park@acme.com',
      firstName: 'Riley',
      lastName: 'Park',
      role: 'subscriber',
      signInType: 'passwordless',
      isActive: true,
      companyId: 'company-001',
      groupId: 'group-002'
    },
    {
      id: 'user-gl-002',
      email: 'dana.walsh@globaltech.com',
      firstName: 'Dana',
      lastName: 'Walsh',
      role: 'groupLeader',
      signInType: 'withPassword',
      isActive: true,
      companyId: 'company-002',
      groupId: 'group-002'
    }
  ]);

  const companies = [
    {
      id: 'company-001',
      name: 'Acme Corporation',
      industry: 'Technology',
      country: 'US',
      isActive: true,
      totalSeats: 250,
      allocatedSeats: 178,
      contributorId: 'user-contrib-001',
      createdAt: '2025-01-15T10:00:00Z'
    },
    {
      id: 'company-002',
      name: 'GlobalTech Industries',
      industry: 'Finance',
      country: 'GB',
      isActive: true,
      totalSeats: 120,
      allocatedSeats: 85,
      contributorId: 'user-contrib-001',
      createdAt: '2025-02-20T14:30:00Z'
    }
  ];

  const categories = [
    { id: 'cat-001', name: 'Security Awareness' },
    { id: 'cat-002', name: 'Compliance' },
    { id: 'cat-003', name: 'Phishing Simulation' }
  ];

  const courses = [
    {
      id: 'course-001',
      title: 'Phishing Awareness Fundamentals',
      description: 'Learn to identify and report phishing attempts in corporate email.',
      status: 'published',
      priceperseat: 29.99,
      progress: 72,
      category_id: 'cat-001',
      createdBy: 'user-contrib-001',
      imageUrl: null,
      duration: '45 min',
      lessonsCount: 6
    },
    {
      id: 'course-002',
      title: 'Password Security Best Practices',
      description: 'Create strong passwords and use multi-factor authentication effectively.',
      status: 'published',
      priceperseat: 19.99,
      progress: 100,
      category_id: 'cat-001',
      createdBy: 'user-contrib-001',
      imageUrl: null,
      duration: '30 min',
      lessonsCount: 4
    },
    {
      id: 'course-003',
      title: 'GDPR Compliance Essentials',
      description: 'Understand data protection requirements for EU operations.',
      status: 'published',
      priceperseat: 39.99,
      progress: 45,
      category_id: 'cat-002',
      createdBy: 'user-contrib-001',
      imageUrl: null,
      duration: '60 min',
      lessonsCount: 8
    },
    {
      id: 'course-004',
      title: 'Social Engineering Defense',
      description: 'Recognize manipulation tactics used in social engineering attacks.',
      status: 'published',
      priceperseat: 34.99,
      progress: 18,
      category_id: 'cat-003',
      createdBy: 'user-contrib-001',
      imageUrl: null,
      duration: '50 min',
      lessonsCount: 5
    },
    {
      id: 'course-005',
      title: 'Incident Response Procedures',
      description: 'Step-by-step guide for reporting and containing security incidents.',
      status: 'draft',
      priceperseat: 44.99,
      progress: 0,
      category_id: 'cat-001',
      createdBy: 'user-contrib-001',
      imageUrl: null,
      duration: '55 min',
      lessonsCount: 7
    }
  ];

  const bundles = [
    {
      id: 'bundle-001',
      title: 'Security Essentials Bundle',
      bundleName: 'Security Essentials Bundle',
      bundleDescription: 'Core security training for all employees.',
      description: 'Core security training for all employees.',
      seatprice: 99.99,
      category: 'cat-001',
      campaignType: 'training',
      courseIds: ['course-001', 'course-002'],
      status: 'active'
    },
    {
      id: 'bundle-002',
      title: 'Compliance Pro Bundle',
      bundleName: 'Compliance Pro Bundle',
      bundleDescription: 'GDPR and regulatory compliance training package.',
      description: 'GDPR and regulatory compliance training package.',
      seatprice: 149.99,
      category: 'cat-002',
      campaignType: 'training',
      courseIds: ['course-003', 'course-004'],
      status: 'active'
    }
  ];

  const lessons = [
    { id: 'lesson-001', courseId: 'course-001', title: 'What is Phishing?', order: 1, duration: 8 },
    { id: 'lesson-002', courseId: 'course-001', title: 'Red Flags in Emails', order: 2, duration: 10 },
    { id: 'lesson-003', courseId: 'course-001', title: 'Reporting Procedures', order: 3, duration: 7 },
    { id: 'lesson-004', courseId: 'course-002', title: 'Password Strength', order: 1, duration: 8 },
    { id: 'lesson-005', courseId: 'course-002', title: 'MFA Setup Guide', order: 2, duration: 12 }
  ];

  const groups = [
    {
      id: 'group-001',
      name: 'Engineering Team',
      companyId: 'company-001',
      companyName: 'Acme Corporation',
      leaderId: 'user-gl-001',
      leaderName: 'Sam Rivera',
      memberCount: 4,
      isActive: true,
      gophishGroupId: 1,
      gophishGroupID: 1,
      createdAt: '2025-03-01T09:00:00Z'
    },
    {
      id: 'group-002',
      name: 'Sales Enablement',
      companyId: 'company-002',
      companyName: 'GlobalTech Industries',
      leaderId: 'user-gl-002',
      leaderName: 'Dana Walsh',
      memberCount: 3,
      isActive: true,
      gophishGroupId: 2,
      gophishGroupID: 2,
      createdAt: '2025-03-10T11:00:00Z'
    }
  ];

  const groupMembers = {
    'group-001': [
      { id: 'gm-001', userId: 'user-gl-001', groupId: 'group-001', role: 'groupLeader', firstName: 'Sam', lastName: 'Rivera', email: 'groupleader@securelearn.demo' },
      { id: 'gm-002', userId: 'user-sub-001', groupId: 'group-001', role: 'subscriber', firstName: 'Taylor', lastName: 'Brooks', email: 'subscriber@securelearn.demo' },
      { id: 'gm-003', userId: 'user-sub-002', groupId: 'group-001', role: 'subscriber', firstName: 'Morgan', lastName: 'Lee', email: 'morgan.lee@acme.com' }
    ],
    'group-002': [
      { id: 'gm-004', userId: 'user-gl-002', groupId: 'group-002', role: 'groupLeader', firstName: 'Dana', lastName: 'Walsh', email: 'dana.walsh@globaltech.com' },
      { id: 'gm-005', userId: 'user-sub-003', groupId: 'group-002', role: 'subscriber', firstName: 'Riley', lastName: 'Park', email: 'riley.park@acme.com' }
    ]
  };

  const userCourses = [
    { id: 'uc-001', userId: 'user-sub-001', courseId: 'course-001', progress: 72, status: 'active', triggerCourse: false, enrolledAt: '2025-04-01T08:00:00Z' },
    { id: 'uc-002', userId: 'user-sub-001', courseId: 'course-002', progress: 100, status: 'completed', triggerCourse: false, enrolledAt: '2025-03-15T08:00:00Z' },
    { id: 'uc-003', userId: 'user-sub-001', courseId: 'course-003', progress: 45, status: 'active', triggerCourse: true, enrolledAt: '2025-04-10T08:00:00Z', launchDate: '2026-12-01T00:00:00Z' },
    { id: 'uc-004', userId: 'user-sub-002', courseId: 'course-001', progress: 30, status: 'active', triggerCourse: false, enrolledAt: '2025-04-05T08:00:00Z' }
  ];

  const lessonProgress = [
    { id: 'lp-001', lessonId: 'lesson-001', userId: 'user-sub-001', userCourseId: 'uc-001', isCompleted: true },
    { id: 'lp-002', lessonId: 'lesson-002', userId: 'user-sub-001', userCourseId: 'uc-001', isCompleted: true },
    { id: 'lp-003', lessonId: 'lesson-003', userId: 'user-sub-001', userCourseId: 'uc-001', isCompleted: false }
  ];

  const discounts = [
    { id: 'disc-001', bundleId: 'bundle-001', percentage: 15, resource_type: 'bundle', name: 'Volume Discount', isActive: true },
    { id: 'disc-002', bundleId: null, percentage: 10, resource_type: 'course', resource_id: 'course-001', name: 'Launch Promo', isActive: true }
  ];

  const bundlePurchases = [
    {
      id: 'bp-001',
      bundleId: 'bundle-001',
      purchasedBy: 'user-contrib-001',
      companyId: 'company-001',
      seatsPurchased: 100,
      totalPrice: 8499.15,
      status: 'active',
      createdAt: '2025-03-01T10:00:00Z'
    },
    {
      id: 'bp-002',
      bundleId: 'bundle-002',
      purchasedBy: 'user-contrib-001',
      companyId: 'company-002',
      seatsPurchased: 30,
      totalPrice: 4049.73,
      status: 'active',
      createdAt: '2025-05-15T10:00:00Z'
    },
    {
      id: 'bp-003',
      bundleId: 'bundle-001',
      purchasedBy: 'user-admin-001',
      companyId: 'company-001',
      seatsPurchased: 50,
      totalPrice: 4249.58,
      status: 'active',
      createdAt: '2025-04-10T14:30:00Z'
    },
    {
      id: 'bp-004',
      bundleId: 'bundle-002',
      purchasedBy: 'user-contrib-001',
      companyId: 'company-002',
      seatsPurchased: 75,
      totalPrice: 10124.33,
      status: 'active',
      createdAt: '2025-02-28T09:15:00Z'
    },
    {
      id: 'bp-005',
      bundleId: 'bundle-001',
      purchasedBy: 'user-contrib-001',
      companyId: 'company-001',
      seatsPurchased: 25,
      totalPrice: 2124.79,
      status: 'active',
      createdAt: '2025-06-05T11:00:00Z'
    }
  ];

  const invoices = [
    {
      id: 'inv-001',
      invoiceNumber: 'INV-2025-0042',
      companyId: 'company-001',
      bundlePurchaseId: 'bp-001',
      status: 'paid',
      invoiceType: 'internal',
      amount: 8499.15,
      dueDate: '2025-03-31',
      createdAt: '2025-03-01T10:00:00Z',
      avatar: 1,
      createdByUser: { firstName: 'Jordan', lastName: 'Chen', email: 'contributor@securelearn.demo' }
    },
    {
      id: 'inv-002',
      invoiceNumber: 'INV-2025-0058',
      companyId: 'company-002',
      bundlePurchaseId: 'bp-002',
      status: 'pending',
      invoiceType: 'internal',
      amount: 4049.73,
      dueDate: '2025-06-30',
      createdAt: '2025-05-15T10:00:00Z',
      avatar: 2,
      createdByUser: { firstName: 'Alex', lastName: 'Morgan', email: 'admin@securelearn.demo' }
    },
    {
      id: 'inv-003',
      invoiceNumber: 'INV-2025-0061',
      companyId: 'company-001',
      status: 'unpaid',
      invoiceType: 'external',
      amount: 2200.0,
      quantity: 50,
      unitPrice: 44.0,
      subtotal: 2200.0,
      discountPercentage: 0,
      description: 'Custom Security Training Package',
      itemDescription: 'On-site workshop + 50 seat licenses',
      dueDate: '2025-07-15',
      createdAt: '2025-06-01T10:00:00Z',
      avatar: 3,
      notes: 'Payment terms: Net 30',
      createdByUser: { firstName: 'Jordan', lastName: 'Chen', email: 'contributor@securelearn.demo' }
    },
    {
      id: 'inv-004',
      invoiceNumber: 'INV-2025-0073',
      companyId: 'company-001',
      bundlePurchaseId: 'bp-003',
      status: 'paid',
      invoiceType: 'internal',
      amount: 4249.58,
      dueDate: '2025-04-30',
      createdAt: '2025-04-10T14:30:00Z',
      avatar: 4,
      createdByUser: { firstName: 'Alex', lastName: 'Morgan', email: 'admin@securelearn.demo' }
    },
    {
      id: 'inv-005',
      invoiceNumber: 'INV-2025-0089',
      companyId: 'company-002',
      status: 'paid',
      invoiceType: 'external',
      amount: 3750.0,
      quantity: 25,
      unitPrice: 150.0,
      subtotal: 3750.0,
      discountPercentage: 0,
      description: 'Compliance Pro Bundle — Offline Sale',
      itemDescription: 'Annual enterprise license, 25 seats',
      dueDate: '2025-05-01',
      createdAt: '2025-04-22T08:00:00Z',
      avatar: 5,
      createdByUser: { firstName: 'Jordan', lastName: 'Chen', email: 'contributor@securelearn.demo' }
    },
    {
      id: 'inv-006',
      invoiceNumber: 'INV-2025-0095',
      companyId: 'company-002',
      bundlePurchaseId: 'bp-004',
      status: 'unpaid',
      invoiceType: 'internal',
      amount: 10124.33,
      dueDate: '2025-06-15',
      createdAt: '2025-02-28T09:15:00Z',
      avatar: 6,
      createdByUser: { firstName: 'Jordan', lastName: 'Chen', email: 'contributor@securelearn.demo' }
    },
    {
      id: 'inv-007',
      invoiceNumber: 'INV-2025-0102',
      companyId: 'company-001',
      status: 'cancelled',
      invoiceType: 'external',
      amount: 1899.99,
      quantity: 20,
      unitPrice: 99.99,
      subtotal: 1999.8,
      discountPercentage: 5,
      description: 'Security Essentials — Cancelled Order',
      itemDescription: 'Client cancelled before fulfillment',
      dueDate: '2025-05-20',
      createdAt: '2025-05-10T16:45:00Z',
      avatar: 2,
      notes: 'Cancelled per client request',
      createdByUser: { firstName: 'Alex', lastName: 'Morgan', email: 'admin@securelearn.demo' }
    },
    {
      id: 'inv-008',
      invoiceNumber: 'INV-2025-0118',
      companyId: 'company-002',
      status: 'pending',
      invoiceType: 'external',
      amount: 5249.5,
      quantity: 35,
      unitPrice: 149.99,
      subtotal: 5249.65,
      discountPercentage: 0,
      description: 'GDPR Compliance Workshop Bundle',
      itemDescription: '35 seats + facilitator materials',
      dueDate: '2025-08-01',
      createdAt: '2025-06-08T13:20:00Z',
      avatar: 3,
      createdByUser: { firstName: 'Jordan', lastName: 'Chen', email: 'contributor@securelearn.demo' }
    },
    {
      id: 'inv-009',
      invoiceNumber: 'INV-2025-0124',
      companyId: 'company-001',
      bundlePurchaseId: 'bp-005',
      status: 'paid',
      invoiceType: 'internal',
      amount: 2124.79,
      dueDate: '2025-06-20',
      createdAt: '2025-06-05T11:00:00Z',
      avatar: 1,
      createdByUser: { firstName: 'Jordan', lastName: 'Chen', email: 'contributor@securelearn.demo' }
    },
    {
      id: 'inv-010',
      invoiceNumber: 'INV-2025-0131',
      companyId: 'company-002',
      status: 'unpaid',
      invoiceType: 'external',
      amount: 899.97,
      quantity: 3,
      unitPrice: 299.99,
      subtotal: 899.97,
      discountPercentage: 0,
      description: 'Executive Security Briefing',
      itemDescription: '3 executive seats — premium tier',
      dueDate: '2025-07-30',
      createdAt: '2025-06-12T09:00:00Z',
      avatar: 4,
      createdByUser: { firstName: 'Alex', lastName: 'Morgan', email: 'admin@securelearn.demo' }
    },
    {
      id: 'inv-011',
      invoiceNumber: 'INV-2025-0147',
      companyId: 'company-001',
      status: 'paid',
      invoiceType: 'external',
      amount: 14999.0,
      quantity: 100,
      unitPrice: 149.99,
      subtotal: 14999.0,
      discountPercentage: 0,
      description: 'Enterprise Annual Renewal',
      itemDescription: '100-seat Compliance Pro renewal',
      dueDate: '2025-01-31',
      createdAt: '2025-01-15T10:00:00Z',
      avatar: 5,
      createdByUser: { firstName: 'Jordan', lastName: 'Chen', email: 'contributor@securelearn.demo' }
    },
    {
      id: 'inv-012',
      invoiceNumber: 'INV-2025-0156',
      companyId: 'company-002',
      status: 'cancelled',
      invoiceType: 'external',
      amount: 2999.0,
      quantity: 20,
      unitPrice: 149.95,
      subtotal: 2999.0,
      discountPercentage: 0,
      description: 'Duplicate Order — Voided',
      itemDescription: 'Duplicate offline sale, voided before payment',
      dueDate: '2025-04-15',
      createdAt: '2025-03-20T12:00:00Z',
      avatar: 6,
      notes: 'Duplicate order — voided',
      createdByUser: { firstName: 'Alex', lastName: 'Morgan', email: 'admin@securelearn.demo' }
    }
  ];

  const groupBundles = [
    { id: 'gb-001', groupId: 'group-001', bundleId: 'bundle-001', allocatedSeats: 50, usedSeats: 38 },
    { id: 'gb-002', groupId: 'group-002', bundleId: 'bundle-002', allocatedSeats: 30, usedSeats: 22 }
  ];

  const emailTemplates = [
    { id: 'et-001', name: 'Welcome Email', type: 'welcome', subject: 'Welcome to SecureLearn', body: '<p>Welcome aboard!</p>', isActive: true },
    { id: 'et-002', name: 'Course Reminder', type: 'reminder', subject: 'Complete your training', body: '<p>Please complete your assigned courses.</p>', isActive: true },
    { id: 'et-003', name: 'Invoice Template', type: 'invoice', subject: 'Your Invoice', body: '<p>Please find your invoice attached.</p>', isActive: true }
  ];

  const helpdeskCategories = [
    { id: 'hc-001', name: 'Technical Issue' },
    { id: 'hc-002', name: 'Billing' },
    { id: 'hc-003', name: 'Course Access' },
    { id: 'hc-004', name: 'Account' }
  ];

  const helpdeskTickets = [
    {
      id: 'ticket-001',
      subject: 'Cannot access Phishing course',
      categoryId: 'hc-003',
      categoryName: 'Course Access',
      description: 'Getting a 404 when trying to open lesson 3.',
      status: 'open',
      createdBy: 'user-sub-001',
      createdByName: 'Taylor Brooks',
      createdAt: '2025-06-01T14:22:00Z',
      replies: [
        {
          id: 'reply-001',
          message: 'We are looking into this. Can you try clearing your cache?',
          authorId: 'user-agent-001',
          authorName: 'Casey Nguyen',
          createdAt: '2025-06-01T15:00:00Z',
          attachments: []
        }
      ],
      attachments: []
    },
    {
      id: 'ticket-002',
      subject: 'Invoice discrepancy for Q2',
      categoryId: 'hc-002',
      categoryName: 'Billing',
      description: 'The seat count on invoice INV-2025-0058 seems incorrect.',
      status: 'closed',
      createdBy: 'user-contrib-001',
      createdByName: 'Jordan Chen',
      createdAt: '2025-05-20T09:15:00Z',
      replies: [],
      attachments: []
    }
  ];

  const attackSimulations = [
    { id: 'as-001', name: 'Q2 Phishing Test', courseId: 'course-001', createdBy: 'user-contrib-001', status: 'active' },
    { id: 'as-002', name: 'Executive Spear Phish', courseId: 'course-004', createdBy: 'user-contrib-001', status: 'draft' }
  ];

  const scheduleAttackSimulations = [
    {
      id: 'sas-001',
      name: 'Engineering Phish Campaign',
      campaignType: 'phishing',
      companyId: 'company-001',
      groupIds: ['group-001'],
      bundleId: 'bundle-001',
      launchStatus: 'completed',
      status: 'active',
      timezone: 'America/New_York',
      courseIds: ['course-001'],
      launchDate: '2025-05-01',
      createdBy: 'user-contrib-001'
    }
  ];

  const contributors = users
    .filter((u) => u.role === 'contributor')
    .map((u) => ({ id: u.id, firstname: u.firstName, lastname: u.lastName, email: u.email }));

  const groupleaders = users
    .filter((u) => u.role === 'groupLeader')
    .map((u) => ({
      id: u.id,
      firstname: u.firstName,
      lastname: u.lastName,
      email: u.email,
      group_id: u.groupId
    }));

  const subscribers = users
    .filter((u) => u.role === 'subscriber')
    .map((u) => ({
      id: u.id,
      firstname: u.firstName,
      lastname: u.lastName,
      email: u.email,
      group_id: u.groupId
    }));

  const gophishGroups = [
    { id: 1, name: 'Engineering Team', targets: [{ email: 'subscriber@securelearn.demo', first_name: 'Taylor', last_name: 'Brooks' }] },
    { id: 2, name: 'Sales Enablement', targets: [{ email: 'riley.park@acme.com', first_name: 'Riley', last_name: 'Park' }] }
  ];

  const gophishCampaigns = [
    { id: 1, name: 'Q2 Phishing Test', status: 'In progress', created_date: '2025-05-01T00:00:00Z', stats: { sent: 45, opened: 32, clicked: 8, submitted: 3 } },
    { id: 2, name: 'Security Awareness Drill', status: 'Completed', created_date: '2025-04-15T00:00:00Z', stats: { sent: 30, opened: 22, clicked: 4, submitted: 1 } }
  ];

  const brandSettings = {
    logoUrl: '/assets/images/logo.png',
    faviconUrl: '/favicon.svg',
    faviconIcoUrl: '/favicon.svg',
    appleTouchIconUrl: '/favicon.svg',
    updatedAt: '2025-01-01T00:00:00Z'
  };

  const seatsDiscounts = [{ id: 'sd-001', minSeats: 50, percentage: 10 }, { id: 'sd-002', minSeats: 100, percentage: 15 }];

  const moduleReportStats = {
    total_users_in_groups: 12,
    total_groups: 2,
    campaigns: 3,
    groups_details: groups.map((g) => ({ id: g.id, name: g.name, members: g.memberCount }))
  };

  const userReportStats = users
    .filter((u) => u.role === 'subscriber')
    .map((u) => ({
      email: u.email,
      name: `${u.firstName} ${u.lastName}`,
      courses_completed: u.id === 'user-sub-001' ? 1 : 0,
      courses_in_progress: u.id === 'user-sub-001' ? 2 : 1,
      progress_avg: u.id === 'user-sub-001' ? 72 : 30
    }));

  return {
    users,
    companies,
    categories,
    courses,
    bundles,
    lessons,
    groups,
    groupMembers,
    userCourses,
    lessonProgress,
    discounts,
    bundlePurchases,
    invoices,
    groupBundles,
    emailTemplates,
    helpdeskCategories,
    helpdeskTickets,
    attackSimulations,
    scheduleAttackSimulations,
    contributors,
    groupleaders,
    subscribers,
    gophishGroups,
    gophishCampaigns,
    gophishTemplates: [{ id: 1, name: 'IT Password Reset' }, { id: 2, name: 'HR Benefits Update' }],
    gophishPages: [{ id: 1, name: 'Login Portal' }],
    gophishSmtp: [{ id: 1, name: 'Corporate Mail Relay' }],
    brandSettings,
    seatsDiscounts,
    moduleReportStats,
    userReportStats,
    campaigns: [{ id: 'camp-001', name: 'Q2 Phishing Test', status: 'completed', groupId: 'group-001' }]
  };
}
