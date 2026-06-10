import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Alert } from '@mui/material';
import { useAuth } from 'contexts/AuthContext';
import CourseWelcome from '../components/CourseWelcome';
import { useToggleTriggerCourse } from 'api/queries/lessonProgress';
import { useUserCourses } from 'api/queries/userCourses';

const GettingStarted = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [buttonLoader, setButtonLoader] = useState(false);

  // Get courseId from URL
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get('course_id');

  // Fetch user courses to find the userCourseId for this course
  const { data: userCoursesData, isLoading: coursesLoading, isError: coursesError } = useUserCourses({
    userId: currentUser?.id,
    courseId: courseId || ''
  });
  // Find the userCourse for this specific course
  const userCourse = userCoursesData?.data?.find(
    (uc) => uc.courseId === courseId || uc.course?.id === courseId
  );

  const userCourseId = userCourse?.id;
  const triggerCourse = userCourse?.triggerCourse;

  // Auto-redirect to ViewCourse if triggerCourse is true (course already started)
  useEffect(() => {
    if (triggerCourse === true && userCourseId) {
      const dashboardPath = currentUser.role === 'groupLeader'
        ? '/groupleader_dashboard'
        : '/subscriber_dashboard';

      const viewParams = new URLSearchParams({
        userCourseId: userCourseId,
        course_id: courseId || userCourse?.courseId || ''
      });

      navigate(`${dashboardPath}/view_course?${viewParams.toString()}`);
    }
  }, [triggerCourse, userCourseId, courseId, currentUser.role, navigate, userCourse]);

  // Mutation to toggle triggerCourse flag
  const toggleTriggerCourse = useToggleTriggerCourse();

  const handleMarkCourseAsStarted = async () => {
    if (!userCourseId) {
      console.error('User course ID not found');
      return;
    }

    try {
      setButtonLoader(true);

      // Toggle triggerCourse to true to mark course as started
      const response = await toggleTriggerCourse.mutateAsync({
        userCourseId,
        triggerCourse: true
      });

      if (response?.success) {
        // Navigate to ViewCourse after successful toggle
        const dashboardPath = currentUser.role === 'groupLeader'
          ? '/groupleader_dashboard'
          : '/subscriber_dashboard';

        const viewParams = new URLSearchParams({
          userCourseId: userCourseId,
          course_id: courseId || userCourse?.courseId || ''
        });

        navigate(`${dashboardPath}/view_course?${viewParams.toString()}`);
      } else {
        throw new Error('Failed to mark course as started');
      }
    } catch (error) {
      console.error('Error marking course as started:', error);
      // Error will be handled by React Query's error state
    } finally {
      setButtonLoader(false);
    }
  };

  // Handle loading state
  if (coursesLoading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <CircularProgress />
      </div>
    );
  }

  // Handle error state
  if (coursesError || !userCourse) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Alert severity="error">
          {coursesError
            ? 'Failed to load course data. Please try again.'
            : 'Course not found or you are not enrolled in this course.'}
        </Alert>
      </div>
    );
  }

  // Show welcome screen only if triggerCourse is false
  if (triggerCourse === false) {
    return (
      <CourseWelcome
        Loader={coursesLoading}
        CourseData={userCourse}
        handleMarkCourseAsStarted={handleMarkCourseAsStarted}
        buttonLoader={buttonLoader || toggleTriggerCourse.isPending}
      />
    );
  }

  // If triggerCourse is true, we should have redirected, but show loading as fallback
  return (
    <div className="flex justify-center items-center h-screen w-full">
      <CircularProgress />
    </div>
  );
};

export default GettingStarted;
