// components/DashboardStats.jsx

import { useMemo } from 'react';
import PropTypes from 'prop-types';

// material-ui
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

// project-imports

// iconsax icons
import { Buildings2, People, Profile2User, UserOctagon, TicketDiscount } from 'iconsax-react';
import RoundIconCard from './statistics/RoundIconCard';
import { useGetDashboardStats } from 'api/queries/users';

// ============================|| DASHBOARD STATISTICS CARDS ||============================ //

export default function DashboardStats() {
    const { data, isLoading, isError } = useGetDashboardStats();

    const statsConfig = useMemo(() => {
        if (!data?.data?.stats) return [];

        const { role, stats } = data.data;

        // Admin stats configuration
        if (role === 'admin') {
            return [
                {
                    primary: 'Partners',
                    secondary: stats.partners?.toString() || '0',
                    content: 'Total Contributors',
                    iconPrimary: UserOctagon,
                    color: 'primary.main',
                    bgcolor: 'primary.lighter'
                },
                {
                    primary: 'Organizations',
                    secondary: stats.organizations?.toString() || '0',
                    content: 'Total Companies',
                    iconPrimary: Buildings2,
                    color: 'success.main',
                    bgcolor: 'success.lighter'
                },
                {
                    primary: 'Groups',
                    secondary: stats.groups?.toString() || '0',
                    content: 'All Groups',
                    iconPrimary: Profile2User,
                    color: 'warning.main',
                    bgcolor: 'warning.lighter'
                },
                {
                    primary: 'Users',
                    secondary: stats.users?.toString() || '0',
                    content: 'Total Users',
                    iconPrimary: People,
                    color: 'error.main',
                    bgcolor: 'error.lighter'
                }
            ];
        }

        // Contributor stats configuration
        if (role === 'contributor') {
            return [
                {
                    primary: 'Organizations',
                    secondary: stats.organizations?.toString() || '0',
                    content: 'Your Companies',
                    iconPrimary: Buildings2,
                    color: 'success.main',
                    bgcolor: 'success.lighter'
                },
                {
                    primary: 'Groups',
                    secondary: stats.groups?.toString() || '0',
                    content: 'Company Groups',
                    iconPrimary: Profile2User,
                    color: 'warning.main',
                    bgcolor: 'warning.lighter'
                },
                {
                    primary: 'Users',
                    secondary: stats.users?.toString() || '0',
                    content: 'Total Members',
                    iconPrimary: People,
                    color: 'error.main',
                    bgcolor: 'error.lighter'
                },
                {
                    primary: 'Subscriptions',
                    secondary: stats.subscriptions?.display || '0/0',
                    content: `License Usage (${stats.subscriptions?.percentage || '0'}%)`,
                    iconPrimary: TicketDiscount,
                    color: 'primary.main',
                    bgcolor: 'primary.lighter'
                }
            ];
        }

        // Group Leader stats configuration
        if (role === 'groupLeader') {
            return [
                {
                    primary: 'Registrations',
                    secondary: stats.registrations?.toString() || '0',
                    content: 'Total Registrations',
                    iconPrimary: UserOctagon,
                    color: 'primary.main',
                    bgcolor: 'primary.lighter'
                },
                {
                    primary: 'Groups',
                    secondary: stats.groups?.toString() || '0',
                    content: 'Your Groups',
                    iconPrimary: Profile2User,
                    color: 'warning.main',
                    bgcolor: 'warning.lighter'
                },
                {
                    primary: 'Users',
                    secondary: stats.users?.toString() || '0',
                    content: 'Group Members',
                    iconPrimary: People,
                    color: 'error.main',
                    bgcolor: 'error.lighter'
                },
                {
                    primary: 'Subscriptions',
                    secondary: stats.subscriptions?.display || '0/0',
                    content: `License Usage (${stats.subscriptions?.percentage || '0'}%)`,
                    iconPrimary: TicketDiscount,
                    color: 'success.main',
                    bgcolor: 'success.lighter'
                }
            ];
        }

        return [];
    }, [data]);

    // Loading skeleton
    if (isLoading) {
        return (
            <Grid container spacing={3}>
                {[...Array(4)].map((_, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                        <Skeleton variant="rounded" height={140} sx={{ borderRadius: 2 }} />
                    </Grid>
                ))}
            </Grid>
        );
    }

    // Error state
    if (isError) {
        return null; // You can add error UI here if needed
    }

    // No data
    if (!statsConfig.length) {
        return null;
    }

    return (
        <Grid container spacing={3}>
            {statsConfig.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                    <RoundIconCard
                        primary={stat.primary}
                        secondary={stat.secondary}
                        content={stat.content}
                        iconPrimary={stat.iconPrimary}
                        color={stat.color}
                        bgcolor={stat.bgcolor}
                        avatarSize="lg"
                        circular={false}
                    />
                </Grid>
            ))}
        </Grid>
    );
}

DashboardStats.propTypes = {
    // No props needed as it handles everything internally
};