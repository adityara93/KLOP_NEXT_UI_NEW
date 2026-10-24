import { useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Breadcrumbs,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { routes } from '../../app/router/routes';
import { useAuthorization } from '../../app/providers/AuthorizationProvider';
import { NotificationCenter } from '../feedback/NotificationCenter';

const NAVY = '#142D4E';
const EXPANDED = 256;
const COLLAPSED = 72;

function iconFor(path: string) {
  if (path === '/dashboard') return <DashboardOutlinedIcon />;
  if (path === '/module-access') return <AppsOutlinedIcon />;
  if (path === '/monitoring') return <MonitorHeartOutlinedIcon />;
  if (path === '/configuration') return <SettingsOutlinedIcon />;
  return <CircleOutlinedIcon fontSize="small" />;
}

export function PortalLayout() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  const location = useLocation();
  const { state, signOut } = useAuthorization();
  const identity = state.status === 'authenticated' ? state.identity : null;
  const visibleRoutes = routes.filter((route) =>
    identity?.authorizedRoutes.includes(route.path),
  );
  const active = routes.find((route) => route.path === location.pathname);
  const width = collapsed && !mobile ? COLLAPSED : EXPANDED;

  const sidebar = (
    <Box sx={{ height: '100%', bgcolor: NAVY, color: '#fff', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        sx={{
          px: 2,
          minHeight: '64px !important',
          display: 'flex',
          justifyContent: collapsed && !mobile ? 'center' : 'space-between',
        }}
      >
        {(!collapsed || mobile) && (
          <Typography fontWeight={800} letterSpacing={1}>KLOP NEXT</Typography>
        )}
        {!mobile && (
          <IconButton
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed((value) => !value)}
            sx={{ color: '#fff' }}
          >
            {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,.2)' }} />
      <List component="nav" aria-label="Portal navigation" sx={{ px: 1, flex: 1, overflowY: 'auto' }}>
        {visibleRoutes.map((route) => (
          <Box key={route.path}>
            {route.path === '/configuration' && (
              <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,.2)' }} />
            )}
            <Tooltip title={collapsed && !mobile ? route.label : ''} placement="right">
              <ListItemButton
                component={RouterLink}
                to={route.path}
                onClick={() => setMobileOpen(false)}
                selected={route.path === location.pathname}
                aria-current={route.path === location.pathname ? 'page' : undefined}
                sx={{
                  borderRadius: 1,
                  mb: 0.4,
                  minHeight: 44,
                  justifyContent: collapsed && !mobile ? 'center' : 'initial',
                  color: '#fff',
                  '&.Mui-selected': { bgcolor: 'rgba(255,255,255,.19)' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,.12)' },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: collapsed && !mobile ? 0 : 38 }}>
                  {iconFor(route.path)}
                </ListItemIcon>
                {(!collapsed || mobile) && (
                  <ListItemText primary={route.label} primaryTypographyProps={{ fontSize: 13 }} />
                )}
              </ListItemButton>
            </Tooltip>
          </Box>
        ))}
      </List>
      {(!collapsed || mobile) && (
        <Typography variant="caption" sx={{ p: 2, color: '#cbd5e1' }}>
          Tenant context is session-scoped
        </Typography>
      )}
    </Box>
  );

  const handleSignOut = async () => {
    setSignOutError('');
    try {
      await signOut();
    } catch {
      setSignOutError('Sign out could not be confirmed by the authentication service.');
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: '#fff',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          ml: { md: `${width}px` },
          width: { md: `calc(100% - ${width}px)` },
          transition: reducedMotion ? 'none' : 'width 180ms ease, margin-left 180ms ease',
        }}
      >
        <Toolbar sx={{ gap: 1, minHeight: '64px !important' }}>
          {mobile && (
            <IconButton aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={700}>KLOP NEXT</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
                {identity?.tenantId ? `Tenant ${identity.tenantId}` : 'Tenant context unavailable'}
            </Typography>
          </Stack>
          <NotificationCenter />
          <Stack sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <Typography variant="body2" fontWeight={600}>{identity?.displayName}</Typography>
            <Typography variant="caption" color="text.secondary">{identity?.role}</Typography>
          </Stack>
          <Button size="small" onClick={() => void handleSignOut()}>Sign out</Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={mobile ? 'temporary' : 'permanent'}
        open={mobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: mobile ? 0 : width,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: mobile ? EXPANDED : width,
            boxSizing: 'border-box',
            border: 0,
            transition: reducedMotion ? 'none' : 'width 180ms ease',
          },
        }}
      >
        {sidebar}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, pt: '64px' }}>
        {signOutError && (
          <Alert severity="error" role="alert" onClose={() => setSignOutError('')}>
            {signOutError}
          </Alert>
        )}
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
          <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: 1 }}>
            <Typography variant="caption">Portal</Typography>
            <Typography variant="caption">{active?.label ?? 'Not Found'}</Typography>
          </Breadcrumbs>
          <Typography variant="h5">{active?.label ?? 'Not Found'}</Typography>
          <Typography variant="body2" color="text.secondary">
            {active?.description ?? 'Unknown route'}
          </Typography>
        </Box>
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}><Outlet /></Box>
      </Box>
    </Box>
  );
}
