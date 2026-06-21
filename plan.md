# Implementation Plan: Unify Gym + Calist + Cardio Exercise System

## Goal
Replace the gym/calist silo with a single workout system where each exercise carries its own `exercise_type` (`'gym' | 'calist' | 'cardio'`), while keeping the global training mode for program defaults and onboarding.

---

## Decision Summary

### Decision 1: Merge gym_sessions + calist_sessions into one table. Keep cardio_sessions separate.

**Why:**
- gym_sessions and calist_sessions share identical 12-column schema (set1..set4, completed, notes, session_note).
- cardio_sessions has different columns (duration_min, distance_km; no set1-set4, no completed).
- Forcing cardio into the same table would create 6+ always-null columns for every gym/calist row → sparse, confusing.
- Cardio is a different domain model: time/distance recording, not set-by-set logging.
- A workout day can mix gym + calist exercises in one session without cardio. Cardio stays as a separate logging concept.

**New table: `workout_sessions`**
Same columns as gym_sessions/calist_sessions + one new column:
```sql
CREATE TABLE workout_sessions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL,
  week          INTEGER NOT NULL,
  day           TEXT    NOT NULL,
  date          TEXT    NOT NULL,
  time          TEXT    DEFAULT '',
  exercise_name TEXT    NOT NULL,
  exercise_type TEXT    NOT NULL DEFAULT 'gym',  -- NEW: 'gym' | 'calist' | 'cardio'
  set1          TEXT    DEFAULT '-',
  set2          TEXT    DEFAULT '-',
  set3          TEXT    DEFAULT '-',
  set4          TEXT    DEFAULT '-',
  completed     TEXT    DEFAULT 'NO',
  notes         TEXT    DEFAULT '',
  session_note  TEXT    DEFAULT '',
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, week, day, exercise_name)
);
```

**cardio_sessions stays unchanged.**

### Decision 2: New unified TypeScript types.

Replace `GymSession`, `CalistSession`, `CalistExercisePayload` with a single `WorkoutSession` that holds a discriminated `WorkoutExercise[]` array. Each exercise declares its own `type`.

### Decision 3: `useMode()` transforms — global mode still exists but narrows to "program default + navbar label."

- Mode cookie stays: `gym`, `calist`, `cardio`, `custom` still valid values.
- `isGym`/`isCalist` used for: program defaults (which template to load), navbar label, mode selector label, tour flow.
- `isGym`/`isCalist` no longer used to decide which form component to render. One `WorkoutForm` handles all exercise types per-exercise.
- `hasMode` expands: `gym`, `calist`, `cardio`, `custom` all valid → mode selector shown only when `mode === ''`.

### Decision 4: Migration order — backward-compatible, no breakage.

Phase through 5 steps: DB migration (dual-write), API unification, type unification, UI unification, cleanup.

---

## Tasks

### Phase 1 — Database Migration (zero-downtime, backward-compatible)

1. **Add `workout_sessions` table to `initDb()`**
   - File: `server/utils/db.ts`
   - Changes: Add `CREATE TABLE IF NOT EXISTS workout_sessions` to `initDb()` (columns as specified above).
   - Verify: App starts, new table exists, old tables untouched.

2. **Migrate existing data from gym_sessions + calist_sessions into workout_sessions**
   - File: new file `server/api/migration/migrate-workout-sessions.get.ts` (temporary, one-shot)
   - Changes: Single GET handler that:
     1. `INSERT INTO workout_sessions (...) SELECT ... FROM gym_sessions` with `'gym'` as `exercise_type`
     2. `INSERT INTO workout_sessions (...) SELECT ... FROM calist_sessions` with `'calist'` as `exercise_type`
     3. Skip rows already migrated (use the `UNIQUE` constraint or a flag column)
   - Verify: `workout_sessions` has all rows from both tables with correct `exercise_type`. Run query to count.

### Phase 2 — API Layer (dual-read/dual-write)

3. **Create unified `workout/get.get.ts`**
   - File: `server/api/workout/get.get.ts`
   - Changes: Copy pattern from gym/get, read from `workout_sessions` table. Add `exercise_type` to flat array output as new column (column index 12, after session_note). Accept optional `?exercise_type=` filter.
   - Verify: Returns flat data matching gym/get shape + one extra field.

4. **Create unified `workout/save.post.ts`**
   - File: `server/api/workout/save.post.ts`
   - Changes: Accept `WorkoutSession` payload where each exercise has `type: 'gym' | 'calist'`. Format sets per type (gym: `"20kg × 10"`, calist: `"12 reps"` or `"30s"`). INSERT into `workout_sessions`.
   - Verify: POST workout → data appears in `workout_sessions` table.

5. **Rewrite gym/get to read from `workout_sessions` with `exercise_type='gym'` filter**
   - File: `server/api/gym/get.get.ts`
   - Changes: Change SQL from `FROM gym_sessions` to `FROM workout_sessions WHERE exercise_type = 'gym'`. Same column order in output.
   - Verify: Existing gym page still works unchanged.

6. **Rewrite calist/get to read from `workout_sessions` with `exercise_type='calist'` filter**
   - File: `server/api/calist/get.get.ts`
   - Changes: Same pattern — read from `workout_sessions WHERE exercise_type = 'calist'`.
   - Verify: Existing calist page still works unchanged.

7. **Rewrite gym/save to write to `workout_sessions` + backfill gym_sessions**
   - File: `server/api/gym/save.post.ts`
   - Changes: Insert into `workout_sessions` with `exercise_type='gym'`. Also write to `gym_sessions` (dual-write) as safety net.
   - Verify: Both tables have the saved data.

8. **Rewrite calist/save to write to `workout_sessions` + backfill calist_sessions**
   - File: `server/api/calist/save.post.ts`
   - Changes: Same dual-write pattern, `exercise_type='calist'`.
   - Verify: Both tables have the saved data.

### Phase 3 — Type Unification

9. **Add unified types to `types/index.ts`**
   - File: `types/index.ts`
   - Changes: Add new types, keep old types (marked `@deprecated`):
     ```typescript
     // New unified types
     export type ExerciseType = 'gym' | 'calist' | 'cardio';

     export interface WorkoutSetGym {
       weight: number;
       reps: number;
     }

     export interface WorkoutSetCalist {
       value: number;       // reps or seconds
       unit: 'reps' | 's';  // derived from exercise type
     }

     export interface WorkoutSetCardio {
       duration_min: number;
       distance_km: number;
     }

     export interface WorkoutExercise {
       name: string;
       type: ExerciseType;
       variants?: string[];           // gym: equipment variants
       selectedVariant?: string;
       subs?: { label: string; value: string }[]; // calist: progression subs
       selectedSub?: string;
       sets: WorkoutSetGym[] | WorkoutSetCalist[]; // discriminated by type
       targetReps?: number;
       note?: string;
     }

     export interface WorkoutSession {
       week: number;
       day: string;
       date: string;
       time?: string;
       exercises: WorkoutExercise[];
       completed: boolean;
       sessionNote?: string;
     }
     ```
   - Verify: `nuxt build` passes. Old types still available for gradual migration.

### Phase 4 — UI Unification

10. **Create unified `WorkoutForm.vue` component**
    - File: `app/components/WorkoutForm.vue`
    - Changes: Merge GymWorkoutForm + CalistWorkoutForm logic. Key differences handled per-exercise via `WorkoutExercise.type`:
      - Exercise template: read from unified program config (changed from mode-specific to exercise-type-aware)
      - Save: POST to `/api/workout/save` (new endpoint)
      - Draft key: `bodylog_draft_${props.week}_${props.day}` (no longer gym/calist prefix)
      - Set rendering: `type === 'gym'` → weight+reps inputs; `type === 'calist'` → single value input with unit label
      - `Pass mode` prop to ExerciseCard as `exercise.type` instead of global `"gym"`/`"calist"`
    - Verify: Compiles. (Not yet wired into page.)

11. **Update `ExerciseCard.vue` to handle per-exercise type**
    - File: `app/components/workout/ExerciseCard.vue`
    - Changes: Accept `exerciseType: 'gym' | 'calist'` prop (or derive from model). Replace `props.mode` with exercise-level type. All mode-conditional branches (input format, unit display, copyLastWeekSet parsing) key off this.
    - Verify: Works with both old forms (still passing global mode) and new unified form.

12. **Wire `workout.vue` page to use unified `WorkoutForm`**
    - File: `app/pages/workout.vue`
    - Changes: Replace conditional `<GymWorkoutForm v-if="isGym">` / `<CalistWorkoutForm v-else>` with single `<WorkoutForm>`. Remove `apiMode` computed. Remove `isGym`-conditional text strings. Keep `isGym` only for hero icon and page title ("Gym Log" vs "Calist Log" still based on mode for now).
    - Verify: Both gym and calist users see unified form, can log exercises of either type.

### Phase 5 — Cleanup & Expansion

13. **Add cardio exercise support to `WorkoutForm`**
    - File: `app/components/WorkoutForm.vue`
    - Changes: When exercise `type === 'cardio'`, render duration_min + distance_km inputs instead of sets. Save cardio exercises to `cardio_sessions` table (not `workout_sessions`) via a separate fetch or conditional save logic.
    - Verify: Cardio exercises appear and save correctly.

14. **Update `program/get` and `program/save` to support mode-agnostic config**
    - File: `server/api/program/get.get.ts`, `server/api/program/save.post.ts`
    - Changes: Still accept `?mode=` param. Internally, program config stores exercise templates with `type` field. No schema change needed (JSON in `program_config.value`). Example entry:
      ```json
      { "monday": { "name": "Full Body A", "exercises": [
        { "name": "Barbell Squat", "type": "gym", "sets": 4, "targetReps": 8 },
        { "name": "Pull-up", "type": "calist", "sets": 3, "targetReps": 8 },
        { "name": "Run", "type": "cardio", "targetDurationMin": 20 }
      ]}}
      ```
    - Verify: Program editor saves and loads exercises with type field.

15. **Update `ProgramEditorSidebar.vue` to handle per-exercise type**
    - File: `app/components/ProgramEditorSidebar.vue`
    - Changes: Exercise list items include type toggle (gym/calist/cardio). Equipment palette adapts to selected type. Cardio exercises have no set scheme selection.
    - Verify: Editor shows type dropdown per exercise.

16. **Remove old tables and old API endpoints (post-stabilization)**
    - After all UI verified stable:
    - Drop `gym_sessions` and `calist_sessions` tables from `initDb()`
    - Remove `server/api/gym/` and `server/api/calist/` directories
    - Remove `GymWorkoutForm.vue` and `CalistWorkoutForm.vue` components
    - Remove deprecated types from `types/index.ts`

17. **Update `useMode()` composable**
    - File: `app/composables/useMode.ts`
    - Changes:
      - Expand `hasMode`: `mode.value === 'gym' || mode.value === 'calist' || mode.value === 'cardio' || mode.value === 'custom'`
      - No other structural changes. The mode remains for program defaults selection.
    - Verify: ModeSelectorModal appears only when no mode set. All 4 modes accepted.

18. **Update export endpoint**
    - File: `server/api/export/all.get.ts`
    - Changes: Read from `workout_sessions` instead of `gym_sessions` + `calist_sessions`. Include `exercise_type` in exported data.
    - Verify: Export returns all workout data with type column.

---

## Files to Modify

| File | Phase | Change |
|------|-------|--------|
| `server/utils/db.ts` | 1 | Add `workout_sessions` table to `initDb()` |
| `types/index.ts` | 3 | Add `WorkoutExercise`, `WorkoutSession` types; deprecate old types |
| `server/api/gym/get.get.ts` | 2 | Read from `workout_sessions WHERE exercise_type='gym'` |
| `server/api/gym/save.post.ts` | 2 | Dual-write to `workout_sessions` + `gym_sessions` |
| `server/api/calist/get.get.ts` | 2 | Read from `workout_sessions WHERE exercise_type='calist'` |
| `server/api/calist/save.post.ts` | 2 | Dual-write to `workout_sessions` + `calist_sessions` |
| `app/components/workout/ExerciseCard.vue` | 4 | Accept per-exercise type, not global mode |
| `app/pages/workout.vue` | 4 | Wire unified WorkoutForm, remove `isGym` branching |
| `app/components/ProgramEditorSidebar.vue` | 5 | Type toggle per exercise, mixed exercise programs |
| `app/components/editor/EditorExerciseList.vue` | 5 | Handle `type` field on exercise items |
| `app/components/editor/EditorPalette.vue` | 5 | Conditional equipment/schemes per type |
| `app/composables/useMode.ts` | 5 | Expand `hasMode` to include cardio + custom |
| `server/api/program/get.get.ts` | 5 | No schema change; config JSON now includes `type` field |
| `server/api/program/save.post.ts` | 5 | No schema change |
| `server/api/export/all.get.ts` | 5 | Read from `workout_sessions` |
| `app/components/TheNavbar.vue` | 5 | Minor: mode label display for cardio |
| `app/components/ModeSelectorModal.vue` | 5 | Add cardio option to mode selector |
| `app/app.vue` | 5 | `hasMode` covers all modes |

## New Files

| File | Phase | Purpose |
|------|-------|---------|
| `server/api/migration/migrate-workout-sessions.get.ts` | 1 | One-shot data migration script |
| `server/api/workout/get.get.ts` | 2 | Unified workout GET endpoint |
| `server/api/workout/save.post.ts` | 2 | Unified workout SAVE endpoint |
| `app/components/WorkoutForm.vue` | 4 | Merged GymWorkoutForm + CalistWorkoutForm |

## Files to Eventually Remove

| File | Phase | Reason |
|------|-------|--------|
| `app/components/GymWorkoutForm.vue` | 5 | Replaced by WorkoutForm |
| `app/components/CalistWorkoutForm.vue` | 5 | Replaced by WorkoutForm |
| `server/api/gym/get.get.ts` | 5 | Replaced by workout/get |
| `server/api/gym/save.post.ts` | 5 | Replaced by workout/save |
| `server/api/calist/get.get.ts` | 5 | Replaced by workout/get |
| `server/api/calist/save.post.ts` | 5 | Replaced by workout/save |

---

## Dependencies

```
Phase 1 (DB) → all other phases
Phase 2 (API dual-read/write) → Phase 3,4 (types + UI depend on backend working)
Phase 3 (types) → Phase 4 (UI uses new types)
Phase 4 (UI) → Phase 5 (cleanup only after UI verified)
Task 9 → Task 10,11 (types before UI)
Task 10 → Task 12 (form before page wiring)
Task 3,4 (new API) can run parallel to Task 5-8 (rewrite old API)
```

---

## Risks

1. **UNIQUE constraint on `workout_sessions(user_id, week, day, exercise_name)`**: Two exercises of same name but different `exercise_type` would fail. **Mitigation**: Include `exercise_type` in the UNIQUE constraint: `UNIQUE(user_id, week, day, exercise_type, exercise_name)`.

2. **Draft localStorage keys**: GymWorkoutForm and CalistWorkoutForm use different keys (`bodylog_draft_gym_...` vs `bodylog_draft_calist_...`). Switching to unified form drops old drafts. **Mitigation**: Acceptable loss — drafts are ephemeral. Can implement draft migration as a nice-to-have.

3. **Program config backward compatibility**: Existing `program_gym` and `program_calist` keys in `program_config` table don't have `type` field on exercises. **Mitigation**: Phase 4/5 code treats missing `type` as default `'gym'` for gym programs, `'calist'` for calist programs. No data migration needed for program_config JSON.

4. **Set format strings differ**: Gym stores `"20kg × 10"`, calist stores `"12 reps"` or `"30s"`. Unified table must handle both formats in same column. **Mitigation**: Already the case — `set1..set4` are TEXT columns. Parsing logic in ExerciseCard already handles both formats based on mode. No change needed.

5. **No test coverage**: Any regression in gym or calist logging breaks silently. **Mitigation**: Manual verification checklist: create workout → save → reload page → verify data persists → switch day → switch week → edit program → save → verify.

6. **cardio_sessions stays separate but exercise_type='cardio' exists on WorkoutExercise**: Ambiguitas: do cardio exercises go to `workout_sessions` or `cardio_sessions`? **Decision**: Cardio exercises with sets-like tracking (e.g., rounds) go to `workout_sessions` with type `cardio`. Pure time/distance cardio (single entry per day) stays in `cardio_sessions`. If cardio needs to be fully integrated later, that's a separate migration.

7. **Export endpoint shape change**: Adding `exercise_type` to the flat array output changes the column count and indices. Downstream consumers (AI coach page) depend on array indices. **Mitigation**: Phase 2 keeps old API endpoints unchanged (same 12-column output). Phase 5's export endpoint change is intentional and documented.

---

## Acceptance Criteria

- Gym exercises and calist exercises can coexist in one workout day
- Each exercise displays with correct input format (weight×reps vs single value)
- Existing data from gym_sessions and calist_sessions preserved in workout_sessions
- Mode selector still works for program defaults
- Navbar still shows correct mode label
- Save → reload → data persists correctly
- Program editor supports mixed-type exercises
- No UI regression on gym or calist pages during migration
