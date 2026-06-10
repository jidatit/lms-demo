import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useTheme } from '@mui/material/styles';
import MainCard from 'components/MainCard';
import { ArrowDown2, ArrowUp, DocumentDownload, Link as LinkIcon } from 'iconsax-react';

//charts import
import IncomeChart from 'sections/dashboard/analytics/IncomeChart';
import TotalIncome from 'sections/widgets/chart/TotalIncome';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import Dot from 'components/@extended/Dot';
import CompanyGroupFilter from 'components/CompanyGroupFilter';

const DashboardGraphs = ({ mode, admin }) => {
  const theme = useTheme();
  const [slot, setSlot] = useState('week');
  const [quantity, setQuantity] = useState('By volume');

  const handleQuantity = (e) => {
    setQuantity(e.target.value);
  };

  const handleChange = (event, newAlignment) => {
    if (newAlignment) setSlot(newAlignment);
  };

  const [groupName, setGroupName] = useState('');
  const [SelectedGroupId, setSelectedGroupId] = useState('');
  const handleChangeGroup = (groupId, groupName) => {
    setGroupName(groupName);
    setSelectedGroupId(groupId); // Set the selected group ID
    // getCampaignDataSummary(selectedName);
  };

  return (
    <Grid container spacing={3} marginY={'10px'}>
      {/* Income Overview Section */}
      <Grid item xs={12}>
        <MainCard>
          <Grid container>
            <Grid item xs={12} sm={6}>
              <Stack alignItems={{ xs: 'center', sm: 'flex-start' }}>
                <Typography variant="h5">Learning Progress</Typography>
                <Stack direction="row" alignItems="center" sx={{ mt: 2 }}>
                  <ArrowDown2 variant="Bold" style={{ color: theme.palette.error.main, paddingRight: '4px' }} />
                  <Typography color={theme.palette.error.main}>$1,12,900 (45.67%)</Typography>
                </Stack>
                <Typography color="text.secondary" sx={{ display: 'block' }}>
                  Compare to : 01 Dec 2021-08 Jan 2022
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent={{ xs: 'center', sm: 'flex-end' }}
                sx={{
                  mr: 2,
                  flexWrap: 'wrap',
                  gap: 1,
                  '@media (max-width: 1400px)': {
                    justifyContent: 'center'
                  }
                }}
              >
                {!admin && (
                  <Link
                    to={
                      mode === 'contributor'
                        ? '/contrib_dashboard/reporting'
                        : mode === 'groupleader'
                          ? '/groupleader_dashboard/reporting'
                          : '/dashboard/reporting'
                    }
                  >
                    <IconButton>
                      <HiOutlineDocumentReport size={32} color="#009688" />
                    </IconButton>
                  </Link>
                )}

                <ToggleButtonGroup exclusive onChange={handleChange} value={slot}>
                  <ToggleButton disabled={slot === 'week'} value="week" sx={{ px: 2, py: 0.5 }}>
                    Week
                  </ToggleButton>
                  <ToggleButton disabled={slot === 'month'} value="month" sx={{ px: 2, py: 0.5 }}>
                    Month
                  </ToggleButton>
                </ToggleButtonGroup>
                {/* <Select value={quantity} onChange={handleQuantity} size="small">
                  <MenuItem value="By volume">Select Groups</MenuItem>
                  <MenuItem value="By margin">Group 1</MenuItem>
                  <MenuItem value="By sales">Group 2</MenuItem>
                </Select> */}
                <CompanyGroupFilter
                  groupName={groupName}
                  setGroupName={setGroupName}
                  selectedGroupId={SelectedGroupId}
                  setSelectedGroupId={setSelectedGroupId}
                  // getCampaignDataSummary={getCampaignDataSummary}
                  handleChange={handleChangeGroup}
                />
              </Stack>
            </Grid>
          </Grid>
          <Box sx={{ pt: 1 }}>
            <IncomeChart slot={slot} quantity={quantity} />
          </Box>
        </MainCard>
      </Grid>

      {/* Total Income Section */}
      {/* <Grid item xs={12} md={6}>
      <TotalIncome mode={mode} />
    </Grid> */}
    </Grid>
  );
};

DashboardGraphs.propTypes = {
  // Define prop types if needed
};

export default DashboardGraphs;
