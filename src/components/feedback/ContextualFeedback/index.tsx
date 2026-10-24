import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import type { AlertColor } from '@mui/material';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

export type FeedbackSeverity = Extract<AlertColor, 'success' | 'error' | 'warning'>;

export interface FeedbackMessage {
  severity: FeedbackSeverity;
  message: string;
  duration?: number;
}

export interface ContextualFeedbackActions {
  showFeedback: (feedback: FeedbackMessage) => void;
}

interface ActiveFeedback extends FeedbackMessage {
  key: number;
}

const FeedbackContext = createContext<ContextualFeedbackActions | null>(null);

export function useContextualFeedback() {
  return useContext(FeedbackContext);
}

export function ContextualFeedbackProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveFeedback | null>(null);
  const showFeedback = useCallback((feedback: FeedbackMessage) => {
    setActive({ ...feedback, key: Date.now() + Math.random() });
  }, []);
  const actions = useMemo(() => ({ showFeedback }), [showFeedback]);

  return (
    <FeedbackContext.Provider value={actions}>
      {children}
      <Snackbar
        key={active?.key}
        open={active !== null}
        autoHideDuration={active?.duration ?? 6000}
        onClose={() => setActive(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {active ? (
          <Alert
            severity={active.severity}
            variant="filled"
            onClose={() => setActive(null)}
            role="status"
            sx={{ width: '100%' }}
          >
            {active.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </FeedbackContext.Provider>
  );
}

export function LoadingIndicator({ label = 'Loading' }: { label?: string }) {
  return (
    <Stack
      role="status"
      aria-live="polite"
      direction="row"
      alignItems="center"
      gap={1.5}
      sx={{ py: 2 }}
    >
      <CircularProgress size={22} aria-label={label} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

export function SafeErrorState({
  title = 'Unable to load this information',
  message = 'Please try again. If the problem continues, contact your administrator.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <Alert
      severity="error"
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined
      }
    >
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
}

export function UnauthorizedState({
  message = 'You do not have access to this information.',
}: {
  message?: string;
}) {
  return (
    <Alert severity="warning" role="alert">
      <AlertTitle>Access unavailable</AlertTitle>
      {message}
    </Alert>
  );
}

export function SessionExpiredState({
  message = 'Your session has expired. Reconnect to continue.',
  onReconnect,
}: {
  message?: string;
  onReconnect?: () => void;
}) {
  return (
    <Alert
      severity="warning"
      role="alert"
      action={
        onReconnect ? (
          <Button color="inherit" size="small" onClick={onReconnect}>
            Reconnect
          </Button>
        ) : undefined
      }
    >
      <AlertTitle>Session expired</AlertTitle>
      <Box component="span">{message}</Box>
    </Alert>
  );
}
