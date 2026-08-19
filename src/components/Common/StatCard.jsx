import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

const StatCard = ({ title, value, icon, color = 'primary.main', gradient }) => {
  return (
    <Card
      sx={{
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: color,
        }
      }}
    >
      {gradient && (
        <Box
          sx={{
            position: 'absolute',
            top: '-50%',
            right: '-30%',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: gradient,
            filter: 'blur(45px)',
            opacity: 0.15,
            zIndex: 0,
          }}
        />
      )}
      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>
              {value}
            </Typography>
          </Box>
          <Avatar
            sx={{
              backgroundColor: 'action.hover',
              color: color,
              width: 56,
              height: 56,
              border: `1px solid rgba(255,255,255,0.05)`,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
