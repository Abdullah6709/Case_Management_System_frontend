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
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import DataTable from '../../../components/Common/DataTable.jsx';
import LoadingScreen from '../../../components/Common/LoadingScreen.jsx';

const Matters = () => {
  const [matters, setMatters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog Form states
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Custom Confirmation Dialog state
  const [confirmDlg, setConfirmDlg] = useState({ open: false, title: '', message: '', onConfirm: null });

  const triggerSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchMatters = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/masters/matters');
      setMatters(response.data);
    } catch (err) {
      console.error('Error fetching matters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatters();
  }, []);

  const handleOpen = (matter = null) => {
    if (matter) {
      setEditId(matter.id);
      setName(matter.name);
      setDescription(matter.description || '');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) {
      setError('Matter name is required');
      return;
    }

    const executeSubmit = async () => {
      try {
        const payload = { name, description };
        if (editId) {
          await axios.put(`http://localhost:5000/api/masters/matters/${editId}`, payload);
          triggerSnackbar('Matter type updated successfully', 'success');
        } else {
          await axios.post('http://localhost:5000/api/masters/matters', payload);
          triggerSnackbar('Matter type created successfully', 'success');
        }
        fetchMatters();
        handleClose();
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Error occurred while saving matter';
        setError(errMsg);
        triggerSnackbar(errMsg, 'error');
      }
    };

    if (editId) {
      setConfirmDlg({
        open: true,
        title: 'Confirm Update',
        message: 'Are you sure you want to save modifications to this matter type?',
        onConfirm: executeSubmit,
      });
    } else {
      executeSubmit();
    }
  };

  const handleDelete = (id) => {
    setConfirmDlg({
      open: true,
      title: 'Confirm Delete',
      message: 'Are you sure you want to permanently delete this matter type?',
      onConfirm: async () => {
        try {
          await axios.delete(`http://localhost:5000/api/masters/matters/${id}`);
          triggerSnackbar('Matter type deleted successfully', 'success');
          fetchMatters();
        } catch (err) {
          const errMsg = err.response?.data?.message || 'Failed to delete matter';
          triggerSnackbar(errMsg, 'error');
        }
      },
    });
  };

  const columns = [
    { id: 'name', label: 'Matter Name' },
    { id: 'description', label: 'Description' },
  ];

  if (loading) return <LoadingScreen message="Loading Matters Registry..." />;

  return (
    <Box sx={{ py: 0.5 }}>
      <DataTable
        title="Matter Master Management"
        headerAction={
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{ height: 34, whiteSpace: 'nowrap' }}
          >
            Add Matter
          </Button>
        }
        columns={columns}
        rows={matters}
        searchPlaceholder="Search matters..."
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
          {editId ? 'Edit Matter Type' : 'Add New Matter Type'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 2, p: 1, border: '1px solid', borderRadius: 1 }}>
                {error}
              </Typography>
            )}
            <TextField
              label="Matter Name"
              required
              fullWidth
              sx={{ mb: 2 }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marriage Matters, Civil Matters"
            />
            <TextField
              label="Description / Scope"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context or description..."
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">Save Matter</Button>
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

export default Matters;
