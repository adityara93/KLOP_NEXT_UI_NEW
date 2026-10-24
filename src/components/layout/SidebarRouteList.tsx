import { List, ListItemButton, ListItemText, Tooltip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { DashboardOutlined, FolderOpenOutlined } from '@mui/icons-material'
import type { RouteDefinition } from '../../app/router/routes'

interface SidebarRouteListProps {
  routes: RouteDefinition[]
  expanded: boolean
  currentPath: string
  onNavigate: () => void
}

const routeIcons: Record<string, typeof DashboardOutlined> = {
  '/dashboard': DashboardOutlined,
  '/module-access': FolderOpenOutlined,
}

export function SidebarRouteList({
  routes,
  expanded,
  currentPath,
  onNavigate,
}: SidebarRouteListProps) {
  const navigate = useNavigate()

  return (
    <List disablePadding>
      {routes.map((route) => {
        const Icon = routeIcons[route.path] ?? FolderOpenOutlined
        const selected =
          currentPath === route.path || currentPath.startsWith(`${route.path}/`)
        const item = (
          <ListItemButton
            key={route.path}
            selected={selected}
            aria-current={selected ? 'page' : undefined}
            aria-label={route.title}
            onClick={() => {
              navigate(route.path)
              onNavigate()
            }}
            sx={{
              minHeight: 44,
              mb: 0.5,
              px: expanded ? 1.5 : 1,
              justifyContent: expanded ? 'initial' : 'center',
              color: 'inherit',
              '&.Mui-selected': {
                bgcolor: 'rgba(255,255,255,0.14)',
              },
              '&.Mui-selected:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
              },
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
              },
              '&:focus-visible': {
                outline: '3px solid #93C5FD',
                outlineOffset: -3,
              },
            }}
          >
            <Icon aria-hidden="true" sx={{ minWidth: 24 }} />
            {expanded && (
              <ListItemText
                primary={route.title}
                sx={{ ml: 1.5, '& .MuiTypography-root': { fontSize: 14 } }}
              />
            )}
          </ListItemButton>
        )

        return expanded ? (
          item
        ) : (
          <Tooltip key={route.path} title={route.title} placement="right">
            {item}
          </Tooltip>
        )
      })}
    </List>
  )
}
