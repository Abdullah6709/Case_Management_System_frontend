import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import DataTable from '../../../components/Common/DataTable.jsx';
import LoadingScreen from '../../../components/Common/LoadingScreen.jsx';

const CaseList = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/firm/cases?limit=200`);
      setCases(response.data.cases);
    } catch (err) {
      console.error('Error fetching cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this case file?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/firm/cases/${id}`);
      fetchCases();
    } catch (err) {
      console.error('Error deleting case:', err);
      alert(err.response?.data?.message || 'Failed to delete case');
    }
  };

  const formatPartyName = (row) => {
    const ourParty = (!row.ourPartyName || /^[0-9a-fA-F-]{24,36}$/.test(row.ourPartyName))
      ? (row.client?.fullName || row.client?.companyOrAdvocate || '')
      : row.ourPartyName;
    const oppParty = row.oppPartyName || row.oppositePartyName || '';

    if (ourParty && oppParty) {
      return `${ourParty} vs. ${oppParty}`;
    }
    if (ourParty) return ourParty;
    if (oppParty) return `vs. ${oppParty}`;
    return row.caseTitle || '—';
  };

  const formattedCases = cases.map((item) => ({
    ...item,
    partyName: formatPartyName(item),
  }));

  const columns = [
    {
      id: 'partyName',
      label: 'Party Name',
      render: (row) => row.partyName || formatPartyName(row),
    },
    { id: 'caseNumber', label: 'Case Number' },

    { id: 'caseType', label: 'Type' },
    {
      id: 'client',
      label: 'Client',
      render: (row) => row.client?.fullName || '—',
    },
    {
      id: 'advocate',
      label: 'Advocate',
      render: (row) => row.advocate?.fullName || '—',
    },
  ];

  if (loading) return <LoadingScreen message="Loading Cases Registry..." />;

  return (
    <Box sx={{ py: 0.5 }}>
      <DataTable
        title="Cases"
        headerAction={
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => navigate('/firm/cases/new')}
            sx={{ height: 34, whiteSpace: 'nowrap' }}
          >
            New Case
          </Button>
        }
        columns={columns}
        rows={formattedCases}
        searchPlaceholder="Search by party name, case number..."
        searchField="partyName"
        onRowClick={(row) => navigate(`/firm/cases/${row.id}`)}
        actions={(row) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/firm/cases/${row.id}/edit`); }} color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      />
    </Box>
  );
};

export default CaseList;
