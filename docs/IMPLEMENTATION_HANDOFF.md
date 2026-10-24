# KLOP NEXT UI — Implementation Handoff

**State:** `UI SOURCE COMPLETE — BACKEND INTEGRATION PENDING — VERIFICATION DEFERRED`

This consolidated target contains the UI implementation for WSL-04 through WSL-13 and release-readiness notes for WSL-15. The source is not production-ready. Protected routes require a confirmed session and the current auth adapter cannot verify one. No build, lint, automated test, or browser QA was run during consolidation. WSL-14 verification remains **DEFERRED**.

## Local project and run instructions

Project path: `D:\PROJECT 2026\KLOP\NEXT UI\KLOP_NEXT_UI`

```powershell
Set-Location 'D:\PROJECT 2026\KLOP\NEXT UI\KLOP_NEXT_UI'
npm.cmd install
npm.cmd run dev
```

Available validation scripts are `npm run typecheck`, `npm run lint`, and `npm run build`. They have not been executed. The package manifest and lockfile are included with the consolidated UI source; dependency resolution and compatibility have not been verified.

## Environment configuration

- No environment variables are currently consumed by the frontend.
- Do not put access tokens, client secrets, credentials, or private keys in `VITE_*` variables; Vite variables are included in client-side code.
- Do not invent an API base URL. Configure API routing only after the existing backend URL, proxy strategy, auth/session transport, and deployment environment are verified.
- `.env.example` contains only a reminder not to put secrets in client-exposed variables.
- Vite's normal `dist` output is the static frontend artifact. Hosting, SPA rewrite rules, allowed origins, TLS, cache headers, and deployment environment remain deployment-owner decisions and are not configured here.

## Route-to-service mapping

| UI route/surface | UI/service boundary | Current state |
|---|---|---|
| `/login` and protected-route session check | `AuthAdapter.restoreSession`, `beginAzureSignIn`, `signInWithJwtFallback`, `signOut` | `BACKEND_CONTRACT_PENDING`; no sign-in success or token storage |
| Shared shell / page permissions / tenant context | Verified `SessionIdentity.authorizedRoutes`, role and `tenantId` | Contract and server authorization pending; navigation is permission-filtered |
| `/dashboard` | `PortalApi.getDashboard` | Pending; no fabricated KPI, activity, or entitlement data |
| Notification bell | `PortalApi.getNotifications`, `markNotificationRead`, `markAllNotificationsRead` | Pending; typed event allow-list; polling interval is 60 seconds only while authenticated shell is mounted |
| `/module-access` | `PortalApi.getApplications`, `launchApplication` | Catalog, effective entitlement and secure handoff pending |
| `/monitoring` | `PortalApi.getMonitoring` | Jobs, timelines, server filters/paging, health status and checked-at pending; no retry/cancel/reprocess |
| `/configuration/tenants` | `getTenants`, `updateMetadata('tenants')`, `updateLifecycle('tenants')` | Tenant API and mutable metadata/impact contract pending |
| `/configuration/users` | `getUsers`, `updateMetadata('users')`, `updateLifecycle('users')` | User scope, singleton signal, identity source and lifecycle impact pending |
| `/configuration/modules` | `getModules`, `updateMetadata('modules')`, `updateLifecycle('modules')` | Registry and mutation contracts pending |
| `/configuration/access` | `getAccessManagement` | Page access, tenant availability and single-user entitlement contracts pending |
| `/configuration/integrations` | `getIntegrations`, `updateMetadata('integrations')` | Safe registry/status contract pending; no secrets or endpoint/auth edit |
| `/configuration/audit` | `getAuditLogs` | Sanitized audit schema, filters and server pagination pending; read-only UI |

All paths above are **frontend routes or typed capability names**, not backend endpoint URLs. No backend URL, method, payload, response schema, or permission claim was inferred.

## Backend dependencies and unresolved contracts

1. Azure SSO initiation/callback, JWT fallback, current-session restoration, expiry notification, logout, cookie/token transport, CSRF policy, and error response behavior.
2. Effective portal page/action permissions, role naming, tenant scope, Platform Admin allowed tenant context selection, and cross-tenant enforcement.
3. Six application catalog records, tenant availability, user entitlements, secure handoff protocol, and launch error handling.
4. Dashboard aggregate definitions, scope, freshness timestamps, service-health source, attention-required rules, and recent activity schema.
5. Notification list/filter semantics, unread count, supported event mapping, mark-read authorization, and tenant/user scope.
6. Monitoring KPI definitions, filters/sort/pagination support, safe job detail/timeline schema, operational activity schema, and health status plus staleness rules.
7. Tenant/user/module safe list/detail schemas, exact mutable tenant metadata, concurrency tokens, lifecycle impact preview/action, audit behavior, and Platform Admin singleton protection.
8. Access page list/update, tenant application availability, one-user entitlement update, impact review, and effective-access evaluation.
9. Integration registry safe fields, configuration status, operational health and checked-at; exact metadata validation rules.
10. Audit record safe fields, searchable filters, timezone conventions, server sorting/paging, and per-role tenant scope.

No production API is currently integrated. Each capability is marked pending in the typed service adapter. Mutation forms cannot claim success; lifecycle controls remain disabled until impact review and authorization contracts exist. The source contains no backend/database changes.

## UI inventory

- `/login`: explicit unavailable auth state; Azure and JWT actions are disabled until wired to verified contracts.
- `/dashboard`: role-contextual shell, authorized application-shortcut empty state, and KPI/activity integration state.
- `/module-access`: search/category controls and secure-catalog pending/empty state.
- `/monitoring`: Jobs & Workflows, Service Health, Operational Activity tabs; no prohibited job actions.
- `/configuration`: route-permission-filtered hub cards.
- `/configuration/tenants`, `/configuration/users`, `/configuration/modules`, `/configuration/integrations`, `/configuration/audit`: adaptive search/filter, server-grid boundary, safe detail and supported metadata-edit boundary; audit remains read-only.
- `/configuration/access`: Tenant Page Access and Application Entitlement tabs, with Tenant Availability and User Entitlement subtabs.
- Shared shell: permission-filtered navigation, responsive drawer/collapse, session tenant label, sign-out boundary, and notification dropdown with All/Unread/Failed/Alerts filters.

Reusable WSL-03 components remain under `src/components/`: `AdaptiveToolbar`, `SharedDataGrid`, `StatusBadge`, `DetailDrawer`, `SharedEditForm`, `ConfirmationDialog`, `ContextualFeedback`, `EmptyState`, and `NotificationCenter`.

## Security and readiness blockers

- No session can currently be confirmed. Protected routes do not render business pages until authentication is integrated.
- UI permission gating is defense in depth only; backend authorization and tenant isolation must be verified.
- No tenant context switcher is implemented because no authorized context-switch contract is available. A missing `tenantId` is not treated as proof of Platform Admin scope.
- No application may launch until entitlement and secure handoff are verified. No token is placed in a URL.
- No production records, fake KPI counts, health claims, fake notifications, or mutation-success states are supplied.
- No static host or deployment-specific configuration exists. Production readiness requires backend, security, accessibility, and verification evidence.

## Workstream disposition

- **WSL-04:** Login/session/route-guard/permission/tenant-context UI boundary implemented; Azure/JWT/session integration blocked on backend contracts.
- **WSL-05:** Dashboard and notification UI boundaries implemented; all production values pending backend.
- **WSL-06:** Module catalog and launch boundary implemented; effective access and handoff pending.
- **WSL-07:** Three monitoring areas and read-only boundaries implemented; data and server capabilities pending.
- **WSL-08–13:** Configuration routes, grids, filters, safe detail/edit boundaries, and exclusions implemented; API contracts pending.
- **WSL-14:** Accessibility/responsive consistency changes applied in source; acceptance verification **DEFERRED** and not claimed complete.
- **WSL-15:** This handoff, dependency inventory, route-to-service mapping, environment notes, and deployment guidance prepared.

## Git handoff

The consolidated UI source is submitted for review on `feature/klop-next-ui-consolidated-wsl03-wsl15` as a pull request to `main`. Do not merge until review is complete. Backend integration and build, lint, test, and browser verification remain pending.
