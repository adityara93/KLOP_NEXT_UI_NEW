import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { portalApi } from '../../services/http/contracts';
import type {
  NotificationFilter,
  NotificationSummary,
} from '../../services/http/contracts';

export function NotificationCenter() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const open = Boolean(anchor);

  const refresh = useCallback(async () => {
    try {
      setSummary(await portalApi.getNotifications(filter));
      setError('');
    } catch {
      setSummary(null);
      setError('Notification service contract is pending; no notifications are available.');
    }
  }, [filter]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const markRead = async (notificationId: string) => {
    setBusyId(notificationId);
    try {
      await portalApi.markNotificationRead(notificationId);
      await refresh();
    } catch {
      setError('The notification could not be marked read because the backend contract is pending.');
    } finally {
      setBusyId(null);
    }
  };

  const markAllRead = async () => {
    setBusyId('all');
    try {
      await portalApi.markAllNotificationsRead();
      await refresh();
    } catch {
      setError('Notifications could not be marked read because the backend contract is pending.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <IconButton
        aria-label={
          summary
            ? `Notifications, ${summary.unreadCount} unread`
            : 'Notifications, count unavailable'
        }
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        <Badge badgeContent={summary?.unreadCount ?? 0} color="error">
          <NotificationsOutlinedIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: { width: { xs: 'calc(100vw - 24px)', sm: 380 }, maxWidth: '100vw' } } }}
        MenuListProps={{ 'aria-label': 'Latest notifications' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography fontWeight={700}>Notifications</Typography>
            <Button
              size="small"
              disabled={!summary || summary.unreadCount === 0 || busyId !== null}
              onClick={() => void markAllRead()}
            >
              Mark all read
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" display="block">
            Latest five · refreshed every 60 seconds while signed in
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={filter}
            onChange={(_, value: NotificationFilter | null) => {
              if (value) setFilter(value);
            }}
            aria-label="Notification filters"
            sx={{ mt: 1, display: 'flex', flexWrap: 'wrap' }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="unread">Unread</ToggleButton>
            <ToggleButton value="failed">Failed</ToggleButton>
            <ToggleButton value="alerts">Alerts</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Divider />
        {error ? (
          <Box sx={{ p: 1.5 }}><Alert severity="info">{error}</Alert></Box>
        ) : summary?.latest.length ? (
          summary.latest.slice(0, 5).map((item) => (
            <MenuItem
              key={item.id}
              disabled={busyId === item.id}
              onClick={() => !item.read && void markRead(item.id)}
              sx={{ whiteSpace: 'normal', alignItems: 'flex-start' }}
            >
              <Stack spacing={0.5}>
                <Typography variant="body2" fontWeight={item.read ? 400 : 700}>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.eventType} · {item.createdAt}
                </Typography>
              </Stack>
            </MenuItem>
          ))
        ) : (
          <Box role="status" sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">No notifications.</Typography>
          </Box>
        )}
      </Menu>
    </>
  );
}
