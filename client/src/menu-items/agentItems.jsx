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
    email: SmsEdit,
    profile: UserSquare,
    helpdesk: I24Support

};

// ==============================|| MENU ITEMS - SAMPLE PAGE ||============================== //

const agentItems = {
    id: 'Agent Dashboard',
    title: <FormattedMessage id="Agent Dashboard" />,
    type: 'group',
    children: [
        {
            id: 'profile',
            title: <FormattedMessage id="Profile" />,
            type: 'item',
            // link: '/agent_dashboard/profile/user/:tab',
            url: '/agent_dashboard/profile/user/personal',
            icon: icons.profile,
            hidden: true
        },
        {
            id: 'helpdesk',
            title: <FormattedMessage id="Helpdesk" />,
            type: 'item',
            icon: icons.helpdesk,
            url: '/agent_dashboard/helpdesk/ticket-list',
        }
    ]
};
export default agentItems;
