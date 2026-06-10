import React from 'react';
import { CircularProgress, Button, Typography, Box, Paper, Container } from '@mui/material';

const CourseWelcome = ({ Loader, CourseData, handleMarkCourseAsStarted, buttonLoader }) => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {Loader ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      ) : (
        <Paper
          elevation={3}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            overflow: 'hidden',
            borderRadius: 2
          }}
        >
          <Box
            sx={{
              flex: 1,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Welcome to Our Course!
            </Typography>
            <Typography variant="body1">Embark on an exciting learning journey with us.</Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              bgcolor: 'background.paper',
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Get ready to dive into the fundamentals and advanced concepts of our course. Our step-by-step approach ensures you gain
              practical skills and knowledge.
            </Typography>

            {CourseData && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {CourseData?.course?.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                  {CourseData?.course?.description?.length > 100 ? `${CourseData?.course?.description?.slice(0, 100)}...` : CourseData?.course?.description}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleMarkCourseAsStarted}
                  disabled={buttonLoader}
                  sx={{ fontWeight: 'bold' }}
                >
                  {buttonLoader ? (
                    <>
                      <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                      Redirecting...
                    </>
                  ) : (
                    'Get Started!'
                  )}
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default CourseWelcome;
