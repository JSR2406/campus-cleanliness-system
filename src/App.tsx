import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Portal from './pages/Portal';
import StudentDashboard from './pages/StudentDashboard';
import ComplaintForm from './pages/ComplaintForm';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AnalyticsPage from './pages/Analytics';
import ProfilePage from './pages/ProfilePage';
import Layout from './components/Layout';

import { ThemeProvider } from './context/ThemeContext';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />;

  // Wrong role → redirect to appropriate dashboard
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'staff') return <Navigate to="/staff-dashboard" replace />;
    return <Navigate to="/student-dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  
  switch (user.role) {
    case 'admin': return <Navigate to="/admin-dashboard" />;
    case 'staff':
    case 'teacher': return <Navigate to="/staff-dashboard" />;
    default: return <Navigate to="/student-dashboard" />;
  }
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/portal" element={<Portal />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/student-dashboard" element={
              <ProtectedRoute roles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/report" element={
              <ProtectedRoute roles={['student']}>
                <ComplaintForm />
              </ProtectedRoute>
            } />
            
            <Route path="/admin-dashboard" element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute roles={['admin']}>
                <AnalyticsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/staff-dashboard" element={
              <ProtectedRoute roles={['staff', 'teacher']}>
                <StaffDashboard />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute roles={['student', 'staff', 'teacher', 'admin']}>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={<RootRedirect />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}
