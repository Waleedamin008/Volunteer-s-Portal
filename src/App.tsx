import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// Public Pages
import { LoginPage } from './pages/public/LoginPage';
import { PublicJoinPage } from './pages/public/PublicJoinPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminTeamsPage } from './pages/admin/AdminTeamsPage';
import { AdminTeamDetailPage } from './pages/admin/AdminTeamDetailPage';
import { AdminTeamFormPage } from './pages/admin/AdminTeamFormPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminLeadersPage } from './pages/admin/AdminLeadersPage';
import { AdminActivityPage } from './pages/admin/AdminActivityPage';

// Leader Pages
import { LeaderDashboard } from './pages/leader/LeaderDashboard';
import { LeaderApplicationsPage } from './pages/leader/LeaderApplicationsPage';
import { LeaderTeamPage } from './pages/leader/LeaderTeamPage';
import { LeaderProfilePage } from './pages/leader/LeaderProfilePage';

// Route Guard for Authenticated Users
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRole?: 'admin' | 'team_leader';
}> = ({ children, allowedRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-ivoryBg flex items-center justify-center">
        <div className="animate-pulse text-xs font-semibold text-brand-navy">
          Loading portal session...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // If leader attempts admin route, redirect to leader dashboard
    if (user.role === 'team_leader') {
      return <Navigate to="/leader/dashboard" replace />;
    }
    // If admin attempts leader route, redirect to admin dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

// Root Router Redirector
const RootRedirector: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/leader/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root Redirect to Login or Dashboard */}
          <Route path="/" element={<RootRedirector />} />
          <Route path="/join/:slug" element={<PublicJoinPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/portal" element={<LoginPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<LoginPage />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="teams" element={<AdminTeamsPage />} />
            <Route path="teams/:id" element={<AdminTeamDetailPage />} />
            <Route path="teams/:id/form" element={<AdminTeamFormPage />} />
            <Route path="applications" element={<AdminApplicationsPage />} />
            <Route path="leaders" element={<AdminLeadersPage />} />
            <Route path="activity" element={<AdminActivityPage />} />
          </Route>

          {/* Team Leader Protected Routes */}
          <Route
            path="/leader"
            element={
              <ProtectedRoute allowedRole="team_leader">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/leader/dashboard" replace />} />
            <Route path="dashboard" element={<LeaderDashboard />} />
            <Route path="applications" element={<LeaderApplicationsPage />} />
            <Route path="team" element={<LeaderTeamPage />} />
            <Route path="profile" element={<LeaderProfilePage />} />
          </Route>

          {/* Catch-all 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

