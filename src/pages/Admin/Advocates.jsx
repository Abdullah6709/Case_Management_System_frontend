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
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import DataTable from '../../components/Common/DataTable.jsx';
import LoadingScreen from '../../components/Common/LoadingScreen.jsx';

const Advocates = () => {
  const [advocates, setAdvocates] = useState([]);
  const [practiceAreas, setPracticeAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog Form states
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [fullName, setFullName] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [practiceAreaId, setPracticeAreaId] = useState('');
  const [experience, setExperience] = useState('');
  const [qualification, setQualification] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [advRes, paRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/firm/advocates`),
        axios.get(`${API_BASE_URL}/api/masters/practice-areas`),
      ]);
      setAdvocates(advRes.data);
      setPracticeAreas(paRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (adv = null) => {
    if (adv) {
      setEditId(adv.id);
      setFullName(adv.fullName);
      setEnrollmentNumber(adv.enrollmentNumber);
      setMobile(adv.mobile);
      setEmail(adv.email);
      setPracticeAreaId(adv.practiceAreaId || '');
      setExperience(adv.experience);
      setQualification(adv.qualification);
      setAddress(adv.address);
      setStatus(adv.status);
    } else {
      setEditId(null);
      setFullName('');
      setEnrollmentNumber('');
      setMobile('');
      setEmail('');
      setPracticeAreaId('');
      setExperience('');
      setQualification('');
      setAddress('');
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
    if (!fullName || !enrollmentNumber || !mobile || !email || !practiceAreaId || !experience || !qualification || !address) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const payload = {
        fullName, enrollmentNumber, mobile, email,
        practiceAreaId, experience, qualification, address, status,
      };

      if (editId) {
        await axios.put(`${API_BASE_URL}/api/firm/advocates/${editId}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/api/firm/advocates`, payload);
      }
      fetchData();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving advocate');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this advocate record?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/firm/advocates/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete advocate');
    }
  };

  const columns = [
    { id: 'fullName', label: 'Advocate Name' },
    { id: 'enrollmentNumber', label: 'Enrollment No' },
    { id: 'mobile', label: 'Mobile' },
    { id: 'email', label: 'Email' },
    {
      id: 'practiceArea',
      label: 'Practice Area',
      render: (row) => row.practiceArea?.name || '—',
    },
    { id: 'experience', label: 'Exp (Yrs)' },
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

  if (loading) return <LoadingScreen message="Loading Advocates Directory..." />;

  return (
    <Box sx={{ py: 0.5 }}>
      {practiceAreas.length === 0 && (
        <Typography color="error" sx={{ mb: 1, fontWeight: 500, fontSize: '0.85rem' }}>
          ⚠️ Please configure at least one Practice Area Master before creating Advocate accounts.
        </Typography>
      )}

      <DataTable
        title="Manage Advocates"
        headerAction={
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            disabled={practiceAreas.length === 0}
            sx={{ height: 34, whiteSpace: 'nowrap' }}
          >
            Add Advocate
          </Button>
        }
        columns={columns}
        rows={advocates}
        searchPlaceholder="Search advocates by name..."
        searchField="fullName"
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

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editId ? 'Modify Advocate Details' : 'Add New Advocate'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            {error && <Chip label={error} color="error" variant="outlined" sx={{ borderRadius: 1, mb: 2.5 }} />}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name"
                  required
                  fullWidth
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Enrollment Number (Bar Council)"
                  required
                  fullWidth
                  value={enrollmentNumber}
                  onChange={(e) => setEnrollmentNumber(e.target.value)}
                  placeholder="e.g. D/1054/2012"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Mobile Number"
                  required
                  fullWidth
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Address"
                  type="email"
                  required
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Practice Area"
                  value={practiceAreaId}
                  onChange={(e) => setPracticeAreaId(e.target.value)}
                  fullWidth
                  required
                >
                  {practiceAreas.map((pa) => (
                    <MenuItem key={pa.id} value={pa.id}>
                      {pa.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Experience (in Years)"
                  type="number"
                  required
                  fullWidth
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Qualifications"
                  required
                  fullWidth
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. B.A. LL.B (Hons.), Harvard Law School"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Chamber/Office Address"
                  required
                  fullWidth
                  multiline
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
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
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">Save Advocate</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Advocates;
