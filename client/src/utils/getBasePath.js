export const getBasePath = (role) => {
  switch (role) {
    case 'subscriber':
      return '/subscriber_dashboard';
    case 'groupLeader':
      return '/groupleader_dashboard';
    case 'contributor':
      return '/contrib_dashboard';
    case 'supportAgent':
      return '/agent_dashboard';
    default:
      return '/dashboard';
  }
};
