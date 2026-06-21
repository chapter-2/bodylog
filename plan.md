# Implementation Plan — Add mode-based data separation to workout_sessions

## Goal

Add `mode TEXT NOT NULL DEFAULT 'gym'` column to `workout_sessions` table, auto-derive `exercise_type` from mode during save (except custom mode), filter queries by `?mode=` param, and update all callers.

---

## Tasks

### 1. DB Schema: Add `mode` column to `workout_sessions`

- **File:** `server/utils/db.ts`
- **Changes in `initDb()`**:
  - In the `CREATE TABLE IF NOT EXISTS workout_sessions` statement:
    - Add `mode TEXT NOT NULL DEFAULT 'gym'` column AFTER `exercise_type` line
    - Change UNIQUE constraint from `UNIQUE(user_id, week, day, exercise_type, exercise_name)` to `UNIQUE(user_id, week, day, mode, exercise_type, exercise_name)`
  - Do NOT touch `cardio_sessions` table (separate schema for now)
- **Acceptance:** Schema string compiles. `CREATE TABLE IF NOT EXISTS` is idempotent — existing rows get `mode='gym'` default.

### 2. API Save: Accept `mode`, auto-set `exercise_type` per mode

- **File:** `server/api/workout/save.post.ts`
- **Changes:**
  - Read `body.mode` (e.g., `body.mode ?? 'gym'`). Validate it's one of: `'gym' | 'calist' | 'cardio' | 'custom'`; reject 400 if invalid.
  - For each exercise in `body.exercises`:
    - If `body.mode !== 'custom'`: `exercise_type = body.mode` (override any exercise-level type).
    - If `body.mode === 'custom'`: `exercise_type = exercise.type ?? 'gym'` (respect exercise-level type).
  - Sets formatting logic unchanged (gym → `weightkg × reps`, others → passthrough strings).
  - INSERT statement: add `mode` column to column list and `?` placeholder. Insert `body.mode` value after `exercise_type` arg.
  - ON CONFLICT clause: change from `(user_id, week, day, exercise_type, exercise_name)` to `(user_id, week, day, mode, exercise_type, exercise_name)`.
- **Acceptance:** POST with `mode='gym'` stores `mode='gym'` + `exercise_type='gym'` regardless of exercise-level `type`. POST with `mode='custom'` stores per-exercise `exercise_type`.

### 3. API Get: Add `?mode=` filter, return `mode` in result

- **File:** `server/api/workout/get.get.ts`
- **Changes:**
  - Read `query.mode` (new primary filter param).
  - Read `query.exercise_type` (keep as secondary filter, useful in custom mode).
  - Read `query.day` (keep as tertiary, unchanged).
  - Build WHERE clause order: `user_id = ?` → optional `mode` → optional `exercise_type` → optional `day`.
  - Result array mapping: add `r.mode` as **column index 13** (after `r.exercise_type` at index 12).
  - Sort unchanged (`ORDER BY week DESC`).
- **Acceptance:** `GET /api/workout/get?mode=gym` returns only rows with `mode='gym'`. `GET /api/workout/get?mode=custom&exercise_type=gym` returns custom-mode gym exercises. Result has 14 columns (indices 0-13).

### 4. WorkoutForm.vue: Pass `mode` in save payload + use `?mode=` in fetches

- **File:** `app/components/WorkoutForm.vue`
- **Changes in `saveWorkout()`** (~line 330):
  - Add `mode: currentMode.value` to the POST body object sent to `/api/workout/save`.
- **Changes in `loadCurrentSession()`** (~line 255):
  - Change query from `?day=${dayName.value}` to `?mode=${currentMode.value}&day=${dayName.value}`.
- **Changes in `loadLastWeekData()`** (~line 228):
  - Same change: `?mode=${currentMode.value}&day=${dayName.value}`.
- **Changes in `initializeExercises()`** (~line 175):
  - After the `if (currentMode.value === "gym")` / `else` block, add handling for `cardio` and `custom` modes:
    - `cardio`: exercises initialized with `type: 'cardio'`, sets as `WorkoutSetCalist[]` (value + unit strings). Template exercises from `defaultsForMode` or fallback empty array.
    - `custom`: exercises initialized with `type` from template, or default `'gym'`. Template exercises from custom program or fallback empty array.
- **Changes in `onProgramSaved()`** (~line 370):
  - The `else` branch currently hardcodes `type: 'calist' as ExerciseType`. For custom mode, preserve exercise-level type. Add mode check.
- **Acceptance:** Save payload includes `mode`. History fetches filtered by current mode. Cardio/custom modes get initialized exercises (if templates exist). D raft persists correctly.

### 5. workout.vue: Filter `loadHistory()` by mode instead of exercise_type

- **File:** `app/pages/workout.vue`
- **Change in `loadHistory()`** (~line 485):
  - Replace `const exerciseType = isGym.value ? 'gym' : 'calist'` with `const mode = currentMode.value`.
  - Replace query `?exercise_type=${exerciseType}` with `?mode=${mode}`.
  - `currentMode` is already available from `useMode()` (verified at top of script).
  - Note: `currentMode` may be empty string (no mode selected). Empty mode in query returns no rows — acceptable, guard with early return if needed.
- **Acceptance:** Gym mode shows only gym-mode history. Custom mode shows only custom-mode history.

### 6. coach.vue: Filter export query by mode instead of exercise_type

- **File:** `app/pages/coach.vue`
- **Change in `handleSummonTrainer()`** (~line 231):
  - Read `mode` from `useMode()` composable: `const { mode, isGym } = useMode()`.
  - Replace `?exercise_type=${isGym.value ? 'gym' : 'calist'}` with `?mode=${mode.value}`.
  - CSV builders (`buildGymCsv`, `buildCalistCsv`) read rows by index 0-11 — new column 13 (mode) is ignored, no change needed.
  - Prompt builders (`buildGymPrompt`, `buildCalistPrompt`) unchanged — they receive filtered data.
- **Acceptance:** Gym mode exports only gym-mode data. Calist mode exports only calist-mode data.

### 7. Export API: Query by `mode` column

- **File:** `server/api/export/all.get.ts`
- **Changes:**
  - Replace `WHERE exercise_type = 'gym'` → `WHERE mode = 'gym'`.
  - Replace `WHERE exercise_type = 'calist'` → `WHERE mode = 'calist'`.
  - Add two more queries for cardio and custom modes? **No — keep existing return shape.** coach.vue only uses `res.gym` or `res.calist` based on `isGym.value`. Adding cardio/custom export is out of scope.
  - Return shape `{ gym: rows, calist: rows, weight: rows }` unchanged.
- **Acceptance:** Export returns data filtered by mode, not exercise_type. Coach page works.

### 8. Types: Widen `ExerciseType` to include `'custom'`

- **File:** `types/index.ts`
- **Change:**
  - `export type ExerciseType = 'gym' | 'calist' | 'cardio';` → `export type ExerciseType = 'gym' | 'calist' | 'cardio' | 'custom';`
  - This is a one-line change. No other type modifications.
- **Acceptance:** TypeScript accepts `type: 'custom'` on exercises without errors.

---

## Files to Modify

| File                                  | Task | Changes                                           |
| ------------------------------------- | ---- | ------------------------------------------------- |
| `server/utils/db.ts`                  | 1    | + mode column, updated UNIQUE constraint          |
| `server/api/workout/save.post.ts`     | 2    | + mode param, auto exercise_type, ON CONFLICT     |
| `server/api/workout/get.get.ts`       | 3    | + ?mode= param, mode in result array              |
| `app/components/WorkoutForm.vue`      | 4    | mode in save payload, mode filter in fetches      |
| `app/pages/workout.vue`               | 5    | loadHistory query by mode                         |
| `app/pages/coach.vue`                 | 6    | handleSummonTrainer query by mode                 |
| `server/api/export/all.get.ts`        | 7    | WHERE mode= instead of WHERE exercise_type=       |
| `types/index.ts`                      | 8    | ExerciseType include 'custom'                     |

## No New Files

---

## Dependencies

```
Task 1 (DB schema)
   ↓
Task 2 (API save)  ─┬─ requires new column exists
Task 3 (API get)   ─┘  requires new column exists
   ↓
Task 4 (WorkoutForm) ── requires API changes deployed
Task 5 (workout.vue) ── requires API changes deployed
Task 6 (coach.vue)   ── requires API changes deployed
Task 7 (export)      ── requires column exists
   ↓
Task 8 (types) ── independent, can run anytime
```

**Recommended order:** 1 → 2 + 3 (parallel) → 4 + 5 + 6 + 7 (parallel) → 8 (anytime).

---

## Risks

| Risk                                                                        | Severity | Mitigation                                                                                                                   |
| --------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Existing `workout_sessions` rows get `mode='gym'` default — calist-mode data mislabeled | Medium   | After migration, calist-mode users who saved via old API will have `mode='gym'` on their rows. Acceptable — their data is accessible in gym mode queries until they re-save. New saves use correct mode. |
| `WorkoutForm.vue` `loadCurrentSession()` currently uses only `?day=` — adding `?mode=` narrows results | Low      | No mode filter = broader result set. Adding mode filter = potentially misses sessions saved without mode. Since old saves get `mode='gym'`, gym-mode users unaffected. Calist users in gym-mode rows won't see old data until re-save. Acceptable. |
| UNIQUE constraint change (`mode` added) could allow duplicate rows for same exercise across modes | Low      | This is the desired behavior — same week/day/exercise can exist under different modes. No deduplication needed.              |
| `cardio` mode exercises in workout_sessions vs separate `cardio_sessions` table | Medium   | `cardio_sessions` table still exists in schema. No migration from that table to `workout_sessions`. Cardio-mode users will save to `workout_sessions` with `mode='cardio'`. Old `cardio_sessions` data orphaned. Phase 4 should handle migration. |
| `ExerciseType` widened to include `'custom'` — existing code that branches on `type === 'gym'` vs `else` may misclassify custom | Low      | The `else` branch treats non-gym as calist (passthrough strings). Custom-mode exercises with `type='custom'` will fall into `else` branch for sets formatting — acceptable since custom exercises use string sets. |
| No build verification                                                      | Medium   | Run `nuxt build` after all changes. Check for TypeScript errors from widened `ExerciseType`.                                 |
| No tests                                                                    | High     | Manual smoke test: login → select gym mode → save workout → verify via `/api/workout/get?mode=gym`. Repeat for calist, cardio, custom. Check browser console. |

---

## Out of Scope (explicitly NOT in this plan)

- Cardio mode UI components (ExerciseCard rendering for cardio, cardio-specific set inputs)
- Custom mode exercise type mixing UI (dropdown per exercise to choose type)
- Migration of `cardio_sessions` table data into `workout_sessions`
- coach.vue widening to support cardio/custom modes (already listed in previous plan.md issues)
- workout.vue program templates for cardio/custom (workoutDefaults.ts only has gym/calist)

---

## Task Execution Order

1. **Task 1** — DB schema: add mode column
2. **Task 2** — API save: accept mode, auto-set exercise_type
3. **Task 3** — API get: accept ?mode= param
4. **Task 8** — Types: widen ExerciseType (can run anytime, do before Task 4)
5. **Task 4** — WorkoutForm.vue: pass mode, filter by mode
6. **Task 5** — workout.vue: filter history by mode
7. **Task 6** — coach.vue: filter export by mode
8. **Task 7** — export API: query by mode
