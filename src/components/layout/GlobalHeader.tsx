import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import MenuOpenOutlinedIcon from '@mui/icons-material/MenuOpenOutlined'
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'
import MenuIcon from '@mui/icons-material/Menu'

interface GlobalHeaderProps {
  mobile: boolean
  expanded: boolean
  tenantName: string | null
  onToggle: () => void
}

export function GlobalHeader({
  mobile,
  expanded,
  tenantName,
  onToggle,
}: GlobalHeaderProps) {
  const label = mobile
    ? 'Open navigation menu'
    : expanded
      ? 'Collapse sidebar'
      : 'Expand sidebar'

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', px: { xs: 2, md: 3 } }}>
        <Tooltip title={label}>
          <IconButton
            aria-label={label}
            aria-expanded={mobile ? undefined : expanded}
            onClick={onToggle}
            edge="start"
            sx={{ mr: 1.5, minWidth: 44, minHeight: 44 }}
          >
            {mobile ? (
              <MenuIcon />
            ) : expanded ? (
              <MenuOpenOutlinedIcon />
            ) : (
              <MenuOutlinedIcon />
            )}
          </IconButton>
        </Tooltip>
        <Typography
          component="div"
          sx={{
            color: 'secondary.main',
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: '0.01em',
          }}
        >
          KLOP NEXT
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: { xs: 'none', sm: 'block' }, fontSize: 13 }}
        >
          {tenantName ?? 'Tenant context unavailable'}
        </Typography>
      </Toolbar>
    </AppBar>
  )
}
