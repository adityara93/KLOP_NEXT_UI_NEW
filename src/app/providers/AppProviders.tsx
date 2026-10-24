import type { ReactNode } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { theme } from '../theme/theme';
import { AuthorizationProvider } from './AuthorizationProvider';
import { ContextualFeedbackProvider } from '../../components/feedback/ContextualFeedback';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ContextualFeedbackProvider>
        <BrowserRouter>
          <AuthorizationProvider>{children}</AuthorizationProvider>
        </BrowserRouter>
      </ContextualFeedbackProvider>
    </ThemeProvider>
  );
}
