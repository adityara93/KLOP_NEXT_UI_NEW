import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  palette: {
    primary: {
      main: '#2563EB',
    },
    secondary: {
      main: '#142D4E',
    },
    background: {
      default: '#F7F9FC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#172B4D',
      secondary: '#64748B',
    },
    divider: '#E2E8F0',
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
    h1: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.35,
    },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F7F9FC',
        },
      },
    },
  },
})

export const theme = appTheme
