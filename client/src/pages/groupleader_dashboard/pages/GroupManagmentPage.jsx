import React, { useState, useEffect } from 'react';

import axios from 'axios';

import axiosInstance from 'utils/axiosConfig';
import { GoPhishAccountAPIKey, GoPhishPublicURL } from 'utils/constants';
import { useAuth } from 'contexts/AuthContext';
import {
  Button,
  Modal,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  InputLabel
} from '@mui/material';
import MainCard from 'components/MainCard';
import { Box, Stack } from '@mui/system';
import Users from '../components/Users';
import { toast } from 'utils/toast';
import { useCreateGroupMember, useGetGroupMembers, useGetGroups } from 'api/queries/groups';
import { useGetGroupBundles } from 'api/queries/groupBundles';
import { addMemberToGophishGroup } from 'utils/gophishUtils';

const GroupLeaderGroupManagmentPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [SelectedGroupName, setSelectedGroupName] = useState('');
  const [SelectedGroupId, setSelectedGroupId] = useState('');
  const [SubscribersData, setSubscribersData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(false);



  const [value, setValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const { data, isLoading, isError } = useGetGroups({
    groupLeaderId: currentUser?.id
  });
  const { data: membersResponse, isLoading: isMemebersLoading, refetch: fetchMembers } = useGetGroupMembers(SelectedGroupId);
  const { data: attachedBundlesData, isLoading: bundlesLoading } = useGetGroupBundles(SelectedGroupId);
  const { mutateAsync: createGroupMember } = useCreateGroupMember();

  const AllGroups = data?.data || [];

  const pathname = window.location.pathname;
  // run automatically when query finishes
  useEffect(() => {
    if (membersResponse?.success) {
      const members = membersResponse.data || [];
      setSubscribersData(members.filter((m) => m.role === 'subscriber'));
    }
  }, [membersResponse]);


  const getMembersAndFilter = async () => {
    try {
      const res = await fetchMembers(); // react-query refetch
      const members = res?.data?.data || []; // react-query wraps response in { data }

      setSubscribersData(members.filter((m) => m.role === 'subscriber'));
    } catch (error) {
      console.error('Error fetching and filtering members:', error);
    }
  };
  const handleGroupChange = (group) => {
    console.log("group", group)
    setSelectedGroup(group)
    setSelectedGroupId(group?.id);
    setSelectedGroupName(group?.name);
  };

  const handleConfirm = () => {
    getAllSubscribersById();
  };


  const [ListOfAttachedCourses, setListOfAttachedCourses] = useState([]);
  useEffect(() => {
    if (SelectedGroupId) {
      getMembersAndFilter(); // Keep this as is
    }
    setLoading(bundlesLoading); // Update loading state based on query
    if (attachedBundlesData) {
      setListOfAttachedCourses(attachedBundlesData?.data); // Set the bundles array (assuming data is the array of bundles)
    }
  }, [SelectedGroupId, attachedBundlesData, bundlesLoading]);
  const filteredData = modalData.filter((item) => {
    const title = selectedOption === 'course' ? item.courseDetails.title : item.bundleDetails.name;
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };
  const filteredGroups = AllGroups?.filter(
    (group) => group.name.toLowerCase().includes(searchText.toLowerCase()) || group.id.toString().includes(searchText)
  );

  const [selectedEmail, setSelectedEmail] = useState();

  const [openModalSM, setOpenModalSM] = useState(false);
  const [formDataSM, setFormDataSM] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const handleAddSubscriber = () => {
    if (SelectedGroupId) {
      setFormDataSM({ group_id: SelectedGroupId, firstName: '', lastName: '', email: '' });

      setOpenModalSM(true);
    } else {
      toast({
        message: 'No group Selected!',
        type: 'error'
      });
    }
  };
  const handleCloseModalSM = () => {
    setOpenModalSM(false);
    setFormDataSM({ firstName: '', lastName: '', email: '' });
  };
  const handleSubmitSM = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);

      // Normalize email
      const normalizedEmail = formDataSM.email.trim().toLowerCase();

      // 1. Create in backend
      const response = await createGroupMember({
        groupId: SelectedGroupId,
        userData: {
          ...formDataSM,
          email: normalizedEmail,
          role: 'subscriber',
          signInType: selectedGroup?.signInType || 'passwordless'
        }
      });

      toast({ message: 'Staff added successfully!', type: 'success' });

      // 2. Also update GoPhish group if it exists
      if (selectedGroup?.gophishGroupID) {
        await addMemberToGophishGroup(selectedGroup.gophishGroupID, {
          email: normalizedEmail,
          first_name: formDataSM.firstName,
          last_name: formDataSM.lastName,
          position: 'Subscriber'
        });
        toast({ message: 'GoPhish group updated successfully!', type: 'success' });
      }

      // 3. Update subscribers list without refetching

      setSubscribersData(response?.data);
    } catch (error) {
      toast({ message: error.message || 'Error adding Staff', type: 'error' });
    } finally {
      setLoading(false);
      handleCloseModalSM();
    }

  };

  //Attahc course and bundles

  return (
    <>
      {' '}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <MainCard
            title="Group"
            sx={{
              height: '100%'
            }}
            codeString={false}
            secondary={
              <Button color="primary" onClick={() => setDialogOpen(true)}>
                Select Group
              </Button>
            }
          >
            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant="h5" color="text.secondary">
                {SelectedGroupName ? SelectedGroupName : 'No Group Selected'}
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
      {SelectedGroupId && (
        <Stack
          sx={{
            marginTop: '16px'
          }}
        >
          <Users
            subscribers={SubscribersData}
            AllGroups={AllGroups}
            SelectedGroupId={SelectedGroupId}
            setSelectedGroupId={setSelectedGroupId}
            groupManagment={true}
            coursesData={ListOfAttachedCourses}
            isAdmin={true}
            handleAddSubscriber={handleAddSubscriber}
            selectedEmail={selectedEmail}
          />
        </Stack>
      )}
      <Dialog
        open={openModalSM}
        onClose={loading ? null : handleCloseModalSM}
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmitSM
        }}
        fullWidth
      >
        <DialogTitle>{'Add Staff'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>To add a Staff, please provide their First Name, Last Name, and Email.</DialogContentText>
          <InputLabel htmlFor="firstName" sx={{ mb: 0.5 }}>
            First Name
          </InputLabel>
          <TextField
            autoFocus
            required
            id="firstName"
            value={formDataSM.firstName}
            onChange={(e) => setFormDataSM({ ...formDataSM, firstName: e.target.value })}
            fullWidth
            margin="dense"
            sx={{ mb: 1.5 }}
          />
          <InputLabel htmlFor="lastName" sx={{ mb: 0.5 }}>
            Last Name
          </InputLabel>
          <TextField
            required
            id="lastName"
            value={formDataSM.lastName}
            onChange={(e) => setFormDataSM({ ...formDataSM, lastName: e.target.value })}
            fullWidth
            margin="dense"
            sx={{ mb: 1.5 }}
          />
          <InputLabel htmlFor="email" sx={{ mb: 0.5 }}>
            Email
          </InputLabel>
          <TextField
            required
            id="email"
            type="email"
            value={formDataSM.email}
            onChange={(e) => setFormDataSM({ ...formDataSM, email: e.target.value })}
            fullWidth
            margin="dense"
            sx={{ mb: 1.5 }}
          />
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={handleCloseModalSM} color="error">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Processing...' : 'Add Staff'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            overflow: 'hidden'
          }
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            p: 2.5
          }}
        >
          Select Group
        </DialogTitle>

        <DialogContent sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          {/* Search */}
          <TextField
            size="small"
            placeholder="Search group..."
            variant="outlined"
            fullWidth
            value={searchText}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <Box sx={{ color: 'primary.main', mr: 1 }}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </Box>
              )
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'divider'
                }
              }
            }}
          />

          {/* Groups List */}
          <Box
            sx={{
              flex: 1,
              maxHeight: 400,
              overflowY: 'auto',
              overflowX: 'hidden',
              '&::-webkit-scrollbar': {
                width: '8px'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '4px'
              }
            }}
          >
            <Box sx={{ minWidth: '100%' }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.5fr 1fr',
                  gap: 2,
                  p: 1.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Group ID
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Group Name
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Sign-In Type
                </Typography>
              </Box>

              {/* Group Items */}
              {filteredGroups?.map((group, index) => (
                <Box
                  key={index}
                  onClick={() => handleGroupChange(group)}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.5fr 1fr',
                    gap: 2,
                    p: 1.5,
                    cursor: 'pointer',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    // bgcolor: SelectedGroupName === group.name ? 'primary.soft' : 'white',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: SelectedGroupName === group.name ? 'primary.soft' : 'primary.lighter'
                    }
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      color: SelectedGroupName === group.name ? 'primary.main' : 'text.primary'
                    }}
                  >
                    {group.id}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: SelectedGroupName === group.name ? 'primary.main' : 'text.primary'
                    }}
                  >
                    {group.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      color: SelectedGroupName === group.name ? 'primary.main' : 'text.secondary',
                      bgcolor: SelectedGroupName === group.name ? 'primary.lighter' : 'action.hover',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '4px',
                      width: 'fit-content'
                    }}
                  >
                    {group.signInType === 'withPassword'
                      ? 'With Password'
                      : group.signInType === 'passwordless'
                        ? 'Password Less'
                        : group.signInType === 'microsoftEntraID'
                          ? 'Microsoft Entra ID'
                          : ''}

                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>

        {/* Footer */}
        <DialogActions
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button onClick={() => setDialogOpen(false)} size="small" color="error">
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={!SelectedGroupName}
            onClick={() => {
              setDialogOpen(false);
            }}
            sx={{
              px: 3,
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground'
              }
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GroupLeaderGroupManagmentPage;
