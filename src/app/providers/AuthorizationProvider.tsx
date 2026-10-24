import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import { AuthorizationContext } from './AuthorizationContext';
import { AuthorizationContextValue } from './AuthorizationContext';
import type { AuthenticationState } from './AuthorizationContext';
import { authAdapter, BackendContractPendingError } from '../../services/http/contracts';
import { LoginPage } from '../../features/LoginPage';
import type { AuthorizationContext as LegacyAuthorizationContext } from '../../types/access';

export function AuthorizationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthenticationState>({ status: 'checking' });

  const retrySession = useCallback(async () => {
    setState({ status: 'checking' });
    try {
      const identity = await authAdapter.restoreSession();
      setState({ status: 'authenticated', identity });
    } catch (error) {
      setState({
        status: 'unavailable',
        message:
          error instanceof BackendContractPendingError
            ? 'The authentication and session contract has not been supplied by the backend.'
            : 'The session could not be verified. Protected pages remain unavailable.',
      });
    }
  }, []);

  const signOut = useCallback(async () => {
    await authAdapter.signOut();
    setState({ status: 'unauthenticated' });
  }, []);

  useEffect(() => {
    void retrySession();
  }, [retrySession]);

  useEffect(() => {
    const handleExpiredSession = () => {
      setState({
        status: 'expired',
        message: 'Your session expired. Sign in again after the authentication service is available.',
      });
    };
    window.addEventListener('klop:session-expired', handleExpiredSession);
    return () => window.removeEventListener('klop:session-expired', handleExpiredSession);
  }, []);

  const value = useMemo(
    () => ({ state, retrySession, signOut }),
    [state, retrySession, signOut],
  );
  const legacyAuthorization = useMemo<LegacyAuthorizationContext | null>(() => {
    if (state.status !== 'authenticated') {
      return null;
    }
    return {
      canAccessRoute: (path) =>
        state.identity.authorizedRoutes.includes(path),
      tenantId: state.identity.tenantId,
      tenantName: null,
    };
  }, [state]);

  return (
    <AuthorizationContext.Provider value={value}>
      <AuthorizationContextValue.Provider value={legacyAuthorization}>
        {children}
      </AuthorizationContextValue.Provider>
    </AuthorizationContext.Provider>
  );
}

export function useAuthorization() {
  const value = useContext(AuthorizationContext);
  if (!value) {
    throw new Error('useAuthorization must be used within AuthorizationProvider.');
  }
  return value;
}

export function ProtectedRoute({
  children,
  requiredRoute,
}: {
  children: ReactNode;
  requiredRoute?: string;
}) {
  const { state, retrySession } = useAuthorization();
  const location = useLocation();

  if (state.status === 'checking') {
    return <Box role="status" sx={{ p: 4 }}>Verifying your session…</Box>;
  }
  if (state.status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (state.status === 'unavailable') {
    return <LoginPage authError={state.message} onRetry={() => void retrySession()} />;
  }
  if (state.status === 'expired') {
    return <LoginPage authError={state.message} onRetry={() => void retrySession()} />;
  }
  if (
    requiredRoute &&
    !state.identity.authorizedRoutes.includes(requiredRoute)
  ) {
    return (
      <Stack role="alert" spacing={1} sx={{ p: 4 }}>
        <Typography variant="h5">Access unavailable</Typography>
        <Typography color="text.secondary">
          Your verified session does not grant access to this page.
        </Typography>
      </Stack>
    );
  }

  return children;
}
