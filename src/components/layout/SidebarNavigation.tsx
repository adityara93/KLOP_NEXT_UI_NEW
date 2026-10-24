import { Box, Drawer, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useLocation } from 'react-router-dom'
import { routeDefinitions } from '../../app/router/routes'
import type { AuthorizationContext } from '../../types/access'
import { canNavigateTo } from '../../utils/navigation'
import { AccessContextNotice } from '../feedback/AccessContextNotice'
import { SidebarRouteList } from './SidebarRouteList'

interface SidebarNavigationProps {
  mobile: boolean
  open: boolean
  expanded: boolean
  authorization: AuthorizationContext | null
  onClose: () => void
}

export function SidebarNavigation({
  mobile,
  open,
  expanded,
  authorization,
  onClose,
}: SidebarNavigationProps) {
  const theme = useTheme()
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const location = useLocation()
  const width = expanded ? 256 : 72

  return (
    <Drawer
      variant={mobile ? 'temporary' : 'permanent'}
      open={mobile ? open : true}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: mobile ? 256 : width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          position: 'relative',
          width: mobile ? 256 : width,
          height: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          bgcolor: 'secondary.main',
          color: '#FFFFFF',
          border: 0,
          transition: reducedMotion
            ? 'none'
            : theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.shorter,
              }),
        },
      }}
    >
      <Box
        component="nav"
        aria-label="Portal navigation"
        sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}
      >
        <Box sx={{ flex: 1, px: expanded || mobile ? 1.5 : 1, py: 2 }}>
          {authorization ? (
            <SidebarRouteList
              routes={routeDefinitions.filter((route) =>
                canNavigateTo(route, authorization),
              )}
              expanded={expanded || mobile}
              currentPath={location.pathname}
              onNavigate={onClose}
            />
          ) : (
            <Box sx={{ px: expanded || mobile ? 0 : 0.5 }}>
              {expanded || mobile ? (
                <AccessContextNotice />
              ) : (
                <Typography
                  aria-label="Navigation hidden until authorized session is connected"
                  sx={{
                    mx: 'auto',
                    mt: 1,
                    width: 36,
                    height: 36,
                    border: '1px solid rgba(255,255,255,0.32)',
                    borderRadius: 1,
                    color: 'rgba(255,255,255,0.8)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  —
                </Typography>
              )}
            </Box>
          )}
        </Box>
        <Typography
          variant="caption"
          sx={{
            display: expanded || mobile ? 'block' : 'none',
            px: 2,
            pb: 2,
            color: 'rgba(255,255,255,0.65)',
          }}
        >
          Shared UI foundation
        </Typography>
      </Box>
    </Drawer>
  )
}
