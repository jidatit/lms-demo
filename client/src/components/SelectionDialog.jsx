import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  CircularProgress
} from '@mui/material';
import { fetchAllCompanies, fetchCompaniesByContributor, fetchGroupsByCompany } from 'pages/dashboard/utils/comapniesFunctions';
import { ArrowLeft } from 'iconsax-react';
import { useAuth } from 'contexts/AuthContext';

const SelectionDialog = ({
  dialogOpen,
  setDialogOpen,
  SelectedGroupName,
  setSelectedGroupName,
  setSelectedGroupId,
  setSelectedGroup,
  referesh,
  setReferesh,
  isContributor
}) => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [groups, setGroups] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [showGroups, setShowGroups] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (dialogOpen) {
      loadCompanies();
    }
  }, [dialogOpen]);

  const resetState = () => {
    setShowGroups(false);
    setSelectedCompany(null);
    setSearchText('');
    setSelectedGroupName('');
  };

  useEffect(() => {
    if (referesh) {
      resetState();
      setReferesh(false);
    }
  }, [referesh]);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const data = isContributor ? await fetchCompaniesByContributor(currentUser?.id) : await fetchAllCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySelect = async (company) => {
    setSelectedCompany(company);
    setIsLoading(true);
    try {
      const data = await fetchGroupsByCompany(company.id);
      setGroups(data);
      setShowGroups(true);
      setSearchText('');
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupChange = (groupId, groupName, group) => {
    setSelectedGroupId(groupId);
    setSelectedGroupName(groupName);
    setSelectedGroup(group);
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleBack = () => {
    setShowGroups(false);
    setSearchText('');
    setSelectedGroupName('');
    setSelectedGroup('');
    setSelectedGroupId('');
    resetState();
  };

  const handleConfirm = () => {
    setDialogOpen(false);
  };

  const filteredCompanies = companies.filter((company) => company.name.toLowerCase().includes(searchText.toLowerCase()));

  const filteredGroups = groups.filter(
    (group) => group.name.toLowerCase().includes(searchText.toLowerCase()) || group.id.toString().includes(searchText.toLowerCase())
  );

  return (
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
      <DialogTitle
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        {showGroups && (
          <IconButton onClick={handleBack} size="small" sx={{ mr: 1 }}>
            <ArrowLeft size={20} />
          </IconButton>
        )}
        {showGroups ? `Select Group - ${selectedCompany?.name}` : 'Select Company'}
      </DialogTitle>

      <DialogContent sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <TextField
          size="small"
          placeholder={showGroups ? 'Search group...' : 'Search company...'}
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
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress />
            </Box>
          ) : (
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
                {showGroups ? (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Group ID
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Group Name
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Sign-In Type
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Company Name
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Address
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      VAT Number
                    </Typography>
                  </>
                )}
              </Box>

              {!showGroups ? (
                filteredCompanies.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No companies found
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
                )
              ) : filteredGroups.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No groups found
                  </Typography>
                </Box>
              ) : (
                filteredGroups.map((group) => (
                  <Box
                    key={group.id}
                    onClick={() => handleGroupChange(group.id, group.name, group)}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1.5fr 1fr',
                      gap: 2,
                      p: 1.5,
                      cursor: 'pointer',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      // bgcolor: SelectedGroupName === group.name ? 'primary.soft' : 'primary.lighter',
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
                      {group.id.split('-')[0]}
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
                ))
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

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
            handleConfirm();
            setDialogOpen(false);
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectionDialog;
