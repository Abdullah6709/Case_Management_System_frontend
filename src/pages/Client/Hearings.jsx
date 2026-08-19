import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GavelIcon from '@mui/icons-material/Gavel';
import CloseIcon from '@mui/icons-material/Close';

import DataTable from '../../components/Common/DataTable.jsx';
import LoadingScreen from '../../components/Common/LoadingScreen.jsx';

const ClientHearings = () => {
  const navigate = useNavigate();
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [tillDate, setTillDate] = useState('');

  // Details Modal
  const [selectedHearing, setSelectedHearing] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchHearings = async () => {
    try {
      let url = `${API_BASE_URL}/api/firm/hearings?`;
      if (fromDate) url += `fromDate=${fromDate}&`;
      if (tillDate) url += `tillDate=${tillDate}&`;

      const response = await axios.get(url);
      setHearings(response.data || []);
    } catch (err) {
      console.error('Error fetching client hearings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHearings();
  }, [fromDate, tillDate]);

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

  const getCaseId = (item) => {
    if (!item) return null;
    if (typeof item === 'string') return item;
    if (item.case) {
      if (typeof item.case === 'string') return item.case;
      if (item.case.id) return item.case.id.toString();
      if (item.case._id) return item.case._id.toString();
    }
    if (item.caseId) {
      if (typeof item.caseId === 'string') return item.caseId;
      if (item.caseId.id) return item.caseId.id.toString();
      if (item.caseId._id) return item.caseId._id.toString();
    }
    if (item.id) return item.id.toString();
    if (item._id) return item._id.toString();
    return null;
  };

  const tableRows = useMemo(() => {
    return hearings
      .filter((h) => {
        if (statusFilter !== 'ALL' && h.status !== statusFilter) return false;
        return true;
      })
      .map((h) => {
        const caseObj = h.case || {};
        const caseId = getCaseId(h);
        const partyName = formatPartyName(caseObj);
        const hDate = new Date(h.hearingDate);
        const dateFormatted = !isNaN(hDate)
          ? hDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—';

        return {
          ...h,
          id: h.id || h._id,
          caseId,
          caseNumber: caseObj.caseNumber || 'N/A',
          partyName,
          courtName: caseObj.court?.courtName || caseObj.courtName || 'Court Bench',
          dateFormatted,
          timeFormatted: h.hearingTime || '—',
          resultFormatted: h.result || 'Pending',
          nextHearingFormatted: h.nextHearingDate
            ? new Date(h.nextHearingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—',
        };
      });
  }, [hearings, statusFilter]);

  const handleOpenDetails = (hearing) => {
    setSelectedHearing(hearing);
    setDetailsOpen(true);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return <Chip label="Scheduled" color="primary" size="small" sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }} />;
      case 'COMPLETED':
        return <Chip label="Completed" color="success" size="small" sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }} />;
      case 'ADJOURNED':
        return <Chip label="Adjourned" color="warning" size="small" sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }} />;
      case 'CANCELLED':
        return <Chip label="Cancelled" color="error" size="small" sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }} />;
      default:
        return <Chip label={status || 'Scheduled'} size="small" sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }} />;
    }
  };

  const columns = [
    {
      id: 'dateFormatted',
      label: 'Hearing Date & Time',
      render: (row) => (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: 'text.primary' }}>
            {row.dateFormatted}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {row.timeFormatted}
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
            fontSize: '0.82rem',
            color: 'text.primary',
            maxWidth: 240,
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
      id: 'courtName',
      label: 'Court',
      render: (row) => (
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', fontWeight: 600 }}>
          {row.courtName}
        </Typography>
      ),
    },
    {
      id: 'purpose',
      label: 'Purpose',
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
      id: 'resultFormatted',
      label: 'Proceeding Outcome',
      render: (row) => (
        <Typography
          sx={{
            fontSize: '0.82rem',
            color: row.result ? 'success.main' : 'text.secondary',
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: row.result ? 700 : 500,
          }}
        >
          {row.resultFormatted}
        </Typography>
      ),
    },
    {
      id: 'nextHearingFormatted',
      label: 'Next Date',
      render: (row) => (
        <Typography sx={{ fontSize: '0.82rem', color: row.nextHearingDate ? 'info.main' : 'text.secondary', fontWeight: 600 }}>
          {row.nextHearingFormatted}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => getStatusChip(row.status),
    },
  ];

  if (loading) return <LoadingScreen message="Loading Hearings Ledger..." />;

  return (
    <Box sx={{ py: 0.5 }}>
      <DataTable
        title="Hearings & Proceedings"
        columns={columns}
        rows={tableRows}
        searchPlaceholder="Search by case, party, purpose, court..."
        searchField="partyName"
        onRowClick={(row) => handleOpenDetails(row)}
        headerAction={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <TextField
              label="From"
              type="date"
              size="small"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true, style: { fontSize: '0.78rem' } }}
              sx={{
                width: 135,
                '& .MuiInputBase-root': { height: 34, fontSize: '0.8rem' },
              }}
            />

            <TextField
              label="Till"
              type="date"
              size="small"
              value={tillDate}
              onChange={(e) => setTillDate(e.target.value)}
              InputLabelProps={{ shrink: true, style: { fontSize: '0.78rem' } }}
              sx={{
                width: 135,
                '& .MuiInputBase-root': { height: 34, fontSize: '0.8rem' },
              }}
            />

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
              <MenuItem value="SCHEDULED">Scheduled</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="ADJOURNED">Adjourned</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </TextField>
          </Box>
        }
        actions={(row) => (
          <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'flex-end', alignItems: 'center' }}>
            <Tooltip title="View Hearing Details">
              <IconButton
                size="small"
                color="info"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDetails(row);
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

      {/* HEARING DETAILS MODAL */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GavelIcon sx={{ color: '#D4AF37' }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Hearing Proceedings Details
            </Typography>
          </Box>
          <IconButton onClick={() => setDetailsOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ py: 2.5 }}>
          {selectedHearing && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Case Badge & Title */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Chip
                    label={`Case: ${selectedHearing.caseNumber}`}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 700 }}
                  />
                  {getStatusChip(selectedHearing.status)}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {selectedHearing.partyName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Court: <b>{selectedHearing.courtName}</b>
                </Typography>
              </Box>

              <Divider />

              {/* Date & Time */}
              <Box sx={{ display: 'flex', gap: 3, bgcolor: 'rgba(212, 175, 55, 0.05)', p: 1.5, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                      HEARING DATE
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {selectedHearing.dateFormatted}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                      SCHEDULED TIME
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {selectedHearing.timeFormatted}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Purpose */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                  HEARING PURPOSE / BENCH PROCEEDINGS
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', bgcolor: 'rgba(255,255,255,0.03)', p: 1.5, borderRadius: 1.5 }}>
                  {selectedHearing.purpose || 'Scheduled court hearing appearance'}
                </Typography>
              </Box>

              {/* Outcome Notes */}
              {selectedHearing.result && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                    PROCEEDING OUTCOME / ORDER NOTES
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main', bgcolor: 'rgba(16, 185, 129, 0.08)', p: 1.5, borderRadius: 1.5, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    {selectedHearing.result}
                  </Typography>
                </Box>
              )}

              {/* Next Hearing */}
              {selectedHearing.nextHearingDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    NEXT HEARING DATE:
                  </Typography>
                  <Chip
                    label={selectedHearing.nextHearingFormatted}
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          {selectedHearing?.caseId && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setDetailsOpen(false);
                navigate(`/client/cases/${selectedHearing.caseId}`);
              }}
              sx={{ fontWeight: 700 }}
            >
              View Full Case
            </Button>
          )}
          <Button onClick={() => setDetailsOpen(false)} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientHearings;
