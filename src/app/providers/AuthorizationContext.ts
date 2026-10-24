import { createContext, useContext } from 'react';
import type { SessionIdentity } from '../../services/http/contracts';
import type { AuthorizationContext as LegacyAuthorizationContext } from '../../types/access';

export type AuthenticationState =
  | { status: 'checking' }
  | { status: 'unauthenticated' }
  | { status: 'expired'; message: string }
  | { status: 'unavailable'; message: string }
  | { status: 'authenticated'; identity: SessionIdentity };

export interface AuthorizationActions {
  state: AuthenticationState;
  retrySession: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthorizationContext =
  createContext<AuthorizationActions | null>(null);

export const AuthorizationContextValue =
  createContext<LegacyAuthorizationContext | null>(null);

export function useAuthorizationContext() {
  return useContext(AuthorizationContextValue);
}
