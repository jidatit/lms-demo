import React, { useMemo, useEffect, useState, lazy } from 'react';
import {
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  InputAdornment,
  CircularProgress,
  Typography,
  Tabs,
  Tab
  // FormControl
} from '@mui/material';

import axios from 'axios';
import axiosInstance from 'utils/axiosConfig';
import { GoPhishAccountAPIKey, GoPhishPublicURL } from 'utils/constants';
import Loadable from 'components/Loadable';
import { toast } from 'utils/toast';
import { FormControl } from '@mui/base';
import { MdCampaign, MdOutlineCampaign } from 'react-icons/md';
import CampaignStepperForm from 'components/CampaignStepperForm';
import { useAuth } from 'contexts/AuthContext';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import CampaignDetailsModal from '../components/CampaignDetailsModel';
import { useCourses } from 'api/queries/courses';
import { useAttackSimulations, useCreateAttackSimulation } from 'api/queries/attackSimulation';
import { useScheduleAttackSimulations } from 'api/queries/scheduleAttackSimulations';
const MuiTableEnhanced = Loadable(lazy(() => import('components/tables/mui-tables/enhanced')));
// import MuiTableEnhanced from 'components/tables/mui-tables/enhanced';

const Campaigns = () => {
  const [allCampaigns, setallCampaigns] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allEmailTemplates, setallEmailTemplates] = useState([]);
  const [allLandingPages, setallLandingPages] = useState([]);
  const [allSMTPS, setallSMTPS] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [openCampaginModal, setOpenCampaginModal] = useState(false);
  const { currentUser } = useAuth();
  const [value, setValue] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);
  const groups = [
    { label: 'Attack Simulation', value: 0, icon: <MdCampaign size={20} /> },
    { label: 'Campaigns', value: 1, icon: <MdOutlineCampaign size={20} /> }
  ];
  //For campaign detials preview modal
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isScheduleCampaign, setIsScheduleCampaign] = useState(false);

  const { data, refetch } = useCourses({});
  const { data: attackSimulationsData, refetch: refetchAttackSimulations, isLoading: attackSimulationsLoading } = useAttackSimulations({});
  const createAttackSimulationMutation = useCreateAttackSimulation();

  const { data: allCampaignsLaunch, isLoading, refetch: scheduleReferesh } = useScheduleAttackSimulations();

  useEffect(() => {
    if (data?.data) {
      setCoursesData(data?.data);
    }
  }, [data]);

  useEffect(() => {
    if (attackSimulationsData?.data) {
      setallCampaigns(attackSimulationsData.data);
    } else if (attackSimulationsData) {
      setallCampaigns([]);
    }
  }, [attackSimulationsData]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  };
  const [formValues, setFormValues] = useState({
    name: '',
    template: '',
    page: '',
    url: '',
    sendEmailsBy: null,
    smtp: '',
    courseId: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getEmailTemplatesFromGoPhish = async () => {
    try {
      const resp = await axios.get(`${GoPhishPublicURL}/api/templates/?api_key=${GoPhishAccountAPIKey}`);
      setallEmailTemplates(Array.isArray(resp.data) ? resp.data : []);
    } catch (error) {
      console.log(error);
      setallEmailTemplates([]); // Set as empty array in case of error
    }
  };

  const getLandingPagesFromGoPhish = async () => {
    try {
      const resp = await axios.get(`${GoPhishPublicURL}/api/pages/?api_key=${GoPhishAccountAPIKey}`);
      setallLandingPages(Array.isArray(resp.data) ? resp.data : []);
    } catch (error) {
      console.log(error);
      setallLandingPages([]);
    }
  };

  const getSendingProfileFromGoPhish = async () => {
    try {
      const resp = await axios.get(`${GoPhishPublicURL}/api/smtp/?api_key=${GoPhishAccountAPIKey}`);
      setallSMTPS(Array.isArray(resp.data) ? resp.data : []);
    } catch (error) {
      console.log(error);
      setallSMTPS([]);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    getEmailTemplatesFromGoPhish();
    getLandingPagesFromGoPhish();
    getSendingProfileFromGoPhish();
  };
  const handleCampaignOpen = () => {
    setOpenCampaginModal(true);
  };
  const handleCampaignClose = () => {
    setOpenCampaginModal(false);
  };

  const getAllCampaigns = () => {
    refetchAttackSimulations();
  };

  const handleAddCampaign = async () => {
    try {
      setLoading(true);
      const payload = {
        name: formValues.name,
        template: formValues.template,
        url: formValues.url,
        page: formValues.page,
        smtp: formValues.smtp,
        courseId: formValues.course
        // "sendbydate": formValues.sendEmailsBy
      };

      await createAttackSimulationMutation.mutateAsync(payload);

      toast({
        message: 'Campaign draft created successfully!',
        type: 'success'
      });
      getAllCampaigns();
      handleClose();
      setFormValues({
        name: '',
        template: '',
        page: '',
        url: '',
        sendEmailsBy: null,
        smtp: '',
        courseId: ''
      });
    } catch (error) {
      console.log('Error while adding campaign: ', error);
      toast({
        message: `Error while adding campaign: ${error.message || error}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  const headCells = [
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
      id: 'template',
      numeric: false,
      disablePadding: true,
      label: 'Email Template'
    },
    {
      id: 'url',
      numeric: false,
      disablePadding: true,
      label: 'URL'
    },
    {
      id: 'page',
      numeric: false,
      disablePadding: true,
      label: 'Landing Page'
    },
    {
      id: 'smtp',
      numeric: false,
      disablePadding: true,
      label: 'Sending Profile'
    },
    // {
    //   id: 'sendbydate',
    //   numeric: false,
    //   disablePadding: true,
    //   label: 'Send By Date'
    // },
    {
      id: 'actions',
      numeric: false,
      disablePadding: false,
      label: 'Actions'
    }
  ];
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
      id: 'campaignType',
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
      id: 'launchDate',
      numeric: false,
      disablePadding: true,
      label: 'Launch Date'
    },
    {
      id: 'launchTime',
      numeric: false,
      disablePadding: true,
      label: 'Launch Time'
    },
    {
      id: 'actions',
      numeric: false,
      disablePadding: false,
      label: 'Actions'
    }
    // {
    //   id: 'target_groups',
    //   numeric: false,
    //   disablePadding: true,
    //   label: 'Target Groups'
    // }
  ];

  const handleDelete = (campaign) => {
    setIsScheduleCampaign(false);
    setSelectedCampaign(campaign);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSchedule = (campaign) => {
    setIsScheduleCampaign(true);
    setSelectedCampaign(campaign);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = async () => {
    getAllCampaigns();
  };
  const handleLaunchCampaignDetails = async (campaignId) => {
    try {
      setSelectedCampaignId(campaignId);
      setModalOpen(true); // Open modal when campaign is selected
    } catch (error) {
      console.error('Error fetching campaign details:', error);
    }
  };
  // Handle modal close
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCampaignId('');
  };

  return (
    <>
      <Box>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          {groups.map((group, index) => (
            <Tab key={index} label={group.label} icon={group.icon} iconPosition="start" value={group.value} />
          ))}
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <MuiTableEnhanced
          action={handleOpen}
          data={allCampaigns}
          handleDelete={handleDelete}
          headCells={headCells}
          loading={attackSimulationsLoading}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <MuiTableEnhanced
          action={handleCampaignOpen}
          data={allCampaignsLaunch?.data}
          headCells={headCellsLaunch}
          LaunchCampagin={true}
          loading={dataLoading}
          handleDelete={handleDeleteSchedule}
          onRowClick={handleLaunchCampaignDetails} // Add this prop
        />
      </TabPanel>
      <CampaignStepperForm open={openCampaginModal} onClose={handleCampaignClose} />

      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>Create a New Campaign</DialogTitle>
        <DialogContent>
          <InputLabel htmlFor="name" sx={{ mb: 0.5 }}>
            Name
          </InputLabel>
          <TextField margin="dense" name="name" id="name" type="text" fullWidth value={formValues.name} onChange={handleInputChange} />
          {/* <FormWizardSelect /> */}

          <FormControl fullWidth margin="dense">
            <InputLabel id="emailtemp" sx={{ mb: 0.5 }}>
              Email Template
            </InputLabel>
            <Select
              labelId="emailtemp"
              value={formValues.template}
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  template: e.target.value
                })
              }
              fullWidth
              sx={{ mb: 0.5 }}
            >
              {allEmailTemplates?.map((emailtemp) => (
                <MenuItem key={emailtemp.id} value={emailtemp.name}>
                  {emailtemp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel sx={{ mb: 0.5 }}>Landing Page</InputLabel>
            <Select name="page" value={formValues.page} onChange={handleInputChange} fullWidth sx={{ mb: 0.5 }}>
              {allLandingPages?.map((landingpage, index) => (
                <MenuItem key={index} value={landingpage.name}>
                  {landingpage.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <InputLabel htmlFor="url" sx={{ mb: 0.5 }}>
            URL
          </InputLabel>
          <TextField
            margin="dense"
            name="url"
            id="url"
            type="url"
            fullWidth
            value={formValues.url}
            onChange={handleInputChange}
            placeholder="http://192.168.1.1"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel sx={{ mb: 0.5 }}>Sending Profile</InputLabel>
            <Select name="smtp" value={formValues.smtp} onChange={handleInputChange} fullWidth>
              {allSMTPS?.map((smtp, index) => (
                <MenuItem key={index} value={smtp.name}>
                  {smtp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel sx={{ mb: 0.5 }}>Related Course</InputLabel>
            <Select
              name="course"
              value={formValues.course}
              onChange={handleInputChange}
              fullWidth
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 400,
                    overflowY: 'auto' // Enable vertical scrolling
                  }
                }
              }}
            >
              {coursesData?.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions
          sx={{
            padding: '16px',
            display: 'flex'
          }}
        >
          <Button onClick={handleClose} color="error" disabled={loading}>
            Cancel
          </Button>

          <Button
            onClick={async () => {
              setLoading(true);
              await handleAddCampaign(); // Your campaign creation logic
              setLoading(false);
              if (!loading) {
                handleClose();
              }
            }}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        campaign={selectedCampaign}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onSuccess={handleDeleteSuccess}
        isScheduleCampaign={isScheduleCampaign}
      />
      <CampaignDetailsModal open={modalOpen} onClose={handleCloseModal} campaignId={selectedCampaignId} />
    </>
  );
};

export default Campaigns;
