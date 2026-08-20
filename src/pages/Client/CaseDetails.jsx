import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
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
  List,
  ListItem,
  ListItemText,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoadingScreen from '../../components/Common/LoadingScreen.jsx';
import DocumentPreviewModal from '../../components/Common/DocumentPreviewModal.jsx';
import { API_BASE_URL } from '../../config/api';

const ClientCaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [caseDetails, setCaseDetails] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  // Document Preview States
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
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
    loadCaseDetails();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) return <LoadingScreen message="Accessing Case File..." />;
  if (!caseDetails) return <Typography>Error loading case details</Typography>;

  return (
    <Box sx={{ py: 2 }}>
      {/* Header bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/client')}
        >
          Back to Dashboard
        </Button>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {caseDetails.caseTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Case No: {caseDetails.caseNumber} | Category: {caseDetails.caseCategory}
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Case Overview" />
          <Tab label="Opposing Counsel" />
          <Tab label="Hearings History" />
          <Tab label="Case Documents" />
          <Tab label="Case Timeline" />
          <Tab label="My Observations" />
        </Tabs>

        <CardContent sx={{ p: 4 }}>
          {/* Tab 0: Case Overview */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>BASIC INFORMATION</Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="body2"><b>Filing Date:</b> {new Date(caseDetails.filingDate).toLocaleDateString()}</Typography>
                  <Typography variant="body2"><b>Registration Date:</b> {new Date(caseDetails.registrationDate).toLocaleDateString()}</Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                    <Chip label={`Priority: ${caseDetails.priority}`} color={caseDetails.priority === 'HIGH' ? 'error' : 'default'} size="small" />
                    <Chip label={`Status: ${caseDetails.status}`} color={caseDetails.status === 'OPEN' ? 'success' : 'default'} size="small" />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>COURT ROOM & BENCH</Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="body2"><b>Court Name:</b> {caseDetails.court?.courtName}</Typography>
                  <Typography variant="body2"><b>Presiding Room:</b> {caseDetails.court?.courtNumber} ({caseDetails.court?.bench})</Typography>
                  <Typography variant="body2"><b>Presiding Judge:</b> {caseDetails.judge?.judgeName}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>MY REPRESENTATIVE ADVOCATES</Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2"><b>Lead Counsel:</b> {caseDetails.advocate?.fullName} (Practice: {caseDetails.advocate?.practiceArea?.name})</Typography>
                  <Typography variant="body2"><b>Contact Email:</b> {caseDetails.advocate?.email} | <b>Mobile:</b> {caseDetails.advocate?.mobile}</Typography>
                  {caseDetails.juniorAdvocate && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}><b>Junior Counsel:</b> {caseDetails.juniorAdvocate.fullName}</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}

          {/* Tab 1: Opposing Counsel */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>RESPONDENT (OPPOSITE PARTY)</Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="body2"><b>Respondent Name:</b> {caseDetails.oppositePartyName}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>OPPOSING COUNSEL</Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="body2"><b>Opposing Advocate:</b> {caseDetails.oppositeAdvocateName || '—'}</Typography>
                  <Typography variant="body2"><b>Chamber/Firm:</b> {caseDetails.oppositeAdvocateFirm || '—'}</Typography>
                </Box>
              </Grid>
            </Grid>
          )}

          {/* Tab 2: Hearings */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Hearings History Ledger</Typography>
              {caseDetails.hearings.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No hearings scheduled for this case.</Typography>
              ) : (
                <List>
                  {caseDetails.hearings.map((h, idx) => (
                    <React.Fragment key={h.id}>
                      <ListItem sx={{ py: 2 }}>
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
                              <b>Hearing Purpose:</b> {h.purpose}
                              {h.result && (
                                <>
                                  <br />
                                  <b>Hearing Outcome:</b> {h.result}
                                </>
                              )}
                              {h.nextHearingDate && (
                                <>
                                  <br />
                                  <b>Next Session scheduled:</b> {new Date(h.nextHearingDate).toLocaleDateString()}
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
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Available Case Documents</Typography>
              {caseDetails.documents.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No documents uploaded yet.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {caseDetails.documents.map((doc) => (
                    <Grid item xs={12} sm={4} md={4} key={doc.id}>
                      <Card variant="outlined" sx={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                        <CardContent sx={{ p: 2.5 }}>
                          <Chip label={doc.category} size="small" color="secondary" sx={{ mb: 1.5 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, wordBreak: 'break-all' }}>
                            {doc.fileName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            Uploaded Date: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </Typography>

                          <Button
                            size="small"
                            variant="outlined"
                            fullWidth
                            startIcon={<VisibilityIcon />}
                            onClick={() => {
                              setPreviewDoc(doc);
                              setPreviewOpen(true);
                            }}
                            sx={{ mt: 2 }}
                          >
                            Preview & Download
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Tab 4: Timeline */}
          {tabValue === 4 && (
            <Box sx={{ maxWidth: 600, mx: 'auto', py: 2 }}>
              <Stepper orientation="vertical" activeStep={timeline.length}>
                {timeline.map((node, index) => (
                  <Step key={node.id} active={true} completed={true}>
                    <StepLabel StepIconProps={{ icon: index + 1 }}>
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

          {/* Tab 5: Observation Notes */}
          {tabValue === 5 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" color="secondary" sx={{ mb: 2, fontWeight: 700 }}>Advocate Shared Notes</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
                      {caseDetails.publicNotes || 'No notes shared by counsel.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Judgment Summary Copy / Remarks</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
                      {caseDetails.remarks || 'No remarks recorded.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
      {/* Document Preview Modal */}
      <DocumentPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        document={previewDoc}
      />
    </Box>
  );
};

export default ClientCaseDetails;
