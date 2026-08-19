import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import GavelIcon from '@mui/icons-material/Gavel';
import EventIcon from '@mui/icons-material/Event';
import ScaleIcon from '@mui/icons-material/Scale';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import StatCard from '../../components/Common/StatCard.jsx';
import LoadingScreen from '../../components/Common/LoadingScreen.jsx';
import { API_BASE_URL } from '../../config/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/firm/dashboard`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingScreen message="Loading Dashboard..." />;

  const kpis = data?.kpis || {};
  const upcomingHearings = data?.upcomingHearings || [];
  const recentCases = data?.recentCases || [];

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

  return (
    <Box sx={{ py: 0.5 }}>
      {/* 1. Summary Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Cases"
            value={kpis.openCases || 0}
            icon={<GavelIcon />}
            color="#10B981"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Clients"
            value={kpis.totalClients || 0}
            icon={<PeopleIcon />}
            color="#38BDF8"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Today's Hearings"
            value={kpis.todayHearings || 0}
            icon={<EventIcon />}
            color="#F59E0B"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Advocates & Counsel"
            value={kpis.totalAdvocates || 0}
            icon={<ScaleIcon />}
            color="#A855F7"
          />
        </Grid>
      </Grid>

      {/* 2. Main Two-Column Layout */}
      <Grid container spacing={3}>
        {/* Left: Upcoming Court Hearings */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon sx={{ color: '#F59E0B', fontSize: 22 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem' }}>
                    Upcoming Court Hearings
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => navigate('/firm/hearings')}
                  endIcon={<ArrowForwardIcon fontSize="small" />}
                  sx={{ fontSize: '0.78rem', fontWeight: 700 }}
                >
                  View All
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {upcomingHearings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <AccessTimeIcon sx={{ fontSize: 44, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No upcoming court hearings scheduled.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>Date & Time</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>Case & Party</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>Purpose</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {upcomingHearings.map((h) => (
                        <TableRow
                          key={h.id}
                          hover
                          onClick={() => navigate('/firm/hearings')}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell sx={{ py: 1, whiteSpace: 'nowrap' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                              {new Date(h.hearingDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {h.hearingTime || '09:30 AM'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1, maxWidth: 220 }}>
                            <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.8rem' }}>
                              {h.case?.caseNumber || 'N/A'}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.primary"
                              sx={{
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontWeight: 600,
                              }}
                            >
                              {formatPartyName(h.case)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1, maxWidth: 180 }}>
                            <Typography
                              sx={{
                                fontSize: '0.8rem',
                                color: 'text.secondary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {h.purpose || '—'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Recent Cases */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GavelIcon sx={{ color: '#10B981', fontSize: 22 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem' }}>
                    Recent Case Files
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => navigate('/firm/cases')}
                  endIcon={<ArrowForwardIcon fontSize="small" />}
                  sx={{ fontSize: '0.78rem', fontWeight: 700 }}
                >
                  View All
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {recentCases.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <GavelIcon sx={{ fontSize: 44, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No cases created yet.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>Case Number</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>Party Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentCases.map((c) => (
                        <TableRow
                          key={c.id}
                          hover
                          onClick={() => navigate(`/firm/cases/${c.id}`)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell sx={{ py: 1 }}>
                            <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.82rem' }}>
                              {c.caseNumber}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1, maxWidth: 220 }}>
                            <Typography
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.82rem',
                                color: 'text.primary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {formatPartyName(c)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Client: {c.client?.fullName || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1 }}>
                            <Chip
                              size="small"
                              label={c.status || 'OPEN'}
                              color={c.status === 'OPEN' ? 'success' : 'default'}
                              sx={{ fontWeight: 700, fontSize: '0.7rem', height: 20 }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ py: 1 }}>
                            <Tooltip title="Open Case">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/firm/cases/${c.id}`);
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
