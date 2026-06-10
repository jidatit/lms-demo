import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  Box,
  Typography,
  Alert,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const BulkUserModal = ({ open, onClose, onSubmit, isLoading }) => {
  const [numberOfUsers, setNumberOfUsers] = useState(1);
  const [users, setUsers] = useState([
    {
      firstname: "",
      lastname: "",
      email: "",
    },
  ]);

  const [showError, setShowError] = useState(false);

  const handleNumberChange = (e) => {
    const num = parseInt(e.target.value) || 1;
    const limitedNum = Math.min(Math.max(num, 1), 100); // Limit between 1 and 100
    setNumberOfUsers(limitedNum);

    if (limitedNum > users.length) {
      // Add more user objects
      const newUsers = [...users];
      for (let i = users.length; i < limitedNum; i++) {
        newUsers.push({ firstname: "", lastname: "", email: "" });
      }
      setUsers(newUsers);
    } else {
      // Remove excess user objects
      setUsers(users.slice(0, limitedNum));
    }
  };

  const handleChange = (index, field, value) => {
    const newUsers = [...users];
    newUsers[index] = {
      ...newUsers[index],
      [field]: value,
    };
    setUsers(newUsers);
  };

  const handleSubmit = () => {
    const validUsers = users.filter(
      (user) =>
        user.firstname.trim() !== "" ||
        user.lastname.trim() !== "" ||
        user.email.trim() !== ""
    );

    if (validUsers.length === 0) {
      setShowError(true);
      return;
    }

    setShowError(false);
    onSubmit(validUsers);
  };

  const handleClose = () => {
    if (!isLoading) {
      setShowError(false);
      setNumberOfUsers(1);
      setUsers([{ firstname: "", lastname: "", email: "" }]);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          marginBottom: "20px",
          backgroundColor: "#23436d",
          color: "white",
          fontWeight: "bold",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Bulk Add and Invite Users</Typography>
          <IconButton onClick={handleClose} disabled={isLoading} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

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
            disabled={isLoading}
            size="small"
            sx={{ width: 120 }}
          />
        </Box>

        {showError && (
          <Alert severity="error" icon={<ErrorOutlineIcon />} sx={{ mb: 2 }}>
            Please fill in at least one user's details
          </Alert>
        )}

        <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
          <Box
            display="grid"
            gridTemplateColumns="repeat(3, 1fr)"
            gap={2}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              pb: 1,
              mb: 2,
            }}
          >
            <Typography fontWeight="bold">First Name</Typography>
            <Typography fontWeight="bold">Last Name</Typography>
            <Typography fontWeight="bold">Email</Typography>
          </Box>
          {users.map((user, index) => (
            <Grid container key={index} spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  value={user.firstname}
                  onChange={(e) =>
                    handleChange(index, "firstname", e.target.value)
                  }
                  placeholder="First Name"
                  disabled={isLoading}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  value={user.lastname}
                  onChange={(e) =>
                    handleChange(index, "lastname", e.target.value)
                  }
                  placeholder="Last Name"
                  disabled={isLoading}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  value={user.email}
                  onChange={(e) => handleChange(index, "email", e.target.value)}
                  placeholder="Email"
                  type="email"
                  disabled={isLoading}
                  size="small"
                />
              </Grid>
            </Grid>
          ))}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          variant="contained"
          sx={{
            bgcolor: "#0A4D68",
            "&:hover": {
              bgcolor: "#083F54",
            },
          }}
        >
          {isLoading ? "Adding Users..." : "Add & Invite Users"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkUserModal;
