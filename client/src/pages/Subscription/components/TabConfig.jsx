import { FaBook, FaUser, FaBox } from 'react-icons/fa';
import { MdGroupAdd } from 'react-icons/md';

/**
 * Centralized tab configuration for different user roles
 * Defines which tabs are visible and what filters are available for each tab
 */
export const TAB_CONFIG = {
    admin: {
        tabs: [
            {
                key: 'partners',
                label: 'Partners',
                icon: <FaBook />,
                role: 'contributor', // API role parameter
            },
            {
                key: 'companies',
                label: 'Organizations',
                icon: <FaUser />,
                role: null, // Not user role based
            },
            {
                key: 'groups',
                label: 'Groups',
                icon: <MdGroupAdd />,
                role: null,
            },
            {
                key: 'groupLeaders',
                label: 'Managers',
                icon: <FaBox />,
                role: 'groupLeader',
            },
            {
                key: 'staff',
                label: 'Employees',
                icon: <FaUser />,
                role: 'subscriber',
            },
        ],
        filters: {
            partners: [], // No filters for partners
            companies: ['contributor'], // Can filter by contributor/partner
            groups: ['contributor', 'company'], // Can filter by contributor and company
            groupLeaders: ['contributor', 'company', 'group'], // All filters available
            staff: ['contributor', 'company', 'group'], // All filters available
        },
        defaultTab: 'partners',
    },

    contributor: {
        tabs: [
            {
                key: 'companies',
                label: 'Organizations',
                icon: <FaUser />,
                role: null,
            },
            {
                key: 'groups',
                label: 'Groups',
                icon: <MdGroupAdd />,
                role: null,
            },
            {
                key: 'groupLeaders',
                label: 'Managers',
                icon: <FaBox />,
                role: 'groupLeader',
            },
            {
                key: 'staff',
                label: 'Employees',
                icon: <FaUser />,
                role: 'subscriber',
            },
        ],
        filters: {
            companies: [], // No filters (auto-scoped to contributor)
            groups: ['company'], // Only company filter
            groupLeaders: ['company', 'group'], // Company and group filters
            staff: ['company', 'group'], // Company and group filters
        },
        defaultTab: 'companies',
    },

    groupLeader: {
        tabs: [
            {
                key: 'groups',
                label: 'Groups',
                icon: <MdGroupAdd />,
                role: null,
            },
            {
                key: 'groupLeaders',
                label: 'Managers',
                icon: <FaBox />,
                role: 'groupLeader',
            },
            {
                key: 'staff',
                label: 'Employees',
                icon: <FaUser />,
                role: 'subscriber',
            },
        ],
        filters: {
            groups: [], // No filters (auto-scoped to assigned groups)
            groupLeaders: ['group'], // Only group filter
            staff: ['group'], // Only group filter
        },
        defaultTab: 'groups',
    },
};

/**
 * Get tab configuration for a specific role
 */
export const getTabConfigForRole = (role) => {
    return TAB_CONFIG[role] || TAB_CONFIG.contributor; // Fallback to contributor
};

/**
 * Check if a filter is allowed for the current role and tab
 */
export const isFilterAllowed = (role, activeTab, filterType) => {
    const config = TAB_CONFIG[role];
    if (!config) return false;

    const allowedFilters = config.filters[activeTab] || [];
    return allowedFilters.includes(filterType);
};