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
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import DataTable from '../../components/Common/DataTable.jsx';
import LoadingScreen from '../../components/Common/LoadingScreen.jsx';

const Hearings = () => {
  const [hearings, setHearings] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [tillDate, setTillDate] = useState('');

  // Dialog Form states
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [caseId, setCaseId] = useState('');
  const [hearingDate, setHearingDate] = useState('');
  const [hearingTime, setHearingTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [result, setResult] = useState('');
  const [nextHearingDate, setNextHearingDate] = useState('');
  const [status, setStatus] = useState('SCHEDULED');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      let url = 'http://localhost:5000/api/firm/hearings?';
      if (fromDate) url += `fromDate=${fromDate}&`;
      if (tillDate) url += `tillDate=${tillDate}&`;

      const [hearingsRes, casesRes] = await Promise.all([
        axios.get(url),
        axios.get('http://localhost:5000/api/firm/cases?limit=200'),
      ]);

      setHearings(hearingsRes.data);
      setCases(casesRes.data.cases);
    } catch (err) {
      console.error('Error fetching hearings/cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fromDate, tillDate]);

  const handleOpen = (hearing = null) => {
    if (hearing) {
      setEditId(hearing.id);
      setCaseId(hearing.caseId);
      setHearingDate(hearing.hearingDate.split('T')[0]);
      setHearingTime(hearing.hearingTime);
      setPurpose(hearing.purpose);
      setResult(hearing.result || '');
      setNextHearingDate(hearing.nextHearingDate ? hearing.nextHearingDate.split('T')[0] : '');
      setStatus(hearing.status);
    } else {
      setEditId(null);
      setCaseId('');
      setHearingDate('');
      setHearingTime('');
      setPurpose('');
      setResult('');
      setNextHearingDate('');
      setStatus('SCHEDULED');
    }
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caseId || !hearingDate || !hearingTime || !purpose) {
      setError('Please fill in all mandatory fields');
      return;
    }

    try {
      const payload = {
        caseId,
        hearingDate,
        hearingTime,
        purpose,
        result: result || null,
        nextHearingDate: nextHearingDate || null,
        status,
      };

      if (editId) {
        await axios.put(`http://localhost:5000/api/firm/hearings/${editId}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/firm/hearings', payload);
      }
      fetchData();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving hearing schedule');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hearing log?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/firm/hearings/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete hearing');
    }
  };

  // Format party name
  const formatPartyName = (c) => {
    if (!c) return '—';
    const ourParty = (!c.ourPartyName || /^[0-9a-fA-F-]{24,36}$/.test(c.ourPartyName))
      ? (c.client?.fullName || c.client?.companyOrAdvocate || '')
      : c.ourPartyName;
    const oppParty = c.oppPartyName || c.oppositePartyName || '';

    if (ourParty && oppParty) {
      return `${ourParty} vs. ${oppParty}`;
    }
    if (ourParty) return ourParty;
    if (oppParty) return `vs. ${oppParty}`;
    return c.caseTitle || '—';
  };

  const columns = [
    {
      id: 'hearingDate',
      label: 'Hearing Date & Time',
      render: (row) => (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: 'text.primary' }}>
            {new Date(row.hearingDate).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {row.hearingTime || '—'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'caseNumber',
      label: 'Case Number',
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            fontSize: '0.82rem',
            letterSpacing: '0.02em',
          }}
        >
          {row.case?.caseNumber || '—'}
        </Typography>
      ),
    },
    {
      id: 'partyName',
      label: 'Party Name',
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.82rem',
            color: 'text.primary',
            maxWidth: 240,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {formatPartyName(row.case)}
        </Typography>
      ),
    },
    {
      id: 'purpose',
      label: 'Hearing Purpose',
      render: (row) => (
        <Typography
          sx={{
            fontSize: '0.82rem',
            color: 'text.primary',
            maxWidth: 220,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: 600,
          }}
        >
          {row.purpose || '—'}
        </Typography>
      ),
    },
    {
      id: 'result',
      label: 'Hearing Result',
      render: (row) => (
        <Typography
          sx={{
            fontSize: '0.82rem',
            color: row.result ? 'success.main' : 'text.secondary',
            fontWeight: row.result ? 700 : 500,
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {row.result || 'Pending'}
        </Typography>
      ),
    },
    {
      id: 'nextHearingDate',
      label: 'Next Hearing',
      render: (row) => (
        <Typography sx={{ fontSize: '0.82rem', color: row.nextHearingDate ? 'info.main' : 'text.secondary', fontWeight: 600 }}>
          {row.nextHearingDate ? new Date(row.nextHearingDate).toLocaleDateString() : '—'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => (
        <Chip
          size="small"
          label={row.status}
          color={row.status === 'SCHEDULED' ? 'primary' : row.status === 'COMPLETED' ? 'success' : 'default'}
          sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }}
        />
      ),
    },
  ];

  if (loading) return <LoadingScreen message="Loading Hearings Ledger..." />;

  return (
    <Box sx={{ py: 0.5 }}>
      <DataTable
        title="Manage Hearings"
        headerAction={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true, style: { fontSize: '0.8rem' } }}
              sx={{
                width: 145,
                '& .MuiInputBase-root': { height: 34, fontSize: '0.82rem' },
                '& input[type="date"]::-webkit-datetime-edit-text': { color: fromDate ? 'inherit' : 'transparent' },
                '& input[type="date"]::-webkit-datetime-edit-month-field': { color: fromDate ? 'inherit' : 'transparent' },
                '& input[type="date"]::-webkit-datetime-edit-day-field': { color: fromDate ? 'inherit' : 'transparent' },
                '& input[type="date"]::-webkit-datetime-edit-year-field': { color: fromDate ? 'inherit' : 'transparent' },
                '& input[type="date"]:focus::-webkit-datetime-edit-text': { color: 'inherit' },
                '& input[type="date"]:focus::-webkit-datetime-edit-month-field': { color: 'inherit' },
                '& input[type="date"]:focus::-webkit-datetime-edit-day-field': { color: 'inherit' },
                '& input[type="date"]:focus::-webkit-datetime-edit-year-field': { color: 'inherit' },
                '& input[type="date"]::-webkit-calendar-picker-indicator': { opacity: 0.85, cursor: 'pointer' },
              }}
            />

            <TextField
              label="Till Date"
              type="date"
              value={tillDate}
              onChange={(e) => setTillDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true, style: { fontSize: '0.8rem' } }}
              sx={{
                width: 145,
                '& .MuiInputBase-root': { height: 34, fontSize: '0.82rem' },
                '& input[type="date"]::-webkit-datetime-edit-text': { color: tillDate ? 'inherit' : 'transparent' },
                '& input[type="date"]::-webkit-datetime-edit-month-field': { color: tillDate ? 'inherit' : 'transparent' },
                '& input[type="date"]::-webkit-datetime-edit-day-field': { color: tillDate ? 'inherit' : 'transparent' },
                '& input[type="date"]::-webkit-datetime-edit-year-field': { color: tillDate ? 'inherit' : 'transparent' },
                '& input[type="date"]:focus::-webkit-datetime-edit-text': { color: 'inherit' },
                '& input[type="date"]:focus::-webkit-datetime-edit-month-field': { color: 'inherit' },
                '& input[type="date"]:focus::-webkit-datetime-edit-day-field': { color: 'inherit' },
                '& input[type="date"]:focus::-webkit-datetime-edit-year-field': { color: 'inherit' },
                '& input[type="date"]::-webkit-calendar-picker-indicator': { opacity: 0.85, cursor: 'pointer' },
              }}
            />

            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
              disabled={cases.length === 0}
              sx={{ height: 34, whiteSpace: 'nowrap' }}
            >
              Schedule Hearing
            </Button>
          </Box>
        }
        columns={columns}
        rows={hearings}
        searchPlaceholder="Search purpose..."
        searchField="purpose"
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
          {editId ? 'Edit Hearing Schedule' : 'Schedule New Hearing'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            {error && <Chip label={error} color="error" variant="outlined" sx={{ borderRadius: 1, mb: 2 }} />}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Select Case File"
                  required
                  fullWidth
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  disabled={!!editId}
                >
                  {cases.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.caseTitle} (No: {c.caseNumber})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Hearing Date"
                  type="date"
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={hearingDate}
                  onChange={(e) => setHearingDate(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Hearing Time"
                  type="time"
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={hearingTime}
                  onChange={(e) => setHearingTime(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Hearing Purpose"
                  required
                  fullWidth
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Evidence Recording, Arguments, Framing of Charges"
                />
              </Grid>

              {editId && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      select
                      label="Status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      fullWidth
                    >
                      <MenuItem value="SCHEDULED">SCHEDULED (Upcoming)</MenuItem>
                      <MenuItem value="COMPLETED">COMPLETED (Past)</MenuItem>
                      <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Hearing Result / Order Details"
                      fullWidth
                      multiline
                      rows={3}
                      value={result}
                      onChange={(e) => setResult(e.target.value)}
                      placeholder="Add brief ordering notes or session developments..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Next Hearing Date (If scheduled)"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={nextHearingDate}
                      onChange={(e) => setNextHearingDate(e.target.value)}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">Save Hearing</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Hearings;
