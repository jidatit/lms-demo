import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, CircularProgress, Card, CardContent, CardMedia, Typography, Grid } from '@mui/material';
import { useAuth } from 'contexts/AuthContext';
import CourseBrowser from '../components/CourseBrowser';
import { useUserCourseById } from 'api/queries/userCourses';
import { useLessonsByCourse } from 'api/queries/lessons';

const ViewCourse = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userCourseId, setUserCourseId] = useState(null);
  const [courseId, setCourseId] = useState(null);

  // Extract userCourseId and courseId from URL params
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const userCourseIdParam = params.get("userCourseId");
      const courseIdParam = params.get("course_id");

      if (userCourseIdParam) setUserCourseId(userCourseIdParam);
      if (courseIdParam) setCourseId(courseIdParam);
    } catch (error) {
      console.error("Error parsing URL params:", error);
    }
  }, []);

  // Use userCourseId for user course data and courseId for lessons
  const { data: userCourseData, isLoading: courseLoading, isError: courseError } = useUserCourseById(userCourseId);
  const { data: lessonsData, isLoading: lessonsLoading, isError: lessonsError } = useLessonsByCourse(courseId, {
    page: 1,
    limit: 100
  });

  // Use course data from userCourseData.data for display
  const courseData = userCourseData?.data;
  const triggerCourse = courseData?.triggerCourse;

  // Redirect to GettingStarted if triggerCourse is false (course not started yet)
  useEffect(() => {
    if (courseData && triggerCourse === false && courseId) {
      const dashboardPath = currentUser.role === 'groupLeader'
        ? '/groupleader_dashboard'
        : '/subscriber_dashboard';
      
      navigate(`${dashboardPath}/getting_started?course_id=${courseId}`);
    }
  }, [triggerCourse, courseData, courseId, currentUser.role, navigate]);

  const isLoading = courseLoading || lessonsLoading;

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (courseError || lessonsError || !courseData) {
    return (
      <Container>
        <Typography variant="h6" align="center">
          {courseError || lessonsError ? 'Error loading course data' : 'No course data available'}
        </Typography>
      </Container>
    );
  }

  // If triggerCourse is false, we should have redirected, but show loading as fallback
  if (triggerCourse === false) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, mb: 4 }}>
        {courseData.featuredImage ? (
          <CardMedia
            component="img"
            sx={{ width: { xs: '100%', md: '40%' }, minHeight: 200, objectFit: 'cover' }}
            image={`${import.meta.env.VITE_APP_BASE_URL}/${courseData.featuredImage}`}
            alt={courseData.title}
          />
        ) : (
          <CardContent
            sx={{
              width: { xs: '100%', md: '40%' },
              minHeight: 200,
              borderWidth: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h6" color="text.secondary" align="center">
              No Image Available
            </Typography>
          </CardContent>
        )}
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            {courseData?.course?.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {courseData?.course?.description}
          </Typography>
        </CardContent>
      </Card>
      <Grid container spacing={2}>
        {lessonsData?.data?.length > 0 && currentUser ? (
          <Grid item xs={12}>
            <CourseBrowser 
              lessons={lessonsData?.data} 
              courseId={courseId} 
              userCourseId={userCourseId}
              user={currentUser} 
            />
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No Lessons Uploaded
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default ViewCourse;
