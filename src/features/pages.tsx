import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { AdaptiveToolbar } from '../components/layout/AdaptiveToolbar';
import type { ToolbarFilter } from '../components/layout/AdaptiveToolbar';
import { DetailDrawer } from '../components/layout/DetailDrawer';
import { SharedDataGrid } from '../components/data-display/SharedDataGrid';
import type {
  SharedGridColumn,
  SharedGridSort,
} from '../components/data-display/SharedDataGrid';
import { EmptyState } from '../components/feedback/EmptyState';
import { useAuthorization } from '../app/providers/AuthorizationProvider';
import { SharedEditForm } from '../components/forms/SharedEditForm';
import type { EditFormField } from '../components/forms/SharedEditForm';
import { portalApi } from '../services/http/contracts';
import type { MetadataDomain } from '../services/http/contracts';

const canonicalApplicationNames = [
  'CDMS NEXT',
  'KLEARANCE NEXT',
  'RETAIL SYSTEM',
  'BANKING SYSTEM',
  'ERP SYSTEM',
  'HS CODE CHECKER',
] as const;

function ContractPending({ capability }: { capability: string }) {
  return (
    <Alert severity="info" role="status">
      <strong>Backend contract pending.</strong> {capability} data and authorized actions
      are unavailable until the existing backend contract is verified. No sample or
      production-like records are shown.
    </Alert>
  );
}

export function DashboardPage() {
  const { state } = useAuthorization();
  const isPlatformAdmin =
    state.status === 'authenticated' &&
    state.identity.role === 'platform-admin';
  const roleLabel =
    state.status === 'authenticated'
      ? state.identity.role.replaceAll('-', ' ')
      : 'authorized user';

  return (
    <Stack spacing={3}>
      <ContractPending capability={`${roleLabel} dashboard aggregates, application entitlements, service health, and recent activity`} />
      <Box>
        <Typography variant="h6" gutterBottom>Application shortcuts</Typography>
        {isPlatformAdmin ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Canonical catalog labels only. Availability, metadata, and launch permission remain unverified.
            </Typography>
            <Grid container spacing={2}>
              {canonicalApplicationNames.map((name) => (
                <Grid key={name} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography fontWeight={700}>{name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Launch authorization pending
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <EmptyState
            title="Authorized applications unavailable"
            description="Only applications returned for the verified user, tenant, and effective entitlement will appear here."
          />
        )}
      </Box>
      <Box>
        <Typography variant="h6" gutterBottom>Operational overview</Typography>
        <ContractPending capability="Running Jobs, Completed Today, Failed Jobs, Active Alerts, Attention Required, and Recent Activity" />
      </Box>
    </Stack>
  );
}

export function ModuleAccessPage() {
  const [search, setSearch] = useState('');
  const { state } = useAuthorization();
  const isPlatformAdmin =
    state.status === 'authenticated' &&
    state.identity.role === 'platform-admin';
  const visibleApplications = canonicalApplicationNames.filter((name) =>
    isPlatformAdmin &&
    name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  );
  const categories: ToolbarFilter[] = [{
    key: 'category',
    label: 'Category',
    type: 'select',
    value: '',
    options: [],
    disabled: true,
    onChange: () => undefined,
  }];

  return (
    <Stack spacing={2.5}>
      <ContractPending capability="Application catalog, tenant availability, user entitlement, and secure handoff" />
      <AdaptiveToolbar
        searchValue={search}
        onSearchChange={setSearch}
        primaryFilters={categories}
        onClearFilters={() => setSearch('')}
        onPageReset={() => undefined}
        searchLabel="Search applications"
      />
      {isPlatformAdmin && visibleApplications.length > 0 ? (
        <Grid container spacing={2}>
          {visibleApplications.map((name) => (
            <Grid key={name} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="h6">{name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Canonical catalog label · availability and entitlement not verified
                    </Typography>
                    <Button variant="contained" disabled>
                      Launch unavailable
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState
          title={isPlatformAdmin ? 'No matching catalog labels' : 'Application catalog unavailable'}
          description={
            isPlatformAdmin
              ? 'Try changing your search. Launch remains unavailable until effective access and secure handoff are verified.'
              : 'Applications appear only after the backend returns those authorized for your user and tenant. No application can be launched without server-confirmed effective access.'
          }
        />
      )}
    </Stack>
  );
}

export function MonitoringPage() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [tenant, setTenant] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<SharedGridSort | null>(null);
  const [selectedJob, setSelectedJob] = useState<MonitorRow | null>(null);
  const { state: authorizationState } = useAuthorization();
  const isPlatformAdmin =
    authorizationState.status === 'authenticated' &&
    authorizationState.identity.role === 'platform-admin';
  const labels = ['Jobs & Workflows', 'Service Health', 'Operational Activity'];
  const jobFilters: ToolbarFilter[] = [{
    key: 'status',
    label: 'Status',
    type: 'select',
    value: status,
    options: [
      { label: 'Running', value: 'running' },
      { label: 'Completed', value: 'completed' },
      { label: 'Failed', value: 'failed' },
      { label: 'Pending', value: 'pending' },
    ],
    onChange: setStatus,
  }, ...(isPlatformAdmin ? [{
    key: 'tenant',
    label: 'Tenant',
    type: 'text' as const,
    value: tenant,
    onChange: setTenant,
  }] : [])];
  const columns: readonly SharedGridColumn<MonitorRow>[] =
    tab === 0
      ? [
          { field: 'id', header: 'Job ID', sortable: true },
          { field: 'name', header: 'Workflow', sortable: true },
          { field: 'status', header: 'Status', sortable: true },
          { field: 'updatedAt', header: 'Started', sortable: true },
          {
            field: 'id',
            header: 'Details',
            sortable: false,
            renderCell: (row) => (
              <Button size="small" onClick={() => setSelectedJob(row)}>View</Button>
            ),
          },
        ]
      : tab === 1
        ? [
            { field: 'name', header: 'Service', sortable: true },
            { field: 'status', header: 'Health', sortable: true },
            { field: 'updatedAt', header: 'Checked at', sortable: true },
          ]
        : [
            { field: 'updatedAt', header: 'Timestamp', sortable: true },
            { field: 'name', header: 'Actor / activity', sortable: true },
            { field: 'status', header: 'Outcome', sortable: true },
          ];
  const grid = (
    <SharedDataGrid<MonitorRow>
      label={`${labels[tab]} grid`}
      rows={[]}
      columns={columns}
      getRowId={(row) => row.id}
      pagination={{
        page,
        pageSize,
        rowCount: 0,
        onPageChange: setPage,
        onPageSizeChange: (value) => {
          setPageSize(value);
          setPage(0);
        },
      }}
      sort={sort}
      onSortChange={(value) => {
        setSort(value);
        setPage(0);
      }}
      errorMessage="BACKEND_CONTRACT_PENDING: monitoring data is unavailable. No operational status is inferred."
      emptyTitle={`${labels[tab]} unavailable`}
      emptyDescription="Records and any timeline details are displayed only after a successful, authorized backend response."
    />
  );

  return (
    <Stack spacing={2.5}>
      <Tabs
        value={tab}
        onChange={(_, value: number) => {
          setTab(value);
          setPage(0);
          setSort(null);
        }}
        variant="scrollable"
        allowScrollButtonsMobile
        aria-label="Monitoring areas"
      >
        {labels.map((label) => <Tab key={label} label={label} />)}
      </Tabs>
      <ContractPending
        capability={`${labels[tab]} records, scoped KPI data, server filters, pagination, and checked-at timestamps`}
      />
      {tab === 0 && (
        <>
          <Grid container spacing={1.5}>
            {['Running Jobs', 'Completed Today', 'Failed Jobs', 'Active Alerts'].map((label) => (
              <Grid key={label} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="h5" sx={{ mt: 1 }}>Unavailable</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Backend data pending
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <AdaptiveToolbar
            searchValue={search}
            onSearchChange={setSearch}
            primaryFilters={jobFilters}
            onClearFilters={() => {
              setStatus('');
              setTenant('');
            }}
            onPageReset={() => setPage(0)}
            searchLabel="Search jobs and workflows"
          />
          {grid}
        </>
      )}
      {tab === 1 && (
        <>
          <EmptyState
            title="Service health unavailable"
            description="Health is unknown until a valid backend health status and checked-at timestamp are supplied. HTTP success alone is not treated as healthy."
          />
          {grid}
        </>
      )}
      {tab === 2 && (
        <>
          <AdaptiveToolbar
            searchValue={search}
            onSearchChange={setSearch}
            onClearFilters={() => setSearch('')}
            onPageReset={() => setPage(0)}
            searchLabel="Search operational activity"
          />
          {grid}
        </>
      )}
      <DetailDrawer
        open={selectedJob !== null}
        title="Job details"
        onClose={() => setSelectedJob(null)}
        sections={selectedJob ? [{
          title: 'Job summary',
          content: (
            <Stack spacing={1}>
              <Typography variant="body2"><strong>Job ID:</strong> {selectedJob.id}</Typography>
              <Typography variant="body2"><strong>Workflow:</strong> {selectedJob.name}</Typography>
              <Typography variant="body2"><strong>Status:</strong> {selectedJob.status}</Typography>
              <Typography variant="body2"><strong>Started:</strong> {selectedJob.updatedAt}</Typography>
            </Stack>
          ),
        }, {
          title: 'Timeline',
          content: <Typography color="text.secondary">
            Timeline entries appear only when returned by the monitoring service.
          </Typography>,
        }] : []}
      />
    </Stack>
  );
}

interface MonitorRow {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
}

const configurationLinks = [
  { title: 'Tenant Management', path: '/configuration/tenants', description: 'Tenant metadata and lifecycle' },
  { title: 'User Management', path: '/configuration/users', description: 'User metadata and lifecycle' },
  { title: 'Module Configuration', path: '/configuration/modules', description: 'Application registry and lifecycle' },
  { title: 'Access Management', path: '/configuration/access', description: 'Tenant page access and application entitlements' },
  { title: 'Integration Settings', path: '/configuration/integrations', description: 'Safe integration metadata' },
  { title: 'Audit Logs', path: '/configuration/audit', description: 'Read-only auditable activity' },
] as const;

export function ConfigurationHubPage() {
  const { state } = useAuthorization();
  const allowedRoutes =
    state.status === 'authenticated'
      ? state.identity.authorizedRoutes
      : [];
  const authorizedLinks = configurationLinks.filter((item) =>
    allowedRoutes.includes(item.path),
  );

  return (
    <Stack spacing={2.5}>
      <ContractPending capability="Configuration route and action permissions" />
      <Grid container spacing={2}>
        {authorizedLinks.map((item) => (
          <Grid key={item.path} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardActionArea component={RouterLink} to={item.path} sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography variant="h6">{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {item.description}
                      </Typography>
                    </Box>
                    <ArrowForwardOutlinedIcon color="primary" />
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      {authorizedLinks.length === 0 && (
        <EmptyState
          title="No configuration areas available"
          description="Configuration links are displayed only when the verified session grants the corresponding page permission."
        />
      )}
    </Stack>
  );
}

interface AdminRow {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
}

interface AdminPageConfig {
  title: string;
  capability: string;
  searchLabel: string;
  columns: readonly SharedGridColumn<AdminRow>[];
  filters?: readonly AdminFilterDefinition[];
  details: readonly string[];
  exclusions: string;
  metadataDomain?: MetadataDomain;
  editableFields?: readonly { key: string; label: string }[];
  lifecycleDomain?: 'tenants' | 'users' | 'modules';
  includeStatusFilter?: boolean;
  metadataPending?: boolean;
}

interface AdminFilterDefinition {
  key: string;
  label: string;
  type?: 'select' | 'text';
  inputType?: ToolbarFilter['inputType'];
  platformAdminOnly?: boolean;
  options?: readonly { label: string; value: string }[];
}

function ManagementPage({ config }: { config: AdminPageConfig }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [extraFilters, setExtraFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<AdminRow | null>(null);
  const [editing, setEditing] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<SharedGridSort | null>(null);
  const metadataDomain = config.metadataDomain;
  const { state: authorizationState } = useAuthorization();
  const isPlatformAdmin =
    authorizationState.status === 'authenticated' &&
    authorizationState.identity.role === 'platform-admin';
  const filters: ToolbarFilter[] = [
    ...(config.includeStatusFilter === false ? [] : [{
      key: 'status',
      label: 'Status',
      type: 'select',
      value: status,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      onChange: setStatus,
    } satisfies ToolbarFilter]),
    ...(config.filters ?? [])
      .filter((filter) => !filter.platformAdminOnly || isPlatformAdmin)
      .map((filter) => ({
        ...filter,
        value: extraFilters[filter.key] ?? '',
        onChange: (value: string) =>
          setExtraFilters((current) => ({ ...current, [filter.key]: value })),
      })),
  ];
  const columns: readonly SharedGridColumn<AdminRow>[] = [
    ...config.columns,
    {
      field: 'id',
      header: 'Details',
      sortable: false,
      renderCell: (row) => (
        <Button size="small" onClick={() => setSelected(row)}>View</Button>
      ),
    },
  ];
  const editableFields: EditFormField<Record<string, string>>[] =
    (config.editableFields ?? []).map(({ key, label }) => ({
      name: key,
      label,
      required: true,
      parseValue: (rawValue) => rawValue,
    }));
  const initialMetadata = Object.fromEntries(
    (config.editableFields ?? []).map(({ key }) => [
      key,
      key === 'name' || key === 'displayName' ? selected?.name ?? '' : '',
    ]),
  );
  const detailSections = selected
    ? [{
        title: 'Record details',
        content: (
          <Stack spacing={1}>
            <Typography variant="body2"><strong>ID:</strong> {selected.id}</Typography>
            <Typography variant="body2"><strong>Name:</strong> {selected.name}</Typography>
            <Typography variant="body2"><strong>Status:</strong> {selected.status}</Typography>
            <Typography variant="body2"><strong>Last updated:</strong> {selected.updatedAt}</Typography>
          </Stack>
        ),
      }, ...config.details.map((title) => ({
        title,
        content: <Typography color="text.secondary">
          Additional safe detail is shown only when provided by the backend.
        </Typography>,
      }))] : [];

  return (
    <Stack spacing={2.5}>
      <ContractPending capability={config.capability} />
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Typography variant="h6">{config.title}</Typography>
        <Chip label={config.exclusions} variant="outlined" size="small" />
      </Stack>
      <AdaptiveToolbar
        searchValue={search}
        onSearchChange={setSearch}
        primaryFilters={filters}
        onClearFilters={() => {
          setStatus('');
          setExtraFilters({});
        }}
        onPageReset={() => setPage(0)}
        searchLabel={config.searchLabel}
      />
      <SharedDataGrid<AdminRow>
        label={`${config.title} grid`}
        rows={[]}
        columns={columns}
        getRowId={(row) => row.id}
        pagination={{
          page,
          pageSize,
          rowCount: 0,
          onPageChange: setPage,
          onPageSizeChange: (value) => {
            setPageSize(value);
            setPage(0);
          },
        }}
        sort={sort}
        onSortChange={(value) => {
          setSort(value);
          setPage(0);
        }}
        errorMessage="BACKEND_CONTRACT_PENDING: records are not loaded. No data has been changed."
        emptyTitle="Records unavailable"
        emptyDescription="The grid will display server-provided records when the backend contract is connected."
      />
      <DetailDrawer
        open={selected !== null}
        title={config.title.replace(' Management', '').replace(' Settings', '') + ' details'}
        onClose={() => {
          if (!editing) setSelected(null);
        }}
        sections={editing && metadataDomain && selected ? [{
          title: 'Edit metadata',
          content: (
            <SharedEditForm<Record<string, string>>
              initialValues={initialMetadata}
              fields={editableFields}
              onSubmit={async (values) => {
                await portalApi.updateMetadata(metadataDomain, selected.id, values);
                return true;
              }}
              errorMessage="BACKEND_CONTRACT_PENDING: changes were not saved. Your edits remain available for retry."
              successMessage="Metadata updated."
              onCancel={() => setEditing(false)}
            />
          ),
        }] : [
          ...detailSections,
          ...(selected && (config.editableFields?.length || config.lifecycleDomain || config.metadataPending) ? [{
            title: 'Available actions',
            content: (
              <Stack spacing={1} alignItems="flex-start">
                {config.editableFields?.length ? (
                  <Button variant="outlined" onClick={() => setEditing(true)}>
                    Edit metadata
                  </Button>
                ) : config.metadataPending ? (
                  <>
                    <Button variant="outlined" disabled>
                      Edit metadata unavailable
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      Exact mutable tenant metadata fields have not been verified.
                    </Typography>
                  </>
                ) : null}
                {config.lifecycleDomain && (
                  <Button
                    variant="outlined"
                    disabled
                    title="Lifecycle impact review and confirmation contract pending"
                  >
                    Activate / Deactivate unavailable
                  </Button>
                )}
                {config.lifecycleDomain && (
                  <Typography variant="caption" color="text.secondary">
                    Lifecycle actions require a backend impact review and confirmed authorization.
                  </Typography>
                )}
              </Stack>
            ),
          }] : []),
        ]}
      />
    </Stack>
  );
}

const tenantsConfig: AdminPageConfig = {
  title: 'Tenant Management',
  capability: 'Tenant listing, detail, metadata edit, lifecycle impact review, and audit',
  searchLabel: 'Search tenants',
  columns: [
    { field: 'id', header: 'Tenant ID', sortable: true },
    { field: 'name', header: 'Tenant name', sortable: true },
    { field: 'status', header: 'Status', sortable: true },
    { field: 'updatedAt', header: 'Last updated', sortable: true },
  ],
  details: ['Tenant identity', 'Metadata', 'Lifecycle and audit'],
  exclusions: 'Create/Delete not available',
  lifecycleDomain: 'tenants',
  metadataPending: true,
};

const usersConfig: AdminPageConfig = {
  title: 'User Management',
  capability: 'Tenant-scoped user list, details, display-name edit, lifecycle impact, and singleton protection',
  searchLabel: 'Search name, Login ID, or User ID',
  columns: [
    { field: 'id', header: 'User ID', sortable: true },
    { field: 'name', header: 'Display name', sortable: true },
    { field: 'status', header: 'Status', sortable: true },
    { field: 'updatedAt', header: 'Last updated', sortable: true },
  ],
  filters: [{
    key: 'identity-source',
    label: 'Identity Source',
    type: 'text',
  }, {
    key: 'tenant',
    label: 'Tenant',
    type: 'text',
    platformAdminOnly: true,
  }],
  details: ['Identity', 'Tenant and identity source', 'Lifecycle and audit'],
  exclusions: 'No create/delete/transfer/reset',
  metadataDomain: 'users',
  editableFields: [{ key: 'displayName', label: 'Display Name' }],
  lifecycleDomain: 'users',
};

const modulesConfig: AdminPageConfig = {
  title: 'Module Configuration',
  capability: 'Application registry, metadata edit, administrative lifecycle, and audit',
  searchLabel: 'Search applications',
  columns: [
    { field: 'id', header: 'Application ID', sortable: true },
    { field: 'name', header: 'Name', sortable: true },
    { field: 'status', header: 'Administrative status', sortable: true },
    { field: 'updatedAt', header: 'Last updated', sortable: true },
  ],
  filters: [{
    key: 'category',
    label: 'Category',
    type: 'text',
  }],
  details: ['Application identity', 'Metadata', 'Administrative status and audit'],
  exclusions: 'No create/delete; activation does not grant access',
  metadataDomain: 'modules',
  editableFields: [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'icon', label: 'Icon' },
    { key: 'category', label: 'Category' },
  ],
  lifecycleDomain: 'modules',
};

const integrationsConfig: AdminPageConfig = {
  title: 'Integration Settings',
  capability: 'Integration registry and safe metadata only; secrets and endpoint/auth configuration are excluded',
  searchLabel: 'Search integrations',
  columns: [
    { field: 'id', header: 'Integration ID', sortable: true },
    { field: 'name', header: 'Display name', sortable: true },
    { field: 'status', header: 'Configuration status', sortable: true },
    { field: 'updatedAt', header: 'Operational health checked at', sortable: true },
  ],
  details: ['Safe integration summary', 'Configuration status', 'Operational health and audit'],
  exclusions: 'No secrets, endpoint edits, or test connection',
  includeStatusFilter: false,
  filters: [{
    key: 'configuration-status',
    label: 'Configuration status',
    type: 'select',
    options: [
      { label: 'Configured', value: 'configured' },
      { label: 'Incomplete', value: 'incomplete' },
      { label: 'Disabled', value: 'disabled' },
      { label: 'Requires Review', value: 'requires-review' },
    ],
  }, {
    key: 'operational-health',
    label: 'Operational health',
    type: 'select',
    options: [
      { label: 'Healthy', value: 'healthy' },
      { label: 'Degraded', value: 'degraded' },
      { label: 'Down', value: 'down' },
      { label: 'Unknown', value: 'unknown' },
    ],
  }],
  metadataDomain: 'integrations',
  editableFields: [
    { key: 'name', label: 'Display Name' },
    { key: 'description', label: 'Description' },
  ],
};

const auditConfig: AdminPageConfig = {
  title: 'Audit Logs',
  capability: 'Sanitized, tenant-scoped, read-only audit records with server filters and pagination',
  searchLabel: 'Search actor, action, or resource',
  columns: [
    { field: 'updatedAt', header: 'Timestamp', sortable: true },
    { field: 'name', header: 'Actor / action', sortable: true },
    { field: 'id', header: 'Resource', sortable: true },
    { field: 'status', header: 'Outcome', sortable: true },
  ],
  details: ['Actor and scope', 'Action and outcome', 'Sanitized context'],
  exclusions: 'View and filter only',
  includeStatusFilter: false,
  filters: [{
    key: 'date-from',
    label: 'Date from (UTC)',
    type: 'text',
    inputType: 'date',
  }, {
    key: 'date-to',
    label: 'Date to (UTC)',
    type: 'text',
    inputType: 'date',
  }, {
    key: 'actor',
    label: 'Actor',
    type: 'text',
  }, {
    key: 'tenant',
    label: 'Tenant',
    type: 'text',
    platformAdminOnly: true,
  }, {
    key: 'action',
    label: 'Action',
    type: 'text',
  }, {
    key: 'resource',
    label: 'Resource',
    type: 'text',
  }, {
    key: 'outcome',
    label: 'Outcome',
    type: 'select',
    options: [
      { label: 'Success', value: 'success' },
      { label: 'Failed', value: 'failed' },
      { label: 'Denied', value: 'denied' },
    ],
  }],
};

export function TenantManagementPage() {
  return <ManagementPage config={tenantsConfig} />;
}

export function UserManagementPage() {
  return <ManagementPage config={usersConfig} />;
}

export function ModuleConfigurationPage() {
  return <ManagementPage config={modulesConfig} />;
}

export function IntegrationSettingsPage() {
  return <ManagementPage config={integrationsConfig} />;
}

export function AuditLogsPage() {
  return <ManagementPage config={auditConfig} />;
}

export function AccessManagementPage() {
  const [tab, setTab] = useState(0);
  const [entitlementTab, setEntitlementTab] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<{ id: string; target: string; scope: string } | null>(null);
  const areas = ['Tenant Page Access', 'Application Entitlement'];
  const entitlementAreas = ['Tenant Availability', 'User Entitlement'];
  const columns: readonly SharedGridColumn<{ id: string; target: string; scope: string }>[] = [
    { field: 'id', header: 'Record ID', sortable: true },
    { field: 'target', header: 'Target', sortable: true },
    { field: 'scope', header: 'Scope', sortable: true },
    {
      field: 'id',
      header: 'Details',
      sortable: false,
      renderCell: (row) => (
        <Button size="small" onClick={() => setSelected(row)}>View</Button>
      ),
    },
  ];
  const dataLabel = tab === 0 ? areas[0] : entitlementAreas[entitlementTab];
  const dataGrid = (
    <SharedDataGrid<{ id: string; target: string; scope: string }>
      label={`${dataLabel} grid`}
      rows={[]}
      columns={columns}
      getRowId={(row) => row.id}
      pagination={{
        page,
        pageSize: 10,
        rowCount: 0,
        onPageChange: setPage,
        onPageSizeChange: () => undefined,
      }}
      errorMessage="BACKEND_CONTRACT_PENDING: access records are unavailable; no permission has been changed."
      emptyTitle="Access records unavailable"
    />
  );

  return (
    <Stack spacing={2.5}>
      <Tabs
        value={tab}
        onChange={(_, value: number) => {
          setTab(value);
          setPage(0);
        }}
        aria-label="Access management areas"
        variant="scrollable"
      >
        {areas.map((label) => <Tab key={label} label={label} />)}
      </Tabs>
      {tab === 0 ? (
        <>
          <ContractPending capability="Tenant-scoped page access, review, and save confirmation" />
          <AdaptiveToolbar
            searchValue={search}
            onSearchChange={setSearch}
            onClearFilters={() => setSearch('')}
            onPageReset={() => setPage(0)}
            searchLabel="Search tenant page access"
          />
          {dataGrid}
        </>
      ) : (
        <>
          <Tabs
            value={entitlementTab}
            onChange={(_, value: number) => {
              setEntitlementTab(value);
              setPage(0);
            }}
            aria-label="Application entitlement areas"
            variant="scrollable"
          >
            {entitlementAreas.map((label) => <Tab key={label} label={label} />)}
          </Tabs>
          <ContractPending
            capability={entitlementAreas[entitlementTab] + ' records and single-record impact review'}
          />
          <AdaptiveToolbar
            searchValue={search}
            onSearchChange={setSearch}
            onClearFilters={() => setSearch('')}
            onPageReset={() => setPage(0)}
            searchLabel={entitlementTab === 0 ? 'Search tenants or applications' : 'Search one user or application'}
          />
          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="outlined"
              disabled
              title="No changes can be reviewed until the backend contract is available"
            >
              Review changes
            </Button>
          </Stack>
          {dataGrid}
        </>
      )}
      <DetailDrawer
        open={selected !== null}
        title={`${dataLabel} details`}
        onClose={() => setSelected(null)}
        sections={selected ? [{
          title: 'Access record',
          content: (
            <Stack spacing={1}>
              <Typography variant="body2"><strong>Record ID:</strong> {selected.id}</Typography>
              <Typography variant="body2"><strong>Target:</strong> {selected.target}</Typography>
              <Typography variant="body2"><strong>Scope:</strong> {selected.scope}</Typography>
            </Stack>
          ),
        }] : []}
      />
    </Stack>
  );
}
