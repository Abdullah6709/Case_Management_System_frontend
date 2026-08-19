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
  Tooltip,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

import DataTable from '../../components/Common/DataTable.jsx';
import LoadingScreen from '../../components/Common/LoadingScreen.jsx';

const LawFirms = () => {
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog Form states
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState('LAW_FIRM');
  const [status, setStatus] = useState('ACTIVE');
  const [error, setError] = useState('');

  // View Details Dialog state
  const [viewOpen, setViewOpen] = useState(false);
  const [viewFirm, setViewFirm] = useState(null);

  const fetchFirms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/superadmin/firms');
      setFirms(response.data);
    } catch (err) {
      console.error('Error fetching client directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirms();
  }, []);

  const handleOpen = (firm = null) => {
    if (firm) {
      setEditId(firm.id);
      setName(firm.name);
      setEmail(firm.email);
      setMobile(firm.mobile);
      setAddress(firm.address);
      setType(firm.type || 'LAW_FIRM');
      setStatus(firm.status);
    } else {
      setEditId(null);
      setName('');
      setEmail('');
      setMobile('');
      setAddress('');
      setType('LAW_FIRM');
      setStatus('ACTIVE');
    }
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleViewOpen = (firm) => {
    setViewFirm(firm);
    setViewOpen(true);
  };

  const handleViewClose = () => {
    setViewOpen(false);
    setViewFirm(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !mobile || !address) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const payload = { name, email, mobile, address, type, status };
      if (editId) {
        await axios.put(`http://localhost:5000/api/superadmin/firms/${editId}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/superadmin/firms', payload);
      }
      fetchFirms();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving client workspace');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Client workspace? This will remove all associated users, clients, advocates, and cases!')) return;
    try {
      await axios.delete(`http://localhost:5000/api/superadmin/firms/${id}`);
      fetchFirms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete client workspace');
    }
  };

  const columns = [
    { id: 'name', label: 'Client / Firm Name' },
    { id: 'email', label: 'Email' },
    { id: 'mobile', label: 'Mobile' },
    {
      id: 'type',
      label: 'Client Type',
      render: (row) => (
        <Chip
          size="small"
          label={row.type === 'LAW_FIRM' ? 'Law Firm' : 'Independent Practice'}
          color={row.type === 'LAW_FIRM' ? 'primary' : 'secondary'}
          variant="outlined"
        />
      ),
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

  if (loading) return <LoadingScreen message="Loading Client Directory..." />;

  return (
    <Box sx={{ py: 0.5 }}>
      <DataTable
        title="Client Directory"
        headerAction={
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{ height: 34, whiteSpace: 'nowrap' }}
          >
            Add Client
          </Button>
        }
        columns={columns}
        rows={firms}
        searchPlaceholder="Search clients by name..."
        searchField="name"
        actions={(row) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Tooltip title="View Details">
              <IconButton size="small" onClick={() => handleViewOpen(row)} color="info">
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Details">
              <IconButton size="small" onClick={() => handleOpen(row)} color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Workspace">
              <IconButton size="small" onClick={() => handleDelete(row.id)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      />

      {/* Edit / Add Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editId ? 'Edit Client Details' : 'Register New Client'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {error && <Chip label={error} color="error" variant="outlined" sx={{ borderRadius: 1 }} />}
            <TextField
              label="Client Name"
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Email Address"
              type="email"
              required
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Mobile Number"
              required
              fullWidth
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
            <TextField
              select
              label="Practice Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              fullWidth
            >
              <MenuItem value="LAW_FIRM">Law Firm Practice</MenuItem>
              <MenuItem value="INDEPENDENT_ADVOCATE">Independent Advocate Practice</MenuItem>
            </TextField>
            <TextField
              label="Office Address"
              required
              fullWidth
              multiline
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
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
            <Button type="submit" variant="contained">Save Client</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewOpen} onClose={handleViewClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Client Workspace Details
          {viewFirm && (
            <Chip
              size="small"
              label={viewFirm.status}
              color={viewFirm.status === 'ACTIVE' ? 'success' : 'default'}
            />
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2, pb: 3 }}>
          {viewFirm && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Client Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {viewFirm.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Practice Type
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    size="small"
                    label={viewFirm.type === 'LAW_FIRM' ? 'Law Firm Practice' : 'Independent Advocate Practice'}
                    color={viewFirm.type === 'LAW_FIRM' ? 'primary' : 'secondary'}
                    variant="outlined"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Email Address
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {viewFirm.email}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Mobile Number
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {viewFirm.mobile}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Office Address
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                  {viewFirm.address}
                </Typography>
              </Grid>
              {viewFirm.createdAt && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    Created Date
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {new Date(viewFirm.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleViewClose} variant="contained" color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LawFirms;

