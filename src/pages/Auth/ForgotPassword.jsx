import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
} from '@mui/material';
import ScaleIcon from '@mui/icons-material/Scale';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [retrievedToken, setRetrievedToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    setRetrievedToken('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      setSuccess(response.data.message);
      // In development mode, retrieve the reset token from response
      if (response.data.resetToken) {
        setRetrievedToken(response.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
                backgroundColor: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                boxShadow: '0 8px 16px rgba(219, 39, 119, 0.3)',
              }}
            >
              <ScaleIcon sx={{ fontSize: 30, color: 'white' }} />
            </Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 800, textAlign: 'center' }}>
              Recover Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              Enter email to request reset link & retrieve dev token
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {retrievedToken && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.dark', borderRadius: 2, color: 'white' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                🔑 Developer Reset Token:
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all', mt: 1, fontFamily: 'monospace', bgcolor: 'rgba(0,0,0,0.2)', p: 1, borderRadius: 1 }}>
                {retrievedToken}
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate(`/reset-password?token=${retrievedToken}`)}
              >
                Go to Reset Password Screen
              </Button>
            </Box>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || !!retrievedToken}
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !!retrievedToken}
              sx={{ py: 1.5, mt: 2, borderRadius: 2, fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Request Reset'}
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

export default ForgotPassword;
