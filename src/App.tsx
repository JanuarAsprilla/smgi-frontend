import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';

import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import Dashboard from './pages/dashboard/Dashboard';
import Layers from './pages/layers/Layers';
import Processes from './pages/processes/Processes';
import Analysis from './pages/analysis/Analysis';
import Monitoring from './pages/monitoring/Monitoring';
import UserManagement from './pages/admin/UserManagement';
import Map from './pages/map/Map';
import DataViewer from './pages/data/DataViewer';
import NotificationSettings from './pages/settings/NotificationSettings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore();
  return accessToken ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* ✅ RUTAS PÚBLICAS (SIN AUTENTICACIÓN) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* ✅ RUTAS PRIVADAS (REQUIEREN LOGIN) */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="layers" element={<Layers />} />
            <Route path="processes" element={<Processes />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="monitoring" element={<Monitoring />} />
            <Route path="admin/users" element={<UserManagement />} />
            <Route path="map" element={<Map />} />
            <Route path="data" element={<DataViewer />} />
            <Route path="settings/notifications" element={<NotificationSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
