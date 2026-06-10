import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemSecondaryAction,
  Divider,
  Skeleton
} from '@mui/material';
import { MdEdit, MdDelete, MdAdd, MdClose } from 'react-icons/md';
import { getAllCategories } from 'utils/fetch';
import axiosInstance from 'utils/axiosConfig';

const CategoryManagement = ({ getAllBundles, open, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ id: null, name: '', description: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    setLoading(true);
    const fetchedCategories = await getAllCategories();
    setCategories(fetchedCategories);
    setLoading(false);
  };

  const handleAddCategory = () => {
    setCurrentCategory({ id: null, name: '', description: '' });
    setEditMode(true);
  };

  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setEditMode(true);
  };

  const handleDeleteClick = (category) => {
    setCurrentCategory(category);
    setConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/categories/${currentCategory.id}`);
      fetchCategories();
      getAllBundles();
      setConfirmDelete(false);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (currentCategory.id) {
        // Update existing category
        await axiosInstance.put(`/categories/${currentCategory.id}`, currentCategory);
        getAllBundles();
      } else {
        // Create new category
        await axiosInstance.post('/categories/add', currentCategory);
      }

      fetchCategories();
      setEditMode(false);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 1
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Manage Categories</Typography>
          <IconButton onClick={onClose} size="small">
            <MdClose />
          </IconButton>
        </Box>

        <Box mb={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
          />
        </Box>

        <Box display="flex" justifyContent="flex-end">
          <Button variant="contained" color="primary" startIcon={<MdAdd />} onClick={handleAddCategory}>
            Add Category
          </Button>
        </Box>

        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {loading
            ? [...Array(5)].map((_, index) => (
                <ListItem key={index}>
                  <Skeleton variant="text" width="60%" height={24} />
                </ListItem>
              ))
            : categories
                .filter((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((category) => (
                  <React.Fragment key={category.id}>
                    <ListItem>
                      <ListItemText primary={category.name} secondary={category.description} />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleEditCategory(category)} sx={{ mr: 1 }}>
                          <MdEdit />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDeleteClick(category)}>
                          <MdDelete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
        </List>

        {/* Edit Category Dialog */}
        <Dialog open={editMode} onClose={() => setEditMode(false)}>
          <DialogTitle>{currentCategory.id ? 'Edit Category' : 'Add Category'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Category Name"
              fullWidth
              value={currentCategory.name}
              onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditMode(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete the category "{currentCategory.name}"?</Typography>
            {currentCategory.bundleCount > 0 ? (
              <Typography color="error">
                You cannot delete this category because it is attached to {currentCategory.bundleCount} bundle(s).
              </Typography>
            ) : (
              <DialogActions>
                <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
                <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                  Delete
                </Button>
              </DialogActions>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Modal>
  );
};

export default CategoryManagement;
