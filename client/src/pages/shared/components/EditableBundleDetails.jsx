import React, { useState } from "react";
import { Typography, TextField, Button, Box, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

const EditableBundleDetails = ({ courseDetails, onSave, admin }) => {
  const [editingFields, setEditingFields] = useState({
    name: false,
    description: false,
    seatprice: false,
  });
  const [editingAll, setEditingAll] = useState(false);
  const [tempDetails, setTempDetails] = useState(courseDetails);

  const handleEdit = (field) => {
    setEditingFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleCancelEdit = (field) => {
    setEditingFields((prev) => ({ ...prev, [field]: false }));
    setTempDetails((prev) => ({ ...prev, [field]: courseDetails[field] }));
  };

  const handleSave = (field) => {
    setEditingFields((prev) => ({ ...prev, [field]: false }));
    onSave(tempDetails); // Send the entire `tempDetails` object
  };

  const handleChange = (field, value) => {
    setTempDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditAll = () => {
    setEditingAll(true);
  };

  const handleSaveAll = () => {
    setEditingAll(false);
    onSave({
      name: tempDetails.name,
      description: tempDetails.description,
      seatprice: tempDetails.seatprice,
    });
  };

  const handleCancelAll = () => {
    setEditingAll(false);
    setTempDetails({
      name: courseDetails.name,
      description: courseDetails.description,
      seatprice: courseDetails.seatprice,
    });
  };

  const EditableField = ({ field, label, multiline = false }) => {
    const isEditing = editingAll || editingFields[field];
    return (
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="body1" sx={{ mr: 2, minWidth: "100px" }}>
          <strong>{label}:</strong>
        </Typography>
        {isEditing ? (
          <>
            <TextField
              value={tempDetails[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              fullWidth
              multiline={multiline}
              rows={multiline ? 4 : 1}
              variant="outlined"
              size="small"
            />
            {!editingAll && (
              <>
                <IconButton
                  onClick={() => handleSave(field)}
                  size="small"
                  sx={{
                    ml: 1,
                    color: "#02496F",
                    "&:hover": {
                      boxShadow: 4,
                    },
                  }}
                >
                  <SaveIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleCancelEdit(field)}
                  size="small"
                  sx={{
                    ml: 1,
                    color: "#02496F",
                  }}
                >
                  <CancelIcon />
                </IconButton>
              </>
            )}
          </>
        ) : (
          <>
            <Typography variant="body1" sx={{ flexGrow: 1 }}>
              {field === "priceperseat"
                ? `$${courseDetails[field]}`
                : courseDetails[field]}
            </Typography>
            {admin && (
              <IconButton onClick={() => handleEdit(field)} size="small">
                <EditIcon />
              </IconButton>
            )}
          </>
        )}
      </Box>
    );
  };

  return (
    <Box p={2} border={1} borderRadius={2} borderColor="grey.300">
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontSize: "1.5rem",
            fontWeight: 600,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Details
        </Typography>
        {admin && !editingAll ? (
          <Button
            variant="contained"
            onClick={handleEditAll}
            sx={{
              bgcolor: "#299aa1",
              "&:hover": {
                bgcolor: "#00A3AE",
                boxShadow: 4,
              },
              fontSize: "1rem",
            }}
          >
            Edit All
          </Button>
        ) : (
          admin && (
            <Box>
              <Button
                variant="contained"
                onClick={handleSaveAll}
                sx={{
                  bgcolor: "#299aa1",
                  "&:hover": {
                    bgcolor: "#00A3AE",
                    boxShadow: 4,
                  },
                  mr: 1,
                  fontSize: "1rem",
                }}
              >
                Save All
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancelAll}
                sx={{
                  fontSize: "1rem",
                }}
              >
                Cancel
              </Button>
            </Box>
          )
        )}
      </Box>

      {EditableField({ field: "name", label: "Title" })}
      {EditableField({
        field: "description",
        label: "Description",
        multiline: true,
      })}
      {EditableField({ field: "seatprice", label: "Price per seat" })}
    </Box>
  );
};

export default EditableBundleDetails;
