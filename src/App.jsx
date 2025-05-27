import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { MotionConfig } from 'framer-motion';
import { AuthProvider, useAuth } from '@/contexts/AuthContext'; 
import MainLayout from '@/components/layouts/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

import DashboardPage from '@/pages/DashboardPage';
import ProjectSetupPage from '@/pages/ProjectSetupPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import DailyLogPage from '@/pages/DailyLogPage';
import LoginPage from '@/pages/LoginPage';
import UserManagementPage from '@/pages/UserManagementPage';

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route 
          path="new-project" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ProjectSetupPage />
            </ProtectedRoute>
          } 
        />
        <Route path="project/:projectId" element={<ProjectDetailPage />} />
        <Route 
          path="project/:projectId/daily-log" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'secondary']}>
              <DailyLogPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="project/:projectId/edit" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ProjectSetupPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="user-management" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagementPage />
            </ProtectedRoute>
          } 
        />
      </Route>
      
      <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} />} />
    </Routes>
  );
}

function App() {
  return (
    <MotionConfig transition={{ duration: 0.3, ease: "easeInOut" }}>
      <Router>
        <AuthProvider>
          <Toaster />
          <AppContent />
        </AuthProvider>
      </Router>
    </MotionConfig>
  );
}

export default App;