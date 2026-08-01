import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';

import RestaurantDashboard from './pages/restaurant/Dashboard';
import UploadFood from './pages/restaurant/UploadFood';
import DonationHistory from './pages/restaurant/DonationHistory';

import NGODashboard from './pages/ngo/Dashboard';
import MyPickups from './pages/ngo/MyPickups';

import AdminDashboard from './pages/admin/Dashboard';

const roleHome = { restaurant: '/restaurant', ngo: '/ngo', admin: '/admin' };

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleHome[user.role] || '/login'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Restaurant */}
          <Route
            path="/restaurant"
            element={
              <ProtectedRoute allowedRoles={['restaurant']}>
                <RestaurantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant/upload"
            element={
              <ProtectedRoute allowedRoles={['restaurant']}>
                <UploadFood />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant/history"
            element={
              <ProtectedRoute allowedRoles={['restaurant']}>
                <DonationHistory />
              </ProtectedRoute>
            }
          />

          {/* NGO */}
          <Route
            path="/ngo"
            element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <NGODashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/pickups"
            element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <MyPickups />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
