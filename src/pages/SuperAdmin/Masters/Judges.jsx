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
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import DataTable from '../../../components/Common/DataTable.jsx';
import LoadingScreen from '../../../components/Common/LoadingScreen.jsx';

const Judges = () => {
  const [judges, setJudges] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog Form states
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [judgeName, setJudgeName] = useState('');
  const [courtId, setCourtId] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [judgesRes, courtsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/masters/judges`),
        axios.get(`${API_BASE_URL}/api/masters/courts`),
      ]);
      setJudges(judgesRes.data);
      setCourts(courtsRes.data);
    } catch (err) {
      console.error('Error fetching judges/courts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (judge = null) => {
    if (judge) {
      setEditId(judge.id);
      setJudgeName(judge.judgeName);
      setCourtId(judge.courtId || '');
      setStatus(judge.status);
    } else {
      setEditId(null);
      setJudgeName('');
      setCourtId('');
      setStatus('ACTIVE');
    }
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!judgeName || !courtId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const payload = { judgeName, courtId, status };
      if (editId) {
        await axios.put(`${API_BASE_URL}/api/masters/judges/${editId}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/api/masters/judges`, payload);
      }
      fetchData();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving judge');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this judge? All associated cases will remain but judge field will need update.')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/masters/judges/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete judge');
    }
  };

  const columns = [
    { id: 'judgeName', label: 'Judge Name' },
    {
      id: 'court',
      label: 'Assigned Court Room',
      render: (row) => row.court ? `${row.court.courtName} - ${row.court.courtNumber}` : '—',
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => (
        <Chip
          size="small"
          label={row.status}
          color={row.status === 'ACTIVE' ? 'success' : 'default'}
        />
      ),
    },
  ];

  if (loading) return <LoadingScreen message="Loading Judges Master Data..." />;

  return (
    <Box sx={{ py: 0.5 }}>
      {courts.length === 0 && (
        <Typography color="error" sx={{ mb: 1, fontWeight: 500, fontSize: '0.85rem' }}>
          ⚠️ Please configure at least one Court Room before adding Judge listings.
        </Typography>
      )}

      <DataTable
        title="Judge Master Setup"
        headerAction={
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            disabled={courts.length === 0}
            sx={{ height: 34, whiteSpace: 'nowrap' }}
          >
            Add Judge
          </Button>
        }
        columns={columns}
        rows={judges}
        searchPlaceholder="Search judges by name..."
        searchField="judgeName"
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
          {editId ? 'Edit Judge Details' : 'Add New Judge'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {error && <Chip label={error} color="error" variant="outlined" sx={{ borderRadius: 1 }} />}
            <TextField
              label="Judge Full Name"
              required
              fullWidth
              value={judgeName}
              onChange={(e) => setJudgeName(e.target.value)}
              placeholder="e.g. Hon. Justice Dr. S. Muralidhar"
            />

            <FormControl fullWidth required>
              <InputLabel>Associated Court Room</InputLabel>
              <Select
                value={courtId}
                label="Associated Court Room"
                onChange={(e) => setCourtId(e.target.value)}
              >
                {courts.map((court) => (
                  <MenuItem key={court.id} value={court.id}>
                    {court.courtName} ({court.courtNumber})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
            >
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="INACTIVE">INACTIVE</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">Save Judge</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Judges;
