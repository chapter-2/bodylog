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

- Log workouts against a fixed 12-week program with progressive overload
- Track weekly body weight for a bulk phase
- Export all data to an AI (Gemini) for coaching analysis via a generated CSV + prompt

It is **not** a SaaS product. It is a personal dashboard deployed on Vercel. All data lives in a single Google Sheet (multiple tabs).

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Nuxt 4** (Vue 3) |
| Styling | **Tailwind CSS v4** (via `@tailwindcss/vite` plugin) |
| UI Components | `@nuxt/ui`, `lucide-vue-next` (icons via `nuxt-lucide-icons`) |
| Fonts | Google Fonts via `@nuxtjs/google-fonts` — Syne, Mynerve, Courier New |
| Backend/DB | **Google Sheets** via `googleapis` (no traditional DB) |
| Auth | Cookie-based, single password, server-verified |
| Deployment | Vercel |
| Runtime | Bun (`bun install`, `bun run dev`) |

**Key constraint:** There is no ORM, no database migrations, no schema enforcement. The Google Sheet IS the database. Column indices are everything — if you shift a column, the whole app breaks.

---

## 3. File Tree

```
bodylog/
├── CLAUDE.md                          ← this file
├── nuxt.config.ts                     ← Nuxt config, runtime env, google fonts, head meta
├── tsconfig.json                      ← TS config (references .nuxt generated configs)
├── package.json                       ← Dependencies
├── .env.example                       ← Required env vars template
│
├── types/
│   └── index.ts                       ← All shared TypeScript interfaces
│
├── app/
│   ├── app.vue                        ← Root layout: fixed nav, mobile menu, logout modal, footer
│   ├── error.vue                      ← Custom error page (404 / 500)
│   ├── assets/css/
│   │   └── main.css                   ← Tailwind theme tokens, base styles, utility classes
│   ├── composables/
│   │   └── useAuth.ts                 ← Auth composable: cookie state, login/logout, secureFetch
│   ├── components/
│   │   ├── GymWorkoutForm.vue         ← THE main workout form. Exercises, variants, notes, sets, save.
│   │   └── BulkWeightForm.vue         ← Weight input form (week, weight, note, save)
│   └── pages/
│       ├── index.vue                  ← Landing page: program overview, rules
│       ├── login.vue                  ← Password login with success animation
│       ├── gym.vue                    ← Gym page: day tabs, week nav, loads GymWorkoutForm, history table
│       ├── bulk.vue                   ← Bulk page: loads BulkWeightForm, stats bar, progress log
│       └── coach.vue                  ← AI Coach: height input, export CSV, copy prompt, open Gemini
│
└── server/
    ├── utils/
    │   ├── auth.ts                    ← requireAuth(event): server-side cookie check middleware
    │   └── sheets.ts                  ← Google Sheets client factory, styleWorkoutTable helper
    └── api/
        ├── auth/
        │   └── verify.post.ts         ← POST /api/auth/verify — password check
        ├── bulk/
        │   ├── get.get.ts             ← GET /api/bulk/get — reads BULK sheet
        │   └── save.post.ts           ← POST /api/bulk/save — upsert by week number
        └── gym/
            ├── get.get.ts             ← GET /api/gym/get?day=SENIN — reads GYM-{DAY} sheet(s)
            └── save.post.ts           ← POST /api/gym/save — upsert exercises by week + name
```

---

## 4. Design System

### 4.1 Theme Tokens (defined in `app/assets/css/main.css`)

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

### 4.2 Utility Classes

```css
.inner          → mx-auto w-[90%] max-w-5xl          /* page content wrapper */
.input-pow      → underline-style text input          /* used in forms */
.btn-pow        → bordered button with hover teal     /* CTA buttons */
```

### 4.3 Design Conventions

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

## 5. Data Architecture — Google Sheets

All data lives in one Google Spreadsheet with multiple tabs. The app auto-creates tabs and headers on first save.

### 5.1 BULK Tab

| Index | Column | Example |
|---|---|---|
| 0 | Week | `3` |
| 1 | Date | `03.02.2026` (id-ID locale) |
| 2 | Weight (kg) | `72.5` |
| 3 | Notes | `Felt good` |

- Range read: `BULK!A:D`
- Upsert key: **Week** (one row per week, overwritten on re-save)
- Rows sorted ascending by week after save.

### 5.2 GYM-{DAY} Tabs

Tabs: `GYM-SENIN`, `GYM-SELASA`, `GYM-RABU`, `GYM-JUMAT`, `GYM-SABTU`

| Index | Column | Example |
|---|---|---|
| 0 | Week | `3` |
| 1 | Day | `SENIN` |
| 2 | Date | `03.02.2026` |
| 3 | Time | `19:30` |
| 4 | Exercise Name | `Barbell Row` (the actual variant chosen, NOT the slash template) |
| 5 | Set 1 | `20kg × 10` or `-` |
| 6 | Set 2 | `20kg × 8` or `-` |
| 7 | Set 3 | `20kg × 7` or `-` |
| 8 | Set 4 | `-` |
| 9 | Completed | `YES` or `NO` |
| 10 | Notes | Per-exercise note (e.g. `"wrist pain, reduced weight"`) |
| 11 | Session Note | Session-level note, same value on every row of that session |

- Range read: `GYM-{DAY}!A:L` (12 columns)
- Upsert key: **Week + Exercise Name** (one row per exercise per week)
- Rows sorted ascending by week after save.
- **Column 11 (Session Note)** is duplicated across all exercise rows in the same session for simplicity. Deduplication happens on read (e.g. in coach.vue).

### 5.3 Sheet Styling

`styleWorkoutTable()` in `server/utils/sheets.ts` auto-applies:
- Banded row coloring (teal header, alternating white/light rows)
- Centered text, Roboto Mono font
- Auto-resize columns
- Called after every save. Takes `(sheets, spreadsheetId, sheetName, totalRows, totalColumns)`.

---

## 6. Authentication

### 6.1 How It Works

- **Single password.** Set via `APP_PASSWORD` env var.
- **Login flow:** POST `/api/auth/verify` with `{ password }` → server compares against env → returns `{ success: true }` or throws 401.
- **Client state:** Cookie `auth_token` = `"logged_in"`, 7-day max age, sameSite lax.
- **Composable `useAuth()`** (in `app/composables/useAuth.ts`) exposes:
  - `isAuthenticated` — reactive boolean (useState)
  - `checkAuth()` — reads cookie, syncs `isAuthenticated`
  - `login(password)` — calls verify endpoint, sets cookie
  - `logout()` — clears cookie and state, navigates to `/login`
  - `secureFetch(url, options)` — wrapper around `$fetch` that throws 401 if not authenticated client-side

### 6.2 Server-Side Guard

```typescript
// server/utils/auth.ts — auto-imported by Nuxt server
requireAuth(event) // throws 401 if cookie missing/invalid
```

Call `requireAuth(event)` at the top of any server handler that needs protection. Currently only `gym/save.post.ts` uses it. `bulk/save.post.ts` does NOT currently call it (inconsistency — noted, but don't change unless asked).

### 6.3 Guest Preview

Both `gym.vue` and `bulk.vue` show a yellow "PREVIEW MODE" banner when not authenticated. The app still renders but save buttons are gated.

---

## 7. Workout Program

### 7.1 Structure

12-week program, 5 days per week. Defined in `programTemplates` inside `GymWorkoutForm.vue`.

| Day | Sheet Tab | Indonesian Name | Focus |
|---|---|---|---|
| Monday | GYM-SENIN | SENIN | Back Width |
| Tuesday | GYM-SELASA | SELASA | Push (Chest/Shoulders) |
| Wednesday | GYM-RABU | RABU | Legs |
| Thursday | — | — | **REST** |
| Friday | GYM-JUMAT | JUMAT | Back Thickness |
| Saturday | GYM-SABTU | SABTU | Shoulders + Arms |
| Sunday | — | — | **REST** |

### 7.2 Exercise List (exact names matter — they're used as upsert keys)

**SENIN (Back Width)**
1. Weighted Pull-Up / Lat Pulldown ← variant group
2. Lat Pulldown (Close Grip)
3. Straight Arm Pulldown
4. Rear Delt Fly
5. Hanging Leg Raise

**SELASA (Push)**
1. Barbell Bench Press
2. Overhead Press
3. Incline Dumbbell Press
4. Lateral Raise
5. Tricep Pushdown
6. Tricep Overhead Extension

**RABU (Legs)**
1. Leg Press / Squat ← variant group
2. Leg Curl
3. Leg Extension
4. Calf Raise
5. Hanging Leg Raise

**JUMAT (Back Thickness)**
1. Pull-Up
2. T-Bar Row / Barbell Row ← variant group
3. Seated Cable Row (Wide)
4. Straight Arm Pulldown
5. Lateral Raise
6. Hammer Curl

**SABTU (Shoulders + Arms)**
1. Lateral Raise
2. Face Pull
3. Barbell Curl
4. Skull Crushers
5. Hanging Knee Raise

### 7.3 Set Count Logic

Determined by exercise name at initialization:
- Contains `"Lateral Raise"` OR `"Leg"` OR `"Pull-Up"` → **4 sets**
- Everything else → **3 sets**

### 7.4 Week Calculation

```typescript
const PROGRAM_START_DATE = new Date("2026-01-12");
// calculatedWeek = ceil(daysSinceStart / 7), minimum 1
```

Used to auto-select the current week on page load.

---

## 8. Variant System

### 8.1 What It Is

Some exercises have alternatives (e.g. station taken at gym). These are defined using ` / ` (space-slash-space) in the exercise name string.

```
"T-Bar Row / Barbell Row"  →  variants: ["T-Bar Row", "Barbell Row"]
"Leg Press / Squat"        →  variants: ["Leg Press", "Squat"]
```

### 8.2 How It Works

1. **Detection:** `parseVariants(name)` checks for ` / `. Returns array or `null`.
2. **UI:** If variants exist, radio buttons are rendered. Default selection = first variant.
3. **Save:** The `effectiveName()` function returns `selectedVariant` (e.g. `"Barbell Row"`). This is what gets written to the sheet in column 4. The slash template name is never stored.
4. **Load (current session):** Scans all variants to find a matching row. Restores the radio selection to whichever variant was saved.
5. **Load (last week reference):** Same scan — finds any variant match from previous week. Shows which specific exercise was done last week as a label hint.

### 8.3 Important

The sheet stores the **resolved variant name**, not the template name. So if you did "Barbell Row" this week, the sheet has "Barbell Row" in column 4. The template name "T-Bar Row / Barbell Row" only exists in the frontend code.

---

## 9. AI Coach Export (coach.vue)

### 9.1 What It Does

1. Fetches all gym data + bulk data in parallel.
2. Builds a **TRAINING CONTEXT & NOTES** block by collecting all session notes and per-exercise notes from the gym data, deduplicated by week+day.
3. Builds a CSV file with all gym rows and bulk rows (12 columns for gym, bulk rows padded to match).
4. Downloads the CSV to the user's device.
5. Copies an AI prompt (with context block embedded) to clipboard.
6. Auto-opens Gemini after a 3-second countdown.

### 9.2 Prompt Structure

```
Act as an elite Personal Trainer and Nutritionist.
[attached CSV description]

**My Stats:**
- Height: {userHeight} cm

**TRAINING CONTEXT & NOTES (READ THESE FIRST):**
- W3 SENIN Session: "wrist still hurting, backing off push"
- W3 JUMAT | T-Bar Row: "switched to Barbell Row, station taken"
...

**IMPORTANT:** [instruction to not flag noted exercises as regression]

[4-point analysis request]
```

### 9.3 CSV Field Escaping

Fields containing commas, quotes, or newlines are wrapped in double quotes with inner quotes escaped (`""`) via the `csvField()` helper.

---

## 10. Key Patterns & Conventions

### 10.1 Page Loading Pattern

Both `gym.vue` and `bulk.vue` follow this exact pattern:

```typescript
onMounted(async () => {
    isLoading.value = true;
    checkAuth();
    await nextTick();
    try {
        if (isAuthenticated.value) {
            await loadData(); // actual async fetch
        }
    } catch (error) {
        console.error("...", error);
    } finally {
        isLoading.value = false; // ← tied to data readiness, NOT a setTimeout
    }
});
```

**Do NOT use `setTimeout` to control loading state.** It was a bug. The `finally` block is the correct place.

### 10.2 Data Fetching

- Client → `secureFetch("/api/...")` (from `useAuth()`)
- Server → `getGoogleSheetsClient()` + `getSpreadsheetId()` (auto-imported from `server/utils/sheets.ts`)
- All server handlers return plain objects. `$fetch` on the client handles JSON automatically.

### 10.3 Form Save Pattern

1. Validate (auth check, required fields)
2. Format data (dates in id-ID locale, sets as `"Xkg × Y"`)
3. POST via `secureFetch`
4. On success: update local UI state, emit `"saved"` event to parent
5. On 401: show error, redirect to login after 2s
6. On other error: show error in red box

### 10.4 Upsert Logic (Server)

All save handlers follow this pattern:
1. Read entire sheet into `rawRows`
2. Ensure header row exists (create if empty, overwrite if outdated)
3. Slice off header → `dataRows`
4. For each item: find existing row by key (week + name), replace or push
5. Sort `dataRows` ascending by week
6. Reconstruct `finalRows = [header, ...dataRows]`
7. Write back with `values.update` at `A1`
8. Run `styleWorkoutTable`

### 10.5 Component Communication

- `GymWorkoutForm` receives `week` and `day` as props, emits `"saved"` event
- `BulkWeightForm` emits `"saved"` event
- Parent pages (`gym.vue`, `bulk.vue`) listen to `@saved` and re-fetch data

### 10.6 Scoped Styles

Every `.vue` file that uses modals or animations defines its own scoped styles:

```css
<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes bounceIn { ... }
.animate-bounce-in { animation: bounceIn 0.3s ... forwards; }
</style>
```

These are **not** global. Each file that needs them must include them.

---

## 11. Environment Variables

```env
APP_PASSWORD=          # Single password for the app
GOOGLE_PROJECT_ID=     # GCP project ID
GOOGLE_CLIENT_EMAIL=   # Service account email
GOOGLE_PRIVATE_KEY=    # Service account private key (full PEM string)
SPREADSHEET_ID=        # Google Sheet ID from URL
```

Accessed server-side via `useRuntimeConfig()`. The private key has `\\n` replaced with actual newlines in `nuxt.config.ts`.

---

## 12. Change Log — What Has Already Been Done

Track this so you don't re-implement or undo things.

### 2025-02 Patch (4 issues fixed)

| # | Issue | What Changed |
|---|---|---|
| 1 | AI Coach blind to notes | `coach.vue`: CSV now exports columns 10 (exercise note) and 11 (session note). Prompt includes a `TRAINING CONTEXT & NOTES` block assembled from all notes, placed before the analysis instructions with an explicit "don't flag noted exercises as regression" directive. |
| 2 | No session-level note | `GymWorkoutForm.vue`: Added a collapsible session note textarea at the top of the form (yellow background). Saved to sheet column 11 (duplicated on every exercise row in that session). Restored on reload. |
| 3 | Loading state race condition | `gym.vue` and `bulk.vue`: Removed `setTimeout(() => { isLoading = false }, 500)`. Now `isLoading = false` is set in the `finally` block, tied to actual data readiness. |
| 4 | Exercise variant selection | `GymWorkoutForm.vue`: Exercise names containing ` / ` are parsed into radio button variant groups. The selected variant name (not the slash template) is saved to the sheet. Load logic scans all variants to restore state. |

### Server-side schema change (same patch)

- `server/api/gym/get.get.ts`: Range extended from `A:J` to `A:L`
- `server/api/gym/save.post.ts`: Header updated to 12 columns. Column 11 = Session Note. `styleWorkoutTable` called with `totalColumns = 12`.
- `types/index.ts`: `Exercise` gained `selectedVariant?: string`. `GymSession` gained `sessionNote?: string`.

---

## 13. Things That Are Intentionally Weird (Don't "Fix" These)

1. **`bulk/save.post.ts` does NOT call `requireAuth(event)`** — only `gym/save.post.ts` does. This is an existing inconsistency. Don't add it unless explicitly asked.
2. **`colorMode` is set to `dark` in nuxt.config.ts** but the app is visually light-themed. The `@nuxt/ui` dark mode setting is there but the custom CSS overrides everything. Don't touch it.
3. **Indonesian locale strings** (`id-ID`) are used for dates. The app is built by an Indonesian developer for personal use. Day names in the sheet are Indonesian (SENIN, SELASA, etc.). Don't "fix" these to English.
4. **The `Exercise Focus` column (index 3) in the sheet is always empty string `""`** in the save handler. It was in the original header but never populated. It stays.
5. **`programTemplates` is defined in two places** — once in `GymWorkoutForm.vue` (full, with exercises) and once in `gym.vue` (name-only, for day tab labels). They must stay in sync if you add a new day.

---

## 14. How to Add a New Feature — Checklist

When implementing any new feature, go through this:

- [ ] Does it touch the sheet? → Update column indices in BOTH get and save handlers. Update the header array in save. Update the range string in get (`A:X`). Update `styleWorkoutTable` totalColumns.
- [ ] Does it add a new field to the save payload? → Update `types/index.ts` interfaces first.
- [ ] Does it need data on page load? → Add to the existing `loadData` function, keep it in the `try` block before `finally`.
- [ ] Does it need a modal? → Copy the modal pattern from an existing one (fade transition + bounce-in animation + scoped styles). Don't use a global modal component.
- [ ] Does it change the AI export? → Update both the CSV builder AND the prompt template in `coach.vue`.
- [ ] Does it change the workout form? → The form is `GymWorkoutForm.vue`. The page shell is `gym.vue`. Know which one to touch.
