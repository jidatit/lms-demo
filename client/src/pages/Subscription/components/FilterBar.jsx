import { Box } from '@mui/material';
import CompanyFilter from 'components/CompanyFilter';
import CompanyGroupFilter from 'components/CompanyGroupFilter';
import { isFilterAllowed } from './TabConfig';
import ContributorFilter from 'pages/dashboard/components/ContributorSelect';

/**
 * Dynamic filter bar that shows/hides filters based on role and active tab
 */
const FilterBar = ({
    role,
    activeTab,
    filters,
    onFilterChange,
    contributors = [],
    companies = [],
    groups = [],
}) => {
    const showContributorFilter = isFilterAllowed(role, activeTab, 'contributor');
    const showCompanyFilter = isFilterAllowed(role, activeTab, 'company');
    const showGroupFilter = isFilterAllowed(role, activeTab, 'group');
    // If no filters are allowed, don't render anything
    if (!showContributorFilter && !showCompanyFilter && !showGroupFilter) {
        return null;
    }

    const handleContributorChange = (contributor) => {
        onFilterChange({
            contributorId: contributor?.id || null,
            searchedContributor: contributor?.email || '',
            companyId: null, // Reset dependent filters
            companyName: '',
            groupId: null,
            groupName: '',
        });
    };

    const handleCompanyChange = (companyId, companyName) => {
        onFilterChange({
            ...filters,
            companyId: companyId || null,
            companyName: companyName || '',
            groupId: null, // Reset dependent filter
            groupName: '',
        });
    };

    const handleGroupChange = (groupId, groupName) => {
        onFilterChange({
            ...filters,
            groupId: groupId || null,
            groupName: groupName || '',
        });
    };

    const handleContributorClear = () => {
        onFilterChange({
            contributorId: null,
            searchedContributor: '',
            companyId: null,
            companyName: '',
            groupId: null,
            groupName: '',
        });
    };

    const handleCompanyClear = () => {
        onFilterChange({
            ...filters,
            companyId: null,
            companyName: '',
            groupId: null,
            groupName: '',
        });
    };

    const handleGroupClear = () => {
        onFilterChange({
            ...filters,
            groupId: null,
            groupName: '',
        });
    };

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'center',
                mt: 1.5,
                mr: 2,
            }}
        >
            {showContributorFilter && (
                <ContributorFilter
                    searchedContributor={filters.searchedContributor || ''}
                    setSearchedContributor={(email) =>
                        onFilterChange({ ...filters, searchedContributor: email })
                    }
                    filteredContributors={contributors}
                    handleContributorChange={handleContributorChange}
                    placeholder="Filter by Partner"
                    onClear={handleContributorClear}
                    isAdmin={true}
                />
            )}

            {showCompanyFilter && (
                <CompanyFilter
                    selectedCompanyId={filters.companyId || ''}
                    setSelectedCompanyId={(id) => handleCompanyChange(id, filters.companyName)}
                    companyName={filters.companyName || ''}
                    setCompanyName={(name) =>
                        onFilterChange({ ...filters, companyName: name })
                    }
                    companies={companies} // Pass companies data
                    onCompanyChange={handleCompanyChange}
                    onClear={handleCompanyClear}
                />
            )}

            {showGroupFilter && (
                <CompanyGroupFilter
                    groupName={filters.groupName || ''}
                    setGroupName={(name) =>
                        onFilterChange({ ...filters, groupName: name })
                    }
                    selectedGroupId={filters.groupId || ''}
                    setSelectedGroupId={(id) => {
                        const name = groups?.find(g => g.id === id)?.name || '';
                        onFilterChange({ ...filters, groupId: id, groupName: name });
                    }}
                    groups={groups} // Pass groups data
                    handleChange={handleGroupChange}
                    onClear={handleGroupClear} // fix prop name to lowercase
                    isAdmin={true}
                />
            )}
        </Box>
    );
};

export default FilterBar;