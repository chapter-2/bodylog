<template>
  <div class="inner border-x border-separator bg-white min-h-[60vh]">
    <WorkoutHeader
      :day-name="dayName"
      :day-focus="dayFocus"
      :last-saved="lastSaved"
      :is-authenticated="isAuthenticated"
      :has-exercises="exercises.length > 0"
      @open-rules="showRules = true"
      @edit-program="handleEditClick"
    />

    <RestDayState v-if="exercises.length === 0" />

    <form
      v-else
      @submit.prevent="saveWorkout"
      class="divide-y divide-separator"
    >
      <SessionNotes v-model="sessionNote" />
      <ExerciseCard
        v-for="(exercise, exIdx) in exercises"
        :key="exIdx"
        v-model="exercises[exIdx]"
        :mode="exercise.type || currentMode"
        :week="week"
        :last-week-data="lastWeekData[exIdx]"
      />
      <ProgressiveTip :mode="currentMode" />
      <SaveFooter
        v-model:completed="completed"
        :saving="saving"
        :save-error="saveError"
      />
    </form>

    <LoggingRulesModal
      :show="showRules"
      :mode="currentMode"
      @close="showRules = false"
    />

    <ProgramEditorSidebar
      :open="showProgramEditor"
      :mode="currentMode"
      :day="props.day"
      :exercises="sidebarExercises"
      @close="showProgramEditor = false"
      @saved="onProgramSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted, watchEffect } from "vue";
import confetti from "canvas-confetti";
import type {
  ExerciseType,
  WorkoutExercise,
  WorkoutSetGym,
  WorkoutSetCalist,
} from "~/types";
import { ALL_DAYS, gymProgramDefaults, calistProgramDefaults } from "~/utils/workoutDefaults";
import ExerciseCard from "~/components/workout/ExerciseCard.vue";
import WorkoutHeader from "~/components/workout/WorkoutHeader.vue";
import RestDayState from "~/components/workout/RestDayState.vue";
import SessionNotes from "~/components/workout/SessionNotes.vue";
import ProgressiveTip from "~/components/workout/ProgressiveTip.vue";
import SaveFooter from "~/components/workout/SaveFooter.vue";
import LoggingRulesModal from "~/components/workout/LoggingRulesModal.vue";
import { useTimer } from "~/composables/useTimer";

interface SidebarExercise {
  id: string;
  name: string;
  sets: number;
  targetReps: number;
  equipment: string[];
  type: "reps" | "hold";
}

interface SubOption {
  label: string;
  value: string;
}

const props = defineProps<{ week: number; day: string }>();
const emit = defineEmits(["saved"]);
const { isAuthenticated, secureFetch } = useAuth();
const { showOnWorkoutPage } = useTimer();
const route = useRoute();

const { mode: currentMode, isGym } = useMode();

const exercises = ref<WorkoutExercise[]>([]);
const completed = ref(false);
const saving = ref(false);
const lastSaved = ref("");
const saveError = ref("");
const lastWeekData = ref<Record<number, { sets: string[]; name: string }>>({});
const sessionNote = ref("");
const showRules = ref(false);
const showProgramEditor = ref(false);
const sidebarExercises = ref<SidebarExercise[]>([]);
const customProgram = ref<Record<
  string,
  { exercises?: any[]; name?: string; focus?: string; isRest?: boolean }
> | null>(null);
const isLoadingData = ref(true);

let currentFetchId = 0;

const draftKey = computed(() => `bodylog_draft_${props.week}_${props.day}`);

const defaultsForMode = computed(() =>
  currentMode.value === "gym" ? gymProgramDefaults : calistProgramDefaults
);

const effectiveTemplates = computed(() => {
  const result: Record<string, any> = {};
  for (const day of ALL_DAYS) {
    const def = defaultsForMode.value[day] || {
      name: "REST DAY",
      focus: "Recover",
      exercises: [],
      isRest: true,
    };
    const custom = customProgram.value?.[day];
    const isRest = custom?.isRest !== undefined ? custom.isRest : def.isRest;

    if (isRest) {
      result[day] = { name: "REST DAY", focus: "Recover", exercises: [] };
    } else if (custom) {
      if (currentMode.value === "gym") {
        result[day] = {
          name: custom.name || def.name,
          focus: custom.focus || def.focus,
          exercises:
            custom.exercises && custom.exercises.length > 0
              ? custom.exercises
              : def.exercises || [],
        };
      } else {
        result[day] = {
          name: custom.name || def.name,
          focus: custom.focus || def.focus,
          exercises:
            custom.exercises && custom.exercises.length > 0
              ? custom.exercises.map((customEx: any, idx: number) => {
                  const fallbackDef = def.exercises?.[idx];
                  return {
                    ...fallbackDef,
                    name: customEx.name || fallbackDef?.name || "",
                    type: customEx.type || fallbackDef?.type || "reps",
                    setCount:
                      customEx.setCount ??
                      customEx.sets ??
                      fallbackDef?.setCount ??
                      3,
                    targetReps:
                      customEx.targetReps ?? fallbackDef?.targetReps ?? 10,
                    subs:
                      customEx.equipment?.length > 0
                        ? customEx.equipment.map((eq: string) => ({
                            label: eq,
                            value: eq,
                          }))
                        : fallbackDef?.subs,
                    equipment: customEx.equipment ?? fallbackDef?.equipment ?? [],
                  };
                })
              : def.exercises || [],
        };
      }
    } else {
      result[day] = def;
    }
  }
  return result;
});

const dayName = computed(
  () => effectiveTemplates.value[props.day]?.name || "REST DAY",
);
const dayFocus = computed(
  () => effectiveTemplates.value[props.day]?.focus || "Recover",
);

// ─── Helpers ───

function parseVariants(name: string): string[] | null {
  if (name.includes(" / ")) return name.split(" / ").map((v) => v.trim());
  return null;
}

function effectiveName(ex: WorkoutExercise): string {
  if (ex.selectedSub) return ex.selectedSub;
  if (ex.selectedVariant) return ex.selectedVariant;
  return ex.name;
}

function allPossibleNames(ex: WorkoutExercise): string[] {
  const base = ex.name;
  if (ex.subs) return [base, ...ex.subs.map((s) => s.value)];
  if (ex.variants) return [base, ...ex.variants];
  return [base];
}

function formatSetValue(ex: WorkoutExercise, val: number | null): string {
  if (val === null || val <= 0) return "-";
  if (ex.holdType === "hold") return `${val}s`;
  return `${val} reps`;
}

function parseSetValue(stored: string): number | null {
  if (!stored || stored === "-") return null;
  const parsedVal = parseFloat(stored.replace(/[a-zA-Z]/g, "").trim());
  return isNaN(parsedVal) ? null : parsedVal;
}

// ─── Initialization ───

function initializeExercises() {
  const template = effectiveTemplates.value[props.day];
  if (!template) {
    exercises.value = [];
    return;
  }

  if (currentMode.value === "gym") {
    exercises.value = template.exercises.map((ex: any) => {
      const variants = parseVariants(ex.name);
      return {
        name: ex.name,
        type: "gym" as ExerciseType,
        variants: variants || undefined,
        selectedVariant: variants ? variants[0] : undefined,
        sets: Array(ex.sets).fill(null).map(() => ({ weight: null, reps: null } as WorkoutSetGym)),
        note: "",
        showNote: false,
        targetReps: ex.targetReps,
      } as WorkoutExercise;
    });
  } else {
    exercises.value = template.exercises.map((def: any) => ({
      name: def.name,
      type: "calist" as ExerciseType,
      holdType: def.type,
      sets: Array(def.setCount).fill(null).map(() => ({ value: null } as WorkoutSetCalist)),
      subs: def.subs,
      selectedSub: def.subs ? def.subs[0].value : undefined,
      note: "",
      showNote: false,
      targetReps: def.targetReps,
    } as WorkoutExercise));
  }
}

// ─── Draft persistence ───

function loadLocalDraft(): boolean {
  const saved = localStorage.getItem(draftKey.value);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.exercises && parsed.exercises.length > 0) {
        exercises.value = parsed.exercises;
        sessionNote.value = parsed.sessionNote || "";
        return true;
      }
    } catch (e) {}
  }
  return false;
}

// ─── Data loading ───

async function loadLastWeekData() {
  if (props.week <= 1) return;
  try {
    if (dayName.value === "REST DAY") return;
    const { data } = await secureFetch(`/api/workout/get?day=${dayName.value}&mode=${currentMode.value}`);
    const lastWeekWorkouts = (data as any[]).filter(
      (row: any) => parseInt(row[0]) === props.week - 1,
    );

    if (lastWeekWorkouts.length > 0) {
      const template = effectiveTemplates.value[props.day];
      const dataMap: Record<number, { sets: string[]; name: string }> = {};

      template?.exercises.forEach((templateEx: any, idx: number) => {
        const exName = templateEx.name || templateEx;
        const possibleNames: string[] = [exName];
        if (templateEx.subs) possibleNames.push(...templateEx.subs.map((s: any) => s.value));
        if (templateEx.equipment) possibleNames.push(...templateEx.equipment);

        let exerciseRow: any = null;
        for (const n of possibleNames) {
          exerciseRow = lastWeekWorkouts.find((row: any) => row[4] === n);
          if (exerciseRow) break;
        }

        if (exerciseRow) {
          const sets = [
            exerciseRow[5],
            exerciseRow[6],
            exerciseRow[7],
            exerciseRow[8],
          ].filter((s: any) => s && s !== "-" && s !== undefined);
          dataMap[idx] = { sets, name: exerciseRow[4] };
        }
      });
      lastWeekData.value = dataMap;
    }
  } catch (error) {}
}

async function loadCurrentSession() {
  try {
    if (dayName.value === "REST DAY") return;
    const { data } = await secureFetch(`/api/workout/get?day=${dayName.value}&mode=${currentMode.value}`);
    const currentSessionRows = (data as any[]).filter(
      (row: any) => parseInt(row[0]) === props.week,
    );

    if (currentSessionRows.length > 0) {
      const firstRow = currentSessionRows[0];
      if (firstRow[11]) sessionNote.value = firstRow[11];

      exercises.value.forEach((exercise) => {
        const possibleNames = allPossibleNames(exercise);
        let savedRow: any = null;
        for (const n of possibleNames) {
          savedRow = currentSessionRows.find((row: any) => row[4] === n);
          if (savedRow) break;
        }

        if (savedRow) {
          // Set selected variant/sub
          if (exercise.subs) {
            const matchedSub = exercise.subs.find((s) => s.value === savedRow[4]);
            if (matchedSub) exercise.selectedSub = matchedSub.value;
          } else if (exercise.variants) {
            if (exercise.variants.includes(savedRow[4])) {
              exercise.selectedVariant = savedRow[4];
            }
          }

          // Load sets based on exercise type
          if (exercise.type === "gym") {
            const gymSets = exercise.sets as WorkoutSetGym[];
            gymSets.forEach((set, idx) => {
              const setString = savedRow[5 + idx];
              if (setString && setString !== "-") {
                const parts = setString.split("×");
                if (parts.length === 2) {
                  const parsedWeight = parseFloat(parts[0].replace(/kg/gi, "").trim());
                  const parsedReps = parseFloat(parts[1].trim());
                  set.weight = isNaN(parsedWeight) ? null : parsedWeight;
                  set.reps = isNaN(parsedReps) ? null : parsedReps;
                }
              }
            });
          } else {
            const calistSets = exercise.sets as WorkoutSetCalist[];
            calistSets.forEach((set, idx) => {
              set.value = parseSetValue(savedRow[5 + idx]);
            });
          }

          if (savedRow[10]) exercise.note = savedRow[10];
        }
      });

      if (currentSessionRows[0][9] === "YES") completed.value = true;
    }
  } catch (error) {}
}

// ─── Saving ───

async function saveWorkout() {
  if (dayName.value === "REST DAY") return;
  if (!isAuthenticated.value) {
    navigateTo("/login");
    return;
  }

  if (saving.value) return;

  saving.value = true;
  saveError.value = "";

  try {
    const now = new Date();
    const dateStr = now.toLocaleDateString("id-ID");
    const timeStr = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const exercisePayload = exercises.value.map((ex) => {
      if (ex.type === "gym") {
        return {
          name: effectiveName(ex),
          type: "gym",
          sets: (ex.sets as WorkoutSetGym[]).map((s) => ({
            weight: s.weight ?? 0,
            reps: s.reps ?? 0,
          })),
          note: ex.note || "",
        };
      }
      return {
        name: effectiveName(ex),
        type: "calist",
        sets: (ex.sets as WorkoutSetCalist[]).map((s) =>
          formatSetValue(ex, s.value),
        ),
        note: ex.note || "",
      };
    });

    await secureFetch("/api/workout/save", {
      method: "POST",
      body: {
        week: props.week,
        day: dayName.value,
        date: dateStr,
        time: timeStr,
        mode: currentMode.value,
        exercises: exercisePayload,
        completed: completed.value,
        sessionNote: sessionNote.value || "",
      },
    });

    localStorage.removeItem(draftKey.value);
    lastSaved.value = `${dateStr} ${timeStr}`;
    emit("saved");

    if (completed.value) triggerCelebration();
    completed.value = false;
  } catch (error: any) {
    if (error.statusCode === 401) {
      saveError.value = "Session expired. Please login again.";
      setTimeout(() => navigateTo("/login"), 2000);
    } else {
      saveError.value = error.message || "Failed to save.";
    }
  } finally {
    saving.value = false;
  }
}

// ─── Celebration ───

function triggerCelebration() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 99999,
  };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
}

// ─── Program editor ───

function handleEditClick() {
  if (!isAuthenticated.value) {
    if (currentMode.value === "calist") {
      alert("PREVIEW MODE: Silakan login untuk mengkustomisasi program dan alat.");
    }
    navigateTo("/login");
    return;
  }
  openProgramEditor();
}

function openProgramEditor() {
  const template = effectiveTemplates.value[props.day];
  if (!template) return;

  if (currentMode.value === "gym") {
    sidebarExercises.value = template.exercises.map((ex: any, idx: number) => ({
      id: `ex-${props.day}-${idx}-${ex.name.slice(0, 5)}`,
      name: ex.name,
      sets: ex.sets,
      targetReps: ex.targetReps,
      equipment: [...ex.equipment],
      type: "reps" as const,
    }));
  } else {
    sidebarExercises.value = template.exercises.map((def: any, idx: number) => ({
      id: `ex-calist-${props.day}-${idx}`,
      name: def.name,
      sets: def.setCount,
      targetReps: def.targetReps ?? 10,
      equipment:
        def.equipment ?? (def.subs ? def.subs.map((s: any) => s.label) : []),
      type: def.type,
    }));
  }
  showProgramEditor.value = true;
}

function onProgramSaved(updatedExercises: SidebarExercise[]) {
  if (!customProgram.value) customProgram.value = {};
  const dayCustom = customProgram.value[props.day] || {};

  if (currentMode.value === "gym") {
    customProgram.value[props.day] = {
      ...dayCustom,
      exercises: updatedExercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets,
        targetReps: ex.targetReps,
        equipment: ex.equipment,
      })),
    };

    const existingMap = new Map(exercises.value.map((e) => [e.name, e]));
    exercises.value = updatedExercises.map((ex) => {
      const variants = parseVariants(ex.name);
      const existing = existingMap.get(ex.name);

      const sets = Array(ex.sets).fill(null).map((_, i) => {
        const gymSets = existing?.sets as WorkoutSetGym[] | undefined;
        if (gymSets && gymSets[i]) {
          return { weight: gymSets[i].weight, reps: gymSets[i].reps };
        }
        return { weight: null, reps: null };
      });

      return {
        name: ex.name,
        type: "gym" as ExerciseType,
        variants: variants || undefined,
        selectedVariant:
          existing?.selectedVariant || (variants ? variants[0] : undefined),
        sets,
        note: existing?.note || "",
        showNote: existing?.showNote || false,
        targetReps: ex.targetReps,
      } as WorkoutExercise;
    });
  } else {
    customProgram.value[props.day] = {
      ...dayCustom,
      exercises: updatedExercises.map((ex) => ({
        name: ex.name,
        setCount: ex.sets,
        targetReps: ex.targetReps,
        equipment: ex.equipment,
        type: ex.type,
      })),
    };

    const existingMap = new Map(exercises.value.map((e) => [e.name, e]));
    exercises.value = updatedExercises.map((ex) => {
      const templateDef = effectiveTemplates.value[props.day]?.exercises?.find(
        (d: any) => d.name === ex.name,
      );
      const existing = existingMap.get(ex.name);

      let subs = undefined;
      if (ex.equipment && ex.equipment.length > 0) {
        subs = ex.equipment.map((eq: string) => ({ label: eq, value: eq }));
      } else if (templateDef?.subs) {
        subs = templateDef.subs;
      }

      const sets = Array(ex.sets).fill(null).map((_, i) => {
        const calistSets = existing?.sets as WorkoutSetCalist[] | undefined;
        if (calistSets && calistSets[i]) {
          return { value: calistSets[i].value };
        }
        return { value: null };
      });

      return {
        name: ex.name,
        type: "calist" as ExerciseType,
        holdType: ex.type,
        sets,
        subs,
        selectedSub: existing?.selectedSub || (subs ? subs[0].value : undefined),
        note: existing?.note || "",
        showNote: existing?.showNote || false,
        targetReps: ex.targetReps,
      } as WorkoutExercise;
    });
  }

  showProgramEditor.value = false;
}

// ─── Watchers & lifecycle ───

watch(
  [exercises, sessionNote],
  () => {
    if (isLoadingData.value || dayName.value === "REST DAY") return;
    localStorage.setItem(
      draftKey.value,
      JSON.stringify({
        exercises: exercises.value,
        sessionNote: sessionNote.value,
      }),
    );
  },
  { deep: true },
);

watchEffect(() => {
  showOnWorkoutPage.value = exercises.value.length > 0;
});

onUnmounted(() => {
  showOnWorkoutPage.value = false;
});

async function reloadData() {
  const fetchId = ++currentFetchId;
  isLoadingData.value = true;
  initializeExercises();
  sessionNote.value = "";
  completed.value = false;
  lastWeekData.value = {};
  if (dayName.value !== "REST DAY") {
    const hasDraft = loadLocalDraft();
    if (!hasDraft) {
      await Promise.all([loadLastWeekData(), loadCurrentSession()]);
    } else {
      await loadLocalDraft();
      await loadLastWeekData();
    }
    if (fetchId !== currentFetchId) return;
  }
  isLoadingData.value = false;
}

watch(() => props.day, reloadData);
watch(() => props.week, reloadData);

onMounted(async () => {
  isLoadingData.value = true;
  try {
    const res = (await secureFetch(
      `/api/program/get?mode=${currentMode.value}`,
    ).catch(() => ({}))) as any;
    if (res?.config) customProgram.value = res.config;
  } catch {}

  initializeExercises();

  if (dayName.value !== "REST DAY") {
    const hasDraft = loadLocalDraft();
    if (!hasDraft) {
      await Promise.all([loadLastWeekData(), loadCurrentSession()]);
    } else {
      await loadLastWeekData();
    }
  }

  isLoadingData.value = false;

  if (route.query.tour === "editor") {
    setTimeout(() => openProgramEditor(), 500);
  }
});

watch(
  () => route.query.tour,
  (newVal) => {
    if (newVal === "step5") setTimeout(() => openProgramEditor(), 100);
  },
  { immediate: true },
);
</script>
