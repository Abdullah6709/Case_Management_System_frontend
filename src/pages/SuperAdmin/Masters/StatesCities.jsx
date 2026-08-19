import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  IconButton,
  Tabs,
  Tab,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import DataTable from '../../../components/Common/DataTable.jsx';
import LoadingScreen from '../../../components/Common/LoadingScreen.jsx';

const StatesCities = () => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // Dialogs
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  // Form states
  const [editStateId, setEditStateId] = useState(null);
  const [stateName, setStateName] = useState('');

  const [editCityId, setEditCityId] = useState(null);
  const [cityName, setCityName] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');

  const [error, setError] = useState('');

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Custom Confirmation Dialog state
  const [confirmDlg, setConfirmDlg] = useState({ open: false, title: '', message: '', onConfirm: null });

  const triggerSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchData = async () => {
    try {
      const [statesRes, citiesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/masters/states'),
        axios.get('http://localhost:5000/api/masters/cities'),
      ]);
      setStates(statesRes.data);
      setCities(citiesRes.data);
    } catch (err) {
      console.error('Error fetching state/city data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStateOpen = (state = null) => {
    if (state) {
      setEditStateId(state.id);
      setStateName(state.name);
    } else {
      setEditStateId(null);
      setStateName('');
    }
    setError('');
    setStateOpen(true);
  };

  const handleCityOpen = (city = null) => {
    if (city) {
      setEditCityId(city.id);
      setCityName(city.name);
      setSelectedStateId(city.stateId || '');
    } else {
      setEditCityId(null);
      setCityName('');
      setSelectedStateId(states[0]?.id || '');
    }
    setError('');
    setCityOpen(true);
  };

  const handleStateSubmit = (e) => {
    e.preventDefault();
    if (!stateName) return;

    const executeSubmit = async () => {
      try {
        if (editStateId) {
          await axios.put(`http://localhost:5000/api/masters/states/${editStateId}`, { name: stateName });
          triggerSnackbar('State updated successfully', 'success');
        } else {
          await axios.post('http://localhost:5000/api/masters/states', { name: stateName });
          triggerSnackbar('State created successfully', 'success');
        }
        fetchData();
        setStateOpen(false);
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Error saving state';
        setError(errMsg);
        triggerSnackbar(errMsg, 'error');
      }
    };

    if (editStateId) {
      setConfirmDlg({
        open: true,
        title: 'Confirm Update',
        message: 'Are you sure you want to save modifications to this state?',
        onConfirm: executeSubmit,
      });
    } else {
      executeSubmit();
    }
  };

  const handleCitySubmit = (e) => {
    e.preventDefault();
    if (!cityName || !selectedStateId) return;

    const executeSubmit = async () => {
      try {
        const payload = { name: cityName, stateId: selectedStateId };
        if (editCityId) {
          await axios.put(`http://localhost:5000/api/masters/cities/${editCityId}`, payload);
          triggerSnackbar('City updated successfully', 'success');
        } else {
          await axios.post('http://localhost:5000/api/masters/cities', payload);
          triggerSnackbar('City created successfully', 'success');
        }
        fetchData();
        setCityOpen(false);
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Error saving city';
        setError(errMsg);
        triggerSnackbar(errMsg, 'error');
      }
    };

    if (editCityId) {
      setConfirmDlg({
        open: true,
        title: 'Confirm Update',
        message: 'Are you sure you want to save modifications to this city?',
        onConfirm: executeSubmit,
      });
    } else {
      executeSubmit();
    }
  };

  const handleStateDelete = (id) => {
    setConfirmDlg({
      open: true,
      title: 'Confirm Delete State',
      message: 'Deleting this state will permanently delete all associated cities. Do you want to proceed?',
      onConfirm: async () => {
        try {
          await axios.delete(`http://localhost:5000/api/masters/states/${id}`);
          triggerSnackbar('State deleted successfully', 'success');
          fetchData();
        } catch (err) {
          const errMsg = err.response?.data?.message || 'Failed to delete state';
          triggerSnackbar(errMsg, 'error');
        }
      },
    });
  };

  const handleCityDelete = (id) => {
    setConfirmDlg({
      open: true,
      title: 'Confirm Delete City',
      message: 'Are you sure you want to permanently delete this city?',
      onConfirm: async () => {
        try {
          await axios.delete(`http://localhost:5000/api/masters/cities/${id}`);
          triggerSnackbar('City deleted successfully', 'success');
          fetchData();
        } catch (err) {
          const errMsg = err.response?.data?.message || 'Failed to delete city';
          triggerSnackbar(errMsg, 'error');
        }
      },
    });
  };

  if (loading) return <LoadingScreen message="Loading Geography Master..." />;

  return (
    <Box sx={{ py: 0.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          State & City Master
        </Typography>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5 } }}>
          <Tab label="States List" />
          <Tab label="Cities List" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <DataTable
          headerAction={
            <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => handleStateOpen()} sx={{ height: 34, whiteSpace: 'nowrap' }}>
              Add State
            </Button>
          }
          columns={[{ id: 'name', label: 'State Name' }]}
          rows={states}
          searchPlaceholder="Search states..."
          searchField="name"
          actions={(row) => (
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <IconButton size="small" onClick={() => handleStateOpen(row)} color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleStateDelete(row.id)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        />
      )}

      {tabValue === 1 && (
        <DataTable
          headerAction={
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleCityOpen()} sx={{ height: 34, whiteSpace: 'nowrap' }}>
              Add City
            </Button>
          }
          columns={[
            { id: 'name', label: 'City Name' },
            { id: 'state', label: 'State', render: (row) => row.state?.name || '—' },
          ]}
          rows={cities}
          searchPlaceholder="Search cities..."
          searchField="name"
          actions={(row) => (
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <IconButton size="small" onClick={() => handleCityOpen(row)} color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleCityDelete(row.id)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        />
      )}

      {/* State Dialog */}
      <Dialog open={stateOpen} onClose={() => setStateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editStateId ? 'Modify State' : 'Create State'}
        </DialogTitle>
        <form onSubmit={handleStateSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            {error && <Typography color="error" variant="body2" sx={{ mb: 2 }}>{error}</Typography>}
            <TextField
              label="State Name"
              required
              fullWidth
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              placeholder="e.g. Uttar Pradesh, New Delhi"
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setStateOpen(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">Save State</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* City Dialog */}
      <Dialog open={cityOpen} onClose={() => setCityOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editCityId ? 'Modify City' : 'Create City'}
        </DialogTitle>
        <form onSubmit={handleCitySubmit}>
          <DialogContent sx={{ pt: 1 }}>
            {error && <Typography color="error" variant="body2" sx={{ mb: 2 }}>{error}</Typography>}
            <TextField
              select
              label="State"
              required
              fullWidth
              sx={{ mb: 2 }}
              value={selectedStateId}
              onChange={(e) => setSelectedStateId(e.target.value)}
            >
              {states.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="City Name"
              required
              fullWidth
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="e.g. Noida, Dwarka"
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setCityOpen(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">Save City</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Custom Confirmation Dialog */}
      <Dialog open={confirmDlg.open} onClose={() => setConfirmDlg({ ...confirmDlg, open: false })}>
        <DialogTitle sx={{ fontWeight: 700 }}>{confirmDlg.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDlg.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setConfirmDlg({ ...confirmDlg, open: false })} color="inherit">Cancel</Button>
          <Button onClick={() => { confirmDlg.onConfirm(); setConfirmDlg({ ...confirmDlg, open: false }); }} variant="contained" color="primary">Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Alerts */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StatesCities;

