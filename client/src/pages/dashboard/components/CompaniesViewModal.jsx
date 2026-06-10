import React, { useState, useEffect } from 'react';
import IconButton from 'components/@extended/IconButton';
import axios from 'axios';
import { fetchCompaniesByContributor, fetchGroupsByCompany } from '../utils/comapniesFunctions';
import { Box } from '@mui/system';
import { Dialog, DialogContent, TextField, Typography } from '@mui/material';
import { ArrowLeft, SearchFavorite } from 'iconsax-react';
import GroupInfo from './GroupInfo';
import axiosInstance from 'utils/axiosConfig';
import { useGetGroupMembers } from 'api/queries/groups';

const CompaniesViewModal = ({ open, onClose, contributorId, }) => {
  const [companies, setCompanies] = useState([]);
  const [SelectedGroupId, setSelectedGroupId] = useState('');

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [groups, setGroups] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [groupLeadersData, setGroupLeadersData] = useState([]);
  const [subscribersData, setSubscribersData] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [currentView, setCurrentView] = useState('companies'); // 'companies', 'groups', 'groupDetails'
  const { data: membersResponse, isPending: isGroupsPending } = useGetGroupMembers(SelectedGroupId);

  useEffect(() => {
    if (open && contributorId) {
      loadCompanies();
    }
  }, [open, contributorId]);

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

  useEffect(() => {
    if (SelectedGroupId) {
      setCurrentView('groupDetails');
    }
  }, [SelectedGroupId]);

  const resetState = () => {
    setCurrentView('companies');
    setSelectedCompany(null);
    setSearchText('');
    setGroupLeadersData([]);
    setSubscribersData([]);
    setSelectedGroupId(null);
  };
  useEffect(() => {
    if (membersResponse?.success) {
      const members = membersResponse.data || [];

      setGroupLeadersData(members.filter((m) => m.role === 'groupLeader'));
      setSubscribersData(members.filter((m) => m.role === 'subscriber'));
    }
  }, [membersResponse]);
  const loadCompanies = async () => {
    try {
      const data = await fetchCompaniesByContributor(contributorId);
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const handleCompanySelect = async (company) => {
    setSelectedCompany(company);
    try {
      const data = await fetchGroupsByCompany(company.id);
      setGroups(data);
      setCurrentView('groups');
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const handleBack = () => {
    if (currentView === 'groupDetails') {
      setCurrentView('groups');
      setSelectedGroupId(null);
    } else if (currentView === 'groups') {
      setCurrentView('companies');
      setSelectedCompany(null);
    }
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchText.toLowerCase()) || company.vat_number.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredGroups = groups.filter(
    (group) => group.name.toLowerCase().includes(searchText.toLowerCase()) || group.id.toString().includes(searchText.toLowerCase())
  );

  const handleChange = (group) => {
    setSelectedGroupId(group?.id);
    setGroupName(group?.name);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {(currentView === 'groups' || currentView === 'groupDetails') && (
            <IconButton onClick={handleBack} sx={{ mr: 1 }}>
              <ArrowLeft size={20} />
            </IconButton>
          )}
          <Typography variant="h6">
            {currentView === 'companies'
              ? 'Organization'
              : currentView === 'groups'
                ? `Groups - ${selectedCompany?.name}`
                : `Group Details - ${groupName}`}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>X</IconButton>
      </Box>

      <DialogContent sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        {currentView === 'groupDetails' ? (
          // Handle No Members
          groupLeadersData.length === 0 && subscribersData.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="subtitle1" color="text.secondary">
                No members found in this group.
              </Typography>
            </Box>
          ) : (
            <GroupInfo groupLeaders={groupLeadersData} subscribers={subscribersData} />
          )
        ) : (
          <>
            <TextField
              size="small"
              placeholder={currentView === 'groups' ? 'Search groups...' : 'Search organization...'}
              variant="outlined"
              fullWidth
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Box sx={{ color: 'primary.main', mr: 1 }}>
                    <SearchFavorite size={18} />
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
                {currentView === 'companies' ? (
                  <>
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
                        Organization Name
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        Address
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        VAT Number
                      </Typography>
                    </Box>

                    {filteredCompanies.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant="subtitle1" color="text.secondary">
                          No organization found.
                        </Typography>
                      </Box>
                    ) : (
                      filteredCompanies.map((company) => (
                        <Box
                          key={company.id}
                          onClick={() => handleCompanySelect(company)}
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1.5fr 1fr',
                            gap: 2,
                            p: 1.5,
                            cursor: 'pointer',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              bgcolor: 'primary.lighter'
                            }
                          }}
                        >
                          <Typography sx={{ fontSize: '0.875rem' }}>{company.name}</Typography>
                          <Typography sx={{ fontSize: '0.875rem' }}>{company.address}</Typography>
                          <Typography sx={{ fontSize: '0.875rem' }}>{company.vatNumber}</Typography>
                        </Box>
                      ))
                    )}
                  </>
                ) : (
                  <>
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

                    {filteredGroups.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant="subtitle1" color="text.secondary">
                          No groups found.
                        </Typography>
                      </Box>
                    ) : (
                      filteredGroups.map((group) => (
                        <Box
                          key={group.id}
                          onClick={() => handleChange(group)}
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1.5fr 1fr',
                            gap: 2,
                            p: 1.5,
                            cursor: 'pointer',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            // bgcolor: SelectedGroupId === group.id ? 'primary.soft' : 'primary.lighter',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              bgcolor: SelectedGroupId === group.id ? 'primary.soft' : 'primary.lighter'
                            }
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: '0.875rem',
                              color: SelectedGroupId === group.id ? 'primary.main' : 'text.primary'
                            }}
                          >
                            {group.id.split('-')[0]}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: SelectedGroupId === group.id ? 'primary.main' : 'text.primary'
                            }}
                          >
                            {group.name}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.875rem',
                              color: SelectedGroupId === group.id ? 'primary.main' : 'text.secondary',
                              bgcolor: SelectedGroupId === group.id ? 'primary.lighter' : 'action.hover',
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
                      ))
                    )}
                  </>
                )}
              </Box>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CompaniesViewModal;
