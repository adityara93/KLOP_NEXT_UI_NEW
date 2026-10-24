import type { RouteDefinition } from '../app/router/routes'
import type { AuthorizationContext } from '../types/access'

export function canNavigateTo(
  route: RouteDefinition,
  authorization: AuthorizationContext | null,
): boolean {
  if (!authorization) {
    return false
  }

  return authorization.canAccessRoute(route.path, authorization.tenantId)
}
