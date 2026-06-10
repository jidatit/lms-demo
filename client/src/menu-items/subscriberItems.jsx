
import { FormattedMessage } from 'react-intl';

import { Activity, UserSquare, Fatrows, Profile2User, Security, Information } from 'iconsax-react';

// icons
const icons = {
  dashboard: Activity,
  groups: Profile2User,
  myLearning: Security,
  knowledgebase: Information,
  reporting: Fatrows,
  profile: UserSquare,
};

// ==============================|| MENU ITEMS - SAMPLE PAGE ||============================== //

const subscriberItems = {
  id: 'Staff  Dashboard',
  title: <FormattedMessage id="Employees Dashboard" />,
  type: 'group',
  children: [
    {
      id: 'myLearning',
      title: 'My Learning',
      type: 'item',
      url: '/subscriber_dashboard',
      icon: icons.myLearning
    },
    {
      id: 'knowledgebase',
      title: 'Knowledgebase',
      type: 'item',
      url: '/subscriber_dashboard/knwoledge',
      icon: icons.knowledgebase,
      hidden: true

    },
    {
      id: 'profile',
      title: <FormattedMessage id="Profile" />,
      type: 'item',
      // link: '/subscriber_dashboard/profiles/user/:tab',
      url: '/subscriber_dashboard/profile/user/personal',
      icon: icons.profile,
      hidden: true

    }
  ]
};

export default subscriberItems;
