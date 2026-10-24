import { Alert } from '@mui/material'

export function AccessContextNotice() {
  return (
    <Alert severity="info" variant="outlined" role="status">
      Navigation and tenant context are unavailable until an authorized session
      is connected.
    </Alert>
  )
}
