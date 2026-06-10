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
import { Badge, Box, Chip, Typography, useMediaQuery } from "@mui/material";
import { PencilIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/solid";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { Add as AddIcon, People as PeopleIcon } from "@mui/icons-material";
import { useTheme } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import ViewDashboardModal from "../../components/ViewDashboardModal";

const Contributor = () => {
  const [ContributorsData, setContributorsData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [currentId, setCurrentId] = useState(null);
  const [delbtnloader, setDelbtnloader] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedName, setSelectedName] = useState("");

  const handleOpenViewModal = (row) => {
    console.log("row", row);
    setSelectedEmail(row.original.email);
    setSelectedName(row.original.name); // Make sure to replace with actual name
    setIsModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsModalOpen(false);
  };

  const handleShowGroup = (contributor) => {
    console.log("id", contributor);
    navigate(`/dashboard/view_details/${contributor.id}`, {
      state: { email: contributor.email },
    });
  };

  const Contribcolumns = useMemo(
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
              onClick={() => handleEditContributor(row.original)}
              className="flex outline-none flex-row justify-center items-center px-3 py-2 rounded-md gap-1 bg-[#02496F] text-white font-semibold"
            >
              <span>Edit</span>
              <PencilIcon className="w-[15px] h-[15px]" />
            </button>
            <button
              disabled={delbtnloader[row.original.id]}
              onClick={() => handleDeleteContributor(row.original.id)}
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
            <button
              onClick={() => handleOpenViewModal(row)}
              className="flex outline-none flex-row justify-center items-center px-3 py-2 rounded-md gap-1 bg-[#02496F] text-white font-semibold"
            >
              <span>View Dashboard</span>
            </button>
          </Box>
        ),
      },
    ],
    [delbtnloader]
  );

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

  const handleEditContributor = (contributor) => {
    setFormData(contributor);
    setCurrentId(contributor.id);
    setIsEditMode(true);
    setOpenModal(true);
  };

  const handleDeleteContributor = async (id) => {
    try {
      setLoading(true);
      setDelbtnloader((prev) => ({ ...prev, [id]: true }));
      const response = await axiosInstance.delete("/contributors/del", {
        data: { id: id },
      });
      toast.success("Contributor deleted with success!");
      getAllContributors();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error("Error deleting contributor!");
    } finally {
      setLoading(false);
      setDelbtnloader((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleAddContributor = () => {
    setFormData({ firstname: "", lastname: "", email: "" });
    setIsEditMode(false);
    setOpenModal(true);
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
        const response = await axiosInstance.put(`/contributors/update`, {
          id: currentId,
          ...formData,
        });
        toast.success("Contributor updated successfully!");
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
        toast.error("Error updating contributor!");
      }
    } else {
      try {
        setLoading(true);
        const response = await axiosInstance.post(
          `/contributors/add`,
          formData
        );
        toast.success("Contributor added successfully!");
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
        toast.error("Error adding contributor!");
      }
    }
    handleCloseModal();
    getAllContributors();
  };

  useEffect(() => {
    getAllContributors();
  }, []);
  const theme = useTheme();

  return (
    <>
      <div className="w-[100%] flex flex-col gap-5 justify-center items-start">
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
                All Contributors
              </Typography>
              <Chip
                icon={<PeopleIcon />}
                label={`${ContributorsData?.length} ${
                  ContributorsData?.length === 1
                    ? "Contributor"
                    : "Contributors"
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
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddContributor}
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
              Add Contributor
            </Button>
          </Box>
        </Box>

        <div className="w-full">
          <MaterialReactTable
            columns={Contribcolumns}
            data={ContributorsData}
            state={{ isLoading: loading, density: "compact" }}
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
          {isEditMode ? "Edit Contributor" : "Add Contributor"}
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

      <ViewDashboardModal
        isOpen={isModalOpen}
        onClose={handleCloseViewModal}
        name={selectedName}
        email={selectedEmail}
      />
    </>
  );
};

export default Contributor;
