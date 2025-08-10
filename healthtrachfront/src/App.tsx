import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { ConfigProvider } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/Layout/AppLayout';
import { LoginPage } from './components/Auth/LoginPage';
import { ClockInOut } from './components/CareworkerDashboard/ClockInOut';
import { ShiftHistory } from './components/CareworkerDashboard/ShiftHistory';
import { Dashboard } from './components/ManagerDashboard/Dashboard';
import { StaffManagement } from './components/ManagerDashboard/StaffManagement';
import { LocationSettings } from './components/ManagerDashboard/LocationSettings';
import { ProfilePage } from './components/Auth/ProfilePage';
// Auth0 configuration - using environment variables
const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    scope: 'openid profile email', // ✅ ensure email is returned
  },
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/clock" replace />} />
        <Route path="/clock" element={<ClockInOut />} />
        <Route path="/history" element={<ShiftHistory />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/staff" element={<StaffManagement />} />
        <Route path="/settings" element={<LocationSettings />} />
        <Route path="/profile" element={<ProfilePage />} />
        {/* Optional: A fallback route for any other path */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

function App() {
  return (
    <Auth0Provider {...auth0Config}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
          },
        }}
      >
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ConfigProvider>
    </Auth0Provider>
  );
}

export default App;
