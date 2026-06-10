import React from 'react';
import { Link } from 'react-router-dom';
import MainCard from 'components/MainCard'; // Assuming MainCard is a custom component you are using.
import { Box, CardContent, CardMedia, Chip, Divider, Grid, Stack, Typography, Button } from '@mui/material';
import courseImage from '../../../assets/course.png';
import { FaCartPlus } from 'react-icons/fa6';
export const CourseCard = ({ data }) => {
  // Find applicable discount for the course

  return (
    <MainCard
      content={false}
      sx={{
        '&:hover': {
          transform: 'scale3d(1.02, 1.02, 1)',
          transition: 'all .4s ease-in-out'
        }
      }}
    >
      {/* Course Image */}
      <Box sx={{ width: '100%', m: 'auto' }}>
        <CardMedia sx={{ height: 200, textDecoration: 'none' }} image={courseImage} component="img" alt="Course Icon" />
      </Box>

      {/* Discount Badge */}

      <Divider />

      {/* Course Details */}
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Stack>
              {/* Course Title */}
              <Typography
                component={Link}
                color="text.primary"
                variant="h5"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  textDecoration: 'none'
                }}
              >
                {data.title}
              </Typography>

              {/* Course Description */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 3,
                  lineHeight: 1.5,
                  height: 'calc(1.5em * 3)'
                }}
              >
                {data.description}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </MainCard>
  );
};
