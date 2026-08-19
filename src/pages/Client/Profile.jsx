import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Chip,
  Grid,
  MenuItem,
  Avatar,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Badge,
} from '@mui/material';

import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import BadgeIcon from '@mui/icons-material/Badge';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import BusinessIcon from '@mui/icons-material/Business';
import KeyIcon from '@mui/icons-material/Key';

import LoadingScreen from '../../components/Common/LoadingScreen.jsx';

const ClientProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Form Fields
  const [clientId, setClientId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [alternateMobile, setAlternateMobile] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');

  // Password Security Fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Snackbar Notification State
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me');
      const u = response.data;
      const p = response.data.profile;

      if (u) {
        setEmail(u.email || '');
      }

      if (p) {
        setClientId(p.id || p._id || '');
        setFullName(p.fullName || '');
        setMobileNumber(p.mobileNumber || '');
        setAlternateMobile(p.alternateMobile || '');
        setDob(p.dob ? p.dob.split('T')[0] : '');
        setGender(p.gender || 'Male');
        setAddress(p.address || '');
        setState(p.state || '');
        setCity(p.city || '');
        setPinCode(p.pinCode || '');
        setAadhaarNumber(p.aadhaarNumber || '');
        setPanNumber(p.panNumber || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      showSnackbar('Failed to load profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCopyClientId = () => {
    if (clientId) {
      navigator.clipboard.writeText(clientId);
      showSnackbar(`Client ID (${clientId}) copied to clipboard!`, 'info');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      showSnackbar('New passwords do not match.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName,
        mobileNumber,
        alternateMobile,
        dob,
        gender,
        address,
        state,
        city,
        pinCode,
        aadhaarNumber,
        panNumber,
      };

      if (newPassword) {
        payload.password = newPassword;
      }

      await axios.put('http://localhost:5000/api/auth/profile', payload);
      showSnackbar('Profile settings updated successfully!', 'success');
      setNewPassword('');
      setConfirmPassword('');
      fetchProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      showSnackbar(err.response?.data?.message || 'Failed to update profile settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen message="Unlocking Profile & Security Settings..." />;

  const userInitials = fullName ? fullName.charAt(0).toUpperCase() : email.charAt(0).toUpperCase();

  return (
    <Box sx={{ py: 1, pb: 6, maxWidth: 1000, mx: 'auto' }}>
      {/* Executive Profile Hero Header */}
      <Card
        sx={{
          mb: 3,
          p: { xs: 2.5, sm: 3.5 },
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.92) 50%, rgba(11, 25, 44, 0.98) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Tooltip title="Verified Client Account">
                <CheckCircleIcon sx={{ color: '#10B981', bgcolor: '#000', borderRadius: '50%', fontSize: 22 }} />
              </Tooltip>
            }
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: '#D4AF37',
                color: '#000',
                fontWeight: 800,
                fontSize: '2.2rem',
                border: '3px solid #FFFFFF',
                boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
              }}
            >
              {userInitials}
            </Avatar>
          </Badge>

          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75, flexWrap: 'wrap' }}>
              <Chip
                icon={<ShieldIcon style={{ fontSize: 14, color: '#38BDF8' }} />}
                label="VERIFIED CLIENT PROFILE • SECURE PORTAL"
                size="small"
                sx={{
                  bgcolor: 'rgba(56, 189, 248, 0.12)',
                  color: '#38BDF8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  letterSpacing: '0.04em',
                }}
              />
              {clientId && (
                <Chip
                  label={`CLIENT ID: ${clientId}`}
                  size="small"
                  onClick={handleCopyClientId}
                  onDelete={handleCopyClientId}
                  deleteIcon={<ContentCopyIcon style={{ fontSize: 13, color: '#D4AF37' }} />}
                  sx={{
                    bgcolor: 'rgba(212, 175, 55, 0.12)',
                    color: '#D4AF37',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    fontSize: '0.7rem',
                  }}
                />
              )}
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontFamily: '"Cinzel", serif',
                color: '#FFFFFF',
                letterSpacing: '-0.01em',
                fontSize: { xs: '1.4rem', sm: '1.8rem' },
              }}
            >
              {fullName || 'Client User Profile'}
            </Typography>

            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.5 }}>
              📧 {email} | 📱 {mobileNumber || 'Mobile line linked'} | 🏛️ <b>Represented Matter Client</b>
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Main Profile Form Card with Navigation Tabs */}
      <Card sx={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.88rem',
                minHeight: 48,
                px: 2.5,
              },
            }}
          >
            <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Personal Details" />
            <Tab icon={<HomeIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Contact & Address" />
            <Tab icon={<LockIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Account Security" />
          </Tabs>
        </Box>

        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <form onSubmit={handleSubmit}>
            {/* TAB 0: Personal Details */}
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Full Client Name"
                    required
                    fullWidth
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: '#38BDF8' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Registered Email Address"
                    type="email"
                    required
                    fullWidth
                    value={email}
                    disabled
                    helperText="Email is linked to your login credentials and cannot be modified directly."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <LockIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Date of Birth"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    label="Gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    fullWidth
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" color="secondary.main" sx={{ fontWeight: 800, mb: 2 }}>
                    NATIONAL IDENTIFICATION DETAILS (OPTIONAL)
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Aadhaar Card ID Number"
                    fullWidth
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    inputProps={{ maxLength: 14 }}
                    placeholder="e.g. 1234-5678-9012"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon sx={{ color: '#F59E0B' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="PAN Card Number"
                    fullWidth
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    inputProps={{ maxLength: 10 }}
                    placeholder="e.g. ABCDE1234F"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon sx={{ color: '#F43F5E' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            )}

            {/* TAB 1: Contact & Address */}
            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Primary Mobile Phone Number"
                    required
                    fullWidth
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: '#10B981' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Alternate Mobile / Emergency Line"
                    fullWidth
                    value={alternateMobile}
                    onChange={(e) => setAlternateMobile(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: '#38BDF8' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Residential / Corporate Office Address"
                    required
                    fullWidth
                    multiline
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <HomeIcon sx={{ color: '#D4AF37' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="City / District"
                    required
                    fullWidth
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="State / Province"
                    required
                    fullWidth
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="PIN / Postal Code"
                    required
                    fullWidth
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                  />
                </Grid>
              </Grid>
            )}

            {/* TAB 2: Account Security */}
            {activeTab === 2 && (
              <Box>
                <Alert severity="info" icon={<ShieldIcon sx={{ color: '#38BDF8' }} />} sx={{ mb: 3, bgcolor: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38BDF8' }}>
                    AUTHENTICATION SECURITY STATUS
                  </Typography>
                  Your client account is protected by 256-bit encryption. If you wish to update your login password, enter your new password below.
                </Alert>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      fullWidth
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to keep existing password"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <KeyIcon sx={{ color: '#F59E0B' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Confirm New Password"
                      type={showPassword ? 'text' : 'password'}
                      fullWidth
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      error={Boolean(newPassword && confirmPassword && newPassword !== confirmPassword)}
                      helperText={
                        newPassword && confirmPassword && newPassword !== confirmPassword
                          ? 'Passwords do not match'
                          : ''
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <KeyIcon sx={{ color: '#F59E0B' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Bottom Actions Row */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Button
                variant="outlined"
                onClick={fetchProfile}
                disabled={saving}
                sx={{ px: 3, fontWeight: 700 }}
              >
                Discard Changes
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="secondary"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                size="large"
                sx={{ px: 4, fontWeight: 800 }}
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Snackbar Feedback Toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%', fontWeight: 700 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClientProfile;
