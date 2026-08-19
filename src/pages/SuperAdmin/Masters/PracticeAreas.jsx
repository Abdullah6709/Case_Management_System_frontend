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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import DataTable from '../../../components/Common/DataTable.jsx';
import LoadingScreen from '../../../components/Common/LoadingScreen.jsx';

const PracticeAreas = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog Form states
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const fetchAreas = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/masters/practice-areas`);
      setAreas(response.data);
    } catch (err) {
      console.error('Error fetching practice areas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleOpen = (area = null) => {
    if (area) {
      setEditId(area.id);
      setName(area.name);
      setDescription(area.description || '');
    } else {
      setEditId(null);
      setName('');
      setDescription('');
    }
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setError('Practice Area Name is required');
      return;
    }

    try {
      const payload = { name, description };
      if (editId) {
        await axios.put(`${API_BASE_URL}/api/masters/practice-areas/${editId}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/api/masters/practice-areas`, payload);
      }
      fetchAreas();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving practice area');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Practice Area? Advocates using this area will need to be re-assigned.')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/masters/practice-areas/${id}`);
      fetchAreas();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete practice area');
    }
  };

  const columns = [
    { id: 'name', label: 'Practice Area Name' },
    { id: 'description', label: 'Description' },
  ];

  if (loading) return <LoadingScreen message="Loading Practice Areas..." />;

  return (
    <Box sx={{ py: 0.5 }}>
      <DataTable
        title="Practice Areas Master"
        headerAction={
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{ height: 34, whiteSpace: 'nowrap' }}
          >
            Add Practice Area
          </Button>
        }
        columns={columns}
        rows={areas}
        searchPlaceholder="Search by name..."
        searchField="name"
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
          {editId ? 'Edit Practice Area' : 'Create Practice Area'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {error && <Chip label={error} color="error" variant="outlined" sx={{ borderRadius: 1 }} />}
            <TextField
              label="Practice Area Name"
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Civil Litigation, Constitutional Law, Intellectual Property"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide brief details on scope and court jurisdiction..."
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">Save Area</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default PracticeAreas;
