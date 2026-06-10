import { Box, Typography, Button } from '@mui/material';
import { AddCircle } from 'iconsax-react';
import { FaUserPlus, FaBuilding, FaUsers } from 'react-icons/fa';

const EmptyStateBase = ({ icon, title, description, actionLabel, onAction }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                textAlign: 'center',
                p: 4,
            }}
        >
            <Box
                sx={{
                    fontSize: '64px',
                    color: 'text.secondary',
                    mb: 2,
                    opacity: 0.5,
                }}
            >
                {icon}
            </Box>
            <Typography variant="h5" gutterBottom color="text.primary">
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                {description}
            </Typography>
            {onAction && (
                <Button
                    variant="contained"
                    startIcon={<AddCircle />}
                    onClick={onAction}
                    sx={{ mt: 1 }}
                >
                    {actionLabel}
                </Button>
            )}
        </Box>
    );
};

export const EmptyPartners = ({ onAdd }) => (
    <EmptyStateBase
        icon={<FaUserPlus />}
        title="No Partners Yet"
        description="Start by adding your first partner to manage their Organizations and groups."
        actionLabel="Add Partner"
        onAction={onAdd}
    />
);

export const EmptyCompanies = ({ onAdd, role }) => (
    <EmptyStateBase
        icon={<FaBuilding />}
        title="No Organization Found"
        description={
            role === 'admin'
                ? 'No Organization found. Try selecting a different partner or add a new Organization.'
                : 'You haven\'t created any Organization yet. Start by adding your first Organization.'
        }
        actionLabel="Add Organization"
        onAction={onAdd}
    />
);

export const EmptyGroups = ({ onAdd, role }) => (
    <EmptyStateBase
        icon={<FaUsers />}
        title="No Groups Found"
        description={
            role === 'admin'
                ? 'No groups found for the selected filters. Try adjusting your filters or add a new group.'
                : role === 'contributor'
                    ? 'You haven\'t created any groups yet. Start by adding your first group.'
                    : 'You are not assigned to any groups yet. Contact your administrator.'
        }
        actionLabel={role !== 'groupLeader' ? 'Add Group' : null}
        onAction={role !== 'groupLeader' ? onAdd : null}
    />
);

export const EmptyGroupLeaders = ({ onAdd, role }) => (
    <EmptyStateBase
        icon={<FaUserPlus />}
        title="No Managers Found"
        description={
            role === 'admin'
                ? 'No Managers found for the selected filters. Try adjusting your filters or add Managers.'
                : role === 'contributor'
                    ? 'You haven\'t added any Manager yet. Start by adding your first group leader.'
                    : 'No other Managers found in your groups.'
        }
        actionLabel={role !== 'groupLeader' ? 'Add Managers' : null}
        onAction={role !== 'groupLeader' ? onAdd : null}
    />
);

export const EmptyStaff = ({ onAdd, role }) => (
    <EmptyStateBase
        icon={<FaUserPlus />}
        title="No Employees Found"
        description={
            role === 'admin'
                ? 'No Employees found for the selected filters. Try adjusting your filters or add Employees.'
                : 'You haven\'t added any Employees yet. Start by adding your first Employee.'
        }
        actionLabel="Add Employee"
        onAction={onAdd}
    />
);