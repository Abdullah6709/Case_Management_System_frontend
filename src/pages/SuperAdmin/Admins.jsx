import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
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

import DataTable from '../../components/Common/DataTable.jsx';
import LoadingScreen from '../../components/Common/LoadingScreen.jsx';

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog Form states
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('CLIENT_ADMIN');
  const [lawFirmId, setLawFirmId] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [adminsRes, firmsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/superadmin/admins`),
        axios.get(`${API_BASE_URL}/api/superadmin/firms`),
      ]);
      setAdmins(adminsRes.data);
      setFirms(firmsRes.data.filter(f => f.status === 'ACTIVE'));
    } catch (err) {
      console.error('Error fetching admins/firms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (admin = null) => {
    if (admin) {
      setEditId(admin.id);
      setEmail(admin.email);
      setPassword('');
      setRoleName(admin.role?.name || 'CLIENT_ADMIN');
      setLawFirmId(admin.lawFirmId || '');
      setStatus(admin.status);
    } else {
      setEditId(null);
      setEmail('');
      setPassword('');
      setRoleName('CLIENT_ADMIN');
      setLawFirmId('');
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
      setError('Please fill in email and password fields');
      return;
    }

    if (roleName === 'CLIENT_ADMIN' && !lawFirmId) {
      setError('Please assign a workspace tenant for Client Admins');
      return;
    }

    try {
      const payload = {
        email,
        lawFirmId: roleName === 'CLIENT_ADMIN' ? lawFirmId : null,
        roleName,
        status,
      };
      if (password) payload.password = password;

      if (editId) {
        await axios.put(`${API_BASE_URL}/api/superadmin/admins/${editId}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/api/superadmin/admins`, payload);
      }
      fetchData();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving user account');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this administrator account?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/superadmin/admins/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user account');
    }
  };

  const columns = [
    { id: 'email', label: 'User Email' },
    {
      id: 'role',
      label: 'Admin Role',
      render: (row) => (
        <Chip
          size="small"
          label={row.role?.name === 'SKIT_ADMIN_USER' ? 'Skit Admin' : 'Client Admin'}
          color={row.role?.name === 'SKIT_ADMIN_USER' ? 'secondary' : 'primary'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'lawFirm',
      label: 'Tenant Workspace',
      render: (row) => row.lawFirm?.name || 'Platform Level (None)',
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

  if (loading) return <LoadingScreen message="Loading Platform Administrators..." />;

  return (
    <Box sx={{ py: 0.5 }}>
      <DataTable
        title="Manage System Admins"
        headerAction={
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{ height: 34, whiteSpace: 'nowrap' }}
          >
            Add System Admin
          </Button>
        }
        columns={columns}
        rows={admins}
        searchPlaceholder="Search admins by email..."
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editId ? 'Edit Admin Settings' : 'Create Admin Account'}
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
            />
            
            <TextField
              label={editId ? "New Password (leave blank to keep current)" : "Password"}
              type="password"
              required={!editId}
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <TextField
              select
              label="Admin Role Scope"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              fullWidth
              required
            >
              <MenuItem value="CLIENT_ADMIN">Client Admin (Tenant Scope)</MenuItem>
              <MenuItem value="SKIT_ADMIN_USER">Skit Admin User (Platform Scope)</MenuItem>
            </TextField>

            {roleName === 'CLIENT_ADMIN' && (
              <FormControl fullWidth required>
                <InputLabel>Workspace Tenant</InputLabel>
                <Select
                  value={lawFirmId}
                  label="Workspace Tenant"
                  onChange={(e) => setLawFirmId(e.target.value)}
                >
                  {firms.map((firm) => (
                    <MenuItem key={firm.id} value={firm.id}>
                      {firm.name} ({firm.type})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

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
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">Save Account</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Admins;
