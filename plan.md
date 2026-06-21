# Bug Analysis: Cross-Mode Workout Deletion

## Root Cause

**WorkoutForm.vue does not react to mode changes.** When user switches training mode (gym → cardio → gym), the page component does NOT remount, and no watcher triggers data reload. `customProgram.value` and `exercises.value` retain stale data from the previous mode.

## How the deletion occurs

### Scenario
1. User in **gym** mode on Monday Week 1. WorkoutForm `onMounted` fetches program_gym config. Exercises loaded: [Squat, Bench, Row, OHP, Curl]. User saves workout → DB rows with `mode='gym'`.
2. User switches to **cardio** mode via ModeSelectorModal.
   - `setMode("cardio")` updates cookie + reactive state
   - `navigateTo("/workout")` — **same route, page does NOT remount**
   - WorkoutForm persists. `onMounted` NOT re-called.
   - `customProgram.value` still has **gym** program data.
   - `exercises.value` still has gym exercises (type: 'gym').
3. User opens program editor for cardio, deletes "Squat", adds "Run". Saves program.
   - `ProgramEditorSidebar.saveProgram()` fetches `/api/program/get?mode=cardio` → server returns empty (no program_cardio yet). Merges day change. Saves as `program_cardio`.
   - `onProgramSaved()` callback runs in `else` branch (non-gym). Updates `exercises.value` to: [Bench, Row, OHP, Curl, Run] — all with `type: 'calist'`.
   - `customProgram.value[day]` now has cardio-modified exercise list.
4. User saves the workout in cardio mode.
   - Payload: `mode='cardio'`, exercises with `type='calist'`
   - Save endpoint: `exercise_type = mode = 'cardio'` (overrides exercise.type)
   - DB gets rows with `mode='cardio'`. **Separate rows from gym. No DB-level cross-contamination.** ✅
5. User switches back to **gym** mode. Again, page does NOT remount.
   - `currentMode` reactively changes to 'gym'.
   - `customProgram.value` still has cardio-modified data from step 3.
   - `exercises.value` still has [Bench, Row, OHP, Curl, Run] from step 3 (type: 'calist').
   - `effectiveTemplates` recomputes — `currentMode === 'gym'` branch runs. But **data source is `customProgram.value[day]`** which contains cardio-modified exercises (without Squat, with Run).
   - **Gym mode now shows cardio's exercise list.** "Squat" is missing → appears "deleted" from gym.

## Why it looks like deletion

The DB still has the original gym row for "Squat" (mode='gym', never modified). But the FORM doesn't show it because:
- `exercises.value` was rebuilt in step 3 with cardio's exercise list
- `loadCurrentSession()` was NOT re-called (no mode-change watcher triggers `reloadData`)
- The gym "Squat" row exists in DB but the template has no slot for it

On full page refresh (browser reload), gym mode re-fetches program_gym config and the old Squat data reappears. **No actual DB deletion occurs.** But during the session, it appears deleted.

## Contributing factors

### 1. No mode-change watcher in WorkoutForm.vue
- Watchers exist only for `props.day` and `props.week`
- No `watch(currentMode, reloadData)` or equivalent
- `onMounted` fetches data for the mode at mount time — never refreshed

### 2. `navigateTo("/workout")` from same route does not remount
- ModeSelectorModal calls `navigateTo("/workout")` on mode switch
- Vue Router treats same-path navigation as no-op (NavigationDuplicated)
- Page component and all children persist

### 3. Stale `customProgram.value` across modes
- Fetched once in `onMounted`: `secureFetch(/api/program/get?mode=${currentMode.value})`
- Not invalidated on mode switch
- `effectiveTemplates` computed reads stale `customProgram.value[day]` for the WRONG mode

### 4. `apiMode` in workout.vue is binary (gym vs calist)
```typescript
const apiMode = computed(() => (isGym.value ? "gym" : "calist"));
```
- Cardio mode → `apiMode = "calist"` — wrong
- Custom mode → `apiMode = "calist"` — wrong
- History query: `?mode=calist` returns calist rows, not cardio rows
- Program config fetch: queries `program_calist` not `program_cardio`

## Server-side: No actual cross-mode data loss

The save endpoint (`server/api/workout/save.post.ts`) correctly:
- Accepts `mode` from request body
- Sets `exercise_type = mode` (for non-custom modes)
- Uses `UNIQUE(user_id, week, day, mode, exercise_name)` — different modes = different rows
- Only upserts, never deletes

The GET endpoint (`server/api/workout/get.get.ts`) correctly filters by `?mode=`. No cross-mode data leakage on the server side.

## Fix Required

1. **WorkoutForm.vue**: Add mode-change watcher to reload data
2. **workout.vue**: Fix `apiMode` to use actual mode string, not binary gym/calist
3. **workout.vue**: Add mode-change watcher to reload history
4. **WorkoutForm.vue**: Re-fetch `customProgram` from server on mode switch
