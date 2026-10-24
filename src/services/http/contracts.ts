export type BackendCapability =
  | 'authentication'
  | 'authorization'
  | 'dashboard'
  | 'notifications'
  | 'applications'
  | 'application-handoff'
  | 'monitoring'
  | 'tenants'
  | 'users'
  | 'modules'
  | 'access-management'
  | 'integrations'
  | 'audit';

export type MetadataDomain = 'tenants' | 'users' | 'modules' | 'integrations';

export class BackendContractPendingError extends Error {
  readonly code = 'BACKEND_CONTRACT_PENDING';

  constructor(readonly capability: BackendCapability) {
    super(`BACKEND_CONTRACT_PENDING: ${capability}`);
    this.name = 'BackendContractPendingError';
  }
}

export interface SessionIdentity {
  userId: string;
  loginId: string;
  displayName: string;
  role: 'platform-admin' | 'tenant-admin' | 'standard-user';
  tenantId: string | null;
  authorizedRoutes: readonly string[];
}

export interface NotificationSummary {
  unreadCount: number;
  latest: readonly NotificationItem[];
}

export type NotificationFilter = 'all' | 'unread' | 'failed' | 'alerts';

export interface NotificationItem {
  id: string;
  eventType: 'DOCUMENT_JOB_COMPLETED' | 'DOCUMENT_JOB_FAILED' | 'SYSTEM_ALERT';
  title: string;
  createdAt: string;
  read: boolean;
}

export interface AuthAdapter {
  restoreSession(): Promise<SessionIdentity>;
  beginAzureSignIn(): Promise<void>;
  signInWithJwtFallback(credentials: {
    loginId: string;
    credential: string;
  }): Promise<SessionIdentity>;
  signOut(): Promise<void>;
}

export interface PortalApi {
  getDashboard(): Promise<unknown>;
  getNotifications(filter: NotificationFilter): Promise<NotificationSummary>;
  markNotificationRead(notificationId: string): Promise<void>;
  markAllNotificationsRead(): Promise<void>;
  getApplications(): Promise<unknown>;
  launchApplication(applicationId: string): Promise<void>;
  getMonitoring(): Promise<unknown>;
  getTenants(): Promise<unknown>;
  getUsers(): Promise<unknown>;
  getModules(): Promise<unknown>;
  getAccessManagement(): Promise<unknown>;
  getIntegrations(): Promise<unknown>;
  getAuditLogs(): Promise<unknown>;
  updateMetadata(
    domain: MetadataDomain,
    recordId: string,
    metadata: Readonly<Record<string, string>>,
  ): Promise<void>;
  updateLifecycle(
    domain: 'tenants' | 'users' | 'modules',
    recordId: string,
    active: boolean,
  ): Promise<void>;
}

export const authAdapter: AuthAdapter = {
  restoreSession: async () => {
    throw new BackendContractPendingError('authentication');
  },
  beginAzureSignIn: async () => {
    throw new BackendContractPendingError('authentication');
  },
  signInWithJwtFallback: async () => {
    throw new BackendContractPendingError('authentication');
  },
  signOut: async () => {
    throw new BackendContractPendingError('authentication');
  },
};

export const portalApi: PortalApi = {
  getDashboard: async () => {
    throw new BackendContractPendingError('dashboard');
  },
  getNotifications: async () => {
    throw new BackendContractPendingError('notifications');
  },
  markNotificationRead: async () => {
    throw new BackendContractPendingError('notifications');
  },
  markAllNotificationsRead: async () => {
    throw new BackendContractPendingError('notifications');
  },
  getApplications: async () => {
    throw new BackendContractPendingError('applications');
  },
  launchApplication: async () => {
    throw new BackendContractPendingError('application-handoff');
  },
  getMonitoring: async () => {
    throw new BackendContractPendingError('monitoring');
  },
  getTenants: async () => {
    throw new BackendContractPendingError('tenants');
  },
  getUsers: async () => {
    throw new BackendContractPendingError('users');
  },
  getModules: async () => {
    throw new BackendContractPendingError('modules');
  },
  getAccessManagement: async () => {
    throw new BackendContractPendingError('access-management');
  },
  getIntegrations: async () => {
    throw new BackendContractPendingError('integrations');
  },
  getAuditLogs: async () => {
    throw new BackendContractPendingError('audit');
  },
  updateMetadata: async (domain, _recordId, _metadata) => {
    throw new BackendContractPendingError(domain);
  },
  updateLifecycle: async (_domain, _recordId, _active) => {
    throw new BackendContractPendingError('authorization');
  },
};
