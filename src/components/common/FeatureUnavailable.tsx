import { Box, Paper, Typography } from '@mui/material'
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined'
import { routeDefinitions } from '../../app/router/routes'
import { useLocation } from 'react-router-dom'

interface FeatureUnavailableProps {
  title: string
}

export function FeatureUnavailable({ title }: FeatureUnavailableProps) {
  const location = useLocation()
  const route = routeDefinitions.find((item) => item.path === location.pathname)

  return (
    <Paper
      variant="outlined"
      sx={{
        maxWidth: 760,
        mx: 'auto',
        mt: { xs: 2, md: 4 },
        p: { xs: 3, md: 5 },
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          mb: 2,
          display: 'grid',
          placeItems: 'center',
          color: 'primary.main',
          bgcolor: 'rgba(37, 99, 235, 0.08)',
          borderRadius: 1.5,
        }}
      >
        <ConstructionOutlinedIcon aria-hidden="true" />
      </Box>
      <Typography component="h2" variant="h1" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: 14, lineHeight: 1.7 }}>
        {route?.description ??
          'This route is not part of the current implementation scope.'}{' '}
        This feature is not implemented in WSL-02.
      </Typography>
    </Paper>
  )
}
