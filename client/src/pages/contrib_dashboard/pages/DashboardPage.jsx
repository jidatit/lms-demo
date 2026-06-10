import { useAuth } from 'contexts/AuthContext';
import React, { useEffect, useState } from 'react';
import axiosInstance from 'utils/axiosConfig';
import { GoPhishAccountAPIKey, GoPhishPublicURL } from 'utils/constants';
import WelcomeBanner from '../components/WelcomeBanner';
import { ReportsSection } from 'components/ReportSection';
import { Box } from '@mui/system';
import DashboardGraphs from 'pages/dashboard/components/DashboardGraphs';

const DashboardPage = ({ viewemail }) => {
  const { currentUser } = useAuth();
  let email;
  let admin;

  if (viewemail) {
    admin = true;
    email = viewemail;
  } else {
    email = currentUser.email;
  }
  const [activeButton, setActiveButton] = useState('campaign');
  const [trainingOverviewOption, setTrainingOverviewOption] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [numOfUsers, setNumOfUsers] = useState('');
  const [numOfGroups, setNumOfGroups] = useState('');
  const [numOfCampaigns, setNumOfCampaigns] = useState('');
  const [AllGroups, setAllGroups] = useState([]);
  const [SelectedGroupName, setSelectedGroupName] = useState('');
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [searchGroupTerm, setSearchGroupTerm] = useState('');
  const [download, setDownload] = useState('');
  const [loading, setLoading] = useState(false);
  const fetchAllGroups = async () => {
    try {
      const resp = await axiosInstance.get(`/groups/all/${email}`);
      setAllGroups(resp.data.groups);
    } catch (error) {
      console.log('Error fetching all groups!');
    }
  };
  const filteredGroups = AllGroups.filter((group) => group.name.toLowerCase().includes(searchGroupTerm.toLowerCase()));

  const handleGroupChange = (group) => {
    setSelectedGroupName(group.name);

    setIsGroupOpen(false);
    getCampaignDataSummary(group.name);
  };

  const handleGroupClear = () => {
    setSelectedGroupName(null);
    getCampaignDataSummary();
  };

  useEffect(() => {
    fetchAllGroups();
  }, [currentUser]);

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
    if (buttonName === 'training') {
      setTrainingOverviewOption('Module Report'); // Set default selection for training overview
    }
  };
  const handleDropdownSelection = (option) => {
    setTrainingOverviewOption(option);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const handleClearSelection = () => {
    setTrainingOverviewOption(null);
  };

  const filteredOptions = ['User Report', 'Module Report'].filter((option) => option.toLowerCase().includes(searchTerm.toLowerCase()));
  const getReports = async () => {
    setLoading(true);
    try {
      const resp = await axiosInstance.post(`/modules_report/stats`, {
        email
      });

      if (resp?.data?.status === 200) {
        const { total_users_in_groups, total_groups, campaigns, groups_details } = resp?.data?.data;

        if (total_users_in_groups !== undefined && total_groups !== undefined) {
          setNumOfUsers(total_users_in_groups);
          setNumOfGroups(total_groups);
        } else {
          setNumOfUsers(0);
          setNumOfGroups(0);
        }
      } else {
        setNumOfUsers(0);
        setNumOfGroups(0);
      }
    } catch (error) {
      console.error('Error fetching reports data:', error.message);

      setNumOfUsers(0);
      setNumOfGroups(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) {
      // getReports();
      getCampaignDataSummary();
    }
  }, []);
  const getCampaignDataSummary = async () => {
    try {
      const response = await fetch(`${GoPhishPublicURL}/api/campaigns/summary/?api_key=${GoPhishAccountAPIKey}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      // const userEmail = currentUser.email;

      const userCampaigns = data.campaigns.filter((campaign) => campaign.name.includes(`email: ${email}`));

      let filteredCampaigns = userCampaigns;

      filteredCampaigns.forEach((campaign) => {
        // Remove email and groups from the campaign name
        const emailPattern = new RegExp(`, email: ${email}`);
        const groupsPattern = /, groups: .*/;

        campaign.name = campaign.name.replace(emailPattern, '').replace(groupsPattern, '').trim();
      });
      const inProgressCount = filteredCampaigns.filter((campaign) => campaign.status === 'In progress').length;

      setNumOfCampaigns(inProgressCount);
    } catch (error) {
      console.error('Error fetching campaign data summary:', error);
    }
  };

  useEffect(() => {
    setActiveButton('campaign');
  }, []);

  return (
    <>
      <Box>
        <Box sx={{ marginBottom: 3 }}>
          {' '}
          {/* Adjust spacing as needed */}
          {!admin && <WelcomeBanner />}
        </Box>
        <ReportsSection
          loading={loading}
          numOfUsers={0}
          numOfGroups={0}
          numOfcampaigns={numOfCampaigns}
          groupleader={false}
        />
      </Box>

      <DashboardGraphs mode={'contributor'} admin={admin} />
    </>
  );
};

export default DashboardPage;
