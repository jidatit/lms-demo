import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Box,
  Typography,
  Autocomplete,
  CircularProgress,
  Divider,
  ListItem,
  Alert
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { TimePicker } from '@mui/x-date-pickers';
import { format, parse } from 'date-fns';
import { toast } from 'utils/toast';
import { Paper, List } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAuth } from 'contexts/AuthContext';
import { useGetGroupMembers, useGetGroups } from 'api/queries/groups';
import { useCourses } from 'api/queries/courses';
import { useCreateScheduleAttackSimulation } from 'api/queries/scheduleAttackSimulations';
import { useCompanies, useCompanySeatDashboard } from 'api/queries/companies';

const CampaignStepperForm = ({ open, onClose }) => {
  const { currentUser } = useAuth();

  // State for Stepper
  const [activeStep, setActiveStep] = useState(0);

  // Step 0: Initial Setup
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState('Simulated Phishing & Security Awareness Training');

  // Step 1: Select Company (NEW)
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Step 2: Select Target Groups
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);

  // Step 3: Select Bundle
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [courseSequence, setCourseSequence] = useState([]);
  const [selectedBundleId, setSelectedBundleId] = useState('');

  // Step 4: Set Campaign Launch
  const [deliverySchedule, setDeliverySchedule] = useState('Deliver Immediately');
  const now = new Date();
  const formattedDate = format(now, 'MM/dd/yyyy');
  const formattedTime = format(now, 'HH:mm:ss');
  const [launchDate, setLaunchDate] = useState(formattedDate);
  const [launchTime, setLaunchTime] = useState(formattedTime);
  const [timeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // General State
  const [loading, setLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');

  // ✅ NEW: State for validation errors
  const [errors, setErrors] = useState({
    campaignName: false,
    selectedCompany: false,
    selectedGroups: false,
    selectedBundle: false,
    launchDate: false,
    launchTime: false
  });

  // ✅ NEW: Fetch companies
  const { data: companiesData, isLoading: loadingCompanies } = useCompanies(
    currentUser?.role === 'admin' ? {} : { createdBy: currentUser?.id }
  );

  // ✅ UPDATED: Fetch seat dashboard for selected company
  const {
    data: dashboardData,
    isLoading: isDashboardLoading
  } = useCompanySeatDashboard(selectedCompany?.id, {
    enabled: !!selectedCompany?.id
  });

  // ✅ UPDATED: Fetch groups filtered by company
  const { data: groupsData, isLoading: groupsLoading } = useGetGroups(
    { companyId: selectedCompany?.id },
    { enabled: !!selectedCompany?.id }
  );

  const { data: membersResponse } = useGetGroupMembers(selectedGroupId);

  const { data: courseData, isLoading: courseLoading } = useCourses(
    { bundleId: selectedBundleId },
    { enabled: !!selectedBundleId }
  );

  const { mutateAsync: createScheduleAttackSimulation } = useCreateScheduleAttackSimulation();

  // Extract companies array
  const companies = useMemo(() => companiesData?.data || [], [companiesData]);

  // Transform groups with user count
  const groups = useMemo(() => {
    if (!groupsData?.data) return [];
    return groupsData.data.map((group) => ({
      ...group,
      user_count: group.groupUsers?.length || 0
    }));
  }, [groupsData]);

  // Filter groups with users
  const filteredGroups = useMemo(
    () => groups.filter((group) => group.user_count > 0),
    [groups]
  );


  // ✅ UPDATED: Get available bundles from seat dashboard - using data.bundles
  const availableBundles = useMemo(() => {
    if (!dashboardData?.bundles) return [];

    return dashboardData?.bundles?.filter(
      (bundle) => {
        // Calculate available seats for this bundle
        const availableSeats = bundle.assignedToThisCompany - bundle.usedInThisCompany;
        return availableSeats > 0 && bundle.canAssign === true;
      }
    );
  }, [dashboardData]);


  // Set users from group members
  useEffect(() => {
    if (membersResponse?.success) {
      setUsers(membersResponse.data || []);
    }
  }, [membersResponse]);

  // Set course sequence when bundle is selected
  useEffect(() => {
    if (courseData?.data) {
      setCourseSequence(courseData.data.map((course) => course.id));
    }
  }, [courseData]);

  // Handle Group Selection for Advance Training
  useEffect(() => {
    if (campaignType === 'Advance Training' && selectedGroups.length > 0) {
      setSelectedGroupId(selectedGroups[0]?.id);
    }
  }, [selectedGroups, campaignType]);

  // Update selected bundle ID
  useEffect(() => {
    if (selectedBundle) {
      setSelectedBundleId(selectedBundle?.bundleId);
    } else {
      setSelectedBundleId('');
      setCourseSequence([]);
    }
  }, [selectedBundle]);

  // Reset dependent selections when company changes
  useEffect(() => {
    setSelectedGroups([]);
    setSelectedUsers([]);
    setSelectedBundle(null);
  }, [selectedCompany]);

  // Reset bundle when groups change
  useEffect(() => {
    setSelectedBundle(null);
  }, [selectedGroups]);

  // ✅ UPDATED: Calculate required seats
  const calculateRequiredSeats = () => {
    if (campaignType === 'Advance Training') {
      return selectedUsers.length;
    }
    // Count unique users across all selected groups
    return selectedGroups.reduce((acc, group) => acc + (group?.user_count || 0), 0);
  };

  // ✅ NEW: Validation functions for each step
  const validateStep = (step) => {
    let isValid = true;
    const newErrors = { ...errors };

    switch (step) {
      case 0: // Initial Setup
        if (!campaignName.trim()) {
          newErrors.campaignName = true;
          isValid = false;

        } else {
          newErrors.campaignName = false;
        }
        break;

      case 1: // Select Company
        if (!selectedCompany) {
          newErrors.selectedCompany = true;
          isValid = false;

        } else {
          newErrors.selectedCompany = false;
        }
        break;

      case 2: // Select Target Groups
        if (selectedGroups.length === 0) {
          newErrors.selectedGroups = true;
          isValid = false;

        } else if (campaignType === 'Advance Training' && selectedUsers.length === 0) {
          newErrors.selectedGroups = true;
          isValid = false;

        } else {
          newErrors.selectedGroups = false;
        }
        break;

      case 3: // Select Bundle
        if (!selectedBundle) {
          newErrors.selectedBundle = true;
          isValid = false;

        } else {
          // ✅ UPDATED: Additional check for seats with new bundle structure
          const requiredSeats = calculateRequiredSeats();
          const availableSeats = selectedBundle.assignedToThisCompany - selectedBundle.usedInThisCompany;

          if (requiredSeats > availableSeats) {
            newErrors.selectedBundle = true;
            isValid = false;

          } else {
            newErrors.selectedBundle = false;
          }
        }
        break;

      case 4: // Set Campaign Launch
        if (deliverySchedule === 'Schedule Later') {
          if (!launchDate) {
            newErrors.launchDate = true;
            isValid = false;

          } else {
            newErrors.launchDate = false;
          }

          if (!launchTime) {
            newErrors.launchTime = true;
            isValid = false;

          } else {
            newErrors.launchTime = false;
          }
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleDateChange = (date) => {
    if (date) {
      setLaunchDate(format(date, 'MM/dd/yyyy'));
      setErrors(prev => ({ ...prev, launchDate: false }));
    }
  };

  const handleTimeChange = (time) => {
    if (time) {
      setLaunchTime(format(time, 'HH:mm:ss'));
      setErrors(prev => ({ ...prev, launchTime: false }));
    }
  };

  const convertDateToSQLFormat = (date) => {
    return format(parse(date, 'MM/dd/yyyy', new Date()), 'yyyy-MM-dd');
  };

  const formatTimeToHHMM = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(courseSequence);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setCourseSequence(items);
  };

  // ✅ UPDATED: Handle Next button click with validation
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  // Handle Form Submission
  const handleSubmit = async () => {
    setLoading(true);

    // Validate all steps before submission
    let allValid = true;
    for (let i = 0; i < steps.length - 1; i++) {
      if (!validateStep(i)) {
        allValid = false;
        break;
      }
    }

    if (!allValid) {
      setLoading(false);
      return;
    }

    const isImmediateDelivery = deliverySchedule === 'Deliver Immediately';

    // Build campaign data
    const campaignData = {
      name: campaignName,
      campaignType,
      companyId: selectedCompany.id, // ✅ NEW
      groupIds: selectedGroups.map((group) => group.id),
      bundleId: selectedBundle.bundleId,
      launchStatus: isImmediateDelivery ? 'Deliver Immediately' : 'Schedule Later',
      timezone: timeZone,
      courseIds: courseSequence,
      ...(campaignType === 'Advance Training' && {
        userIds: selectedUsers.map((user) => user.id)
      }),
      ...(!isImmediateDelivery && {
        launchDate: convertDateToSQLFormat(launchDate),
        launchTime: formatTimeToHHMM(launchTime)
      })
    };

    try {
      const data = await createScheduleAttackSimulation(campaignData);

      if (!data.success) {
        throw new Error(data.message || 'Failed to create simulation');
      }

      toast({ message: 'Campaign Created Successfully!', type: 'success' });
      onClose();

      // Clear form fields
      setCampaignName('');
      setCampaignType('Simulated Phishing & Security Awareness Training');
      setSelectedCompany(null);
      setSelectedGroups([]);
      setSelectedUsers([]);
      setSelectedBundle(null);
      setActiveStep(0);
      setErrors({
        campaignName: false,
        selectedCompany: false,
        selectedGroups: false,
        selectedBundle: false,
        launchDate: false,
        launchTime: false
      });
    } catch (error) {
      toast({ message: error.message || 'Failed to create campaign', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Steps Content
  const getStepContent = (step) => {
    switch (step) {
      case 0: // Initial Setup
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <InputLabel htmlFor="Campaign Name">Campaign Name *</InputLabel>
            <TextField
              placeholder="Campaign Name"
              value={campaignName}
              onChange={(e) => {
                setCampaignName(e.target.value);
                setErrors(prev => ({ ...prev, campaignName: false }));
              }}
              fullWidth
              error={errors.campaignName}
              helperText={errors.campaignName ? "Campaign name is required" : ""}
            />
            <InputLabel htmlFor="Campaign Type">Campaign Type</InputLabel>
            <FormControl component="fieldset">
              <RadioGroup value={campaignType} onChange={(e) => setCampaignType(e.target.value)}>
                <FormControlLabel
                  value="Simulated Phishing & Security Awareness Training"
                  control={<Radio />}
                  label="Simulated Phishing & Security Awareness Training"
                />
                <FormControlLabel
                  value="Advance Training"
                  control={<Radio />}
                  label="Advance Training"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        );

      case 1: // ✅ NEW: Select Company
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <InputLabel>Select organization *</InputLabel>
            {loadingCompanies ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : companies.length === 0 ? (
              <Alert severity="warning">
                No organizations found. Please create a organization first.
              </Alert>
            ) : (
              <Autocomplete
                options={companies}
                getOptionLabel={(company) => company.name}
                value={selectedCompany}
                onChange={(e, newValue) => {
                  setSelectedCompany(newValue);
                  setErrors(prev => ({ ...prev, selectedCompany: false }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select organization"
                    error={errors.selectedCompany}
                    helperText={errors.selectedCompany ? "Please select a organization" : ""}
                  />
                )}
                noOptionsText="No organizations available"
              />
            )}
          </Box>
        );

      case 2: // Select Target Groups
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!selectedCompany ? (
              <Alert severity="info">Please select a organization first</Alert>
            ) : groupsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : filteredGroups.length === 0 ? (
              <Alert severity="warning">
                No groups with users found for this organization. Please create groups and add users first.
              </Alert>
            ) : (
              <>
                <InputLabel>Select Target Group(s) *</InputLabel>
                {campaignType === 'Advance Training' ? (
                  <Autocomplete
                    options={filteredGroups}
                    getOptionLabel={(group) => `${group.name} (${group.user_count} users)`}
                    value={selectedGroups.length > 0 ? selectedGroups[0] : null}
                    onChange={(e, newValue) => {
                      setSelectedGroups(newValue ? [newValue] : []);
                      setSelectedUsers([]);
                      setErrors(prev => ({ ...prev, selectedGroups: false }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select Target Group"
                        error={errors.selectedGroups && selectedGroups.length === 0}
                        helperText={errors.selectedGroups && selectedGroups.length === 0 ? "Please select at least one group" : ""}
                      />
                    )}
                    noOptionsText="No groups available"
                  />
                ) : (
                  <Autocomplete
                    multiple
                    options={filteredGroups}
                    getOptionLabel={(group) => `${group.name} (${group.user_count} users)`}
                    value={selectedGroups}
                    onChange={(e, newValue) => {
                      setSelectedGroups(newValue);
                      setSelectedUsers([]);
                      setErrors(prev => ({ ...prev, selectedGroups: false }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select Target Group(s)"
                        error={errors.selectedGroups && selectedGroups.length === 0}
                        helperText={errors.selectedGroups && selectedGroups.length === 0 ? "Please select at least one group" : ""}
                      />
                    )}
                    noOptionsText="No groups available"
                  />
                )}

                {campaignType === 'Advance Training' && selectedGroups.length === 1 && (
                  <>
                    <InputLabel>Select Target User(s) *</InputLabel>
                    <Autocomplete
                      multiple
                      options={users}
                      getOptionLabel={(user) => `${user?.firstName} ${user?.lastName}`}
                      value={selectedUsers}
                      onChange={(e, newValue) => {
                        setSelectedUsers(newValue);
                        setErrors(prev => ({ ...prev, selectedGroups: false }));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select Target User(s)"
                          error={errors.selectedGroups && selectedUsers.length === 0}
                          helperText={errors.selectedGroups && selectedUsers.length === 0 ? "Please select at least one user" : ""}
                        />
                      )}
                    />
                  </>
                )}
              </>
            )}
          </Box>
        );

      case 3: // Select Bundle
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!selectedCompany ? (
              <Alert severity="info">Please select a organization first</Alert>
            ) : !selectedGroups.length ? (
              <Alert severity="info">Please select target groups first</Alert>
            ) : isDashboardLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <FormControl fullWidth error={errors.selectedBundle}>
                  <InputLabel>Select Bundle *</InputLabel>
                  <Select
                    value={selectedBundle || ''}
                    onChange={(e) => {
                      setSelectedBundle(e.target.value);
                      setErrors(prev => ({ ...prev, selectedBundle: false }));
                    }}
                    placeholder="Select Bundle"
                  >
                    {availableBundles.length === 0 ? (
                      <MenuItem disabled>
                        No bundles with available seats assigned to this organization
                      </MenuItem>
                    ) : (
                      // ✅ UPDATED: Display bundles with new structure
                      availableBundles.map((bundle) => {
                        const availableSeats = bundle.assignedToThisCompany - bundle.usedInThisCompany;
                        const requiredSeats = calculateRequiredSeats();
                        const isDisabled = requiredSeats > availableSeats;

                        return (
                          <MenuItem
                            key={bundle.bundleId}
                            value={bundle}
                            disabled={isDisabled}
                          >
                            {bundle.title} - Available: {availableSeats} -
                            Required: {requiredSeats}
                            {isDisabled && ' (Not Enough Seats)'}
                          </MenuItem>
                        );
                      })
                    )}
                  </Select>
                  {errors.selectedBundle && (
                    <Typography color="error" variant="caption">
                      Please select a bundle with enough seats
                    </Typography>
                  )}
                </FormControl>

                <Typography variant="body2">
                  21 Days Until Due: Number of days before assignments become overdue.
                </Typography>
                <Typography variant="body2">
                  Intelligent Assignment: Employees will be assigned training and phishing simulation when applicable.
                </Typography>

                {/* Display courses if a bundle is selected */}
                {selectedBundle && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Course Sequence (Drag to reorder)
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
                      {courseLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                          <CircularProgress />
                        </Box>
                      ) : courseData?.data?.length > 0 ? (
                        <DragDropContext onDragEnd={handleDragEnd}>
                          <Droppable droppableId="courses">
                            {(provided) => (
                              <List {...provided.droppableProps} ref={provided.innerRef}>
                                {courseSequence.map((courseId, index) => {
                                  const course = courseData?.data?.find((c) => c.id === courseId);
                                  if (!course) return null;

                                  return (
                                    <Draggable
                                      key={course.id.toString()}
                                      draggableId={course.id.toString()}
                                      index={index}
                                    >
                                      {(provided) => (
                                        <Box
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          sx={{
                                            p: 2,
                                            mb: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            bgcolor: 'primary.lighter',
                                            borderRadius: 1,
                                          }}
                                        >
                                          <Typography>{course.title}</Typography>
                                        </Box>
                                      )}
                                    </Draggable>
                                  );
                                })}
                                {provided.placeholder}
                              </List>
                            )}
                          </Droppable>
                        </DragDropContext>
                      ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                          <Typography>No courses available for this bundle.</Typography>
                        </Box>
                      )}
                    </Paper>
                  </Box>
                )}
              </>
            )}
          </Box>
        );

      case 4: // Set Campaign Launch
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <RadioGroup value={deliverySchedule} onChange={(e) => setDeliverySchedule(e.target.value)}>
                <FormControlLabel value="Deliver Immediately" control={<Radio />} label="Deliver Immediately" />
                <FormControlLabel value="Schedule Later" control={<Radio />} label="Schedule Later" />
              </RadioGroup>

              {deliverySchedule === 'Schedule Later' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <InputLabel>Launch Date *</InputLabel>
                  <DesktopDatePicker
                    inputFormat="MM/dd/yyyy"
                    value={parse(launchDate, 'MM/dd/yyyy', new Date())}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={errors.launchDate}
                        helperText={errors.launchDate ? "Please select a launch date" : ""}
                      />
                    )}
                    minDate={now}
                  />

                  <InputLabel>Launch Time *</InputLabel>
                  <TimePicker
                    value={parse(launchTime, 'HH:mm:ss', new Date())}
                    onChange={handleTimeChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={errors.launchTime}
                        helperText={errors.launchTime ? "Please select a launch time" : ""}
                      />
                    )}
                  />
                </Box>
              )}
            </Box>
          </LocalizationProvider>
        );

      case 5: // Review & Submit
        return (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: '#fafafa' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Review & Submit
            </Typography>

            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <Typography variant="body1">
                <strong>Campaign Name:</strong> {campaignName}
              </Typography>
              <Typography variant="body1">
                <strong>Campaign Type:</strong> {campaignType}
              </Typography>
              <Typography variant="body1">
                <strong>Organization:</strong> {selectedCompany?.name}
              </Typography>
              <Typography variant="body1">
                <strong>Selected Bundle:</strong> {selectedBundle?.title} ({selectedBundle?.bundleType})
              </Typography>

              <Divider sx={{ my: 1 }} />

              {/* ✅ UPDATED: Seat consumption warning with new bundle structure */}
              {selectedBundle && (
                <Alert severity="info" sx={{ my: 1 }}>
                  <Typography variant="body2">
                    <strong>Seats to be consumed:</strong> {calculateRequiredSeats()} seats
                  </Typography>
                  <Typography variant="body2">
                    <strong>Available after creation:</strong>{' '}
                    {selectedBundle ? (selectedBundle.assignedToThisCompany - selectedBundle.usedInThisCompany - calculateRequiredSeats()) : 0} seats
                  </Typography>
                </Alert>
              )}

              <Divider sx={{ my: 1 }} />

              <Typography variant="body1">
                <strong>Target Group(s):</strong>
              </Typography>
              <List dense>
                {selectedGroups.map((group, index) => (
                  <ListItem key={index} sx={{ pl: 0 }}>
                    {group.name} ({group.user_count} users)
                  </ListItem>
                ))}
              </List>

              {campaignType === 'Advance Training' && selectedUsers.length > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body1">
                    <strong>Target User(s):</strong>
                  </Typography>
                  <List dense>
                    {selectedUsers.map((user, index) => (
                      <ListItem key={index} sx={{ pl: 0 }}>
                        {user.firstName} {user.lastName}
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              <Divider sx={{ my: 1 }} />

              <Typography variant="body1">
                <strong>Campaign Launching Date & Time:</strong>{' '}
                {deliverySchedule === 'Deliver Immediately' ? 'Immediately' : `${launchDate} at ${launchTime}`}
              </Typography>
            </Box>
          </Paper>
        );

      default:
        return 'Unknown step';
    }
  };

  // ✅ UPDATED: Stepper Labels with Company step
  const steps = [
    'Initial Setup',
    'Select organization',
    'Select Target Groups',
    'Select Bundle',
    'Set Campaign Launch',
    'Review & Submit'
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create Campaign</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button disabled={activeStep === 0} onClick={() => setActiveStep((prevStep) => prevStep - 1)}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            if (activeStep === steps.length - 1) {
              handleSubmit();
            } else {
              handleNext();
            }
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : activeStep === steps.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CampaignStepperForm;