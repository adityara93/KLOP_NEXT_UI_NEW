import { Alert, AlertTitle, Box, Button, Paper, Stack, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export function LoginPage({
  authError,
  onRetry,
}: {
  authError?: string;
  onRetry?: () => void;
}) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        bgcolor: 'background.default',
      }}
    >
      <Paper variant="outlined" sx={{ width: '100%', maxWidth: 480, p: { xs: 3, sm: 5 } }}>
        <Stack spacing={2.5}>
          <LockOutlinedIcon color="primary" fontSize="large" />
          <Box>
            <Typography variant="h5">Sign in to KLOP NEXT</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Your session must be verified before portal pages or tenant data can be shown.
            </Typography>
          </Box>
          <Alert severity="warning">
            <AlertTitle>Authentication integration pending</AlertTitle>
            Azure SSO and JWT fallback cannot be enabled until their existing backend
            contracts are verified. No sign-in attempt will be reported as successful.
          </Alert>
          {authError && (
            <Alert severity="error" role="alert">
              {authError}
            </Alert>
          )}
          <Stack spacing={1}>
            <Button variant="contained" disabled>
              Continue with Azure SSO
            </Button>
            <Button variant="outlined" disabled>
              Use JWT fallback
            </Button>
          </Stack>
          {onRetry && (
            <Button onClick={onRetry} aria-label="Retry session verification">
              Retry session verification
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
