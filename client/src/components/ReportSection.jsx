import PropTypes from 'prop-types';
import { FaUsersLine } from 'react-icons/fa6';
import { MdLibraryBooks, MdAutoGraph } from 'react-icons/md';
import Grid from '@mui/material/Grid';

import { useTheme } from '@mui/material/styles';
import HoverSocialCard from './cards/statistics/HoverSocialCard';
import { ThemeMode } from 'config';
import { FormattedMessage } from 'react-intl';

export const ReportsSection = ({ loading, numOfUsers, numOfGroups, numOfcampaigns, groupleader }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4} lg={3} sm={6}>
        <HoverSocialCard
          loading={loading}
          primary={<FormattedMessage id="groups" />}
          secondary={`${numOfGroups}`}
          iconPrimary={FaUsersLine}
          color={theme.palette.primary.main}
        />
      </Grid>
      <Grid item xs={12} md={4} lg={3} sm={6}>
        <HoverSocialCard
          loading={loading}
          primary={<FormattedMessage id="users" />}
          secondary={`${numOfUsers}`}
          iconPrimary={FaUsersLine}
          color={theme.palette.info.main}
        />
      </Grid>
      {groupleader ? (
        <Grid item xs={12} md={4} lg={3} sm={6}>
          <HoverSocialCard
            loading={loading}
            primary={<FormattedMessage id="active-campaigns" />}
            secondary={`${numOfGroups}`}
            iconPrimary={MdLibraryBooks}
            color={theme.palette.info.main}
          />
        </Grid>
      ) : (
        <Grid item xs={12} md={4} lg={3} sm={6}>
          <HoverSocialCard
            loading={loading}
            primary={<FormattedMessage id="active-campaigns" />}
            secondary={`${numOfcampaigns}`}
            iconPrimary={MdAutoGraph}
            color={theme.palette.mode === ThemeMode.DARK ? theme.palette.secondary[200] : theme.palette.secondary.dark}
          />
        </Grid>
      )}
      {groupleader ? (
        <Grid item xs={12} md={4} lg={3} sm={6}>
          <HoverSocialCard
            loading={loading}
            primary={<FormattedMessage id="training-modules" />}
            secondary={`${numOfcampaigns}`}
            iconPrimary={MdAutoGraph}
            color={theme.palette.mode === 'dark' ? theme.palette.secondary[200] : theme.palette.secondary.dark}
          />
        </Grid>
      ) : (
        <Grid item xs={12} md={4} lg={3} sm={6}>
          <HoverSocialCard
            loading={loading}
            primary={<FormattedMessage id="training-modules" />}
            secondary={`18`}
            iconPrimary={MdAutoGraph}
            color={theme.palette.error.main}
          />
        </Grid>
      )}
    </Grid>
  );
};

ReportsSection.propTypes = {
  numOfUsers: PropTypes.number.isRequired,
  numOfGroups: PropTypes.number.isRequired,
  numOfcampaigns: PropTypes.number.isRequired,
  groupleader: PropTypes.bool.isRequired
};
