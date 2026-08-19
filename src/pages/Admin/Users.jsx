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
  Chip,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import DataTable from '../../components/Common/DataTable.jsx';
import LoadingScreen from '../../components/Common/LoadingScreen.jsx';

const TenantUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/firm/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching tenant users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpen = (user = null) => {
    if (user) {
      setEditId(user.id);
      setEmail(user.email);
      setPassword('');
      setStatus(user.status);
    } else {
      setEditId(null);
      setEmail('');
      setPassword('');
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
    if (!email || (!editId && !password)) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/firm/users/${editId}`, {
          email,
          password: password || undefined,
          status,
        });
      } else {
        await axios.post('http://localhost:5000/api/firm/users', {
          email,
          password,
          status,
        });
      }
      fetchUsers();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving user account');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff user account? they will lose system login access.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/firm/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user account');
    }
  };

  const columns = [
    { id: 'email', label: 'Email Address' },
    {
      id: 'role',
      label: 'System Role',
      render: (row) => row.role?.name || '—',
    },
    {
      id: 'status',
      label: 'Account Status',
      render: (row) => (
        <Chip
          size="small"
          label={row.status}
          color={row.status === 'ACTIVE' ? 'success' : 'default'}
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'Created Date',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  if (loading) return <LoadingScreen message="Unlocking Tenant Staff registry..." />;

  return (
    <Box sx={{ py: 0.5 }}>
      <DataTable
        title="Tenants"
        headerAction={
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{ height: 34, whiteSpace: 'nowrap' }}
          >
            Add Tenants
          </Button>
        }
        columns={columns}
        rows={users}
        searchPlaceholder="Search staff by email..."
        searchField="email"
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

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editId ? 'Edit Staff Credentials' : 'Create Staff Member'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {error && <Chip label={error} color="error" variant="outlined" sx={{ borderRadius: 1 }} />}

            <TextField
              label="Email Address"
              type="email"
              required
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!editId}
            />

            <TextField
              label={editId ? 'New Password (Leave empty to keep current)' : 'Password'}
              type="password"
              required={!editId}
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {editId && (
              <TextField
                select
                label="Account Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                fullWidth
              >
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
              </TextField>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">Save Account</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TenantUsers;
