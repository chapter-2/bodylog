# CLAUDE.md — BodyLog Project Context

---

## ⚠️ CRITICAL OUTPUT RULES (READ FIRST, FOLLOW ALWAYS)

1. **ALWAYS output complete files.** Every single file you modify or create must be written from the very first line to the very last line. Zero exceptions.
2. **NEVER use snippets, `...`, `// ... existing code`, `// rest of the file`, or any placeholder.** If you touch a file, you reproduce it entirely.
3. **If you change 3 files, output all 3 files in full.** Not summaries. Not diffs. Full contents.
4. **When listing files to change, state the full file path relative to project root before each file.** Example: `app/pages/gym.vue`
5. **Do not ask "should I change X?"** — Assess what needs changing, change it, output it. If something is ambiguous, pick the most logical interpretation and go.
6. **Preserve existing code style exactly.** Indentation (4 spaces in .vue files, 2 spaces in .ts server files), quote style, naming conventions — match what's already there. Do not reformat unrelated lines.

---

## 1. Project Overview

**BodyLog** is a minimalist, brutalist-styled gym & body weight tracker. It is a personal tool (single-user, password-protected) built to:

- Log workouts against a fixed program with progressive overload
- Track weekly body weight for a bulk phase
- Export all data to an AI (Gemini) for coaching analysis via a generated CSV + prompt

It supports **two training modes** — Gym and Calisthenics — switchable via a mode selector in the navbar.

It is deployed via **Docker** on a self-hosted VPS. Data persists in a **SQLite database** mounted as a Docker volume.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Nuxt 4** (Vue 3) |
| Styling | **Tailwind CSS v4** (via `@tailwindcss/vite` plugin) |
| UI Components | `@nuxt/ui`, `lucide-vue-next` (icons via `nuxt-lucide-icons`) |
| Fonts | Google Fonts via `@nuxtjs/google-fonts` — Syne, Mynerve, Courier New |
| Backend/DB | **SQLite** via `better-sqlite3` (replaces Google Sheets) |
| Auth | Cookie-based, single password, server-verified |
| Deployment | Docker + docker-compose on self-hosted VPS |
| Runtime | Node 20 (Docker), Bun locally (`bun install`, `bun run dev`) |

**Key constraint:** `better-sqlite3` is a native addon (.node binary). It **cannot** be bundled by Rollup/Nitro. The Dockerfile is single-stage so `node_modules` stays on disk. `nuxt.config.ts` uses `nitro.rollupConfig.external: ["better-sqlite3"]` to skip it during bundling. Do NOT change this to `externals.inline` — that breaks the build.

---

## 3. File Tree

```
bodylog/
├── CLAUDE.md                          ← this file
├── nuxt.config.ts                     ← Nuxt config, runtime env, google fonts, head meta
├── tsconfig.json                      ← TS config (references .nuxt generated configs)
├── package.json                       ← Dependencies
├── .env.example                       ← Required env vars template
├── Dockerfile                         ← Single-stage Node 20 Alpine build
├── docker-compose.yml                 ← Volume mount for /data, env passthrough
│
├── types/
│   └── index.ts                       ← All shared TypeScript interfaces
│
├── app/
│   ├── app.vue                        ← Root layout: fixed nav, mobile menu, mode modal, logout modal, footer
│   ├── error.vue                      ← Custom error page (404 / 500)
│   ├── assets/css/
│   │   └── main.css                   ← Tailwind theme tokens, base styles, utility classes
│   ├── composables/
│   │   ├── useAuth.ts                 ← Auth composable: cookie state, login/logout, secureFetch
│   │   └── useMode.ts                 ← Mode composable: gym/calist toggle, persisted in cookie
│   ├── components/
│   │   ├── GymWorkoutForm.vue         ← Gym workout form: exercises, variants, notes, sets, save
│   │   ├── CalistWorkoutForm.vue      ← Calist workout form: reps/hold exercises, subs, notes, save
│   │   └── BulkWeightForm.vue         ← Weight input form (week, weight, note, save)
│   └── pages/
│       ├── index.vue                  ← Landing page: mode cards, program overview, rules
│       ├── login.vue                  ← Password login with success animation
│       ├── gym.vue                    ← Gym page: day tabs, week nav, loads GymWorkoutForm, history table
│       ├── calist.vue                 ← Calist page: day tabs, week nav, loads CalistWorkoutForm, history table
│       ├── bulk.vue                   ← Bulk page: loads BulkWeightForm, cardio checklist, progress log
│       └── coach.vue                  ← AI Coach: mode-aware export, height input, CSV download, Gemini prompt
│
└── server/
    ├── utils/
    │   ├── auth.ts                    ← requireAuth(event): server-side cookie check middleware
    │   └── db.ts                      ← SQLite singleton (getDb()), table init, WAL mode
    └── api/
        ├── auth/
        │   └── verify.post.ts         ← POST /api/auth/verify — password check
        ├── bulk/
        │   ├── get.get.ts             ← GET /api/bulk/get — reads bulk_entries table
        │   └── save.post.ts           ← POST /api/bulk/save — upsert by week
        ├── gym/
        │   ├── get.get.ts             ← GET /api/gym/get?day=SENIN — reads gym_sessions table
        │   └── save.post.ts           ← POST /api/gym/save — upsert by week+day+exercise_name
        └── calist/
            ├── get.get.ts             ← GET /api/calist/get?day=SENIN — reads calist_sessions table
            └── save.post.ts           ← POST /api/calist/save — upsert by week+day+exercise_name
```

**DELETED — do not recreate:**
- `server/utils/sheets.ts` — Google Sheets client. Gone. Nitro auto-scans `server/utils/`, if this file exists it will try to import `googleapis` and crash.

---

## 4. Database Architecture — SQLite

Database file: `./data/bodylog.db` locally, `/data/bodylog.db` in Docker.
Path controlled by `DB_PATH` env var (points to directory, not file). Created automatically on first run.

### 4.1 Tables

**`bulk_entries`**

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | autoincrement |
| week | INTEGER UNIQUE | upsert key |
| date | TEXT | id-ID locale format |
| weight | REAL | |
| notes | TEXT | |

**`gym_sessions`**

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | autoincrement |
| week | INTEGER | |
| day | TEXT | Indonesian name: SENIN, SELASA, etc. |
| date | TEXT | |
| time | TEXT | |
| exercise_name | TEXT | resolved variant name (not template) |
| set1–set4 | TEXT | `"20kg × 10"` or `"-"` |
| completed | TEXT | `"YES"` or `"NO"` |
| notes | TEXT | per-exercise note |
| session_note | TEXT | session-level note (same value per session) |
| UNIQUE | (week, day, exercise_name) | upsert key |

**`calist_sessions`** — identical schema to `gym_sessions` except:
- set values are `"10 reps"` or `"12s"` (not `"kg × reps"`)

### 4.2 API Response Format

All `get` endpoints return `{ data: any[][] }` — arrays of string arrays. Frontend reads by index. This mirrors the old Google Sheets column format exactly.

**Gym/Calist column index map (for frontend):**

| Index | Field |
|---|---|
| 0 | week |
| 1 | day |
| 2 | date |
| 3 | time |
| 4 | exercise_name |
| 5 | set1 |
| 6 | set2 |
| 7 | set3 |
| 8 | set4 |
| 9 | completed |
| 10 | notes (per-exercise) |
| 11 | session_note |

**Bulk column index map:**

| Index | Field |
|---|---|
| 0 | week |
| 1 | date |
| 2 | weight |
| 3 | notes |

---

## 5. Design System

### 5.1 Theme Tokens (defined in `app/assets/css/main.css`)

| Token | Value | Usage |
|---|---|---|
| `--font-sans` | Syne | Body text, headings |
| `--font-handwriting` | Mynerve | Decorative accent labels |
| `--font-mono` | Courier New | Labels, metadata, data values |
| `--color-background` | `#f8f6e3` | Page background (warm cream) |
| `--color-background-2` | `#ffffff` | Card / section backgrounds |
| `--color-foreground-primary` | `#4b352a` | Headings, primary text |
| `--color-foreground-text` | `#52525b` | Body text |
| `--color-border` | `#27272a` | Strong borders (buttons, modals) |
| `--color-separator` | `#d4d4d8` | Dividers, light borders |
| `--color-primary` | `#229799` | Accent color (teal) |
| `--color-foreground-button` | `#ffffff` | Button text |

### 5.2 Utility Classes

```css
.inner          → mx-auto w-[90%] max-w-5xl          /* page content wrapper */
.input-pow      → underline-style text input          /* used in forms */
.btn-pow        → bordered button with hover teal     /* CTA buttons */
```

### 5.3 Design Conventions

- **Brutalist aesthetic.** Bold type, hard shadows (`shadow-[8px_8px_0px_...]`), raw borders.
- Headings are `font-black uppercase` with `tracking-tighter`.
- Decorative labels use `font-handwriting` (Mynerve) with slight rotation (`rotate-1`, `-rotate-2`).
- Metadata / labels use `font-mono text-xs uppercase tracking-widest`.
- Modals use `animate-bounce-in` (defined as scoped `<style>` in each file that uses it).
- Loading states use skeleton placeholders + a fixed bottom-right toast indicator.
- Transitions use `<transition name="fade">` with scoped `.fade-enter-*` styles.
- Icons come from `lucide-vue-next`. Import individually: `import { Dumbbell } from "lucide-vue-next"`.
- Hover states on cards: `hover:bg-[#fcfbf7]`.
- Green success states: `bg-green-50 border-green-100 text-green-700/800`.
- Yellow warning/note states: `bg-yellow-50 border-yellow-200`.

---

## 6. Authentication

### 6.1 How It Works

- **Single password.** Set via `APP_PASSWORD` env var.
- **Login flow:** POST `/api/auth/verify` with `{ password }` → server compares against env → returns `{ success: true }` or throws 401.
- **Client state:** Cookie `auth_token` = `"logged_in"`, 7-day max age, sameSite lax.
- **Composable `useAuth()`** exposes:
  - `isAuthenticated` — reactive boolean (useState)
  - `checkAuth()` — reads cookie, syncs `isAuthenticated`
  - `login(password)` — calls verify endpoint, sets cookie
  - `logout()` — clears cookie and state, navigates to `/login`
  - `secureFetch(url, options)` — wrapper around `$fetch` that throws 401 if not authenticated client-side

### 6.2 Server-Side Guard

```typescript
requireAuth(event) // throws 401 if cookie missing/invalid
```

**Current state:**
- `gym/save.post.ts` — calls `requireAuth` ✓
- `calist/save.post.ts` — calls `requireAuth` ✓
- `bulk/save.post.ts` — does NOT call `requireAuth` (intentional inconsistency, do not change unless asked)

### 6.3 Guest Preview

`gym.vue`, `calist.vue`, and `bulk.vue` show a yellow "PREVIEW MODE" banner when not authenticated. App still renders but save buttons are gated.

---

## 7. Mode System

### 7.1 `useMode()` Composable

```typescript
const { mode, setMode, isGym, isCalist, hasMode } = useMode();
```

- `mode` — reactive string: `"gym"` | `"calist"` | `""`
- `isGym` / `isCalist` — computed booleans
- `hasMode` — false if no mode selected yet (triggers modal)
- `setMode(newMode)` — sets cookie (1-year expiry) + reactive state

### 7.2 Mode Modal

On first visit (`!hasMode`), `app.vue` shows a full-screen mode selection modal. Also accessible via the navbar button anytime.

### 7.3 Mode-Aware Pages

- `index.vue` — both mode cards, clicking one calls `setMode()` + navigates
- `app.vue` navbar — shows "GYM LOG" or "CALIST LOG" depending on mode
- `coach.vue` — exports gym or calist data, generates mode-specific AI prompt

---

## 8. Gym Workout Program

### 8.1 Structure

12-week program, 5 days/week. Start date: `2026-01-12`.

| Day | Indonesian Name | Focus |
|---|---|---|
| Monday | SENIN | Back Width |
| Tuesday | SELASA | Push (Chest/Shoulders) |
| Wednesday | RABU | Legs |
| Thursday | KAMIS | **REST** |
| Friday | JUMAT | Back Thickness |
| Saturday | SABTU | Shoulders + Arms |

### 8.2 Exercise List (exact names = upsert keys)

**SENIN:** Weighted Pull-Up / Lat Pulldown, Lat Pulldown (Close Grip), Straight Arm Pulldown, Rear Delt Fly, Hanging Leg Raise

**SELASA:** Barbell Bench Press, Overhead Press, Incline Dumbbell Press, Lateral Raise, Tricep Pushdown, Tricep Overhead Extension

**RABU:** Leg Press / Squat, Leg Curl, Leg Extension, Calf Raise, Hanging Leg Raise

**JUMAT:** Pull-Up, T-Bar Row / Barbell Row, Seated Cable Row (Wide), Straight Arm Pulldown, Lateral Raise, Hammer Curl

**SABTU:** Lateral Raise, Face Pull, Barbell Curl, Skull Crushers, Hanging Knee Raise

### 8.3 Set Count Logic

- Contains `"Lateral Raise"` OR `"Leg"` OR `"Pull-Up"` → **4 sets**
- Everything else → **3 sets**

### 8.4 Variant System

Names with ` / ` (space-slash-space) are variant groups. `parseVariants()` splits them into radio buttons. The **resolved variant name** is saved — never the template. `"T-Bar Row / Barbell Row"` only exists in frontend code.

---

## 9. Calisthenics Program

### 9.1 Structure

Home program. Start date: `2026-02-19`. Equipment: pull-up bar, parallettes, resistance bands.

| Day | Indonesian Name | Focus |
|---|---|---|
| Monday | SENIN | Pull — Back Width |
| Tuesday | SELASA | **REST** |
| Wednesday | RABU | Push + Planche Foundation |
| Thursday | KAMIS | **REST** |
| Friday | JUMAT | Pull 2 + Planche Skill |
| Saturday | SABTU | Legs + Core |
| Sunday | MINGGU | Shoulders + Arms + Wrist Rehab |

### 9.2 Exercise Types

- **`reps`** — integer rep count → stored as `"10 reps"`
- **`hold`** — integer seconds → stored as `"12s"`

### 9.3 Substitution System

Calist uses `subs` (not `variants`). Each sub has `{ label, value }`. The `value` string is what's saved to the DB. Logic mirrors gym variants: scan all possible names on load to find saved row, restore radio selection.

---

## 10. AI Coach Export (`coach.vue`)

### 10.1 Flow

1. Detect mode → fetch appropriate workout data + bulk data
2. Build TRAINING CONTEXT & NOTES block from all notes
3. Build CSV (identical column structure for both modes, TYPE column differentiates)
4. Download CSV → copy prompt to clipboard → open Gemini after 3s

### 10.2 CSV Column Structure

```
TYPE,WEEK,DAY,DATE,EXERCISE,SET1,SET2,SET3,SET4,COMPLETED,EXERCISE_NOTE,SESSION_NOTE
```

TYPE values: `GYM`, `CALIST`, `BULK`, `BULK_WEIGHT`

---

## 11. Environment Variables

```env
APP_PASSWORD=          # Single password for the app
DB_PATH=               # Directory for SQLite file (default: ./data, Docker: /data)
```

**Removed (no longer needed):** `GOOGLE_PROJECT_ID`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SPREADSHEET_ID`

---

## 12. Docker Deployment

### 12.1 Why Single-Stage

`better-sqlite3` is a native addon. Multi-stage (build → copy `.output` only) fails with `Cannot find package 'better-sqlite3'`. `node_modules` must stay on disk for Node's module resolution to find the binary. Image is large (~600MB) — this is expected and correct.

### 12.2 Critical Config

```typescript
// nuxt.config.ts
nitro: {
  rollupConfig: {
    external: ["better-sqlite3"],  // ← DO NOT change to externals.inline
  },
},
```

### 12.3 Commands

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
docker logs bodylog -f
```

Data persists in Docker volume `bodylog_data` → `/data/bodylog.db`.

---

## 13. Key Patterns & Conventions

### 13.1 Page Loading Pattern

```typescript
onMounted(async () => {
    isLoading.value = true;
    checkAuth();
    await nextTick();
    try {
        if (isAuthenticated.value) {
            await loadData();
        }
    } catch (error) {
        console.error("...", error);
    } finally {
        isLoading.value = false; // ← never setTimeout
    }
});
```

### 13.2 Upsert Pattern (Server)

```typescript
db.prepare(`
  INSERT INTO table (col1, col2, ...)
  VALUES (?, ?, ...)
  ON CONFLICT(upsert_key) DO UPDATE SET col1 = excluded.col1, ...
`).run(val1, val2, ...);
```

### 13.3 Scoped Styles

Every `.vue` file with modals/animations defines its own `<style scoped>` with fade + bounceIn. Not global — each file that needs them must include them.

---

## 14. Things That Are Intentionally Weird (Don't "Fix" These)

1. **`bulk/save.post.ts` has no `requireAuth`** — intentional. Don't add it unless asked.
2. **`colorMode: dark` in nuxt.config.ts** but app is light-themed — CSS overrides it. Don't touch.
3. **Indonesian locale strings** everywhere — `id-ID` dates, SENIN/SELASA day names. Don't "fix" to English.
4. **`programTemplates` defined twice for gym** — once in `GymWorkoutForm.vue` (full), once in `gym.vue` (name-only). Keep them in sync if adding days.
5. **Single-stage Dockerfile with full `node_modules`** — not a mistake. Required for native addon.
6. **`DB_PATH` is a directory, not a file** — `bodylog.db` filename appended in `db.ts`. `DB_PATH=/data` → file at `/data/bodylog.db`.

---

## 15. How to Add a New Feature — Checklist

- [ ] Does it touch the DB? → Update `initializeTables()` in `server/utils/db.ts`. Update get/save endpoints. Update column index map in this doc.
- [ ] Does it add a new field to the save payload? → Update `types/index.ts` interfaces first.
- [ ] Does it need data on page load? → Add to existing `loadData()` inside the `try` block.
- [ ] Does it need a modal? → Copy the modal pattern (fade transition + bounce-in + scoped styles). No global modal component.
- [ ] Does it change the AI export? → Update CSV builder AND prompt template in `coach.vue`. Check both gym and calist paths.
- [ ] Does it affect both modes? → Bulk, auth, coach, and app shell affect both. Check both.
- [ ] Does it change a workout form? → The form is `GymWorkoutForm.vue` or `CalistWorkoutForm.vue`. The page shell is `gym.vue` or `calist.vue`. Know which one to touch.
