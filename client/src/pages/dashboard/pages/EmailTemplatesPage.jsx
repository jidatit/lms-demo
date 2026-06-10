import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  TablePagination,
  CircularProgress
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Edit } from 'iconsax-react';
import { MdDelete } from 'react-icons/md';
import {
  useCreateEmailTemplate,
  useDeleteEmailTemplate,
  useGetAllEmailTemplates,
  useGetEmailTemplateById,
  useGetTemplateTypes,
  useUpdateEmailTemplate
} from 'api/queries/emailTemplates';

const EmailTemplatesPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState({
    id: null,
    name: '',
    subject: '',
    body: '',
    type: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Tanstack Query hooks
  const {
    data: templatesData,
    isLoading: templatesLoading,
    error: templatesError
  } = useGetAllEmailTemplates({
    page: page + 1,
    limit: rowsPerPage
  });
  const { data: templateTypesData, isLoading: typesLoading } = useGetTemplateTypes();
  const createTemplateMutation = useCreateEmailTemplate();
  const updateTemplateMutation = useUpdateEmailTemplate();
  const deleteTemplateMutation = useDeleteEmailTemplate();

  const templates = templatesData?.data || [];
  const totalCount = templatesData?.pagination?.total || 0;
  const templateTypes = templateTypesData?.data?.types || [];

  useEffect(() => {
    if (templatesError) {
      setSnackbar({
        open: true,
        message: templatesError.response?.data?.message || 'Failed to fetch templates',
        severity: 'error'
      });
    }
  }, [templatesError]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (template = null) => {
    console.log('Opening dialog for template:', template);
    if (template) {
      setCurrentTemplate(template);
    } else {
      setCurrentTemplate({
        id: null,
        name: '',
        subject: '',
        body: '',
        type: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDeleteDialog = (template) => {
    setCurrentTemplate({ ...template });
    setConfirmDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setConfirmDeleteDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTemplate((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuillChange = (value) => {
    setCurrentTemplate((prev) => ({
      ...prev,
      body: value
    }));
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false
    }));
  };

  const handleSubmit = async () => {
    if (!currentTemplate.name || !currentTemplate.subject || !currentTemplate.body || !currentTemplate.type) {
      showSnackbar('Please fill all required fields', 'error');
      return;
    }
    try {
      if (currentTemplate.id) {
        await updateTemplateMutation.mutateAsync({
          id: currentTemplate.id,
          data: currentTemplate
        });
        showSnackbar('Template updated successfully');
      } else {
        await createTemplateMutation.mutateAsync(currentTemplate);
        showSnackbar('Template created successfully');
      }
      handleCloseDialog();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'An error occurred', 'error');
      console.error('Error saving template:', error);
    }
  };

  const handleDelete = async () => {
    if (!currentTemplate.id) return;

    try {
      await deleteTemplateMutation.mutateAsync(currentTemplate.id);
      showSnackbar('Template deleted successfully');
      handleCloseDeleteDialog();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'An error occurred', 'error');
      console.error('Error deleting template:', error);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link'],
      ['clean']
    ]
  };

  return (
    // <Container>
    <>
      <Box>
        {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Email Templates</Typography>
          <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
            Create Template
          </Button>
        </Box> */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell width="150">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templatesLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No templates found
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow key={template.id} hover>
                      <TableCell>{template.name}</TableCell>
                      <TableCell>{template.type}</TableCell>
                      <TableCell>{template.subject}</TableCell>
                      <TableCell>
                        <IconButton color="primary" onClick={() => handleOpenDialog(template)} size="small">
                          <Edit />
                        </IconButton>
                        {/* <IconButton color="error" onClick={() => handleOpenDeleteDialog(template)} size="small">
                          <MdDelete />
                        </IconButton> */}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{currentTemplate.id ? 'Edit Email Template' : 'Create Email Template'}</DialogTitle>
        <DialogContent dividers>
          {!currentTemplate ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              <InputLabel htmlFor="name">Template Name</InputLabel>
              <TextField
                placeholder="Template Name"
                name="name"
                value={currentTemplate.name}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={Boolean(currentTemplate.id)}
              />
              <InputLabel id="type-label">Template Type</InputLabel>
              <FormControl fullWidth required disabled={Boolean(currentTemplate.id)}>
                <Select
                  labelId="type-label"
                  name="type"
                  value={currentTemplate.type}
                  onChange={handleInputChange}
                  displayEmpty
                  renderValue={(val) => (val ? val : 'Select a template type')}
                  disabled={Boolean(currentTemplate.id)}
                >
                  <MenuItem value="" disabled>
                    Select a template type
                  </MenuItem>
                  {templateTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <InputLabel>Email Subject</InputLabel>
              <TextField
                placeholder="Email Subject"
                name="subject"
                value={currentTemplate.subject}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <Typography variant="subtitle1" gutterBottom>
                Email Body (HTML)
              </Typography>
              <Box sx={{ height: 350 }}>
                <ReactQuill
                  theme="snow"
                  value={currentTemplate.body}
                  onChange={handleQuillChange}
                  modules={modules}
                  style={{ height: 300 }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
            startIcon={
              createTemplateMutation.isPending || updateTemplateMutation.isPending ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {currentTemplate.id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete the template "{currentTemplate.name}"? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={deleteTemplateMutation.isPending}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EmailTemplatesPage;
