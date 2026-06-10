import { Alert, Box, Stack } from '@mui/material';
import { MessageQuestion } from 'iconsax-react';
import React from 'react';

const Knowledge = () => {
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Stack spacing={2} sx={{ width: '100%' }}>
        <Alert color="primary" variant="outlined" icon={<MessageQuestion />}>
          Coming Soon
        </Alert>
      </Stack>
    </Box>
  );
};

export default Knowledge;
