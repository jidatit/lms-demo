import { CircularProgress, Grid, Typography, Chip, Box } from '@mui/material';
import { useAuth } from 'contexts/AuthContext';
import React from 'react';
import { Link } from 'react-router-dom';
import { CourseCard } from '../components/CourseCard';
import { useUserCourses } from 'api/queries/userCourses';

const Courses = () => {
  const { currentUser } = useAuth();
  const { data, isLoading, isError, error } = useUserCourses({
    userId: currentUser?.id // pass as object
  });

  const courses = data?.data || []; // adjust based on your backend response
  console.log("courses on dash", courses);
  if (isLoading) {
    return (
      <Grid item xs={12} style={{ textAlign: 'center', padding: '20px', marginTop: '100px' }}>
        <CircularProgress />
      </Grid>
    );
  }

  if (isError) {
    return (
      <Grid item xs={12} style={{ textAlign: 'center', padding: '20px', marginTop: '100px' }}>
        <Typography color="error">Failed to load courses: {error?.message || 'Unknown error'}</Typography>
      </Grid>
    );
  }

  if (!courses.length) {
    return (
      <Grid item xs={12} style={{ textAlign: 'center', padding: '20px', marginTop: '100px' }}>
        <Typography variant="h6" color="textSecondary">
          No courses assigned
        </Typography>
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {courses.map((course, index) => {
        const launchDate = new Date(course?.launchDate);
        const today = new Date();

        const formattedDate = `${String(launchDate?.getDate()).padStart(2, '0')}-${String(
          launchDate?.getMonth() + 1
        ).padStart(2, '0')}-${launchDate?.getFullYear()}`;

        const isLaunched = course?.status === 'active' && today >= launchDate;

        return (
          <Grid
            item
            xs={6}
            sm={4}
            md={4}
            lg={3}
            xl={3}
            key={index}
          >
            {isLaunched ? (
              <Link
                to={`/groupleader_dashboard/getting_started?course_id=${course.id}`}
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
                    padding: '16px',
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
                      background: 'primary',
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
  );
};

export default Courses;
