export const routes = [
  { path: '/dashboard', label: 'Dashboard', description: 'Portal overview', section: 'main' },
  { path: '/module-access', label: 'Module Access', description: 'Application access', section: 'main' },
  { path: '/monitoring', label: 'Monitoring', description: 'Jobs and services', section: 'main' },
  { path: '/configuration', label: 'Configuration', description: 'Configuration hub', section: 'configuration' },
  { path: '/configuration/tenants', label: 'Tenant Management', description: 'Tenant administration', section: 'configuration' },
  { path: '/configuration/users', label: 'User Management', description: 'User administration', section: 'configuration' },
  { path: '/configuration/modules', label: 'Module Configuration', description: 'Application registry', section: 'configuration' },
  { path: '/configuration/access', label: 'Access Management', description: 'Page and application access', section: 'configuration' },
  { path: '/configuration/integrations', label: 'Integration Settings', description: 'Integration registry', section: 'configuration' },
  { path: '/configuration/audit', label: 'Audit Logs', description: 'Audit review', section: 'configuration' },
] as const;
