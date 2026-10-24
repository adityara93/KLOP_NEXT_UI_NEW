# KLOP NEXT UI

React, TypeScript, Vite, MUI, and React Router UI for the KLOP NEXT portal.
This folder consolidates the WSL-03 implementation through WSL-15 handoff
material while retaining the existing target project configuration and
target-only shared foundation files.

## Local development

```sh
npm install
npm run dev
```

The UI includes protected routing, session/authentication boundaries,
permission-filtered navigation, shared portal components, and service
interfaces. Backend authentication and data contracts remain pending; the
service adapters intentionally do not fabricate successful sessions, records,
or mutations. See [docs/IMPLEMENTATION_HANDOFF.md](./docs/IMPLEMENTATION_HANDOFF.md)
for known integration blockers and the route-to-service map.

## Routes

- `/login`
- `/dashboard`
- `/module-access`
- `/monitoring`
- `/configuration`
- `/configuration/tenants`
- `/configuration/users`
- `/configuration/modules`
- `/configuration/access`
- `/configuration/integrations`
- `/configuration/audit`

Routes are frontend paths, not backend API endpoints. No production API URL or
credential is configured in this project.

## Shared UI foundation

- `src/app/providers` and `src/app/theme`: application providers and theme.
- `src/app/router`: frontend route metadata.
- `src/components`: shared layout, data display, feedback, forms, and dialog
  components.
- `src/features`: route-level pages and login boundary.
- `src/services/http`: typed auth and portal service contracts/adapters.
- `src/hooks`, `src/types`, and `src/utils`: shared implementation support.

The frozen baseline is a separate read-only reference and is not part of this
project folder.
