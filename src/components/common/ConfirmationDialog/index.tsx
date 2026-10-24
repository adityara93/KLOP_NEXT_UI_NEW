import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

export interface ConfirmationDialogProps {
  open: boolean;
  targetName: string;
  actionDescription: string;
  impactDescription: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  open,
  targetName,
  actionDescription,
  impactDescription,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const titleId = 'confirmation-dialog-title';

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      aria-labelledby={titleId}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id={titleId}>Confirm action</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          <DialogContentText>{actionDescription}</DialogContentText>
          <Typography variant="body2">
            Target: <strong>{targetName}</strong>
          </Typography>
          <DialogContentText>{impactDescription}</DialogContentText>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          color={danger ? 'error' : 'primary'}
          variant="contained"
          disabled={loading}
          autoFocus
          startIcon={loading ? <CircularProgress color="inherit" size={16} /> : undefined}
        >
          {loading ? 'Working…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
