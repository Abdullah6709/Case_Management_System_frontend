import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Chip,
  Grid,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import LoadingScreen from '../../components/Common/LoadingScreen.jsx';

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/firm/settings`);
      setSettings(response.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      await axios.post(`${API_BASE_URL}/api/firm/settings`, { settings });
      setSuccess('System settings updated successfully!');
      fetchSettings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    }
  };

  if (loading) return <LoadingScreen message="Loading System Settings..." />;

  return (
    <Box sx={{ py: 2, maxWidth: 800 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 800 }}>
        System Settings
      </Typography>

      {success && <Chip label={success} color="success" sx={{ mb: 3 }} />}
      {error && <Chip label={error} color="error" variant="outlined" sx={{ mb: 3 }} />}

      <Card>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {settings.map((item) => (
                <Grid item xs={12} key={item.key}>
                  <TextField
                    fullWidth
                    label={item.key.replace(/_/g, ' ').toUpperCase()}
                    value={item.value}
                    onChange={(e) => handleChange(item.key, e.target.value)}
                    helperText={item.description}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              ))}
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                size="large"
              >
                Save Settings
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
