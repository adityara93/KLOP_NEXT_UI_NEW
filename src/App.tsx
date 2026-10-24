import { Navigate, Route, Routes } from 'react-router-dom';
import { PortalLayout } from './components/layout/PortalLayout';
import { ProtectedRoute } from './app/providers/AuthorizationProvider';
import {
  AccessManagementPage,
  AuditLogsPage,
  ConfigurationHubPage,
  DashboardPage,
  IntegrationSettingsPage,
  ModuleAccessPage,
  ModuleConfigurationPage,
  MonitoringPage,
  TenantManagementPage,
  UserManagementPage,
} from './features/pages';
import { LoginPage } from './features/LoginPage';
import { routes } from './app/router/routes';

const pages = {
  '/dashboard': <DashboardPage />,
  '/module-access': <ModuleAccessPage />,
  '/monitoring': <MonitoringPage />,
  '/configuration': <ConfigurationHubPage />,
  '/configuration/tenants': <TenantManagementPage />,
  '/configuration/users': <UserManagementPage />,
  '/configuration/modules': <ModuleConfigurationPage />,
  '/configuration/access': <AccessManagementPage />,
  '/configuration/integrations': <IntegrationSettingsPage />,
  '/configuration/audit': <AuditLogsPage />,
} as const;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <PortalLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <ProtectedRoute requiredRoute={route.path}>
                {pages[route.path]}
              </ProtectedRoute>
            }
          />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
