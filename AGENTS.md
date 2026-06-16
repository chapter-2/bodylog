# BodyLog — Agent Guide

## Project Overview

Single-user fitness tracker (gym, calisthenics, weight). Nuxt 4 + Nitro server engine. Turso (libSQL) DB. Cookie-based auth. No SSR toggle — client-heavy.

**Stack:** Nuxt 4, TypeScript, Bun, Nuxt UI v4, Tailwind CSS v4, Lucide icons, Turso/libSQL, scrypt auth.

**Domain:** Track workouts per week/day, log weight entries, export data for AI analysis. Training modes: gym, calisthenics, cardio, custom.

---

## Project Structure

```
bodylog-turso/
├── app/                    # Nuxt app layer (UI)
│   ├── app.vue             # Root layout — Navbar, Footer, modals, onboarding, timer
│   ├── error.vue           # 404/500 error page
│   ├── assets/css/main.css # Tailwind v4 @import + custom @theme tokens
│   ├── components/         # Vue components
│   │   ├── editor/         # Program editor components
│   │   ├── workout/        # Workout session components (ExerciseCard, SaveFooter, etc.)
│   │   └── profile/        # Settings page sub-components
│   ├── composables/        # Shared state logic
│   │   ├── useAuth.ts      # Auth state, cookie mgmt, login/logout/setup
│   │   ├── useMode.ts      # Training mode cookie (gym/calist/cardio/custom)
│   │   └── useTimer.ts     # Rest timer (audio, vibration, notifications)
│   ├── pages/              # Route pages
│   │   ├── index.vue       # Landing page
│   │   ├── login.vue       # Login
│   │   ├── forgot-password.vue
│   │   ├── reset-password.vue
│   │   ├── gym.vue         # Gym workout log
│   │   ├── calist.vue      # Calisthenics workout log
│   │   ├── weight.vue      # Weight tracker
│   │   ├── coach.vue       # AI Coach export page
│   │   └── profile.vue     # Settings
│   └── utils/              # Client-side utilities
│       ├── tourConfig.ts   # Onboarding tour steps + positioning
│       └── workoutDefaults.ts  # Default gym & calist programs
├── server/                 # Nitro server layer
│   ├── utils/
│   │   ├── db.ts           # Turso client singleton, schema init (10 tables)
│   │   └── auth.ts         # hashPassword, verifyPassword (scrypt), requireAuth middleware
│   └── api/
│       ├── auth/           # 7 endpoints: status, setup, login, me, forgot, reset, password
│       ├── gym/            # get.get.ts, save.post.ts
│       ├── calist/         # get.get.ts, save.post.ts
│       ├── program/        # get.get.ts, save.post.ts, start-date.post.ts
│       ├── weight/         # get.get.ts, save.post.ts, delete.delete.ts
│       └── export/         # all.get.ts
├── types/
│   └── index.ts            # Shared TypeScript interfaces
├── public/                 # Static assets (favicon, manifest, robots.txt)
└── nuxt.config.ts          # Nuxt config
```

---

## Architecture

### Data Flow Pattern (Gym example)

1. `gym.vue` page mounts → calls `useAuth().secureFetch("/api/gym/get")` or `/api/gym/get?day=monday`
2. Server returns flat array: `[week, day, date, time, exercise_name, set1..set4, completed, notes, session_note]`
3. Client parses flat data into `GymSession` objects (with `Exercise[]` containing `WorkoutSet[]`)
4. User edits sets → page calls `/api/gym/save.post` with `GymSession` payload
5. Server upserts via batch `INSERT ... ON CONFLICT DO UPDATE`
6. Same pattern for calisthenics (`/api/calist/get`, `/api/calist/save`), weight (`/api/weight/get`, `/api/weight/save`, `/api/weight/delete`)

### Auth Flow

- **Server** (`server/utils/auth.ts`): scrypt password hashing. `requireAuth(event)` reads `auth_token` cookie → validates session in DB → sets `event.context.user_id`. Throws `createError({ statusCode: 401 })` if missing/expired.
- **Client** (`app/composables/useAuth.ts`): `useCookie("auth_token")` auto-check on mount. Provides `login`, `setupAccount`, `logout`, `secureFetch` helpers.

### State Management

No Pinia/Vuex. All state via Nuxt `useState()` and composables:

- `useAuth()` — user object + auth state
- `useMode()` — training mode, intensity, frequency (persisted to cookies, 1 year)
- `useTimer()` — rest timer state (in-memory, composable singleton pattern)

### Training Mode System

- Persisted in cookies: `training_mode`, `training_intensity`, `training_frequency`
- Values: `"gym"`, `"calist"`, `"cardio"`, `"custom"`
- Determines which pages are shown (gym vs calist log), navbar links, and default programs
- `hasMode` computed: true only for gym or calist mode

---

## Database Schema (10 tables)

Initialized in `server/utils/db.ts` via `initDb()`. All tables enforce `user_id` foreign key.

| Table              | Purpose                      | Key Columns                                                                                                      |
| ------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `users`            | User accounts                | `id`, `username`, `password_hash`                                                                                |
| `sessions`         | Cookie auth sessions         | `token`, `user_id`, `expires_at`                                                                                 |
| `password_resets`  | Password reset tokens        | `token`, `user_id`, `expires_at`                                                                                 |
| `weight_entries`   | Weekly weight logs           | `user_id`, `week`, `date`, `weight`, `notes` — UNIQUE(user_id, week)                                             |
| `gym_sessions`     | Gym workout sessions         | `user_id`, `week`, `day`, `exercise_name`, `set1..set4`, `completed` — UNIQUE(user_id, week, day, exercise_name) |
| `calist_sessions`  | Calisthenics sessions        | Same structure as gym_sessions                                                                                   |
| `program_config`   | Key-value program settings   | `user_id`, `key`, `value` — PK(user_id, key)                                                                     |
| `cardio_sessions`  | Cardio sessions              | `user_id`, `week`, `day`, `type`, `duration_min`, `distance_km`                                                  |
| `custom_programs`  | Custom program headers       | `user_id`, `name`                                                                                                |
| `custom_days`      | Days within custom programs  | `program_id`, `day_name`, `sort_order`                                                                           |
| `custom_exercises` | Exercises within custom days | `day_id`, `exercise_name`, `target_sets`, `sort_order`                                                           |

### Schema Quirks

- Sets stored as flat columns (`set1 TEXT, set2 TEXT, set3 TEXT, set4 TEXT`) — limited to 4 sets.
- Set format: `"20kg × 10"` or `"-"` for empty.
- `completed` stored as string `"YES"` / `"NO"`.
- `weight_entries` has UNIQUE(user_id, week) — one entry per week.
- `gym_sessions` and `calist_sessions` use UNIQUE(user_id, week, day, exercise_name).

---

## Key TypeScript Interfaces (`types/index.ts`)

```typescript
interface WorkoutSet {
  weight: number;
  reps: number;
}
interface Exercise {
  name: string;
  selectedVariant?: string;
  sets: WorkoutSet[];
  note?: string;
}
interface WorkoutDay {
  week: number;
  day: string;
  date: string;
  time?: string;
  exercises: Exercise[];
  completed: boolean;
  sessionNote?: string;
}
interface GymSession {
  week: number;
  day: string;
  date: string;
  time?: string;
  exercises: Exercise[];
  completed: boolean;
  sessionNote?: string;
}
interface CalistExercisePayload {
  name: string;
  sets: string[];
  note: string;
}
interface CalistSession {
  week: number;
  day: string;
  date: string;
  time?: string;
  exercises: CalistExercisePayload[];
  completed: boolean;
  sessionNote?: string;
}
```

---

## Coding Conventions

1. **File naming:** kebab-case for `.vue` and API route files (`login.post.ts`, `get.get.ts`)
2. **API routes:** `[method].[handler].ts` (Nitro convention). Methods: `get`, `post`, `delete`
3. **Composables:** PascalCase `useXxx.ts` exporting named function
4. **TypeScript:** Loose — `@ts-ignore` used in `useAuth.ts`, `any` types common in API handlers. No strict mode enforced
5. **Imports:** `~` alias (`~/types`). Vue/Nuxt auto-imports enabled (no manual `import { ref } from 'vue'` in most files)
6. **Error handling:** Server throws `createError({ statusCode, message })`. Client wraps `$fetch` in try/catch
7. **Cookie management:** `useCookie()` composable for auth tokens and preferences
8. **CSS:** Tailwind utility classes + scoped `<style>` blocks. Custom CSS custom properties in `@theme` directive. No CSS preprocessor
9. **No middleware directory** — auth checks per-endpoint via `requireAuth()`, page guards via `onMounted`/`watchEffect`

---

## Build / Test / Lint

| Script        | Command         |
| ------------- | --------------- |
| `dev`         | `nuxt dev`      |
| `build`       | `nuxt build`    |
| `generate`    | `nuxt generate` |
| `preview`     | `nuxt preview`  |
| `postinstall` | `nuxt prepare`  |

**No test, lint, format, or typecheck scripts configured.** No ESLint, Prettier, Biome, Husky, or lint-staged. No test files (`.spec.*`, `.test.*`) exist. CI only runs `nuxt build`.

Docker: `docker compose up --build -d`. Alpine Node 20, `npm install` (not Bun), `nuxt build`.

---

## Constraints & Risks

- **No test coverage** — any change risks regressions. Manual verification required.
- **No linting/formatting** — code style inconsistent (mixed quotes, semicolons).
- **No type-checking script** — `tsconfig.json` references generated files, no `vue-tsc --noEmit` in CI.
- **Flat data format** — sets stored as strings in fixed columns (`set1..set4`). Schema limits 4 sets per exercise. No normalization.
- **Single-user oriented** — multi-tenant via `user_id` but no role/permission system.
- **Password resets** store tokens in `password_resets` table but no email sending implemented (manual token exchange).
- **Docker uses `npm install`** despite `bun.lock` in repo — build mismatch risk.
- **Turso required** — app won't start without valid `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
- **No type-safe API client** — `$fetch` with `@ts-ignore` on responses, no shared API contract/types between client and server.
- **Rest timer** uses composable singleton pattern (module-level refs) — shared across all pages via `GlobalTimer.vue`.

---

## Agent Workflow Guidelines

### Making Changes

1. **Read first:** `nuxt.config.ts` (config surface), `server/utils/db.ts` (schema), `types/index.ts` (data contracts)
2. **Follow existing patterns:** flat data format, kebab-case files, composable state, per-endpoint auth
3. **No speculative scaffolding:** Don't add future-proofing, placeholder code, or TODOs
4. **Minimal edits:** Prefer narrow correct changes over broad rewrites
5. **Verify:** Build check (`nuxt build`) if possible. Manual smoke test for UI changes

### Common Patterns

- **Adding a new page:** Create `app/pages/<name>.vue` + optional API routes in `server/api/<name>/`
- **Adding a new API endpoint:** Create `server/api/<name>/[method].[handler].ts`, call `requireAuth(event)`, use `getDb()`
- **Adding a new composable:** Create `app/composables/useXxx.ts`, use `useState()` for reactive singleton state
- **Adding a new DB table:** Add `CREATE TABLE IF NOT EXISTS` statement in `server/utils/db.ts` `initDb()`, ensure `user_id` FK

### Risk Awareness

- Schema changes affect both `gym_sessions` and `calist_sessions` tables (parallel structure)
- Cookie changes affect all logged-in users (auth token, mode preferences)
- Flat column limit (4 sets) affects workout data storage
- No migration system — schema changes via `CREATE TABLE IF NOT EXISTS` in `initDb()` only
