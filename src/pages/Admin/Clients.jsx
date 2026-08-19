import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
  Card,
  CardContent,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import RefreshIcon from '@mui/icons-material/Refresh';
import GavelIcon from '@mui/icons-material/Gavel';

import DataTable from '../../components/Common/DataTable.jsx';
import LoadingScreen from '../../components/Common/LoadingScreen.jsx';

const Clients = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isAdminOrSuperAdmin = user && (user.role === 'CLIENT_ADMIN' || user.role === 'SKIT_SUPER_ADMIN' || user.role === 'SKIT_ADMIN_USER');

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [tabVal, setTabVal] = useState(0);
  const [detailedClient, setDetailedClient] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [casesOpen, setCasesOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientCases, setClientCases] = useState([]);

  // Nested Case Dialogs
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [activeCase, setActiveCase] = useState(null);
  const [newUpdateOpen, setNewUpdateOpen] = useState(false);

  // Quick Update Form State
  const [hearingDate, setHearingDate] = useState('');
  const [hearingTime, setHearingTime] = useState('');
  const [hearingPurpose, setHearingPurpose] = useState('');
  const [caseStatus, setCaseStatus] = useState('OPEN');
  const [updateError, setUpdateError] = useState('');

  // Search/Filters states
  const [searchName, setSearchName] = useState('');
  const [searchArea, setSearchArea] = useState('');
  const [searchSpecialisation, setSearchSpecialisation] = useState('');

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const triggerSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Custom Confirmation Dialog state
  const [confirmDlg, setConfirmDlg] = useState({ open: false, title: '', message: '', onConfirm: null });

  // Form states
  const [editId, setEditId] = useState(null);
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [alternateMobile, setAlternateMobile] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [error, setError] = useState('');

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/firm/clients?limit=100`);
      setClients(response.data.clients || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpen = async (client = null, readOnly = false) => {
    setViewMode(readOnly);
    setTabVal(0);
    setDetailedClient(null);
    if (client) {
      setEditId(client.id);
      setFullName(client.fullName);
      setMobileNumber(client.mobileNumber);
      setAlternateMobile(client.alternateMobile || '');
      setEmail(client.email);
      setDob(client.dob ? client.dob.split('T')[0] : '');
      setGender(client.gender || 'Male');
      setAddress(client.address);
      setState(client.state);
      setCity(client.city);
      setPinCode(client.pinCode);
      setAadhaarNumber(client.aadhaarNumber || '');
      setPanNumber(client.panNumber || '');
      setStatus(client.user?.status || 'ACTIVE');

      if (readOnly) {
        setLoadingDetails(true);
        try {
          const res = await axios.get(`${API_BASE_URL}/api/firm/clients/${client.id}`);
          setDetailedClient(res.data);
        } catch (err) {
          console.error('Error fetching client details:', err);
          triggerSnackbar('Failed to fetch complete client profile', 'error');
        } finally {
          setLoadingDetails(false);
        }
      }
    } else {
      setEditId(null);
      setFullName('');
      setMobileNumber('');
      setAlternateMobile('');
      setEmail('');
      setDob('');
      setGender('Male');
      setAddress('');
      setState('');
      setCity('');
      setPinCode('');
      setAadhaarNumber('');
      setPanNumber('');
      setStatus('ACTIVE');
    }
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCasesOpen = async (client) => {
    setSelectedClient(client);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/firm/clients/${client.id}`);
      setClientCases(res.data.cases || []);
      setCasesOpen(true);
    } catch (err) {
      console.error('Error fetching client cases:', err);
    }
  };

  const handleDeleteCase = (caseId) => {
    setConfirmDlg({
      open: true,
      title: 'Confirm Delete Case',
      message: 'Are you sure you want to permanently delete this case record?',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/api/firm/cases/${caseId}`);
          triggerSnackbar('Case deleted successfully', 'success');
          // Refresh cases list
          const res = await axios.get(`${API_BASE_URL}/api/firm/clients/${selectedClient.id}`);
          setClientCases(res.data.cases || []);
        } catch (err) {
          const errMsg = err.response?.data?.message || 'Failed to delete case';
          triggerSnackbar(errMsg, 'error');
        }
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (viewMode) return;
    if (!fullName || !mobileNumber || !email || !address || !state || !city || !pinCode) {
      setError('Please fill in all required fields');
      return;
    }

    const executeSubmit = async () => {
      try {
        const payload = {
          fullName, mobileNumber, alternateMobile, email, dob,
          gender, address, state, city, pinCode, aadhaarNumber, panNumber, status,
        };

        if (editId) {
          await axios.put(`${API_BASE_URL}/api/firm/clients/${editId}`, payload);
          triggerSnackbar('Client profile updated successfully', 'success');
        } else {
          await axios.post(`${API_BASE_URL}/api/firm/clients`, payload);
          triggerSnackbar('Client profile created successfully', 'success');
        }
        fetchClients();
        handleClose();
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Error occurred while saving client';
        setError(errMsg);
        triggerSnackbar(errMsg, 'error');
      }
    };

    if (editId) {
      setConfirmDlg({
        open: true,
        title: 'Confirm Update Client',
        message: 'Are you sure you want to save modifications to this client profile?',
        onConfirm: executeSubmit,
      });
    } else {
      executeSubmit();
    }
  };

  const handleDelete = (id) => {
    setConfirmDlg({
      open: true,
      title: 'Confirm Delete Client',
      message: 'Are you sure you want to delete this client? This will delete their system login account too.',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/api/firm/clients/${id}`);
          triggerSnackbar('Client profile deleted successfully', 'success');
          fetchClients();
        } catch (err) {
          const errMsg = err.response?.data?.message || 'Failed to delete client';
          triggerSnackbar(errMsg, 'error');
        }
      },
    });
  };

  const handleOpenTimeline = (c) => {
    setActiveCase(c);
    setTimelineOpen(true);
  };

  const handleOpenNewUpdate = (c) => {
    setActiveCase(c);
    setHearingDate('');
    setHearingTime('');
    setHearingPurpose('');
    setCaseStatus(c.status);
    setUpdateError('');
    setNewUpdateOpen(true);
  };

  const handleAddUpdate = (e) => {
    e.preventDefault();
    
    const executeUpdate = async () => {
      try {
        if (hearingDate && hearingPurpose) {
          // Schedule next hearing
          await axios.post(`${API_BASE_URL}/api/firm/hearings`, {
            caseId: activeCase.id,
            hearingDate,
            hearingTime: hearingTime || '10:00',
            purpose: hearingPurpose,
            status: 'SCHEDULED'
          });
        }
        // Update status
        if (caseStatus !== activeCase.status) {
          await axios.put(`${API_BASE_URL}/api/firm/cases/${activeCase.id}`, {
            ...activeCase,
            status: caseStatus
          });
        }
        triggerSnackbar('Case updated successfully', 'success');
        setNewUpdateOpen(false);
        // Refresh cases list
        const res = await axios.get(`${API_BASE_URL}/api/firm/clients/${selectedClient.id}`);
        setClientCases(res.data.cases || []);
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Error updating case';
        setUpdateError(errMsg);
        triggerSnackbar(errMsg, 'error');
      }
    };

    setConfirmDlg({
      open: true,
      title: 'Confirm Case Update',
      message: 'Are you sure you want to post this update and schedule the hearing?',
      onConfirm: executeUpdate,
    });
  };

  const handleResetFilters = () => {
    setSearchName('');
    setSearchArea('');
    setSearchSpecialisation('');
  };

  const userTenantId = (user?.lawFirmId || user?.tenantId?.id || user?.tenantId?._id || (typeof user?.tenantId === 'string' ? user?.tenantId : null))?.toString();

  // Local filtering based on filters
  const filteredClients = clients.filter((c) => {
    if (user?.role === 'CLIENT_ADMIN' || user?.role === 'CLIENT_USER') {
      const cTenantId = (c.lawFirmId?.id || c.lawFirmId?._id || c.tenantId?.id || c.tenantId?._id || (typeof c.lawFirmId === 'string' ? c.lawFirmId : typeof c.tenantId === 'string' ? c.tenantId : null))?.toString();
      if (userTenantId && cTenantId && userTenantId !== cTenantId) {
        return false;
      }
    }
    const matchesName = !searchName || c.fullName?.toLowerCase().includes(searchName.toLowerCase());
    const matchesArea = !searchArea ||
      (c.address && c.address.toLowerCase().includes(searchArea.toLowerCase())) ||
      (c.city && c.city.toLowerCase().includes(searchArea.toLowerCase())) ||
      (c.state && c.state.toLowerCase().includes(searchArea.toLowerCase()));
    const matchesSpec = !searchSpecialisation || (
      c.cases && c.cases.some(cs => cs.caseType && cs.caseType.toLowerCase().includes(searchSpecialisation.toLowerCase()))
    );
    return matchesName && matchesArea && matchesSpec;
  });

  const columns = [
    { id: 'fullName', label: 'Client Name' },
    { id: 'email', label: 'Email Address' },
    { id: 'mobileNumber', label: 'Mobile' },
    { id: 'city', label: 'City' },
    {
      id: '_count',
      label: 'Open Cases',
      render: (row) => row._count?.cases || 0,
    },
    {
      id: 'status',
      label: 'Login Status',
      render: (row) => (
        <Chip
          size="small"
          label={row.user?.status || 'ACTIVE'}
          color={row.user?.status === 'ACTIVE' ? 'success' : 'default'}
        />
      ),
    },
  ];

  if (loading) return <LoadingScreen message="Loading Client Directory..." />;

  return (
    <Box sx={{ py: 0.5 }}>
      {/* Advanced Search Filter Bar */}
      <Card sx={{ mb: 1.5, borderRadius: 1.5 }}>
        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Search Name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                sx={{ '& .MuiInputBase-root': { height: 34, fontSize: '0.82rem' } }}
                InputLabelProps={{ style: { fontSize: '0.8rem' } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Area (City/State/Addr)"
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                sx={{ '& .MuiInputBase-root': { height: 34, fontSize: '0.82rem' } }}
                InputLabelProps={{ style: { fontSize: '0.8rem' } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Specialisation (Case Type)"
                value={searchSpecialisation}
                onChange={(e) => setSearchSpecialisation(e.target.value)}
                sx={{ '& .MuiInputBase-root': { height: 34, fontSize: '0.82rem' } }}
                InputLabelProps={{ style: { fontSize: '0.8rem' } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button variant="outlined" size="small" fullWidth onClick={handleResetFilters} startIcon={<RefreshIcon />} sx={{ height: 34 }}>
                Reset Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <DataTable
        title="Manage Clients"
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
        rows={filteredClients}
        searchPlaceholder="Filter clients locally..."
        searchField="fullName"
        actions={(row) => (
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
            <Tooltip title="View Profile">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpen(row, true); }} color="info">
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Profile">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpen(row, false); }} color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Manage Cases">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleCasesOpen(row); }} color="success">
                <FolderSpecialIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Client">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      />

      {/* Client Edit/Add/View Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {viewMode ? 'View Client Profile' : editId ? 'Modify Client Profile' : 'Add Client Profile'}
        </DialogTitle>
        {viewMode && isAdminOrSuperAdmin && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
            <Tabs value={tabVal} onChange={(e, newVal) => setTabVal(newVal)} aria-label="client profile tabs">
              <Tab label="Contact Profile" />
              <Tab label="Cases & Hearings" />
            </Tabs>
          </Box>
        )}
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 2 }}>
            {viewMode && tabVal === 1 && isAdminOrSuperAdmin ? (
              loadingDetails ? (
                <Typography sx={{ py: 3, textAlign: 'center' }}>Loading cases & hearings...</Typography>
              ) : !detailedClient?.cases || detailedClient.cases.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No cases or hearing history found for this client.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {detailedClient.cases.map((c) => {
                    const nextHearing = c.hearings?.find(h => h.status === 'SCHEDULED' && new Date(h.hearingDate) >= new Date());
                    const pastHearings = c.hearings?.filter(h => h.status === 'COMPLETED' || new Date(h.hearingDate) < new Date());

                    return (
                      <Card key={c.id} variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {c.caseTitle}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Case No: {c.caseNumber} | Type: {c.caseType}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip size="small" label={`Status: ${c.status}`} color={c.status === 'OPEN' ? 'success' : 'default'} />
                              <Chip size="small" label={`Priority: ${c.priority}`} color={c.priority === 'HIGH' ? 'error' : c.priority === 'MEDIUM' ? 'warning' : 'default'} />
                            </Box>
                          </Box>

                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Assigned Counsel</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {c.advocate ? `${c.advocate.fullName} (${c.advocate.qualification})` : '—'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Opposing Counsel / Party</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {c.oppositeAdvocateName || c.oppositePartyName || '—'}
                              </Typography>
                            </Grid>
                          </Grid>

                          <Divider sx={{ my: 2 }} />

                          {/* Next Hearing */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              📅 Next Hearing
                            </Typography>
                            {nextHearing ? (
                              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  Date: {new Date(nextHearing.hearingDate).toLocaleDateString()} | Time: {nextHearing.hearingTime}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Purpose: {nextHearing.purpose || '—'}
                                </Typography>
                              </Paper>
                            ) : (
                              <Typography variant="body2" color="text.secondary">No upcoming hearings scheduled.</Typography>
                            )}
                          </Box>

                          {/* Previous Hearings / History */}
                          <Box>
                            <Typography variant="subtitle2" color="secondary" sx={{ fontWeight: 700, mb: 1 }}>
                              📜 Previous Hearings History
                            </Typography>
                            {!pastHearings || pastHearings.length === 0 ? (
                              <Typography variant="body2" color="text.secondary">No previous hearings on record.</Typography>
                            ) : (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {pastHearings.map((h) => (
                                  <Paper key={h.id} variant="outlined" sx={{ p: 1.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {new Date(h.hearingDate).toLocaleDateString()} ({h.hearingTime}) - {h.purpose}
                                      </Typography>
                                      <Chip size="small" variant="outlined" label={h.status} color={h.status === 'COMPLETED' ? 'success' : 'default'} />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                      <b>What Transpired:</b> {h.result || '—'}
                                    </Typography>
                                    {h.nextHearingDate && (
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                        Next hearing date marked during session: {new Date(h.nextHearingDate).toLocaleDateString()}
                                      </Typography>
                                    )}
                                  </Paper>
                                ))}
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              )
            ) : (
              <>
                {error && <Chip label={error} color="error" variant="outlined" sx={{ borderRadius: 1, mb: 2.5 }} />}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Full Name" required fullWidth value={fullName} onChange={(e) => setFullName(e.target.value)} InputProps={{ readOnly: viewMode }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Email Address" type="email" required fullWidth value={email} onChange={(e) => setEmail(e.target.value)} InputProps={{ readOnly: viewMode }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Mobile Number" required fullWidth value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} InputProps={{ readOnly: viewMode }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Alternate Mobile" fullWidth value={alternateMobile} onChange={(e) => setAlternateMobile(e.target.value)} InputProps={{ readOnly: viewMode }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Date of Birth" type="date" fullWidth InputLabelProps={{ shrink: true }} value={dob} onChange={(e) => setDob(e.target.value)} InputProps={{ readOnly: viewMode }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField select label="Gender" value={gender} onChange={(e) => setGender(e.target.value)} fullWidth InputProps={{ readOnly: viewMode }}>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Full Address" required fullWidth multiline rows={2} value={address} onChange={(e) => setAddress(e.target.value)} InputProps={{ readOnly: viewMode }} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField label="City" required fullWidth value={city} onChange={(e) => setCity(e.target.value)} InputProps={{ readOnly: viewMode }} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField label="State" required fullWidth value={state} onChange={(e) => setState(e.target.value)} InputProps={{ readOnly: viewMode }} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField label="PIN Code" required fullWidth value={pinCode} onChange={(e) => setPinCode(e.target.value)} InputProps={{ readOnly: viewMode }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Aadhaar Number (Optional)" fullWidth value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value)} inputProps={{ maxLength: 12, readOnly: viewMode }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="PAN Number (Optional)" fullWidth value={panNumber} onChange={(e) => setPanNumber(e.target.value)} inputProps={{ maxLength: 10, readOnly: viewMode }} />
                  </Grid>
                  {editId && (
                    <Grid item xs={12}>
                      <TextField select label="Login Account Status" value={status} onChange={(e) => setStatus(e.target.value)} fullWidth InputProps={{ readOnly: viewMode }}>
                        <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                        <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                      </TextField>
                    </Grid>
                  )}
                </Grid>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose} color="inherit">Close</Button>
            {!viewMode && <Button type="submit" variant="contained">Save Client</Button>}
          </DialogActions>
        </form>
      </Dialog>

      {/* Client Cases Management Modal */}
      <Dialog open={casesOpen} onClose={() => setCasesOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <GavelIcon color="primary" fontSize="large" />
            Cases for {selectedClient?.fullName}
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setCasesOpen(false); navigate(`/firm/cases/new?clientId=${selectedClient.id}`); }}>
            Add Case
          </Button>
        </DialogTitle>
        <DialogContent>
          {clientCases.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
              No cases on record for this client.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Case No</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientCases.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{c.caseNumber}</TableCell>
                      <TableCell>{c.caseTitle}</TableCell>
                      <TableCell>{c.caseType}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Button size="small" onClick={() => { setCasesOpen(false); navigate(`/firm/cases/${c.id}`); }}>View</Button>
                          <Button size="small" onClick={() => { setCasesOpen(false); navigate(`/firm/cases/${c.id}/edit`); }}>Edit</Button>
                          <Button size="small" onClick={() => { setCasesOpen(false); navigate(`/firm/documents?caseId=${c.id}`); }}>Docs</Button>
                          <Button size="small" color="secondary" onClick={() => handleOpenTimeline(c)}>History</Button>
                          <Button size="small" color="primary" onClick={() => handleOpenNewUpdate(c)}>Update</Button>
                          <IconButton size="small" color="error" onClick={() => handleDeleteCase(c.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCasesOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Case Timeline / History Dialog */}
      <Dialog open={timelineOpen} onClose={() => setTimelineOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Case History & Timeline</DialogTitle>
        <DialogContent>
          {activeCase && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{activeCase.caseTitle}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Case No: {activeCase.caseNumber}</Typography>
              
              <Box sx={{ borderLeft: '2px solid rgba(255,255,255,0.1)', pl: 3, ml: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <Box sx={{ position: 'absolute', left: -31, top: 4, width: 14, height: 14, borderRadius: '50%', bgcolor: 'primary.main' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Case Registered</Typography>
                  <Typography variant="caption" color="text.secondary">Filing Date: {new Date(activeCase.filingDate).toLocaleDateString()}</Typography>
                </Box>
                <Box sx={{ position: 'relative' }}>
                  <Box sx={{ position: 'absolute', left: -31, top: 4, width: 14, height: 14, borderRadius: '50%', bgcolor: 'success.main' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Counsel Assigned</Typography>
                  <Typography variant="body2" color="text.secondary">Lead Counsel: {activeCase.advocate?.fullName || '—'}</Typography>
                </Box>
                {activeCase.hearings && activeCase.hearings.map((h, i) => (
                  <Box key={h.id} sx={{ position: 'relative' }}>
                    <Box sx={{ position: 'absolute', left: -31, top: 4, width: 14, height: 14, borderRadius: '50%', bgcolor: 'warning.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Hearing Scheduled - Round {i + 1}</Typography>
                    <Typography variant="body2" color="text.secondary">Purpose: {h.purpose}</Typography>
                    <Typography variant="caption" color="text.secondary">Date: {new Date(h.hearingDate).toLocaleDateString()} | Time: {h.hearingTime}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setTimelineOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Case Quick Update Dialog */}
      <Dialog open={newUpdateOpen} onClose={() => setNewUpdateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Quick Case Update</DialogTitle>
        <form onSubmit={handleAddUpdate}>
          <DialogContent sx={{ pt: 1 }}>
            {updateError && <Typography color="error" variant="body2" sx={{ mb: 2 }}>{updateError}</Typography>}
            
            <TextField
              select
              label="Update Case Status"
              fullWidth
              sx={{ mb: 3 }}
              value={caseStatus}
              onChange={(e) => setCaseStatus(e.target.value)}
            >
              <MenuItem value="OPEN">OPEN</MenuItem>
              <MenuItem value="PENDING">PENDING</MenuItem>
              <MenuItem value="CLOSED">CLOSED</MenuItem>
            </TextField>

            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Schedule Next Hearing (Optional)</Typography>

            <TextField
              type="date"
              label="Next Hearing Date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
              value={hearingDate}
              onChange={(e) => setHearingDate(e.target.value)}
            />
            <TextField
              type="time"
              label="Hearing Time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
              value={hearingTime}
              onChange={(e) => setHearingTime(e.target.value)}
            />
            <TextField
              label="Hearing Purpose"
              fullWidth
              multiline
              rows={2}
              value={hearingPurpose}
              onChange={(e) => setHearingPurpose(e.target.value)}
              placeholder="e.g. Case Admission, Evidence submission"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setNewUpdateOpen(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">Post Update</Button>
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

export default Clients;
