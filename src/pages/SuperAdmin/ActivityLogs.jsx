import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography } from '@mui/material';

import DataTable from '../../components/Common/DataTable.jsx';
import LoadingScreen from '../../components/Common/LoadingScreen.jsx';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/superadmin/activity-logs');
        setLogs(response.data);
      } catch (err) {
        console.error('Error fetching activity logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const columns = [
    {
      id: 'createdAt',
      label: 'Date & Time',
      render: (row) => new Date(row.createdAt).toLocaleString(),
    },
    { id: 'action', label: 'Action Taken' },
    { id: 'details', label: 'Description/Details' },
    {
      id: 'user',
      label: 'User Account',
      render: (row) => row.user ? `${row.user.email} (${row.user.role?.name || 'N/A'})` : 'System',
    },
    { id: 'ipAddress', label: 'IP Address', render: (row) => row.ipAddress || 'local/unknown' },
  ];

  if (loading) return <LoadingScreen message="Loading System Activity Logs..." />;

  return (
    <Box sx={{ py: 0.5 }}>
      <DataTable
        title="System Activity Audit Logs"
        columns={columns}
        rows={logs}
        searchPlaceholder="Search audit log actions..."
        searchField="action"
      />
    </Box>
  );
};

export default ActivityLogs;
