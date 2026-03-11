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
                mode="calist"
                :week="week"
                :last-week-data="lastWeekData[exIdx]"
            />
            <ProgressiveTip mode="calist" />
            <SaveFooter
                v-model:completed="completed"
                :saving="saving"
                :save-error="saveError"
            />
        </form>

        <LoggingRulesModal
            :show="showRules"
            mode="calist"
            @close="showRules = false"
        />

        <ProgramEditorSidebar
            :open="showProgramEditor"
            mode="calist"
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
import ExerciseCard from "~/components/workout/ExerciseCard.vue";
import WorkoutHeader from "~/components/workout/WorkoutHeader.vue";
import RestDayState from "~/components/workout/RestDayState.vue";
import SessionNotes from "~/components/workout/SessionNotes.vue";
import ProgressiveTip from "~/components/workout/ProgressiveTip.vue";
import SaveFooter from "~/components/workout/SaveFooter.vue";
import LoggingRulesModal from "~/components/workout/LoggingRulesModal.vue";
import { useTimer } from "~/composables/useTimer";

interface UISet {
    value: number | null;
}

interface SubOption {
    label: string;
    value: string;
}

interface UIExercise {
    name: string;
    type: "reps" | "hold";
    sets: UISet[];
    subs?: SubOption[];
    selectedSub?: string;
    note?: string;
    showNote?: boolean;
    targetReps?: number;
}

interface SidebarExercise {
    id: string;
    name: string;
    sets: number;
    targetReps: number;
    equipment: string[];
    type: "reps" | "hold";
}

interface ExerciseDef {
    name: string;
    type: "reps" | "hold";
    setCount: number;
    targetReps?: number;
    subs?: SubOption[];
    equipment?: string[];
}

const props = defineProps<{ week: number; day: string }>();
const emit = defineEmits(["saved"]);
const { isAuthenticated, secureFetch } = useAuth();
const { showOnWorkoutPage } = useTimer();
const route = useRoute();

const exercises = ref<UIExercise[]>([]);
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

const effectiveTemplates = computed(() => {
    const result: Record<string, any> = {};
    for (const day of ALL_DAYS) {
        const def = calistProgramDefaults[day] || {
            name: "REST DAY",
            focus: "Recover",
            exercises: [],
            isRest: true,
        };
        const custom = customProgram.value?.[day];
        const isRest =
            custom?.isRest !== undefined ? custom.isRest : def.isRest;

        if (isRest) {
            result[day] = { name: "REST DAY", focus: "Recover", exercises: [] };
        } else if (custom) {
            result[day] = {
                name: custom.name || def.name,
                focus: custom.focus || def.focus,
                exercises:
                    custom.exercises && custom.exercises.length > 0
                        ? custom.exercises.map((customEx: any, idx: number) => {
                              const fallbackDef = def.exercises?.[idx];
                              return {
                                  ...fallbackDef,
                                  name:
                                      customEx.name || fallbackDef?.name || "",
                                  type:
                                      customEx.type ||
                                      fallbackDef?.type ||
                                      "reps",
                                  setCount:
                                      customEx.setCount ??
                                      customEx.sets ??
                                      fallbackDef?.setCount ??
                                      3,
                                  targetReps:
                                      customEx.targetReps ??
                                      fallbackDef?.targetReps ??
                                      10,
                                  subs:
                                      customEx.equipment?.length > 0
                                          ? customEx.equipment.map(
                                                (eq: string) => ({
                                                    label: eq,
                                                    value: eq,
                                                }),
                                            )
                                          : fallbackDef?.subs,
                                  equipment:
                                      customEx.equipment ??
                                      fallbackDef?.equipment ??
                                      [],
                              };
                          })
                        : def.exercises || [],
            };
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

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

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

function handleEditClick() {
    if (!isAuthenticated.value) {
        alert(
            "PREVIEW MODE: Silakan login untuk mengkustomisasi program dan alat.",
        );
        navigateTo("/login");
        return;
    }
    openProgramEditor();
}

function openProgramEditor() {
    const template = effectiveTemplates.value[props.day];
    if (!template) return;

    sidebarExercises.value = template.exercises.map(
        (def: any, idx: number) => ({
            id: `ex-calist-${props.day}-${idx}`,
            name: def.name,
            sets: def.setCount,
            targetReps: def.targetReps ?? 10,
            equipment:
                def.equipment ??
                (def.subs ? def.subs.map((s: any) => s.label) : []),
            type: def.type,
        }),
    );
    showProgramEditor.value = true;
}

function onProgramSaved(updatedExercises: SidebarExercise[]) {
    if (!customProgram.value) customProgram.value = {};
    customProgram.value[props.day] = {
        ...customProgram.value[props.day],
        exercises: updatedExercises.map((ex) => ({
            name: ex.name,
            setCount: ex.sets,
            targetReps: ex.targetReps,
            equipment: ex.equipment,
            type: ex.type,
        })),
    };
    initializeExercises();
    showProgramEditor.value = false;
}

function effectiveName(ex: UIExercise): string {
    return ex.selectedSub || ex.name;
}

function allPossibleNames(ex: UIExercise | ExerciseDef): string[] {
    const base = ex.name;
    const subs = (ex as any).subs as SubOption[] | undefined;
    if (!subs) return [base];
    return [base, ...subs.map((s: SubOption) => s.value)];
}

function formatSetValue(ex: UIExercise, val: number | null): string {
    if (val === null || val <= 0) return "-";
    return ex.type === "hold" ? `${val}s` : `${val} reps`;
}

function parseSetValue(stored: string): number | null {
    if (!stored || stored === "-") return null;
    return parseInt(stored) || null;
}

function initializeExercises() {
    const template = effectiveTemplates.value[props.day];
    if (!template) {
        exercises.value = [];
        return;
    }
    exercises.value = template.exercises.map((def: any) => ({
        name: def.name,
        type: def.type,
        sets: Array(def.setCount)
            .fill(null)
            .map(() => ({ value: null })),
        subs: def.subs,
        selectedSub: def.subs ? def.subs[0].value : undefined,
        note: "",
        showNote: false,
        targetReps: def.targetReps,
    }));
}

async function loadLastWeekData() {
    lastWeekData.value = {};
    if (props.week <= 1) return;

    try {
        if (dayName.value === "REST DAY") return;
        const { data } = await secureFetch(
            `/api/calist/get?day=${dayName.value}`,
        );
        const lastWeekRows = (data as any[]).filter(
            (row: any) => parseInt(row[0]) === props.week - 1,
        );

        if (lastWeekRows.length > 0) {
            const template = effectiveTemplates.value[props.day];
            const dataMap: Record<number, { sets: string[]; name: string }> =
                {};

            template?.exercises.forEach((def: any, idx: number) => {
                const possibleNames = allPossibleNames(def);
                let exerciseRow: any = null;
                for (const n of possibleNames) {
                    exerciseRow = lastWeekRows.find((row: any) => row[4] === n);
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
        const { data } = await secureFetch(
            `/api/calist/get?day=${dayName.value}`,
        );
        const currentRows = (data as any[]).filter(
            (row: any) => parseInt(row[0]) === props.week,
        );

        if (currentRows.length > 0) {
            const firstRow = currentRows[0];
            if (firstRow[11]) sessionNote.value = firstRow[11];

            exercises.value.forEach((exercise) => {
                const possibleNames = allPossibleNames(exercise);
                let savedRow: any = null;
                for (const n of possibleNames) {
                    savedRow = currentRows.find((row: any) => row[4] === n);
                    if (savedRow) break;
                }
                if (savedRow) {
                    if (exercise.subs) {
                        const matchedSub = exercise.subs.find(
                            (s) => s.value === savedRow[4],
                        );
                        if (matchedSub) exercise.selectedSub = matchedSub.value;
                    }
                    exercise.sets.forEach(
                        (set, idx) =>
                            (set.value = parseSetValue(savedRow[5 + idx])),
                    );
                    if (savedRow[10]) exercise.note = savedRow[10];
                }
            });
            if (currentRows[0][9] === "YES") completed.value = true;
        }
    } catch (error) {}
}

async function saveWorkout() {
    if (dayName.value === "REST DAY") return;
    if (!isAuthenticated.value) {
        navigateTo("/login");
        return;
    }

    saving.value = true;
    saveError.value = "";

    try {
        const now = new Date();
        const dateStr = now.toLocaleDateString("id-ID");
        const timeStr = now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });

        const exercisePayload = exercises.value.map((ex) => ({
            name: effectiveName(ex),
            sets: ex.sets.map((s) => formatSetValue(ex, s.value)),
            note: ex.note || "",
        }));

        await secureFetch("/api/calist/save", {
            method: "POST",
            body: {
                week: props.week,
                day: dayName.value,
                date: dateStr,
                time: timeStr,
                exercises: exercisePayload,
                completed: completed.value,
                sessionNote: sessionNote.value || "",
            },
        });

        lastSaved.value = `${dateStr} ${timeStr}`;
        emit("saved");

        if (completed.value) {
            triggerCelebration();
        }

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

onMounted(async () => {
    try {
        const res = (await secureFetch("/api/program/get?mode=calist")) as {
            config: any;
            start_date: string | null;
        };
        if (res.config) customProgram.value = res.config;
    } catch {}

    initializeExercises();

    if (dayName.value !== "REST DAY") {
        await Promise.all([loadLastWeekData(), loadCurrentSession()]);
    }

    if (route.query.tour === "editor") {
        setTimeout(() => openProgramEditor(), 500);
    }
});

watchEffect(() => {
    showOnWorkoutPage.value = exercises.value.length > 0;
});

onUnmounted(() => {
    showOnWorkoutPage.value = false;
});

watch(
    () => props.day,
    async () => {
        initializeExercises();
        sessionNote.value = "";
        completed.value = false;
        lastWeekData.value = {};
        if (dayName.value !== "REST DAY") {
            await Promise.all([loadLastWeekData(), loadCurrentSession()]);
        }
    },
);

watch(
    () => props.week,
    () => {
        initializeExercises();
        sessionNote.value = "";
        completed.value = false;
        lastWeekData.value = {};
        if (dayName.value !== "REST DAY") {
            loadLastWeekData();
            loadCurrentSession();
        }
    },
);

watch(
    () => route.query.tour,
    (newVal) => {
        if (newVal === "step5") setTimeout(() => openProgramEditor(), 100);
    },
    { immediate: true },
);
</script>
