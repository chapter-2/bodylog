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
                mode="gym"
                :week="week"
                :last-week-data="lastWeekData[exIdx]"
            />
            <ProgressiveTip mode="gym" />
            <SaveFooter
                v-model:completed="completed"
                :saving="saving"
                :save-error="saveError"
            />
        </form>

        <LoggingRulesModal
            :show="showRules"
            mode="gym"
            @close="showRules = false"
        />

        <ProgramEditorSidebar
            :open="showProgramEditor"
            mode="gym"
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
import type { Exercise } from "~/types";
import ExerciseCard from "~/components/workout/ExerciseCard.vue";
import WorkoutHeader from "~/components/workout/WorkoutHeader.vue";
import RestDayState from "~/components/workout/RestDayState.vue";
import SessionNotes from "~/components/workout/SessionNotes.vue";
import ProgressiveTip from "~/components/workout/ProgressiveTip.vue";
import SaveFooter from "~/components/workout/SaveFooter.vue";
import LoggingRulesModal from "~/components/workout/LoggingRulesModal.vue";
import { useTimer } from "~/composables/useTimer";

interface UIExercise extends Exercise {
    variants?: string[];
    selectedVariant?: string;
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
const showRules = ref(false);
const sessionNote = ref("");
const showProgramEditor = ref(false);
const sidebarExercises = ref<SidebarExercise[]>([]);
const customProgram = ref<Record<
    string,
    { exercises?: any[]; name?: string; focus?: string; isRest?: boolean }
> | null>(null);

const effectiveTemplates = computed(() => {
    const result: Record<string, any> = {};
    for (const day of ALL_DAYS) {
        const def = gymProgramDefaults[day] || {
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
                        ? custom.exercises
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

    sidebarExercises.value = template.exercises.map((ex: any, idx: number) => ({
        id: `ex-${props.day}-${idx}-${ex.name.slice(0, 5)}`,
        name: ex.name,
        sets: ex.sets,
        targetReps: ex.targetReps,
        equipment: [...ex.equipment],
        type: "reps" as const,
    }));
    showProgramEditor.value = true;
}

function onProgramSaved(updatedExercises: SidebarExercise[]) {
    if (!customProgram.value) customProgram.value = {};
    customProgram.value[props.day] = {
        ...customProgram.value[props.day],
        exercises: updatedExercises.map((ex) => ({
            name: ex.name,
            sets: ex.sets,
            targetReps: ex.targetReps,
            equipment: ex.equipment,
        })),
    };
    initializeExercises();
    showProgramEditor.value = false;
}

function parseVariants(name: string): string[] | null {
    if (name.includes(" / ")) return name.split(" / ").map((v) => v.trim());
    return null;
}

function effectiveName(ex: UIExercise): string {
    return ex.selectedVariant || ex.name;
}

function initializeExercises() {
    const template = effectiveTemplates.value[props.day];
    if (!template) {
        exercises.value = [];
        return;
    }

    exercises.value = template.exercises.map((ex: any) => {
        const variants = parseVariants(ex.name);
        return {
            name: ex.name,
            variants: variants || undefined,
            selectedVariant: variants ? variants[0] : undefined,
            sets: Array(ex.sets)
                .fill(null)
                .map(() => ({ weight: null, reps: null })),
            note: "",
            showNote: false,
            targetReps: ex.targetReps,
        };
    });
}

async function loadLastWeekData() {
    lastWeekData.value = {};
    if (props.week <= 1) return;

    try {
        if (dayName.value === "REST DAY") return;
        const { data } = await secureFetch(`/api/gym/get?day=${dayName.value}`);
        const lastWeekWorkouts = data.filter(
            (row: any) => parseInt(row[0]) === props.week - 1,
        );

        if (lastWeekWorkouts.length > 0) {
            const template = effectiveTemplates.value[props.day];
            const dataMap: Record<number, { sets: string[]; name: string }> =
                {};

            template?.exercises.forEach((templateEx: any, idx: number) => {
                const variants = parseVariants(templateEx.name);
                let exerciseRow: any = null;

                if (variants) {
                    for (const v of variants) {
                        exerciseRow = lastWeekWorkouts.find(
                            (row: any) => row[4] === v,
                        );
                        if (exerciseRow) break;
                    }
                    if (!exerciseRow) {
                        exerciseRow = lastWeekWorkouts.find(
                            (row: any) => row[4] === templateEx.name,
                        );
                    }
                } else {
                    exerciseRow = lastWeekWorkouts.find(
                        (row: any) => row[4] === templateEx.name,
                    );
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
        const { data } = await secureFetch(`/api/gym/get?day=${dayName.value}`);
        const currentSessionRows = data.filter(
            (row: any) => parseInt(row[0]) === props.week,
        );

        if (currentSessionRows.length > 0) {
            const firstRow = currentSessionRows[0];
            if (firstRow[11]) sessionNote.value = firstRow[11];

            exercises.value.forEach((exercise) => {
                const variants = exercise.variants;
                let savedRow: any = null;

                if (variants) {
                    for (const v of variants) {
                        savedRow = currentSessionRows.find(
                            (row: any) => row[4] === v,
                        );
                        if (savedRow) break;
                    }
                    if (!savedRow) {
                        savedRow = currentSessionRows.find(
                            (row: any) => row[4] === exercise.name,
                        );
                    }
                } else {
                    savedRow = currentSessionRows.find(
                        (row: any) => row[4] === exercise.name,
                    );
                }

                if (savedRow) {
                    if (variants && variants.includes(savedRow[4])) {
                        exercise.selectedVariant = savedRow[4];
                    }
                    exercise.sets.forEach((set, idx) => {
                        const setString = savedRow[5 + idx];
                        if (setString && setString !== "-") {
                            const parts = setString.split("×");
                            if (parts.length === 2) {
                                set.weight =
                                    parseFloat(
                                        parts[0].replace("kg", "").trim(),
                                    ) || null;
                                set.reps = parseFloat(parts[1].trim()) || null;
                            }
                        }
                    });
                    if (savedRow[10]) exercise.note = savedRow[10];
                }
            });

            if (currentSessionRows[0][9] === "YES") completed.value = true;
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
            templateName: ex.name,
            sets: ex.sets,
            note: ex.note || "",
        }));

        await secureFetch("/api/gym/save", {
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
        const res = (await secureFetch("/api/program/get?mode=gym")) as {
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
        if (newVal === "step5") {
            setTimeout(() => openProgramEditor(), 100);
        }
    },
    { immediate: true },
);
</script>
