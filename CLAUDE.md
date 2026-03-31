# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start dev server
npm run build         # Type-check + build for production
npm run build-only    # Build without type checking
npm run preview       # Preview production build

npm run test:unit     # Run unit tests with Vitest
npm run type-check    # Run vue-tsc type checking
npm run lint          # Run all linters (oxlint + eslint) with auto-fix
npm run format        # Format src/ with Prettier
```

## Architecture

**Biznest-App** is a Vue 3 + TypeScript + Vite business management platform using Supabase as the backend.

### Key layers

| Layer | Location | Purpose |
|---|---|---|
| Views | `src/views/` | Route-level smart components that orchestrate data |
| Components | `src/components/` | Reusable, presentational UI (no data fetching) |
| Stores | `src/stores/` | Pinia global state (currently only `auth.store.ts`) |
| Services | `src/services/` | All Supabase/API calls — never fetch directly in components |
| Composables | `src/composables/` | Stateful logic hooks (`use` prefix) |
| Utils | `src/utils/` | Stateless pure helpers (no Vue imports) |
| Types | `src/types/` | Centralized TypeScript definitions |
| Layouts | `src/layouts/` | Structural wrappers that contain `<router-view />` |

### Authentication flow

1. `main.ts` mounts app with Pinia + Router
2. `auth.store.ts` initializes a Supabase auth state listener on startup
3. Router guards in `src/router/index.ts` check `isInitialized` before navigating
4. Route meta fields `requiresAuth` and `requiresGuest` control access
5. Three layouts map to route groups: `OuterLayout` (public), `AuthLayout` (login/register), `InnerLayout` (admin dashboard with sidebar)

### UI component system

- Built on **Reka UI** with Shadcn-style wrappers in `src/components/ui/`
- Maps integration uses Leaflet via composables in `src/composables/map/`
- Alert/toast system exposed via `useAlert()` composable; `<AlertContextHost />` must be mounted

### Environment variables

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Typed in `src/env.d.ts`. The Supabase client is a singleton in `src/services/supabase.client.ts`.

## Coding standards

- **Composition API only** — always use `<script setup lang="ts">`
- **Strict TypeScript** — define all types, avoid `any`
- **Absolute imports** — use `@/` alias over relative paths
- **Naming:** Vue components PascalCase, composables camelCase with `use` prefix, services/utils kebab-case (`auth.service.ts`)
- Prefer existing `src/components/ui/` components before creating new ones
