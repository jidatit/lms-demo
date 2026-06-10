import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Grid,
  Paper,
  Button,
  Chip,
  Tooltip,
  Alert,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Stack,
  Divider,
  CircularProgress
} from '@mui/material';
import VideoIframe from './h5p/hp5IFrame';
import { useMyLessonProgress, useCreateLessonProgress, useUpdateLessonProgress } from 'api/queries/lessonProgress';
import { useAuth } from 'contexts/AuthContext';
import { LockCircle, TickCircle, Play, ArrowLeft2, ArrowRight2 } from 'iconsax-react';

const CourseBrowser = ({ lessons, courseId, userCourseId, user }) => {
  const { currentUser } = useAuth();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  // Sort lessons by createdAt to ensure proper order
  const sortedLessons = useMemo(() => {
    if (!lessons || lessons.length === 0) return [];
    return [...lessons].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [lessons]);

  // Fetch lesson progress using the new API
  // Prefer userCourseId, fallback to courseId
  const { data: progressData, isLoading: progressLoading, refetch: refetchProgress } = useMyLessonProgress({
    ...(userCourseId ? { userCourseId } : { courseId })
  });

  // Create progress map and completed lesson IDs
  const progressMap = useMemo(() => {
    if (!progressData?.data) return new Map();
    return new Map(progressData.data.map(p => [p.lesson?.id || p.lessonId, p]));
  }, [progressData]);

  const completedLessonIds = useMemo(() => {
    if (!progressData?.data) return [];
    return progressData.data
      .filter(p => p.isCompleted)
      .map(p => p.lesson?.id || p.lessonId);
  }, [progressData]);

  // Determine which lessons are unlocked
  const isLessonUnlocked = (lessonIndex) => {
    if (lessonIndex === 0) return true; // First lesson always unlocked
    if (sortedLessons.length === 0) return false;

    const previousLesson = sortedLessons[lessonIndex - 1];
    return completedLessonIds.includes(previousLesson.id);
  };

  const unlockedLessons = useMemo(() => {
    return sortedLessons.map((_, index) => isLessonUnlocked(index));
  }, [sortedLessons, completedLessonIds]);

  // Mutations for creating and updating progress
  const createProgress = useCreateLessonProgress();
  const updateProgress = useUpdateLessonProgress();

  // Handle lesson completion
  const handleLessonComplete = async (lessonId) => {
    if (!currentUser) return;

    try {
      const existingProgress = progressMap.get(lessonId);

      if (existingProgress) {
        // Update existing progress
        await updateProgress.mutateAsync({
          id: existingProgress.id,
          isCompleted: true,
          userCourseId: userCourseId
        });
      } else {
        // Create new progress
        await createProgress.mutateAsync({
          lessonId: lessonId,
          userId: currentUser.id,
          userCourseId: userCourseId,
          isCompleted: true
        });
      }

      // Refetch progress to update UI
      await refetchProgress();
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      // Error handling is done by React Query
    }
  };

  // Set current lesson to first unlocked lesson if current is locked
  useEffect(() => {
    if (sortedLessons.length > 0 && !isLessonUnlocked(currentLessonIndex)) {
      const firstUnlockedIndex = unlockedLessons.findIndex(unlocked => unlocked);
      if (firstUnlockedIndex !== -1) {
        setCurrentLessonIndex(firstUnlockedIndex);
      }
    }
  }, [unlockedLessons, currentLessonIndex, sortedLessons]);

  const handleNextLesson = () => {
    if (currentLessonIndex < sortedLessons.length - 1) {
      const nextIndex = currentLessonIndex + 1;
      if (isLessonUnlocked(nextIndex)) {
        setCurrentLessonIndex(nextIndex);
      }
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const handleMarkAsComplete = () => {
    const currentLesson = sortedLessons[currentLessonIndex];
    if (currentLesson) {
      handleLessonComplete(currentLesson.id);
    }
  };

  const handleLessonClick = (index) => {
    if (isLessonUnlocked(index)) {
      setCurrentLessonIndex(index);
    }
  };

  // Calculate progress
  const completedCount = completedLessonIds.length;
  const totalLessons = sortedLessons.length;
  const progressPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
  const isCourseComplete = totalLessons > 0 && completedCount === totalLessons;

  // Get current lesson
  const currentLesson = sortedLessons[currentLessonIndex];
  const isCurrentLessonCompleted = currentLesson ? completedLessonIds.includes(currentLesson.id) : false;
  const isCurrentLessonUnlocked = currentLesson ? isLessonUnlocked(currentLessonIndex) : false;

  if (progressLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Loading progress...</Typography>
      </Box>
    );
  }

  if (!currentLesson) {
    return (
      <Alert severity="info">No lessons available for this course.</Alert>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      {/* Progress Header Card */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          backgroundColor: 'primary.main',
          color: 'white',
          borderRadius: 3
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Course Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progressPercentage}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 6,
                        bgcolor: 'white'
                      }
                    }}
                  />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, minWidth: 80, textAlign: 'right' }}>
                  {progressPercentage.toFixed(0)}%
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {completedCount} of {totalLessons} lessons completed
                {isCourseComplete && ' • Course Completed! 🎉'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Lessons Sidebar */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Lessons ({sortedLessons.length})
              </Typography>
            </Box>
            <Box sx={{ maxHeight: '70vh', overflowY: 'auto', p: 1 }}>
              {sortedLessons.map((lesson, index) => {
                const isUnlocked = isLessonUnlocked(index);
                const isCompleted = completedLessonIds.includes(lesson.id);
                const isActive = index === currentLessonIndex;

                return (
                  <Card
                    key={lesson.id}
                    elevation={0}
                    sx={{
                      mb: 1,
                      border: isActive ? 2 : 1,
                      borderColor: isActive ? 'primary.main' : 'divider',
                      bgcolor: isActive ? 'action.selected' : 'background.paper',
                      cursor: isUnlocked ? 'pointer' : 'not-allowed',
                      opacity: isUnlocked ? 1 : 0.6,
                      transition: 'all 0.2s ease',
                      '&:hover': isUnlocked ? {
                        transform: 'translateX(4px)',
                        boxShadow: 2
                      } : {},
                      position: 'relative',
                      overflow: 'visible'
                    }}
                    onClick={() => handleLessonClick(index)}
                  >
                    <CardActionArea disabled={!isUnlocked} sx={{ p: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Avatar
                          sx={{
                            bgcolor: isActive
                              ? 'primary.main'
                              : isCompleted
                                ? 'success.main'
                                : isUnlocked
                                  ? 'grey.400'
                                  : 'grey.300',
                            width: 40,
                            height: 40,
                            fontSize: '0.875rem',
                            fontWeight: 600
                          }}
                        >
                          {isCompleted ? (
                            <TickCircle size={20} color="white" />
                          ) : !isUnlocked ? (
                            <LockCircle size={20} color="white" />
                          ) : (
                            index + 1
                          )}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: isActive ? 700 : 500,
                              color: isUnlocked ? 'text.primary' : 'text.disabled',
                              mb: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: 1.4
                            }}
                          >
                            {lesson.title}
                          </Typography>
                          {lesson.description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: 1.4
                              }}
                            >
                              {lesson.description}
                            </Typography>
                          )}
                          {!isUnlocked && (
                            <Chip
                              label="Locked"
                              size="small"
                              sx={{ mt: 1, height: 20, fontSize: '0.65rem' }}
                              icon={<LockCircle size={14} />}
                            />
                          )}
                        </Box>
                      </Stack>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Box>
          </Card>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={8}>
          {!isCurrentLessonUnlocked ? (
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <LockCircle size={64} color="#9e9e9e" style={{ marginBottom: 16 }} />
                <Typography variant="h5" gutterBottom>
                  Lesson Locked
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Please complete the previous lesson to unlock this one.
                </Typography>
                {currentLessonIndex > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<ArrowLeft2 />}
                    onClick={handlePreviousLesson}
                  >
                    Go to Previous Lesson
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              {/* Lesson Header */}
              <Box sx={{ bgcolor: 'background.default', p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Chip
                        label={`Lesson ${currentLessonIndex + 1} of ${totalLessons}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {isCurrentLessonCompleted && (
                        <Chip
                          icon={<TickCircle size={16} />}
                          label="Completed"
                          size="small"
                          color="success"
                        />
                      )}
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {currentLesson.title}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <CardContent sx={{ p: 0 }}>
                {/* Lesson Description */}
                {currentLesson.description && (
                  <Box sx={{ p: 3, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="body1" color="text.secondary">
                      {currentLesson.description}
                    </Typography>
                  </Box>
                )}

                {/* Video Player */}
                <Box sx={{
                  position: 'relative',
                  bgcolor: '#000',
                  minHeight: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {currentLesson.videoUrl ? (
                    <Box sx={{ width: '100%', aspectRatio: '16/9' }}>
                      <VideoIframe videoUrl={currentLesson.videoUrl} />
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', p: 4 }}>
                      <Play size={48} color="#9e9e9e" style={{ marginBottom: 16 }} />
                      <Typography variant="body1" color="text.secondary">
                        No video content available for this lesson
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Action Buttons */}
                <Box sx={{ p: 3, bgcolor: 'background.default' }}>
                  <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" flexWrap="wrap">
                    <Button
                      variant="outlined"
                      startIcon={<ArrowLeft2 />}
                      onClick={handlePreviousLesson}
                      disabled={currentLessonIndex === 0}
                      sx={{ minWidth: 160 }}
                    >
                      Previous
                    </Button>

                    <Stack direction="row" spacing={2} alignItems="center">
                      {!isCurrentLessonCompleted && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleMarkAsComplete}
                          disabled={createProgress.isPending || updateProgress.isPending}
                          sx={{ minWidth: 180 }}
                          startIcon={
                            createProgress.isPending || updateProgress.isPending ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <TickCircle size={20} />
                            )
                          }
                        >
                          {createProgress.isPending || updateProgress.isPending
                            ? 'Marking...'
                            : 'Mark as Complete'}
                        </Button>
                      )}
                      {currentLessonIndex < sortedLessons.length - 1 && isCurrentLessonCompleted && (
                        <Button
                          variant="contained"
                          color="primary"
                          endIcon={<ArrowRight2 />}
                          onClick={handleNextLesson}
                          sx={{ minWidth: 160 }}
                        >
                          Next Lesson
                        </Button>
                      )}
                      {isCourseComplete && (
                        <Chip
                          icon={<TickCircle size={20} />}
                          label="Course Completed!"
                          color="success"
                          sx={{ px: 2, py: 3, fontSize: '0.875rem' }}
                        />
                      )}
                    </Stack>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseBrowser;
