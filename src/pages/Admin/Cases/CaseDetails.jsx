import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

import LoadingScreen from '../../../components/Common/LoadingScreen.jsx';
import DocumentPreviewModal from '../../../components/Common/DocumentPreviewModal.jsx';

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [caseDetails, setCaseDetails] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  // Dialogs
  const [hearingOpen, setHearingOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  // New Hearing States
  const [hearingDate, setHearingDate] = useState('');
  const [hearingTime, setHearingTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [hearingError, setHearingError] = useState('');

  // Update Hearing States
  const [selectedHearing, setSelectedHearing] = useState(null);
  const [updateHearingOpen, setUpdateHearingOpen] = useState(false);
  const [hearingResult, setHearingResult] = useState('');
  const [nextHearingDate, setNextHearingDate] = useState('');
  const [hearingStatus, setHearingStatus] = useState('COMPLETED');

  // File Upload States
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('Petition');
  const [uploadError, setUploadError] = useState('');

  // Document Preview States
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const loadCaseDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/firm/cases/${id}`);
      setCaseDetails(response.data.caseDetails);
      setTimeline(response.data.timeline);
    } catch (err) {
      console.error('Error loading case details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaseDetails();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Schedule Hearing
  const handleScheduleHearing = async (e) => {
    e.preventDefault();
    setHearingError('');

    if (!hearingDate || !hearingTime || !purpose) {
      setHearingError('All fields are required');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/firm/hearings`, {
        caseId: id,
        hearingDate,
        hearingTime,
        purpose,
      });
      setHearingOpen(false);
      setHearingDate('');
      setHearingTime('');
      setPurpose('');
      loadCaseDetails();
    } catch (err) {
      setHearingError(err.response?.data?.message || 'Failed to schedule hearing');
    }
  };

  // Open Update Hearing Dialog
  const handleOpenUpdateHearing = (hearing) => {
    setSelectedHearing(hearing);
    setHearingResult(hearing.result || '');
    setNextHearingDate(hearing.nextHearingDate ? hearing.nextHearingDate.split('T')[0] : '');
    setHearingStatus(hearing.status);
    setUpdateHearingOpen(true);
  };

  // Submit Update Hearing (Result / Next Date)
  const handleUpdateHearingSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/api/firm/hearings/${selectedHearing.id}`, {
        result: hearingResult,
        nextHearingDate: nextHearingDate || null,
        status: hearingStatus,
      });
      setUpdateHearingOpen(false);
      loadCaseDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update hearing');
    }
  };

  // Delete Hearing
  const handleDeleteHearing = async (hearingId) => {
    if (!window.confirm('Delete this hearing schedule?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/firm/hearings/${hearingId}`);
      loadCaseDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete hearing');
    }
  };

  // Document Upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    setUploadError('');

    if (!file) {
      setUploadError('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseId', id);
    formData.append('category', category);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/firm/documents`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setUploadOpen(false);
      setFile(null);
      loadCaseDetails();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload document');
    }
  };

  const getCleanFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const clean = url.replace(/\\/g, '/');
    const pathStr = clean.startsWith('/') ? clean : '/' + clean;
    return `${API_BASE_URL}${pathStr}`;
  };

  const handleDownloadDoc = (docItem) => {
    const fullUrl = getCleanFileUrl(docItem.fileUrl);
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = docItem.fileName || 'document';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 100);
  };

  // Delete Document
  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document from the vault?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/firm/documents/${docId}`);
      loadCaseDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const handleDeleteCase = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this entire case file? All hearings and documents will be erased.')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/firm/cases/${id}`);
      navigate('/firm/cases');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete case');
    }
  };

  if (loading) return <LoadingScreen message="Unlocking Case Vault..." />;
  if (!caseDetails) return <Typography>Error loading case details</Typography>;

  return (
    <Box sx={{ py: 2 }}>
      {/* Header bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/firm/cases')}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {caseDetails.caseTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Case No: {caseDetails.caseNumber} | Type: {caseDetails.caseType}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tabs Layout */}
      <Card sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Case Overview" />
          <Tab label="Opposing Parties" />
          <Tab label="Hearings History" />
          <Tab label="Document Vault" />
          <Tab label="Dynamic Timeline" />
          <Tab label="Observation Notes" />
        </Tabs>

        <CardContent sx={{ p: 4 }}>
          {/* Tab 0: Case Overview */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>BASIC INFORMATION</Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="body2"><b>Filing Number:</b> {caseDetails.filingNumber}</Typography>
                  <Typography variant="body2"><b>1st Filing Date:</b> {caseDetails.firstFilingDate ? new Date(caseDetails.firstFilingDate).toLocaleDateString() : new Date(caseDetails.filingDate).toLocaleDateString()}</Typography>
                  <Typography variant="body2"><b>Start Date:</b> {caseDetails.startDate ? new Date(caseDetails.startDate).toLocaleDateString() : new Date(caseDetails.registrationDate).toLocaleDateString()}</Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                    <Chip label={`Priority: ${caseDetails.priority}`} color={caseDetails.priority === 'HIGH' ? 'error' : caseDetails.priority === 'MEDIUM' ? 'warning' : 'info'} size="small" />
                    <Chip label={`Status: ${caseDetails.status}`} color={caseDetails.status === 'OPEN' ? 'success' : 'default'} size="small" />
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>COURT & PRESIDING OFFICER</Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="body2"><b>Court Name:</b> {caseDetails.court?.courtName}</Typography>
                  <Typography variant="body2"><b>Court Room/Bench:</b> {caseDetails.court?.courtNumber} ({caseDetails.court?.bench})</Typography>
                  <Typography variant="body2"><b>Presiding Judge:</b> {caseDetails.judge?.judgeName}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>OUR PARTY ({caseDetails.ourPartyPetOrResp || 'Petitioner'})</Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2"><b>Name:</b> {(!caseDetails.ourPartyName || /^[0-9a-fA-F-]{24,36}$/.test(caseDetails.ourPartyName)) ? (caseDetails.client?.fullName || caseDetails.client?.companyOrAdvocate || '—') : caseDetails.ourPartyName}</Typography>
                  <Typography variant="body2"><b>Phone No:</b> {caseDetails.ourPartyPhoneNo || caseDetails.client?.mobileNumber || '—'}</Typography>
                  <Typography variant="body2"><b>Alt Phone:</b> {caseDetails.ourPartyAltPhoneNo || '—'}</Typography>
                  <Typography variant="body2"><b>Email:</b> {caseDetails.ourPartyEmail || caseDetails.client?.email || '—'}</Typography>
                  {caseDetails.ourPartyRemark && <Typography variant="body2"><b>Remark:</b> {caseDetails.ourPartyRemark}</Typography>}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>OPPOSITE PARTY ({caseDetails.oppPartyPetOrResp || 'Respondent'})</Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2"><b>Name:</b> {caseDetails.oppPartyName || caseDetails.oppositePartyName}</Typography>
                  <Typography variant="body2"><b>Phone No:</b> {caseDetails.oppPartyPhoneNo || caseDetails.oppositePartyMobile || '—'}</Typography>
                  <Typography variant="body2"><b>Alt Phone:</b> {caseDetails.oppPartyAltPhoneNo || '—'}</Typography>
                  <Typography variant="body2"><b>Email:</b> {caseDetails.oppPartyEmail || caseDetails.oppositePartyEmail || '—'}</Typography>
                  {caseDetails.oppPartyRemark && <Typography variant="body2"><b>Remark:</b> {caseDetails.oppPartyRemark}</Typography>}
                </Box>
              </Grid>
            </Grid>
          )}

          {/* Tab 1: Opposing Parties & Counsel */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>OUR PARTY DETAILS ({caseDetails.ourPartyPetOrResp || 'Petitioner'})</Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="body2"><b>Associated Legal Client:</b> {(!caseDetails.ourPartyAssociatedClient || /^[0-9a-fA-F-]{24,36}$/.test(caseDetails.ourPartyAssociatedClient)) ? (caseDetails.client?.fullName || caseDetails.client?.companyOrAdvocate || '—') : caseDetails.ourPartyAssociatedClient}</Typography>
                  <Typography variant="body2"><b>Name:</b> {(!caseDetails.ourPartyName || /^[0-9a-fA-F-]{24,36}$/.test(caseDetails.ourPartyName)) ? (caseDetails.client?.fullName || caseDetails.client?.companyOrAdvocate || '—') : caseDetails.ourPartyName}</Typography>
                  <Typography variant="body2"><b>Phone No:</b> {caseDetails.ourPartyPhoneNo || caseDetails.client?.mobileNumber || '—'}</Typography>
                  <Typography variant="body2"><b>Alt Phone No:</b> {caseDetails.ourPartyAltPhoneNo || '—'}</Typography>
                  <Typography variant="body2"><b>Email:</b> {caseDetails.ourPartyEmail || caseDetails.client?.email || '—'}</Typography>
                  <Typography variant="body2"><b>Address:</b> {caseDetails.ourPartyAddress || '—'}</Typography>
                  <Typography variant="body2"><b>Remark:</b> {caseDetails.ourPartyRemark || '—'}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>OPPOSITE PARTY DETAILS ({caseDetails.oppPartyPetOrResp || 'Respondent'})</Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="body2"><b>Name:</b> {caseDetails.oppPartyName || caseDetails.oppositePartyName}</Typography>
                  <Typography variant="body2"><b>Phone No:</b> {caseDetails.oppPartyPhoneNo || caseDetails.oppositePartyMobile || '—'}</Typography>
                  <Typography variant="body2"><b>Alt Phone No:</b> {caseDetails.oppPartyAltPhoneNo || '—'}</Typography>
                  <Typography variant="body2"><b>Email:</b> {caseDetails.oppPartyEmail || caseDetails.oppositePartyEmail || '—'}</Typography>
                  <Typography variant="body2"><b>Address:</b> {caseDetails.oppPartyAddress || caseDetails.oppositePartyAddress || '—'}</Typography>
                  <Typography variant="body2"><b>Remark:</b> {caseDetails.oppPartyRemark || '—'}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>ASSIGNED LEAD ADVOCATE</Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="body2"><b>Counsel Name:</b> {caseDetails.advocate?.fullName}</Typography>
                  <Typography variant="body2"><b>Email:</b> {caseDetails.advocate?.email}</Typography>
                  <Typography variant="body2"><b>Mobile No:</b> {caseDetails.advocate?.mobileNumber}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>OPPOSING COUNSEL</Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="body2"><b>Counsel Name:</b> {caseDetails.oppositeAdvocateName || '—'}</Typography>
                  <Typography variant="body2"><b>Enrollment No:</b> {caseDetails.oppositeAdvocateEnrollment || '—'}</Typography>
                  <Typography variant="body2"><b>Chamber/Firm Name:</b> {caseDetails.oppositeAdvocateFirm || '—'}</Typography>
                  <Typography variant="body2"><b>Mobile No:</b> {caseDetails.oppositeAdvocateMobile || '—'}</Typography>
                  <Typography variant="body2"><b>Email:</b> {caseDetails.oppositeAdvocateEmail || '—'}</Typography>
                </Box>
              </Grid>
            </Grid>
          )}

          {/* Tab 2: Hearings */}
          {tabValue === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Scheduled Hearings & Result Logs</Typography>
                <Button variant="contained" startIcon={<EventIcon />} onClick={() => setHearingOpen(true)}>
                  Schedule Hearing
                </Button>
              </Box>

              {caseDetails.hearings.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No hearings scheduled for this case.</Typography>
              ) : (
                <List>
                  {caseDetails.hearings.map((h, idx) => (
                    <React.Fragment key={h.id}>
                      <ListItem
                        sx={{ py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        secondaryAction={
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" variant="outlined" onClick={() => handleOpenUpdateHearing(h)}>
                              Update Results
                            </Button>
                            <IconButton size="small" color="error" onClick={() => handleDeleteHearing(h.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {new Date(h.hearingDate).toLocaleDateString()} at {h.hearingTime}
                              </Typography>
                              <Chip
                                size="small"
                                label={h.status}
                                color={h.status === 'SCHEDULED' ? 'primary' : h.status === 'COMPLETED' ? 'success' : 'default'}
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary" component="div">
                              <b>Purpose:</b> {h.purpose}
                              {h.result && (
                                <>
                                  <br />
                                  <b>Result:</b> {h.result}
                                </>
                              )}
                              {h.nextHearingDate && (
                                <>
                                  <br />
                                  <b>Next Scheduled Date:</b> {new Date(h.nextHearingDate).toLocaleDateString()}
                                </>
                              )}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {idx < caseDetails.hearings.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}

          {/* Tab 3: Documents */}
          {tabValue === 3 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Case Document Vault</Typography>
                <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={() => setUploadOpen(true)}>
                  Upload Document
                </Button>
              </Box>

              {caseDetails.documents.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No documents uploaded in this vault.</Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>File Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Uploaded Date</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Uploaded By</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {caseDetails.documents.map((doc) => (
                        <TableRow key={doc.id} hover>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <InsertDriveFileIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                              <span style={{ wordBreak: 'break-all' }}>{doc.fileName}</span>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={doc.category} size="small" color="primary" sx={{ fontWeight: 600, height: 22, fontSize: '0.72rem' }} />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                            {doc.user?.fullName || doc.user?.email || 'System User'}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                              <Tooltip title="Preview">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    setPreviewDoc(doc);
                                    setPreviewOpen(true);
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleDownloadDoc(doc)}
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteDocument(doc.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* Tab 4: Dynamic Timeline */}
          {tabValue === 4 && (
            <Box sx={{ maxWidth: 600, mx: 'auto', py: 2 }}>
              <Stepper orientation="vertical" activeStep={timeline.length}>
                {timeline.map((node, index) => (
                  <Step key={node.id} active={true} completed={true}>
                    <StepLabel
                      StepIconProps={{
                        icon: index + 1,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {node.title} — {new Date(node.date).toLocaleDateString()}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        {node.description}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}

          {/* Tab 5: Notes */}
          {tabValue === 5 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 700 }}>Internal Notes (Firm eyes only)</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
                      {caseDetails.internalNotes || 'No internal remarks entered yet.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" color="secondary" sx={{ mb: 2, fontWeight: 700 }}>Public Notes (Shared with Client)</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
                      {caseDetails.publicNotes || 'No notes shared with the client yet.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined" sx={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Judgment Summary & Closing Remarks</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
                      {caseDetails.remarks || 'No closing remarks / final judgments entered.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

        </CardContent>
      </Card>

      {/* Dialog: Schedule Hearing */}
      <Dialog open={hearingOpen} onClose={() => setHearingOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Schedule Hearing</DialogTitle>
        <form onSubmit={handleScheduleHearing}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {hearingError && <Chip label={hearingError} color="error" variant="outlined" />}
            <TextField label="Hearing Date" type="date" required fullWidth InputLabelProps={{ shrink: true }} value={hearingDate} onChange={(e) => setHearingDate(e.target.value)} />
            <TextField label="Hearing Time" type="time" required fullWidth InputLabelProps={{ shrink: true }} value={hearingTime} onChange={(e) => setHearingTime(e.target.value)} />
            <TextField label="Hearing Purpose" required fullWidth value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Admission, Evidence, Final Arguments" />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setHearingOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Schedule</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog: Update Hearing Results */}
      <Dialog open={updateHearingOpen} onClose={() => setUpdateHearingOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Hearing Results</DialogTitle>
        <form onSubmit={handleUpdateHearingSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              select
              label="Hearing Status"
              value={hearingStatus}
              onChange={(e) => setHearingStatus(e.target.value)}
              fullWidth
            >
              <MenuItem value="SCHEDULED">SCHEDULED (Upcoming)</MenuItem>
              <MenuItem value="COMPLETED">COMPLETED (Past)</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED</MenuItem>
            </TextField>
            <TextField label="Hearing Result / Summary" fullWidth multiline rows={3} value={hearingResult} onChange={(e) => setHearingResult(e.target.value)} placeholder="Provide what happened in this session..." />
            <TextField label="Next Hearing Date (If scheduled)" type="date" fullWidth InputLabelProps={{ shrink: true }} value={nextHearingDate} onChange={(e) => setNextHearingDate(e.target.value)} />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setUpdateHearingOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Update Log</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog: Upload Document */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Upload Document</DialogTitle>
        <form onSubmit={handleUploadDocument}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {uploadError && <Chip label={uploadError} color="error" variant="outlined" />}
            <TextField
              select
              label="Document Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              fullWidth
              required
            >
              <MenuItem value="Petition">Petition</MenuItem>
              <MenuItem value="FIR">FIR</MenuItem>
              <MenuItem value="Charge Sheet">Charge Sheet</MenuItem>
              <MenuItem value="Affidavit">Affidavit</MenuItem>
              <MenuItem value="Evidence">Evidence</MenuItem>
              <MenuItem value="Court Order">Court Order</MenuItem>
              <MenuItem value="Judgment Copy">Judgment Copy</MenuItem>
              <MenuItem value="Other">Other Documents</MenuItem>
            </TextField>
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={{ py: 1.5 }}>
              Select File
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {file && (
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, textAlign: 'center' }}>
                📁 {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!file}>Upload File</Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Document Preview Modal */}
      <DocumentPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        document={previewDoc}
      />
    </Box>
  );
};

export default CaseDetails;
