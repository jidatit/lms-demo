import React, { useState, useMemo } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { Bookmark2, Money, ProfileDelete, RefreshCircle } from 'iconsax-react';
import SummaryCards from '../components/SummaryCards/SummaryCards';
import LicenseUsage from '../components/AnalyticsCharts/LicenseUsage';
import TotalSubscription from '../components/AnalyticsCharts/TotalSubscription';
import { Box, Alert } from '@mui/material';
import EnrollmentRateChart from '../components/AnalyticsCharts/EnrollmentRateChart';
import AbandonmentRates from '../components/AnalyticsCharts/AbandonmentRates';
import CompletionRateChart from '../components/AnalyticsCharts/CompletionRateChart';
import EngagementTable from '../components/AnalyticsCharts/EngagementTable';
import {
  useDashboardSummary,
  useSubscriptionStats,
  useEnrollmentRate,
  useAbandonmentRates,
  useCompletionRate,
  useEngagementRate
} from 'api/queries/dashboard';
import { useTheme } from '@mui/material/styles';
import { useGetUsers } from 'api/queries/users';
import ContributorFilter from '../components/ContributorSelect';
import CompanyGroupFilter from 'components/CompanyGroupFilter';


const DashboardPage = () => {
  const { currentUser } = useAuth();
  const role = currentUser?.role;
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  // Get contributors for filter (admin only)
  const { data: allUsersData } = useGetUsers({
    role: 'contributor',
    enabled: role === 'admin',
  });
  const contributors = allUsersData?.data || [];

  // State for filters
  const [bundleFilter, setBundleFilter] = useState(null);
  const [groupFilter, setGroupFilter] = useState(null);
  const [groupName, setGroupName] = useState(''); // group name for display
  const [timeFilter, setTimeFilter] = useState('monthly'); // weekly, monthly
  const [contributorFilter, setContributorFilter] = useState(null); // contributor ID
  const [searchedContributor, setSearchedContributor] = useState(''); // contributor email for display

  // Prepare filter object for API calls
  const filters = useMemo(() => ({
    ...(groupFilter && { groupId: groupFilter }),
    ...(bundleFilter && { bundleId: bundleFilter }),
    ...(contributorFilter && { contributorId: contributorFilter })
  }), [groupFilter, bundleFilter, contributorFilter]);

  // Handle contributor selection
  const handleContributorChange = (contributor) => {
    setContributorFilter(contributor.id);
    setSearchedContributor(contributor.email);
  };

  // Handle contributor clear
  const handleContributorClear = () => {
    setContributorFilter(null);
    setSearchedContributor('');
  };

  // Handle group selection
  const handleGroupChange = (groupId, groupName) => {
    setGroupFilter(groupId);
    setGroupName(groupName || '');
  };

  // Handle group clear
  const handleGroupClear = () => {
    setGroupFilter(null);
    setGroupName('');
  };

  // Fetch all dashboard data using React Query hooks
  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    error: summaryError
  } = useDashboardSummary(filters);

  const {
    data: subscriptionData,
    isLoading: isLoadingSubscription,
    error: subscriptionError
  } = useSubscriptionStats(filters);

  const {
    data: enrollmentData,
    isLoading: isLoadingEnrollment,
    error: enrollmentError
  } = useEnrollmentRate(filters);

  const {
    data: abandonmentData,
    isLoading: isLoadingAbandonment,
    error: abandonmentError
  } = useAbandonmentRates(filters);

  const {
    data: completionData,
    isLoading: isLoadingCompletion,
    error: completionError
  } = useCompletionRate({ ...filters, period: timeFilter });

  const {
    data: engagementData,
    isLoading: isLoadingEngagement,
    error: engagementError
  } = useEngagementRate(filters);

  // Prepare summary cards data from API response
  const summaryCardsData = useMemo(() => {
    if (!summaryData?.data) return [];

    const { registrations, expirations, groups, totalReceivables } = summaryData.data;

    return [
      {
        primary: 'Registrations',
        secondary: `${registrations || 0}`,
        content: 'New Learners',
        iconPrimary: Bookmark2,
        color: 'primary.darker',
        bgcolor: 'primary.lighter'
      },
      {
        primary: 'Expirations',
        secondary: `${expirations || 0}`,
        content: 'Licence Renew',
        iconPrimary: RefreshCircle,
        color: 'success.darker',
        bgcolor: 'success.lighter'
      },
      {
        primary: 'Groups',
        secondary: `${groups || 0}`,
        content: 'Total Groups',
        iconPrimary: Money,
        color: 'warning.darker',
        bgcolor: 'warning.lighter'
      },
      {
        primary: 'Total Receivables',
        secondary: `${(totalReceivables || 0).toLocaleString()}`,
        content: 'Billing',
        iconPrimary: ProfileDelete,
        color: 'error.darker',
        bgcolor: 'error.lighter'
      }
    ];
  }, [summaryData]);

  // Show error alerts for individual components if needed
  const showErrorAlert = (error, componentName) => {
    if (error) {
      return (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">
            Failed to load {componentName}: {error.message || 'Unknown error'}
          </Alert>
        </Box>
      );
    }
    return null;
  };

  return (
    <>
      {/* Filters Section - Show for admin and contributor */}
      {(role === 'admin' || role === 'contributor') && (
        <Box
          sx={{
            mb: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: { sm: 'flex-end', xs: 'flex-end' }
          }}
        >
          {/* Contributor Filter - Only show for admin */}
          {role === 'admin' && (
            <Box sx={{ flex: { xs: '1 1 auto', sm: '0 1 auto' }, minWidth: { xs: '100%', sm: '200px' } }}>
              {/* <ContributorFilter
                searchedContributor={searchedContributor}
                setSearchedContributor={setSearchedContributor}
                filteredContributors={contributors}
                handleContributorChange={handleContributorChange}
                onClear={handleContributorClear}
              /> */}
            </Box>
          )}

          {/* Group Filter - Show for both admin and contributor */}
          <Box sx={{ flex: { xs: '1 1 auto', sm: '0 1 auto' }, }}>
            {/* <CompanyGroupFilter
              groupName={groupName}
              setGroupName={setGroupName}
              selectedGroupId={groupFilter || ''}
              setSelectedGroupId={(id) => {
                // This is called when the component needs to update the ID
                // The handleChange callback will also be called with the full group info
                if (id) {
                  setGroupFilter(id);
                } else {
                  setGroupFilter(null);
                }
              }}
              handleChange={handleGroupChange}
              onClear={handleGroupClear}
            /> */}
          </Box>
        </Box>
      )}
      {/* Summary Cards Row */}
      {summaryError && showErrorAlert(summaryError, 'summary data')}
      <SummaryCards
        dashboardWidgetData={summaryCardsData}
        loading={isLoadingSummary}
      />

      {/* Second Row: Subscription, Enrollment, Abandonment */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          mt: 2
        }}
      >
        {/* Total Subscription & License Usage */}
        <Box sx={{ width: { xs: '100%', md: '33.33%' }, borderRadius: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {subscriptionError && showErrorAlert(subscriptionError, 'subscription stats')}
          <TotalSubscription
            title="License Usage"
            amount={subscriptionData?.data?.utilizationPercentage || 0}
            percentage={10}
            color={primaryColor}
            data={subscriptionData?.data?.chartData || []}
            loading={isLoadingSubscription}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', mt: 2 }}>
            <LicenseUsage
              title="Total Subscription"
              amount={subscriptionData?.data?.totalPurchased || 0}
              loading={isLoadingSubscription}
            />
          </Box>
        </Box>

        {/* Enrollment Rate Chart */}
        <Box sx={{ width: { xs: '100%', md: '33.33%' }, borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
          {enrollmentError && showErrorAlert(enrollmentError, 'enrollment rate')}
          <EnrollmentRateChart
            bundleData={enrollmentData?.data?.bundles || []}
            loading={isLoadingEnrollment}
            onBundleFilterChange={setBundleFilter}
          />
        </Box>

        {/* Abandonment Rates */}
        <Box sx={{ width: { xs: '100%', md: '33.33%' }, borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
          {abandonmentError && showErrorAlert(abandonmentError, 'abandonment rates')}
          <AbandonmentRates
            sent={abandonmentData?.data?.sent || 0}
            accepted={abandonmentData?.data?.accepted || 0}
            active={abandonmentData?.data?.active || 0}
            percentage={abandonmentData?.data?.percentage || 0}
            loading={isLoadingAbandonment}
            onGroupFilterChange={setGroupFilter}
          />
        </Box>
      </Box>

      {/* Third Row: Completion Rate & Engagement Table */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          mt: 2,

        }}
      >
        {/* Completion Rate Chart */}
        <Box sx={{ width: { xs: '100%', md: '66.66%' }, bgcolor: '#ffffff', borderRadius: 2 }}>
          {completionError && showErrorAlert(completionError, 'completion rate')}
          <CompletionRateChart
            completionData={completionData?.data}
            loading={isLoadingCompletion}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            groupFilter={groupFilter}
            onGroupFilterChange={setGroupFilter}
          />
        </Box>

        {/* Engagement Table */}
        <Box sx={{ width: { xs: '100%', md: '33.33%' }, borderRadius: 2, }}>
          {engagementError && showErrorAlert(engagementError, 'engagement rate')}
          <EngagementTable
            groups={engagementData?.data?.groups || []}
            loading={isLoadingEngagement}
            groupFilter={groupFilter}
            onGroupFilterChange={setGroupFilter}
          />
        </Box>
      </Box>
    </>
  );
};

export default DashboardPage;
