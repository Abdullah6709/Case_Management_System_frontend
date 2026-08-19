import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ScaleIcon from '@mui/icons-material/Scale';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { registerUser, clearError } from '../../store/slices/authSlice.js';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error, user } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roleName, setRoleName] = useState('CLIENT_ADMIN');
  const [firmName, setFirmName] = useState('');
  const [firmMobile, setFirmMobile] = useState('');
  const [firmAddress, setFirmAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'SKIT_SUPER_ADMIN' || user.role === 'SKIT_ADMIN_USER') {
        navigate('/superadmin');
      } else if (user.role === 'CLIENT_ADMIN' || user.role === 'CLIENT_USER') {
        navigate('/firm');
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!email || !password || !confirmPassword || !roleName) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    if (roleName === 'CLIENT_ADMIN' && !firmName.trim()) {
      setValidationError('Law Firm Name is required for Firm Admin registration.');
      return;
    }

    dispatch(
      registerUser({
        email,
        password,
        roleName,
        firmName,
        firmMobile,
        firmAddress,
      })
    );
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
        py: 6,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 480, overflow: 'visible', position: 'relative' }}>
        {/* Glow background effect */}
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
                boxShadow: '0 8px 16px rgba(56, 189, 248, 0.3)',
              }}
            >
              <ScaleIcon sx={{ fontSize: 30, color: 'white' }} />
            </Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, textAlign: 'center' }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'center' }}>
              Select your role and register for LCMS Enterprise
            </Typography>
          </Box>

          {(error || validationError) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {validationError || error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Role Selection */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-select-label">Select Account Role</InputLabel>
              <Select
                labelId="role-select-label"
                value={roleName}
                label="Select Account Role"
                onChange={(e) => setRoleName(e.target.value)}
                slotProps={{
                  input: { sx: { borderRadius: 2 } },
                }}
              >
                <MenuItem value="SKIT_SUPER_ADMIN">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AdminPanelSettingsIcon sx={{ color: '#F59E0B' }} fontSize="small" />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Skit Super Admin</Typography>
                      <Typography variant="caption" color="text.secondary">Full system & platform administration</Typography>
                    </Box>
                  </Box>
                </MenuItem>

                <MenuItem value="SKIT_ADMIN_USER">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AdminPanelSettingsIcon color="info" fontSize="small" />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Skit Admin User</Typography>
                      <Typography variant="caption" color="text.secondary">Platform admin for assigned law firms</Typography>
                    </Box>
                  </Box>
                </MenuItem>

                <MenuItem value="CLIENT_ADMIN">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Client Admin (Law Firm or Advocate)</Typography>
                      <Typography variant="caption" color="text.secondary">Manages firm advocates, clients & cases</Typography>
                    </Box>
                  </Box>
                </MenuItem>

                <MenuItem value="CLIENT_USER">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Client User</Typography>
                      <Typography variant="caption" color="text.secondary">Client portal access for assigned cases</Typography>
                    </Box>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              slotProps={{
                input: { sx: { borderRadius: 2 } },
              }}
            />

            {/* Conditional fields for Law Firm Admin */}
            {roleName === 'CLIENT_ADMIN' && (
              <>
                <Divider sx={{ my: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">Law Firm Details</Typography>
                </Divider>
                <TextField
                  fullWidth
                  label="Law Firm Name"
                  variant="outlined"
                  margin="normal"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  required
                  placeholder="e.g. Apex Legal Associates"
                  slotProps={{
                    input: { sx: { borderRadius: 2 } },
                  }}
                />
                <TextField
                  fullWidth
                  label="Firm Contact Number"
                  variant="outlined"
                  margin="normal"
                  value={firmMobile}
                  onChange={(e) => setFirmMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  slotProps={{
                    input: { sx: { borderRadius: 2 } },
                  }}
                />
                <TextField
                  fullWidth
                  label="Firm Address"
                  variant="outlined"
                  margin="normal"
                  value={firmAddress}
                  onChange={(e) => setFirmAddress(e.target.value)}
                  placeholder="e.g. High Court Chambers, Delhi"
                  slotProps={{
                    input: { sx: { borderRadius: 2 } },
                  }}
                />
              </>
            )}

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              slotProps={{
                input: {
                  sx: { borderRadius: 2 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              slotProps={{
                input: { sx: { borderRadius: 2 } },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2, fontSize: '1rem', fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Register Account'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Typography
                variant="body2"
                component={RouterLink}
                to="/login"
                color="primary.main"
                sx={{ textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
              >
                Sign In here (Quick Demo Accounts Available)
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
