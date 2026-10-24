import { Box, Breadcrumbs, Link, Typography } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { routeDefinitions } from '../../app/router/routes'

export function PageContextHeader() {
  const location = useLocation()
  const route = routeDefinitions.find((item) => item.path === location.pathname)
  const title = route?.title ?? 'Page not found'

  return (
    <Box
      component="header"
      sx={{
        px: { xs: 2, md: 4 },
        py: { xs: 2.5, md: 3 },
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: 1 }}>
        <Link
          component={RouterLink}
          to="/dashboard"
          underline="hover"
          color="text.secondary"
          sx={{ fontSize: 12 }}
        >
          Portal
        </Link>
        <Typography color="text.primary" sx={{ fontSize: 12 }}>
          {title}
        </Typography>
      </Breadcrumbs>
      <Typography component="h1" variant="h1">
        {title}
      </Typography>
      {route && (
        <Typography
          color="text.secondary"
          sx={{ mt: 0.5, fontSize: 14, lineHeight: 1.6 }}
        >
          {route.description}
        </Typography>
      )}
    </Box>
  )
}
