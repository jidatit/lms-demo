import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
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
import { Add as AddIcon, People as PeopleIcon } from "@mui/icons-material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

import axios from "axios";
import {
  GoPhishAccountAPIKey,
  GoPhishPublicURL,
} from "../../../utils/constants";
import { useAuth } from "../../../AuthContext";
import BulkUserModal from "../../../components/BulkUserModal";

const Subscriber = ({ g_id }) => {
  const [SubscribersData, setSubscribersData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [delbtnloader, setDelbtnloader] = useState([]);
  const [EmptyGroupSelError, setEmptyGroupSelError] = useState(false);
  const { currentUser } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");
  const [open, setOpen] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

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
    if (selectedUser) {
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
              // onClick={() =>
              //   handleDeleteSubscriber(row.original.id, row.original.email)
              onClick={() =>
                handleOpenDeleteModal(row.original.id, row.original.email)
              }
              // }
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
    ],
    [delbtnloader]
  );

  const getAllSubscribers = async () => {
    try {
      const response = await axiosInstance.get(
        `${`/groups/${g_id}/subscribers`}`
      );
      setSubscribersData(response.data.subscribers);
    } catch (error) {
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
      setDelbtnloader((prev) => ({ ...prev, [id]: true }));
      setDeleteLoading(true);
      const resp = await axiosInstance.get(`/gophish_groups/${g_id}`);
      const ggId = resp.data.gophish_groupid;

      const groupResponse = await axios.get(
        `${GoPhishPublicURL}/api/groups/${ggId}/?api_key=${GoPhishAccountAPIKey}`
      );
      const groupData = groupResponse.data;

      // const response = await axiosInstance.delete("/subscribers/remove", {
      //   data: { user_id: id, group_id: g_id },
      // });

      // toast.success(response.data.message);
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
        toast.success("Group updated successfully after deleting subscriber!");
      } else {
        toast.error("Failed to update the group after deleting subscriber!");
      }
      getAllSubscribers();
    } catch (error) {
      console.log(error);
      toast.error("Error deleting Subscriber!");
    } finally {
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
        await axiosInstance.put(`/subscribers/update`, {
          id: currentId,
          ...formData,
        });
        toast.success("Subscriber updated successfully!");
      } catch (error) {
        console.log(error);
        toast.error("Error updating Subscriber!");
      }
    } else {
      try {
        const response = await axiosInstance.post(`/subscribers/add`, {
          ...formData,
          group_id: g_id,
          currentUser,
        });

        if (response.data.success === false && response.data.zeroSeatCourses) {
          return toast.error(
            `Error: ${response.data.message} ==> ${JSON.stringify(
              response.data.zeroSeatCourses
            )}`
          );
        } else if (
          response.data.success === false &&
          response.data.zeroSeatCourses === undefined
        ) {
          return toast.error(`Error: ${response.data.message}`);
        } else if (response.data.success === true) {
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
          toast.success("Group updated successfully with new subscriber!");
        } else {
          toast.error("Failed to update the group!");
        }
      } catch (error) {
        console.log(error);
        toast.error("Error adding Subscriber!");
      }
    }
    handleCloseModal();
    getAllSubscribers();
  };
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (g_id) {
      getAllSubscribers();
    }
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

  return (
    <>
      <div className="w-[100%]  flex flex-col gap-5 justify-center items-start">
        {/* {EmptyGroupSelError && (
          <h3 className="text-red-600 font-semibold">Select a group first!</h3>
        )} */}
        {/* <Button variant="outlined" onClick={handleAddSubscriber}>
          Add Subscriber
        </Button>
        <h1 className="text-black font-bold text-[25px] mt-5 mb-5">
          All Subscribers
        </h1>
        {SubscribersData && (
          <p className="font-semibold">
            {SubscribersData?.length} Subscriber(s)
          </p>
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
        <div className="w-full">
          <MaterialReactTable
            columns={SubscriberColumns}
            data={SubscribersData}
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
            muiTablePaperProps={{
              sx: {
                borderRadius: "12px",
                overflow: "hidden",
              },
            }}
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
              backgroundColor: "#299aa1",
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
