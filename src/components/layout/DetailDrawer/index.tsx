import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

export interface DetailSection {
  title: string;
  content: ReactNode;
}

export interface DetailDrawerProps {
  open: boolean;
  title: string;
  sections?: readonly DetailSection[];
  loading?: boolean;
  errorMessage?: string;
  onClose: () => void;
}

export function DetailDrawer({
  open,
  title,
  sections = [],
  loading = false,
  errorMessage,
  onClose,
}: DetailDrawerProps) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleId = 'detail-drawer-title';

  useEffect(() => {
    if (open) titleRef.current?.focus();
  }, [open]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        'aria-labelledby': titleId,
        sx: {
          width: mobile ? '100vw' : { sm: 480, md: 520, lg: 560 },
          maxWidth: '100vw',
          height: mobile ? '100dvh' : '100%',
          borderRadius: mobile ? 0 : '10px 0 0 10px',
        },
      }}
    >
      <Stack sx={{ height: '100%', minHeight: 0 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 3, py: 2, minHeight: 64 }}
        >
          <Typography id={titleId} ref={titleRef} variant="h6" tabIndex={-1}>
            {title}
          </Typography>
          <IconButton aria-label="Close details" onClick={onClose} edge="end">
            <CloseOutlinedIcon />
          </IconButton>
        </Stack>
        <Divider />
        <Box sx={{ overflowY: 'auto', p: { xs: 2, sm: 3 }, flex: 1 }}>
          {loading ? (
            <Stack role="status" alignItems="center" spacing={1.5} sx={{ py: 5 }}>
              <CircularProgress aria-label="Loading details" />
              <Typography variant="body2" color="text.secondary">
                Loading details
              </Typography>
            </Stack>
          ) : errorMessage ? (
            <Alert severity="error" role="alert">
              {errorMessage}
            </Alert>
          ) : (
            <Stack spacing={3}>
              {sections.map((section) => (
                <Box component="section" key={section.title}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    {section.title}
                  </Typography>
                  {section.content}
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Drawer>
  );
}
