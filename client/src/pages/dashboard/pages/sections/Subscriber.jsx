import React, { useEffect, useMemo, useState, useRef } from "react";
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
import {
  Box,
  Chip,
  ListItemIcon,
  Menu,
  MenuItem,
  Modal,
  Typography,
} from "@mui/material";
import { PencilIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/solid";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { FaChevronDown } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { MdClear } from "react-icons/md";
import axios from "axios";
import {
  GoPhishAccountAPIKey,
  GoPhishPublicURL,
} from "../../../utils/constants";
import { useAuth } from "../../../AuthContext";
import { Add as AddIcon, People as PeopleIcon } from "@mui/icons-material";
import BulkUserModal from "../../../components/BulkUserModal";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

const Subscriber = ({ g_id, admin, isGroupLeaderDashboard }) => {
  const [SubscribersData, setSubscribersData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });
  const [GroupLeadersData, setGroupLeadersData] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [delbtnloader, setDelbtnloader] = useState([]);
  const [EmptyGroupSelError, setEmptyGroupSelError] = useState(false);
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ContributorsData, setContributorsData] = useState([]);
  const [AllGroups, setAllGroups] = useState([]);
  const [groupsByContibutor, setGroupsByContibutor] = useState("");
  const [isMainOpen, setIsMainOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [SelectedGroupName, setSelectedGroupName] = useState("");
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isContributorOpen, setIsContributorOpen] = useState(false);
  const [searchGroupTerm, setSearchGroupTerm] = useState("");
  const [searchContributorTerm, setSearchContributorTerm] = useState("");
  const dropdownRef = useRef(null);
  const [SelectedGroupId, setSelectedGroupId] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");
  const [open, setOpen] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

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

      await getSubscribersByGroups(groupIds);
    } catch (error) {
      console.log("Error fetching all groups!");
    }
  };

  const getSubscribersByGroups = async (groupIds) => {
    try {
      setLoading(true);

      const response = await axiosInstance.post("/groups/subscribers", {
        group_ids: groupIds,
      });

      const allSubscribers = response.data.subscribers;

      setSubscribersData(allSubscribers);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Failed to fetch subscribers:", error);
    }
  };

  useEffect(() => {
    if (admin && selectedEmail) {
      fetchAllGroupsbyContributor(selectedEmail);
    }
  }, [selectedEmail]);
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

  const getAllSubscribersById = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `${
          SelectedGroupId
            ? `/groups/${SelectedGroupId}/subscribers`
            : "/subscribers/all"
        }`
      );
      setLoading(false);
      setSubscribersData(response.data.subscribers);
    } catch (error) {
      setLoading(false);
      console.log(error);
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
    getAllSubscribers();
  };
  const handleContributorClear = () => {
    setSelectedEmail("");
    getAllSubscribers();
  };
  useEffect(() => {
    if (admin) {
      getAllContributors();
    }
  }, []);

  useEffect(() => {
    if (admin && SelectedGroupId) {
      getAllSubscribersById();
      // setEmptyGroupSelError(g_id ? false : true);
    }
  }, [SelectedGroupId]);

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
      fetchGroupIdAndName(selectedUser.id, selectedUser.email);
    }
    if (selectedUser && !admin) {
      handleDeleteSubscriber(selectedUser.id, selectedUser.email);
      handleCloseDeleteModal();
    }
  };

  const SubscriberColumns = useMemo(
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
                    onClick={() => handleEditSubscriber(row.original)}
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

  const getAllSubscribers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `${g_id ? `/groups/${g_id}/subscribers` : "/subscribers/all"}`
      );
      setLoading(false);
      setSubscribersData(response.data.subscribers);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const handleEditSubscriber = (subscriber) => {
    setFormData(subscriber);
    setCurrentId(subscriber.id);
    setIsEditMode(true);
    setOpenModal(true);
  };
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteSubscriber = async (id, email) => {
    try {
      setLoading(true);
      setDelbtnloader((prev) => ({ ...prev, [id]: true }));
      setDeleteLoading(true);

      const resp = await axiosInstance.get(`/gophish_groups/${g_id}`);
      const ggId = resp.data.gophish_groupid;

      const groupResponse = await axios.get(
        `${GoPhishPublicURL}/api/groups/${ggId}/?api_key=${GoPhishAccountAPIKey}`
      );
      const groupData = groupResponse.data;

      // if (admin) {
      //   await axiosInstance.delete("/subscribers/del", { data: { id: id } });
      //   toast.success("Subscriber deleted successfully!");
      // } else {
      //   const response = await axiosInstance.delete("/subscribers/remove", {
      //     data: { user_id: id, group_id: g_id },
      //   });

      //   toast.success(response.data.message);
      // }

      await axiosInstance.delete("/subscribers/del", { data: { id: id } });
      toast.success("Subscriber deleted successfully!");

      groupData.targets = groupData.targets.filter(
        (target) => target.email !== email
      );

      const updateResponse = await axios.put(
        `${GoPhishPublicURL}/api/groups/${ggId}/?api_key=${GoPhishAccountAPIKey}`,
        groupData
      );

      if (updateResponse.status === 200) {
        setLoading(false);
        toast.success("Group updated successfully after deleting subscriber!");
      } else {
        setLoading(false);
        toast.error("Failed to update the group after deleting subscriber!");
      }
      setLoading(false);
      getAllSubscribers();
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error("Error deleting Subscriber!");
    } finally {
      setLoading(false);
      setDelbtnloader((prev) => ({ ...prev, [id]: false }));
      setDeleteLoading(false);
    }
  };

  const handleAddSubscriber = () => {
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
        await axiosInstance.put(`/subscribers/update`, {
          id: currentId,
          ...formData,
        });
        setLoading(false);
        toast.success("Subscriber updated successfully!");
      } catch (error) {
        setLoading(false);
        console.log(error);
        toast.error("Error updating Subscriber!");
      }
    } else {
      try {
        setLoading(true);
        const response = await axiosInstance.post(`/subscribers/add`, {
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
          toast.success("Subscriber added successfully!");
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
          position: "Subscriber",
        };

        groupData.targets.push(newTarget);

        const updateResponse = await axios.put(
          `${GoPhishPublicURL}/api/groups/${ggId}/?api_key=${GoPhishAccountAPIKey}`,
          groupData
        );

        if (updateResponse.status === 200) {
          setLoading(false);
          toast.success("Group updated successfully with new subscriber!");
        } else {
          setLoading(false);
          toast.error("Failed to update the group!");
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
        toast.error("Error adding Subscriber!");
      }
    }
    setLoading(false);
    handleCloseModal();
    getAllSubscribers();
  };

  const handleSubmitBulk = async (users) => {
    try {
      console.log("users", users);
      setLoading(true);

      for (let i = 0; i < users.length; i++) {
        const user = users[i];

        const response = await axiosInstance.post(`/subscribers/add`, {
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
          setLoading(false);
          toast.success(
            `${user.firstname} ${user.lastname} added successfully as Subscriber!`
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
          position: "Subscriber",
        };

        groupData.targets.push(newTarget);

        const updateResponse = await axios.put(
          `${GoPhishPublicURL}/api/groups/${ggId}/?api_key=${GoPhishAccountAPIKey}`,
          groupData
        );

        if (updateResponse.status === 200) {
          toast.success(
            `Group updated successfully with new Subscriber: ${user.firstname} ${user.lastname}!`
          );
        } else {
          toast.error(
            `Failed to update group for: ${user.firstname} ${user.lastname}`
          );
        }
      }
      setLoading(false);
      setOpen(false);
      getAllSubscribers();
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error("Error adding group leaders!");
    }
  };
  const handleAllClear = () => {
    setSelectedGroupId(null);
    setSelectedGroupName(null);
    setSelectedEmail("");
    getAllSubscribers();
  };

  useEffect(() => {
    getAllSubscribers();
    setEmptyGroupSelError(g_id ? false : true);
  }, [g_id]);

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleSelectAction = (action) => {
    setSelectedAction(action);

    if (action === "Add One") {
      handleAddSubscriber();
    }
    if (action === "Add Bulk") {
      setOpen(true);
    }
    handleClose();

    console.log(action);
  };

  const fetchGroupIdAndName = async (id, email) => {
    try {
      // Fetch the group ID for the current user
      const groupIdResponse = await axiosInstance.get(`/groups/${id}/groupid`);
      const groupId = groupIdResponse?.data?.group_id;

      if (!groupId || groupId.length === 0) {
        toast.error("No group found!");
        return;
      }

      setLoading(true);
      setDelbtnloader((prev) => ({ ...prev, [id]: true }));
      setDeleteLoading(true);

      try {
        // Fetch the GoPhish group ID
        const resp = await axiosInstance.get(`/gophish_groups/${groupId}`);
        const ggId = resp.data.gophish_groupid;

        // Fetch group data from GoPhish API
        const groupResponse = await axios.get(
          `${GoPhishPublicURL}/api/groups/${ggId}/?api_key=${GoPhishAccountAPIKey}`
        );
        const groupData = groupResponse.data;

        // Delete subscriber
        await axiosInstance.delete("/subscribers/del", { data: { id: id } });
        toast.success("Subscriber deleted successfully!");

        // Update group by removing the specific email
        groupData.targets = groupData.targets.filter(
          (target) => target.email !== email
        );

        const updateResponse = await axios.put(
          `${GoPhishPublicURL}/api/groups/${ggId}/?api_key=${GoPhishAccountAPIKey}`,
          groupData
        );

        if (updateResponse.status === 200) {
          toast.success(
            "Group updated successfully after deleting subscriber!"
          );
        } else {
          toast.error("Failed to update the group after deleting subscriber!");
        }

        getAllSubscribers();
      } catch (error) {
        // Handle specific error message from GoPhish API
        const errorMessage =
          error.response?.data?.message || "Error deleting Subscriber!";
        toast.error(errorMessage);
      }
    } catch (error) {
      // Handle errors fetching group ID
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
                All Subscribers
              </Typography>
              <Chip
                icon={<PeopleIcon />}
                label={`${SubscribersData?.length} ${
                  SubscribersData?.length === 1 ? "Subscriber" : "Subscribers"
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
                  Add Subscriber
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
        {/* {g_id && (
					<Button
						sx={{
							borderColor: "#23436d", // Custom border color
							color: "#23436d", // Make the text color match the border if needed
							"&:hover": {
								borderColor: "#23436d", // Change border color on hover
							},
						}}
						variant="outlined"
						onClick={handleAddSubscriber}
					>
						Add Subscriber
					</Button>
				)}
				<h1 className="text-black font-bold text-[25px] mt-5 mb-5">
					All Subscribers
				</h1>
				{SubscribersData && (
					<p className="font-semibold">
						{SubscribersData?.length} Subscriber(s)
					</p>
				)} */}
        {/* {admin && (
					<div className="items-end relative w-72" ref={dropdownRef}>
						<button
							className="w-full bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-3 text-left font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
							onClick={() => setIsMainOpen(!isMainOpen)}
						>
							Filter
							<FaChevronDown className="float-right h-5 w-5 text-gray-400" />
						</button>

						{isMainOpen && (
							<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
								<div className="p-2 space-y-2">
								
									<div className="relative">
										<button
											className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
											onClick={() => setIsGroupOpen(!isGroupOpen)}
										>
											{SelectedGroupName || "Select Group"}
											<FaChevronDown className="float-right h-5 w-5 text-gray-400" />
										</button>
										{isGroupOpen && (
											<div className=" w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
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
														<CiSearch className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
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

									
									<div className="relative">
										<button
											className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
											onClick={() => setIsContributorOpen(!isContributorOpen)}
										>
											{selectedEmail || "Select Contributor"}
											<FaChevronDown className="float-right h-5 w-5 text-gray-400" />
										</button>
										{isContributorOpen && (
											<div className="absolute left-0 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
												<div className="p-2">
													<div className="relative">
														<input
															type="text"
															className="w-full px-3 py-2 border border-gray-300 rounded-md pl-8 focus:outline-none focus:ring-2 focus:ring-primary"
															placeholder="Search contributors..."
															value={searchContributorTerm}
															onChange={(e) =>
																setSearchContributorTerm(e.target.value)
															}
														/>
														<CiSearch className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
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

								
									<div className="flex justify-between px-3 py-2">
										<button
											onClick={handleGroupClear}
											className="text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
										>
											Clear Group
										</button>
										<button
											onClick={handleContributorClear}
											className="text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
										>
											Clear Contributor
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				)} */}
        {admin && (
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center space-x-4">
              <button
                className="bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-2 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => {
                  if (isMainOpen) {
                    // Clear both filters when hiding
                    handleAllClear();
                  }
                  setIsMainOpen(!isMainOpen);
                }}
              >
                {isMainOpen ? "Clear Filters" : "Apply Filters"}
              </button>

              {isMainOpen && (
                <>
                  {/* Group Dropdown */}
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
                        {selectedEmail || "Select Contributor"}
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
                              placeholder="Search contributors..."
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
            columns={SubscriberColumns}
            data={SubscribersData}
            state={{ isLoading: loading }}
            muiSkeletonProps={{
              animation: "pulse",
            }}
            muiTopToolbarProps={{
              sx: {
                backgroundColor: "#e1ecf0",
                color: "#23436d",
                "& .MuiSvgIcon-root": {
                  color: "#23436d",
                },
                "& .MuiButtonBase-root": {
                  color: "#23436d",
                },
              },
            }}
            muiTablePaginationProps={{
              sx: {
                backgroundColor: "#e1ecf0",
                color: "#23436d",
                "& .MuiSvgIcon-root": {
                  color: "#23436d",
                },
                "& .MuiButtonBase-root": {
                  color: "#23436d",
                },
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
          {isEditMode ? "Edit Subscriber" : "Add Subscriber"}
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

export default Subscriber;
