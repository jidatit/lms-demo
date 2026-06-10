import React, { useState, useEffect } from 'react';

import {
  FormLabel,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  Typography,
  Box,
  styled,
  CardContent,
  Card,
  CardActionArea,
  Paper,
  Grid,
  Chip,
  Tab,
  Tabs,
  Modal,
  ListItemIcon,
  ListItemText,
  Menu,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Alert,
  TextField,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  ButtonGroup,
  Tooltip,
  IconButton
} from '@mui/material';

import axios from 'axios';

import axiosInstance from 'utils/axiosConfig';
import { useAuth } from 'contexts/AuthContext';
import { GoPhishAccountAPIKey, GoPhishPublicURL } from 'utils/constants';
import { AddCircle } from 'iconsax-react';
import MainCard from 'components/MainCard';
import { Stack } from '@mui/system';
import Users from 'pages/dashboard/components/Users';
import { toast } from 'utils/toast';
import AnimateButton from 'components/@extended/AnimateButton';
import SelectionDialog from 'components/SelectionDialog';
import { fetchCompaniesByContributor } from 'pages/dashboard/utils/comapniesFunctions';
import ConfirmDialog from 'pages/dashboard/components/ConfirmDialog';
import { MdDelete } from 'react-icons/md';
import { activateLmsGroup, deactivateLmsGroup, deleteLmsGroup } from 'pages/dashboard/utils/groupApiUtils';
import { useGetGroupBundles } from 'api/queries/groupBundles';
import {
  useAddGroupMember,
  useBulkCreateGroupMembers,
  useCreateGroupMember,
  useCreateGroupWithLeader,
  useDeleteGroup,
  useGetGroupMembers,
  useToggleGroupStatus
} from 'api/queries/groups';
import { useCreateCompany } from 'api/queries/companies';
import { useUpdateUser } from 'api/queries/users';
import { useHandleRemoveGroupMember } from 'hooks/useRemoveGroupMember';
import { addMembersToGophishGroup, addMemberToGophishGroup, createGophishGroup, deleteGophishGroup } from 'utils/gophishUtils';

const steps = ['Add Group', 'Add Group leader', 'Select Company'];

const GroupManagmentPage = () => {
  const { currentUser } = useAuth();
  const [coursesData, setCoursesData] = useState([]);
  const [bundlesData, setBundlesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(false);

  const [SelectedGroupName, setSelectedGroupName] = useState('');
  const [SelectedCourseTitle, setSelectedCourseTitle] = useState('');
  const [SelectedGroupId, setSelectedGroupId] = useState('');
  const [SelectedCourseId, setSelectedCourseId] = useState('');
  const [SelectedBundleTitle, setSelectedBundleTitle] = useState('');
  const [SelectedBundleId, setSelectedBundleId] = useState('');
  const [addgroupmodal, setaddgroupmodal] = useState(false);
  const [value, setValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [ContributorsData, setContributorsData] = useState([]);

  //NEW MUTATIONS
  const { data: membersResponse, isLoading, refetch: fetchMembers } = useGetGroupMembers(SelectedGroupId);
  const { mutateAsync: createCompany, isPending: isCreatingCompany } = useCreateCompany();
  const { mutateAsync: createGroupWithLeader } = useCreateGroupWithLeader();
  const { mutateAsync: updateUser, isPending: isUpdatePending } = useUpdateUser();
  const { data: attachedBundlesData, isLoading: bundlesLoading } = useGetGroupBundles(SelectedGroupId);
  const { mutateAsync: toggleGroupStatus } = useToggleGroupStatus();
  const { mutateAsync: deleteGroup } = useDeleteGroup();
  const { mutateAsync: createGroupMember } = useCreateGroupMember();
  const { handleRemoveGroupMember, loading: loadingRemove } = useHandleRemoveGroupMember();
  const { mutateAsync: addGroupMember } = useAddGroupMember();
  const { mutateAsync: bulkCreateMembers, isLoading: isCreatingGroupMembers } = useBulkCreateGroupMembers();

  const handleChange = (index, field, value) => {
    const newUsers = [...users];
    newUsers[index] = {
      ...newUsers[index],
      [field]: value
    };
    setUsers(newUsers);
  };
  const [formData, setFormData] = useState({
    groupname: '',
    signinType: 'passwordless',
    gl_firstname: '',
    gl_lastname: '',
    gl_email: ''
  });

  const getMembersAndFilter = async () => {
    try {
      const res = await fetchMembers(); // react-query refetch
      const members = res?.data?.data || []; // react-query wraps response in { data }

      setGroupLeadersData(members.filter((m) => m.role === 'groupLeader'));
      setSubscribersData(members.filter((m) => m.role === 'subscriber'));
    } catch (error) {
      console.error('Error fetching and filtering members:', error);
    }
  };

  // run automatically when query finishes
  useEffect(() => {
    if (membersResponse?.success) {
      const members = membersResponse.data || [];
      setGroupLeadersData(members.filter((m) => m.role === 'groupLeader'));
      setSubscribersData(members.filter((m) => m.role === 'subscriber'));
    }
  }, [membersResponse]);

  const handleAddGroup = () => {
    setaddgroupmodal(true);
  };

  const handleCloseGroupModal = () => {
    setaddgroupmodal(false);
  };

  const handleGroupSubmit = async () => {
    setLoading(true);
    let gophishGroupId = null;

    try {
      // Step 1: Create group in GoPhish (separated into util)
      const targets = [
        {
          email: formData.gl_email,
          first_name: formData.gl_firstname,
          last_name: formData.gl_lastname,
          position: 'Group Leader'
        }
      ];
      const gophishGroup = await createGophishGroup(formData.groupname, targets);
      gophishGroupId = gophishGroup.id;

      // Step 2: Prepare payload for backend API
      const payload = {
        name: formData.groupname,
        companyId: formDataCompany.company_id, // Assuming company_id is always set now (from previous creation/selection)
        signInType: formData.signinType, // Note: Fix typo in form to "passwordLess" if needed
        gophishGroupID: gophishGroupId,
        groupLeader: {
          firstName: formData.gl_firstname,
          lastName: formData.gl_lastname,
          email: formData.gl_email,
          signInType: formData.signinType
        }
      };

      // // If signInType is 'withPassword', include password (assuming you add gl_password to formData)
      // if (formData.signinType === 'withPassword') {
      //   if (!formData.gl_password) {
      //     throw new Error('Password is required for "withPassword" sign-in type');
      //   }
      //   payload.groupLeader.password = formData.gl_password;
      // }

      // Step 3: Call the backend API using TanStack mutation
      const resp = await createGroupWithLeader(payload);

      // Handle success
      if (resp.success && resp.message) {
        toast({
          message: `${resp.message}`,
          type: 'success'
        });
      }
      const newGroup = resp?.data; // full group object from backend

      // Update local state with the new group
      setSelectedGroupId(resp.data.id); // Assuming resp.data is the group object with id
      setSelectedGroupName(formData.groupname);
      setSelectedGroup(newGroup); // <-- use the full object directly

      handleCloseGroupModal();
      handleCloseGLModal();
    } catch (error) {
      // Rollback: Delete GoPhish group if backend creation fails
      if (gophishGroupId) {
        await deleteGophishGroup(gophishGroupId);
      }

      // Extract backend message safely
      const backendMessage = error?.error?.message || error?.message || '';

      let userMessage;

      if (backendMessage.includes('Mailbox does not exist')) {
        userMessage = 'The provided email address does not exist. Please check for typos or use a valid mailbox.';
      } else if (backendMessage.includes('Failed to send OTP email')) {
        userMessage = 'We could not send the verification email. Please check the email address and try again.';
      } else {
        // default → show backend message if available, otherwise generic
        userMessage = backendMessage || 'Failed to create group';
      }

      toast({
        message: userMessage,
        type: 'error'
      });

      console.error('Failed to create group:', error?.error || error);
    } finally {
      setLoading(false);
    }
  };

  const [ListOfAttachedCourses, setListOfAttachedCourses] = useState([]);

  // Update useEffect to handle setting the list and loading state
  useEffect(() => {
    if (SelectedGroupId) {
      getMembersAndFilter(); // Keep this as is
    }
    setLoading(bundlesLoading); // Update loading state based on query
    if (attachedBundlesData) {
      setListOfAttachedCourses(attachedBundlesData.data); // Set the bundles array (assuming data is the array of bundles)
    }
  }, [SelectedGroupId, attachedBundlesData, bundlesLoading]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [GroupLeadersData, setGroupLeadersData] = useState([]);
  const [SubscribersData, setSubscribersData] = useState([]);

  const [editingUser, setEditingUser] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const editUser = async ({ currentId, editingUser }) => {
    try {
      setLoading(true);

      const { id, createdAt, updatedAt, groupUsers, ...updateData } = editingUser;

      const response = await updateUser({
        id: currentId,
        updateData
      });
      // Update local state based on role
      const updatedUser = response.data; // or response.user, based on your API response

      if (editingUser.role === 'contributor') {
        setContributorsData((prev) => prev.map((user) => (user.id === currentId ? updatedUser : user)));
      } else if (editingUser.role === 'subscriber') {
        setSubscribersData((prev) => prev.map((user) => (user.id === currentId ? updatedUser : user)));
      } else if (editingUser.role === 'groupLeader') {
        setGroupLeadersData((prev) => prev.map((user) => (user.id === currentId ? updatedUser : user)));
      }

      setEditingUser({});
      toast({
        message: `User updated successfully!`,
        type: 'success'
      });
    } catch (error) {
      toast({
        message: `Error updating ${editingUser.role}!`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  const [currentId, setCurrentId] = useState(null);
  const [age, setAge] = useState('');
  const [selectedEmail, setSelectedEmail] = useState();
  const [selectedUser, setSelectedUser] = useState(null);

  //Add  and delete Group Leader
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [GLformData, setGLFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const handleAddGroupLeader = () => {
    if (SelectedGroupId) {
      setGLFormData({ group_id: SelectedGroupId, firstName: '', lastName: '', email: '' });
      setIsEditMode(false);
      setOpenModal(true);
    } else {
      // setEmptyGroupSelError(true);
      toast({
        message: 'No group Selected!',
        type: 'error'
      });
    }
  };
  const handleCloseGLModal = () => {
    setOpenModal(false);
    setFormData({ firstName: '', lastName: '', email: '' });
  };
  const handleSubmitGroupLeader = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);

      // Normalize email
      const normalizedEmail = GLformData.email.trim().toLowerCase();

      // Try creating user + group member
      const response = await createGroupMember({
        groupId: SelectedGroupId,
        userData: {
          ...GLformData,
          email: normalizedEmail,
          role: 'groupLeader',
          signInType: selectedGroup?.signInType || 'passwordless'
        }
      });

      toast({ message: 'Group Leader added successfully!', type: 'success' });

      // Add to GoPhish group
      if (selectedGroup?.gophishGroupID) {
        await addMemberToGophishGroup(selectedGroup.gophishGroupID, {
          email: normalizedEmail,
          first_name: GLformData.firstName,
          last_name: GLformData.lastName,
          position: 'Group Leader'
        });
        toast({ message: 'GoPhish group updated successfully!', type: 'success' });
      }

      // Update state locally
      const newUser = response?.data?.user;
      if (newUser?.role === 'groupLeader') {
        setGroupLeadersData((prev) => [...prev, newUser]);
      }
    } catch (error) {
      // if (error?.status === 409) {
      //   // Save info to show in modal
      //   setExistingUserEmail(GLformData.email.trim().toLowerCase());
      //   setExistingUserId(error?.data?.userId || null); // Assuming API returns userId
      //   setShowAddExistingModal(true);
      // } else {
      toast({ message: error.message || 'Error adding group leader', type: 'error' });
      // }
    } finally {
      setLoading(false);
      handleCloseGLModal();
    }
  };
  const handleSubmitGLBulk = () => {
    event.preventDefault();
    const validUsers = users.filter((user) => user.firstName.trim() !== '' || user.lastName.trim() !== '' || user.email.trim() !== '');

    if (validUsers.length === 0) {
      // setShowError(true);
      return;
    }

    // setShowError(false);
    handleSubmitBulkGL(validUsers);
  };
  const handleSubmitBulkGL = async (users) => {
    try {
      setLoading(true);

      // 1. Create users in your platform
      const response = await bulkCreateMembers({
        groupId: SelectedGroupId,
        users: users.map((u) => ({
          ...u,
          email: u.email.trim().toLowerCase(),
          role: 'groupLeader',
          signInType: selectedGroup?.signInType || 'passwordless'
        }))
      });

      if (response.success) {
        toast({
          message: 'Users created successfully in platform!',
          type: 'success'
        });

        const createdUsers = response.data.created || [];

        // 2. Add to GoPhish group only if new users exist
        if (createdUsers.length > 0 && selectedGroup?.gophishGroupID) {
          const newTargets = createdUsers.map((item) => ({
            email: item.user.email,
            first_name: item.user.firstName,
            last_name: item.user.lastName,
            position: 'Group Leader'
          }));

          if (newTargets.length > 0) {
            await addMembersToGophishGroup(selectedGroup.gophishGroupID, newTargets);
            toast({ message: 'GoPhish group updated successfully!', type: 'success' });
          }
        }

        // 3. Handle per-user errors if any
        if (response.data.errors?.length > 0) {
          response.data.errors.forEach((err) => {
            toast({
              message: `Error adding ${err.userData.email}: ${err.error}`,
              type: 'error'
            });
          });
        }

        // 4. Update state only if new group leaders exist
        const newUsers = createdUsers.map((item) => item.user).filter((user) => user.role === 'groupLeader');

        if (newUsers.length > 0) {
          setGroupLeadersData((prev) => [...prev, ...newUsers]);
        }

        setOpenModalBulkGL(false);
        setUsers([{ firstName: '', lastName: '', email: '' }]);
      }
    } catch (error) {
      console.error(error);
      toast({ message: 'Error adding group leaders!', type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  const handleConfirmDelete = async () => {
    await handleRemoveGroupMember(selectedGroup.id, selectedGroup.gophishGroupID, selectedUser.id, selectedUser.email);
  };
  const [openModalSM, setOpenModalSM] = useState(false);
  const [openModalBulk, setOpenModalBulk] = useState(false);
  const [openModalBulkGL, setOpenModalBulkGL] = useState(false);
  const [formDataSM, setFormDataSM] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [numberOfUsers, setNumberOfUsers] = useState(1);
  const [users, setUsers] = useState([
    {
      firstName: '',
      lastName: '',
      email: ''
    }
  ]);
  const handleAddSubscriber = () => {
    if (SelectedGroupId) {
      setFormDataSM({ group_id: SelectedGroupId, firstName: '', lastName: '', email: '' });
      setIsEditMode(false);
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
  const handleCloseModalBulk = () => {
    setNumberOfUsers(1);
    setUsers([{ firstName: '', lastName: '', email: '' }]);

    setOpenModalBulk(false);
    setOpenModalBulkGL(false);

    // }
  };
  const handleNumberChange = (e) => {
    const num = parseInt(e.target.value) || 1;
    const limitedNum = Math.min(Math.max(num, 1), 100);
    setNumberOfUsers(limitedNum);

    if (limitedNum > users.length) {
      const newUsers = [...users];
      for (let i = users.length; i < limitedNum; i++) {
        newUsers.push({ firstName: '', lastName: '', email: '' });
      }
      setUsers(newUsers);
    } else {
      // Remove excess user objects
      setUsers(users.slice(0, limitedNum));
    }
  };
  const handleSubmitSubscriber = async (event) => {
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
      const newUser = response?.data?.user;
      if (newUser?.role === 'subscriber') {
        setSubscribersData((prev) => [...prev, newUser]);
      }
    } catch (error) {
      toast({ message: error.message || 'Error adding Staff', type: 'error' });
    } finally {
      setLoading(false);
      handleCloseModalSM();
    }
  };
  //Confirm Delete
  const handleConfirmDeleteSubs = async () => {
    if (!selectedUser) return;
    try {
      await handleRemoveGroupMember(selectedGroup.id, selectedGroup.gophishGroupID, selectedUser.id, selectedUser.email);
    } catch (error) {
      toast({
        message: error.message || 'Error fetching group data!',
        type: 'error'
      });
    }
  };
  const handleAddBulkSubscribers = () => {
    if (SelectedGroupId) {
      setIsEditMode(false);
      setOpenModalBulk(true);
    } else {
      toast({
        message: 'No group Selected!',
        type: 'error'
      });
    }
  };
  const handleAddBulkGL = () => {
    if (SelectedGroupId) {
      setIsEditMode(false);
      setOpenModalBulkGL(true);
    } else {
      toast({
        message: 'No group Selected!',
        type: 'error'
      });
    }
  };
  const handleSubmitBulkSubscribers = async (users) => {
    try {
      setLoading(true);

      // 1. Create users in your platform
      const response = await bulkCreateMembers({
        groupId: SelectedGroupId,
        users: users.map((u) => ({
          ...u,
          email: u.email.trim().toLowerCase(),
          role: 'subscriber',
          signInType: selectedGroup?.signInType || 'passwordless'
        }))
      });

      if (!response.success) {
        toast({ message: 'Failed to create Staff in platform!', type: 'error' });
        return;
      }

      const createdUsers = response.data.created || [];

      // Show different toast if none created
      if (createdUsers.length > 0) {
        toast({ message: 'Staff created successfully in platform!', type: 'success' });
      } else {
        toast({ message: 'No new Staff were created', type: 'info' });
      }

      // 2. Add to GoPhish group (if exists and new users created)
      if (createdUsers.length > 0 && selectedGroup?.gophishGroupID) {
        const newTargets = createdUsers.map((item) => ({
          email: item.user.email,
          first_name: item.user.firstName,
          last_name: item.user.lastName,
          position: 'Subscriber'
        }));

        if (newTargets.length > 0) {
          await addMembersToGophishGroup(selectedGroup.gophishGroupID, newTargets);
          toast({ message: 'GoPhish group updated successfully!', type: 'success' });
        }
      }

      // 3. Handle per-user errors if any
      if (response.data.errors?.length > 0) {
        response.data.errors.forEach((err) => {
          toast({
            message: `Error adding ${err.userData.email}: ${err.error}`,
            type: 'error'
          });
        });
      }

      // 4. Update state with all newly created subscribers
      const newUsers = createdUsers.map((item) => item.user).filter((user) => user.role === 'subscriber');

      if (newUsers.length > 0) {
        setSubscribersData((prev) => [...prev, ...newUsers]);
      }

      // 5. Reset modal + input fields
      setOpenModalBulk(false);
      setUsers([{ firstName: '', lastName: '', email: '' }]);
    } catch (error) {
      console.error(error);
      toast({ message: 'Error adding Staff!', type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = () => {
    event.preventDefault();
    const validUsers = users.filter((user) => user.firstName.trim() !== '' || user.lastName.trim() !== '' || user.email.trim() !== '');

    if (validUsers.length === 0) {
      // setShowError(true);
      return;
    }
    // setShowError(false);
    handleSubmitBulkSubscribers(validUsers);
  };

  const [activeStep, setActiveStep] = useState(0);
  const handleNext = () => {
    // setActiveStep(activeStep + 1);
    if (activeStep === steps.length - 1) {
      // handlePlaceOrder();
      handleGroupSubmit();
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };
  const [companies, setCompanies] = useState([]);
  const fetchCompanies = async () => {
    try {
      let companiesData = [];

      // If the user is an admin, fetch all companies
      companiesData = await fetchCompaniesByContributor(currentUser?.id);
      setCompanies(companiesData); // Set the fetched companies in state
    } catch (error) {
      setError('Failed to fetch companies.');
    }
  };
  useEffect(() => {
    fetchCompanies(); // Call the fetch function
  }, []); //

  const [formDataCompany, setFormDataCompany] = useState({
    company_id: '', // To hold the selected company ID
    new_company: '', // To hold the new company name
    company_address: '', // New company address
    company_vat: '',
    company_email: '' // New company VAT
  });

  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const handleCompanyChange = (e) => {
    setFormDataCompany({ ...formDataCompany, company_id: e.target.value });
  };

  const handleCreateCompanyChange = (e) => {
    const { name, value } = e.target;
    setFormDataCompany({ ...formDataCompany, [name]: value });
  };

  const handleToggle = (event) => {
    if (event.target.value === 'new') {
      // Reset all fields except company_id when creating a new company
      setFormDataCompany({
        ...formDataCompany,
        company_id: '', // Reset company_id
        new_company: '', // Clear the new company name
        company_address: '', // Clear the company address
        company_vat: '', // Clear the company VAT
        company_email: ''
      });
    } else {
      // If user is selecting an existing company, reset all other fields except company_id
      setFormDataCompany({
        ...formDataCompany,
        new_company: '', // Clear the new company name
        company_address: '', // Clear the company address
        company_vat: '',
        company_email: ''
      });
    }

    setIsCreatingNew(event.target.value === 'new');
  };
  const handleCreateCompany = async () => {
    try {
      const payload = {
        name: formDataCompany.new_company,
        address: formDataCompany.company_address,
        vatNumber: formDataCompany.company_vat,
        email: formDataCompany.company_email
      };
      const res = await createCompany(payload);

      // Store the new company's ID
      setFormDataCompany((prev) => ({
        ...prev,
        company_id: res.data.id,
        new_company: '', // Clear new company fields
        company_address: '',
        company_vat: '',
        company_email: ''
      }));

      // Add to local companies list for dropdown
      setCompanies((prev) => [...prev, res.data]);

      // Show success message
      toast({
        message: 'Company created successfully!',
        type: 'success'
      });

      // Switch back to "Select Existing Company" tab
      setIsCreatingNew(false);
    } catch (err) {
      let errorMessage = err.message || 'Failed to create company';

      if (err.message?.includes('VAT number is required')) {
        errorMessage = 'VAT Number is required, must be 8–15 characters long, and contain only uppercase letters (A–Z) and numbers (0–9).';
      }

      toast({
        message: errorMessage,
        type: 'error'
      });
    }
  };
  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <>
            <DialogContent>
              <InputLabel htmlFor="groupname" sx={{ mb: 0.5 }}>
                Group Name
              </InputLabel>
              <TextField
                autoFocus
                required
                margin="dense"
                id="groupname"
                name="groupname"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.groupname}
                onChange={(e) => setFormData({ ...formData, groupname: e.target.value })}
              />
            </DialogContent>
            <DialogContent>
              <FormLabel id="signinType">Select Signin Type:</FormLabel>
              <RadioGroup
                aria-labelledby="signinType"
                defaultValue="passwordless"
                name="signinType"
                value={formData.signinType}
                onChange={(e) => setFormData({ ...formData, signinType: e.target.value })}
              >
                <FormControlLabel value="passwordless" control={<Radio />} label="Password Less" />
                <FormControlLabel value="withPassword" control={<Radio />} label="With Password" />
                <FormControlLabel value="microsoftEntraID" control={<Radio />} label="Microsoft Entra Id" />

              </RadioGroup>
            </DialogContent>
          </>
        );

      case 1:
        return (
          <>
            <DialogContent>
              <InputLabel htmlFor="gl_firstname" sx={{ mt: 2, mb: 0.5 }}>
                First Name
              </InputLabel>
              <TextField
                autoFocus
                required
                margin="dense"
                id="gl_firstname"
                name="gl_firstname"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.gl_firstname}
                onChange={(e) => setFormData({ ...formData, gl_firstname: e.target.value })}
                disabled={loading}
              />
              <InputLabel htmlFor="gl_lastname" sx={{ mt: 2, mb: 0.5 }}>
                Last Name
              </InputLabel>
              <TextField
                required
                margin="dense"
                id="gl_lastname"
                name="gl_lastname"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.gl_lastname}
                onChange={(e) => setFormData({ ...formData, gl_lastname: e.target.value })}
                disabled={loading}
              />
              <InputLabel htmlFor="gl_email" sx={{ mt: 2, mb: 0.5 }}>
                Email
              </InputLabel>
              <TextField
                required
                margin="dense"
                id="gl_email"
                name="gl_email"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.gl_email}
                onChange={(e) => setFormData({ ...formData, gl_email: e.target.value })}
                disabled={loading}
              />
            </DialogContent>
          </>
        );

      case 2:
        return (
          <>
            <DialogContent>
              <FormLabel id="companySelection">Select or Create Company</FormLabel>

              <div style={{ marginTop: '8px' }}>
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <RadioGroup row value={isCreatingNew ? 'new' : 'existing'} onChange={handleToggle}>
                    <FormControlLabel value="existing" control={<Radio />} label="Select Existing Company" />
                    <FormControlLabel value="new" control={<Radio />} label="Create New Company" />
                  </RadioGroup>
                </FormControl>
              </div>

              {isCreatingNew ? (
                <div>
                  <InputLabel htmlFor="new_company" sx={{ mt: 2, mb: 0.5 }}>
                    Company Name
                  </InputLabel>
                  <TextField
                    required
                    margin="dense"
                    id="new_company"
                    name="new_company"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={formDataCompany.new_company || ''}
                    onChange={handleCreateCompanyChange}
                    disabled={isCreatingCompany}
                  />

                  <InputLabel htmlFor="company_address" sx={{ mt: 2, mb: 0.5 }}>
                    Company Address
                  </InputLabel>
                  <TextField
                    margin="dense"
                    id="company_address"
                    name="company_address"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={formDataCompany.company_address || ''}
                    onChange={handleCreateCompanyChange}
                    disabled={isCreatingCompany}
                  />

                  <InputLabel htmlFor="company_vat" sx={{ mt: 2, mb: 0.5 }}>
                    Company VAT
                  </InputLabel>
                  <TextField
                    margin="dense"
                    id="company_vat"
                    name="company_vat"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={formDataCompany.company_vat || ''}
                    onChange={handleCreateCompanyChange}
                    disabled={isCreatingCompany}
                  />
                  <InputLabel htmlFor="company_email" sx={{ mt: 2, mb: 0.5 }}>
                    Company Email
                  </InputLabel>
                  <TextField
                    required
                    margin="dense"
                    id="company_email"
                    name="company_email"
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={formDataCompany.company_email || ''}
                    onChange={handleCreateCompanyChange}
                    disabled={isCreatingCompany}
                    placeholder="company@example.com"
                  />

                  {/* Create Company Button */}
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={handleCreateCompany}
                    disabled={
                      isCreatingCompany || !formDataCompany.new_company.trim() // Require company name
                    }
                  >
                    {isCreatingCompany ? 'Creating...' : 'Create Company'}
                  </Button>
                </div>
              ) : (
                <div>
                  <Select fullWidth value={formDataCompany.company_id || ''} onChange={handleCompanyChange} displayEmpty>
                    <MenuItem value="" disabled>
                      Select an existing company
                    </MenuItem>
                    {companies && companies.length > 0 ? (
                      companies.map((company) => (
                        <MenuItem key={company.id} value={company.id}>
                          {company.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No companies available</MenuItem>
                    )}
                  </Select>
                </div>
              )}
            </DialogContent>
          </>
        );

      default:
        throw new Error('Unknown step');
    }
  }

  //Delete group
  const [referesh, setReferesh] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    action: null, // 'delete' | 'deactivate' | 'activate'
    title: '',
    description: '',
    confirmText: ''
  });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const openConfirm = (action) => {
    let title, description, confirmText;
    switch (action) {
      case 'delete':
        title = 'Confirm Group Deletion';
        description = 'Deleting the group will remove all their data—including members, stats, progress—permanently. Are you sure?';
        confirmText = 'Delete';
        break;
      case 'deactivate':
        title = 'Confirm Group Deactivation';
        description =
          'Deactivating will prevent all group leaders and staff from signing in. They will be blocked immediately. Proceed?';
        confirmText = 'Deactivate';
        break;
      case 'activate':
        title = 'Confirm Group Activation';
        description = 'Re-activating will allow group members to sign in again. Proceed?';
        confirmText = 'Activate';
        break;
      default:
        return;
    }

    setConfirmConfig({
      open: true,
      action,
      title,
      description,
      confirmText
    });
  };
  const handleConfirm = async () => {
    setConfirmLoading(true);

    try {
      const { action } = confirmConfig;
      if (action === 'delete') {
        await deleteGroup({
          groupId: SelectedGroupId,
          gophishGroupId: selectedGroup?.gophishGroupID // adjust key name based on your data
        });
        toast({ message: 'Group deleted successfully.', type: 'success' });
      } else if (action === 'deactivate' || action === 'activate') {
        const resp = await toggleGroupStatus(SelectedGroupId);
        if (resp.success) {
          toast({ message: resp.message, type: 'success' }); // Message will be "Group activated/deactivated successfully"
        }
      }
      setSelectedGroupName(null);
      setSelectedGroupId(null);
      setSelectedGroup(null);
      setReferesh(true);
      setConfirmConfig((c) => ({ ...c, open: false }));
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Operation failed';
      toast({ message: errorMessage, type: 'error' });
    } finally {
      setConfirmLoading(false);
    }
  };
  return (
    <>
      <Grid
        container
        sx={{
          position: 'relative'
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleAddGroup()}
          sx={{
            position: 'absolute',
            top: '-69px',
            right: '16px'
          }}
          startIcon={<AddCircle />}
        >
          Create Group
        </Button>
      </Grid>
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
                Select Group By Company
              </Button>
            }
          >
            <Stack spacing={3}>
              {/* — Header: Name + Status */}
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h5" color="text.secondary">
                  {SelectedGroupName || 'No Group Selected'}
                </Typography>
                {selectedGroup && (
                  <Chip
                    label={selectedGroup?.isActive ? 'Active' : 'Inactive'}
                    color={selectedGroup?.isActive ? 'success' : 'default'}
                    size="small"
                  />
                )}
              </Box>

              {/* — Actions */}
              {SelectedGroupId && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    onClick={() => openConfirm('delete')}
                    color="error"
                    variant="outlined"
                    size="small"
                    startIcon={<MdDelete />}
                    sx={{ minWidth: 100 }}
                  >
                    Delete
                  </Button>

                  {selectedGroup?.isActive ? (
                    <Button onClick={() => openConfirm('deactivate')} variant="outlined" color="info" size="small" sx={{ minWidth: 100 }}>
                      Deactivate
                    </Button>
                  ) : (
                    <Button onClick={() => openConfirm('activate')} variant="contained" size="small" sx={{ minWidth: 100 }}>
                      Activate
                    </Button>
                  )}
                </Stack>
              )}
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
      <ConfirmDialog
        open={confirmConfig.open}
        title={confirmConfig.title}
        description={confirmConfig.description}
        loading={confirmLoading}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmConfig((c) => ({ ...c, open: false }))}
        confirmText={confirmConfig.confirmText}
        cancelText="Cancel"
      />
      <SelectionDialog
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        SelectedGroupName={SelectedGroupName}
        setSelectedGroupName={setSelectedGroupName}
        setSelectedGroupId={setSelectedGroupId}
        setSelectedGroup={setSelectedGroup}
        referesh={referesh}
        setReferesh={setReferesh}
        isContributor={true}
      />

      {!SelectedGroupId && (
        <Card
          sx={{
            padding: '20px',
            marginTop: '16px'
          }}
        >
          {!SelectedGroupId && (
            <Alert color="error" variant="outlined">
              Please select a group to continue.
            </Alert>
          )}
        </Card>
      )}
      {SelectedGroupId && (
        <Stack
          sx={{
            marginTop: '16px'
          }}
        >
          <Users
            contributors={ContributorsData}
            subscribers={SubscribersData}
            groupleaders={GroupLeadersData}
            editingUser={editingUser}
            SelectedGroupId={SelectedGroupId}
            setSelectedGroupId={setSelectedGroupId}
            groupManagment={true}
            coursesData={ListOfAttachedCourses}
            isAdmin={true}
            age={age}
            setAge={setAge}
            loadingRemove={loadingRemove}
            setEditingUser={setEditingUser}
            editUser={editUser}
            setCurrentId={setCurrentId}
            selectedEmail={selectedEmail}
            currentId={currentId}
            setSelectedEmail={setSelectedEmail}
            selectedUser={selectedUser}
            handleConfirmDelete={handleConfirmDelete}
            setSelectedUser={setSelectedUser}
            handleAddGroupLeader={handleAddGroupLeader}
            handleAddSubscriber={handleAddSubscriber}
            handleConfirmDeleteSubs={handleConfirmDeleteSubs}
            handleAddBulkSubscribers={handleAddBulkSubscribers}
            handleAddBulkGL={handleAddBulkGL}
            isUpdatePending={isUpdatePending}
          />
        </Stack>
      )}
      <Dialog open={addgroupmodal} onClose={handleCloseGroupModal} fullWidth maxWidth="sm">
        <DialogTitle>Add Group</DialogTitle>
        <Stepper activeStep={activeStep} sx={{ pt: 2, pb: 1, px: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length ? (
          <></>
        ) : (
          <>
            {getStepContent(activeStep)}
            <Stack direction="row" justifyContent={activeStep !== 0 ? 'space-between' : 'flex-end'} sx={{ marginX: 2 }}>
              {activeStep !== 0 && (
                <Button onClick={handleBack} sx={{ my: 3, ml: 1 }}>
                  Back
                </Button>
              )}
              <Button
                disabled={
                  loading ||
                  (activeStep === 0 && formData.groupname === '') ||
                  (activeStep === 1 && (!formData.gl_firstname || !formData.gl_lastname || !formData.gl_email)) ||
                  (activeStep === 2 && (isCreatingNew ? !formDataCompany.new_company : !formDataCompany.company_id))
                }
                variant="contained"
                onClick={handleNext}
                sx={{ my: 3, ml: 1 }}
              >
                {activeStep === steps.length - 1 ? (loading ? 'Adding...' : 'Add') : 'Next'}
              </Button>
            </Stack>
          </>
        )}
      </Dialog>

      <Dialog
        open={openModal}
        onClose={loading ? null : handleCloseGLModal}
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmitGroupLeader
        }}
        fullWidth
      >
        <DialogTitle>{isEditMode ? 'Edit Group Leader' : 'Add Group Leader'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>To add a Group Leader, please provide their First Name, Last Name, and Email</DialogContentText>
          <InputLabel htmlFor="firstName" sx={{ mb: 0.5 }}>
            First Name
          </InputLabel>
          <TextField
            autoFocus
            required
            id="firstName"
            value={GLformData.firstName}
            onChange={(e) => setGLFormData({ ...GLformData, firstName: e.target.value })}
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
            value={GLformData.lastName}
            onChange={(e) => setGLFormData({ ...GLformData, lastName: e.target.value })}
            fullWidth
            margin="dense"
            sx={{ mb: 1.5 }}
          />
          <InputLabel htmlFor="email" sx={{ mb: 0.5 }}>
            Email
          </InputLabel>
          <TextField
            disabled={isEditMode}
            required
            id="email"
            type="email"
            value={GLformData.email}
            onChange={(e) => setGLFormData({ ...GLformData, email: e.target.value })}
            fullWidth
            margin="dense"
            sx={{ mb: 1.5 }}
          />
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={handleCloseGLModal} color="error">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Processing...' : 'Add Group Leader'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openModalSM}
        onClose={loading ? null : handleCloseModalSM}
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmitSubscriber
        }}
        fullWidth
      >
        <DialogTitle>{isEditMode ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
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
            disabled={isEditMode}
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
        open={openModalBulk}
        onClose={loading ? null : handleCloseModalBulk}
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmit
        }}
        fullWidth
        sx={{
          overflow: 'hidden'
        }}
      >
        <DialogTitle>{'Bulk Add and Invite Users'}</DialogTitle>
        <DialogContent>
          <Box mb={3} mt={1}>
            <Typography variant="subtitle2" gutterBottom>
              Number of Users to Add:
            </Typography>
            <TextField
              type="number"
              InputProps={{ inputProps: { min: 1, max: 100 } }}
              value={numberOfUsers}
              onChange={handleNumberChange}
              disabled={loading}
              size="small"
              sx={{ width: 120 }}
            />
          </Box>

          {/* {showError && (
                  <Alert severity="error" icon={<ErrorOutlineIcon />} sx={{ mb: 2 }}>
                    Please fill in at least one user's details
                  </Alert>
                )} */}
          <DialogContentText sx={{ mb: 2 }}>
            To add a bulk Staff, please provide their First Name, Last Name, and Email.
          </DialogContentText>

          <Box sx={{ maxHeight: 700, overflowY: 'auto' }}>
            <Box
              display="grid"
              gridTemplateColumns="repeat(3, 1fr)"
              gap={2}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                pb: 1,
                mb: 2,
                marginBottom: '20px',
                backgroundColor: 'primary.main',
                color: 'white',
                fontWeight: 'bold',
                alignItems: 'center',
                justifyItems: 'center',
                padding: '10px',
                overflow: 'hidden'
              }}
            >
              <Typography fontWeight="bold" textAlign="center">
                First Name
              </Typography>
              <Typography fontWeight="bold" textAlign="center">
                Last Name
              </Typography>
              <Typography fontWeight="bold" textAlign="center">
                Email
              </Typography>
            </Box>
            {users.map((user, index) => (
              <Grid container key={index} spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    value={user.firstName}
                    onChange={(e) => handleChange(index, 'firstName', e.target.value)}
                    placeholder="First Name"
                    disabled={loading}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    value={user.lastName}
                    onChange={(e) => handleChange(index, 'lastName', e.target.value)}
                    placeholder="Last Name"
                    disabled={loading}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    value={user.email}
                    onChange={(e) => handleChange(index, 'email', e.target.value)}
                    placeholder="Email"
                    type="email"
                    disabled={loading}
                    size="small"
                  />
                </Grid>
              </Grid>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={handleCloseModalBulk} color="error">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Processing...' : 'Add Staff'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openModalBulkGL}
        onClose={loading ? null : handleCloseModalBulk}
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmitGLBulk
        }}
        fullWidth
        sx={{
          overflow: 'hidden'
        }}
      >
        <DialogTitle>{'Bulk Add and Invite Users'}</DialogTitle>
        <DialogContent>
          <Box mb={3} mt={1}>
            <Typography variant="subtitle2" gutterBottom>
              Number of group leaders to Add:
            </Typography>
            <TextField
              type="number"
              InputProps={{ inputProps: { min: 1, max: 100 } }}
              value={numberOfUsers}
              onChange={handleNumberChange}
              disabled={loading}
              size="small"
              sx={{ width: 120 }}
            />
          </Box>

          {/* {showError && (
                  <Alert severity="error" icon={<ErrorOutlineIcon />} sx={{ mb: 2 }}>
                    Please fill in at least one user's details
                  </Alert>
                )} */}
          <DialogContentText sx={{ mb: 2 }}>
            To add a Group Leader, please provide their First Name, Last Name, and Email.
          </DialogContentText>

          <Box sx={{ maxHeight: 700, overflowY: 'auto' }}>
            <Box
              display="grid"
              gridTemplateColumns="repeat(3, 1fr)"
              gap={2}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                pb: 1,
                mb: 2,
                marginBottom: '20px',
                backgroundColor: 'primary.main',
                color: 'white',
                fontWeight: 'bold',
                alignItems: 'center',
                justifyItems: 'center',
                padding: '10px',
                overflow: 'hidden'
              }}
            >
              <Typography fontWeight="bold" textAlign="center">
                First Name
              </Typography>
              <Typography fontWeight="bold" textAlign="center">
                Last Name
              </Typography>
              <Typography fontWeight="bold" textAlign="center">
                Email
              </Typography>
            </Box>
            {users.map((user, index) => (
              <Grid container key={index} spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    value={user.firstName}
                    onChange={(e) => handleChange(index, 'firstName', e.target.value)}
                    placeholder="First Name"
                    disabled={loading}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    value={user.lastName}
                    onChange={(e) => handleChange(index, 'lastName', e.target.value)}
                    placeholder="Last Name"
                    disabled={loading}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    value={user.email}
                    onChange={(e) => handleChange(index, 'email', e.target.value)}
                    placeholder="Email"
                    type="email"
                    disabled={loading}
                    size="small"
                  />
                </Grid>
              </Grid>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={handleCloseModalBulk} color="error">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Processing...' : 'Add Group Leader'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GroupManagmentPage;
