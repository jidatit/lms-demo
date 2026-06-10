import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Tab,
  Tabs,
  CircularProgress,
  Chip
} from '@mui/material';
import { useAuth } from 'contexts/AuthContext';
import { CourseCard } from 'pages/groupleader_dashboard/components/CourseCard';
import ExpandingUserDetail from 'pages/shared/components/ExpandingUserDetail';
import { useUserCourses } from 'api/queries/userCourses';

const Loader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
    <CircularProgress />
  </Box>
);

const Courses = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const { data, isLoading, isError, error } = useUserCourses({
    userId: currentUser?.id
  });

  const courses = data?.data || [];

  const handleTabChange = (_event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <>
      {/* <ExpandingUserDetail data={currentUser} /> */}
      {/* 
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="course tabs">
          <Tab label="My Modules" />
        </Tabs>
      </Box> */}

      {isLoading && <Loader />}

      {isError && (
        <Box textAlign="center" py={4}>
          <Typography color="error">
            Failed to load courses: {error?.message || 'Unknown error'}
          </Typography>
        </Box>
      )}

      {!isLoading && !isError && courses.length === 0 && (
        <Grid item xs={12} sx={{ textAlign: 'center', py: 6 }}>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <Typography variant="h6" color="textSecondary">
              No courses available
            </Typography>
          </Box>
        </Grid>
      )}

      {!isLoading && !isError && courses.length > 0 && (
        <Grid container spacing={3}>
          {courses.map((course, index) => {
            const launchDate = new Date(course?.launchDate);
            const today = new Date();

            const formattedDate = `${String(launchDate?.getDate()).padStart(2, '0')}-${String(
              launchDate?.getMonth() + 1
            ).padStart(2, '0')}-${launchDate?.getFullYear()}`;

            const isLaunched = course?.status === 'active' && today >= launchDate;

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                {isLaunched ? (
                  <Link
                    to={`/subscriber_dashboard/getting_started?course_id=${course?.courseId}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <CourseCard data={course?.course} />
                  </Link>
                ) : (
                  <Box
                    position="relative"
                    sx={{
                      borderRadius: '8px',
                      filter: 'grayscale(30%)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        filter: 'grayscale(0%)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CourseCard data={course?.course} />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                        p: 2,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0) 70%)',
                        borderRadius: '8px',
                        pointerEvents: 'none'
                      }}
                    >
                      <Chip
                        label={course.launchDate ? `Launches: ${formattedDate}` : 'Coming Soon'}
                        color="primary"
                        size="medium"
                        sx={{
                          fontWeight: 'bold',
                          backdropFilter: 'blur(32px)',
                          color: 'white',
                          mb: 1
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Grid>
            );
          })}
        </Grid>
      )}
    </>
  );
};

export default Courses;
