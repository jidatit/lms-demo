import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
  styled
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'selected'
})(({ selected }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  borderRadius: '16px', // Reduced from 24px
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: selected ? '#e3f2fd' : '#ffffff',
  boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)' // Softer, less prominent shadow
}));

const StyledCardContent = styled(CardContent)({
  flexGrow: 1,
  padding: '16px', // Reduced from 24px
  display: 'flex',
  flexDirection: 'column',
  gap: '8px' // Add some spacing between elements
});
const BundleCourseManagement = ({ bundleId, allCourses, existingCourses, onUpdateBundleCourses, admin }) => {
  const [open, setOpen] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);

  // Courses not already in the bundle
  const availableCourses = allCourses.filter((course) => !existingCourses.some((existingCourse) => existingCourse.id === course.id));

  const handleOpenDialog = () => {
    setOpen(true);
    setSelectedCourses([]);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourses((prev) => (prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]));
  };

  const handleDeleteCourse = async (courseId) => {
    // Remove course from bundle
    const updatedCourseIds = existingCourses.filter((course) => course.id !== courseId).map((course) => course.id);

    onUpdateBundleCourses(updatedCourseIds);
  };

  const handleAddCourses = async () => {
    const updatedCourseIds = [...existingCourses.map((course) => course.id), ...selectedCourses];

    onUpdateBundleCourses(updatedCourseIds);
    handleCloseDialog();
  };

  return (
    <Box sx={{ width: '100%', ml: 4, mt: 2 }}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl ">Courses in Bundle</h1>
        {admin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: '#299aa1',
              '&:hover': {
                bgcolor: '#00A3AE'
              },
              height: 'fit-content',

              marginTop: '12px'
            }}
            onClick={handleOpenDialog}
          >
            Add Courses
          </Button>
        )}
      </div>

      {/* Existing Bundle Courses */}
      {/* <Grid container spacing={2} sx={{ mb: 2 }}>
        {existingCourses.map((course) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
            <Card>
              <CardContent
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1">{course.title}</Typography>
                <IconButton
                  color="error"
                  onClick={() => handleDeleteCourse(course.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid> */}
      <Grid container spacing={2}>
        {existingCourses.map((course, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={index}>
            <Link
              to={`/${admin ? 'dashboard' : 'contrib_dashboard'}/course_details?id=${course.id} ${admin ? '&admin=true' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              <StyledCard>
                <StyledCardContent>
                  <Typography
                    variant="subtitle1"
                    component="h2"
                    sx={{
                      fontWeight: 600,
                      mb: 0,
                      lineHeight: 1.2
                    }}
                  >
                    {course.title}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%'
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        mb: 0,
                        lineHeight: 1.2
                      }}
                    >
                      Course ID: {course.id}
                    </Typography>
                    {admin && (
                      <IconButton
                        color="error"
                        size="small"
                        sx={{
                          p: 0.5,
                          ml: 1 // Add a small margin to separate from Course ID
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteCourse(course.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </StyledCardContent>
              </StyledCard>
            </Link>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add Courses to Bundle</DialogTitle>
        <DialogContent>
          <List>
            {availableCourses.map((course) => (
              <ListItem
                key={course.id}
                dense
                secondaryAction={
                  <Checkbox edge="end" checked={selectedCourses.includes(course.id)} onChange={() => handleCourseSelect(course.id)} />
                }
              >
                <ListItemText primary={course.title} secondary={`Course ID: ${course.id} `} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddCourses} color="primary" disabled={selectedCourses.length === 0}>
            Add Selected Courses
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BundleCourseManagement;
