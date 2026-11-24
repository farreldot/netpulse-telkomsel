import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import Layout from './components/Layout';
import SmoothScroll from './components/SmoothScroll';

// Pages
import LoginPage from './pages/LoginPage';
import SitesPage from './pages/SitesPage';
import SiteDetailPage from './pages/SiteDetailPage';
import SignalLogsPage from './pages/SignalLogsPage';
import SignalLogDetailPage from './pages/SignalLogDetailPage';
import ScanOcrPage from './pages/ScanOcrPage';
import MitraPage from './pages/MitraPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll>
        <AuthProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes inside Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/sites" replace />} />
            
            {/* 1. Halaman Daftar Site */}
            <Route path="sites" element={<SitesPage />} />
            
            {/* 2. Halaman Detail Site */}
            <Route path="sites/:id" element={<SiteDetailPage />} />
            
            {/* 3. Halaman Log Sinyal */}
            <Route path="logs" element={<SignalLogsPage />} />
            
            {/* 4. Halaman Detail Log Sinyal */}
            <Route path="logs/:id" element={<SignalLogDetailPage />} />
            
            {/* 5. Halaman Uji Sinyal OCR */}
            <Route path="scan" element={<ScanOcrPage />} />
            
            {/* 6. Halaman Kelola Mitra (Khusus Admin) */}
            <Route
              path="mitra"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <MitraPage />
                </ProtectedRoute>
              }
            />
            
            {/* 7. Halaman Profile & About */}
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/sites" replace />} />
        </Routes>
        </AuthProvider>
      </SmoothScroll>
    </BrowserRouter>
  );
}
