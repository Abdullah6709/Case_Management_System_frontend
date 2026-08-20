import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  MenuItem,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import GavelIcon from '@mui/icons-material/Gavel';
import InfoIcon from '@mui/icons-material/Info';

import LoadingScreen from '../../../components/Common/LoadingScreen.jsx';

const CaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // undefined for Create, has value for Edit

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selection sources
  const [clients, setClients] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [courts, setCourts] = useState([]);
  const [judges, setJudges] = useState([]);
  const [filteredJudges, setFilteredJudges] = useState([]);
  const [clientId, setClientId] = useState('');

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // Form Fields: Basic Information
  const [caseNumber, setCaseNumber] = useState('');
  const [filingNumber, setFilingNumber] = useState('');
  const [caseTitle, setCaseTitle] = useState('');
  const [caseType, setCaseType] = useState('Civil Suit');
  const [caseCategory, setCaseCategory] = useState('Property Dispute');
  const [startDate, setStartDate] = useState('');
  const [firstFilingDate, setFirstFilingDate] = useState(getTodayDate());
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('OPEN');

  // Form Fields: Our Party Details
  const [ourPartyAssociatedClient, setOurPartyAssociatedClient] = useState('');
  const [ourPartyName, setOurPartyName] = useState('');
  const [ourPartyPetOrResp, setOurPartyPetOrResp] = useState('Petitioner');
  const [ourPartyPhoneNo, setOurPartyPhoneNo] = useState('');
  const [ourPartyAltPhoneNo, setOurPartyAltPhoneNo] = useState('');
  const [ourPartyAddress, setOurPartyAddress] = useState('');
  const [ourPartyEmail, setOurPartyEmail] = useState('');
  const [ourPartyRemark, setOurPartyRemark] = useState('');

  // Form Fields: Opposite Party Details
  const [oppPartyAssociatedClient, setOppPartyAssociatedClient] = useState('');
  const [oppPartyName, setOppPartyName] = useState('');
  const [oppPartyPetOrResp, setOppPartyPetOrResp] = useState('Respondent');
  const [oppPartyPhoneNo, setOppPartyPhoneNo] = useState('');
  const [oppPartyAltPhoneNo, setOppPartyAltPhoneNo] = useState('');
  const [oppPartyAddress, setOppPartyAddress] = useState('');
  const [oppPartyEmail, setOppPartyEmail] = useState('');
  const [oppPartyRemark, setOppPartyRemark] = useState('');

  // Opposing Advocate
  const [oppositeAdvocateName, setOppositeAdvocateName] = useState('');
  const [oppositeAdvocateEnrollment, setOppositeAdvocateEnrollment] = useState('');
  const [oppositeAdvocateFirm, setOppositeAdvocateFirm] = useState('');
  const [oppositeAdvocateMobile, setOppositeAdvocateMobile] = useState('');
  const [oppositeAdvocateEmail, setOppositeAdvocateEmail] = useState('');

  // Court & Advocates Info
  const [courtId, setCourtId] = useState('');
  const [judgeId, setJudgeId] = useState('');
  const [advocateId, setAdvocateId] = useState('');
  const [juniorAdvocateId, setJuniorAdvocateId] = useState('');

  // Notes & Remarks
  const [internalNotes, setInternalNotes] = useState('');
  const [publicNotes, setPublicNotes] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const loadSelections = async () => {
      try {
        const [advocatesRes, courtsRes, judgesRes, clientsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/firm/advocates`),
          axios.get(`${API_BASE_URL}/api/masters/courts`),
          axios.get(`${API_BASE_URL}/api/masters/judges`),
          axios.get(`${API_BASE_URL}/api/firm/clients?limit=1000`),
        ]);

        const advocatesList = Array.isArray(advocatesRes.data) ? advocatesRes.data : (advocatesRes.data?.advocates || []);
        const courtsList = Array.isArray(courtsRes.data) ? courtsRes.data : (courtsRes.data?.courts || []);
        const judgesList = Array.isArray(judgesRes.data) ? judgesRes.data : (judgesRes.data?.judges || []);
        const clientsList = Array.isArray(clientsRes.data) ? clientsRes.data : (clientsRes.data?.clients || []);

        setAdvocates(advocatesList);
        setCourts(courtsList);
        setJudges(judgesList);
        setClients(clientsList);

        if (id) {
          // Fetch existing case details for editing
          const caseRes = await axios.get(`${API_BASE_URL}/api/firm/cases/${id}`);
          const c = caseRes.data.caseDetails;

          setCaseNumber(c.caseNumber || '');
          setFilingNumber(c.filingNumber || '');
          setCaseTitle(c.caseTitle || '');
          setCaseType(c.caseType || 'Civil Suit');
          setCaseCategory(c.caseCategory || 'Property Dispute');
          setStartDate(c.startDate ? c.startDate.split('T')[0] : c.registrationDate ? c.registrationDate.split('T')[0] : '');
          setFirstFilingDate(c.firstFilingDate ? c.firstFilingDate.split('T')[0] : c.filingDate ? c.filingDate.split('T')[0] : '');
          setPriority(c.priority || 'MEDIUM');
          setStatus(c.status || 'OPEN');

          // Client selection
          const existingClientId = c.clientId?._id || c.clientId?.id || c.clientId || c.client?._id || c.client?.id || '';
          setClientId(existingClientId);

          const isUuid = (val) => typeof val !== 'string' || !val || /^[0-9a-fA-F-]{24,36}$/.test(val) || clientsList.some((cl) => (cl._id || cl.id) === val);
          const clientObj = (typeof c.clientId === 'object' && c.clientId) || (typeof c.client === 'object' && c.client) || clientsList.find((cl) => (cl._id || cl.id) === existingClientId);
          const fallbackClientName = clientObj?.fullName || clientObj?.companyOrAdvocate || '';

          let ourClientVal = c.ourPartyAssociatedClient;
          if (isUuid(ourClientVal)) {
            ourClientVal = c.ourPartyName;
          }
          if (isUuid(ourClientVal)) {
            ourClientVal = fallbackClientName;
          }

          setOurPartyAssociatedClient(ourClientVal || fallbackClientName || '');
          setOurPartyName(ourClientVal || fallbackClientName || '');
          setOurPartyPetOrResp(c.ourPartyPetOrResp || 'Petitioner');
          setOurPartyPhoneNo(c.ourPartyPhoneNo || clientObj?.mobileNumber || c.client?.mobileNumber || '');
          setOurPartyAltPhoneNo(c.ourPartyAltPhoneNo || '');
          setOurPartyAddress(c.ourPartyAddress || clientObj?.address || '');
          setOurPartyEmail(c.ourPartyEmail || clientObj?.email || c.client?.email || '');
          setOurPartyRemark(c.ourPartyRemark || '');

          // Opp Party
          const oppClientVal = c.oppPartyAssociatedClient || c.oppPartyName || c.oppositePartyName || '';
          setOppPartyAssociatedClient(oppClientVal);
          setOppPartyName(oppClientVal);
          setOppPartyPetOrResp(c.oppPartyPetOrResp || 'Respondent');
          setOppPartyPhoneNo(c.oppPartyPhoneNo || c.oppositePartyMobile || '');
          setOppPartyAltPhoneNo(c.oppPartyAltPhoneNo || '');
          setOppPartyAddress(c.oppPartyAddress || c.oppositePartyAddress || '');
          setOppPartyEmail(c.oppPartyEmail || c.oppositePartyEmail || '');
          setOppPartyRemark(c.oppPartyRemark || '');

          // Selections
          setOppositeAdvocateName(c.oppositeAdvocateName || '');
          setOppositeAdvocateEnrollment(c.oppositeAdvocateEnrollment || '');
          setOppositeAdvocateFirm(c.oppositeAdvocateFirm || '');
          setOppositeAdvocateMobile(c.oppositeAdvocateMobile || '');
          setOppositeAdvocateEmail(c.oppositeAdvocateEmail || '');
          setCourtId(c.courtId || '');
          setJudgeId(c.judgeId || '');
          setAdvocateId(c.advocateId || '');
          setJuniorAdvocateId(c.juniorAdvocateId || '');
          setInternalNotes(c.internalNotes || '');
          setPublicNotes(c.publicNotes || '');
          setRemarks(c.remarks || '');
        }
      } catch (err) {
        console.error('Error loading form configurations:', err);
        setError('Failed to fetch data required for dropdown fields.');
      } finally {
        setLoading(false);
      }
    };

    loadSelections();
  }, [id]);

  // Auto-fill and resolve Associated Client / Party Name whenever clientId or clients list updates
  useEffect(() => {
    if (clientId && Array.isArray(clients) && clients.length > 0) {
      const selectedClient = clients.find((cl) => (cl._id || cl.id) === clientId);
      if (selectedClient) {
        const clientName = selectedClient.fullName || selectedClient.companyOrAdvocate || '';
        const isUuid = (val) => typeof val !== 'string' || !val || /^[0-9a-fA-F-]{24,36}$/.test(val) || clients.some((cl) => (cl._id || cl.id) === val);

        if (isUuid(ourPartyAssociatedClient)) {
          setOurPartyAssociatedClient(clientName);
        }
        if (isUuid(ourPartyName)) {
          setOurPartyName(clientName);
        }
      }
    }
  }, [clientId, clients, ourPartyAssociatedClient, ourPartyName]);

  // Filter judges based on selected Court Room
  useEffect(() => {
    if (courtId) {
      const filtered = judges.filter((j) => (j.courtId?._id || j.courtId) === courtId);
      setFilteredJudges(filtered);
      if (judgeId && !filtered.find((j) => (j._id || j.id) === judgeId)) {
        setJudgeId('');
      }
    } else {
      setFilteredJudges([]);
    }
  }, [courtId, judges, judgeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const targetCourtId = courtId || (courts.length > 0 ? (courts[0]._id || courts[0].id) : null);
    const targetJudgeId = judgeId || (filteredJudges.length > 0 ? (filteredJudges[0]._id || filteredJudges[0].id) : (judges.length > 0 ? (judges[0]._id || judges[0].id) : null));
    const targetAdvocateId = advocateId || (advocates.length > 0 ? (advocates[0]._id || advocates[0].id) : null);

    if (!caseNumber || !filingNumber || !caseTitle || !caseType) {
      setError('Please fill in mandatory fields (Case Number, Filing Number, Case Title, and Case Type).');
      return;
    }

    const payload = {
      caseNumber,
      filingNumber,
      caseTitle,
      caseType,
      caseCategory: caseCategory || caseType || 'General',
      firstFilingDate: firstFilingDate || new Date().toISOString().split('T')[0],
      filingDate: firstFilingDate || new Date().toISOString().split('T')[0],
      startDate: startDate || new Date().toISOString().split('T')[0],
      registrationDate: startDate || new Date().toISOString().split('T')[0],
      priority,
      status,
      clientId: clientId || null,

      // Our Party
      ourPartyAssociatedClient,
      ourPartyName,
      ourPartyPetOrResp,
      ourPartyPhoneNo,
      ourPartyAltPhoneNo,
      ourPartyAddress,
      ourPartyEmail,
      ourPartyRemark,

      // Opp Party
      oppPartyAssociatedClient,
      oppPartyName,
      oppositePartyName: oppPartyName || oppPartyAssociatedClient || 'N/A',
      oppPartyPetOrResp,
      oppPartyPhoneNo,
      oppositePartyMobile: oppPartyPhoneNo,
      oppPartyAltPhoneNo,
      oppPartyAddress,
      oppositePartyAddress: oppPartyAddress,
      oppPartyEmail,
      oppositePartyEmail: oppPartyEmail,
      oppPartyRemark,

      // Selections & Advocates
      advocateId: targetAdvocateId,
      juniorAdvocateId: juniorAdvocateId || null,
      oppositeAdvocateName,
      oppositeAdvocateEnrollment,
      oppositeAdvocateFirm,
      oppositeAdvocateMobile,
      oppositeAdvocateEmail,
      courtId: targetCourtId,
      judgeId: targetJudgeId,
      internalNotes,
      publicNotes,
      remarks,
    };

    try {
      if (id) {
        await axios.put(`${API_BASE_URL}/api/firm/cases/${id}`, payload);
        navigate(`/firm/cases/${id}`);
      } else {
        const response = await axios.post(`${API_BASE_URL}/api/firm/cases`, payload);
        navigate(`/firm/cases/${response.data.id || response.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving case details.');
    }
  };

  if (loading) return <LoadingScreen message="Assembling Case Form..." />;

  return (
    <Box sx={{ py: 2 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ borderRadius: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {id ? 'Edit Case File' : 'New Case'}
        </Typography>
      </Box>

      {error && <Chip label={error} color="error" variant="outlined" sx={{ mb: 3, borderRadius: 1 }} />}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>

          {/* Section 1: Basic Information */}
          <Grid item xs={12} >
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon color="primary" /> Basic Information
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Case Number"
                      required
                      fullWidth
                      value={caseNumber}
                      onChange={(e) => setCaseNumber(e.target.value)}
                      placeholder="e.g. CS/2026/104"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Filing Number"
                      required
                      fullWidth
                      value={filingNumber}
                      onChange={(e) => setFilingNumber(e.target.value)}
                      placeholder="e.g. FIL/2026/089"
                    />
                  </Grid>

                  <Grid item xs={12} sm={12} md={6}>
                    <TextField
                      label="Case Title"
                      required
                      fullWidth
                      value={caseTitle}
                      onChange={(e) => setCaseTitle(e.target.value)}
                      placeholder="e.g. M/S Sharma Enterprises vs State of Delhi"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Case Type"
                      required
                      fullWidth
                      value={caseType}
                      onChange={(e) => setCaseType(e.target.value)}
                      placeholder="e.g. Civil Suit, Criminal Appeal"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Case Category"
                      required
                      fullWidth
                      value={caseCategory}
                      onChange={(e) => setCaseCategory(e.target.value)}
                      placeholder="e.g. Property Dispute, Corporate"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Filing Date"
                      type="date"
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={firstFilingDate}
                      onChange={(e) => setFirstFilingDate(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Start Date"
                      type="date"
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      sx={{
                        '& input[type="date"]::-webkit-datetime-edit': {
                          color: startDate ? 'inherit' : 'transparent',
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      select
                      label="Priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      fullWidth
                    >
                      <MenuItem value="HIGH">HIGH</MenuItem>
                      <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                      <MenuItem value="LOW">LOW</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      select
                      label="Status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      fullWidth
                    >
                      <MenuItem value="OPEN">OPEN</MenuItem>
                      <MenuItem value="PENDING">PENDING</MenuItem>
                      <MenuItem value="CLOSED">CLOSED</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Section 2: Our Party Details */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" /> Our Party Details
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      label="Select Client"
                      fullWidth
                      value={clientId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        setClientId(selectedId);
                        const selectedClient = Array.isArray(clients) ? clients.find((cl) => (cl._id || cl.id) === selectedId) : null;
                        if (selectedClient) {
                          const clientName = selectedClient.fullName || selectedClient.companyOrAdvocate || '';
                          setOurPartyAssociatedClient(clientName);
                          setOurPartyName(clientName);
                          if (selectedClient.mobileNumber) setOurPartyPhoneNo(selectedClient.mobileNumber);
                          if (selectedClient.email) setOurPartyEmail(selectedClient.email);
                          if (selectedClient.address) setOurPartyAddress(selectedClient.address);
                        }
                      }}

                    >
                      <MenuItem value="">
                        <em>-- Unlinked / Manual Client Entry --</em>
                      </MenuItem>
                      {Array.isArray(clients) && clients.map((cl) => (
                        <MenuItem key={cl._id || cl.id} value={cl._id || cl.id}>
                          {cl.fullName || cl.companyOrAdvocate}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={8}>
                    <TextField
                      label="Associated Legal Client"
                      fullWidth
                      value={ourPartyAssociatedClient}
                      onChange={(e) => {
                        setOurPartyAssociatedClient(e.target.value);
                        setOurPartyName(e.target.value);
                      }}
                      placeholder="Associated Legal Client / Company Name"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      label="Party Role"
                      fullWidth
                      value={ourPartyPetOrResp}
                      onChange={(e) => setOurPartyPetOrResp(e.target.value)}
                    >
                      <MenuItem value="Petitioner">Petitioner</MenuItem>
                      <MenuItem value="Respondent">Respondent</MenuItem>
                      <MenuItem value="Plaintiff">Plaintiff</MenuItem>
                      <MenuItem value="Defendant">Defendant</MenuItem>
                      <MenuItem value="Appellant">Appellant</MenuItem>
                      <MenuItem value="Applicant">Applicant</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Our Party Phone No"
                      fullWidth
                      value={ourPartyPhoneNo}
                      onChange={(e) => setOurPartyPhoneNo(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Our Party Alt Phone"
                      fullWidth
                      value={ourPartyAltPhoneNo}
                      onChange={(e) => setOurPartyAltPhoneNo(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Our Party Email"
                      type="email"
                      fullWidth
                      value={ourPartyEmail}
                      onChange={(e) => setOurPartyEmail(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Our Party Address"
                      fullWidth
                      multiline
                      rows={2}
                      value={ourPartyAddress}
                      onChange={(e) => setOurPartyAddress(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Our Party Remark"
                      fullWidth
                      multiline
                      rows={2}
                      value={ourPartyRemark}
                      onChange={(e) => setOurPartyRemark(e.target.value)}
                      placeholder="Special instructions or notes for our client party..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Section 3: Opposite Party Details */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon color="primary" /> Opposite Party Details
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      label="Associated Legal Client"
                      fullWidth
                      value={oppPartyAssociatedClient}
                      onChange={(e) => {
                        setOppPartyAssociatedClient(e.target.value);
                        setOppPartyName(e.target.value);
                      }}
                      placeholder="Associated Legal Client / Entity"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      label="Party Role"
                      fullWidth
                      value={oppPartyPetOrResp}
                      onChange={(e) => setOppPartyPetOrResp(e.target.value)}
                    >
                      <MenuItem value="Respondent">Respondent</MenuItem>
                      <MenuItem value="Petitioner">Petitioner</MenuItem>
                      <MenuItem value="Defendant">Defendant</MenuItem>
                      <MenuItem value="Plaintiff">Plaintiff</MenuItem>
                      <MenuItem value="Appellant">Appellant</MenuItem>
                      <MenuItem value="Opposite Party">Opposite Party</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Opp Party Phone No"
                      fullWidth
                      value={oppPartyPhoneNo}
                      onChange={(e) => setOppPartyPhoneNo(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Opp Party Alt Phone"
                      fullWidth
                      value={oppPartyAltPhoneNo}
                      onChange={(e) => setOppPartyAltPhoneNo(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Opp Party Email"
                      type="email"
                      fullWidth
                      value={oppPartyEmail}
                      onChange={(e) => setOppPartyEmail(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Opp Party Address"
                      fullWidth
                      multiline
                      rows={2}
                      value={oppPartyAddress}
                      onChange={(e) => setOppPartyAddress(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Opp Party Remark"
                      fullWidth
                      multiline
                      rows={2}
                      value={oppPartyRemark}
                      onChange={(e) => setOppPartyRemark(e.target.value)}
                      placeholder="Notes regarding opposite party background, status, etc..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Section 4: Opposing Advocate Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GavelIcon color="primary" /> Opposing Advocate Information
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Opposing Counsel Name"
                      fullWidth
                      value={oppositeAdvocateName}
                      onChange={(e) => setOppositeAdvocateName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Enrollment Number"
                      fullWidth
                      value={oppositeAdvocateEnrollment}
                      onChange={(e) => setOppositeAdvocateEnrollment(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Opposing Firm / Chamber"
                      fullWidth
                      value={oppositeAdvocateFirm}
                      onChange={(e) => setOppositeAdvocateFirm(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Mobile Number"
                      fullWidth
                      value={oppositeAdvocateMobile}
                      onChange={(e) => setOppositeAdvocateMobile(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email Address"
                      type="email"
                      fullWidth
                      value={oppositeAdvocateEmail}
                      onChange={(e) => setOppositeAdvocateEmail(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Section 5: Court Room & Counsel Assignment */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GavelIcon color="primary" /> Court & Assigned Advocates
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Select Court Room"
                      required
                      fullWidth
                      value={courtId}
                      onChange={(e) => setCourtId(e.target.value)}
                    >
                      {courts.map((court) => (
                        <MenuItem key={court._id || court.id} value={court._id || court.id}>
                          {court.courtName} - {court.courtNumber}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Select Presiding Judge"
                      required
                      fullWidth
                      value={judgeId}
                      onChange={(e) => setJudgeId(e.target.value)}
                      disabled={!courtId}
                    >
                      {filteredJudges.map((j) => (
                        <MenuItem key={j._id || j.id} value={j._id || j.id}>
                          {j.judgeName}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Assigned Lead Advocate"
                      required
                      fullWidth
                      value={advocateId}
                      onChange={(e) => setAdvocateId(e.target.value)}
                      helperText={advocates.length === 0 ? "No advocates found. Please add advocates in Advocates section first." : ""}
                      error={advocates.length === 0}
                    >
                      {advocates.length === 0 ? (
                        <MenuItem disabled value="">
                          No advocates available in firm workspace
                        </MenuItem>
                      ) : (
                        advocates.map((a) => (
                          <MenuItem key={a._id || a.id} value={a._id || a.id}>
                            {a.fullName} ({a.practiceArea?.name || 'Advocate'})
                          </MenuItem>
                        ))
                      )}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Assigned Junior Advocate (Optional)"
                      fullWidth
                      value={juniorAdvocateId}
                      onChange={(e) => setJuniorAdvocateId(e.target.value)}
                    >
                      <MenuItem value="">None</MenuItem>
                      {advocates
                        .filter((a) => (a._id || a.id) !== advocateId)
                        .map((a) => (
                          <MenuItem key={a._id || a.id} value={a._id || a.id}>
                            {a.fullName}
                          </MenuItem>
                        ))}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Section 6: Notes & Observations */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700 }}>
                  Case Notes & Remarks
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Internal Notes (Firm eyes only)"
                      fullWidth
                      multiline
                      rows={3}
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Public Notes (Shared with Client)"
                      fullWidth
                      multiline
                      rows={3}
                      value={publicNotes}
                      onChange={(e) => setPublicNotes(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Remarks / Summary"
                      fullWidth
                      multiline
                      rows={2}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button size="large" variant="outlined" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button size="large" type="submit" variant="contained" startIcon={<SaveIcon />}>
              Save Case File
            </Button>
          </Grid>

        </Grid>
      </form >
    </Box >
  );
};

export default CaseForm;
