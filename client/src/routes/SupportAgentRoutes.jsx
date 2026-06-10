
import UserProfile from 'pages/apps/profiles/user';
import UserTabPersonal from 'sections/apps/profiles/user/TabPersonal';
import UserTabPayment from 'sections/apps/profiles/user/TabPayment';
import UserTabPassword from 'sections/apps/profiles/user/TabPassword';
import UserTabSettings from 'sections/apps/profiles/user/TabSettings';

import HelpdeskDashboard from 'pages/helpdesk/dashboard';
import CreateTicket from 'pages/helpdesk/ticket/create-ticket';
import TicketList from 'pages/helpdesk/ticket/ticket-list';
import TicketDetails from 'pages/helpdesk/ticket/ticket-details';
import AgentLayout from 'layout/Dashboard/agentLayout';

const SupportAgentRoutes = {
    path: '/agent_dashboard',
    children: [
        {
            path: '',
            element: <AgentLayout />,
            children: [
                {
                    path: 'profile',
                    children: [
                        {
                            path: 'user',
                            element: <UserProfile />,
                            children: [
                                {
                                    path: 'personal',
                                    element: <UserTabPersonal />
                                },
                                {
                                    path: 'payment',
                                    element: <UserTabPayment />
                                },
                                {
                                    path: 'password',
                                    element: <UserTabPassword />
                                },
                                {
                                    path: 'settings',
                                    element: <UserTabSettings />
                                }
                            ]
                        }
                    ]
                },
                {
                    path: 'helpdesk',
                    children: [
                        {
                            path: 'dashboard',
                            element: <HelpdeskDashboard />
                        },
                        {
                            path: 'create-ticket',
                            element: <CreateTicket />
                        },
                        {
                            path: 'ticket-list',
                            element: <TicketList />
                        },
                        {
                            path: 'ticket-details/:id',
                            element: <TicketDetails />
                        },
                    ]
                }
            ]

        }

    ]
};
export default SupportAgentRoutes;
