// This is example of menu item without group for horizontal layout. There will be no children.

// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Activity, Settings, I24Support, Buildings, KyberNetwork, Fatrows, Profile2User, UserSquare, User, SmsEdit, Story, Bill, Security, ShoppingBag, ShoppingCart, DollarSquare, Information, MoneyRecive } from 'iconsax-react';

// icons
const icons = {
  dashboard: Activity,
  groups: Profile2User,
  users: User,
  companies: Buildings,
  learningCenter: Security,
  campaignHub: Story,
  store: ShoppingBag,
  cart: ShoppingCart,
  discount: DollarSquare,
  knowledgebase: Information,
  reporting: Fatrows,
  email: SmsEdit,
  invoice: Bill,
  profile: UserSquare,
  applications: KyberNetwork,
  helpdesk: I24Support,
  settings: Settings,
  payment: MoneyRecive,
};

// ==============================|| MENU ITEMS - SAMPLE PAGE ||============================== //

const adminItems = {
  id: 'admin-dashboard',
  title: <FormattedMessage id="admin-dashboard" />,
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: <FormattedMessage id="dashboard" />,
      type: 'item',
      url: '/dashboard/home',
      icon: icons.dashboard
    },
    {
      id: 'reporting',
      title: <FormattedMessage id="reporting" />,
      type: 'item',
      url: '/dashboard/reporting',
      icon: icons.reporting
    },
    {
      id: 'campaign-hub',
      title: <FormattedMessage id="Campaign" />,
      type: 'item',
      url: '/dashboard/campaigns',
      icon: icons.campaignHub
    },
    {
      id: 'groups',
      title: 'Groups',
      type: 'item',
      url: '/dashboard/groups',
      icon: icons.groups,
      hidden: true
    },
    {
      id: 'learning-center',
      title: <FormattedMessage id="learning-center" />,
      type: 'item',
      url: '/dashboard/courses',
      icon: icons.learningCenter
    },
    {
      id: 'subscription',
      title: <FormattedMessage id="Subscription" />,
      type: 'item',
      url: '/dashboard/subscription',
      icon: icons.companies
    },
    {
      id: 'companies',
      title: <FormattedMessage id="Customers" />,
      type: 'item',
      url: '/dashboard/companies',
      icon: icons.companies,
      hidden: true,
    },
    {
      id: 'users',
      title: <FormattedMessage id="users" />,
      type: 'item',
      url: '/dashboard/all_users',
      icon: icons.users,
      hidden: true,
    },
    {
      id: 'store',
      title: <FormattedMessage id="store" />,
      type: 'item',
      url: '/dashboard/buy_new_license',
      icon: icons.store,
      hidden: true,
    },
    {
      id: 'cart',
      title: <FormattedMessage id="Bundle Cart" />,
      type: 'item',
      url: '/dashboard/mybundlecart',
      icon: icons.cart,
      hidden: true,
    },
    {
      id: 'discount',
      title: <FormattedMessage id="discount" />,
      type: 'item',
      url: '/dashboard/discounts',
      icon: icons.discount,
      hidden: true,
    },
    {
      id: 'Email Templates',
      title: <FormattedMessage id="Templates" />,
      type: 'item',
      url: '/dashboard/email_templates',
      icon: icons.email,
      hidden: true,
    },
    {
      id: 'invoice',
      title: 'Billing',
      type: 'item',
      url: '/dashboard/invoices',
      icon: icons.invoice,
      hidden: true,
    },
    {
      id: 'knowledgebase',
      title: <FormattedMessage id="knowledgebase" />,
      type: 'item',
      url: '/dashboard/knowledge',
      icon: icons.knowledgebase,
      hidden: true
    },
    {
      id: 'profile',
      title: <FormattedMessage id="Profile" />,
      type: 'item',
      // link: '/dashboard/profiles/user/:tab',
      url: '/dashboard/profile/user/personal',
      icon: icons.profile,
      hidden: true

    },
    {
      id: 'helpdesk',
      title: <FormattedMessage id="Helpdesk" />,
      type: 'item',
      url: '/dashboard/helpdesk/ticket-list',
      icon: icons.helpdesk,
      hidden: true
    }

  ]
};
export const license = {
  id: 'LICENSES & BILLING',
  title: 'LICENSES & BILLING',
  icon: icons.widgets,
  type: 'group',
  children: [
    {
      id: 'store',
      title: <FormattedMessage id="store" />,
      type: 'item',
      url: '/dashboard/buy_new_license',
      icon: icons.store
    },

    {
      id: 'cart',
      title: <FormattedMessage id="Cart" />,
      type: 'item',
      url: '/dashboard/mybundlecart',
      icon: icons.cart
    },
    {
      id: 'invoice',
      title: 'Billing',
      type: 'item',
      url: '/dashboard/invoices',
      icon: icons.invoice
    },
    {
      id: 'discount',
      title: <FormattedMessage id="discount" />,
      type: 'item',
      url: '/dashboard/discounts',
      icon: icons.discount
    },
  ]
};
export const settings = {
  id: 'PLATFORM SETTING',
  title: 'PLATFORM SETTING',
  icon: icons.widgets,
  type: 'group',
  children: [
    {
      id: 'users',
      title: <FormattedMessage id="users" />,
      type: 'item',
      url: '/dashboard/all_users',
      icon: icons.users,
      hidden: true
    },
    {
      id: 'brand-settings',
      title: <FormattedMessage id="Brand Settings" />,
      type: 'item',
      url: '/dashboard/brand_settings',
      icon: icons.settings
    },
    // {
    //   id: 'payment',
    //   title: <FormattedMessage id="Payment" />,
    //   type: 'item',
    //   url: '/dashboard/payment',
    //   icon: icons.payment
    // },
    {
      id: 'email-templates',
      title: <FormattedMessage id="Email Templates" />,
      type: 'item',
      url: '/dashboard/email_templates',
      icon: icons.email
    },
  ]
};

export default adminItems;
