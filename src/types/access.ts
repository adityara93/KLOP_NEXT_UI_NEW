import type { RouteDefinition } from '../app/router/routes'

export interface AuthorizationContext {
  canAccessRoute: (
    path: RouteDefinition['path'],
    tenantId: string | null,
  ) => boolean
  tenantId: string | null
  tenantName: string | null
}
