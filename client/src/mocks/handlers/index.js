import { handleAuth } from './auth';
import {
  buildGophishCampaigns,
  buildHelpdeskDashboardCards,
  buildHelpdeskStats,
  buildInvoiceWidgetData,
  buildModuleReportData,
  buildReceivablesSummary,
  buildUserReportStats,
  buildSeatDashboard,
  enrichBundle,
  enrichCourse,
  enrichInvoicesForList,
  enrichBundlePurchase,
  enrichGroup,
  enrichTicket,
  enrichTickets,
  getDashboardStatsForRole
} from './helpers';
import { getSeedStore } from '../seed';
import { updateStore } from '../storage';
import {
  createId,
  getCurrentUser,
  paginate,
  parseBody,
  randomDelay,
  requestedBy,
  success
} from '../utils';

export async function routeRequest(config) {
  const method = (config.method || 'get').toUpperCase();
  const path = config._mockPath;
  const params = config.params || {};
  const body = parseBody(config.data);
  const store = getSeedStore();
  const currentUser = getCurrentUser();

  // Auth routes
  const authResult = await handleAuth(method, path, body);
  if (authResult !== null) return authResult;

  await randomDelay();

  // ─── Users ───────────────────────────────────────────────
  if (method === 'GET' && path === '/users/get-users') {
    let items = [...store.users];
    if (params.role) items = items.filter((u) => u.role === params.role);
    if (params.companyId) items = items.filter((u) => u.companyId === params.companyId);
    if (params.groupId) items = items.filter((u) => u.groupId === params.groupId);
    if (params.search) {
      const s = params.search.toLowerCase();
      items = items.filter((u) => u.email.includes(s) || `${u.firstName} ${u.lastName}`.toLowerCase().includes(s));
    }
    if (params.isActive !== undefined) items = items.filter((u) => String(u.isActive) === String(params.isActive));
    const paged = paginate(items, params.page, params.limit);
    return { success: true, ...paged, requestedBy: requestedBy() };
  }

  if (method === 'GET' && (path === '/users/contributor/my-users' || path === '/users/group-leader/my-users')) {
    let items = [...store.users];
    if (path.includes('group-leader')) {
      const leaderGroups = store.groups.filter((g) => g.leaderId === currentUser?.id).map((g) => g.id);
      items = items.filter((u) => leaderGroups.includes(u.groupId) || u.id === currentUser?.id);
    } else if (currentUser?.role === 'contributor') {
      items = items.filter((u) => u.companyId === currentUser.companyId || u.id === currentUser.id);
    }
    if (params.role) items = items.filter((u) => u.role === params.role);
    const paged = paginate(items, params.page, params.limit);
    return { success: true, ...paged, requestedBy: requestedBy() };
  }

  if (method === 'GET' && path === '/users/stats/dashboard') {
    return { success: true, data: getDashboardStatsForRole(currentUser, store) };
  }

  if (method === 'POST' && path === '/users/check-email') {
    const exists = store.users.some((u) => u.email === body.email?.toLowerCase());
    return { success: true, exists };
  }

  const userUpdateMatch = path.match(/^\/users\/([^/]+)\/update-user$/);
  if (method === 'PUT' && userUpdateMatch) {
    const id = userUpdateMatch[1];
    updateStore((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === id ? { ...u, ...body } : u))
    }));
    const updated = getSeedStore().users.find((u) => u.id === id);
    return { success: true, message: 'User updated', data: updated, updatedBy: requestedBy() };
  }

  const userDeleteMatch = path.match(/^\/users\/([^/]+)\/delete-user$/);
  if (method === 'DELETE' && userDeleteMatch) {
    const id = userDeleteMatch[1];
    updateStore((s) => ({ ...s, users: s.users.filter((u) => u.id !== id) }));
    return { success: true, message: 'User deleted', deletedBy: requestedBy() };
  }

  if (method === 'POST' && path === '/users/create-user') {
    const newUser = { id: createId('user'), isActive: true, ...body };
    updateStore((s) => ({ ...s, users: [...s.users, newUser] }));
    return { success: true, message: 'User created', data: newUser };
  }

  if (method === 'POST' && path === '/users/change-password') {
    return { success: true, message: 'Password changed successfully' };
  }

  // ─── User Profile ────────────────────────────────────────
  if (method === 'GET' && path === '/userProfile') {
    const user = store.users.find((u) => u.id === currentUser?.id) || currentUser;
    return success({ ...user, profilePictureUrl: null });
  }

  if (method === 'PATCH' && path === '/userProfile') {
    updateStore((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === currentUser?.id ? { ...u, ...body } : u))
    }));
    const updated = getSeedStore().users.find((u) => u.id === currentUser?.id);
    return success(updated);
  }

  if (method === 'POST' && path === '/userProfile/picture') {
    return { profilePictureUrl: '/assets/images/users/avatar-1.png' };
  }

  if (method === 'GET' && path === '/userProfile/admin') {
    const admin = store.users.find((u) => u.role === 'admin');
    return success(admin);
  }

  // ─── Courses ─────────────────────────────────────────────
  if (method === 'GET' && path === '/courses') {
    let items = [...store.courses];
    if (params.title) items = items.filter((c) => c.title.toLowerCase().includes(params.title.toLowerCase()));
    if (params.bundleId) {
      const bundle = store.bundles.find((b) => b.id === params.bundleId);
      items = bundle ? items.filter((c) => bundle.courseIds?.includes(c.id)) : [];
    }
    const paged = paginate(items, params.page, params.limit);
    return { success: true, data: paged.data, pagination: paged.pagination };
  }

  if (method === 'GET' && path === '/courses/my-courses') {
    const myEnrollments = store.userCourses.filter((uc) => uc.userId === currentUser?.id);
    const items = myEnrollments.map((uc) => {
      const course = store.courses.find((c) => c.id === uc.courseId);
      return { ...course, progress: uc.progress, status: uc.status, userCourseId: uc.id };
    });
    return success(items);
  }

  if (method === 'GET' && path === '/courses/all') {
    return { data: store.courses };
  }

  const courseMatch = path.match(/^\/courses\/([^/]+)$/);
  if (method === 'GET' && courseMatch && courseMatch[1] !== 'all') {
    const courseId = decodeURIComponent(courseMatch[1]).trim();
    const course = store.courses.find((c) => c.id === courseId);
    return { success: true, data: enrichCourse(course) };
  }

  const courseExistsMatch = path.match(/^\/courses\/([^/]+)\/exists$/);
  if (method === 'GET' && courseExistsMatch) {
    return { exists: store.courses.some((c) => c.id === courseExistsMatch[1]) };
  }

  if (method === 'POST' && path === '/courses') {
    const newCourse = { id: createId('course'), status: 'draft', progress: 0, ...body };
    updateStore((s) => ({ ...s, courses: [...s.courses, newCourse] }));
    return success(newCourse);
  }

  if (method === 'POST' && path === '/courses/add') {
    const newCourse = { id: createId('course'), status: 'published', ...body };
    updateStore((s) => ({ ...s, courses: [...s.courses, newCourse] }));
    return { success: true, data: newCourse };
  }

  if (method === 'POST' && path === '/courses/addbundle') {
    const newBundle = { id: createId('bundle'), ...body, courseIds: body.courseIds || [] };
    updateStore((s) => ({ ...s, bundles: [...s.bundles, newBundle] }));
    return { success: true, data: newBundle };
  }

  const bundleCourseMatch = path.match(/^\/courses\/bundles\/([^/]+)$/);
  if (method === 'GET' && bundleCourseMatch) {
    const bundleId = decodeURIComponent(bundleCourseMatch[1]).trim();
    const bundle = store.bundles.find((b) => b.id === bundleId);
    return { data: enrichBundle(bundle, store) };
  }

  const bundlesCoursesMatch = path.match(/^\/courses\/bundles_courses\/([^/]+)$/);
  if (method === 'GET' && bundlesCoursesMatch) {
    const bundle = store.bundles.find((b) => b.id === bundlesCoursesMatch[1]);
    return { course_ids: bundle?.courseIds || [] };
  }

  const updateBundleMatch = path.match(/^\/courses\/update_bundles\/([^/]+)$/);
  if (method === 'PUT' && updateBundleMatch) {
    const id = decodeURIComponent(updateBundleMatch[1]).trim();
    updateStore((s) => ({
      ...s,
      bundles: s.bundles.map((b) => (b.id === id ? { ...b, ...body } : b))
    }));
    const updated = enrichBundle(getSeedStore().bundles.find((b) => b.id === id), getSeedStore());
    return { success: true, data: updated };
  }

  const setImageMatch = path.match(/^\/courses\/set_image\/([^/]+)$/);
  if (method === 'PUT' && setImageMatch) {
    return { success: true };
  }

  const purchaseSeatsMatch = path.match(/^\/courses\/purchase_course_seats\/([^/]+)\/([^/]+)$/);
  if (method === 'POST' && purchaseSeatsMatch) {
    return { success: true, message: 'Seats purchased' };
  }

  if (method === 'PUT' && courseMatch) {
    const id = courseMatch[1];
    updateStore((s) => ({
      ...s,
      courses: s.courses.map((c) => (c.id === id ? { ...c, ...body.payload || body } : c))
    }));
    return success(getSeedStore().courses.find((c) => c.id === id));
  }

  if (method === 'DELETE' && courseMatch) {
    const id = courseMatch[1];
    updateStore((s) => ({ ...s, courses: s.courses.filter((c) => c.id !== id) }));
    return { success: true, message: 'Course deleted' };
  }

  // ─── Lessons ─────────────────────────────────────────────
  if (method === 'GET' && path === '/lessons') {
    let items = [...store.lessons];
    if (params.courseId) items = items.filter((l) => l.courseId === params.courseId);
    return success(items);
  }

  const lessonsByCourse = path.match(/^\/lessons\/course\/([^/]+)$/);
  if (method === 'GET' && lessonsByCourse) {
    const courseId = decodeURIComponent(lessonsByCourse[1]).trim();
    const items = store.lessons.filter((l) => l.courseId === courseId);
    return success(items);
  }

  const lessonMatch = path.match(/^\/lessons\/([^/]+)$/);
  if (method === 'GET' && lessonMatch && !path.includes('/course/')) {
    return success(store.lessons.find((l) => l.id === lessonMatch[1]));
  }

  if (method === 'POST' && path === '/lessons') {
    const newLesson = { id: createId('lesson'), ...body };
    updateStore((s) => ({ ...s, lessons: [...s.lessons, newLesson] }));
    return success(newLesson);
  }

  if (method === 'PUT' && lessonMatch) {
    const id = lessonMatch[1];
    updateStore((s) => ({
      ...s,
      lessons: s.lessons.map((l) => (l.id === id ? { ...l, ...body.payload || body } : l))
    }));
    return success(getSeedStore().lessons.find((l) => l.id === id));
  }

  if (method === 'DELETE' && lessonMatch) {
    updateStore((s) => ({ ...s, lessons: s.lessons.filter((l) => l.id !== lessonMatch[1]) }));
    return success(null);
  }

  // ─── Lesson Progress ─────────────────────────────────────
  if (method === 'GET' && path === '/courseLessonProgresses/my-progress') {
    let items = store.lessonProgress.filter((lp) => lp.userId === currentUser?.id);
    if (params.courseId) {
      const lessonIds = store.lessons.filter((l) => l.courseId === params.courseId).map((l) => l.id);
      items = items.filter((lp) => lessonIds.includes(lp.lessonId));
    }
    if (params.userCourseId) items = items.filter((lp) => lp.userCourseId === params.userCourseId);
    return { success: true, data: items, pagination: { total: items.length }, requestedBy: requestedBy() };
  }

  const progressExistsMatch = path.match(/^\/courseLessonProgresses\/([^/]+)\/exists$/);
  if (method === 'GET' && progressExistsMatch) {
    const exists = store.lessonProgress.some((lp) => lp.id === progressExistsMatch[1]);
    return { success: true, data: { exists }, requestedBy: requestedBy() };
  }

  if (method === 'POST' && path === '/courseLessonProgresses') {
    const entry = { id: createId('lp'), ...body };
    updateStore((s) => ({ ...s, lessonProgress: [...s.lessonProgress, entry] }));
    return { success: true, data: entry, message: 'Progress created', createdBy: requestedBy() };
  }

  const progressMatch = path.match(/^\/courseLessonProgresses\/([^/]+)$/);
  if (method === 'PUT' && progressMatch) {
    const id = progressMatch[1];
    updateStore((s) => ({
      ...s,
      lessonProgress: s.lessonProgress.map((lp) => (lp.id === id ? { ...lp, ...body } : lp))
    }));
    return { success: true, data: getSeedStore().lessonProgress.find((lp) => lp.id === id), updatedBy: requestedBy() };
  }

  // ─── User Courses ────────────────────────────────────────
  if (method === 'GET' && path === '/userCourses') {
    let items = [...store.userCourses];
    if (params.userId) items = items.filter((uc) => uc.userId === params.userId);
    if (params.courseId) items = items.filter((uc) => uc.courseId === params.courseId);
    return success(items);
  }

  const userCourseMatch = path.match(/^\/userCourses\/([^/]+)$/);
  if (method === 'GET' && userCourseMatch && !path.includes('toggle')) {
    return success(store.userCourses.find((uc) => uc.id === userCourseMatch[1]));
  }

  const toggleTriggerMatch = path.match(/^\/userCourses\/([^/]+)\/toggle-trigger$/);
  if (method === 'PATCH' && toggleTriggerMatch) {
    const id = toggleTriggerMatch[1];
    updateStore((s) => ({
      ...s,
      userCourses: s.userCourses.map((uc) =>
        uc.id === id ? { ...uc, triggerCourse: body.triggerCourse } : uc
      )
    }));
    return { success: true, data: getSeedStore().userCourses.find((uc) => uc.id === id), updatedBy: requestedBy() };
  }

  // ─── Groups (modern) ─────────────────────────────────────
  if (method === 'GET' && path === '/groups/get-groups') {
    let items = store.groups.map(enrichGroup);
    if (params.groupLeaderId) items = items.filter((g) => g.leaderId === params.groupLeaderId);
    if (currentUser?.role === 'groupLeader') {
      items = items.filter((g) => g.leaderId === currentUser.id);
    } else if (currentUser?.role === 'contributor') {
      items = items.filter((g) => {
        const company = store.companies.find((c) => c.id === g.companyId);
        return company?.contributorId === currentUser.id;
      });
    }
    if (params.name) items = items.filter((g) => g.name.toLowerCase().includes(params.name.toLowerCase()));
    if (params.companyId) items = items.filter((g) => g.companyId === params.companyId);
    const paged = paginate(items, params.page, params.limit);
    return { success: true, ...paged, requestedBy: requestedBy() };
  }

  const groupMembersMatch = path.match(/^\/groups\/([^/]+)\/members$/);
  if (method === 'GET' && groupMembersMatch) {
    const raw = store.groupMembers[groupMembersMatch[1]] || [];
    const members = raw.map((m) => ({
      ...m,
      id: m.userId || m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      role: m.role || 'subscriber'
    }));
    return { success: true, data: members, count: members.length, requestedBy: requestedBy() };
  }

  const companyGroupsMatch = path.match(/^\/groups\/company\/([^/]+)$/);
  if (method === 'GET' && companyGroupsMatch) {
    const items = store.groups.filter((g) => g.companyId === companyGroupsMatch[1]);
    return { success: true, data: items, count: items.length, requestedBy: requestedBy() };
  }

  if (method === 'POST' && path === '/groups/with-leader') {
    const id = createId('group');
    const newGroup = { id, isActive: true, memberCount: 1, ...body };
    updateStore((s) => ({
      ...s,
      groups: [...s.groups, newGroup],
      groupMembers: { ...s.groupMembers, [id]: [] }
    }));
    return { success: true, data: newGroup, message: 'Group created', createdBy: requestedBy() };
  }

  const groupStatusMatch = path.match(/^\/groups\/([^/]+)\/status$/);
  if (method === 'PATCH' && groupStatusMatch) {
    const id = groupStatusMatch[1];
    updateStore((s) => ({
      ...s,
      groups: s.groups.map((g) => (g.id === id ? { ...g, isActive: !g.isActive } : g))
    }));
    return { success: true, data: getSeedStore().groups.find((g) => g.id === id), updatedBy: requestedBy() };
  }

  const groupDeleteMatch = path.match(/^\/groups\/([^/]+)$/);
  if (method === 'DELETE' && groupDeleteMatch && !groupDeleteMatch[1].includes('members')) {
    const id = groupDeleteMatch[1];
    updateStore((s) => {
      const { [id]: _, ...restMembers } = s.groupMembers;
      return { ...s, groups: s.groups.filter((g) => g.id !== id), groupMembers: restMembers };
    });
    return { success: true, message: 'Group deleted', deletedBy: requestedBy() };
  }

  const groupNewMemberMatch = path.match(/^\/groups\/([^/]+)\/members\/new$/);
  if (method === 'POST' && groupNewMemberMatch) {
    const groupId = groupNewMemberMatch[1];
    const newUser = { id: createId('user'), isActive: true, ...body };
    const member = { id: createId('gm'), userId: newUser.id, groupId, role: body.role || 'subscriber', ...body };
    updateStore((s) => ({
      ...s,
      users: [...s.users, newUser],
      groupMembers: { ...s.groupMembers, [groupId]: [...(s.groupMembers[groupId] || []), member] }
    }));
    return { success: true, data: { user: newUser, groupUser: member }, createdBy: requestedBy() };
  }

  const groupBulkMatch = path.match(/^\/groups\/([^/]+)\/members\/bulk$/);
  if (method === 'POST' && groupBulkMatch) {
    const created = (body.users || []).map((u) => ({
      user: {
        email: u.email,
        firstName: u.firstName || u.firstname || 'New',
        lastName: u.lastName || u.lastname || 'Member',
        id: createId('user')
      }
    }));
    return { success: true, message: 'Members added', data: { created, errors: [] }, createdBy: requestedBy() };
  }

  if (method === 'POST' && groupMembersMatch) {
    const groupId = groupMembersMatch[1];
    const member = { id: createId('gm'), groupId, ...body };
    updateStore((s) => ({
      ...s,
      groupMembers: { ...s.groupMembers, [groupId]: [...(s.groupMembers[groupId] || []), member] }
    }));
    return { success: true, data: member, createdBy: requestedBy() };
  }

  const removeMemberMatch = path.match(/^\/groups\/([^/]+)\/members\/([^/]+)$/);
  if (method === 'DELETE' && removeMemberMatch) {
    const [groupId, userId] = [removeMemberMatch[1], removeMemberMatch[2]];
    updateStore((s) => ({
      ...s,
      groupMembers: {
        ...s.groupMembers,
        [groupId]: (s.groupMembers[groupId] || []).filter((m) => m.userId !== userId)
      }
    }));
    return { success: true, message: 'Member removed', deletedBy: requestedBy() };
  }

  // ─── Groups (legacy) ─────────────────────────────────────
  if (method === 'GET' && path === '/groups/all') {
    return { groups: store.groups.map(enrichGroup) };
  }

  const groupsByEmailMatch = path.match(/^\/groups\/all\/(.+)$/);
  if (method === 'GET' && groupsByEmailMatch) {
    const email = decodeURIComponent(groupsByEmailMatch[1]);
    const user = store.users.find((u) => u.email === email);
    let groups = store.groups.map(enrichGroup);
    if (user?.role === 'groupLeader') groups = groups.filter((g) => g.leaderId === user.id);
    else if (user?.groupId) groups = groups.filter((g) => g.id === user.groupId);
    else if (user?.role === 'contributor') {
      const companyIds = store.companies.filter((c) => c.contributorId === user.id).map((c) => c.id);
      groups = groups.filter((g) => companyIds.includes(g.companyId));
    }
    return { groups };
  }

  const groupIdLegacyMatch = path.match(/^\/groups\/([^/]+)\/groupid$/);
  if (method === 'GET' && groupIdLegacyMatch) {
    const userId = groupIdLegacyMatch[1];
    const leaderGroups = store.groups.filter((g) => g.leaderId === userId || g.leaderId === currentUser?.id);
    const ids = leaderGroups.length ? leaderGroups.map((g) => g.id) : store.groups.slice(0, 1).map((g) => g.id);
    return { group_id: ids };
  }

  if (method === 'POST' && path === '/groups/group/details') {
    const ids = Array.isArray(body.group_id) ? body.group_id : body.group_id ? [body.group_id] : [];
    const groups = ids.length
      ? store.groups.filter((g) => ids.includes(g.id)).map(enrichGroup)
      : store.groups.map(enrichGroup);
    return { groups };
  }

  if (method === 'POST' && path === '/groups/group/delete') {
    updateStore((s) => ({ ...s, groups: s.groups.filter((g) => g.id !== body.group_id) }));
    return { success: true };
  }

  if (method === 'POST' && path === '/groups/group/deactivate') {
    updateStore((s) => ({
      ...s,
      groups: s.groups.map((g) => (g.id === body.group_id ? { ...g, isActive: false } : g))
    }));
    return { success: true, message: 'Group deactivated' };
  }

  if (method === 'POST' && path === '/groups/group/activate') {
    updateStore((s) => ({
      ...s,
      groups: s.groups.map((g) => (g.id === body.group_id ? { ...g, isActive: true } : g))
    }));
    return { success: true, message: 'Group activated' };
  }

  if (method === 'POST' && path === '/groups/groupleaders') {
    const leaders = store.groupleaders.filter((gl) => (body.group_ids || []).includes(gl.group_id));
    return { groupleaders: leaders };
  }

  if (method === 'POST' && path === '/groups/subscribers') {
    const subs = store.subscribers.filter((s) => (body.group_ids || []).includes(s.group_id));
    return { subscribers: subs };
  }

  const glByGroupMatch = path.match(/^\/groups\/([^/]+)\/groupleaders$/);
  if (method === 'GET' && glByGroupMatch) {
    return { groupleaders: store.groupleaders.filter((gl) => gl.group_id === glByGroupMatch[1]) };
  }

  const subByGroupMatch = path.match(/^\/groups\/([^/]+)\/subscribers$/);
  if (method === 'GET' && subByGroupMatch) {
    return { subscribers: store.subscribers.filter((s) => s.group_id === subByGroupMatch[1]) };
  }

  const gophishGroupMatch = path.match(/^\/gophish_groups\/([^/]+)$/);
  if (method === 'GET' && gophishGroupMatch) {
    const group = store.groups.find((g) => g.id === gophishGroupMatch[1]);
    return { gophish_groupid: group?.gophishGroupId || 1 };
  }

  // ─── Contributors / GroupLeaders / Subscribers (legacy) ──
  if (method === 'GET' && path === '/contributors/all') return { contributors: store.contributors };
  if (method === 'DELETE' && path === '/contributors/del') {
    updateStore((s) => ({ ...s, contributors: s.contributors.filter((c) => c.id !== body.id) }));
    return { success: true };
  }
  if (method === 'PUT' && path === '/contributors/update') return { success: true };
  if (method === 'POST' && path === '/contributors/add') {
    const c = { id: createId('contrib'), ...body };
    updateStore((s) => ({ ...s, contributors: [...s.contributors, c] }));
    return { success: true };
  }

  if (method === 'GET' && path === '/groupleaders/all') return { groupleaders: store.groupleaders };
  if (method === 'POST' && path === '/groupleaders/add') return { success: true, message: 'Group leader added' };
  if (method === 'PUT' && path === '/groupleaders/update') return { success: true };
  if (method === 'DELETE' && path === '/groupleaders/del') return { success: true };

  if (method === 'GET' && path === '/subscribers/all') return { subscribers: store.subscribers };
  if (method === 'POST' && path === '/subscribers/add') return { success: true, message: 'Subscriber added' };
  if (method === 'PUT' && path === '/subscribers/update') return { success: true };
  if (method === 'DELETE' && path === '/subscribers/del') return { success: true };

  // ─── Companies ───────────────────────────────────────────
  if (method === 'GET' && path === '/companies') {
    return success(store.companies);
  }

  const seatDashboardMatch = path.match(/^\/companies\/([^/]+)\/seat-dashboard$/);
  if (method === 'GET' && seatDashboardMatch) {
    const company = store.companies.find((c) => c.id === seatDashboardMatch[1]);
    return success(buildSeatDashboard(company, store, currentUser));
  }

  const assignSeatsMatch = path.match(/^\/companies\/([^/]+)\/assign-seats$/);
  if (method === 'POST' && assignSeatsMatch) {
    return success({ message: 'Seats assigned' });
  }

  if (method === 'POST' && path === '/companies') {
    const company = { id: createId('company'), isActive: true, ...body };
    updateStore((s) => ({ ...s, companies: [...s.companies, company] }));
    return success(company);
  }

  const companyMatch = path.match(/^\/companies\/([^/]+)$/);
  if (method === 'PUT' && companyMatch) {
    const id = companyMatch[1];
    updateStore((s) => ({
      ...s,
      companies: s.companies.map((c) => (c.id === id ? { ...c, ...body.companyData || body } : c))
    }));
    return success(getSeedStore().companies.find((c) => c.id === id));
  }

  if (method === 'DELETE' && companyMatch) {
    updateStore((s) => ({ ...s, companies: s.companies.filter((c) => c.id !== companyMatch[1]) }));
    return success(null);
  }

  // ─── Bundles ─────────────────────────────────────────────
  if (method === 'GET' && path === '/bundles') {
    let items = store.bundles.map((b) => enrichBundle(b, store));
    if (params.title) items = items.filter((b) => (b.title || b.bundleName || '').toLowerCase().includes(params.title.toLowerCase()));
    return success(items);
  }

  const bundleMatch = path.match(/^\/bundles\/([^/]+)$/);
  if (method === 'GET' && bundleMatch && !path.includes('/exists')) {
    const bundleId = decodeURIComponent(bundleMatch[1]).trim();
    const bundle = store.bundles.find((b) => b.id === bundleId);
    return success(enrichBundle(bundle, store));
  }

  const bundleExistsMatch = path.match(/^\/bundles\/([^/]+)\/exists$/);
  if (method === 'GET' && bundleExistsMatch) {
    return { exists: store.bundles.some((b) => b.id === bundleExistsMatch[1]) };
  }

  if (method === 'POST' && path === '/bundles') {
    const bundle = { id: createId('bundle'), ...body };
    updateStore((s) => ({ ...s, bundles: [...s.bundles, bundle] }));
    return success(bundle);
  }

  if (method === 'PUT' && bundleMatch) {
    const id = decodeURIComponent(bundleMatch[1]).trim();
    updateStore((s) => ({
      ...s,
      bundles: s.bundles.map((b) => (b.id === id ? { ...b, ...body.payload || body } : b))
    }));
    return success(enrichBundle(getSeedStore().bundles.find((b) => b.id === id), getSeedStore()));
  }

  if (method === 'DELETE' && bundleMatch) {
    updateStore((s) => ({ ...s, bundles: s.bundles.filter((b) => b.id !== bundleMatch[1]) }));
    return { success: true, message: 'Bundle deleted' };
  }

  if (method === 'GET' && (path === '/groupBundles' || path === '/groupBundles/')) {
    const items = store.groupBundles.filter((gb) => !params.groupId || gb.groupId === params.groupId);
    return { success: true, data: items, pagination: { total: items.length }, requestedBy: requestedBy() };
  }

  // ─── Bundle Purchases & Invoices ─────────────────────────
  if (method === 'GET' && path === '/bundlePurchases') {
    const paged = paginate(store.bundlePurchases, params.page, params.limit);
    return { success: true, ...paged, requestedBy: requestedBy() };
  }

  const bpMatch = path.match(/^\/bundlePurchases\/([^/]+)$/);
  if (method === 'GET' && bpMatch) {
    const item = enrichBundlePurchase(store.bundlePurchases.find((bp) => bp.id === bpMatch[1]), store);
    return { success: true, data: item, requestedBy: requestedBy() };
  }

  const bpAltMatch = path.match(/^\/bundle-purchases\/([^/]+)$/);
  if (method === 'GET' && bpAltMatch) {
    return success(store.bundlePurchases.find((bp) => bp.id === bpAltMatch[1]));
  }

  if (method === 'GET' && path === '/bundlePurchases/invoices') {
    let items = enrichInvoicesForList(store);
    if (params.status) {
      const status = params.status.toLowerCase();
      items = items.filter((i) => i.status?.toLowerCase() === status || (status === 'unpaid' && i.status === 'pending'));
    }
    const paged = paginate(items, params.page, params.limit);
    const statusCounts = {
      all: store.invoices.length,
      paid: store.invoices.filter((i) => i.status === 'paid').length,
      pending: store.invoices.filter((i) => i.status === 'pending').length,
      unpaid: store.invoices.filter((i) => i.status === 'pending' || i.status === 'unpaid').length,
      cancelled: store.invoices.filter((i) => i.status === 'cancelled').length
    };
    return { success: true, ...paged, statusCounts, requestedBy: requestedBy() };
  }

  if (method === 'GET' && path === '/bundlePurchases/invoices/summary') {
    return {
      widgetData: buildInvoiceWidgetData(store),
      receivables: buildReceivablesSummary(store),
      requestedBy: requestedBy()
    };
  }

  if (method === 'POST' && path === '/bundlePurchases') {
    const purchase = { id: createId('bp'), status: 'active', createdAt: new Date().toISOString(), ...body };
    const invoice = {
      id: createId('inv'),
      invoiceNumber: `INV-2025-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      status: 'pending',
      bundlePurchaseId: purchase.id,
      amount: 999.0,
      createdAt: new Date().toISOString()
    };
    updateStore((s) => ({
      ...s,
      bundlePurchases: [...s.bundlePurchases, purchase],
      invoices: [...s.invoices, invoice]
    }));
    return { success: true, data: { invoices: [{ invoiceNumber: invoice.invoiceNumber, status: invoice.status }] } };
  }

  if (method === 'PUT' && bpAltMatch) {
    return success(getSeedStore().bundlePurchases.find((bp) => bp.id === bpAltMatch[1]));
  }

  if (method === 'DELETE' && bpAltMatch) {
    updateStore((s) => ({ ...s, bundlePurchases: s.bundlePurchases.filter((bp) => bp.id !== bpAltMatch[1]) }));
    return { success: true };
  }

  const invoiceUpdateMatch = path.match(/^\/bundlePurchases\/invoices\/([^/]+)$/);
  if (method === 'PUT' && invoiceUpdateMatch) {
    return success(getSeedStore().invoices.find((i) => i.id === invoiceUpdateMatch[1]));
  }

  if (method === 'POST' && path === '/bundlePurchases/invoices') {
    const invoice = { id: createId('inv'), status: 'pending', createdAt: new Date().toISOString(), ...body };
    updateStore((s) => ({ ...s, invoices: [...s.invoices, invoice] }));
    return success(invoice);
  }

  // ─── Discounts ───────────────────────────────────────────
  if (method === 'GET' && path === '/discounts') {
    let items = [...store.discounts];
    if (params.bundleId) items = items.filter((d) => d.bundleId === params.bundleId);
    return success(items);
  }

  if (method === 'GET' && path === '/discounts/get') {
    return { data: store.discounts };
  }

  if (method === 'POST' && path === '/discounts/getdiscount') {
    const disc = store.discounts.find((d) => d.resource_id === body.resource_id);
    return { success: true, data: { percentage: disc?.percentage || 0 } };
  }

  if (method === 'GET' && path === '/seats_discounts/get') {
    return { success: true, data: store.seatsDiscounts };
  }

  const discountMatch = path.match(/^\/discounts\/([^/]+)$/);
  if (method === 'GET' && discountMatch) return success(store.discounts.find((d) => d.id === discountMatch[1]));
  if (method === 'POST' && path === '/discounts') {
    const disc = { id: createId('disc'), ...body };
    updateStore((s) => ({ ...s, discounts: [...s.discounts, disc] }));
    return success(disc);
  }
  if (method === 'PUT' && discountMatch) return success(store.discounts.find((d) => d.id === discountMatch[1]));
  if (method === 'DELETE' && discountMatch) {
    updateStore((s) => ({ ...s, discounts: s.discounts.filter((d) => d.id !== discountMatch[1]) }));
    return { success: true };
  }

  // ─── Dashboard ───────────────────────────────────────────
  if (method === 'GET' && path === '/dashboard/summary') {
    return success({
      registrations: 156,
      expirations: 12,
      groups: store.groups.length,
      totalReceivables: store.invoices.reduce((s, i) => s + (i.status === 'pending' ? i.amount : 0), 0)
    });
  }

  if (method === 'GET' && path === '/dashboard/subscription-stats') {
    return success({
      totalPurchased: 370,
      totalAllocated: 263,
      utilizationPercentage: 71,
      chartData: [45, 52, 61, 58, 71]
    });
  }

  if (method === 'GET' && path === '/dashboard/enrollment-rate') {
    return success({
      bundles: store.bundles.map((b) => ({
        bundleId: b.id,
        bundleName: b.title || b.bundleName,
        enrollmentCount: Math.floor(Math.random() * 50) + 20
      }))
    });
  }

  if (method === 'GET' && path === '/dashboard/abandonment-rates') {
    return success({ sent: 200, accepted: 165, active: 142, percentage: 71 });
  }

  if (method === 'GET' && path === '/dashboard/completion-rate') {
    return success({
      pending: { dates: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], values: [12, 15, 10, 8, 6] },
      active: { dates: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], values: [45, 52, 48, 55, 50] },
      completed: { dates: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], values: [30, 35, 42, 48, 55] },
      expired: { dates: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], values: [5, 4, 6, 3, 2] }
    });
  }

  if (method === 'GET' && path === '/dashboard/engagement-rate') {
    return success({
      groups: store.groups.map((g, i) => ({
        groupId: g.id,
        groupName: g.name,
        orgName: g.companyName,
        order: i + 1,
        engagementScore: 85 - i * 12
      }))
    });
  }

  // ─── Reporting ───────────────────────────────────────────
  if (method === 'POST' && path === '/users_report/all') {
    return { status: 200, data: { all_group_users_stats: buildUserReportStats(store) } };
  }

  if (method === 'POST' && (path === '/users_report//all-by-group-leader' || path === '/users_report/all-by-group-leader')) {
    return { status: 200, data: { all_group_users_stats: buildUserReportStats(store) } };
  }

  if (method === 'POST' && path === '/modules_report/all') {
    return { status: 200, data: buildModuleReportData(store) };
  }

  if (method === 'POST' && (path === '/modules_report/stats' || path === '/modules_report/stats-by-group-leader')) {
    return { status: 200, data: store.moduleReportStats };
  }

  if (method === 'POST' && path === '/modules_report/all-by-group-leader') {
    return { status: 200, data: buildModuleReportData(store) };
  }

  // ─── Categories ──────────────────────────────────────────
  if (method === 'GET' && path === '/categories/all') {
    return { data: store.categories };
  }

  if (method === 'POST' && path === '/categories/add') {
    const cat = { id: createId('cat'), name: body.name || body };
    updateStore((s) => ({ ...s, categories: [...s.categories, cat] }));
    return { data: cat };
  }

  const categoryMatch = path.match(/^\/categories\/([^/]+)$/);
  if (method === 'PUT' && categoryMatch) return { success: true };
  if (method === 'DELETE' && categoryMatch) {
    updateStore((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== categoryMatch[1]) }));
    return { success: true };
  }

  // ─── Email Templates ─────────────────────────────────────
  if (method === 'GET' && path === '/emailTemplates') return success(store.emailTemplates);
  if (method === 'GET' && path === '/emailTemplates/invoice-templates') {
    return success(store.emailTemplates.filter((t) => t.type === 'invoice'));
  }
  if (method === 'GET' && path === '/emailTemplates/types') return success(['welcome', 'reminder', 'invoice']);

  const etMatch = path.match(/^\/emailTemplates\/([^/]+)$/);
  if (method === 'GET' && etMatch) return success(store.emailTemplates.find((t) => t.id === etMatch[1]));
  if (method === 'POST' && path === '/emailTemplates') {
    const t = { id: createId('et'), isActive: true, ...body };
    updateStore((s) => ({ ...s, emailTemplates: [...s.emailTemplates, t] }));
    return success(t);
  }
  if (method === 'PUT' && etMatch) return success(store.emailTemplates.find((t) => t.id === etMatch[1]));
  if (method === 'DELETE' && etMatch) {
    updateStore((s) => ({ ...s, emailTemplates: s.emailTemplates.filter((t) => t.id !== etMatch[1]) }));
    return { success: true };
  }
  if (method === 'POST' && path === '/emailTemplates/custom-invoice-template') return success({ message: 'Template saved' });

  // Legacy email templates
  if (method === 'GET' && path === '/email_template/all') return { data: store.emailTemplates };
  const etLegacyMatch = path.match(/^\/email_template\/get\/([^/]+)$/);
  if (method === 'GET' && etLegacyMatch) return { data: store.emailTemplates.find((t) => t.id === etLegacyMatch[1]) };
  if (method === 'POST' && path === '/email_template/add') return { success: true };
  const etLegacyUpdate = path.match(/^\/email_template\/update\/([^/]+)$/);
  if (method === 'PUT' && etLegacyUpdate) return { success: true };
  const etLegacyDelete = path.match(/^\/email_template\/delete\/([^/]+)$/);
  if (method === 'DELETE' && etLegacyDelete) return { success: true };

  // ─── Helpdesk ────────────────────────────────────────────
  if (method === 'GET' && path === '/helpdesk/categories') {
    return { data: store.helpdeskCategories };
  }

  if (method === 'GET' && path === '/helpdesk/tickets') {
    let tickets = [...store.helpdeskTickets];
    if (currentUser?.role === 'subscriber') tickets = tickets.filter((t) => t.createdBy === currentUser.id);
    const enriched = enrichTickets(tickets, store);
    return {
      data: enriched,
      tickets: enriched,
      pagination: { total: enriched.length, page: 1, limit: 20 }
    };
  }

  const ticketMatch = path.match(/^\/helpdesk\/tickets\/([^/]+)$/);
  if (method === 'GET' && ticketMatch && !path.includes('/reply') && !path.includes('/replies') && !path.includes('/close')) {
    const raw = store.helpdeskTickets.find((t) => t.id === ticketMatch[1]);
    if (!raw) return { data: null };
    return { data: enrichTicket(raw, store) };
  }

  if (method === 'POST' && path === '/helpdesk/tickets') {
    const ticket = {
      id: createId('ticket'),
      status: 'open',
      createdBy: currentUser?.id,
      createdByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Demo User',
      createdAt: new Date().toISOString(),
      replies: [],
      attachments: [],
      ...body
    };
    updateStore((s) => ({ ...s, helpdeskTickets: [ticket, ...s.helpdeskTickets] }));
    return ticket;
  }

  const ticketReplyMatch = path.match(/^\/helpdesk\/tickets\/([^/]+)\/reply$/);
  if (method === 'POST' && ticketReplyMatch) {
    const ticketId = ticketReplyMatch[1];
    const reply = {
      id: createId('reply'),
      message: body.message,
      authorId: currentUser?.id,
      authorName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Agent',
      createdAt: new Date().toISOString(),
      attachments: []
    };
    updateStore((s) => ({
      ...s,
      helpdeskTickets: s.helpdeskTickets.map((t) =>
        t.id === ticketId ? { ...t, replies: [...(t.replies || []), reply] } : t
      )
    }));
    return reply;
  }

  const ticketCloseMatch = path.match(/^\/helpdesk\/tickets\/([^/]+)\/close$/);
  if (method === 'PATCH' && ticketCloseMatch) {
    updateStore((s) => ({
      ...s,
      helpdeskTickets: s.helpdeskTickets.map((t) =>
        t.id === ticketCloseMatch[1] ? { ...t, status: 'closed' } : t
      )
    }));
    return { success: true };
  }

  if (method === 'DELETE' && ticketMatch) {
    updateStore((s) => ({ ...s, helpdeskTickets: s.helpdeskTickets.filter((t) => t.id !== ticketMatch[1]) }));
    return { success: true };
  }

  const replyDeleteMatch = path.match(/^\/helpdesk\/tickets\/([^/]+)\/replies\/([^/]+)$/);
  if (method === 'DELETE' && replyDeleteMatch) return { success: true };

  if (method === 'GET' && path === '/helpdesk/stats') {
    return { data: buildHelpdeskStats(store) };
  }

  if (method === 'GET' && path === '/helpdesk/dashboard') {
    return { data: buildHelpdeskDashboardCards(store) };
  }

  // ─── Attack Simulations ──────────────────────────────────
  if (method === 'GET' && path === '/attackSimulations') return success(store.attackSimulations);
  const asMatch = path.match(/^\/attackSimulations\/([^/]+)$/);
  if (method === 'GET' && asMatch) return success(store.attackSimulations.find((a) => a.id === asMatch[1]));
  if (method === 'POST' && path === '/attackSimulations') {
    const item = { id: createId('as'), ...body };
    updateStore((s) => ({ ...s, attackSimulations: [...s.attackSimulations, item] }));
    return success(item);
  }
  if (method === 'DELETE' && asMatch) {
    updateStore((s) => ({ ...s, attackSimulations: s.attackSimulations.filter((a) => a.id !== asMatch[1]) }));
    return { success: true };
  }

  if (method === 'GET' && path === '/scheduleAttackSimulations') return success(store.scheduleAttackSimulations);
  const sasMatch = path.match(/^\/scheduleAttackSimulations\/([^/]+)$/);
  if (method === 'GET' && sasMatch) return success(store.scheduleAttackSimulations.find((a) => a.id === sasMatch[1]));
  if (method === 'POST' && path === '/scheduleAttackSimulations') {
    const item = { id: createId('sas'), status: 'active', ...body };
    updateStore((s) => ({ ...s, scheduleAttackSimulations: [...s.scheduleAttackSimulations, item] }));
    return success(item);
  }
  if (method === 'DELETE' && sasMatch) {
    updateStore((s) => ({ ...s, scheduleAttackSimulations: s.scheduleAttackSimulations.filter((a) => a.id !== sasMatch[1]) }));
    return { success: true };
  }

  if (method === 'GET' && path === '/campaigns/all') return store.campaigns;
  if (method === 'GET' && path === '/campaigns/launching-campaigns-by-group') {
    const items = store.scheduleAttackSimulations.filter((c) => !params.groupId || c.groupIds?.includes(params.groupId));
    return { data: items };
  }

  // ─── Brand Settings ──────────────────────────────────────
  if (method === 'GET' && path === '/brand-settings') return success(store.brandSettings);
  if (method === 'PUT' && path === '/brand-settings') {
    updateStore((s) => ({ ...s, brandSettings: { ...s.brandSettings, updatedAt: new Date().toISOString() } }));
    return success(getSeedStore().brandSettings);
  }

  // ─── Template boilerplate (utils/axios) ──────────────────
  if (method === 'GET' && path === '/api/menu/dashboard') {
    return { dashboard: [] };
  }

  if (method === 'GET' && path === '/api/invoice/list') {
    return { invoice: store.invoices.map((i) => ({ id: i.id, invoiceNumber: i.invoiceNumber, status: i.status, amount: i.amount })) };
  }

  if (method === 'GET' && path === '/api/account/me') {
    const user = getCurrentUser() || store.users[0];
    return { user };
  }

  if (method === 'POST' && path === '/api/account/login') {
    const user = store.users.find((u) => u.email === body.email);
    return { serviceToken: createFakeToken(user?.id), user };
  }

  // ─── GoPhish API (via global axios/fetch) ────────────────
  const gophishResult = handleGophish(method, path, body, store);
  if (gophishResult !== null) return gophishResult;

  console.warn(`[Mock] Unhandled ${method} ${path}`);
  return { success: true, data: [] };
}

function handleGophish(method, path, body, store) {
  if (path === '/api/groups/' && method === 'POST') {
    const id = store.gophishGroups.length + 1;
    const group = { id, ...body };
    return group;
  }

  const gpGroupMatch = path.match(/^\/api\/groups\/(\d+)\/?$/);
  if (gpGroupMatch) {
    const id = Number(gpGroupMatch[1]);
    const group = store.gophishGroups.find((g) => g.id === id) || store.gophishGroups[0];
    if (method === 'GET') return group;
    if (method === 'PUT') return { ...group, ...body };
    if (method === 'DELETE') return {};
  }

  if (path === '/api/templates/' && method === 'GET') return store.gophishTemplates;
  if (path === '/api/pages/' && method === 'GET') return store.gophishPages;
  if (path === '/api/smtp/' && method === 'GET') return store.gophishSmtp;
  if (path === '/api/campaigns/summary/' && method === 'GET') {
    const email = currentUser?.email || '';
    return buildGophishCampaigns(store, email);
  }
  if (path === '/api/campaigns/' && method === 'POST') return { id: Date.now(), ...body };

  const gpCampaignMatch = path.match(/^\/api\/campaigns\/(\d+)\/?$/);
  if (method === 'GET' && gpCampaignMatch) {
    return store.gophishCampaigns.find((c) => c.id === Number(gpCampaignMatch[1])) || store.gophishCampaigns[0];
  }

  return null;
}

function createFakeToken(userId) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 86400 * 30 }));
  return `${header}.${payload}.demo-signature`;
}
