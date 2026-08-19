import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
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
  Chip,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import DataTable from '../../../components/Common/DataTable.jsx';
import LoadingScreen from '../../../components/Common/LoadingScreen.jsx';

const Courts = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog Form states
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [courtName, setCourtName] = useState('');
  const [courtNumber, setCourtNumber] = useState('');
  const [courtType, setCourtType] = useState('District Court');
  const [bench, setBench] = useState('Single Bench');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');

  const fetchCourts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/masters/courts`);
      setCourts(response.data);
    } catch (err) {
      console.error('Error fetching courts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  const handleOpen = (court = null) => {
    if (court) {
      setEditId(court.id);
      setCourtName(court.courtName);
      setCourtNumber(court.courtNumber);
      setCourtType(court.courtType);
      setBench(court.bench);
      setState(court.state);
      setCity(court.city);
    } else {
      setEditId(null);
      setCourtName('');
      setCourtNumber('');
      setCourtType('District Court');
      setBench('Single Bench');
      setState('');
      setCity('');
    }
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courtName || !courtNumber || !courtType || !bench || !state || !city) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const payload = { courtName, courtNumber, courtType, bench, state, city };
      if (editId) {
        await axios.put(`${API_BASE_URL}/api/masters/courts/${editId}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/api/masters/courts`, payload);
      }
      fetchCourts();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving court');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this court room? All linked judges and cases will be affected.')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/masters/courts/${id}`);
      fetchCourts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete court');
    }
  };

  const columns = [
    { id: 'courtName', label: 'Court Name' },
    { id: 'courtNumber', label: 'Room/No' },
    { id: 'courtType', label: 'Type' },
    { id: 'bench', label: 'Bench' },
    { id: 'city', label: 'City' },
    { id: 'state', label: 'State' },
  ];

  if (loading) return <LoadingScreen message="Loading Courts Master Data..." />;

  return (
    <Box sx={{ py: 0.5 }}>
      <DataTable
        title="Court Master Setup"
        headerAction={
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{ height: 34, whiteSpace: 'nowrap' }}
          >
            Add Court Room
          </Button>
        }
        columns={columns}
        rows={courts}
        searchPlaceholder="Search court by name..."
        searchField="courtName"
        actions={(row) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <IconButton size="small" onClick={() => handleOpen(row)} color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => handleDelete(row.id)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editId ? 'Edit Court Room' : 'Add New Court'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {error && <Chip label={error} color="error" variant="outlined" sx={{ borderRadius: 1 }} />}
            <TextField
              label="Court Name"
              required
              fullWidth
              value={courtName}
              onChange={(e) => setCourtName(e.target.value)}
              placeholder="e.g. High Court of Punjab & Haryana"
            />
            <TextField
              label="Court Room Number"
              required
              fullWidth
              value={courtNumber}
              onChange={(e) => setCourtNumber(e.target.value)}
              placeholder="e.g. Court Room 12"
            />
            <TextField
              select
              label="Court Type"
              value={courtType}
              onChange={(e) => setCourtType(e.target.value)}
              fullWidth
              required
            >
              <MenuItem value="District Court">District Court</MenuItem>
              <MenuItem value="Sessions Court">Sessions Court</MenuItem>
              <MenuItem value="High Court">High Court</MenuItem>
              <MenuItem value="Supreme Court">Supreme Court</MenuItem>
              <MenuItem value="Tribunal">Tribunal</MenuItem>
            </TextField>
            <TextField
              select
              label="Bench Jurisdiction"
              value={bench}
              onChange={(e) => setBench(e.target.value)}
              fullWidth
              required
            >
              <MenuItem value="Single Bench">Single Bench</MenuItem>
              <MenuItem value="Division Bench">Division Bench</MenuItem>
              <MenuItem value="Full Bench">Full Bench</MenuItem>
              <MenuItem value="Constitutional Bench">Constitutional Bench</MenuItem>
            </TextField>
            <TextField
              label="City"
              required
              fullWidth
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <TextField
              label="State"
              required
              fullWidth
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">Save Court</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Courts;
