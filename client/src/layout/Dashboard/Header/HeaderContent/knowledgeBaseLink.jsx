import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Book, Information } from 'iconsax-react';
import { useAuth } from 'contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function KnowledgeBaseLink() {
    const { userRole } = useAuth();
    const navigate = useNavigate();

    // Map roles → dashboards
    const roleDashboardMap = {
        admin: 'dashboard',
        contributor: 'contrib_dashboard',
        groupLeader: 'groupleader_dashboard',
        subscriber: 'subscriber_dashboard',
        supportAgent: 'support_dashboard'
    };

    const dashboardPath = roleDashboardMap[userRole] || 'dashboard';

    const handleNavigate = () => {
        navigate(`/${dashboardPath}/knowledge`);
    };

    return (
        <Tooltip title="Knowledge Base">
            <IconButton
                onClick={handleNavigate}
                size="large"
                color="primary"
                sx={{
                    p: 1.2,
                    borderRadius: 2,
                    '&:hover': { bgcolor: 'secondary.light' }
                }}
            >
                <Information size="22" />
            </IconButton>
        </Tooltip>
    );
}
