import React, { useMemo, useEffect, useState, lazy } from 'react';
import { Button, Box, Typography, Tabs, Tab } from '@mui/material';
import axios from 'axios';
import axiosInstance from 'utils/axiosConfig';
import { useAuth } from 'contexts/AuthContext';
import Loadable from 'components/Loadable';
import { toast } from 'utils/toast';

const MuiTableEnhanced = Loadable(lazy(() => import('components/tables/mui-tables/enhanced')));
const Campaigns = () => {
  const { currentUser } = useAuth();
  const [allCampaigns, setallCampaigns] = useState([]);
  const [allCampaignsLaunch, setallCampaignsLaunch] = useState([]);
  const [openCampaginModal, setOpenCampaginModal] = useState(false);

  //FETCHING GROUPS FOR GROUP LEADER
  const [groupId, setGroupId] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [groups, setGroups] = useState([]);

  const handleCampaignOpen = () => {
    setOpenCampaginModal(true);
  };
  const handleCampaignClose = () => {
    setOpenCampaginModal(false);
    getAllLaunchingCampaigns();
  };
  // Fetch group IDs and names for the current user
  const fetchGroupIdAndName = async () => {
    try {
      // Fetch the group IDs for the current user
      const groupIdResponse = await axiosInstance.get(`/groups/${currentUser?.id}/groupid`);
      const retrievedGroupIds = groupIdResponse?.data?.group_id;
      setGroupId(retrievedGroupIds);

      if (retrievedGroupIds && retrievedGroupIds.length > 0) {
        const groupNameResponse = await axiosInstance.post(`groups/group/details`, { group_id: retrievedGroupIds });
        setGroups(groupNameResponse?.data?.groups);
        const retrievedGroupNames = groupNameResponse?.data?.groups?.map((group) => group.name);
        setGroupName(retrievedGroupNames);
        // Once group IDs are fetched, get the launching campaigns for these groups
        getAllLaunchingCampaigns(retrievedGroupIds);
      }
    } catch (error) {
      console.error('Error fetching group data!', error);
    }
  };

  // Get launching campaigns based on group IDs
  const getAllLaunchingCampaigns = async (groupIds) => {
    try {
      // Convert the group IDs array to a comma-separated string for the query parameter
      const groupIdsString = groupIds.join(',');
      const response = await axiosInstance.get(`/campaigns/launching-campaigns-by-group?groupId=${groupIdsString}`);
      if (response.data.data) {
        setallCampaignsLaunch(response.data.data);
      } else {
        setallCampaignsLaunch([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchGroupIdAndName();
  }, []);

  const headCellsLaunch = [
    {
      id: 'id',
      numeric: false,
      disablePadding: true,
      label: 'Id'
    },
    {
      id: 'name',
      numeric: false,
      disablePadding: true,
      label: 'Name'
    },
    {
      id: 'type',
      numeric: false,
      disablePadding: true,
      label: 'Campaign Type'
    },
    {
      id: 'status',
      numeric: false,
      disablePadding: true,
      label: 'Status'
    },
    {
      id: 'launch_date',
      numeric: false,
      disablePadding: true,
      label: 'Launch Date'
    },
    {
      id: 'launch_time',
      numeric: false,
      disablePadding: true,
      label: 'Launch Time'
    },
    {
      id: 'target_groups',
      numeric: false,
      disablePadding: true,
      label: 'Target Groups'
    }
  ];

  return (
    <>
      <MuiTableEnhanced action={handleCampaignOpen} data={allCampaignsLaunch} headCells={headCellsLaunch} groupLeader={true} />
    </>
  );
};

export default Campaigns;
