import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Container,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('A valid reset token is required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        token,
        newPassword,
      });
      setSuccess(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'radial-gradient(circle at 10% 20%, rgba(13, 21, 39, 0.95) 0%, rgba(7, 10, 19, 0.98) 90%)',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420, overflow: 'visible', position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            top: '-20px',
            left: '-20px',
            right: '-20px',
            bottom: '-20px',
            background: 'linear-gradient(45deg, #0284c7, #db2777)',
            filter: 'blur(30px)',
            opacity: 0.1,
            zIndex: -1,
            borderRadius: 6,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                boxShadow: '0 8px 16px rgba(2, 132, 199, 0.3)',
              }}
            >
              <ScaleIcon sx={{ fontSize: 30, color: 'white' }} />
            </Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 800, textAlign: 'center' }}>
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              Provide reset token and select your new password
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}. Redirecting to Login...
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Reset Token"
              variant="outlined"
              margin="normal"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              disabled={loading || !!searchParams.get('token')}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ py: 1.5, mt: 2, borderRadius: 2, fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
          </form>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Typography
              variant="body2"
              component={RouterLink}
              to="/login"
              color="primary.main"
              sx={{ textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
            >
              Back to Sign In
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPassword;
