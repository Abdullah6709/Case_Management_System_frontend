import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';

import { getCustomTheme } from './theme.js';
import { checkAuth } from './store/slices/authSlice.js';

// Layout & Common
import DashboardLayout from './components/Layout/DashboardLayout.jsx';
import LoadingScreen from './components/Common/LoadingScreen.jsx';

// Auth Pages
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import ForgotPassword from './pages/Auth/ForgotPassword.jsx';
import ResetPassword from './pages/Auth/ResetPassword.jsx';

// Super Admin Pages
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard.jsx';
import LawFirms from './pages/SuperAdmin/LawFirms.jsx';
import Admins from './pages/SuperAdmin/Admins.jsx';
import Courts from './pages/SuperAdmin/Masters/Courts.jsx';
import Judges from './pages/SuperAdmin/Masters/Judges.jsx';
import PracticeAreas from './pages/SuperAdmin/Masters/PracticeAreas.jsx';
import Matters from './pages/SuperAdmin/Masters/Matters.jsx';
import StatesCities from './pages/SuperAdmin/Masters/StatesCities.jsx';
import Settings from './pages/SuperAdmin/Settings.jsx';
import ActivityLogs from './pages/SuperAdmin/ActivityLogs.jsx';

// Law Firm Admin Pages
import AdminDashboard from './pages/Admin/Dashboard.jsx';
import Clients from './pages/Admin/Clients.jsx';
import Advocates from './pages/Admin/Advocates.jsx';
import CaseList from './pages/Admin/Cases/CaseList.jsx';
import CaseForm from './pages/Admin/Cases/CaseForm.jsx';
import CaseDetails from './pages/Admin/Cases/CaseDetails.jsx';
import Hearings from './pages/Admin/Hearings.jsx';
import Documents from './pages/Admin/Documents.jsx';
import Calendar from './pages/Admin/Calendar.jsx';
import Reports from './pages/Admin/Reports.jsx';
import TenantUsers from './pages/Admin/Users.jsx';

// Client Portal Pages
import ClientDashboard from './pages/Client/Dashboard.jsx';
import ClientCaseDetails from './pages/Client/CaseDetails.jsx';
import ClientProfile from './pages/Client/Profile.jsx';
import ClientHearings from './pages/Client/Hearings.jsx';
import ClientDocuments from './pages/Client/Documents.jsx';

// Helper component for route protection
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  if (loading) {
    return <LoadingScreen message="Verifying security credentials..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect role to their respective landing page
    if (user.role === 'SKIT_SUPER_ADMIN' || user.role === 'SKIT_ADMIN_USER') return <Navigate to="/superadmin" replace />;
    if (user.role === 'CLIENT_ADMIN') return <Navigate to="/firm" replace />;
    if (user.role === 'CLIENT_USER') return <Navigate to="/client" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppContent = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const { loading } = useSelector((state) => state.auth);

  const theme = getCustomTheme(mode);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingScreen message="Initializing LCMS Core..." />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Super Admin Secured Console */}
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute allowedRoles={['SKIT_SUPER_ADMIN', 'SKIT_ADMIN_USER']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SuperAdminDashboard />} />
            <Route path="firms" element={<LawFirms />} />
            <Route path="admins" element={<Admins />} />
            <Route path="courts" element={<Courts />} />
            <Route path="judges" element={<Judges />} />
            <Route path="practice-areas" element={<PracticeAreas />} />
            <Route path="matters" element={<Matters />} />
            <Route path="states" element={<StatesCities />} />
            <Route path="settings" element={<Settings />} />
            <Route path="logs" element={<ActivityLogs />} />
          </Route>


          {/* Law Firm Admin Operations Portal */}
          <Route
            path="/firm"
            element={
              <ProtectedRoute allowedRoles={['CLIENT_ADMIN', 'CLIENT_USER']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="advocates" element={<Advocates />} />
            <Route path="cases" element={<CaseList />} />
            <Route path="cases/new" element={<CaseForm />} />
            <Route path="cases/:id" element={<CaseDetails />} />
            <Route path="cases/:id/edit" element={<CaseForm />} />
            <Route path="hearings" element={<Hearings />} />
            <Route path="documents" element={<Documents />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['CLIENT_ADMIN']}>
                  <TenantUsers />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Client Portal */}
          <Route
            path="/client"
            element={
              <ProtectedRoute allowedRoles={['CLIENT_ADMIN', 'CLIENT_USER']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ClientDashboard />} />
            <Route path="hearings" element={<ClientHearings />} />
            <Route path="documents" element={<ClientDocuments />} />
            <Route path="cases/:id" element={<ClientCaseDetails />} />
            <Route path="profile" element={<ClientProfile />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default AppContent;
