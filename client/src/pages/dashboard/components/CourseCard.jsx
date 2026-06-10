import React from 'react';
import { Link } from 'react-router-dom';
import MainCard from 'components/MainCard'; // Assuming MainCard is a custom component you are using.
import { Box, CardContent, CardMedia, Chip, Divider, Grid, Stack, Typography, Button } from '@mui/material';
import courseImage from '../../../assets/course.png';
import { FaCartPlus } from 'react-icons/fa6';
export const CourseCard = ({ data, discounts }) => {
  // Find applicable discount for the course
  const discount = discounts.find((d) => d.resource_Id === data.id && d.enable === 'true');

  const getOriginalPrice = () => parseFloat(data.priceperseat) || 0;
  const originalPrice = getOriginalPrice();
  const discountedPrice = discount ? originalPrice * (1 - (parseFloat(discount.percentage) || 0) / 100) : originalPrice;

  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : '0.00';
  };

  return (
    <Link to={`/dashboard/course_details?id=${data.id}&admin=true`} style={{ textDecoration: 'none' }}>
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
        {discount && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: '100%', position: 'absolute', top: 0, pt: 1.75, pl: 2, pr: 1 }}
          >
            <Chip label={`${discount.percentage}% OFF`} variant="filled" color="error" size="small" />
          </Stack>
        )}

        <Divider />

        {/* Course Details */}
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Stack>
                {/* Course Title */}
                <Typography
                  component={Link}
                  to={`/dashboard/courses/${data.id}`}
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

            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" rowGap={1.75}>
                {/* Pricing */}
                {discount ? (
                  <Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h5" color="success.main">
                        ${formatPrice(discountedPrice)} <span style={{ fontSize: '12px' }}>/seat</span>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                        ${formatPrice(originalPrice)} <span style={{ fontSize: '12px' }}>/seat</span>
                      </Typography>
                    </Stack>
                  </Stack>
                ) : (
                  <Stack>
                    <Typography variant="h5" color="primary">
                      ${formatPrice(originalPrice)}
                      <span style={{ fontSize: '12px' }}>/seat</span>
                    </Typography>
                  </Stack>
                )}

                {/* Add to Cart Button */}
                <Link to={`/dashboard/mycart?course_id=${data.id}`}>
                  <FaCartPlus size={20} color="#009688" style={{ cursor: 'pointer' }} />
                </Link>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </MainCard>
    </Link>
  );
};
