# Implementation Plan — Phase 3: Client-Side Migration to Unified Workout API

## Goal

Fix all remaining references to deleted `/api/gym/` and `/api/calist/` endpoints, widen components to support all 4 mode types (gym, calist, cardio, custom), and remove dead code.

---

## Issues Found (with concrete fixes)

### 1. `app/pages/workout.vue` — `loadHistory()` uses deleted API

**Line 485:** `secureFetch(\`/api/${apiMode.value}/get\`)`→ constructs`/api/gym/get`or`/api/calist/get` — both endpoints deleted.

**Fix — line 485, change to:**

```ts
const { data } = await secureFetch(
  `/api/workout/get?exercise_type=${apiMode.value}`,
);
```

`apiMode` (computed on line 401: `isGym.value ? "gym" : "calist"`) maps to valid `exercise_type` values. Response is identical flat array columns 0-11, column 12 (exercise_type) is new and ignored.

---

### 2. `app/pages/coach.vue` — `handleSummonTrainer()` uses deleted API

**Line 232:** `isGym.value ? secureFetch("/api/gym/get") : secureFetch("/api/calist/get")`

**Fix — line 232, change to:**

```ts
secureFetch(`/api/workout/get?exercise_type=${isGym.value ? "gym" : "calist"}`);
```

Response has same `data` shape. CSV builders `buildGymCsv`/`buildCalistCsv` read only columns 0-11, unchanged.

---

### 3. `server/api/export/all.get.ts` — queries deleted tables

**Lines 7-12:** Queries `gym_sessions` and `calist_sessions` — both tables dropped from schema.

**Fix — replace the two SELECT statements:**

```ts
const gymSessions = await db.execute(
  "SELECT * FROM workout_sessions WHERE exercise_type = 'gym' ORDER BY week ASC",
);
const calistSessions = await db.execute(
  "SELECT * FROM workout_sessions WHERE exercise_type = 'calist' ORDER BY week ASC",
);
```

Return shape `{ gym: rows, calist: rows, weight: rows }` unchanged. Callers on coach page unaffected.

---

### 4. `app/components/TheNavbar.vue` — labels + mode button gym/calist only

**Lines to fix:**

- Line ~45 (desktop nav label): `{{ isGym ? "Gym Log" : "Calist Log" }}`
- Line ~137 (mobile nav label): `{{ isGym ? "GYM LOG" : "CALIST LOG" }}`
- Line ~43 (desktop mode button text): `{{ isGym ? "GYM" : "CALIST" }}`
- Line ~157 (mobile mode button text): `{{ isGym ? "GYM" : "CALIST" }}`

**Fix — add computed to script block:**

```ts
const modeLabel = computed(() => {
  if (isGym.value) return "Gym";
  if (isCalist.value) return "Calist";
  if (isCardio.value) return "Cardio";
  return "Custom";
});

const modeIcon = computed(() => {
  if (isGym.value) return Dumbbell;
  if (isCalist.value) return Activity;
  if (isCardio.value) return Heart;
  return SlidersHorizontal;
});
```

**Template changes:**

- Desktop nav: `{{ modeLabel }} Log`
- Mobile nav: `{{ modeLabel.toUpperCase() }} LOG`
- Mode button text: `{{ modeLabel.toUpperCase() }}`
- Mode button icon: `<component :is="modeIcon" />` replacing `<Dumbbell v-if="isGym" ... />` / `<Activity v-else ... />`

**Imports to add:** `import { Heart, SlidersHorizontal, Dumbbell, Activity, ... } from "lucide-vue-next"`

---

### 5. `app/components/ModeSelectorModal.vue` — only 2 mode buttons

**Problems:**

- Line ~112: `selectDirectMode(m: "gym" | "calist")` — narrow type
- Template: `grid-cols-2` with only GYM and CALIST buttons, no cardio/custom

**Fix — template:** Change grid to 2×2 layout (`grid-cols-2` stays, add `divide-y divide-separator`). Add 2 new buttons:

- **CARDIO:** `<Activity>` icon, label "CARDIO", subtext "Running, cycling, swimming."
- **CUSTOM:** `<SlidersHorizontal>` icon (new import), label "CUSTOM", subtext "Build your own."

**Fix — script:**

- Widen: `selectDirectMode(m: "gym" | "calist" | "cardio" | "custom")`
- Import `SlidersHorizontal` from `lucide-vue-next`

`navigateTo("/workout")` at end of `selectDirectMode` stays — all modes go to workout page.

---

### 6. `app/composables/useMode.ts` — `hasMode` excludes cardio/custom

**Line ~84:** `hasMode = computed(() => mode.value === "gym" || mode.value === "calist")`

**Fix:**

```ts
const hasMode = computed(() =>
  ["gym", "calist", "cardio", "custom"].includes(mode.value),
);
```

**⚠️ ORDER DEPENDENCY:** This MUST be applied AFTER Issue 5 (ModeSelectorModal has 4 buttons). If `hasMode` expands first, selecting cardio/custom before buttons exist triggers `hasMode=true` and the modal closes — the user would never see it. Reorder: do Issue 5 first, then Issue 6.

---

### 7. `app/components/ProgramEditorSidebar.vue` — mode prop narrow

**Line ~118:** `mode: "gym" | "calist"`

**Fix:** Widen to `mode: "gym" | "calist" | "cardio" | "custom"`.

**Line ~22 (template header):** `{{ mode === "gym" ? "GYM" : "CALIST" }}`

**Fix:** Replace with computed:

```ts
const modeLabel = computed(() => {
  const map: Record<string, string> = {
    gym: "GYM",
    calist: "CALIST",
    cardio: "CARDIO",
    custom: "CUSTOM",
  };
  return map[props.mode] || props.mode.toUpperCase();
});
```

And matching dynamic icon (import `Heart`, `SlidersHorizontal` from lucide, replace `<Dumbbell v-if>`/`<Activity v-else>` pattern with `<component :is="modeIcon" />`).

---

### 8. `app/components/editor/EditorExerciseList.vue` — mode prop narrow

**Line ~176:** `mode: "gym" | "calist"`

**Fix:** Widen to `mode: "gym" | "calist" | "cardio" | "custom"`.

No other logic changes. Hold/reps toggle (line ~87: `v-if="mode === 'calist'"`) only activates for calist — correct. Cardio/custom exercises get no toggle, which is acceptable graceful degrade.

---

### 9. `app/components/editor/EditorPalette.vue` — mode prop narrow + no cardio equipment

**Line ~133:** `mode: "gym" | "calist"`

**Fix:** Widen to `mode: "gym" | "calist" | "cardio" | "custom"`.

**Line ~141:** `equipmentPresets` computed returns gym equipment OR calist equipment via ternary. No cardio equipment.

**Fix:** Replace with lookup:

```ts
const cardioEquipment = [
  "Treadmill",
  "Stationary Bike",
  "Rowing Machine",
  "Elliptical",
  "Stairmaster",
  "Jump Rope",
];
const allEquipment = [...gymEquipment, ...calistEquipment, ...cardioEquipment];

const equipmentPresets = computed(() => {
  if (props.mode === "gym") return gymEquipment;
  if (props.mode === "calist") return calistEquipment;
  if (props.mode === "cardio") return cardioEquipment;
  return allEquipment; // custom gets all
});
```

---

### 10. `app/components/workout/ExerciseCard.vue` — mode prop narrow

**Line ~238:** `mode: "gym" | "calist"`

**Fix:** Widen to `mode: "gym" | "calist" | "cardio" | "custom"`.

Template checks `mode === "gym"` (shows weight×reps inputs) and `mode === "calist"` (shows value input). When mode is "cardio" or "custom", neither branch renders — shows exercise name + note only. Graceful degrade, acceptable for now.

---

### 11. Delete `app/components/GymWorkoutForm.vue`

Dead code. Calls deleted `/api/gym/get` and `/api/gym/save`. Zero imports reference it anywhere in `app/`. Replaced by `WorkoutForm.vue`.

---

### 12. Delete `app/components/CalistWorkoutForm.vue`

Dead code. Calls deleted `/api/calist/get` and `/api/calist/save`. Zero imports reference it anywhere in `app/`. Replaced by `WorkoutForm.vue`.

---

## Files Already Correct (No Changes)

- `app/components/OnboardingTour.vue` — Already uses `navigateTo("/workout?tour=…")` for steps 3-4. No old routes.
- `app/utils/tourConfig.ts` — Targets `nav-log`/`mob-log` element IDs (unchanged in navbar). No route references.
- `app/utils/workoutDefaults.ts` — No route or API references.
- `app/components/WorkoutForm.vue` — Already calls `/api/workout/get` and `/api/workout/save`.
- `app/app.vue` — Uses `hasMode` from composable, no direct route references.

---

## Task Execution Order

### Phase 3A — Mode Foundation (dependencies required)

1. **Fix ModeSelectorModal.vue** — add cardio + custom buttons (Issue 5)
2. **Fix useMode.ts hasMode** — expand to 4 modes (Issue 6) — AFTER Issue 5
3. **Fix TheNavbar.vue** — dynamic labels + icons (Issue 4)

### Phase 3B — Component Type Widening (no strict deps)

4. **Fix ProgramEditorSidebar.vue** — widen mode, dynamic header (Issue 7)
5. **Fix EditorExerciseList.vue** — widen mode prop only (Issue 8)
6. **Fix EditorPalette.vue** — widen mode + cardio equipment (Issue 9)
7. **Fix ExerciseCard.vue** — widen mode prop only (Issue 10)

### Phase 3C — API Endpoint Migration (runtime crash fixes)

8. **Fix workout.vue loadHistory()** — change to `/api/workout/get` (Issue 1)
9. **Fix coach.vue handleSummonTrainer()** — change to `/api/workout/get` (Issue 2)
10. **Fix export/all.get.ts** — query `workout_sessions` instead of `gym_sessions`/`calist_sessions` (Issue 3)

### Phase 3D — Dead Code Removal (last, safety valve)

11. **Delete GymWorkoutForm.vue** (Issue 11)
12. **Delete CalistWorkoutForm.vue** (Issue 12)

---

## Files to Modify

| File                                           | Issue # |
| ---------------------------------------------- | ------- |
| `app/pages/workout.vue`                        | 1       |
| `app/pages/coach.vue`                          | 2       |
| `server/api/export/all.get.ts`                 | 3       |
| `app/components/TheNavbar.vue`                 | 4       |
| `app/components/ModeSelectorModal.vue`         | 5       |
| `app/composables/useMode.ts`                   | 6       |
| `app/components/ProgramEditorSidebar.vue`      | 7       |
| `app/components/editor/EditorExerciseList.vue` | 8       |
| `app/components/editor/EditorPalette.vue`      | 9       |
| `app/components/workout/ExerciseCard.vue`      | 10      |

## Files to Delete

| File                                   | Issue # |
| -------------------------------------- | ------- |
| `app/components/GymWorkoutForm.vue`    | 11      |
| `app/components/CalistWorkoutForm.vue` | 12      |

---

## Risks

| Risk                                                                   | Severity | Mitigation                                                                                                                         |
| ---------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `hasMode` expansion before ModeSelectorModal has 4 buttons             | Medium   | Do Modal (Issue 5) before `hasMode` (Issue 6)                                                                                      |
| Cardio/custom modes have no program defaults                           | Low      | `workoutDefaults.ts` only has gym/calist defaults. Cardio/custom users see empty workout form — acceptable                         |
| Cardio/custom exercises in ExerciseCard render nothing                 | Low      | Graceful degrade — shows name + note only. Full cardio/exercise type UI in Phase 4                                                 |
| Export API returns extra columns (id + exercise_type) from `SELECT *`  | Low      | Callers only iterate rows by index 0-11, ignore extra columns                                                                      |
| `WorkoutForm.vue` exercise type defaults to "calist" for cardio/custom | Low      | Only affects save payload format. Cardio data stored with `exercise_type='calist'` in DB — acceptable until Phase 4                |
| No build verification                                                  | Medium   | Run `nuxt build` after all changes                                                                                                 |
| No tests exist                                                         | High     | Manual smoke test: login → select each mode → open workout page → verify page loads without errors. Check browser console for 404s |
