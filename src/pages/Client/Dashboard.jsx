import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import ScaleIcon from '@mui/icons-material/Scale';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import StatCard from '../../components/Common/StatCard.jsx';
import DataTable from '../../components/Common/DataTable.jsx';
import LoadingScreen from '../../components/Common/LoadingScreen.jsx';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/firm/dashboard');
      setData(response.data);
    } catch (err) {
      console.error('Error loading client case center dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingScreen message="Loading Case Center..." />;

  const kpis = data?.kpis || {};
  const cases = data?.cases || [];
  const hearings = data?.hearings || [];
  const nextHearing = data?.nextHearing || (hearings.length > 0 ? hearings[0] : null);
  const assignedAdvocates = data?.assignedAdvocates || [];

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

  // Find next hearing for a specific case
  const getCaseNextHearing = (caseId) => {
    const cid = (caseId || '').toString();
    const caseHearings = hearings.filter((h) => {
      const hCid = (h.case?.id || h.case?._id || h.caseId?.id || h.caseId?._id || h.caseId || '').toString();
      return hCid === cid && h.status === 'SCHEDULED';
    });

    if (caseHearings.length === 0) return null;
    caseHearings.sort((a, b) => new Date(a.hearingDate) - new Date(b.hearingDate));
    return caseHearings[0].hearingDate;
  };

  // Prepare table rows
  const tableRows = cases
    .filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      return true;
    })
    .map((c) => {
      const cid = (c.id || c._id).toString();
      const nextDate = getCaseNextHearing(cid);

      return {
        ...c,
        id: cid,
        partyName: formatPartyName(c),
        courtName: c.court?.courtName || 'District Court',
        advocateName: c.advocate?.fullName || 'Assigned Counsel',
        nextHearingFormatted: nextDate ? new Date(nextDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
      };
    });

  const columns = [
    {
      id: 'caseNumber',
      label: 'Case Number',
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            fontSize: '0.84rem',
            letterSpacing: '0.02em',
          }}
        >
          {row.caseNumber}
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
            fontSize: '0.84rem',
            color: 'text.primary',
            maxWidth: 280,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {row.partyName}
        </Typography>
      ),
    },
    {
      id: 'caseType',
      label: 'Type',
      render: (row) => (
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', fontWeight: 600 }}>
          {row.caseType || row.caseCategory || 'Litigation'}
        </Typography>
      ),
    },
    {
      id: 'courtName',
      label: 'Court',
      render: (row) => (
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
          {row.courtName}
        </Typography>
      ),
    },
    {
      id: 'advocateName',
      label: 'Advocate',
      render: (row) => (
        <Typography sx={{ fontSize: '0.82rem', color: 'text.primary', fontWeight: 600 }}>
          {row.advocateName}
        </Typography>
      ),
    },
    {
      id: 'nextHearingFormatted',
      label: 'Next Hearing',
      render: (row) => (
        <Typography sx={{ fontSize: '0.82rem', color: row.nextHearingFormatted !== '—' ? 'info.main' : 'text.secondary', fontWeight: 600 }}>
          {row.nextHearingFormatted}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => (
        <Chip
          size="small"
          label={row.status || 'OPEN'}
          color={row.status === 'OPEN' ? 'success' : row.status === 'CLOSED' ? 'default' : 'primary'}
          sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ py: 0.5 }}>
      {/* 1. Summary Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="My Active Cases"
            value={kpis.openCases ?? cases.length}
            icon={<GavelIcon />}
            color="#10B981"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Scheduled Hearings"
            value={kpis.upcomingHearings ?? hearings.length}
            icon={<EventIcon />}
            color="#F59E0B"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Vault Documents"
            value={kpis.recentDocsCount || 0}
            icon={<DescriptionIcon />}
            color="#38BDF8"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Assigned Counsel"
            value={assignedAdvocates.length || (cases.length > 0 && cases[0].advocate ? 1 : 0)}
            icon={<ScaleIcon />}
            color="#A855F7"
          />
        </Grid>
      </Grid>

      {/* 2. Upcoming Hearing Alert Card (If any) */}
      {nextHearing && nextHearing.hearingDate && (
        <Alert
          severity="info"
          icon={<EventIcon sx={{ color: '#F59E0B' }} />}
          action={
            <Button
              size="small"
              color="inherit"
              endIcon={<ArrowForwardIcon />}
              onClick={() => {
                const targetCid = nextHearing.case?.id || nextHearing.case?._id || nextHearing.caseId?.id || nextHearing.caseId?._id || nextHearing.caseId || (cases.length > 0 ? (cases[0].id || cases[0]._id) : null);
                if (targetCid) navigate(`/client/cases/${targetCid}`);
              }}
              sx={{ fontWeight: 700, textTransform: 'none', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              View Case
            </Button>
          }
          sx={{
            mb: 2.5,
            bgcolor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 2,
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#F59E0B' }}>
              NEXT HEARING:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {new Date(nextHearing.hearingDate).toLocaleDateString()} {nextHearing.hearingTime ? `at ${nextHearing.hearingTime}` : ''}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • Case: <b>{nextHearing.case?.caseNumber || 'Case Proceeding'}</b> — {formatPartyName(nextHearing.case)} ({nextHearing.purpose || 'Scheduled Hearing'})
            </Typography>
          </Box>
        </Alert>
      )}

      {/* 3. My Cases Table */}
      <DataTable
        title="My Cases"
        columns={columns}
        rows={tableRows}
        searchPlaceholder="Search by case number, party name, advocate..."
        searchField="partyName"
        onRowClick={(row) => navigate(`/client/cases/${row.id}`)}
        headerAction={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                width: 140,
                '& .MuiInputBase-root': { height: 34, fontSize: '0.8rem' },
              }}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="OPEN">Open Cases</MenuItem>
              <MenuItem value="CLOSED">Closed Cases</MenuItem>
            </TextField>
          </Box>
        }
        actions={(row) => (
          <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'flex-end', alignItems: 'center' }}>
            <Tooltip title="View Case Details">
              <IconButton
                size="small"
                color="info"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/client/cases/${row.id}`);
                }}
                sx={{
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: 1,
                  p: 0.6,
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      />
    </Box>
  );
};

export default ClientDashboard;
