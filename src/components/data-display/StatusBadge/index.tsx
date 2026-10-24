import { Chip } from '@mui/material';

export type AdministrativeStatus = 'active' | 'inactive';
export type OperationalHealth =
  | 'healthy'
  | 'degraded'
  | 'down'
  | 'unknown'
  | 'maintenance';
export type JobOutcome = 'completed' | 'failed' | 'running' | 'pending' | 'denied';

type BadgePresentation = {
  label: string;
  color: 'success' | 'error' | 'warning' | 'info' | 'default';
};

const administrativePresentations: Record<AdministrativeStatus, BadgePresentation> = {
  active: { label: 'Active', color: 'success' },
  inactive: { label: 'Inactive', color: 'default' },
};

const healthPresentations: Record<OperationalHealth, BadgePresentation> = {
  healthy: { label: 'Healthy', color: 'success' },
  degraded: { label: 'Degraded', color: 'warning' },
  down: { label: 'Down', color: 'error' },
  unknown: { label: 'Unknown', color: 'default' },
  maintenance: { label: 'Maintenance', color: 'info' },
};

const outcomePresentations: Record<JobOutcome, BadgePresentation> = {
  completed: { label: 'Completed', color: 'success' },
  failed: { label: 'Failed', color: 'error' },
  running: { label: 'Running', color: 'info' },
  pending: { label: 'Pending', color: 'default' },
  denied: { label: 'Denied', color: 'warning' },
};

function Badge({ presentation }: { presentation: BadgePresentation }) {
  return (
    <Chip
      size="small"
      label={presentation.label}
      color={presentation.color}
      variant={presentation.color === 'default' ? 'outlined' : 'filled'}
      aria-label={`Status: ${presentation.label}`}
    />
  );
}

export function AdministrativeStatusBadge({ status }: { status: AdministrativeStatus }) {
  return <Badge presentation={administrativePresentations[status]} />;
}

export function OperationalHealthBadge({ status }: { status: OperationalHealth }) {
  return <Badge presentation={healthPresentations[status]} />;
}

export function JobOutcomeBadge({ status }: { status: JobOutcome }) {
  return <Badge presentation={outcomePresentations[status]} />;
}

export type StatusBadgeProps =
  | { category: 'administrative'; status: AdministrativeStatus }
  | { category: 'operational-health'; status: OperationalHealth }
  | { category: 'job-outcome'; status: JobOutcome };

export function StatusBadge(props: StatusBadgeProps) {
  switch (props.category) {
    case 'administrative':
      return <AdministrativeStatusBadge status={props.status} />;
    case 'operational-health':
      return <OperationalHealthBadge status={props.status} />;
    case 'job-outcome':
      return <JobOutcomeBadge status={props.status} />;
  }
}
