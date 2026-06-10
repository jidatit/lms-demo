import { CiDiscount1 } from 'react-icons/ci';


import { FormattedMessage } from 'react-intl';
import { Activity, Fatrows, I24Support, UserSquare, Profile2User, Buildings, User, SmsEdit, Story, Bill, Security, ShoppingBag, ShoppingCart, DollarSquare, Information } from 'iconsax-react';


// icons
const icons = {
  dashboard: Activity,
  groups: Profile2User,
  users: Buildings,
  learningCenter: Security,
  campaignHub: Story,
  store: ShoppingBag,
  cart: ShoppingCart,
  discount: DollarSquare,
  knowledgebase: Information,
  reporting: Fatrows,
  invoice: Bill,
  profile: UserSquare,
  helpdesk: I24Support,
  companies: Buildings,

};

// ==============================|| MENU ITEMS - SAMPLE PAGE ||============================== //

const contributorItems = {
  id: 'Partner Dashboard',
  title: <FormattedMessage id="Partner Dashboard" />,
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/contrib_dashboard/home',
      icon: icons.dashboard
    },
    {
      id: 'reporting',
      title: 'Reporting',
      type: 'item',
      url: '/contrib_dashboard/reporting',
      icon: icons.reporting
    },
    {
      id: 'campaign-hub',
      title: 'Campaign',
      type: 'item',
      url: '/contrib_dashboard/campaigns',
      icon: icons.campaignHub
    },
    {
      id: 'subscription',
      title: <FormattedMessage id="Subscription" />,
      type: 'item',
      url: '/contrib_dashboard/subscription',
      icon: icons.companies
    },
    {
      id: 'groups',
      title: 'Groups',
      type: 'item',
      url: '/contrib_dashboard/groups',
      icon: icons.groups,
      hidden: true
    },
    {
      id: 'companies',
      title: <FormattedMessage id="Customers" />,
      type: 'item',
      url: '/contrib_dashboard/companies',
      icon: icons.users,
      hidden: true
    },
    {
      id: 'knowledgebase',
      title: 'Knowledgebase',
      type: 'item',
      url: '/contrib_dashboard/knowledge',
      icon: icons.knowledgebase,
      hidden: true
    },
    {
      id: 'profile',
      title: <FormattedMessage id="Profile" />,
      type: 'item',
      // link: '/contrib_dashboard/profiles/user/:tab',
      url: '/contrib_dashboard/profile/user/personal',
      icon: icons.profile,
      hidden: true

    },
    {
      id: 'helpdesk',
      title: <FormattedMessage id="Helpdesk" />,
      type: 'item',
      icon: icons.helpdesk,
      url: '/contrib_dashboard/helpdesk/ticket-list',
      hidden: true
    }
  ]
};
export const contributorLicense = {
  id: 'LICENSES & BILLING',
  title: 'LICENSES & BILLING',
  icon: icons.widgets,
  type: 'group',
  children: [
    {
      id: 'store',
      title: <FormattedMessage id="store" />,
      type: 'item',
      url: '/contrib_dashboard/buy_new_license',
      icon: icons.store
    },
    {
      id: 'cart',
      title: <FormattedMessage id="Cart" />,
      type: 'item',
      url: '/contrib_dashboard/mybundlecart',
      icon: icons.cart
    },
    {
      id: 'invoice',
      title: 'Billing',
      type: 'item',
      url: '/contrib_dashboard/invoices',
      icon: icons.invoice
    },
  ]
};
export default contributorItems;
