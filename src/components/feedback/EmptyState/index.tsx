import type { ReactNode } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';

export interface EmptyStateProps {
  variant?: 'empty' | 'no-results';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: ReactNode;
}

export function EmptyState({
  variant = 'empty',
  title,
  description,
  actionLabel,
  onAction,
  action,
}: EmptyStateProps) {
  const defaultTitle = variant === 'no-results' ? 'No results found' : 'Nothing to display';
  const defaultDescription =
    variant === 'no-results'
      ? 'Try changing or clearing your search and filters.'
      : 'There is no data available yet.';

  return (
    <Paper
      variant="outlined"
      role="status"
      sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center', bgcolor: 'background.paper' }}
    >
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          {title ?? defaultTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description ?? defaultDescription}
        </Typography>
        {action}
        {actionLabel && onAction && (
          <Button sx={{ mt: 2 }} variant="outlined" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </Box>
    </Paper>
  );
}
