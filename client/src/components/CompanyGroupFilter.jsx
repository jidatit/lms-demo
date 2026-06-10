import { useState } from 'react';
import {
  Box,
  Button,
  Popover,
  TextField,
  IconButton,
  CircularProgress,
  Typography
} from '@mui/material';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { ArrowDown2, ArrowRight2, CloseCircle } from 'iconsax-react';

import { useCompanies } from 'api/queries/companies';
import { useGetGroups } from 'api/queries/groups'; // your existing hook
import { useAuth } from 'contexts/AuthContext';

const CompanyGroupFilter = ({
  groupName,
  setGroupName,
  selectedGroupId,
  setSelectedGroupId,
  handleChange,
  onClear
}) => {
  const { currentUser } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isGroupLeader = currentUser?.role === 'groupLeader';

  // 1. For Admin & Contributor → get companies + groups
  const { data: companiesData, isLoading: loadingCompanies } = useCompanies(
    currentUser?.role === 'admin' ? {} : { createdBy: currentUser?.id },
    { enabled: !isGroupLeader } // disable if group leader
  );

  // 2. For Group Leader → get only their groups
  const { data: groupsData, isLoading: loadingGroups } = useGetGroups(
    {
      groupLeaderId: currentUser?.id,
      enabled: isGroupLeader
    }
  );

  const isLoading = isGroupLeader ? loadingGroups : loadingCompanies;

  // Unified groups array (with company name attached)
  const allGroups = isGroupLeader
    ? (groupsData?.data || []).map(g => ({
      id: g.id,
      name: g.name,
      companyName: g.company?.name || 'Unknown Company'
    }))
    : (companiesData?.data || []).flatMap(company =>
      (company.groups || []).map(group => ({
        id: group.id,
        name: group.name,
        companyName: company.name
      }))
    );

  // Filter by search
  const filteredGroups = allGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGroupSelect = (group) => {
    setGroupName(group.name);
    setSelectedGroupId(group.id);
    handleChange?.(group.id, group.name);
    setAnchorEl(null);
    setSearchQuery('');
  };

  const handleClear = () => {
    setGroupName('');
    setSelectedGroupId(null);
    setSearchQuery('');
    onClear?.();
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const displayName = groupName
    ? groupName.length > 16
      ? `${groupName.slice(0, 16)}...`
      : groupName
    : 'Select Group';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Button
        variant="outlined"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          textTransform: 'none',
          justifyContent: 'space-between',
          py: 1
        }}
      >
        <Typography noWrap sx={{ fontSize: '0.875rem' }}>
          {displayName}
        </Typography>
      </Button>

      {selectedGroupId && (
        <IconButton size="small" onClick={handleClear} sx={{ p: 0.5 }}>
          <CloseCircle size={18} />
        </IconButton>
      )}

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { width: 300 } }}
      >
        <Box sx={{ p: 2 }}>
          <TextField
            size="small"
            placeholder="Search group or company..."
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
            autoFocus
          />

          {isLoading ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <CircularProgress size={28} />
            </Box>
          ) : filteredGroups.length === 0 ? (
            <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              No groups found
            </Typography>
          ) : (
            <SimpleTreeView
              slots={{ collapseIcon: ArrowDown2, expandIcon: ArrowRight2 }}
              sx={{ maxHeight: 320, overflow: 'auto' }}
            >
              {filteredGroups.map((group) => {
                const isSelected = selectedGroupId === group.id;
                return (
                  <TreeItem
                    key={group.id}
                    itemId={`group-${group.id}`}
                    label={
                      <Box sx={{ display: 'flex', flexDirection: 'column', py: 0.5 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: isSelected ? 600 : 500,
                            color: isSelected ? 'primary.main' : 'inherit'
                          }}
                        >
                          {group.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: isSelected ? 'primary.light' : 'text.secondary'
                          }}
                        >
                          {group.companyName}
                        </Typography>
                      </Box>
                    }
                    onClick={() => handleGroupSelect(group)}
                    sx={{
                      my: 0.5,
                      borderRadius: 1,
                      bgcolor: isSelected ? 'primary.lighter' : 'transparent',
                      border: isSelected ? '1px solid' : '1px solid transparent',
                      borderColor: isSelected ? 'primary.main' : 'transparent',
                      pl: 2,
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.lighter' : 'action.hover',
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  />
                );
              })}
            </SimpleTreeView>
          )}
        </Box>
      </Popover>
    </Box>
  );
};

export default CompanyGroupFilter;