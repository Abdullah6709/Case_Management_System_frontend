import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress size={80} thickness={3} color="primary" />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GavelIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        </Box>
      </Box>
    </Box>
  );
};

export default LoadingScreen;

