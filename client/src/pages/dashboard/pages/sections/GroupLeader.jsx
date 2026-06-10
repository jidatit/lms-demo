import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MaterialReactTable } from "material-react-table";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import axiosInstance from "../../../utils/axiosConfig";
import { FaChevronDown } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { MdClear } from "react-icons/md";
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  ListItemIcon,
  Menu,
  MenuItem,
  Modal,
  Select,
  Typography,
} from "@mui/material";
import { PencilIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/solid";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import {
  GoPhishAccountAPIKey,
  GoPhishPublicURL,
} from "../../../utils/constants";
import { useAuth } from "../../../AuthContext";
import {
  Add as AddIcon,
  KeyboardArrowDownIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import FilterSelect from "../../components/filter-select";
import BulkUserModal from "../../../components/BulkUserModal";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
const GroupLeader = ({ g_id, admin, isGroupLeaderDashboard }) => {
  const [GroupLeadersData, setGroupLeadersData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [ContributorsData, setContributorsData] = useState([]);
  const [AllGroups, setAllGroups] = useState([]);
  const [groupsByContibutor, setGroupsByContibutor] = useState("");
  const [loading, setLoading] = useState(false);
  const [delbtnloader, setDelbtnloader] = useState([]);
  const [EmptyGroupSelError, setEmptyGroupSelError] = useState(false);
  const { currentUser } = useAuth();
  const [isMainOpen, setIsMainOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [SelectedGroupName, setSelectedGroupName] = useState("");
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isContributorOpen, setIsContributorOpen] = useState(false);
  const [searchGroupTerm, setSearchGroupTerm] = useState("");
  const [searchContributorTerm, setSearchContributorTerm] = useState("");
  const dropdownRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");
  const [open, setOpen] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const [SelectedGroupId, setSelectedGroupId] = useState("");
  const fetchAllGroups = async () => {
    try {
      const resp = await axiosInstance.get(`/groups/all`);
      setAllGroups(resp.data.groups);
    } catch (error) {
      console.log("Error fetching all groups!");
    }
  };
  useEffect(() => {
    if (admin) {
      fetchAllGroups();
    }
  }, []);

  const getAllContributors = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/contributors/all");

      setContributorsData(response.data.contributors);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };
  const fetchAllGroupsbyContributor = async (email) => {
    try {
      const resp = await axiosInstance.get(`/groups/all/${email}`);
      const groups = resp.data.groups;

      const groupIds = groups.map((group) => group.id);

      setGroupsByContibutor(groupIds);

      await getGroupLeadersByContributor(groupIds);
    } catch (error) {
      console.log("Error fetching all groups!");
    }
  };
  useEffect(() => {
    if (admin && selectedEmail) {
      fetchAllGroupsbyContributor(selectedEmail);
    }
  }, [selectedEmail]);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleOpenDeleteModal = (userId, userEmail) => {
    setSelectedUser({ id: userId, email: userEmail });
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedUser(null);
  };

  const handleConfirmDelete = () => {
    if (admin) {
      handleDeleleteUser(selectedUser.id, selectedUser.email);
    }
    if (selectedUser && !admin) {
      handleDeleteGroupLeader(selectedUser.id, selectedUser.email);
      handleCloseDeleteModal();
    }
  };

  const GroupLeaderColumns = useMemo(
    () => [
      {
        accessorKey: "firstname",
        header: "First Name",
        size: 100,
        Cell: ({ cell }) => (
          <Box>
            {cell.getValue().length > 100
              ? cell.getValue().slice(0, 100) + "..."
              : cell.getValue()}
          </Box>
        ),
      },
      {
        accessorKey: "lastname",
        header: "Last Name",
        size: 100,
        Cell: ({ cell }) => (
          <Box>
            {cell.getValue().length > 100
              ? cell.getValue().slice(0, 100) + "..."
              : cell.getValue()}
          </Box>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 100,
        Cell: ({ cell }) => (
          <Box>
            {cell.getValue().length > 100
              ? cell.getValue().slice(0, 100) + "..."
              : cell.getValue()}
          </Box>
        ),
      },
      ...(isGroupLeaderDashboard
        ? []
        : [
          {
            header: "Actions",
            size: 100,
            Cell: ({ row }) => (
              <Box sx={{ display: "flex", flexDirection: "row", gap: "5px" }}>
                <button
                  onClick={() => handleEditGroupLeader(row.original)}
                  className="flex outline-none flex-row justify-center items-center px-3 py-2 rounded-md gap-1 bg-[#02496F] text-white font-semibold"
                >
                  <span>Edit</span>
                  <PencilIcon className="w-[15px] h-[15px]" />
                </button>
                <button
                  disabled={delbtnloader[row.original.id]}
                  onClick={() =>
                    handleOpenDeleteModal(row.original.id, row.original.email)
                  }
                  className="flex outline-none flex-row justify-center items-center px-3 py-2 rounded-md gap-1 bg-red-800 text-white font-semibold"
                >
                  {delbtnloader[row.original.id] ? (
                    <>
                      <span>Deleting</span>
                      <ArrowPathIcon className="animate-spin w-[15px] h-[15px]" />
                    </>
                  ) : (
                    <>
                      <span>Delete</span>
                      <TrashIcon className="w-[15px] h-[15px]" />
                    </>
                  )}
                </button>
              </Box>
            ),
          },
        ]),
    ],
    [delbtnloader]
  );

  const getAllGroupLeaders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `${g_id ? `/groups/${g_id}/groupleaders` : "/groupleaders/all"}`
      );
      setLoading(false);
      setGroupLeadersData(response.data.groupleaders);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };
  const getGroupLeadersById = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `${SelectedGroupId
          ? `/groups/${SelectedGroupId}/groupleaders`
          : "/groupleaders/all"
        }`
      );
      setLoading(false);
      setGroupLeadersData(response.data.groupleaders);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const getGroupLeadersByContributor = async (groupIds) => {
    try {
      setLoading(true);

      const response = await axiosInstance.post("/groups/groupleaders", {
        group_ids: groupIds,
      });

      const allGroupLeaders = response.data.groupleaders;

      setLoading(false);
      setGroupLeadersData(allGroupLeaders);
    } catch (error) {
      setLoading(false);
      console.error("Failed to fetch group leaders:", error);
    }
  };

  const handleEditGroupLeader = (groupleader) => {
    setFormData(groupleader);
    setCurrentId(groupleader.id);
    setIsEditMode(true);
    setOpenModal(true);
  };
  const [deleteLoading, setDeleteLoading] = useState(false);
  const handleDeleteGroupLeader = async (id, email) => {
    try {
      setLoading(true);
      setDelbtnloader((prev) => ({ ...prev, [id]: true }));
      setDeleteLoading(true);

      // Fetch the group data
      const resp = await axiosInstance.get(`/gophish_groups/${g_id}`);
      const ggId = resp.data.gophish_groupid;

      // Fetch group response from GoPhish
      const groupResponse = await axios.get(
        `${GoPhishPublicURL}/api/groups/${ggId}/?api_key=${GoPhishAccountAPIKey}`
      );

      // Directly access the targets from groupResponse
      const targets = groupResponse?.data?.targets || []; // Default to empty array if no targets

      // Filter out the target with the matching email
      const updatedTargets = targets.filter((target) => target.email !== email);

      // Ensure targets is never null
      const groupData = {
        ...groupResponse.data,
        targets: updatedTargets.length ? updatedTargets : [],
      };

      // Update the group with the modified targets
      const updateResponse = await axios.put(
        `${GoPhishPublicURL}/api/groups/${ggId}/?api_key=${GoPhishAccountAPIKey}`,
        groupData
      );

      if (updateResponse.status === 200) {
        await axiosInstance.delete("/groupleaders/del", { data: { id: id } });
        toast.success("Group Leader deleted with success!");
        toast.success("Group updated successfully after deleting groupleader!");
      } else {
        toast.error("Failed to update the group after deleting groupleader!");
      }

      setLoading(false);
      getAllGroupLeaders();
    } catch (error) {
      console.error(error);
      toast.error("Error deleting group leader!");
      setLoading(false);
    } finally {
      setDelbtnloader((prev) => ({ ...prev, [id]: false }));
      setDeleteLoading(false);
    }
  };

  const handleAddGroupLeader = () => {
    if (g_id) {
      setFormData({ group_id: g_id, firstname: "", lastname: "", email: "" });
      setIsEditMode(false);
      setOpenModal(true);
    } else {
      setEmptyGroupSelError(true);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({ firstname: "", lastname: "", email: "" });
    setCurrentId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isEditMode) {
      try {
        setLoading(true);
        await axiosInstance.put(`/groupleaders/update`, {
          id: currentId,
          ...formData,
        });
        setLoading(false);
        toast.success("Group Leader updated successfully!");
      } catch (error) {
        console.log(error);
        setLoading(false);
        toast.error("Error updating group leader!");
      }
    } else {
      try {
        setLoading(true);
        const response = await axiosInstance.post(`/groupleaders/add`, {
          ...formData,
          group_id: g_id,
          currentUser,
        });
        if (response.data.success === false && response.data.zeroSeatCourses) {
          setLoading(false);

          return toast.error(
            `Error: ${response.data.message} ==> ${JSON.stringify(
              response.data.zeroSeatCourses
            )}`
          );
        } else if (
          response.data.success === false &&
          response.data.zeroSeatCourses === undefined
        ) {
          setLoading(false);

          return toast.error(`Error: ${response.data.message}`);
        } else if (response.data.success === true) {
          setLoading(false);
          toast.success("Group Leader added successfully!");
        }

        const resp = await axiosInstance.get(`/gophish_groups/${g_id}`);
        const ggId = resp.data.gophish_groupid;

        const groupResponse = await axios.get(
          `${GoPhishPublicURL}/api/groups/${ggId}/?api_key=${GoPhishAccountAPIKey}`
        );
        const groupData = groupResponse.data;

        const newTarget = {
          email: formData.email,
          first_name: formData.firstname,
          last_name: formData.lastname,
          position: "Group Leader",
        };

        groupData.targets.push(newTarget);

        const updateResponse = await axios.put(
          `${GoPhishPublicURL}/api/groups/${ggId}/?api_key=${GoPhishAccountAPIKey}`,
          groupData
        );

        if (updateResponse.status === 200) {
          setLoading(false);
          toast.success("Group updated successfully with new groupleader!");
        } else {
          setLoading(false);
          toast.error("Failed to update the group!");
        }
      } catch (error) {
        setLoading(false);
        console.log(error);
        toast.error("Error adding group leader!");
      } finally {
        handleCloseModal();
      }
    }
    handleCloseModal();
    getAllGroupLeaders();
  };
  const handleSubmitBulk = async (users) => {
    try {
      setLoading(true);

      for (let i = 0; i < users.length; i++) {
        const user = users[i];

        const response = await axiosInstance.post(`/groupleaders/add`, {
          ...user,
          group_id: g_id,
          currentUser,
        });

        if (response.data.success === false && response.data.zeroSeatCourses) {
          setLoading(false);

          return toast.error(
            `Error: ${response.data.message} ==> ${JSON.stringify(
              response.data.zeroSeatCourses
            )}`
          );
        } else if (
          response.data.success === false &&
          response.data.zeroSeatCourses === undefined
        ) {
          setLoading(false);
          return toast.error(`Error: ${response.data.message}`);
        } else if (response.data.success === true) {
          toast.success(
            `${user.firstname} ${user.lastname} added successfully as Group Leader !`
          );
        }

        const resp = await axiosInstance.get(`/gophish_groups/${g_id}`);
        const ggId = resp.data.gophish_groupid;

        const groupResponse = await axios.get(
          `${GoPhishPublicURL}/api/groups/${ggId}/?api_key=${GoPhishAccountAPIKey}`
        );
        const groupData = groupResponse.data;

        const newTarget = {
          email: user.email,
          first_name: user.firstname,
          last_name: user.lastname,
          position: "Group Leader",
        };

        groupData.targets.push(newTarget);

        const updateResponse = await axios.put(
          `${GoPhishPublicURL}/api/groups/${ggId}/?api_key=${GoPhishAccountAPIKey}`,
          groupData
        );

        if (updateResponse.status === 200) {
          toast.success(
            `Group updated successfully with new Group Leader: ${user.firstname} ${user.lastname}!`
          );
        } else {
          toast.error(
            `Failed to update group for: ${user.firstname} ${user.lastname}`
          );
        }
      }
      setLoading(false);
      setOpen(false);
      getAllGroupLeaders();
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error("Error adding group leaders!");
    } finally {
      handleCloseModal();
    }
  };

  const filteredGroups = AllGroups.filter((group) =>
    group.name.toLowerCase().includes(searchGroupTerm.toLowerCase())
  );
  const filteredContributors = ContributorsData.filter((contributor) =>
    contributor.email
      .toLowerCase()
      .includes(searchContributorTerm.toLowerCase())
  );

  const handleGroupChange = (group) => {
    setSelectedGroupId(group.id);
    setSelectedGroupName(group.name);
    setSelectedEmail("");
    setIsGroupOpen(false);
  };
  const handleContributorChange = (contributor) => {
    setSelectedEmail(contributor.email);
    setSelectedGroupId("");
    setSelectedGroupName("");
    setIsContributorOpen(false);
  };

  const handleGroupClear = () => {
    setSelectedGroupId(null);
    setSelectedGroupName(null);
    getAllGroupLeaders();
  };
  const handleContributorClear = () => {
    setSelectedEmail("");
    getAllGroupLeaders();
  };
  const handleAllClear = () => {
    setSelectedGroupId(null);
    setSelectedGroupName(null);
    setSelectedEmail("");
    getAllGroupLeaders();
  };

  useEffect(() => {
    if (admin) {
      getAllContributors();
    }
  }, []);

  useEffect(() => {
    if (admin && SelectedGroupId) {
      getGroupLeadersById();
      setEmptyGroupSelError(g_id ? false : true);
    }
  }, [SelectedGroupId]);

  useEffect(() => {
    getAllGroupLeaders();
    setEmptyGroupSelError(g_id ? false : true);
  }, [g_id]);

  const dropdownRefGroup = useRef(null);
  const dropdownRefContributor = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRefGroup.current &&
        !dropdownRefGroup.current.contains(event.target)
      ) {
        setIsGroupOpen(false);
      }
      if (
        dropdownRefContributor.current &&
        !dropdownRefContributor.current.contains(event.target)
      ) {
        setIsContributorOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectAction = (action) => {
    setSelectedAction(action);

    if (action === "Add One") {
      handleAddGroupLeader();
    }
    if (action === "Add Bulk") {
      setOpen(true);
    }
    handleClose();
  };

  const handleDeleleteUser = async (id, email) => {
    try {
      // Fetch the group IDs for the current user
      const groupIdResponse = await axiosInstance.get(`/groups/${id}/groupid`);
      const groupIds = groupIdResponse?.data?.group_id;

      if (!groupIds || groupIds.length === 0) {
        toast.error("No group found!");
        return;
      }

      setLoading(true);
      setDelbtnloader((prev) => ({ ...prev, [id]: true }));
      setDeleteLoading(true);

      let errorMessages = [];

      for (const groupId of groupIds) {
        try {
          const resp = await axiosInstance.get(`/gophish_groups/${groupId}`);
          const ggId = resp.data.gophish_groupid;

          const groupResponse = await axios.get(
            `${GoPhishPublicURL}/api/groups/${ggId}/?api_key=${GoPhishAccountAPIKey}`
          );

          if (groupResponse.data.success === false) {
            const errorMessage =
              groupResponse.data.message ||
              `Error fetching group ${groupId} data in GoPhish!`;
            toast.error(errorMessage);
            errorMessages.push(errorMessage);
            continue;
          }

          const groupData = groupResponse.data;

          groupData.targets = groupData.targets.filter(
            (target) => target.email !== email
          );

          const updateResponse = await axios.put(
            `${GoPhishPublicURL}/api/groups/${ggId}/?api_key=${GoPhishAccountAPIKey}`,
            groupData
          );

          if (updateResponse.status === 200) {
            toast.success(`Group ${groupId} updated successfully in GoPhish!`);
          } else {
            throw new Error(`Failed to update group ${groupId} in GoPhish`);
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            `Error updating group ${groupId} in GoPhish!`;
          errorMessages.push(errorMessage);
          toast.error(errorMessage);
        }
      }

      if (errorMessages.length > 0) {
        toast.error(
          "One or more GoPhish group updates failed. Aborting deletion from our app."
        );
        return;
      }

      await axiosInstance.delete("/groupleaders/del", { data: { id: id } });
      toast.success("Group Leader deleted successfully from our app!");

      getAllGroupLeaders();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching group data!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setDelbtnloader((prev) => ({ ...prev, [id]: false }));
      setDeleteLoading(false);
      handleCloseDeleteModal();
    }
  };

  return (
    <>
      <div className="w-[100%]  flex flex-col gap-5 justify-center items-start">
        {/* {EmptyGroupSelError && (
					<h3 className="text-red-600 font-semibold">Select a group first!</h3>
				)} */}

        <Box sx={{ width: "100%", my: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: "bold",
                  // color: theme.palette.primary.main,
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                }}
              >
                All Group Leaders
              </Typography>
              <Chip
                icon={<PeopleIcon />}
                label={`${GroupLeadersData?.length} ${GroupLeadersData?.length === 1
                  ? "Group Leader"
                  : "Group Leaders"
                  }`}
                sx={{
                  bgcolor: "#02496F",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  // height: "auto",
                  p: "2px",
                  "& .MuiChip-icon": { color: "white", fontSize: "1.2rem" },
                }}
              />
            </Box>
            <Modal
              open={openDeleteModal}
              onClose={handleCloseDeleteModal}
              aria-labelledby="confirm-delete-modal"
              aria-describedby="confirm-delete-description"
              className="flex items-center justify-center"
            >
              <Box className="bg-white p-4 rounded-md shadow-md max-w-lg mx-auto mt-24 outline-none">
                <h2
                  id="confirm-delete-modal"
                  className="text-xl font-semibold mb-4"
                >
                  Confirm Deletion
                </h2>
                <p id="confirm-delete-description" className="mb-4">
                  Deleting the user will remove all their data from the app
                  permanently. Are you sure you want to proceed?
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={handleCloseDeleteModal}
                    variant="outlined"
                    color="primary"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={deleteLoading}
                    onClick={handleConfirmDelete}
                    variant="contained"
                    color="error"
                  >
                    Confirm
                  </Button>
                </div>
              </Box>
            </Modal>
            <BulkUserModal
              open={open}
              onClose={() => setOpen(false)}
              onSubmit={handleSubmitBulk}
              isLoading={loading}
            />
            {g_id && (
              <div>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleClick}
                  sx={{
                    fontWeight: "bold",
                    textTransform: "none",
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: "#299aa1",
                    boxShadow: 2,
                    "&:hover": {
                      bgcolor: "#00A3AE",
                      boxShadow: 4,
                    },
                  }}
                >
                  Add Group Leader
                </Button>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  MenuListProps={{
                    "aria-labelledby": "basic-button",
                  }}
                  PaperProps={{
                    sx: {
                      minWidth: anchorEl ? anchorEl.offsetWidth : "auto",
                    },
                  }}
                >
                  <MenuItem
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "items-between",
                      gap: 1,
                      fontSize: "18px",
                      width: "100%",
                    }}
                    onClick={() => handleSelectAction("Add One")}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: "auto",
                        color: "inherit",
                      }}
                    >
                      <PersonAddIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="inherit" noWrap>
                      Add One
                    </Typography>
                  </MenuItem>

                  <MenuItem
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "items-between",
                      gap: 1,
                      fontSize: "18px",
                      width: "100%",
                    }}
                    onClick={() => handleSelectAction("Add Bulk")}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: "auto",

                        color: "inherit",
                      }}
                    >
                      <GroupAddIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="inherit" noWrap>
                      Add Bulk
                    </Typography>
                  </MenuItem>
                </Menu>
              </div>
            )}
          </Box>
        </Box>

        {admin && (
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center space-x-4">
              <button
                className="bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-2 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => {
                  if (isMainOpen) {
                    handleAllClear();
                  }
                  setIsMainOpen(!isMainOpen);
                }}
              >
                {isMainOpen ? "Clear Filters" : "Apply Filters"}
              </button>

              {isMainOpen && (
                <>
                  <div className="relative">
                    <div className="flex items-center">
                      <button
                        className="bg-white border border-gray-300 rounded-md px-3 py-2 text-left font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        onClick={() => setIsGroupOpen(!isGroupOpen)}
                      >
                        {SelectedGroupName || "Select Group"}
                        <FaChevronDown className="inline-block ml-2 h-4 w-4 text-gray-400" />
                      </button>
                      {SelectedGroupName && (
                        <button
                          className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          onClick={handleGroupClear}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                    {isGroupOpen && (
                      <div className="absolute z-10 w-64 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                        <div className="p-2">
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md pl-8 focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="Search groups..."
                              value={searchGroupTerm}
                              onChange={(e) =>
                                setSearchGroupTerm(e.target.value)
                              }
                            />
                            {/* <CiSearch className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" /> */}
                          </div>
                        </div>
                        <ul className="max-h-48 overflow-auto">
                          {filteredGroups.map((group) => (
                            <li
                              key={group.id}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                handleGroupChange(group);
                                setIsGroupOpen(false);
                              }}
                            >
                              {group.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Contributor Dropdown */}
                  <div className="relative">
                    <div className="flex items-center">
                      <button
                        className="bg-white border border-gray-300 rounded-md px-3 py-2 text-left font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        onClick={() => setIsContributorOpen(!isContributorOpen)}
                      >
                        {selectedEmail || "Select Partner"}
                        <FaChevronDown className="inline-block ml-2 h-4 w-4 text-gray-400" />
                      </button>
                      {selectedEmail && (
                        <button
                          className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          onClick={handleContributorClear}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                    {isContributorOpen && (
                      <div className="absolute z-10 w-64 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                        <div className="p-2">
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md pl-8 focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="Search Partners..."
                              value={searchContributorTerm}
                              onChange={(e) =>
                                setSearchContributorTerm(e.target.value)
                              }
                            />
                            {/* <CiSearch className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" /> */}
                          </div>
                        </div>
                        <ul className="max-h-48 overflow-auto">
                          {filteredContributors.map((contributor) => (
                            <li
                              key={contributor.id}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                handleContributorChange(contributor);
                                setIsContributorOpen(false);
                              }}
                            >
                              {contributor.email}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="w-full">
          <MaterialReactTable
            columns={GroupLeaderColumns}
            data={GroupLeadersData}
            state={{ isLoading: loading }}
            muiCircularProgressProps={{
              color: "secondary",
              thickness: 5,
              size: 55,
            }}
            muiSkeletonProps={{
              animation: "pulse",
              height: 28,
            }}
            muiTopToolbarProps={{
              sx: {
                backgroundColor: "#e1ecf0",
                color: "#23436d",
                "& .MuiSvgIcon-root": {
                  color: "#23436d", // Set all icons to white in the toolbar
                },
                "& .MuiButtonBase-root": {
                  color: "#23436d", // Set buttons/icons (like filters, export) to white
                },
              },
            }}
            // muiTablePaperProps={{
            // 	sx: {
            // 		borderRadius: "12px",
            // 	},
            // }}
            muiTablePaginationProps={{
              sx: {
                backgroundColor: "#e1ecf0",
                color: "#23436d",
                "& .MuiSvgIcon-root": {
                  color: "#23436d", // Set pagination icons to white
                },
                "& .MuiButtonBase-root": {
                  color: "#23436d", // Set pagination buttons to white
                },

                // minHeight: "40px",
                // fontSize: "0.875rem", // Make the font slightly smaller
              },
            }}
          />
        </div>
      </div>
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        PaperProps={{
          component: "form",
          onSubmit: handleSubmit,
        }}
        fullWidth
      >
        <DialogTitle
          sx={{
            marginBottom: "20px",
            backgroundColor: "#23436d",
            color: "white",
            fontWeight: "bold",
          }}
        >
          {isEditMode ? "Edit Group Leader" : "Add Group Leader"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="firstname"
            name="firstname"
            label="First Name"
            type="text"
            fullWidth
            variant="standard"
            value={formData.firstname}
            onChange={(e) =>
              setFormData({ ...formData, firstname: e.target.value })
            }
          />
        </DialogContent>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="lastname"
            name="lastname"
            label="Last Name"
            type="text"
            fullWidth
            variant="standard"
            value={formData.lastname}
            onChange={(e) =>
              setFormData({ ...formData, lastname: e.target.value })
            }
          />
        </DialogContent>
        <DialogContent>
          <TextField
            disabled={isEditMode}
            autoFocus
            required
            margin="dense"
            id="email"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="standard"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </DialogContent>

        <DialogActions
          sx={{
            padding: "16px",
            display: "flex",

            // justifyContent: "space-between", // Space the buttons apart for a better UI
          }}
        >
          <Button
            onClick={handleCloseModal}
            sx={{
              width: "84px",
              color: "white",
              backgroundColor: "#d32f2f",
              "&:hover": {
                backgroundColor: "#b71c1c",
              },
            }}
            variant="contained"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            sx={{
              width: "84px",
              color: "white",
              backgroundColor: "#02496F",
              "&:hover": {
                backgroundColor: "#023A5A",
              },
            }}
            variant="contained"
          >
            {isEditMode ? "Update" : "Add"}
          </Button>
        </DialogActions>
        {/* <DialogActions>
					<Button onClick={handleCloseModal}>Cancel</Button>
					<Button type="submit">{isEditMode ? "Update" : "Add"}</Button>
				</DialogActions> */}
      </Dialog>
    </>
  );
};

export default GroupLeader;
