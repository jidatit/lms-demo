import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosConfig.js';
import { Box, Typography, List, ListItem, ListItemText, ListItemButton, Tabs, Tab, Paper } from '@mui/material';

export default function ViewGroupsDetails() {
  const [allGroups, setAllGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const { id } = useParams();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    fetchAllGroups(email);
  }, [id, email]);

  const fetchAllGroups = async (email) => {
    try {
      const resp = await axiosInstance.get(`/groups/all/${email}`);
      setAllGroups(resp.data.groups);
    } catch (error) {
      console.log('Error fetching all groups!');
    }
  };

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setTabValue(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ display: 'flex', p: 2 }}>
      <Box sx={{ width: '30%', mr: 2 }}>
        <Typography variant="h6" gutterBottom>
          All Groups
        </Typography>
        <List>
          {allGroups.map((group) => (
            <ListItem key={group.id} disablePadding>
              <ListItemButton onClick={() => handleGroupClick(group)}>
                <ListItemText primary={group.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ width: '70%' }}>
        {selectedGroup ? (
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              {selectedGroup.name}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Creator: {selectedGroup.creator_email}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Role: {selectedGroup.creator_role}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Sign-in Type: {selectedGroup.signInType}
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Group Leaders" />
                <Tab label="Subscribers" />
                <Tab label="Details" />
              </Tabs>
            </Box>
            <Box sx={{ mt: 2 }}>
              {tabValue === 0 && <Typography>Group Leaders Content</Typography>}
              {tabValue === 1 && <Typography>Subscribers Content</Typography>}
              {tabValue === 2 && <Typography>Details Content</Typography>}
            </Box>
          </Paper>
        ) : (
          <Typography variant="body1">Select a group to view details</Typography>
        )}
      </Box>
    </Box>
  );
}
