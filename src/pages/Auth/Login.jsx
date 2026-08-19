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
  Divider,
  Grid,
  Chip,
  Tooltip,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ScaleIcon from '@mui/icons-material/Scale';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import ApartmentIcon from '@mui/icons-material/Apartment';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { loginUser, clearError } from '../../store/slices/authSlice.js';

const demoAccounts = [
  {
    role: 'Super Admin',
    email: 'superadmin@lcms.com',
    password: 'superadmin123',
    badge: 'System Admin',
    color: '#f59e0b',
    icon: <AdminPanelSettingsIcon sx={{ color: '#f59e0b', fontSize: 18 }} />,
  },
  {
    role: 'SKIT Admin',
    email: 'skitadmin@lcms.com',
    password: 'skitadmin123',
    badge: 'Platform Admin',
    color: '#38bdf8',
    icon: <AdminPanelSettingsIcon sx={{ color: '#38bdf8', fontSize: 18 }} />,
  },
  {
    role: 'Law Firm Admin',
    email: 'clientadmin@nexuslegal.com',
    password: 'clientadmin123',
    badge: 'Nexus Legal',
    color: '#3b82f6',
    icon: <BusinessIcon sx={{ color: '#3b82f6', fontSize: 18 }} />,
  },
  {
    role: 'Client User (John Doe)',
    email: 'clientuser@nexuslegal.com',
    password: 'clientuser123',
    badge: 'Individual Client',
    color: '#10b981',
    icon: <PersonIcon sx={{ color: '#10b981', fontSize: 18 }} />,
  },
  {
    role: 'Client User (Acme)',
    email: 'legalclient2@example.com',
    password: 'clientuser123',
    badge: 'Corporate Client',
    color: '#a855f7',
    icon: <ApartmentIcon sx={{ color: '#a855f7', fontSize: 18 }} />,
  },
];

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error, user } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'SKIT_SUPER_ADMIN' || user.role === 'SKIT_ADMIN_USER') {
        navigate('/superadmin');
      } else if (user.role === 'CLIENT_ADMIN') {
        navigate('/firm');
      } else if (user.role === 'CLIENT_USER') {
        navigate('/client');
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    dispatch(loginUser({ email: email.trim(), password }));
  };

  const handleQuickDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    dispatch(loginUser({ email: demoEmail, password: demoPassword }));
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
        py: 4,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 520, overflow: 'visible', position: 'relative' }}>
        {/* Glow effect */}
        <Box
          sx={{
            position: 'absolute',
            top: '-20px',
            left: '-20px',
            right: '-20px',
            bottom: '-20px',
            background: 'linear-gradient(45deg, #0284c7, #db2777)',
            filter: 'blur(30px)',
            opacity: 0.12,
            zIndex: -1,
            borderRadius: 6,
          }}
        />
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
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
              LCMS Enterprise
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'center' }}>
              Legal Case Management System Portal
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Quick Demo Accounts Banner */}
          <Box
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 3,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.05)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <FlashOnIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 0.5 }}>
                1-Click Quick Demo Login Accounts
              </Typography>
            </Box>

            <Grid container spacing={1}>
              {demoAccounts.map((acc, index) => (
                <Grid item xs={12} sm={index === 0 ? 12 : 6} key={acc.email}>
                  <Tooltip title={`Click to auto login as ${acc.role} (${acc.email})`} arrow placement="top">
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      disabled={loading}
                      onClick={() => handleQuickDemo(acc.email, acc.password)}
                      sx={{
                        justify: 'space-between',
                        textAlign: 'left',
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        borderColor: 'rgba(255, 255, 255, 0.12)',
                        backgroundColor: 'rgba(30, 41, 59, 0.4)',
                        textTransform: 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: acc.color,
                          backgroundColor: `${acc.color}15`,
                          transform: 'translateY(-1px)',
                          boxShadow: `0 4px 12px ${acc.color}25`,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                          {acc.icon}
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: 'text.primary', lineHeight: 1.2 }}>
                              {acc.role}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block', noWrap: true }}>
                              {acc.email}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={acc.badge}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            backgroundColor: `${acc.color}20`,
                            color: acc.color,
                            border: `1px solid ${acc.color}40`,
                            flexShrink: 0,
                          }}
                        />
                      </Box>
                    </Button>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary">Or sign in manually</Typography>
          </Divider>

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
              autoComplete="email"
              slotProps={{
                input: { sx: { borderRadius: 2 } },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 3 }}>
              <Typography
                variant="body2"
                component={RouterLink}
                to="/forgot-password"
                color="primary.main"
                sx={{ textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
              >
                Forgot Password?
              </Typography>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ py: 1.5, borderRadius: 2, fontSize: '1rem', fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Typography
                variant="body2"
                component={RouterLink}
                to="/register"
                color="primary.main"
                sx={{ textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
              >
                Register here
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
