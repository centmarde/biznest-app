# AI Assistant Instructions for BIZNEST-APP

## Project Overview

This is a frontend application built with **Vue 3**, **TypeScript**, and **Vite**.
It utilizes the **Composition API** (specifically `<script setup lang="ts">`), **Pinia** for state management, and **Vue Router** for routing.

## Folder Structure & Architectural Rules

When generating or modifying code, strictly adhere to the following directory responsibilities:

### 1. `src/views/` (Pages / Smart Components)

- **Purpose:** Route-level components mapping directly to URLs in `src/router/`.
- **Rule:** Keep these focused on layout composition, fetching data via `services`, and connecting data to `stores`. They should orchestrate `components/` rather than containing complex, nested HTML directly.

### 2. `src/components/` (UI / Dumb Components)

- **Purpose:** Reusable, isolated UI pieces (e.g., Buttons, Cards, Modals).
- **Rule:** Components here should ideally be "dumb" or presentational. They receive data via `defineProps` and emit events via `defineEmits`. Avoid making direct API calls from within these components.

### 3. `src/types/` (TypeScript Definitions)

- **Purpose:** Centralized location for all TypeScript `interfaces`, `types`, and `enums`.
- **Rule:** Always extract shared data models here (e.g., `user.types.ts`, `api.types.ts`). Do not clutter `.vue` files with large interface declarations if they are used in more than one place.

### 4. `src/composables/` (Vue Composition API Hooks)

- **Purpose:** Reusable, stateful logic.
- **Rule:** Name files with a `use` prefix (e.g., `useAuth.ts`, `usePagination.ts`). Extract reactive logic here if it is shared across multiple views or components.

### 5. `src/services/` (API & External Integrations)

- **Purpose:** Abstracted API calls.
- **Rule:** Vue components should never call `fetch` or `axios` directly. All network requests must be handled by functions exported from this directory (e.g., `auth.service.ts`, `user.service.ts`). Use types from `src/types/` for requests and responses.

### 6. `src/utils/` (Stateless Helpers)

- **Purpose:** Pure JavaScript/TypeScript functions.
- **Rule:** Place data formatters, math utilities, or string manipulators here. These files should _not_ import anything from `vue` (no reactivity).

### 7. `src/stores/` (State Management)

- **Purpose:** Pinia stores for global state.
- **Rule:** Use Pinia setup syntax (functions returning reactive state/actions) over option syntax where possible.

### 8. `src/layouts/` (Structural Wrappers)

- **Purpose:** Global structural components like `DefaultLayout.vue` or `AuthLayout.vue` that contain `<router-view />`.

### 9. `src/assets/`

- **Purpose:** Static files, global CSS/SCSS, and fonts processed by Vite.

## Coding Standards

1.  **Strict TypeScript:** Always define types for function parameters, return types, Vue props (`defineProps<{ ... }>()`), and API responses. Avoid `any`.
2.  **Composition API:** Exclusively use `<script setup lang="ts">` for Vue components. Do not use the Options API.
3.  **Imports:** Prefer absolute imports starting with `@/` (mapping to `src/`) over relative paths (`../../`) for clarity.
4.  **Naming Conventions:**
    - Vue Components: PascalCase (e.g., `UserProfile.vue`), use Shadcn components if available and if not please install it.
    - Composables: camelCase with `use` prefix (e.g., `useTheme.ts`).
    - TypeScript files (services, utils, types): kebab-case or camelCase (e.g., `user.service.ts` or `userService.ts`). Maintain consistency.
