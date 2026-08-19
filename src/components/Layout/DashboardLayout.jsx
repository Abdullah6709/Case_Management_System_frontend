import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Chip,
  Badge,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

// Role Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import GavelIcon from '@mui/icons-material/Gavel';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import ScaleIcon from '@mui/icons-material/Scale';
import MapIcon from '@mui/icons-material/Map';
import TopicIcon from '@mui/icons-material/Topic';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';

import { logoutUser } from '../../store/slices/authSlice.js';
import { toggleTheme } from '../../store/slices/themeSlice.js';

const drawerWidth = 260;

const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (typeof dateStr === 'string') {
    const clean = dateStr.split('T')[0];
    const parts = clean.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0])) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
};

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);

  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  // Real-time ticking clock & live sync simulation state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Periodic automatic real-time sync simulation & notification refresh (every 20s)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      setIsSyncing(true);
      if (user) {
        fetchUpcomingHearings();
      }
      setTimeout(() => {
        setLastSyncTime(new Date());
        setIsSyncing(false);
      }, 800);
    }, 20000);
    return () => clearInterval(syncInterval);
  }, [user]);

  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [upcomingHearings, setUpcomingHearings] = useState([]);

  const fetchUpcomingHearings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/firm/hearings`);
      const data = res.data || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = data.filter((h) => {
        if (!h.hearingDate) return false;
        const hDate = parseLocalDate(h.hearingDate);
        return hDate >= today && h.status !== 'COMPLETED' && h.status !== 'CANCELLED';
      });

      upcoming.sort((a, b) => parseLocalDate(a.hearingDate) - parseLocalDate(b.hearingDate));
      setUpcomingHearings(upcoming);
    } catch (err) {
      console.warn('Error fetching upcoming hearings for notifications:', err?.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUpcomingHearings();
    }
  }, [user]);

  const triggerManualSync = () => {
    setIsSyncing(true);
    fetchUpcomingHearings();
    setTimeout(() => {
      setLastSyncTime(new Date());
      setIsSyncing(false);
    }, 600);
  };

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleProfileNavigate = () => {
    handleProfileMenuClose();
    if (user?.role === 'CLIENT_ADMIN' || user?.role === 'CLIENT_USER') {
      navigate('/client/profile');
    } else {
      navigate('/superadmin/settings');
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'SKIT_SUPER_ADMIN':
        return 'Skit Super Admin';
      case 'SKIT_ADMIN_USER':
        return 'Skit Admin User';
      case 'CLIENT_ADMIN':
        return 'Law Firm Admin';
      case 'CLIENT_USER':
        return 'Client User';
      default:
        return 'Legal User';
    }
  };

  // Define sidebar items based on role
  const getSidebarItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'SKIT_SUPER_ADMIN':
      case 'SKIT_ADMIN_USER':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/superadmin' },
          { text: 'Law Firms', icon: <BusinessIcon />, path: '/superadmin/firms' },
          { text: 'Platform Admins', icon: <SupervisorAccountIcon />, path: '/superadmin/admins' },
          { text: 'Courts Master', icon: <GavelIcon />, path: '/superadmin/courts' },
          { text: 'Judges Master', icon: <ScaleIcon />, path: '/superadmin/judges' },
          { text: 'Practice Areas', icon: <WorkIcon />, path: '/superadmin/practice-areas' },
          { text: 'Matters Master', icon: <TopicIcon />, path: '/superadmin/matters' },
          { text: 'State & City Master', icon: <MapIcon />, path: '/superadmin/states' },
          { text: 'System Settings', icon: <SettingsIcon />, path: '/superadmin/settings' },
          { text: 'Activity Logs', icon: <HistoryIcon />, path: '/superadmin/logs' },
        ];
      case 'CLIENT_ADMIN':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/firm' },
          { text: 'Clients', icon: <PeopleIcon />, path: '/firm/clients' },
          { text: 'Cases', icon: <GavelIcon />, path: '/firm/cases' },
          { text: 'Hearings', icon: <EventIcon />, path: '/firm/hearings' },
          { text: 'Documents', icon: <DescriptionIcon />, path: '/firm/documents' },
          { text: 'Calendar', icon: <EventIcon />, path: '/firm/calendar' },
          { text: 'Reports', icon: <AssessmentIcon />, path: '/firm/reports' },
        ];
      case 'CLIENT_USER':
        return [
          { text: 'My Case Center', icon: <DashboardIcon />, path: '/client' },
          { text: 'Hearings', icon: <EventIcon />, path: '/client/hearings' },
          { text: 'Document Vault', icon: <FolderSpecialIcon />, path: '/client/documents' },
          { text: 'My Profile', icon: <AccountCircleIcon />, path: '/client/profile' },
        ];
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', transition: 'background-color 0.2s' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
          ml: open ? `${drawerWidth}px` : 0,
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, fontFamily: '"Cinzel", serif', letterSpacing: '0.02em' }}>
              {(user?.role === 'SKIT_SUPER_ADMIN' || user?.role === 'SKIT_ADMIN_USER')
                ? ' '
                : user?.lawFirmName || ' '}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Live Ticking Court Clock */}
            <Box
              sx={{
                display: { xs: 'none', lg: 'flex' },
                alignItems: 'center',
                gap: 0.75,
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                border: '1px solid rgba(197, 155, 39, 0.2)',
              }}
            >
              <AccessTimeIcon sx={{ color: 'secondary.main', fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.primary' }}>
                {currentTime.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })} | {currentTime.toLocaleTimeString()}
              </Typography>
            </Box>

            {/* Manual Sync Trigger */}
            <Tooltip title="Trigger Real-time Data Refresh">
              <IconButton onClick={triggerManualSync} color="inherit" size="small">
                <RefreshIcon sx={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
              </IconButton>
            </Tooltip>

            {/* Theme Toggle */}
            <Tooltip title="Toggle Theme">
              <IconButton onClick={() => dispatch(toggleTheme())} color="inherit" size="small">
                {mode === 'dark' ? <LightModeIcon sx={{ color: '#F59E0B' }} /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {/* Upcoming Hearings Notification Bell */}
            <Tooltip title="Upcoming Court Hearings">
              <IconButton onClick={(e) => setNotifAnchorEl(e.currentTarget)} color="inherit" size="small">
                <Badge badgeContent={upcomingHearings.length} color="error" max={99}>
                  <NotificationsActiveIcon sx={{ color: upcomingHearings.length > 0 ? '#F59E0B' : 'inherit' }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Notifications Menu */}
            <Menu
              anchorEl={notifAnchorEl}
              open={Boolean(notifAnchorEl)}
              onClose={() => setNotifAnchorEl(null)}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  width: 360,
                  maxHeight: 480,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(197, 155, 39, 0.3)',
                  borderRadius: 3,
                  overflow: 'hidden',
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(212, 175, 55, 0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsActiveIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Upcoming Hearings
                  </Typography>
                </Box>
                <Chip label={`${upcomingHearings.length} Scheduled`} size="small" color="secondary" sx={{ fontWeight: 800, fontSize: '0.72rem' }} />
              </Box>

              <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
                {upcomingHearings.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <EventIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      No upcoming hearings scheduled.
                    </Typography>
                  </Box>
                ) : (
                  upcomingHearings.map((h) => {
                    const hDate = parseLocalDate(h.hearingDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const diffTime = hDate.getTime() - today.getTime();
                    const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));

                    const formattedDate = hDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                    const cid = h.case?.id || h.case?._id || (typeof h.caseId === 'string' ? h.caseId : h.caseId?.id || h.caseId?._id);

                    const dayLabel = daysDiff === 0 ? 'TODAY' : daysDiff === 1 ? 'TOMORROW' : daysDiff < 0 ? 'OVERDUE' : `In ${daysDiff} days`;

                    return (
                      <MenuItem
                        key={h.id || h._id}
                        onClick={() => {
                          setNotifAnchorEl(null);
                          if (user?.role === 'CLIENT_USER') {
                            if (cid) navigate(`/client/cases/${cid}`);
                            else navigate('/client/hearings');
                          } else if (user?.role === 'CLIENT_ADMIN') {
                            if (cid) navigate(`/firm/cases/${cid}`);
                            else navigate('/firm/hearings');
                          } else {
                            navigate('/superadmin');
                          }
                        }}
                        sx={{
                          py: 1.5,
                          px: 2,
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: 0.5,
                          '&:hover': {
                            bgcolor: 'rgba(212, 175, 55, 0.08)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38BDF8', fontSize: '0.85rem' }}>
                            {h.case?.caseNumber || 'Hearing Entry'}
                          </Typography>
                          <Chip
                            label={dayLabel}
                            size="small"
                            color={daysDiff <= 1 ? 'error' : 'info'}
                            sx={{ fontWeight: 800, fontSize: '0.65rem', height: 18 }}
                          />
                        </Box>

                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.84rem', color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                          {h.case?.caseTitle || h.purpose || 'Court appearance'}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                          <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 700 }}>
                            🗓️ {formattedDate} at {h.hearingTime || '09:30 AM'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            • {h.purpose || 'Scheduled Hearing'}
                          </Typography>
                        </Box>
                      </MenuItem>
                    );
                  })
                )}
              </Box>

              <Divider />
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Button
                  size="small"
                  color="secondary"
                  fullWidth
                  onClick={() => {
                    setNotifAnchorEl(null);
                    if (user?.role === 'CLIENT_USER') {
                      navigate('/client/hearings');
                    } else if (user?.role === 'CLIENT_ADMIN') {
                      navigate('/firm/hearings');
                    } else {
                      navigate('/superadmin');
                    }
                  }}
                  sx={{ fontWeight: 700 }}
                >
                  View All Hearing Schedules
                </Button>
              </Box>
            </Menu>

            {/* Profile Avatar */}
            <Tooltip title="Account Settings">
              <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0, ml: 0.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main', border: '2px solid #C59B27', color: 'white', width: 36, height: 36, fontWeight: 700 }}>
                  {user?.email?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                  border: '1px solid rgba(197, 155, 39, 0.2)',
                  borderRadius: 3,
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {user?.email}
                </Typography>
                <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 700 }}>
                  {getRoleLabel(user?.role)}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleProfileNavigate}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                </ListItemIcon>
                Profile & Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
                </ListItemIcon>
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : 0,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 0,
            overflowX: 'hidden',
            boxSizing: 'border-box',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          },
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: [2],
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, overflow: 'hidden' }}>
            <ScaleIcon sx={{ color: '#D4AF37', fontSize: 28, flexShrink: 0 }} />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
                fontSize: '0.95rem',
                color: '#FFFFFF',
                letterSpacing: '0.03em',
              }}
            >
              {getRoleLabel(user?.role)}
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerToggle} sx={{ color: '#FFFFFF' }}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        <List sx={{ px: 1.5, mt: 1 }}>
          {sidebarItems.map((item) => {
            const isBaseDashboard = item.path === '/firm' || item.path === '/superadmin' || item.path === '/client';
            const isSelected = isBaseDashboard
              ? location.pathname === item.path
              : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.75 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={isSelected}
                  sx={{
                    minHeight: 46,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2,
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    color: isSelected ? '#000000' : 'rgba(255,255,255,0.85)',
                    '&.Mui-selected': {
                      backgroundColor: '#D4AF37',
                      fontWeight: 800,
                      color: '#000000',
                      '& .MuiListItemIcon-root': {
                        color: '#000000',
                      },
                      '&:hover': {
                        backgroundColor: '#F59E0B',
                      }
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(212, 175, 55, 0.15)',
                      color: '#D4AF37',
                      '& .MuiListItemIcon-root': {
                        color: '#D4AF37',
                      }
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: isSelected ? '#000000' : 'rgba(212, 175, 55, 0.75)',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isSelected ? 800 : 600 }}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, sm: 3.5 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          boxSizing: 'border-box',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
