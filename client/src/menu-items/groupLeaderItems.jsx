
import { FormattedMessage } from 'react-intl';

import { Activity, Fatrows, Buildings, I24Support, UserSquare, Profile2User, Story, Security, Information } from 'iconsax-react';

// icons
const icons = {
  dashboard: Activity,
  groups: Profile2User,
  myLearning: Security,
  knowledgebase: Information,
  reporting: Fatrows,
  campaignHub: Story,
  profile: UserSquare,
  helpdesk: I24Support,
  subscription: Buildings,
};

// ==============================|| MENU ITEMS - SAMPLE PAGE ||============================== //

const groupLeaderItems = {
  id: 'Manager Dashboard',
  title: <FormattedMessage id="Manager Dashboard" />,
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/groupleader_dashboard/home',
      icon: icons.dashboard
    },
    {
      id: 'reporting',
      title: 'Reporting',
      type: 'item',
      url: '/groupleader_dashboard/reporting',
      icon: icons.reporting
    },
    {
      id: 'campaign-hub',
      title: 'Campaign',
      type: 'item',
      url: '/groupleader_dashboard/campaigns',
      icon: icons.campaignHub
    },
    {
      id: 'knowledgebase',
      title: 'Knowledgebase',
      type: 'item',
      url: '/groupleader_dashboard/knowledge',
      icon: icons.knowledgebase,
      hidden: true
    },
    {
      id: 'subscription',
      title: <FormattedMessage id="Subscription" />,
      type: 'item',
      url: '/groupleader_dashboard/subscription',
      icon: icons.subscription
    },
    {
      id: 'groups',
      title: 'Groups',
      type: 'item',
      url: '/groupleader_dashboard/groups',
      icon: icons.groups,
      hidden: true
    },
    {
      id: 'myLearning',
      title: 'My Learning',
      type: 'item',
      url: '/groupleader_dashboard/courses',
      icon: icons.myLearning,
      hidden: true
    },
    {
      id: 'knowledgebase',
      title: 'Knowledgebase',
      type: 'item',
      url: '/groupleader_dashboard/knwoledge',
      icon: icons.knowledgebase,
      hidden: true
    },
    {
      id: 'profile',
      title: <FormattedMessage id="Profile" />,
      type: 'item',
      link: '/groupleader_dashboard/profiles/user/:tab',
      url: '/groupleader_dashboard/profile/user/personal',
      icon: icons.profile,
      hidden: true
    },
    {
      id: 'helpdesk',
      title: <FormattedMessage id="Helpdesk" />,
      type: 'item',
      icon: icons.helpdesk,
      url: '/groupleader_dashboard/helpdesk/ticket-list',
      hidden: true
    }
  ]
};

export default groupLeaderItems;
