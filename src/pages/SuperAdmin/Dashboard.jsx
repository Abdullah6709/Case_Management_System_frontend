import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  ButtonGroup,
  TextField,
  InputAdornment,
  Avatar,
  Divider,
} from '@mui/material';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import GavelIcon from '@mui/icons-material/Gavel';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import EventIcon from '@mui/icons-material/Event';

// Charting imports
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

import { useSelector } from 'react-redux';
import { API_BASE_URL } from '../../config/api';
import StatCard from '../../components/Common/StatCard.jsx';
import LoadingScreen from '../../components/Common/LoadingScreen.jsx';

const SuperAdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'AUTH' | 'SYSTEM'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/superadmin/dashboard-stats`),
          axios.get(`${API_BASE_URL}/api/superadmin/activity-logs`),
        ]);
        setStats(statsRes.data);
        setLogs(logsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingScreen message="Loading Administrator Dashboard..." />;

  // Chart 1: Bar Chart comparing key platform metrics
  const isSkitAdminUser = user?.role === 'SKIT_ADMIN_USER';
  const barChartData = {
    labels: isSkitAdminUser
      ? ['Assigned Client Admins', 'Managed Clients', 'Active Cases', 'Today Hearings']
      : ['SKIT & Client Admins', 'Total Clients', 'Active Cases', 'Today Hearings'],
    datasets: [
      {
        label: 'Operational Count',
        data: [
          stats?.totalAdmins || 0,
          stats?.totalClients || 0,
          stats?.openCases || 0,
          stats?.todayHearings || 0,
        ],
        backgroundColor: [
          'rgba(168, 85, 247, 0.75)',  // Purple - Admins
          'rgba(56, 189, 248, 0.75)',  // Blue - Clients
          'rgba(234, 179, 8, 0.75)',   // Yellow - Active Cases
          'rgba(244, 63, 94, 0.75)',   // Rose - Today Hearings
        ],
        borderColor: [
          '#a855f7',
          '#38bdf8',
          '#eab308',
          '#f43f5e',
        ],
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.06)' },
      },
      x: {
        ticks: { color: '#94a3b8', font: { weight: '600' } },
        grid: { display: false },
      },
    },
  };

  // Chart 2: Doughnut Chart for Active Operations Overview
  const doughnutChartData = {
    labels: ['Active Cases', "Today's Hearings"],
    datasets: [
      {
        data: [stats?.openCases || 0, stats?.todayHearings || 0],
        backgroundColor: ['rgba(234, 179, 8, 0.85)', 'rgba(244, 63, 94, 0.85)'],
        borderColor: ['#eab308', '#f43f5e'],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { size: 12, weight: '600' },
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
      },
    },
    cutout: '70%',
  };

  // Filter Activity Logs
  const filteredLogs = logs.filter((log) => {
    const isAuthEvent = log.action === 'USER_LOGIN' || log.action === 'USER_LOGOUT' || log.action === 'USER_REGISTERED';

    if (filterType === 'AUTH' && !isAuthEvent) return false;
    if (filterType === 'SYSTEM' && isAuthEvent) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const emailMatch = log.user?.email?.toLowerCase().includes(q);
      const actionMatch = log.action?.toLowerCase().includes(q);
      const detailsMatch = log.details?.toLowerCase().includes(q);
      const ipMatch = log.ipAddress?.toLowerCase().includes(q);
      return emailMatch || actionMatch || detailsMatch || ipMatch;
    }

    return true;
  });

  // Helper for rendering action chip
  const renderActionChip = (action) => {
    switch (action) {
      case 'USER_LOGIN':
        return (
          <Chip
            size="small"
            icon={<LoginIcon style={{ fontSize: 14 }} />}
            label="USER LOGIN"
            color="success"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        );
      case 'USER_LOGOUT':
        return (
          <Chip
            size="small"
            icon={<LogoutIcon style={{ fontSize: 14 }} />}
            label="USER LOGOUT"
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        );
      case 'USER_REGISTERED':
        return (
          <Chip
            size="small"
            label="REGISTER"
            color="info"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        );
      default:
        return (
          <Chip
            size="small"
            label={action.replace(/_/g, ' ')}
            color="secondary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        );
    }
  };

  const isSkitAdmin = user?.role === 'SKIT_ADMIN_USER';

  return (
    <Box sx={{ py: 2 }}>


      {/* Metric Cards aligned with Role Hierarchy */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {!isSkitAdmin && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="SKIT Admins"
              value={stats?.totalSkitAdmins || 0}
              icon={<SupervisorAccountIcon />}
              color="#a855f7"
              gradient="radial-gradient(circle, rgba(168,85,247,0.2) 0%, rgba(0,0,0,0) 70%)"
            />
          </Grid>
        )}

        <Grid item xs={12} sm={6} md={isSkitAdmin ? 3 : 3}>
          <StatCard
            title={isSkitAdmin ? 'Assigned Client Admins' : 'Client Admins'}
            value={stats?.totalClientAdmins || 0}
            icon={<SupervisorAccountIcon />}
            color="#38bdf8"
            gradient="radial-gradient(circle, rgba(56,189,248,0.2) 0%, rgba(0,0,0,0) 70%)"
          />
        </Grid>

        {/* <Grid item xs={12} sm={6} md={isSkitAdmin ? 3 : 2.4}>
          <StatCard
            title="Managed Clients"
            value={stats?.totalClients || 0}
            icon={<PeopleIcon />}
            color="#10b981"
            gradient="radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(0,0,0,0) 70%)"
          />
        </Grid> */}

        <Grid item xs={12} sm={6} md={isSkitAdmin ? 3 : 3}>
          <StatCard
            title="Active Cases"
            value={stats?.openCases || 0}
            icon={<FolderOpenIcon />}
            color="#eab308"
            gradient="radial-gradient(circle, rgba(234,179,8,0.2) 0%, rgba(0,0,0,0) 70%)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={isSkitAdmin ? 3 : 3}>
          <StatCard
            title="Today's Hearings"
            value={stats?.todayHearings || 0}
            icon={<EventIcon />}
            color="#f43f5e"
            gradient="radial-gradient(circle, rgba(244,63,94,0.2) 0%, rgba(0,0,0,0) 70%)"
          />
        </Grid>
      </Grid>

      {/* Graphical Visualizations */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Bar Chart: Key Platform Metrics */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '380px' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Key Metrics Comparison
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Live System Overview
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1, position: 'relative', minHeight: 0 }}>
                <Bar data={barChartData} options={barChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Doughnut Chart: Case Status Breakdown */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '380px' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Case Status Distribution
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active vs Closed
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1, position: 'relative', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Activity Logs (Tracks Login and Logout Times) */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              {/* Header & Controls */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon color="primary" sx={{ fontSize: 28 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      System Activity Logs
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Audit trail tracking user login/logout times and administrative actions.
                    </Typography>
                  </Box>
                </Box>

                {/* Filter and Search */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <ButtonGroup size="small" variant="outlined">
                    <Button
                      variant={filterType === 'ALL' ? 'contained' : 'outlined'}
                      onClick={() => setFilterType('ALL')}
                    >
                      All Logs
                    </Button>
                    <Button
                      variant={filterType === 'AUTH' ? 'contained' : 'outlined'}
                      onClick={() => setFilterType('AUTH')}
                      color="success"
                    >
                      Login / Logout Only
                    </Button>
                    <Button
                      variant={filterType === 'SYSTEM' ? 'contained' : 'outlined'}
                      onClick={() => setFilterType('SYSTEM')}
                    >
                      System Actions
                    </Button>
                  </ButtonGroup>

                  <TextField
                    size="small"
                    placeholder="Search by user or action..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: 220 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Logs Table */}
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 420, overflowY: 'auto' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>User / Email</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Event / Action</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>IP Address</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No activity logs found matching the filter.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => {
                        const dateObj = new Date(log.createdAt);
                        const formattedDate = dateObj.toLocaleDateString();
                        const formattedTime = dateObj.toLocaleTimeString();

                        return (
                          <TableRow key={log.id || log._id} hover>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {formattedTime}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formattedDate}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {log.user?.email || 'System / Guest'}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Chip
                                size="small"
                                label={log.user?.role?.name || 'SYSTEM'}
                                variant="outlined"
                                color="default"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </TableCell>

                            <TableCell>
                              {renderActionChip(log.action)}
                            </TableCell>

                            <TableCell sx={{ maxWidth: 300 }}>
                              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                {log.details}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                {log.ipAddress || '127.0.0.1'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SuperAdminDashboard;
