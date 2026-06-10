import { Box } from '@mui/system';
import { ReportsSection } from 'components/ReportSection';
import { useAuth } from 'contexts/AuthContext';
import WelcomeBanner from 'pages/contrib_dashboard/components/WelcomeBanner';
import DashboardGraphs from 'pages/dashboard/components/DashboardGraphs';
import React, { useEffect, useState } from 'react';
import axiosInstance from 'utils/axiosConfig';
import { GoPhishAccountAPIKey, GoPhishPublicURL } from 'utils/constants';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  const email = currentUser.email;
  const [activeButton, setActiveButton] = useState('campaign');
  const [trainingOverviewOption, setTrainingOverviewOption] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [numOfUsers, setNumOfUsers] = useState('');
  const [numOfGroups, setNumOfGroups] = useState('');
  const [numOfCampaigns, setNumOfCampaigns] = useState('');

  const [groupId, setGroupId] = useState(null);
  const [groupName, setGroupName] = useState([]);
  const [AllGroups, setAllGroups] = useState([]);

  const [SelectedGroupName, setSelectedGroupName] = useState('');
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [searchGroupTerm, setSearchGroupTerm] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [download, setDownload] = useState('');

  const [loading, setLoading] = useState(false);

  const handleClearSelection = () => {
    setTrainingOverviewOption(null);
  };

  const filteredOptions = ['User Report', 'Module Report'].filter((option) => option.toLowerCase().includes(searchTerm.toLowerCase()));
  const getReports = async () => {
    setLoading(true);
    try {
      const resp = await axiosInstance.post(`/modules_report/stats-by-group-leader`, {
        userId
      });

      if (resp?.data?.status === 200) {
        const { total_users_in_groups, total_groups, campaigns, groups_details } = resp?.data?.data;

        if (total_users_in_groups !== undefined && total_groups !== undefined && campaigns !== undefined) {
          setNumOfUsers(total_users_in_groups);
          setNumOfGroups(total_groups);
          // setNumOfCampaigns(campaigns);
        } else {
          setNumOfUsers(0);
          setNumOfGroups(0);
          setNumOfCampaigns(0);
        }
      } else {
        setNumOfUsers(0);
        setNumOfGroups(0);
        setNumOfCampaigns(0);
      }
    } catch (error) {
      console.error('Error fetching reports data:', error.message);

      setNumOfUsers(0);
      setNumOfGroups(0);
      setNumOfCampaigns(0);
    } finally {
      setLoading(false);
    }
  };
  const getCampaignDataSummary = async (groupNames) => {
    try {
      const response = await fetch(`${GoPhishPublicURL}/api/campaigns/summary/?api_key=${GoPhishAccountAPIKey}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      const groupsPattern = new RegExp(`groups: (${groupNames.join('|')})`, 'i');

      const filteredCampaigns = data.campaigns.filter((campaign) => groupsPattern.test(campaign.name) && campaign.status === 'In progress');

      filteredCampaigns.forEach((campaign) => {
        campaign.name = campaign.name
          .replace(/, email: [^,]+/, '')
          .replace(/, groups: .*/, '')
          .trim();
      });

      const inProgressCount = filteredCampaigns.length;

      setNumOfCampaigns(inProgressCount);
    } catch (error) {
      console.error('Error fetching campaign data summary:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      // getReports();
      fetchGroupIdAndName();
    }
  }, []);

  const fetchGroupIdAndName = async () => {
    try {
      // Fetch the group IDs for the current user
      const groupIdResponse = await axiosInstance.get(`/groups/${currentUser?.id}/groupid`);

      const retrievedGroupIds = groupIdResponse?.data?.group_id;

      setGroupId(retrievedGroupIds);

      if (retrievedGroupIds && retrievedGroupIds.length > 0) {
        const groupNameResponse = await axiosInstance.post(`groups/group/details`, { group_id: retrievedGroupIds });

        setAllGroups(groupNameResponse?.data?.groups);

        const retrievedGroupNames = groupNameResponse?.data?.groups?.map((group) => group.name);

        setGroupName(retrievedGroupNames);

        await getCampaignDataSummary(retrievedGroupNames);
      }
    } catch (error) {
      console.error('Error fetching group data!', error);
    }
  };
  const filteredGroups = AllGroups.filter((group) => group.name.toLowerCase().includes(searchGroupTerm.toLowerCase()));
  useEffect(() => {
    setActiveButton('campaign');
  }, []);
  return (
    <>
      <Box>
        <ReportsSection
          loading={loading}
          numOfUsers={0}
          numOfGroups={0}
          numOfcampaigns={numOfCampaigns}
          groupleader={false}
        />
      </Box>

      <DashboardGraphs mode={'groupleader'} />
    </>
  );
};

export default DashboardPage;
